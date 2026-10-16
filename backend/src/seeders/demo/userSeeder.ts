import bcrypt from "bcryptjs";
import { RoleEnum } from "../../enums/roleEnum";
import Models from "../../models";

// 16 demo accounts, one shared password for local testing ONLY.
// TAs intentionally keep role=student: their power comes purely from
// course_staff membership, which is exactly what we want to test.
export const DEMO_PASSWORD = "Password123!";
export const DEMO_EMAIL_DOMAIN = "demo.elysian.com";

const USERS: { key: string; name: string; role: RoleEnum }[] = [
  // Instructors
  { key: "sarah", name: "Sarah Johnson", role: RoleEnum.teacher },
  { key: "michael", name: "Michael Chen", role: RoleEnum.teacher },
  { key: "emily", name: "Emily Davis", role: RoleEnum.teacher },
  { key: "daniel", name: "Daniel Wilson", role: RoleEnum.teacher },
  // Teaching Assistants (system role stays student — TA is per-course)
  { key: "james", name: "James Anderson", role: RoleEnum.student },
  { key: "sophia", name: "Sophia Martinez", role: RoleEnum.student },
  // Students
  { key: "alex", name: "Alex Brown", role: RoleEnum.student },
  { key: "olivia", name: "Olivia Taylor", role: RoleEnum.student },
  { key: "noah", name: "Noah Thomas", role: RoleEnum.student },
  { key: "emma", name: "Emma Moore", role: RoleEnum.student },
  { key: "liam", name: "Liam Jackson", role: RoleEnum.student },
  { key: "ava", name: "Ava Martin", role: RoleEnum.student },
  { key: "ethan", name: "Ethan White", role: RoleEnum.student },
  { key: "mia", name: "Mia Harris", role: RoleEnum.student },
  { key: "lucas", name: "Lucas Clark", role: RoleEnum.student },
  { key: "isabella", name: "Isabella Lewis", role: RoleEnum.student },
];

export const emailOf = (key: string): string => `${key}@${DEMO_EMAIL_DOMAIN}`;

export const runUserSeeder = async (): Promise<{ created: number; ids: Map<string, number> }> => {
  // hash once — same password for every demo account
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const ids = new Map<string, number>();
  let created = 0;

  for (const user of USERS) {
    const email = emailOf(user.key);
    const existing = await Models.Users.findOne({ where: { email } });

    if (existing) {
      ids.set(user.key, existing.id);
      continue;
    }

    const row = await Models.Users.create({ name: user.name, email, passwordHash, role: user.role });
    ids.set(user.key, row.id);
    created += 1;
  }

  return { created, ids };
};

if (require.main === module) {
  runUserSeeder()
    .then(({ created }) => console.log(`Users: ${created} created`))
    .catch((error) => {
      console.error("User seeding failed:", error);
      process.exitCode = 1;
    });
}
