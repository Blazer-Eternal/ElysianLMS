import { Router } from "express";
import { CourseController } from "../controllers/courseControllers";
import { exceptionHandler, Guard, Validator } from "../../middleware";
import {
  createCourseValidator,
  updateCourseValidator,
  courseStatusValidator,
} from "../../validators";
import { RoleEnum } from "../../enums/roleEnum";

const courseRoutes = Router();

// Public
courseRoutes.get("/", exceptionHandler(CourseController.getAllCourses));

// Teacher/Admin: my courses (must be declared BEFORE "/:id")
courseRoutes.get(
  "/mine",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(Guard.grantRole(RoleEnum.teacher, RoleEnum.admin)),
  exceptionHandler(CourseController.getMyCourses)
);

// Public
courseRoutes.get("/:id", exceptionHandler(CourseController.getCourseById));

// Teacher/Admin: create
courseRoutes.post(
  "/",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(Guard.grantRole(RoleEnum.teacher, RoleEnum.admin)),
  exceptionHandler(Validator.check(createCourseValidator)),
  exceptionHandler(CourseController.createCourse)
);

// Owner/Admin: update details
courseRoutes.patch(
  "/:id",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(Guard.grantRole(RoleEnum.teacher, RoleEnum.admin)),
  exceptionHandler(Validator.check(updateCourseValidator)),
  exceptionHandler(CourseController.updateCourse)
);

// Owner/Admin: change status
courseRoutes.patch(
  "/:id/status",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(Guard.grantRole(RoleEnum.teacher, RoleEnum.admin)),
  exceptionHandler(Validator.check(courseStatusValidator)),
  exceptionHandler(CourseController.updateCourseStatus)
);

// Owner/Admin: delete
courseRoutes.delete(
  "/:id",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(Guard.grantRole(RoleEnum.teacher, RoleEnum.admin)),
  exceptionHandler(CourseController.deleteCourse)
);

export default courseRoutes;