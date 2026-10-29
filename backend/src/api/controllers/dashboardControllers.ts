import { Response } from "express";
import { CustomRequestInterface } from "../../interfaces";
import { DashboardServices } from "../../services";

const dashboardServices = new DashboardServices();

// Read-only aggregates — no bodies, no params; every scope decision lives in
// the service (identity for student/teacher, role gate at the route for admin).
export class DashboardController {
  static async getStudentDashboard(req: CustomRequestInterface, res: Response) {
    const data = await dashboardServices.getStudentDashboard(req.user);
    return res.status(200).json({ success: true, data });
  }

  static async getTeacherDashboard(req: CustomRequestInterface, res: Response) {
    const data = await dashboardServices.getTeacherDashboard(req.user);
    return res.status(200).json({ success: true, data });
  }

  static async getAdminDashboard(req: CustomRequestInterface, res: Response) {
    const data = await dashboardServices.getAdminDashboard();
    return res.status(200).json({ success: true, data });
  }
}



