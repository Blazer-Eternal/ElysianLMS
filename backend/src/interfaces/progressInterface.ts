import * as Sequelize from "sequelize";

export interface InputProgressInterface {
  userId: number;
  lessonId: number;
}

export interface ProgressInterface extends InputProgressInterface {
  id: number;
  completedAt: Date;
}

export interface ProgressModelInterface
  extends Sequelize.Model<ProgressInterface, InputProgressInterface>,
    ProgressInterface {}
