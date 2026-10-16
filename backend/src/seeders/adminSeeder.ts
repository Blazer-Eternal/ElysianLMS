import bcrypt from "bcryptjs";
import { Database } from "../config";
import { RoleEnum } from "../enums/roleEnum";
import { UserServices } from "../services";

const seedAdmin = async () => {
  const { ADMIN_NAME = "Administrator", ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env before seeding");
  }
  if (ADMIN_PASSWORD.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters");
  }

  await Database.sequelize.authenticate();

  const userServices = new UserServices();

  // safe to run repeatedly: skip if the admin already exists
  if (await userServices.findOne(ADMIN_EMAIL)) {
    console.log(`Admin ${ADMIN_EMAIL} already exists, skipping`);
    return;
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await userServices.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    passwordHash,
    role: RoleEnum.admin,
  });

  console.log(`Admin ${ADMIN_EMAIL} created`);
};

seedAdmin()
  .catch((error) => {
    console.error("Admin seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(() => Database.sequelize.close());