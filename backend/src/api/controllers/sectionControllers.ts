import { Response } from "express";
import { CustomRequestInterface } from "../../interfaces";
import { SectionServices } from "../../services";
import { parseId } from "../../utils";

const sectionServices = new SectionServices();

export class SectionController {
  static async getSections(req: CustomRequestInterface, res: Response) {
    const courseId = parseId(req.params.courseId);
    if (!courseId) return res.status(400).json({ success: false, message: "Invalid course id" });

    const sections = await sectionServices.getSections(req.user, courseId);
    return res.status(200).json({ success: true, data: sections });
  }

  static async createSection(req: CustomRequestInterface, res: Response) {
    const courseId = parseId(req.params.courseId);
    if (!courseId) return res.status(400).json({ success: false, message: "Invalid course id" });

    const section = await sectionServices.createSection(req.user, courseId, req.body);
    return res.status(201).json({ success: true, message: "Section created", data: section });
  }

  static async updateSection(req: CustomRequestInterface, res: Response) {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid section id" });

    await sectionServices.updateSection(req.user, id, req.body);
    return res.status(200).json({ success: true, message: "Section updated" });
  }

  static async reorderSection(req: CustomRequestInterface, res: Response) {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid section id" });

    await sectionServices.reorderSection(req.user, id, req.body.orderIndex);
    return res.status(200).json({ success: true, message: "Section reordered" });
  }

  static async deleteSection(req: CustomRequestInterface, res: Response) {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid section id" });

    await sectionServices.deleteSection(req.user, id);
    return res.status(200).json({ success: true, message: "Section deleted" });
  }
}
