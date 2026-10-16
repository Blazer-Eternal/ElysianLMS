import { Router } from "express";
import { ProgressController } from "../controllers/progressControllers";
import { exceptionHandler, Guard } from "../../middleware";

const progressRoutes = Router();

// Enrolled students only (enrollment checked in service).
// Body is { lessonId } for both; enrollment state is the guard, not ownership.
progressRoutes.post(
  "/progress/complete",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(ProgressController.markComplete)
);

progressRoutes.post(
  "/progress/incomplete",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(ProgressController.markIncomplete)
);

progressRoutes.get(
  "/progress/course/:courseId",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(ProgressController.getCourseProgress)
);

export default progressRoutes;
