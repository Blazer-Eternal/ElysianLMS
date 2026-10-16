import * as Sequelize from "sequelize";
import { Database } from "../config";
import { AttemptAnswerModelInterface } from "../interfaces/attemptAnswerInterface";

const sequelize = Database.sequelize;

const AttemptAnswers = sequelize.define<AttemptAnswerModelInterface>(
  "AttemptAnswers",
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    attemptId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    questionId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    optionId: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "attempt_answers",
    underscored: true,
    timestamps: false,
    indexes: [{ name: "attempt_answers_question_id_idx", fields: ["question_id"] }],
  }
);

export default AttemptAnswers;
