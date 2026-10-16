import * as Sequelize from "sequelize";
import { Database } from "../config";
import { CategoryModelInterface } from "../interfaces/categoryInterface";

const sequelize = Database.sequelize;

const Categories = sequelize.define<CategoryModelInterface>(
  "Categories",
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true,
    },
    slug: {
      type: Sequelize.STRING(120),
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "categories",
    timestamps: false,
  }
);

export default Categories;