import * as Sequelize from "sequelize";
import { Database } from "../config";
import { QuizOptionModelInterface } from "../interfaces/quizOptionInterface";

const sequelize = Database.sequelize;

const QuizOptions = sequelize.define<QuizOptionModelInterface>(
  "QuizOptions",
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    questionId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    optionText: {
      type: Sequelize.STRING(500),
      allowNull: false,
      validate: { len: [1, 500] },
    },
    isCorrect: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "quiz_options",
    underscored: true,
    timestamps: false,
    indexes: [{ name: "quiz_options_question_id_idx", fields: ["question_id"] }],
  }
);

export default QuizOptions;
