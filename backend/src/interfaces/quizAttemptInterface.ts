import * as Sequelize from "sequelize";

export interface InputQuizAttemptInterface {
  quizId: number;
  userId: number;
  score: number;
  passed: boolean;
}

export interface QuizAttemptInterface extends InputQuizAttemptInterface {
  id: number;
  submittedAt: Date;
}

export interface QuizAttemptModelInterface
  extends Sequelize.Model<QuizAttemptInterface, InputQuizAttemptInterface>,
    QuizAttemptInterface {}
