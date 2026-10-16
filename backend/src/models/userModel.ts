import * as Sequelize from "sequelize";
import { Database } from "../config";
import { RoleEnum } from "../enums/roleEnum";
import { UserModelInterface } from "../interfaces/userInterface";

const sequelize = Database.sequelize;

const Users = sequelize.define<UserModelInterface>(
  "Users",
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
      validate: { len: [1, 100] },
    },
    email: {
      type: Sequelize.STRING(255),
      allowNull: false,
      validate: { isEmail: true },
      set(this: UserModelInterface, value: unknown) {
        this.setDataValue("email", String(value).trim().toLowerCase());
      },
    },
    passwordHash: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    role: {
      type: Sequelize.ENUM(...Object.values(RoleEnum)),
      allowNull: false,
      defaultValue: RoleEnum.student,
    },
    avatarUrl: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    isBanned: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "users",
    underscored: true,
    timestamps: true,
    indexes: [
      {
        name: "users_email_lower_key",
        unique: true,
        fields: [Sequelize.fn("lower", Sequelize.col("email"))],
      },
      { name: "users_role_idx", fields: ["role"] },
    ],
  }
);

export default Users;