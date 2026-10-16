import { z } from "zod";

const slugRule = z
  .string()
  .trim()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens");

const createCategoryValidator = z.object({
  name: z.string().trim().min(1).max(100),
  slug: slugRule.max(120).optional(), // generated from name if omitted
});

const updateCategoryValidator = createCategoryValidator
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });

export { createCategoryValidator, updateCategoryValidator };