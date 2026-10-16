import { StaffRoleEnum } from "../../enums/staffRoleEnum";
import Models from "../../models";
import { SEED_COURSES, courseSlug } from "./courseSeeder";
import { emailOf } from "./userSeeder";

// TA assignments per course. Users referenced here keep role=student —
// this block is what proves per-course staff power works without a role bump.
const STAFF_ASSIGNMENTS: { course: string; user: string; role: StaffRoleEnum }[] = [
  { course: "webdev", user: "james", role: StaffRoleEnum.ta },
  { course: "webdev", user: "sophia", role: StaffRoleEnum.coTeacher },
  { course: "python", user: "james", role: StaffRoleEnum.ta },
  { course: "postgres", user: "sophia", role: StaffRoleEnum.ta },
  { course: "uiux", user: "james", role: StaffRoleEnum.ta },
  { course: "js", user: "sophia", role: StaffRoleEnum.ta },
];

export const runCourseStaffSeeder = async (): Promise<{ created: number }> => {
  const users = await Models.Users.findAll({ attributes: ["id", "email"] });
  const idByEmail = new Map(users.map((u) => [u.email, u.id]));

  let created = 0;

  for (const assignment of STAFF_ASSIGNMENTS) {
    const courseRow = await Models.Courses.findOne({
      where: { slug: courseSlug(assignment.course) },
      attributes: ["id", "teacherId"],
    });
    if (!courseRow) throw new Error(`Seed course not found: ${assignment.course} — run courseSeeder first`);

    const userId = idByEmail.get(emailOf(assignment.user));
    if (!userId) throw new Error(`Seed staff user not found: ${assignment.user} — run userSeeder first`);

    if (courseRow.teacherId === userId) {
      throw new Error(`Seed error: ${assignment.user} is the owner of ${assignment.course} and cannot be staff`);
    }

    const existing = await Models.CourseStaff.findOne({
      where: { courseId: courseRow.id, userId },
      attributes: ["id"],
    });
    if (existing) continue;

    await Models.CourseStaff.create({
      courseId: courseRow.id,
      userId,
      staffRole: assignment.role,
    });
    created += 1;
  }

  return { created };
};

if (require.main === module) {
  runCourseStaffSeeder()
    .then(({ created }) => console.log(`Course staff: ${created} created`))
    .catch((error) => {
      console.error("Course staff seeding failed:", error);
      process.exitCode = 1;
    });
}
