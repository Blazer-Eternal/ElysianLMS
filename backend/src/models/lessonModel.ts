import * as Sequelize from "sequelize";
import { Database } from "../config";
import { VideoProviderEnum } from "../enums/videoProviderEnum";
import { LessonModelInterface } from "../interfaces/lessonInterface";

const sequelize = Database.sequelize;

const Lessons = sequelize.define<LessonModelInterface>(
  "Lessons",
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    sectionId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    title: {
      type: Sequelize.STRING(200),
      allowNull: false,
      validate: { len: [1, 200] },
    },
    videoProvider: {
      type: Sequelize.ENUM(...Object.values(VideoProviderEnum)),
      allowNull: true,
    },
    videoRef: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    content: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    isPreview: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    orderIndex: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: { min: 0 },
    },
  },
  {
    tableName: "lessons",
    underscored: true,
    timestamps: false,
    indexes: [{ name: "lessons_section_id_idx", fields: ["section_id"] }],
  }
);

export default Lessons;
