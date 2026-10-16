import { Response } from "express";
import { CustomRequestInterface } from "../../interfaces";
import { CourseStaffServices } from "../../services";
import { parseId } from "../../utils";

const courseStaffServices = new CourseStaffServices();

export class CourseStaffController {
  static async getCourseStaff(req: CustomRequestInterface, res: Response) {
    const courseId = parseId(req.params.courseId);
    if (!courseId) return res.status(400).json({ success: false, message: "Invalid course id" });

    const staff = await courseStaffServices.getCourseStaff(req.user, courseId);
    return res.status(200).json({ success: true, data: staff });
  }

  static async assignStaff(req: CustomRequestInterface, res: Response) {
    const courseId = parseId(req.params.courseId);
    if (!courseId) return res.status(400).json({ success: false, message: "Invalid course id" });

    const membership = await courseStaffServices.assignStaff(req.user, courseId, req.body);
    return res.status(201).json({ success: true, message: "Staff assigned", data: membership });
  }

  static async updateStaffRole(req: CustomRequestInterface, res: Response) {
    const courseId = parseId(req.params.courseId);
    const userId = parseId(req.params.userId);
    if (!courseId || !userId) return res.status(400).json({ success: false, message: "Invalid id" });

    await courseStaffServices.updateStaffRole(req.user, courseId, userId, req.body.staffRole);
    return res.status(200).json({ success: true, message: "Staff role updated" });
  }

  static async removeStaff(req: CustomRequestInterface, res: Response) {
    const courseId = parseId(req.params.courseId);
    const userId = parseId(req.params.userId);
    if (!courseId || !userId) return res.status(400).json({ success: false, message: "Invalid id" });

    await courseStaffServices.removeStaff(req.user, courseId, userId);
    return res.status(200).json({ success: true, message: "Staff removed" });
  }
}
