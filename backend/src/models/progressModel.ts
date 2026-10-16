import * as Sequelize from "sequelize";
import { Database } from "../config";
import { ProgressModelInterface } from "../interfaces/progressInterface";

const sequelize = Database.sequelize;

const Progress = sequelize.define<ProgressModelInterface>(
  "Progress",
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
    lessonId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    completedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    tableName: "progress",
    underscored: true,
    // completed_at is the only time column
    timestamps: false,
    indexes: [
      { name: "progress_lesson_id_idx", fields: ["lesson_id"] },
      { name: "progress_user_lesson_unique", unique: true, fields: ["user_id", "lesson_id"] },
    ],
  }
);

export default Progress;
