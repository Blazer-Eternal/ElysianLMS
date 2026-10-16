import Models from "../../models";
import { SEED_COURSES, courseSlug } from "./courseSeeder";

// Curriculum outline per course: 2-4 sections, 3-5 lessons each.
// Keys match SEED_COURSES.
export const SEED_CURRICULUM: Record<string, { title: string; lessons: string[] }[]> = {
  webdev: [
    {
      title: "HTML Fundamentals",
      lessons: ["Introduction to HTML", "HTML Elements and Attributes", "Forms and Input Elements", "Semantic HTML"],
    },
    {
      title: "CSS Fundamentals",
      lessons: ["CSS Selectors", "Box Model", "Flexbox", "CSS Grid"],
    },
    {
      title: "JavaScript",
      lessons: ["Variables and Data Types", "Functions", "Arrays and Objects", "DOM Manipulation"],
    },
    {
      title: "Backend Development",
      lessons: ["Introduction to Node.js", "Express.js", "REST APIs", "Connecting PostgreSQL"],
    },
  ],
  python: [
    {
      title: "Python Fundamentals",
      lessons: ["Installing Python", "Variables and Data Types", "Control Flow", "Functions and Modules"],
    },
    {
      title: "NumPy and Pandas",
      lessons: ["NumPy Basics", "Series and DataFrames", "Data Cleaning", "Filtering and Grouping"],
    },
    {
      title: "Data Visualization",
      lessons: ["Matplotlib Essentials", "Seaborn Plots", "Customizing Charts", "Dashboard Basics"],
    },
    {
      title: "Data Analysis",
      lessons: ["Exploratory Analysis", "Feature Engineering", "Case Study: Sales Data", "Presenting Findings"],
    },
  ],
  postgres: [
    {
      title: "SQL Fundamentals",
      lessons: ["SELECT and FROM", "Filtering with WHERE", "Aggregate Functions", "Sorting and Limiting"],
    },
    {
      title: "Database Relationships",
      lessons: ["Primary and Foreign Keys", "One-to-Many Relations", "Many-to-Many Relations", "Normalization"],
    },
    {
      title: "Advanced Queries",
      lessons: ["Subqueries", "CTEs", "Window Functions", "EXPLAIN and Query Plans"],
    },
    {
      title: "Indexes and Performance",
      lessons: ["Why Indexes Matter", "B-tree and Partial Indexes", "Vacuum and Maintenance", "Connection Pooling"],
    },
  ],
  uiux: [
    {
      title: "UX Principles",
      lessons: ["What is UX?", "User Research Basics", "Personas and Journeys", "Usability Heuristics"],
    },
    {
      title: "Wireframing",
      lessons: ["Information Architecture", "Low-Fidelity Wireframes", "Layout Patterns", "Wireframe Tools"],
    },
    {
      title: "Visual Design",
      lessons: ["Visual Hierarchy", "Typography", "Color Theory", "Design Systems"],
    },
    {
      title: "Prototyping",
      lessons: ["Interactive Prototypes", "Microinteractions", "Usability Testing", "Handoff to Developers"],
    },
  ],
  js: [
    {
      title: "JavaScript Basics",
      lessons: ["Values and Variables", "Types and Coercion", "Operators", "Control Flow"],
    },
    {
      title: "Functions and Objects",
      lessons: ["Function Patterns", "Closures", "Object Literals", "Classes"],
    },
    {
      title: "DOM and Events",
      lessons: ["Selecting Elements", "Event Handling", "Event Delegation", "Forms and Validation"],
    },
    {
      title: "Asynchronous JavaScript",
      lessons: ["The Event Loop", "Promises", "async/await", "Fetch and APIs"],
    },
  ],
  cyber: [
    {
      title: "Security Foundations",
      lessons: ["Threat Landscape", "The CIA Triad", "Authentication vs Authorization"],
    },
    {
      title: "Defending Systems",
      lessons: ["Encryption Basics", "Network Security", "Secure Coding Habits"],
    },
  ],
  dm: [
    {
      title: "Marketing Basics",
      lessons: ["Digital Marketing Landscape", "Customer Personas", "Setting Goals"],
    },
    {
      title: "Channels",
      lessons: ["Content Marketing", "Social Media Strategy", "Email Campaigns"],
    },
  ],
  ml: [
    {
      title: "ML Foundations",
      lessons: ["What is Machine Learning", "Data Preparation", "Training and Testing"],
    },
    {
      title: "Core Algorithms",
      lessons: ["Regression", "Classification", "Model Evaluation"],
    },
  ],
};

export const runSectionSeeder = async (): Promise<{ created: number }> => {
  const idsBySlug = new Map<string, number>();
  for (const course of SEED_COURSES) {
    const row = await Models.Courses.findOne({ where: { slug: courseSlug(course.key) }, attributes: ["id"] });
    if (row) idsBySlug.set(courseSlug(course.key), row.id);
  }

  let created = 0;

  for (const course of SEED_COURSES) {
    const courseId = idsBySlug.get(courseSlug(course.key));
    if (!courseId) throw new Error(`Seed course not found: ${course.key} — run courseSeeder first`);

    const outline = SEED_CURRICULUM[course.key] ?? [];

    for (const [index, section] of outline.entries()) {
      const existing = await Models.Sections.findOne({ where: { courseId, title: section.title } });
      if (existing) continue;

      await Models.Sections.create({ courseId, title: section.title, orderIndex: index });
      created += 1;
    }
  }

  return { created };
};

if (require.main === module) {
  runSectionSeeder()
    .then(({ created }) => console.log(`Sections: ${created} created`))
    .catch((error) => {
      console.error("Section seeding failed:", error);
      process.exitCode = 1;
    });
}
