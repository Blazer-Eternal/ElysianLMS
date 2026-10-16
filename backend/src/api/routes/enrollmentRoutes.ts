import { Router } from "express";
import { EnrollmentController } from "../controllers/enrollmentControllers";
import { exceptionHandler, Guard, Validator } from "../../middleware";
import { RoleEnum } from "../../enums/roleEnum";
import { enrollValidator, grantEnrollmentValidator } from "../../validators";

const enrollmentRoutes = Router();

// Student: my courses
enrollmentRoutes.get(
  "/enrollment/mine",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(EnrollmentController.getMyEnrollments)
);

// Course staff: the roster (service checks per-course permission)
enrollmentRoutes.get(
  "/enrollment/course/:courseId",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(EnrollmentController.getCourseEnrollments)
);

// Any authenticated user: free-course self-enrollment
enrollmentRoutes.post(
  "/enrollment",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(Validator.check(enrollValidator)),
  exceptionHandler(EnrollmentController.enroll)
);

// Admin: comp/scholarship grants
enrollmentRoutes.post(
  "/enrollment/grant",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(Guard.grantRole(RoleEnum.admin)),
  exceptionHandler(Validator.check(grantEnrollmentValidator)),
  exceptionHandler(EnrollmentController.grantEnrollment)
);

// Admin: revoke free enrollments (paid ones must be refunded instead)
enrollmentRoutes.delete(
  "/enrollment/:id",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(Guard.grantRole(RoleEnum.admin)),
  exceptionHandler(EnrollmentController.revokeEnrollment)
);

export default enrollmentRoutes;
