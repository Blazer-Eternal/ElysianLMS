import * as Sequelize from "sequelize";

// One active verification code per user. `codeHash` is the SHA-256 of the
// 6-digit OTP; the plaintext is only ever emailed. `attempts` counts wrong
// entries, `sendCount` how many codes have gone out (initial + resends), and
// `lockedUntil` is set to now+24h once the attempt budget is exhausted.
export interface InputEmailOtpInterface {
  userId: number;
  codeHash: string;
  expiresAt: Date;
  attempts?: number;
  sendCount?: number;
  lockedUntil?: Date | null;
}

export interface EmailOtpInterface extends InputEmailOtpInterface {
  id: number;
  attempts: number;
  sendCount: number;
  lockedUntil: Date | null;
}

export interface EmailOtpModelInterface
  extends Sequelize.Model<EmailOtpInterface, InputEmailOtpInterface>,
    EmailOtpInterface {}
