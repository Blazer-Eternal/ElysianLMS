import { Op } from "sequelize";
import {
  InputPasswordResetTokenInterface,
  PasswordResetTokenInterface,
} from "../interfaces";
import Models from "../models";

export class PasswordResetTokenRepository {
  public async create(
    data: InputPasswordResetTokenInterface
  ): Promise<PasswordResetTokenInterface> {
    return Models.PasswordResetTokens.create(data);
  }

  // Only returns still-valid tokens: unused and not expired.
  public async findValidByTokenHash(
    tokenHash: string
  ): Promise<PasswordResetTokenInterface | null> {
    return Models.PasswordResetTokens.findOne({
      where: { tokenHash, usedAt: null, expiresAt: { [Op.gt]: new Date() } },
    });
  }

  // Atomic single-use claim: two racing requests with the same token can
  // both pass findValid, but only one wins this conditional update.
  public async claim(id: number): Promise<boolean> {
    const [affected] = await Models.PasswordResetTokens.update(
      { usedAt: new Date() },
      { where: { id, usedAt: null } }
    );
    return affected > 0;
  }

  // Issuing a new reset token invalidates any previous unused one.
  public async deleteAllByUser(userId: number): Promise<number> {
    return Models.PasswordResetTokens.destroy({ where: { userId } });
  }
}
