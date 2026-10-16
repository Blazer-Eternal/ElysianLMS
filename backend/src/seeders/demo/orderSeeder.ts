import { OrderStatusEnum } from "../../enums/orderStatusEnum";
import { PaymentGatewayEnum } from "../../enums/paymentGatewayEnum";
import Models from "../../models";
import { SEED_COURSES, courseSlug } from "./courseSeeder";
import { emailOf } from "./userSeeder";

interface SeedOrder {
  user: string;
  course: string;
  status: OrderStatusEnum;
  transactionId: string | null;
}

const gatewayFor = (index: number): PaymentGatewayEnum =>
  index % 2 === 0 ? PaymentGatewayEnum.esewa : PaymentGatewayEnum.khalti;

// PAID orders back every enrollment in enrollmentSeeder; the last three are
// lifecycle demos (pending / failed / refunded) with no live access attached.
export const SEED_ORDERS: SeedOrder[] = [
  // Complete Web Development Bootcamp
  { user: "alex", course: "webdev", status: OrderStatusEnum.paid, transactionId: "TX-SEED-WD-ALEX" },
  { user: "olivia", course: "webdev", status: OrderStatusEnum.paid, transactionId: "TX-SEED-WD-OLIVIA" },
  { user: "noah", course: "webdev", status: OrderStatusEnum.paid, transactionId: "TX-SEED-WD-NOAH" },
  { user: "ava", course: "webdev", status: OrderStatusEnum.paid, transactionId: "TX-SEED-WD-AVA" },
  { user: "ethan", course: "webdev", status: OrderStatusEnum.paid, transactionId: "TX-SEED-WD-ETHAN" },
  // Python for Data Science
  { user: "olivia", course: "python", status: OrderStatusEnum.paid, transactionId: "TX-SEED-PY-OLIVIA" },
  { user: "emma", course: "python", status: OrderStatusEnum.paid, transactionId: "TX-SEED-PY-EMMA" },
  { user: "liam", course: "python", status: OrderStatusEnum.paid, transactionId: "TX-SEED-PY-LIAM" },
  { user: "lucas", course: "python", status: OrderStatusEnum.paid, transactionId: "TX-SEED-PY-LUCAS" },
  { user: "isabella", course: "python", status: OrderStatusEnum.paid, transactionId: "TX-SEED-PY-ISABELLA" },
  { user: "mia", course: "python", status: OrderStatusEnum.paid, transactionId: "TX-SEED-PY-MIA" },
  // PostgreSQL Database Mastery
  { user: "emma", course: "postgres", status: OrderStatusEnum.paid, transactionId: "TX-SEED-PG-EMMA" },
  { user: "liam", course: "postgres", status: OrderStatusEnum.paid, transactionId: "TX-SEED-PG-LIAM" },
  { user: "ethan", course: "postgres", status: OrderStatusEnum.paid, transactionId: "TX-SEED-PG-ETHAN" },
  { user: "ava", course: "postgres", status: OrderStatusEnum.paid, transactionId: "TX-SEED-PG-AVA" },
  // UI/UX Design Fundamentals
  { user: "emma", course: "uiux", status: OrderStatusEnum.paid, transactionId: "TX-SEED-UX-EMMA" },
  { user: "mia", course: "uiux", status: OrderStatusEnum.paid, transactionId: "TX-SEED-UX-MIA" },
  { user: "ava", course: "uiux", status: OrderStatusEnum.paid, transactionId: "TX-SEED-UX-AVA" },
  // JavaScript from Beginner to Advanced
  { user: "ethan", course: "js", status: OrderStatusEnum.paid, transactionId: "TX-SEED-JS-ETHAN" },
  { user: "olivia", course: "js", status: OrderStatusEnum.paid, transactionId: "TX-SEED-JS-OLIVIA" },
  // Lifecycle demos
  { user: "noah", course: "postgres", status: OrderStatusEnum.pending, transactionId: null },
  { user: "emma", course: "uiux", status: OrderStatusEnum.failed, transactionId: "TX-SEED-UX-EMMA-FAIL" },
  { user: "liam", course: "js", status: OrderStatusEnum.refunded, transactionId: "TX-SEED-JS-LIAM" },
];

export const runOrderSeeder = async (): Promise<{ created: number; paidOrderIds: Map<string, number> }> => {
  const users = await Models.Users.findAll({ attributes: ["id", "email"] });
  const idByEmail = new Map(users.map((u) => [u.email, u.id]));

  const paidOrderIds = new Map<string, number>(); // `${userKey}:${courseKey}` -> order id
  let created = 0;
  let index = 0;

  for (const seed of SEED_ORDERS) {
    index += 1;

    const userId = idByEmail.get(emailOf(seed.user));
    if (!userId) throw new Error(`Seed user not found: ${seed.user} — run userSeeder first`);

    const courseRow = await Models.Courses.findOne({
      where: { slug: courseSlug(seed.course) },
      attributes: ["id", "price"],
    });
    if (!courseRow) throw new Error(`Seed course not found: ${seed.course} — run courseSeeder first`);

    // amount is snapshotted from the course price at order time
    const amount = courseRow.price;

    const existing = await Models.Orders.findOne({
      where: { userId, courseId: courseRow.id, status: seed.status },
      attributes: ["id"],
    });

    if (existing) {
      if (seed.status === OrderStatusEnum.paid) paidOrderIds.set(`${seed.user}:${seed.course}`, existing.id);
      continue;
    }

    const now = new Date();
    const order = await Models.Orders.create({
      userId,
      courseId: courseRow.id,
      amount,
      gateway: gatewayFor(index),
      status: seed.status,
      transactionId: seed.transactionId,
      gatewayResponse: {
        seeded: true,
        reference: seed.transactionId ?? null,
        status: seed.status.toUpperCase(),
      },
      // DB CHECKs: paid needs paid_at, refunded needs refunded_at
      paidAt: seed.status === OrderStatusEnum.paid ? now : null,
      refundedAt: seed.status === OrderStatusEnum.refunded ? now : null,
    });

    if (seed.status === OrderStatusEnum.paid) paidOrderIds.set(`${seed.user}:${seed.course}`, order.id);
    created += 1;
  }

  return { created, paidOrderIds };
};

if (require.main === module) {
  runOrderSeeder()
    .then(({ created }) => console.log(`Orders: ${created} created`))
    .catch((error) => {
      console.error("Order seeding failed:", error);
      process.exitCode = 1;
    });
}
