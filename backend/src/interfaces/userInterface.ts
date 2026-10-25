import * as Sequelize from "sequelize";
import { RoleEnum } from "../enums/roleEnum";

export interface InputUserInterface {
  name: string;
  email: string;
  // Nullable: Google-created accounts have no password.
  passwordHash?: string | null;
  role?: RoleEnum;
  avatarUrl?: string | null;
  isBanned?: boolean;
  emailVerified?: boolean;
  googleSub?: string | null;
}

export interface UserInterface extends InputUserInterface {
  id: number;
  role: RoleEnum;
  passwordHash: string | null;
  avatarUrl: string | null;
  isBanned: boolean;
  emailVerified: boolean;
  googleSub: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserModelInterface
  extends Sequelize.Model<UserInterface, InputUserInterface>,
    UserInterface {}