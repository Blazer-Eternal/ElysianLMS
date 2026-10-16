import { Router } from "express";
import { SectionController } from "../controllers/sectionControllers";
import { exceptionHandler, Guard, Validator } from "../../middleware";
import { createSectionValidator, updateSectionValidator, reorderSectionValidator } from "../../validators";

const sectionRoutes = Router();

// Staff membership is per-course: auth at the door, the service decides
// whether this user may touch this course's curriculum.
sectionRoutes.get(
  "/course/:courseId/sections",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(SectionController.getSections)
);

sectionRoutes.post(
  "/course/:courseId/sections",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(Validator.check(createSectionValidator)),
  exceptionHandler(SectionController.createSection)
);

sectionRoutes.patch(
  "/section/:id",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(Validator.check(updateSectionValidator)),
  exceptionHandler(SectionController.updateSection)
);

sectionRoutes.patch(
  "/section/:id/reorder",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(Validator.check(reorderSectionValidator)),
  exceptionHandler(SectionController.reorderSection)
);

sectionRoutes.delete(
  "/section/:id",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(SectionController.deleteSection)
);

export default sectionRoutes;
