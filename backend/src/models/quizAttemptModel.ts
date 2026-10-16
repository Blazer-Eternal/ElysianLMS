import * as Sequelize from "sequelize";
import { Database } from "../config";
import { QuizAttemptModelInterface } from "../interfaces/quizAttemptInterface";

const sequelize = Database.sequelize;

const QuizAttempts = sequelize.define<QuizAttemptModelInterface>(
  "QuizAttempts",
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    quizId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    score: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: { min: 0, max: 100 },
    },
    passed: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    },
    submittedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    tableName: "quiz_attempts",
    underscored: true,
    // submitted_at is the only time column
    timestamps: false,
    indexes: [
      { name: "quiz_attempts_quiz_user_idx", fields: ["quiz_id", "user_id"] },
      { name: "quiz_attempts_user_id_idx", fields: ["user_id"] },
    ],
  }
);

export default QuizAttempts;
