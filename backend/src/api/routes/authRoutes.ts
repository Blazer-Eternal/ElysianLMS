import { Router } from "express";
import {
  authLimiter,
  exceptionHandler,
  Guard,
  loginLimiter,
  sensitiveLimiter,
  Validator,
} from "../../middleware";
import {
  signupValidator,
  loginValidator,
  changePasswordValidator,
  refreshValidator,
  logoutValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} from "../../validators";
import { AuthController } from "../controllers/authControllers";

const authRoutes = Router();

authRoutes.post(
  "/signup",
  authLimiter,
  exceptionHandler(Validator.check(signupValidator)),
  exceptionHandler(AuthController.signup)
);

authRoutes.post(
  "/login",
  loginLimiter,
  exceptionHandler(Validator.check(loginValidator)),
  exceptionHandler(AuthController.login)
);

authRoutes.post(
  "/refresh",
  authLimiter,
  exceptionHandler(Validator.check(refreshValidator)),
  exceptionHandler(AuthController.refresh)
);

authRoutes.post(
  "/logout",
  exceptionHandler(Validator.check(logoutValidator)),
  exceptionHandler(AuthController.logout)
);

// Password reset endpoints are the most abuse-prone: strict limiter, and
// forgot-password reveals nothing about account existence either way.
authRoutes.post(
  "/forgot-password",
  sensitiveLimiter,
  exceptionHandler(Validator.check(forgotPasswordValidator)),
  exceptionHandler(AuthController.forgotPassword)
);

authRoutes.post(
  "/reset-password",
  sensitiveLimiter,
  exceptionHandler(Validator.check(resetPasswordValidator)),
  exceptionHandler(AuthController.resetPassword)
);

authRoutes.patch(
  "/change-password",
  exceptionHandler(Guard.grantAccess),
  loginLimiter,
  exceptionHandler(Validator.check(changePasswordValidator)),
  exceptionHandler(AuthController.changePassword)
);

export default authRoutes;
