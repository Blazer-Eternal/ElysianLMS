import { Request, Response } from "express";
import { CustomRequestInterface } from "../../interfaces";
import { ReviewServices } from "../../services";
import { parseId } from "../../utils";

const reviewServices = new ReviewServices();

export class ReviewController {
  static async getCourseReviews(req: Request, res: Response) {
    const courseId = parseId(req.params.courseId);
    if (!courseId) return res.status(400).json({ success: false, message: "Invalid course id" });

    const { reviews, summary } = await reviewServices.getCourseReviews(courseId);
    return res.status(200).json({ success: true, data: reviews, summary });
  }

  static async createReview(req: CustomRequestInterface, res: Response) {
    const { courseId, rating, comment } = req.body;
    const review = await reviewServices.createReview(req.user, courseId, { rating, comment });
    return res.status(201).json({ success: true, message: "Review submitted", data: review });
  }

  static async updateReview(req: CustomRequestInterface, res: Response) {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid review id" });

    await reviewServices.updateReview(req.user, id, req.body);
    return res.status(200).json({ success: true, message: "Review updated" });
  }

  static async deleteReview(req: CustomRequestInterface, res: Response) {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid review id" });

    await reviewServices.deleteReview(req.user, id);
    return res.status(200).json({ success: true, message: "Review deleted" });
  }
}
