import { z } from "zod";
import { CourseStatusEnum } from "../enums/courseStatusEnum";

const slugRule = z
  .string()
  .trim()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens");

const createCourseValidator = z.object({
  title: z.string().trim().min(1).max(200),
  slug: slugRule.max(220).optional(), // generated from title if omitted
  description: z.string().optional(),
  price: z.number().min(0).max(99999999.99).optional(),
  thumbnailUrl: z.url().nullable().optional(),
  categoryId: z.number().int().positive().nullable().optional(),
});

const updateCourseValidator = createCourseValidator
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });

const courseStatusValidator = z.object({
  status: z.enum(CourseStatusEnum),
});

export { createCourseValidator, updateCourseValidator, courseStatusValidator };