import * as Sequelize from "sequelize";

export interface InputQuizOptionInterface {
  questionId: number;
  optionText: string;
  isCorrect?: boolean;
}

export interface QuizOptionInterface extends InputQuizOptionInterface {
  id: number;
  isCorrect: boolean;
}

export interface QuizOptionModelInterface
  extends Sequelize.Model<QuizOptionInterface, InputQuizOptionInterface>,
    QuizOptionInterface {}
