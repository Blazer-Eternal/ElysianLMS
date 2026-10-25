import Models from "../models";
import { EmailOtpInterface, InputEmailOtpInterface } from "../interfaces";

// Storage for the single active verification code per user. The service owns
// the policy (expiry, attempt budget, resend cap, lockout); this layer only
// reads and writes rows.
export class EmailOtpRepository {
  public async findByUserId(userId: number): Promise<EmailOtpInterface | null> {
    return Models.EmailOtps.findOne({ where: { userId } });
  }

  // Insert-or-update: a resend overwrites the previous code for the same user.
  public async upsert(data: InputEmailOtpInterface): Promise<EmailOtpInterface> {
    const [row] = await Models.EmailOtps.upsert(data, { returning: true });
    return row as EmailOtpInterface;
  }

  public async incrementAttempts(userId: number): Promise<void> {
    await Models.EmailOtps.increment("attempts", { where: { userId } });
  }

  public async incrementSendCount(userId: number): Promise<void> {
    await Models.EmailOtps.increment("sendCount", { where: { userId } });
  }

  public async setLockedUntil(userId: number, until: Date): Promise<void> {
    await Models.EmailOtps.update({ lockedUntil: until }, { where: { userId } });
  }

  public async deleteByUserId(userId: number): Promise<boolean> {
    return (await Models.EmailOtps.destroy({ where: { userId } })) > 0;
  }
}
