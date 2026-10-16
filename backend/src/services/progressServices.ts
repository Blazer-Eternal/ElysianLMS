import { LessonRepository, ProgressRepository, QuizAttemptRepository } from "../repositories";
import { CourseRepository, QuizRepository, SectionRepository } from "../repositories";
import { JwtPayload } from "../interfaces";
import { AppError } from "../utils";
import { assertEnrolled } from "./accessControl";

export class ProgressServices {
  private progressRepository = new ProgressRepository();
  private lessonRepository = new LessonRepository();
  private sectionRepository = new SectionRepository();
  private courseRepository = new CourseRepository();
  private quizRepository = new QuizRepository();
  private quizAttemptRepository = new QuizAttemptRepository();

  private async resolveCourseOfLesson(lessonId: number) {
    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) throw new AppError(404, "Lesson not found");

    const section = await this.sectionRepository.findById(lesson.sectionId);
    if (!section) throw new AppError(404, "Section not found");

    const course = await this.courseRepository.findById(section.courseId);
    if (!course) throw new AppError(404, "Course not found");

    return { lesson, course };
  }

  // Enrolled student: idempotent "mark as complete". Repeated calls are a no-op
  // (the unique (user_id, lesson_id) is the source of truth, not the check).
  public async markLessonComplete(user: JwtPayload, lessonId: number) {
    const { lesson, course } = await this.resolveCourseOfLesson(lessonId);
    await assertEnrolled(user.userId, course.id);

    const existing = await this.progressRepository.findByUserAndLesson(user.userId, lesson.id);
    if (existing) return { alreadyCompleted: true, completedAt: existing.completedAt };

    const progress = await this.progressRepository.create({ userId: user.userId, lessonId: lesson.id });
    return { alreadyCompleted: false, completedAt: progress.completedAt };
  }

  // Enrolled student: un-check (kept separate from complete so both stay honest)
  public async markLessonIncomplete(user: JwtPayload, lessonId: number): Promise<void> {
    const { lesson, course } = await this.resolveCourseOfLesson(lessonId);
    await assertEnrolled(user.userId, course.id);

    await this.progressRepository.delete(user.userId, lesson.id);
  }

  // Enrolled student: per-lesson state for the whole course, plus quiz best scores
  public async getCourseProgress(user: JwtPayload, courseId: number) {
    const course = await this.courseRepository.findById(courseId);
    if (!course) throw new AppError(404, "Course not found");
    await assertEnrolled(user.userId, courseId);

    const sections = await this.sectionRepository.findAllByCourse(courseId);
    const lessonsBySection = await Promise.all(
      sections.map(async (s) => ({ section: s, lessons: await this.lessonRepository.findAllBySection(s.id) }))
    );

    const allLessons = lessonsBySection.flatMap((s) => s.lessons);
    const completedIds = new Set(
      await this.progressRepository.findCompletedLessonIds(user.userId, allLessons.map((l) => l.id))
    );

    // quiz best scores ride along so the frontend renders one progress page
    const quizzes = await Promise.all(
      allLessons.map((l) => this.quizRepository.findByLessonId(l.id).then((q) => (q ? { lessonId: l.id, quiz: q } : null)))
    );
    const bestScores = await Promise.all(
      quizzes
        .filter((q): q is { lessonId: number; quiz: NonNullable<typeof q>["quiz"] } => q !== null)
        .map(async ({ lessonId, quiz }) => ({
          lessonId,
          quizId: quiz.id,
          bestScore: await this.quizAttemptRepository.findBestScore(quiz.id, user.userId),
        }))
    );

    const completedCount = allLessons.filter((l) => completedIds.has(l.id)).length;

    return {
      totalLessons: allLessons.length,
      completedLessons: completedCount,
      percent: allLessons.length === 0 ? 0 : Math.round((completedCount / allLessons.length) * 100),
      sections: lessonsBySection.map(({ section, lessons }) => ({
        section: { id: section.id, title: section.title, orderIndex: section.orderIndex },
        lessons: lessons.map((l) => ({
          id: l.id,
          title: l.title,
          orderIndex: l.orderIndex,
          isPreview: l.isPreview,
          completed: completedIds.has(l.id),
        })),
      })),
      quizzes: bestScores,
    };
  }
}
