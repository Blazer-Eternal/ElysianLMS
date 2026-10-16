import { Request, Response } from "express";
import { CustomRequestInterface } from "../../interfaces";
import { LessonServices } from "../../services";
import { parseId } from "../../utils";

const lessonServices = new LessonServices();

// Requests carrying an optional token: guard not required, user may be null
type OptionalUserRequest = CustomRequestInterface | Request;

const getUser = (req: OptionalUserRequest) => ("user" in req ? req.user ?? null : null);

export class LessonController {
  static async getLessons(req: CustomRequestInterface, res: Response) {
    const sectionId = parseId(req.params.sectionId);
    if (!sectionId) return res.status(400).json({ success: false, message: "Invalid section id" });

    const lessons = await lessonServices.getLessons(req.user, sectionId);
    return res.status(200).json({ success: true, data: lessons });
  }

  static async createLesson(req: CustomRequestInterface, res: Response) {
    const sectionId = parseId(req.params.sectionId);
    if (!sectionId) return res.status(400).json({ success: false, message: "Invalid section id" });

    const lesson = await lessonServices.createLesson(req.user, sectionId, req.body);
    return res.status(201).json({ success: true, message: "Lesson created", data: lesson });
  }

  static async getLesson(req: Request, res: Response) {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid lesson id" });

    const data = await lessonServices.getLessonForViewing(getUser(req), id);
    return res.status(200).json({ success: true, data });
  }

  static async updateLesson(req: CustomRequestInterface, res: Response) {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid lesson id" });

    await lessonServices.updateLesson(req.user, id, req.body);
    return res.status(200).json({ success: true, message: "Lesson updated" });
  }

  static async moveLesson(req: CustomRequestInterface, res: Response) {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid lesson id" });

    await lessonServices.moveLesson(req.user, id, req.body.sectionId, req.body.orderIndex);
    return res.status(200).json({ success: true, message: "Lesson moved" });
  }

  static async reorderLesson(req: CustomRequestInterface, res: Response) {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid lesson id" });

    await lessonServices.reorderLesson(req.user, id, req.body.orderIndex);
    return res.status(200).json({ success: true, message: "Lesson reordered" });
  }

  static async deleteLesson(req: CustomRequestInterface, res: Response) {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid lesson id" });

    await lessonServices.deleteLesson(req.user, id);
    return res.status(200).json({ success: true, message: "Lesson deleted" });
  }
}
