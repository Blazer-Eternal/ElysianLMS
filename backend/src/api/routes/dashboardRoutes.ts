import { Router } from "express";
import { DashboardController } from "../controllers/dashboardControllers";
import { exceptionHandler, Guard } from "../../middleware";
import { RoleEnum } from "../../enums/roleEnum";

const dashboardRoutes = Router();

// Student: rows are keyed to the caller's user_id in the service.
dashboardRoutes.get(
  "/dashboard/student",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(DashboardController.getStudentDashboard)
);

// Teacher: auth at the door — the service scopes to owned + staffed courses,
// so a TA with role=student still gets their courses (same rule as curriculum).
dashboardRoutes.get(
  "/dashboard/teacher",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(DashboardController.getTeacherDashboard)
);

// Admin: platform-wide aggregates, coarse role gate is correct here.
dashboardRoutes.get(
  "/dashboard/admin",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(Guard.grantRole(RoleEnum.admin)),
  exceptionHandler(DashboardController.getAdminDashboard)
);

export default dashboardRoutes;
