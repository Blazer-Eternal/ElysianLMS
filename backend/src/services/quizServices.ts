import { Database } from "../config";
import {
  AttemptAnswerInterface,
  InputQuizOptionInterface,
  JwtPayload,
  QuizAttemptInterface,
  QuizInterface,
  QuizOptionInterface,
  QuizQuestionInterface,
} from "../interfaces";
import {
  AttemptAnswerRepository,
  CourseRepository,
  LessonRepository,
  QuizAttemptRepository,
  QuizOptionRepository,
  QuizQuestionRepository,
  QuizRepository,
  SectionRepository,
} from "../repositories";
import { AppError, plain } from "../utils";
import { assertCanManageCourse, assertEnrolled } from "./accessControl";

export interface QuestionWithOptions {
  id: number;
  quizId: number;
  questionText: string;
  orderIndex: number;
  options: { id: number; optionText: string }[]; // is_correct never leaves for students
}

export interface QuestionWithOptionsForStaff extends QuestionWithOptions {
  options: { id: number; optionText: string; isCorrect: boolean }[];
}

export class QuizServices {
  private quizRepository = new QuizRepository();
  private questionRepository = new QuizQuestionRepository();
  private optionRepository = new QuizOptionRepository();
  private attemptRepository = new QuizAttemptRepository();
  private answerRepository = new AttemptAnswerRepository();
  private lessonRepository = new LessonRepository();
  private sectionRepository = new SectionRepository();
  private courseRepository = new CourseRepository();

  // lesson -> section -> course, the spine of every permission check here
  private async resolveQuizOrFail(quizId: number) {
    const quiz = await this.quizRepository.findById(quizId);
    if (!quiz) throw new AppError(404, "Quiz not found");

    const lesson = await this.lessonRepository.findById(quiz.lessonId);
    if (!lesson) throw new AppError(404, "Lesson not found");

    const section = await this.sectionRepository.findById(lesson.sectionId);
    if (!section) throw new AppError(404, "Section not found");

    const course = await this.courseRepository.findById(section.courseId);
    if (!course) throw new AppError(404, "Course not found");

    return { quiz, lesson, section, course };
  }

  private async assertQuizStaff(user: JwtPayload, quizId: number) {
    const resolved = await this.resolveQuizOrFail(quizId);
    await assertCanManageCourse(user, resolved.course);
    return resolved;
  }

  private async loadQuestionsForStaff(quizId: number): Promise<QuestionWithOptionsForStaff[]> {
    const questions = await this.questionRepository.findAllByQuiz(quizId);
    return Promise.all(
      questions.map(async (q) => ({
        id: q.id,
        quizId: q.quizId,
        questionText: q.questionText,
        orderIndex: q.orderIndex,
        options: (await this.optionRepository.findAllByQuestion(q.id)).map((o) => ({
          id: o.id,
          optionText: o.optionText,
          isCorrect: o.isCorrect,
        })),
      }))
    );
  }

  private async loadQuestionsForStudent(quizId: number): Promise<QuestionWithOptions[]> {
    const questions = await this.questionRepository.findAllByQuiz(quizId);
    return Promise.all(
      questions.map(async (q) => ({
        id: q.id,
        quizId: q.quizId,
        questionText: q.questionText,
        orderIndex: q.orderIndex,
        options: (await this.optionRepository.findAllByQuestion(q.id)).map((o) => ({
          id: o.id,
          optionText: o.optionText,
        })),
      }))
    );
  }

  // ------------------------------------------------------------------
  // Authoring (course staff)
  // ------------------------------------------------------------------

  // One quiz per lesson. Creating twice updates in place: an LMS lesson
  // has exactly one checkpoint quiz.
  public async createQuiz(
    user: JwtPayload,
    lessonId: number,
    data: { title: string; passScore?: number }
  ): Promise<QuizInterface> {
    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) throw new AppError(404, "Lesson not found");

    const section = await this.sectionRepository.findById(lesson.sectionId);
    if (!section) throw new AppError(404, "Section not found");

    const course = await this.courseRepository.findById(section.courseId);
    if (!course) throw new AppError(404, "Course not found");
    await assertCanManageCourse(user, course);

    const existing = await this.quizRepository.findByLessonId(lessonId);
    if (existing) {
      await this.quizRepository.update(existing.id, { title: data.title, passScore: data.passScore });
      return (await this.quizRepository.findById(existing.id))!;
    }

