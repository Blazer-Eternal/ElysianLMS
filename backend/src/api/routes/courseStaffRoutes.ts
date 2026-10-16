import { Router } from "express";
import { CourseStaffController } from "../controllers/courseStaffControllers";
import { exceptionHandler, Guard, Validator } from "../../middleware";
import { assignStaffValidator, updateStaffValidator } from "../../validators";

const courseStaffRoutes = Router();

// Staff membership is per-course, so the coarse role guard can't decide here:
// any authenticated user may pass the route, the service verifies
// owner/admin/staff-of-this-course against the course record.
courseStaffRoutes.get(
  "/course/:courseId/staff",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(CourseStaffController.getCourseStaff)
);

courseStaffRoutes.post(
  "/course/:courseId/staff",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(Validator.check(assignStaffValidator)),
  exceptionHandler(CourseStaffController.assignStaff)
);

courseStaffRoutes.patch(
  "/course/:courseId/staff/:userId",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(Validator.check(updateStaffValidator)),
  exceptionHandler(CourseStaffController.updateStaffRole)
);

courseStaffRoutes.delete(
  "/course/:courseId/staff/:userId",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(CourseStaffController.removeStaff)
);

export default courseStaffRoutes;
