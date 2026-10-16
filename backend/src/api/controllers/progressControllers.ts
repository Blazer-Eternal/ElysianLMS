import { Request, Response } from "express";
import { CustomRequestInterface } from "../../interfaces";
import { ProgressServices } from "../../services";
import { parseId } from "../../utils";

const progressServices = new ProgressServices();

export class ProgressController {
  // POST body { lessonId } — idempotent, safe to retry
  static async markComplete(req: CustomRequestInterface, res: Response) {
    const { lessonId } = req.body;
    const result = await progressServices.markLessonComplete(req.user, lessonId);
    return res.status(result.alreadyCompleted ? 200 : 201).json({ success: true, data: result });
  }

  static async markIncomplete(req: CustomRequestInterface, res: Response) {
    const { lessonId } = req.body;
    await progressServices.markLessonIncomplete(req.user, lessonId);
    return res.status(200).json({ success: true, message: "Lesson marked as incomplete" });
  }

  static async getCourseProgress(req: CustomRequestInterface, res: Response) {
    const courseId = parseId(req.params.courseId);
    if (!courseId) return res.status(400).json({ success: false, message: "Invalid course id" });

    const progress = await progressServices.getCourseProgress(req.user, courseId);
    return res.status(200).json({ success: true, data: progress });
  }
}