    return this.quizRepository.create({ lessonId, title: data.title, passScore: data.passScore });
  }

  public async updateQuiz(user: JwtPayload, quizId: number, data: { title?: string; passScore?: number }): Promise<void> {
    await this.assertQuizStaff(user, quizId);
    await this.quizRepository.update(quizId, data);
  }

  public async deleteQuiz(user: JwtPayload, quizId: number): Promise<void> {
    await this.assertQuizStaff(user, quizId);
    await this.quizRepository.delete(quizId);
  }

  // Staff view: questions WITH the correct answers
  public async getQuizForStaff(user: JwtPayload, quizId: number) {
    const { quiz } = await this.assertQuizStaff(user, quizId);
    return { quiz, questions: await this.loadQuestionsForStaff(quizId) };
  }

  // orderIndex omitted -> appended. Options come in one call so a question
  // is never half-built.
  public async addQuestion(
    user: JwtPayload,
    quizId: number,
    data: { questionText: string; orderIndex?: number; options: Omit<InputQuizOptionInterface, "questionId">[] }
  ): Promise<QuizQuestionInterface> {
    await this.assertQuizStaff(user, quizId);

    const orderIndex = data.orderIndex ?? (await this.questionRepository.findNextIndex(quizId));

    const question = await Database.sequelize.transaction(async (t) => {
      const q = await this.questionRepository.create({ quizId, questionText: data.questionText, orderIndex }, t);
      for (const option of data.options) {
        await this.optionRepository.create(
          { questionId: q.id, optionText: option.optionText, isCorrect: option.isCorrect ?? false },
          t
        );
      }
      return q;
    });

    return question;
  }

  // Replaces the text/options atomically. Callers must send the full option
  // list — partial edits of a question's options would desync grading.
  public async replaceQuestionOptions(
    user: JwtPayload,
    questionId: number,
    data: { questionText?: string; options?: Omit<InputQuizOptionInterface, "questionId">[] }
  ): Promise<void> {
    const question = await this.questionRepository.findById(questionId);
    if (!question) throw new AppError(404, "Question not found");
    await this.assertQuizStaff(user, question.quizId);

    await Database.sequelize.transaction(async (t) => {
      if (data.questionText !== undefined) {
        await this.questionRepository.update(questionId, { questionText: data.questionText }, t);
      }
      if (data.options !== undefined) {
        // destroying options an attempt already referenced is handled by the
        // DB: ON DELETE SET NULL (option_id) keeps the answer row honest
        await this.optionRepository.deleteByQuestion(questionId, t);
        for (const option of data.options) {
          await this.optionRepository.create(
            { questionId, optionText: option.optionText, isCorrect: option.isCorrect ?? false },
            t
          );
        }
      }
    });
  }

  public async deleteQuestion(user: JwtPayload, questionId: number): Promise<void> {
    const question = await this.questionRepository.findById(questionId);
    if (!question) throw new AppError(404, "Question not found");
    await this.assertQuizStaff(user, question.quizId);

    await this.questionRepository.delete(questionId);
  }

  // Staff: the full picture — every attempt across all students
  public async getQuizAttempts(user: JwtPayload, quizId: number) {
    await this.assertQuizStaff(user, quizId);
    const attempts = await this.attemptRepository.findAllByQuiz(quizId);
    return Promise.all(
      attempts.map(async (a) => ({
        ...plain(a),
        answers: (await this.answerRepository.findAllByAttempt(a.id)).map((ans) => plain(ans)),
      }))
    );
  }

  // ------------------------------------------------------------------
  // Taking (students)
  // ------------------------------------------------------------------

  // Enrolled student: questions with options but no correctness flag.
  // The answers to grade against never leave the server before submission.
  public async getQuizForStudent(user: JwtPayload, quizId: number) {
    const { quiz, course } = await this.resolveQuizOrFail(quizId);
    await assertEnrolled(user.userId, course.id);

    const [questions, previousAttempts, bestScore] = await Promise.all([
      this.loadQuestionsForStudent(quizId),
      this.attemptRepository.findAllByQuizForUser(quizId, user.userId),
      this.attemptRepository.findBestScore(quizId, user.userId),
    ]);

    return { quiz, questions, previousAttempts, bestScore };
  }

  // Enrolled student: one submission, graded here. The client sends only
  // (questionId, optionId) pairs — the score is computed exclusively from
  // the stored is_correct flags, so a tampered client cannot inflate it.
  public async submitAttempt(
    user: JwtPayload,
    quizId: number,
    answers: { questionId: number; optionId: number | null }[]
  ): Promise<{ attempt: QuizAttemptInterface; answers: AttemptAnswerInterface[] }> {
    const { quiz, course } = await this.resolveQuizOrFail(quizId);
    await assertEnrolled(user.userId, course.id);

    const questions = await this.questionRepository.findAllByQuiz(quizId);
    if (questions.length === 0) throw new AppError(400, "This quiz has no questions yet");

    const questionIds = new Set(questions.map((q) => q.id));
    const submittedIds = new Set(answers.map((a) => a.questionId));

    if (submittedIds.size !== answers.length) {
      throw new AppError(400, "Duplicate question ids in submission");
    }
    for (const id of submittedIds) {
      if (!questionIds.has(id)) throw new AppError(400, "Submission contains a question from another quiz");
    }

    // load every option of the quiz once; grading is pure in-memory work
    const allOptions: QuizOptionInterface[] = (
      await Promise.all(questions.map((q) => this.optionRepository.findAllByQuestion(q.id)))
    ).flat();

    const optionById = new Map(allOptions.map((o) => [o.id, o]));
    const correctByQuestion = new Map(questions.map((q) => [q.id, allOptions.find((o) => o.questionId === q.id && o.isCorrect)?.id ?? null]));

    let correct = 0;
    for (const answer of answers) {
      const option = answer.optionId === null ? undefined : optionById.get(answer.optionId);
      // reject answers pointing at another question's option outright
      if (answer.optionId !== null && (!option || option.questionId !== answer.questionId)) {
        throw new AppError(400, `Option ${answer.optionId} does not belong to question ${answer.questionId}`);
      }
      if (correctByQuestion.get(answer.questionId) !== null && option?.isCorrect) correct += 1;
    }

    const score = Math.round((correct / questions.length) * 100);
    const passed = score >= quiz.passScore;

    const attempt = await Database.sequelize.transaction(async (t) => {
      const created = await this.attemptRepository.create({ quizId, userId: user.userId, score, passed }, t);
      await this.answerRepository.bulkCreate(
        answers.map((a) => ({ attemptId: created.id, questionId: a.questionId, optionId: a.optionId })),
        t
      );
      return created;
    });

    return { attempt, answers: await this.answerRepository.findAllByAttempt(attempt.id) };
  }

  // Enrolled student: their own attempt history
  public async getMyAttempts(user: JwtPayload, quizId: number): Promise<QuizAttemptInterface[]> {
    await this.resolveQuizOrFail(quizId);
    return this.attemptRepository.findAllByQuizForUser(quizId, user.userId);
  }
}
