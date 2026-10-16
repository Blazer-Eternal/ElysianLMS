import * as Sequelize from "sequelize";

export interface InputSectionInterface {
  courseId: number;
  title: string;
  orderIndex: number;
}

export interface SectionInterface extends InputSectionInterface {
  id: number;
}

export interface SectionModelInterface
  extends Sequelize.Model<SectionInterface, InputSectionInterface>,
    SectionInterface {}
