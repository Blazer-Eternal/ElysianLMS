import { Router } from "express";
import { UserController } from "../controllers/userControllers";
import { exceptionHandler, Guard, Validator } from "../../middleware";
import { RoleEnum } from "../../enums/roleEnum";
import { assignRoleValidator } from "../../validators";

const userRoutes = Router();

// Admin: view all users
userRoutes.get(
  "/",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(Guard.grantRole(RoleEnum.admin)),
  exceptionHandler(UserController.getAllUsers)
);

// Admin: assign role to a user (e.g. promote to teacher)
userRoutes.patch(
  "/:id/role",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(Guard.grantRole(RoleEnum.admin)),
  exceptionHandler(Validator.check(assignRoleValidator)),
  exceptionHandler(UserController.assignRole)
);

// Admin: delete a user
userRoutes.delete(
  "/:id",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(Guard.grantRole(RoleEnum.admin)),
  exceptionHandler(UserController.deleteUser)
);

export default userRoutes;
