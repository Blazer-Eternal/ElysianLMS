import * as Sequelize from "sequelize";
import { Database } from "../config";
import { StaffRoleEnum } from "../enums/staffRoleEnum";
import { CourseStaffModelInterface } from "../interfaces/courseStaffInterface";

const sequelize = Database.sequelize;

const CourseStaff = sequelize.define<CourseStaffModelInterface>(
  "CourseStaff",
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    courseId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    staffRole: {
      type: Sequelize.ENUM(...Object.values(StaffRoleEnum)),
      allowNull: false,
      defaultValue: StaffRoleEnum.ta,
    },
    assignedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    tableName: "course_staff",
    underscored: true,
    timestamps: false,
    indexes: [
      { name: "course_staff_user_id_idx", fields: ["user_id"] },
      { name: "course_staff_course_user_unique", unique: true, fields: ["course_id", "user_id"] },
    ],
  }
);

export default CourseStaff;
