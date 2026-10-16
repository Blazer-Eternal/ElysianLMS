import { Router } from "express";
import { LessonController } from "../controllers/lessonControllers";
import { exceptionHandler, Guard, Validator } from "../../middleware";
import { createLessonValidator, updateLessonValidator, moveLessonValidator, reorderLessonValidator } from "../../validators";

const lessonRoutes = Router();

// Staff membership is per-course: auth at the door, the service decides.
lessonRoutes.get(
  "/section/:sectionId/lessons",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(LessonController.getLessons)
);

lessonRoutes.post(
  "/section/:sectionId/lessons",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(Validator.check(createLessonValidator)),
  exceptionHandler(LessonController.createLesson)
);

// Public for preview lessons, enrolled students get the rest — optionalAuth
lessonRoutes.get("/lesson/:id", exceptionHandler(Guard.optionalAuth), exceptionHandler(LessonController.getLesson));

lessonRoutes.patch(
  "/lesson/:id",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(Validator.check(updateLessonValidator)),
  exceptionHandler(LessonController.updateLesson)
);

lessonRoutes.patch(
  "/lesson/:id/move",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(Validator.check(moveLessonValidator)),
  exceptionHandler(LessonController.moveLesson)
);

lessonRoutes.patch(
  "/lesson/:id/reorder",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(Validator.check(reorderLessonValidator)),
  exceptionHandler(LessonController.reorderLesson)
);

lessonRoutes.delete(
  "/lesson/:id",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(LessonController.deleteLesson)
);

export default lessonRoutes;
