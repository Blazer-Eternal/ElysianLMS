import { z } from "zod";

export const enrollValidator = z.object({
  courseId: z.number().int().positive(),
});

export const grantEnrollmentValidator = z.object({
  courseId: z.number().int().positive(),
  userId: z.number().int().positive(),
});
