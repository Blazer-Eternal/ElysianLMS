import * as Sequelize from "sequelize";

export interface InputQuizInterface {
  lessonId: number;
  title: string;
  passScore?: number;
}

export interface QuizInterface extends InputQuizInterface {
  id: number;
  passScore: number;
}

export interface QuizModelInterface
  extends Sequelize.Model<QuizInterface, InputQuizInterface>,
    QuizInterface {}
