import Models from "../models";

// 12 categories covering the LMS's target topics.
// Idempotent: skips any category whose name already exists.
const CATEGORIES = [
  "Programming",
  "Web Development",
  "Data Science",
  "Artificial Intelligence",
  "Database Management",
  "Cybersecurity",
  "UI/UX Design",
  "Graphic Design",
  "Business",
  "Digital Marketing",
  "Project Management",
  "Personal Development",
];

export const runBaseSeeder = async (): Promise<number> => {
  let created = 0;

  for (const name of CATEGORIES) {
    const existing = await Models.Categories.findOne({ where: { name } });
    if (existing) continue;

    await Models.Categories.create({ name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-") });
    created += 1;
  }

  return created;
};

if (require.main === module) {
  runBaseSeeder()
    .then((created) => console.log(`Categories: ${created} created`))
    .catch((error) => {
      console.error("Category seeding failed:", error);
      process.exitCode = 1;
    });
}
