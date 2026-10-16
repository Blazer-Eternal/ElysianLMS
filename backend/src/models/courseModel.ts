import * as Sequelize from "sequelize";
import { Database } from "../config";
import { CourseStatusEnum } from "../enums/courseStatusEnum";
import { CourseModelInterface } from "../interfaces/courseInterface";

const sequelize = Database.sequelize;

const Courses = sequelize.define<CourseModelInterface>(
  "Courses",
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    teacherId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    categoryId: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    title: {
      type: Sequelize.STRING(200),
      allowNull: false,
      validate: { len: [1, 200] },
    },
    slug: {
      type: Sequelize.STRING(220),
      allowNull: false,
      unique: true,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false,
      defaultValue: "",
    },
    price: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
      // pg returns NUMERIC as a string; hand back a real number
      get(this: CourseModelInterface) {
        return Number(this.getDataValue("price"));
      },
    },
    thumbnailUrl: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    status: {
      type: Sequelize.ENUM(...Object.values(CourseStatusEnum)),
      allowNull: false,
      defaultValue: CourseStatusEnum.draft,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "courses",
    underscored: true,
    timestamps: true,
    indexes: [
      { name: "courses_status_category_idx", fields: ["status", "category_id"] },
      { name: "courses_teacher_id_idx", fields: ["teacher_id"] },
    ],
  }
);

export default Courses;