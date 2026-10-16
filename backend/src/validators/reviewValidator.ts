import { z } from "zod";

export const createReviewValidator = z.object({
  courseId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).nullable().optional(),
});

export const updateReviewValidator = z
  .object({
    rating: z.number().int().min(1).max(5).optional(),
    comment: z.string().trim().max(2000).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });
