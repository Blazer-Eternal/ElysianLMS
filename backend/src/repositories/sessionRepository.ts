import { Op } from "sequelize";
import { InputSessionInterface, SessionInterface } from "../interfaces";
import Models from "../models";

export class SessionRepository {
  public async create(data: InputSessionInterface): Promise<SessionInterface> {
    return Models.Sessions.create(data);
  }

  public async findByTokenHash(tokenHash: string): Promise<SessionInterface | null> {
    return Models.Sessions.findOne({ where: { tokenHash } });
  }

  // Logout / rotation: the presented refresh token is consumed server-side.
  public async deleteByTokenHash(tokenHash: string): Promise<boolean> {
    return (await Models.Sessions.destroy({ where: { tokenHash } })) > 0;
  }

  // Password change, password reset, "logout everywhere".
  public async deleteAllByUser(userId: number): Promise<number> {
    return Models.Sessions.destroy({ where: { userId } });
  }

  // Housekeeping so stale rows don't accumulate.
  public async deleteExpiredByUser(userId: number): Promise<number> {
    return Models.Sessions.destroy({
      where: { userId, expiresAt: { [Op.lt]: new Date() } },
    });
  }
}
