import * as Sequelize from "sequelize";
import { Database } from "../config";
import { ReviewModelInterface } from "../interfaces/reviewInterface";

const sequelize = Database.sequelize;

const Reviews = sequelize.define<ReviewModelInterface>(
  "Reviews",
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
    rating: {
      type: Sequelize.SMALLINT,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    comment: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "reviews",
    underscored: true,
    timestamps: true,
    updatedAt: false,
    indexes: [
      { name: "reviews_course_id_idx", fields: ["course_id"] },
      { name: "reviews_user_course_unique", unique: true, fields: ["user_id", "course_id"] },
    ],
  }
);

export default Reviews;
