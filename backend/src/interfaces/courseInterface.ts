import * as Sequelize from "sequelize";
import { CourseStatusEnum } from "../enums/courseStatusEnum";

export interface InputCourseInterface {
  teacherId: number;
  categoryId?: number | null;
  title: string;
  slug: string;
  description?: string;
  price?: number;
  thumbnailUrl?: string | null;
  status?: CourseStatusEnum;
}

export interface CourseInterface extends InputCourseInterface {
  id: number;
  categoryId: number | null;
  description: string;
  price: number;
  thumbnailUrl: string | null;
  status: CourseStatusEnum;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseModelInterface
  extends Sequelize.Model<CourseInterface, InputCourseInterface>,
    CourseInterface {}