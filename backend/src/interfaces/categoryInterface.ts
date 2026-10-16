import * as Sequelize from "sequelize";

export interface InputCategoryInterface {
  name: string;
  slug: string;
}

export interface CategoryInterface extends InputCategoryInterface {
  id: number;
}

export interface CategoryModelInterface
  extends Sequelize.Model<CategoryInterface, InputCategoryInterface>,
    CategoryInterface {}