import * as Sequelize from "sequelize";
import { Database } from "../config";
import { QuizQuestionModelInterface } from "../interfaces/quizQuestionInterface";

const sequelize = Database.sequelize;

const QuizQuestions = sequelize.define<QuizQuestionModelInterface>(
  "QuizQuestions",
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
    questionText: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    orderIndex: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: { min: 0 },
    },
  },
  {
    tableName: "quiz_questions",
    underscored: true,
    timestamps: false,
    indexes: [{ name: "quiz_questions_quiz_id_idx", fields: ["quiz_id"] }],
  }
);

export default QuizQuestions;
