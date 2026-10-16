import { runBaseSeeder } from "../baseSeeder";
import Models from "../../models";
import { runCourseSeeder } from "./courseSeeder";
import { runSectionSeeder } from "./sectionSeeder";
import { runLessonSeeder } from "./lessonSeeder";
import { runCourseStaffSeeder } from "./courseStaffSeeder";
import { runOrderSeeder } from "./orderSeeder";
import { runEnrollmentSeeder } from "./enrollmentSeeder";
import { runProgressSeeder } from "./progressSeeder";
import { runQuizSeeder } from "./quizSeeder";
import { runReviewSeeder } from "./reviewSeeder";
import { runUserSeeder } from "./userSeeder";

// Runs the whole demo dataset in FK dependency order.
// Every step is idempotent — safe to re-run after partial failures or new tables.
export const runDemoSeeders = async (): Promise<void> => {
  const steps: [string, () => Promise<unknown>][] = [
    ["categories", runBaseSeeder],
    ["users", runUserSeeder],
    ["courses", runCourseSeeder],
    ["sections", runSectionSeeder],
    ["lessons", runLessonSeeder],
    ["course staff", runCourseStaffSeeder],
    ["orders", runOrderSeeder],
    ["enrollments", runEnrollmentSeeder],
    ["progress", runProgressSeeder],
    ["quizzes", runQuizSeeder],
    ["reviews", runReviewSeeder],
  ];

  for (const [label, step] of steps) {
    const result = await step();
    const created =
      typeof result === "number"
        ? result
        : result && typeof result === "object" && "created" in result
          ? (result as { created: number | Record<string, number> }).created
          : null;

    const detail =
      created === null
        ? "ok"
        : typeof created === "number"
          ? `+${created}`
          : Object.entries(created)
              .map(([key, value]) => `${key} +${value}`)
              .join(", ");
    console.log(`  ${label.padEnd(14)} ${detail}`);
  }

  // final state of the dataset, for eyeballing the numbers
  const [users, courses, sections, lessons, staff, orders, enrollments, progress, quizzes, questions, options, attempts, answers, reviews] =
    await Promise.all([
      Models.Users.count(),
      Models.Courses.count(),
      Models.Sections.count(),
      Models.Lessons.count(),
      Models.CourseStaff.count(),
      Models.Orders.count(),
      Models.Enrollments.count(),
      Models.Progress.count(),
      Models.Quizzes.count(),
      Models.QuizQuestions.count(),
      Models.QuizOptions.count(),
      Models.QuizAttempts.count(),
      Models.AttemptAnswers.count(),
      Models.Reviews.count(),
    ]);

  console.log("\nDataset totals:");
  console.log(`  users ${users} | courses ${courses} | sections ${sections} | lessons ${lessons} | staff ${staff}`);
  console.log(`  orders ${orders} | enrollments ${enrollments} | progress ${progress} | reviews ${reviews}`);
  console.log(
    `  quizzes ${quizzes} | questions ${questions} | options ${options} | attempts ${attempts} | answers ${answers}`
  );
};

if (require.main === module) {
  runDemoSeeders()
    .then(() => console.log("\nDemo seed complete."))
    .catch((error) => {
      console.error("\nDemo seeding failed:", error);
      process.exitCode = 1;
    });
}
