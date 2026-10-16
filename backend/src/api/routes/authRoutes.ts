import { Router } from "express";
import { exceptionHandler, Guard, Validator } from "../../middleware";
import { signupValidator, loginValidator, changePasswordValidator } from "../../validators";
import { AuthController } from "../controllers/authControllers";

const authRoutes = Router();

authRoutes.post("/signup", exceptionHandler(Validator.check(signupValidator)), exceptionHandler(AuthController.signup));
authRoutes.post("/login", exceptionHandler(Validator.check(loginValidator)), exceptionHandler(AuthController.login));
authRoutes.post("/logout", exceptionHandler(AuthController.logout));

authRoutes.patch(
  "/change-password",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(Validator.check(changePasswordValidator)),
  exceptionHandler(AuthController.changePassword)
);

export default authRoutes;