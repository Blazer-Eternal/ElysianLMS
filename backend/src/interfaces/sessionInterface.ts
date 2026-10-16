import * as Sequelize from "sequelize";

export interface InputSessionInterface {
  userId: number;
  tokenHash: string;
  expiresAt: Date;
}

export interface SessionInterface extends InputSessionInterface {
  id: number;
  createdAt: Date;
}

export interface SessionModelInterface
  extends Sequelize.Model<SessionInterface, InputSessionInterface>,
    SessionInterface {}