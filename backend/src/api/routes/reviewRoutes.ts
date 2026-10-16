import { Router } from "express";
import { ReviewController } from "../controllers/reviewControllers";
import { exceptionHandler, Guard, Validator } from "../../middleware";
import { createReviewValidator, updateReviewValidator } from "../../validators";

const reviewRoutes = Router();

// Public: reviews + average rating of a published course
reviewRoutes.get("/course/:courseId/reviews", exceptionHandler(ReviewController.getCourseReviews));

// Enrolled students (enrollment checked in service)
reviewRoutes.post(
  "/review",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(Validator.check(createReviewValidator)),
  exceptionHandler(ReviewController.createReview)
);

// Author or admin (checked in service)
reviewRoutes.patch(
  "/review/:id",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(Validator.check(updateReviewValidator)),
  exceptionHandler(ReviewController.updateReview)
);

reviewRoutes.delete(
  "/review/:id",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(ReviewController.deleteReview)
);

export default reviewRoutes;
