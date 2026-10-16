import Models from "../../models";
import { SEED_COURSES, courseSlug } from "./courseSeeder";
import { emailOf } from "./userSeeder";

// Percentage of the course completed per student. Rows are filled from the
// start of the course forward, so 82% of 16 lessons = first 13 lessons done.
const PROGRESS: { user: string; course: string; percent: number }[] = [
  { user: "alex", course: "webdev", percent: 82 },
  { user: "olivia", course: "webdev", percent: 45 },
  { user: "noah", course: "webdev", percent: 18 },
  { user: "ava", course: "webdev", percent: 60 },
  { user: "emma", course: "python", percent: 76 },
  { user: "lucas", course: "python", percent: 25 },
  { user: "isabella", course: "python", percent: 50 },
  { user: "liam", course: "postgres", percent: 100 },
  { user: "ethan", course: "postgres", percent: 75 },
  { user: "mia", course: "uiux", percent: 34 },
];

// Lessons of a course in curriculum order (sections by orderIndex, then lessons)
const lessonsOfCourse = async (courseId: number): Promise<number[]> => {
  const sections = await Models.Sections.findAll({
    where: { courseId },
    order: [["orderIndex", "ASC"]],
    attributes: ["id"],
  });

  const lessons: number[] = [];
  for (const section of sections) {
    const sectionLessons = await Models.Lessons.findAll({
      where: { sectionId: section.id },
      order: [["orderIndex", "ASC"]],
      attributes: ["id"],
    });
    for (const lesson of sectionLessons) lessons.push(lesson.id);
  }
  return lessons;
};

export const runProgressSeeder = async (): Promise<{ created: number }> => {
  const users = await Models.Users.findAll({ attributes: ["id", "email"] });
  const idByEmail = new Map(users.map((u) => [u.email, u.id]));

  let created = 0;

  for (const entry of PROGRESS) {
    const userId = idByEmail.get(emailOf(entry.user));
    if (!userId) throw new Error(`Seed user not found: ${entry.user} — run userSeeder first`);

    const courseRow = await Models.Courses.findOne({
      where: { slug: courseSlug(entry.course) },
      attributes: ["id"],
    });
    if (!courseRow) throw new Error(`Seed course not found: ${entry.course} — run courseSeeder first`);

    const enrolled = await Models.Enrollments.findOne({
      where: { userId, courseId: courseRow.id },
      attributes: ["id"],
    });
    if (!enrolled) {
      throw new Error(`No enrollment for ${entry.user} / ${entry.course} — run enrollmentSeeder first`);
    }

    const lessons = await lessonsOfCourse(courseRow.id);
    if (lessons.length === 0) throw new Error(`Course ${entry.course} has no lessons — run lessonSeeder first`);

    const targetCount = Math.round((entry.percent / 100) * lessons.length);
    const targetLessons = lessons.slice(0, targetCount);

    for (const lessonId of targetLessons) {
      const existing = await Models.Progress.findOne({ where: { userId, lessonId }, attributes: ["id"] });
      if (existing) continue;

      await Models.Progress.create({ userId, lessonId });
      created += 1;
    }
  }

  return { created };
};

if (require.main === module) {
  runProgressSeeder()
    .then(({ created }) => console.log(`Progress rows: ${created} created`))
    .catch((error) => {
      console.error("Progress seeding failed:", error);
      process.exitCode = 1;
    });
}
