import * as Sequelize from "sequelize";

export interface InputEnrollmentInterface {
  userId: number;
  courseId: number;
  orderId?: number | null;
}

export interface EnrollmentInterface extends InputEnrollmentInterface {
  id: number;
  orderId: number | null;
  enrolledAt: Date;
}

export interface EnrollmentModelInterface
  extends Sequelize.Model<EnrollmentInterface, InputEnrollmentInterface>,
    EnrollmentInterface {}
