import Models from "../../models";
import { SEED_COURSES, courseSlug } from "./courseSeeder";
import { SEED_CURRICULUM } from "./sectionSeeder";
import { emailOf } from "./userSeeder";

// [question, [A, B, C, D], index of correct option]
type SeedQuestion = [string, [string, string, string, string], number];

interface SeedQuiz {
  key: string;
  course: string;
  section: string;
  lesson: string;
  title: string;
  passScore: number;
  questions: SeedQuestion[];
}

export const SEED_QUIZZES: SeedQuiz[] = [
  {
    key: "html",
    course: "webdev",
    section: "HTML Fundamentals",
    lesson: "Introduction to HTML",
    title: "HTML Fundamentals Quiz",
    passScore: 50,
    questions: [
      ["What does HTML stand for?", ["Hyper Text Markup Language", "High Text Machine Language", "Hyperlink Text Management Language", "Home Tool Markup Language"], 0],
      ["Which element is used for the largest heading?", ["<heading>", "<h6>", "<h1>", "<head>"], 2],
      ["Which element creates a hyperlink?", ["<link>", "<a>", "<href>", "<url>"], 1],
      ["Which attribute specifies an image's alternative text?", ["title", "src", "alt", "description"], 2],
      ["Which HTML element is used to create a numbered list?", ["<ul>", "<list>", "<ol>", "<li>"], 2],
    ],
  },
  {
    key: "css",
    course: "webdev",
    section: "CSS Fundamentals",
    lesson: "CSS Selectors",
    title: "CSS Fundamentals Quiz",
    passScore: 50,
    questions: [
      ["What does CSS stand for?", ["Cascading Style Sheets", "Creative Style Sheets", "Computer Style Sheets", "Colorful Styling System"], 0],
      ["Which property sets the text color?", ["font-color", "text-color", "color", "foreground"], 2],
      ["Which flex property aligns items on the cross axis?", ["justify-content", "align-items", "flex-direction", "align-self"], 1],
      ["In the box model, which space sits inside the border around the content?", ["margin", "padding", "outline", "gap"], 1],
      ["Which unit is relative to the root element's font size?", ["px", "em", "rem", "%"], 2],
    ],
  },
  {
    key: "jsbasics",
    course: "webdev",
    section: "JavaScript",
    lesson: "Variables and Data Types",
    title: "JavaScript Basics Quiz",
    passScore: 50,
    questions: [
      ["Which keyword declares a block-scoped variable?", ["var", "let", "define", "static"], 1],
      ['What is the result of typeof "42"?', ['"string"', '"number"', '"char"', '"object"'], 0],
      ["Which method converts JSON text into an object?", ["JSON.parse", "JSON.stringify", "JSON.convert", "JSON.toJSON"], 0],
      ["What does Array.prototype.map return?", ["A new transformed array", "The same array mutated", "undefined", "A boolean"], 0],
      ["What is a closure?", ["A function with access to its outer scope", "A loop construct", "A database transaction", "An error type"], 0],
    ],
  },
  {
    key: "pyfunc",
    course: "python",
    section: "Python Fundamentals",
    lesson: "Installing Python",
    title: "Python Fundamentals Quiz",
    passScore: 50,
    questions: [
      ["Which symbol starts a comment in Python?", ["#", "//", "/*", "--"], 0],
      ["What is the result of 7 // 2?", ["3.5", "3", "4", "2.5"], 1],
      ["Which built-in type is ordered and immutable?", ["list", "dict", "tuple", "set"], 2],
      ["How do you define a function in Python?", ["def name():", "function name() {}", "func name()", "fn name()"], 0],
      ['What does len("hello") return?', ["4", "5", "6", '"hello"'], 1],
    ],
  },
  {
    key: "pandas",
    course: "python",
    section: "NumPy and Pandas",
    lesson: "NumPy Basics",
    title: "Pandas and NumPy Quiz",
    passScore: 50,
    questions: [
      ["Which NumPy function creates an array of zeros?", ["np.zeros", "np.blank", "np.nothing", "np.emptyRow"], 0],
      ["In pandas, what is a Series?", ["A 1D labeled array", "A 2D array only", "A database table", "A plot type"], 0],
      ["Which method reads a CSV file into a DataFrame?", ["pd.read_csv", "pd.load_csv", "pd.import_csv", "df.from_csv"], 0],
      ["What does df.shape return?", ["Row and column counts", "Column names", "Data types", "Column sums"], 0],
      ["Which method replaces missing values with a given value?", ["fillna", "merge", "join", "pivot"], 0],
    ],
  },
  {
    key: "sql",
    course: "postgres",
    section: "SQL Fundamentals",
    lesson: "SELECT and FROM",
    title: "SQL Fundamentals Quiz",
    passScore: 70,
    questions: [
      ["Which SQL command retrieves data from a table?", ["GET", "SELECT", "FETCHDATA", "READ"], 1],
      ["Which constraint uniquely identifies each row?", ["FOREIGN KEY", "UNIQUE", "PRIMARY KEY", "CHECK"], 2],
      ["Which SQL clause filters rows?", ["WHERE", "FILTER", "HAVING", "LIMIT"], 0],
      ["Which JOIN returns only matching rows from both tables?", ["LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "FULL JOIN"], 2],
      ["What is an index primarily used for?", ["Increasing database size", "Improving query performance", "Encrypting data", "Creating tables"], 1],
    ],
  },
  {
    key: "advqueries",
    course: "postgres",
    section: "Advanced Queries",
    lesson: "Subqueries",
    title: "PostgreSQL Advanced Queries Quiz",
    passScore: 50,
    questions: [
      ["What does CTE stand for?", ["Common Table Expression", "Computed Table Element", "Central Transaction Entry", "Cross Table Evaluation"], 0],
      ["Which window function assigns a unique sequential number to rows?", ["ROW_NUMBER()", "SUM()", "AVG()", "COUNT()"], 0],
      ["What does EXPLAIN show for a query?", ["The execution plan", "The table schema", "User privileges", "Replication status"], 0],
      ["Which operator works with a subquery returning multiple rows?", ["IN", "=", "LIKE", "IS"], 0],
      ["What does a LEFT JOIN return?", ["All left rows plus matches from the right", "Only matching rows", "All right rows only", "A cartesian product"], 0],
    ],
  },
  {
    key: "ux",
    course: "uiux",
    section: "UX Principles",
    lesson: "What is UX?",
    title: "UX Principles Quiz",
    passScore: 70,
    questions: [
      ["What does UX stand for?", ["User Experience", "User Exchange", "User Efficiency", "Unified Xperience"], 0],
      ["Whose usability heuristics include \"visibility of system status\"?", ["Jakob Nielsen", "Alan Turing", "Tim Berners-Lee", "Grace Hopper"], 0],
      ["A persona represents:", ["A realistic profile of a target user", "A color palette", "A wireframe file", "A testing metric"], 0],
      ["Observing real users attempting real tasks is called:", ["Usability testing", "Card sorting", "Affinity mapping", "Competitive analysis"], 0],
      ["What is the purpose of information architecture?", ["Organizing content so users find things", "Choosing fonts", "Writing marketing copy", "Animating buttons"], 0],
    ],
  },
  {
    key: "visual",
    course: "uiux",
    section: "Visual Design",
    lesson: "Visual Hierarchy",
    title: "Visual Design Quiz",
    passScore: 50,
    questions: [
      ["What guides the eye through a layout in order of importance?", ["Visual hierarchy", "Box model", "Z-index", "Grid gap"], 0],
      ["Serif typefaces are characterized by:", ["Small strokes at the ends of glyphs", "No strokes at all", "Uppercase letters only", "Fixed character width"], 0],
      ["Complementary colors sit where on the color wheel?", ["Directly opposite each other", "Right next to each other", "Exactly 45 degrees apart", "They share the same hue"], 0],
      ["A design system mainly provides:", ["Reusable components and guidelines", "Server hosting", "Database schemas", "Marketing copy"], 0],
      ["Whitespace is used to:", ["Improve readability and grouping", "Reduce page weight", "Encode color", "Speed up JavaScript"], 0],
    ],
  },
];

// Attempts: first N questions answered correctly, the rest with a wrong option,
// which makes the stored score derive honestly from the recorded answers.
// sql and ux use passScore 70, so 3/5 (60) records as FAILED.
const SEED_ATTEMPTS: { user: string; quiz: string; correct: number }[] = [
  { user: "alex", quiz: "html", correct: 5 },
  { user: "olivia", quiz: "html", correct: 4 },
  { user: "noah", quiz: "html", correct: 2 },
  { user: "noah", quiz: "html", correct: 4 }, // second attempt: failed then passed
  { user: "emma", quiz: "sql", correct: 5 },
  { user: "liam", quiz: "sql", correct: 3 },
  { user: "ava", quiz: "css", correct: 4 },
  { user: "ethan", quiz: "jsbasics", correct: 5 },
  { user: "mia", quiz: "ux", correct: 3 },
  { user: "lucas", quiz: "pyfunc", correct: 4 },
  { user: "isabella", quiz: "pandas", correct: 5 },
  { user: "alex", quiz: "css", correct: 5 },
  { user: "olivia", quiz: "jsbasics", correct: 2 },
  { user: "emma", quiz: "advqueries", correct: 4 },
  { user: "mia", quiz: "visual", correct: 4 },
];

export const runQuizSeeder = async (): Promise<{ created: Record<string, number> }> => {
  const users = await Models.Users.findAll({ attributes: ["id", "email"] });
  const idByEmail = new Map(users.map((u) => [u.email, u.id]));

  const created = { quizzes: 0, questions: 0, options: 0, attempts: 0, answers: 0 };

  // quizKey -> resolved ids + correct-answer positions for answer generation
  const quizState = new Map<
    string,
    { quizId: number; passScore: number; questionIds: number[]; optionIds: number[][]; correctPositions: number[] }
  >();

  for (const seed of SEED_QUIZZES) {
    const courseRow = await Models.Courses.findOne({
      where: { slug: courseSlug(seed.course) },
      attributes: ["id"],
    });
    if (!courseRow) throw new Error(`Seed course not found: ${seed.course} — run courseSeeder first`);

    const outline = SEED_CURRICULUM[seed.course] ?? [];
    const sectionIndex = outline.findIndex((s) => s.title === seed.section);
    if (sectionIndex === -1) throw new Error(`Seed section not found: ${seed.section}`);

    const sectionRow = await Models.Sections.findOne({
      where: { courseId: courseRow.id, title: seed.section },
      attributes: ["id"],
    });
    if (!sectionRow) throw new Error(`Seed section not found: ${seed.section} — run sectionSeeder first`);

    const lessonRow = await Models.Lessons.findOne({
      where: { sectionId: sectionRow.id, title: seed.lesson },
      attributes: ["id"],
    });
    if (!lessonRow) throw new Error(`Seed lesson not found: ${seed.lesson} — run lessonSeeder first`);

    // one quiz per lesson (DB unique) — find or create
    let quizRow = await Models.Quizzes.findOne({ where: { lessonId: lessonRow.id } });
    if (!quizRow) {
      quizRow = await Models.Quizzes.create({
        lessonId: lessonRow.id,
        title: seed.title,
        passScore: seed.passScore,
      });
      created.quizzes += 1;
    }

    const state = {
      quizId: quizRow.id,
      passScore: quizRow.passScore,
      questionIds: [] as number[],
      optionIds: [] as number[][],
      correctPositions: [] as number[],
    };

    for (const [index, question] of seed.questions.entries()) {
      const [text, options, correctIndex] = question;

      let questionRow = await Models.QuizQuestions.findOne({
        where: { quizId: quizRow.id, orderIndex: index },
      });

      if (!questionRow) {
        questionRow = await Models.QuizQuestions.create({
          quizId: quizRow.id,
          questionText: text,
          orderIndex: index,
        });
        created.questions += 1;
      }

      let optionRows = await Models.QuizOptions.findAll({
        where: { questionId: questionRow.id },
        order: [["id", "ASC"]],
      });

      // only build options when this question was just created (or lost them)
      if (optionRows.length === 0) {
        for (const [optIndex, optionText] of options.entries()) {
          await Models.QuizOptions.create({
            questionId: questionRow.id,
            optionText,
            isCorrect: optIndex === correctIndex,
          });
          created.options += 1;
        }
        optionRows = await Models.QuizOptions.findAll({
          where: { questionId: questionRow.id },
          order: [["id", "ASC"]],
        });
      }

      state.questionIds.push(questionRow.id);
      // optionRows are inserted in array order, so position = seed position
      state.optionIds.push(optionRows.map((o) => o.id));
      state.correctPositions.push(correctIndex);
    }

    quizState.set(seed.key, state);
  }

  // ---- attempts + answers (idempotent per intended attempt slot) ----
  const seenPerPair = new Map<string, number>();

  for (const seed of SEED_ATTEMPTS) {
    const pairKey = `${seed.user}:${seed.quiz}`;
    const slot = seenPerPair.get(pairKey) ?? 0;
    seenPerPair.set(pairKey, slot + 1);

    const state = quizState.get(seed.quiz);
    if (!state) throw new Error(`Unknown seed quiz: ${seed.quiz}`);

    const userId = idByEmail.get(emailOf(seed.user));
    if (!userId) throw new Error(`Seed user not found: ${seed.user} — run userSeeder first`);

    const courseOfQuiz = SEED_QUIZZES.find((q) => q.key === seed.quiz)?.course;
    const courseRow = await Models.Courses.findOne({
      where: { slug: courseSlug(courseOfQuiz ?? "") },
      attributes: ["id"],
    });
    const enrolled = courseRow
      ? await Models.Enrollments.findOne({ where: { userId, courseId: courseRow.id }, attributes: ["id"] })
      : null;
    if (!enrolled) {
      throw new Error(`Attempt needs enrollment: ${seed.user} / ${courseOfQuiz} — run enrollmentSeeder first`);
    }

    const existing = await Models.QuizAttempts.findAll({
      where: { quizId: state.quizId, userId },
      order: [["id", "ASC"]],
    });

    // slot already materialized by an earlier run — don't double-insert
    if (existing.length > slot) continue;

    const score = Math.round((seed.correct / state.questionIds.length) * 100);
    const passed = score >= state.passScore;

    const attempt = await Models.QuizAttempts.create({
      quizId: state.quizId,
      userId,
      score,
      passed,
    });
    created.attempts += 1;

    for (const [qIndex, questionId] of state.questionIds.entries()) {
      const optionIds = state.optionIds[qIndex];
      const isRight = qIndex < seed.correct;
      // correct option sits at its seed position; a wrong pick takes the next one
      const correctPosition = state.correctPositions[qIndex];
      const chosenPosition = isRight ? correctPosition : (correctPosition + 1) % 4;

      await Models.AttemptAnswers.create({
        attemptId: attempt.id,
        questionId,
        optionId: optionIds[chosenPosition],
      });
      created.answers += 1;
    }
  }

  return { created };
};

if (require.main === module) {
  runQuizSeeder()
    .then(({ created }) => console.log(`Quiz seeding:`, created))
    .catch((error) => {
      console.error("Quiz seeding failed:", error);
      process.exitCode = 1;
    });
}
