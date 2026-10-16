import { VideoProviderEnum } from "../../enums/videoProviderEnum";
import Models from "../../models";
import { SEED_COURSES, courseSlug } from "./courseSeeder";
import { SEED_CURRICULUM } from "./sectionSeeder";

const sectionIntro = (courseTitle: string, sectionTitle: string): string =>
  `In "${sectionTitle}" of ${courseTitle} you work through focused lessons with examples, then check your understanding with the section quiz.`;

export const runLessonSeeder = async (): Promise<{ created: number }> => {
  let created = 0;

  for (const course of SEED_COURSES) {
    const courseRow = await Models.Courses.findOne({ where: { slug: courseSlug(course.key) }, attributes: ["id"] });
    if (!courseRow) throw new Error(`Seed course not found: ${course.key} — run courseSeeder first`);

    const outline = SEED_CURRICULUM[course.key] ?? [];

    for (const [sectionIndex, section] of outline.entries()) {
      const sectionRow = await Models.Sections.findOne({
        where: { courseId: courseRow.id, title: section.title },
        attributes: ["id"],
      });
      if (!sectionRow) throw new Error(`Seed section not found: ${section.title} — run sectionSeeder first`);

      for (const [lessonIndex, lessonTitle] of section.lessons.entries()) {
        const existing = await Models.Lessons.findOne({
          where: { sectionId: sectionRow.id, title: lessonTitle },
          attributes: ["id"],
        });
        if (existing) continue;

        // first lesson of the whole course doubles as the public preview,
        // everything else carries a video reference (provider/ref travel together)
        const isPreview = sectionIndex === 0 && lessonIndex === 0;

        await Models.Lessons.create({
          sectionId: sectionRow.id,
          title: lessonTitle,
          videoProvider: VideoProviderEnum.youtube,
          videoRef: `yt_${course.key}_${sectionIndex + 1}_${lessonIndex + 1}`,
          content: lessonIndex === 0 ? sectionIntro(course.title, section.title) : null,
          isPreview,
          orderIndex: lessonIndex,
        });
        created += 1;
      }
    }
  }

  return { created };
};

if (require.main === module) {
  runLessonSeeder()
    .then(({ created }) => console.log(`Lessons: ${created} created`))
    .catch((error) => {
      console.error("Lesson seeding failed:", error);
      process.exitCode = 1;
    });
}
