import { z } from "zod";

const titleRule = z.string().trim().min(1).max(200);

export const createSectionValidator = z.object({
  title: titleRule,
  orderIndex: z.number().int().min(0).optional(),
});

export const updateSectionValidator = z
  .object({
    title: titleRule.optional(),
    orderIndex: z.number().int().min(0).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });

export const reorderSectionValidator = z.object({
  orderIndex: z.number().int().min(0),
});
