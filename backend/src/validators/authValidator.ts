import { z } from "zod";

// role is NOT accepted at signup: everyone registers as a student.
// Admins promote users to teacher/admin separately.
const signupValidator = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.email().max(255),
  password: z.string().min(8).max(72), // 72 = bcrypt's input limit
});

const loginValidator = z.object({
  email: z.email(),
  password: z.string().min(1),
});

const changePasswordValidator = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(72),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from the current password",
    path: ["newPassword"],
  });

const refreshValidator = z.object({
  refreshToken: z.string().min(20).max(512),
});

const logoutValidator = z.object({
  // optional: logging out without a token is a client-side discard
  refreshToken: z.string().min(20).max(512).optional(),
});

const forgotPasswordValidator = z.object({
  email: z.email(),
});

const resetPasswordValidator = z.object({
  token: z.string().min(20).max(512),
  newPassword: z.string().min(8).max(72),
});

export {
  signupValidator,
  loginValidator,
  changePasswordValidator,
  refreshValidator,
  logoutValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
};