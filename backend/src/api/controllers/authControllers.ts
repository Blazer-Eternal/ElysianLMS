import { Request, Response } from "express";
import { CustomRequestInterface } from "../../interfaces";
import { AuthServices } from "../../services";
import { environment } from "../../config";

const authServices = new AuthServices();

export class AuthController {
  public static async signup(req: Request, res: Response): Promise<Response> {
    const user = await authServices.signup(req.body);

    return res.status(201).json({
      success: true,
      message: "Signup successful! You can proceed to login",
      data: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  }

  public static async login(req: Request, res: Response): Promise<Response> {
    const { token, refreshToken, refreshTokenExpiresAt, user } = await authServices.login(
      req.body.email,
      req.body.password
    );

    return res.status(200).json({
      success: true,
      message: "Login successful!",
      data: {
        token,
        refreshToken,
        refreshTokenExpiresAt,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      },
    });
  }

  // Rotates the refresh token: the body's token is consumed and a fresh
  // access + refresh pair comes back.
  public static async refresh(req: Request, res: Response): Promise<Response> {
    const { token, refreshToken, refreshTokenExpiresAt } = await authServices.refresh(
      req.body.refreshToken
    );

    return res.status(200).json({
      success: true,
      message: "Session refreshed!",
      data: { token, refreshToken, refreshTokenExpiresAt },
    });
  }

  public static async logout(req: Request, res: Response): Promise<Response> {
    await authServices.logout(req.body?.refreshToken);

    return res.status(200).json({ success: true, message: "Logout successful!" });
  }

  public static async changePassword(req: CustomRequestInterface, res: Response): Promise<Response> {
    const { currentPassword, newPassword } = req.body;
    await authServices.changePassword(req.user.userId, currentPassword, newPassword);

    return res.status(200).json({ success: true, message: "Password changed successfully" });
  }

  // Identical response for existing and unknown emails — no account
  // enumeration. The development-only echo of the reset token lives in data.
  public static async forgotPassword(req: Request, res: Response): Promise<Response> {
    const { devResetToken } = await authServices.forgotPassword(req.body.email);

    return res.status(200).json({
      success: true,
      message: "If an account with that email exists, a password reset link has been sent",
      data:
        environment === "production" || !devResetToken
          ? undefined
          : { devResetToken, devNotice: "Development only — never returned in production" },
    });
  }

  public static async resetPassword(req: Request, res: Response): Promise<Response> {
    await authServices.resetPassword(req.body.token, req.body.newPassword);

    return res.status(200).json({
      success: true,
      message: "Password has been reset. All sessions were logged out — please sign in again",
    });
  }
}
