import * as Sequelize from "sequelize";
import { Database } from "../config";
import { SessionModelInterface } from "../interfaces/sessionInterface";

const sequelize = Database.sequelize;

const Sessions = sequelize.define<SessionModelInterface>(
  "Sessions",
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    tokenHash: {
      type: Sequelize.CHAR(64),
      allowNull: false,
      unique: true,
    },
    expiresAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "sessions",
    underscored: true,
    timestamps: true,
    updatedAt: false,
    indexes: [
      { name: "sessions_user_id_idx", fields: ["user_id"] },
      { name: "sessions_expires_at_idx", fields: ["expires_at"] },
    ],
  }
);

export default Sessions;