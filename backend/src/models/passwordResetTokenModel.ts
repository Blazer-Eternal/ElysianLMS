import * as Sequelize from "sequelize";
import { Database } from "../config";
import { PasswordResetTokenModelInterface } from "../interfaces/passwordResetTokenInterface";

const sequelize = Database.sequelize;

const PasswordResetTokens = sequelize.define<PasswordResetTokenModelInterface>(
  "PasswordResetTokens",
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
    usedAt: {
      type: Sequelize.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "password_reset_tokens",
    underscored: true,
    timestamps: false,
    indexes: [{ name: "password_reset_tokens_user_id_idx", fields: ["user_id"] }],
  }
);

export default PasswordResetTokens;