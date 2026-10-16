import { Request, Response } from "express";
import { UserServices } from "../../services";
import { parseId } from "../../utils";

const userServices = new UserServices();

export class UserController {
  // Admin: get all users
  static async getAllUsers(_req: Request, res: Response) {
    const users = await userServices.getAllUsers();
    return res.status(200).json({ success: true, data: users });
  }

  // Admin: assign role to a user
  static async assignRole(req: Request, res: Response) {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid user id" });

    const { role } = req.body;
    await userServices.assignRole(id, role);

    return res.status(200).json({
      success: true,
      message: `Role updated to '${role}' successfully`,
      data: { id, role },
    });
  }

  // Admin: delete a user
  static async deleteUser(req: Request, res: Response) {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid user id" });

    await userServices.deleteUser(id);
    return res.status(200).json({ success: true, message: "User deleted successfully" });
  }
}