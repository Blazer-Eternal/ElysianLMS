import * as Sequelize from "sequelize";
import { StaffRoleEnum } from "../enums/staffRoleEnum";

export interface InputCourseStaffInterface {
  courseId: number;
  userId: number;
  staffRole?: StaffRoleEnum;
}

export interface CourseStaffInterface extends InputCourseStaffInterface {
  id: number;
  staffRole: StaffRoleEnum;
  assignedAt: Date;
}

export interface CourseStaffModelInterface
  extends Sequelize.Model<CourseStaffInterface, InputCourseStaffInterface>,
    CourseStaffInterface {}
