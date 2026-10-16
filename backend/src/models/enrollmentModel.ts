import * as Sequelize from "sequelize";
import { Database } from "../config";
import { EnrollmentModelInterface } from "../interfaces/enrollmentInterface";

const sequelize = Database.sequelize;

const Enrollments = sequelize.define<EnrollmentModelInterface>(
  "Enrollments",
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    courseId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    orderId: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    enrolledAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    tableName: "enrollments",
    underscored: true,
    // enrolled_at is the only time column; timestamps:false keeps Sequelize
    // from also looking for created_at
    timestamps: false,
    indexes: [
      { name: "enrollments_course_id_idx", fields: ["course_id"] },
      { name: "enrollments_user_course_unique", unique: true, fields: ["user_id", "course_id"] },
      { name: "enrollments_order_unique", unique: true, fields: ["order_id"] },
    ],
  }
);

export default Enrollments;
