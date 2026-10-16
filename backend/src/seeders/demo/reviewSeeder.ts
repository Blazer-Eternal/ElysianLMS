import Models from "../../models";
import { SEED_COURSES, courseSlug } from "./courseSeeder";
import { emailOf } from "./userSeeder";

// Mixed ratings so averages on the dashboard are not a wall of 5.0.
// Every reviewer here is enrolled in the course (service rule mirrored).
const SEED_REVIEWS: { user: string; course: string; rating: number; comment: string }[] = [
  { user: "alex", course: "webdev", rating: 4, comment: "Very useful course. Some advanced topics could use more examples." },
  { user: "olivia", course: "webdev", rating: 5, comment: "The lessons are well organized and easy to follow." },
  { user: "noah", course: "webdev", rating: 3, comment: "Good introduction, but I expected more practical exercises." },
  { user: "ava", course: "webdev", rating: 5, comment: "Exactly what I needed to go from zero to building full-stack apps." },
  { user: "emma", course: "python", rating: 5, comment: "The pandas section alone was worth the price." },
  { user: "isabella", course: "python", rating: 5, comment: "Well paced from basics to real analysis — I finished wanting more." },
  { user: "lucas", course: "python", rating: 4, comment: "Very useful course. Some advanced topics could use more examples." },
  { user: "liam", course: "python", rating: 4, comment: "Solid pace. More datasets to practice with would make it perfect." },
  { user: "mia", course: "python", rating: 3, comment: "Good introduction, but I expected more practical exercises." },
  { user: "ethan", course: "postgres", rating: 5, comment: "The lessons are well organized and easy to follow." },
  { user: "ava", course: "postgres", rating: 4, comment: "Very useful course. Some advanced topics could use more examples." },
  { user: "emma", course: "uiux", rating: 5, comment: "Clear explanations and the wireframing projects are genuinely useful." },
  { user: "mia", course: "uiux", rating: 4, comment: "Loved the visual design section — typography finally clicked for me." },
  { user: "ethan", course: "js", rating: 4, comment: "Very useful course. Some advanced topics could use more examples." },
  { user: "olivia", course: "js", rating: 3, comment: "Good introduction, but I expected more practical exercises." },
];

export const runReviewSeeder = async (): Promise<{ created: number }> => {
  const users = await Models.Users.findAll({ attributes: ["id", "email"] });
  const idByEmail = new Map(users.map((u) => [u.email, u.id]));

  let created = 0;

  for (const seed of SEED_REVIEWS) {
    const userId = idByEmail.get(emailOf(seed.user));
    if (!userId) throw new Error(`Seed user not found: ${seed.user} — run userSeeder first`);

    const courseRow = await Models.Courses.findOne({
      where: { slug: courseSlug(seed.course) },
      attributes: ["id"],
    });
    if (!courseRow) throw new Error(`Seed course not found: ${seed.course} — run courseSeeder first`);

    const enrolled = await Models.Enrollments.findOne({
      where: { userId, courseId: courseRow.id },
      attributes: ["id"],
    });
    if (!enrolled) {
      throw new Error(`Review needs enrollment: ${seed.user} / ${seed.course} — run enrollmentSeeder first`);
    }

    const existing = await Models.Reviews.findOne({
      where: { userId, courseId: courseRow.id },
      attributes: ["id"],
    });
    if (existing) continue;

    await Models.Reviews.create({
      userId,
      courseId: courseRow.id,
      rating: seed.rating,
      comment: seed.comment,
    });
    created += 1;
  }

  return { created };
};

if (require.main === module) {
  runReviewSeeder()
    .then(({ created }) => console.log(`Reviews: ${created} created`))
    .catch((error) => {
      console.error("Review seeding failed:", error);
      process.exitCode = 1;
    });
}
