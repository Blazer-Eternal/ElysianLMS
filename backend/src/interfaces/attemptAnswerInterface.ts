import * as Sequelize from "sequelize";

export interface InputAttemptAnswerInterface {
  attemptId: number;
  questionId: number;
  optionId?: number | null;
}

export interface AttemptAnswerInterface extends InputAttemptAnswerInterface {
  id: number;
  optionId: number | null;
}

export interface AttemptAnswerModelInterface
  extends Sequelize.Model<AttemptAnswerInterface, InputAttemptAnswerInterface>,
    AttemptAnswerInterface {}
