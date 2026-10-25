import * as Sequelize from "sequelize";
import { Database } from "../config";
import { EmailOtpModelInterface } from "../interfaces/emailOtpInterface";

const sequelize = Database.sequelize;

const EmailOtps = sequelize.define<EmailOtpModelInterface>(
  "EmailOtps",
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
      unique: true, // one active code per user
    },
    codeHash: {
      type: Sequelize.CHAR(64),
      allowNull: false,
    },
    attempts: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    sendCount: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    expiresAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    lockedUntil: {
      type: Sequelize.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "email_otps",
    underscored: true,
    timestamps: true,
    indexes: [{ name: "email_otps_user_id_key", unique: true, fields: ["user_id"] }],
  }
);

export default EmailOtps;
