import { Request, Response } from "express";
import { CustomRequestInterface } from "../../interfaces";
import { AuthServices } from "../../services";

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
    const { token, user } = await authServices.login(req.body.email, req.body.password);

    return res.status(200).json({
      success: true,
      message: "Login successful!",
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      },
    });
  }

  // Tokens are stateless, so the client just discards its token
  public static async logout(_req: Request, res: Response): Promise<Response> {
    return res.status(200).json({ success: true, message: "Logout successful!" });
  }

  public static async changePassword(req: CustomRequestInterface, res: Response): Promise<Response> {
    const { currentPassword, newPassword } = req.body;
    await authServices.changePassword(req.user.userId, currentPassword, newPassword);

    return res.status(200).json({ success: true, message: "Password changed successfully" });
  }
}