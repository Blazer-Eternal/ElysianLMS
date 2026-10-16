import * as Sequelize from "sequelize";
import { Database } from "../config";
import { QuizModelInterface } from "../interfaces/quizInterface";

const sequelize = Database.sequelize;

const Quizzes = sequelize.define<QuizModelInterface>(
  "Quizzes",
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    lessonId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: true,
    },
    title: {
      type: Sequelize.STRING(200),
      allowNull: false,
      validate: { len: [1, 200] },
    },
    passScore: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 50,
      validate: { min: 0, max: 100 },
    },
  },
  {
    tableName: "quizzes",
    underscored: true,
    timestamps: false,
  }
);

export default Quizzes;
