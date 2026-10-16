import { Request, Response } from "express";
import { CustomRequestInterface } from "../../interfaces";
import { CourseServices } from "../../services";
import { parseId } from "../../utils";

const courseServices = new CourseServices();

export class CourseController {
  // Public: published courses, ?category=<id>&page=1&limit=12
  static async getAllCourses(req: Request, res: Response) {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 50);

    let categoryId: number | undefined;
    if (req.query.category !== undefined) {
      const parsed = parseId(req.query.category);
      if (!parsed) return res.status(400).json({ success: false, message: "Invalid category id" });
      categoryId = parsed;
    }

    const { courses, pagination } = await courseServices.getPublishedCourses({ categoryId, page, limit });
    return res.status(200).json({ success: true, data: courses, pagination });
  }

  // Public: one published course
  static async getCourseById(req: Request, res: Response) {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid course id" });

    const course = await courseServices.getPublishedCourse(id);
    return res.status(200).json({ success: true, data: course });
  }

  // Teacher/Admin: my own courses, any status
  static async getMyCourses(req: CustomRequestInterface, res: Response) {
    const courses = await courseServices.getTeacherCourses(req.user.userId);
    return res.status(200).json({ success: true, data: courses });
  }

  // Teacher/Admin: create
  static async createCourse(req: CustomRequestInterface, res: Response) {
    const course = await courseServices.createCourse(req.user.userId, req.body);
    return res.status(201).json({ success: true, message: "Course created", data: course });
  }

  // Owner/Admin: update details
  static async updateCourse(req: CustomRequestInterface, res: Response) {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid course id" });

    const course = await courseServices.updateCourse(req.user, id, req.body);
    return res.status(200).json({ success: true, message: "Course updated", data: course });
  }

  // Owner/Admin: change status
  static async updateCourseStatus(req: CustomRequestInterface, res: Response) {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid course id" });

    const result = await courseServices.updateStatus(req.user, id, req.body.status);
    return res.status(200).json({
      success: true,
      message: `Course status updated to '${result.status}'`,
      data: result,
    });
  }

  // Owner/Admin: delete
  static async deleteCourse(req: CustomRequestInterface, res: Response) {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid course id" });

    await courseServices.deleteCourse(req.user, id);
    return res.status(200).json({ success: true, message: "Course deleted" });
  }
}