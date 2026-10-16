import * as Sequelize from "sequelize";
import { Database } from "../config";
import { SectionModelInterface } from "../interfaces/sectionInterface";

const sequelize = Database.sequelize;

const Sections = sequelize.define<SectionModelInterface>(
  "Sections",
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    courseId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    title: {
      type: Sequelize.STRING(200),
      allowNull: false,
      validate: { len: [1, 200] },
    },
    orderIndex: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: { min: 0 },
    },
  },
  {
    tableName: "sections",
    underscored: true,
    timestamps: false,
    indexes: [{ name: "sections_course_id_idx", fields: ["course_id"] }],
  }
);

export default Sections;
