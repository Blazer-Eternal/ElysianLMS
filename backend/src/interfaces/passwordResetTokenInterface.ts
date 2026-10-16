import * as Sequelize from "sequelize";

export interface InputPasswordResetTokenInterface {
  userId: number;
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date | null;
}

export interface PasswordResetTokenInterface extends InputPasswordResetTokenInterface {
  id: number;
  usedAt: Date | null;
}

export interface PasswordResetTokenModelInterface
  extends Sequelize.Model<PasswordResetTokenInterface, InputPasswordResetTokenInterface>,
    PasswordResetTokenInterface {}