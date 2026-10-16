import { Request, Response } from "express";
import { CategoryServices } from "../../services";
import { parseId } from "../../utils";

const categoryServices = new CategoryServices();

export class CategoryController {
  static async getAllCategories(_req: Request, res: Response) {
    const categories = await categoryServices.getAll();
    return res.status(200).json({ success: true, data: categories });
  }

  static async getCategoryById(req: Request, res: Response) {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid category id" });

    const category = await categoryServices.getById(id);
    return res.status(200).json({ success: true, data: category });
  }

  static async createCategory(req: Request, res: Response) {
    const category = await categoryServices.create(req.body);
    return res.status(201).json({ success: true, message: "Category created", data: category });
  }

  static async updateCategory(req: Request, res: Response) {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid category id" });

    const category = await categoryServices.update(id, req.body);
    return res.status(200).json({ success: true, message: "Category updated", data: category });
  }

  static async deleteCategory(req: Request, res: Response) {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid category id" });

    await categoryServices.delete(id);
    return res.status(200).json({ success: true, message: "Category deleted" });
  }
}