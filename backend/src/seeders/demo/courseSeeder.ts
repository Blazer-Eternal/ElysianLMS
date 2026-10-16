import { CourseStatusEnum } from "../../enums/courseStatusEnum";
import Models from "../../models";
import { emailOf } from "./userSeeder";

// 8 courses spanning every lifecycle state so the admin dashboard can be
// tested against draft, pending, published and rejected rows alike.
// Slugs are the idempotency key.
export interface SeedCourse {
  key: string;
  title: string;
  teacher: string; // user key
  category: string; // category name
  status: CourseStatusEnum;
  price: number;
  description: string;
}

export const SEED_COURSES: SeedCourse[] = [
  {
    key: "webdev",
    title: "Complete Web Development Bootcamp",
    teacher: "sarah",
    category: "Web Development",
    status: CourseStatusEnum.published,
    price: 79,
    description:
      "Learn modern web development from HTML and CSS to JavaScript, REST APIs, databases, and full-stack application development.",
  },
  {
    key: "python",
    title: "Python for Data Science",
    teacher: "michael",
    category: "Data Science",
    status: CourseStatusEnum.published,
    price: 59,
    description:
      "Learn Python programming, data manipulation, visualization, and essential techniques used in modern data science.",
  },
  {
    key: "postgres",
    title: "PostgreSQL Database Mastery",
    teacher: "emily",
    category: "Database Management",
    status: CourseStatusEnum.published,
    price: 45,
    description:
      "Learn relational database design, SQL queries, joins, indexes, constraints, transactions, and PostgreSQL administration.",
  },
  {
    key: "uiux",
    title: "UI/UX Design Fundamentals",
    teacher: "daniel",
    category: "UI/UX Design",
    status: CourseStatusEnum.published,
    price: 39,
    description:
      "Learn the fundamentals of user experience, wireframing, prototyping, visual hierarchy, typography, and interface design.",
  },
  {
    key: "js",
    title: "JavaScript from Beginner to Advanced",
    teacher: "sarah",
    category: "Programming",
    status: CourseStatusEnum.published,
    price: 69,
    description:
      "Build a strong JavaScript foundation and progress toward asynchronous programming, modules, APIs, and advanced concepts.",
  },
  {
    key: "cyber",
    title: "Introduction to Cybersecurity",
    teacher: "michael",
    category: "Cybersecurity",
    status: CourseStatusEnum.pending,
    price: 49,
    description:
      "Understand cybersecurity fundamentals, common threats, authentication, encryption, network security, and secure practices.",
  },
  {
    key: "dm",
    title: "Digital Marketing Essentials",
    teacher: "emily",
    category: "Digital Marketing",
    status: CourseStatusEnum.draft,
    price: 0,
    description:
      "Plan and execute digital campaigns across content, social, email and search — from goal setting to measurement.",
  },
  {
    key: "ml",
    title: "Machine Learning Fundamentals",
    teacher: "daniel",
    category: "Artificial Intelligence",
    status: CourseStatusEnum.rejected,
    price: 89,
    description:
      "An introduction to supervised learning, model training, evaluation and the core algorithms behind modern ML systems.",
  },
];

const slugifyKey = (title: string): string =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const courseSlug = (key: string): string => {
  const course = SEED_COURSES.find((c) => c.key === key);
  if (!course) throw new Error(`Unknown seed course key: ${key}`);
  return slugifyKey(course.title);
};

export const runCourseSeeder = async (): Promise<{ created: number; ids: Map<string, number> }> => {
  const ids = new Map<string, number>();
  let created = 0;

  const users = await Models.Users.findAll({ attributes: ["id", "email"] });
  const idByEmail = new Map(users.map((u) => [u.email, u.id]));

  const categories = await Models.Categories.findAll({ attributes: ["id", "name"] });
  const idByCategory = new Map(categories.map((c) => [c.name, c.id]));

  for (const course of SEED_COURSES) {
    const slug = slugifyKey(course.title);
    const existing = await Models.Courses.findOne({ where: { slug } });

    if (existing) {
      ids.set(course.key, existing.id);
      continue;
    }

    const teacherId = idByEmail.get(emailOf(course.teacher));
    if (!teacherId) throw new Error(`Seed teacher not found: ${course.teacher} — run userSeeder first`);

    const categoryId = idByCategory.get(course.category) ?? null;

    const row = await Models.Courses.create({
      title: course.title,
      slug,
      description: course.description,
      price: course.price,
      status: course.status,
      teacherId,
      categoryId,
    });
    ids.set(course.key, row.id);
    created += 1;
  }

  return { created, ids };
};

if (require.main === module) {
  runCourseSeeder()
    .then(({ created }) => console.log(`Courses: ${created} created`))
    .catch((error) => {
      console.error("Course seeding failed:", error);
      process.exitCode = 1;
    });
}
