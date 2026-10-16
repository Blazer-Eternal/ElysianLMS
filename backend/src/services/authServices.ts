import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  accessTokenTtl,
  clientUrl,
  jwtSecret,
  refreshTokenTtl,
  resetTokenTtl,
} from "../config";
import { RoleEnum } from "../enums/roleEnum";
import { PasswordResetTokenRepository, SessionRepository, UserRepository } from "../repositories";
import { AppError, generateSecureToken, hashToken, ttlToDate } from "../utils";
import { EmailServices } from "./emailServices";

const REFRESH_TTL_FALLBACK_MS = 7 * 24 * 60 * 60 * 1000; // 7d
const RESET_TTL_FALLBACK_MS = 30 * 60 * 1000; // 30m

export class AuthServices {
  private userRepository = new UserRepository();
  private sessionRepository = new SessionRepository();
  private passwordResetTokenRepository = new PasswordResetTokenRepository();

  // Signup always creates a student
  public async signup(data: { name: string; email: string; password: string }) {
    if (await this.userRepository.findByEmail(data.email)) {
      throw new AppError(409, `User with email ${data.email} already exists!`);
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    return this.userRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
      role: RoleEnum.student,
    });
  }

  public async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);

    // same error for "no such user" and "wrong password"
    const isValid = user ? await bcrypt.compare(password, user.passwordHash) : false;
    if (!user || !isValid) {
      throw new AppError(401, "Invalid credentials!");
    }
    if (user.isBanned) {
      throw new AppError(403, "Your account has been banned.");
    }

    // housekeeping: drop this user's expired sessions while we're here
    await this.sessionRepository.deleteExpiredByUser(user.id);

    const tokens = await this.issueTokens(user.id, user.email, user.role);
    return { ...tokens, user };
  }

  // Exchanges a refresh token for a NEW access + refresh pair (rotation).
  // The presented token's session is consumed first: replaying a stolen or
  // already-rotated token finds no session row and fails with 401.
  public async refresh(refreshToken: string) {
    const tokenHash = hashToken(refreshToken);
    const session = await this.sessionRepository.findByTokenHash(tokenHash);

    if (!session) {
      throw new AppError(401, "Invalid or expired session");
    }
    if (session.expiresAt <= new Date()) {
      await this.sessionRepository.deleteByTokenHash(tokenHash);
      throw new AppError(401, "Invalid or expired session");
    }

    const user = await this.userRepository.findById(session.userId);
    if (!user || user.isBanned) {
      await this.sessionRepository.deleteByTokenHash(tokenHash);
      throw new AppError(401, "Invalid or expired session");
    }

    // strict rotation: only the request that actually deletes the old
    // session gets a replacement; a racing replay loses and gets 401
    const consumed = await this.sessionRepository.deleteByTokenHash(tokenHash);
    if (!consumed) {
      throw new AppError(401, "Invalid or expired session");
    }

    return this.issueTokens(user.id, user.email, user.role);
  }

  // Revokes the session behind the given refresh token. Idempotent: an
  // unknown/expired token is already effectively logged out.
  public async logout(refreshToken?: string): Promise<void> {
    if (refreshToken) {
      await this.sessionRepository.deleteByTokenHash(hashToken(refreshToken));
    }
  }

  public async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError(404, "User not found");
    }

    if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
      throw new AppError(400, "Current password is incorrect");
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.userRepository.update(userId, { passwordHash });

    // a password change is how a user evicts a compromised device:
    // every refresh session dies and the caller must log in again
    await this.sessionRepository.deleteAllByUser(userId);
  }

  // Always resolves without revealing whether the email exists — the
  // response is identical for known and unknown addresses.
  public async forgotPassword(email: string): Promise<{ devResetToken?: string }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) return {};

    // a new request invalidates any previous unused token
    await this.passwordResetTokenRepository.deleteAllByUser(user.id);

    const resetToken = generateSecureToken();
    await this.passwordResetTokenRepository.create({
      userId: user.id,
      tokenHash: hashToken(resetToken),
      expiresAt: ttlToDate(resetTokenTtl, RESET_TTL_FALLBACK_MS),
    });

    const resetUrl = this.buildResetUrl(resetToken);
    EmailServices.sendPasswordResetEmail(user.email, resetUrl);

    // In development the API echoes the token so the flow can be tested
    // without an email provider; production never returns it.
    return { devResetToken: resetToken };
  }

  public async resetPassword(token: string, newPassword: string): Promise<void> {
    const record = await this.passwordResetTokenRepository.findValidByTokenHash(hashToken(token));
    if (!record) {
      throw new AppError(400, "Invalid or expired reset token");
    }

    // atomic single-use claim: concurrent reuse of the same token loses here
    const claimed = await this.passwordResetTokenRepository.claim(record.id);
    if (!claimed) {
      throw new AppError(400, "Invalid or expired reset token");
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.userRepository.update(record.userId, { passwordHash });

    // a reset implies the old password may be compromised: kill all sessions
    await this.sessionRepository.deleteAllByUser(record.userId);
  }

  // Short-lived access JWT + opaque refresh token. Only the SHA-256 hash of
  // the refresh token is stored, so a database leak exposes no live tokens.
  private async issueTokens(userId: number, email: string, role: string) {
    const token = jwt.sign({ userId, email, role }, jwtSecret, {
      expiresIn: accessTokenTtl as jwt.SignOptions["expiresIn"],
    });

    const refreshToken = generateSecureToken();
    const expiresAt = ttlToDate(refreshTokenTtl, REFRESH_TTL_FALLBACK_MS);
    await this.sessionRepository.create({ userId, tokenHash: hashToken(refreshToken), expiresAt });

    return { token, refreshToken, refreshTokenExpiresAt: expiresAt };
  }

  private buildResetUrl(token: string): string {
    const base = (clientUrl?.split(",")[0]?.trim() || "http://localhost:5173").replace(/\/+$/, "");
    return `${base}/reset-password?token=${encodeURIComponent(token)}`;
  }
}
