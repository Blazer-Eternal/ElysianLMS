import * as Sequelize from "sequelize";
import { RoleEnum } from "../enums/roleEnum";

export interface InputUserInterface {
  name: string;
  email: string;
  passwordHash: string;
  role?: RoleEnum;
  avatarUrl?: string | null;
  isBanned?: boolean;
}

export interface UserInterface extends InputUserInterface {
  id: number;
  role: RoleEnum;
  avatarUrl: string | null;
  isBanned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserModelInterface
  extends Sequelize.Model<UserInterface, InputUserInterface>,
    UserInterface {}