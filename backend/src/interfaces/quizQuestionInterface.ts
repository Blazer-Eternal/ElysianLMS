import * as Sequelize from "sequelize";

export interface InputQuizQuestionInterface {
  quizId: number;
  questionText: string;
  orderIndex: number;
}

export interface QuizQuestionInterface extends InputQuizQuestionInterface {
  id: number;
}

export interface QuizQuestionModelInterface
  extends Sequelize.Model<QuizQuestionInterface, InputQuizQuestionInterface>,
    QuizQuestionInterface {}
