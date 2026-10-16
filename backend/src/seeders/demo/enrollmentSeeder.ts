import Models from "../../models";
import { SEED_COURSES, courseSlug } from "./courseSeeder";
import { emailOf } from "./userSeeder";

// Paid enrollments mirror the PAID orders in orderSeeder (order_id links them).
// The two comp grants on Digital Marketing carry order_id NULL = free access.
const PAID_ENROLLMENTS: { user: string; course: string }[] = [
  { user: "alex", course: "webdev" },
  { user: "olivia", course: "webdev" },
  { user: "noah", course: "webdev" },
  { user: "ava", course: "webdev" },
  { user: "ethan", course: "webdev" },
  { user: "olivia", course: "python" },
  { user: "emma", course: "python" },
  { user: "liam", course: "python" },
  { user: "lucas", course: "python" },
  { user: "isabella", course: "python" },
  { user: "mia", course: "python" },
  { user: "emma", course: "postgres" },
  { user: "liam", course: "postgres" },
  { user: "ethan", course: "postgres" },
  { user: "ava", course: "postgres" },
  { user: "emma", course: "uiux" },
  { user: "mia", course: "uiux" },
  { user: "ava", course: "uiux" },
  { user: "ethan", course: "js" },
  { user: "olivia", course: "js" },
];

// order_id NULL means free/comp access (spec: "A NULL order_id means a free course")
const COMP_ENROLLMENTS: { user: string; course: string }[] = [
  { user: "lucas", course: "dm" },
  { user: "isabella", course: "dm" },
];

export const runEnrollmentSeeder = async (): Promise<{ created: number }> => {
  const users = await Models.Users.findAll({ attributes: ["id", "email"] });
  const idByEmail = new Map(users.map((u) => [u.email, u.id]));

  const courseIdByKey = new Map<string, number>();
  for (const course of SEED_COURSES) {
    const row = await Models.Courses.findOne({ where: { slug: courseSlug(course.key) }, attributes: ["id"] });
    if (row) courseIdByKey.set(course.key, row.id);
  }

  let created = 0;

  const enroll = async (userKey: string, courseKey: string, orderId: number | null): Promise<void> => {
    const userId = idByEmail.get(emailOf(userKey));
    const courseId = courseIdByKey.get(courseKey);
    if (!userId) throw new Error(`Seed user not found: ${userKey} — run userSeeder first`);
    if (!courseId) throw new Error(`Seed course not found: ${courseKey} — run courseSeeder first`);

    const existing = await Models.Enrollments.findOne({ where: { userId, courseId }, attributes: ["id"] });
    if (existing) return;

    await Models.Enrollments.create({ userId, courseId, orderId });
    created += 1;
  };

  // resolve each paid enrollment to its PAID order so the FK stays consistent;
  // skips cleanly if a previous run already enrolled the pair
  for (const entry of PAID_ENROLLMENTS) {
    const userId = idByEmail.get(emailOf(entry.user));
    const courseId = courseIdByKey.get(entry.course);
    if (!userId || !courseId) throw new Error(`Seed references missing: ${entry.user} / ${entry.course}`);

    const alreadyEnrolled = await Models.Enrollments.findOne({ where: { userId, courseId }, attributes: ["id"] });
    if (alreadyEnrolled) continue;

    const paidOrder = await Models.Orders.findOne({
      where: { userId, courseId, status: "paid" },
      attributes: ["id"],
    });
    if (!paidOrder) {
      throw new Error(`No paid order for ${entry.user} / ${entry.course} — run orderSeeder first`);
    }

    await Models.Enrollments.create({ userId, courseId, orderId: paidOrder.id });
    created += 1;
  }

  for (const entry of COMP_ENROLLMENTS) {
    await enroll(entry.user, entry.course, null);
  }

  return { created };
};

if (require.main === module) {
  runEnrollmentSeeder()
    .then(({ created }) => console.log(`Enrollments: ${created} created`))
    .catch((error) => {
      console.error("Enrollment seeding failed:", error);
      process.exitCode = 1;
    });
}
