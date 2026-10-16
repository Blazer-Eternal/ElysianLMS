import { z } from "zod";

const titleRule = z.string().trim().min(1).max(200);

// A quiz question must have 2-8 options and exactly one correct answer.
// The DB backs this with a partial unique index; we fail fast here instead.
const optionSchema = z.object({
  optionText: z.string().trim().min(1).max(500),
  isCorrect: z.boolean().optional(),
});

const optionsRule = z
  .array(optionSchema)
  .min(2, "A question needs at least 2 options")
  .max(8, "A question can have at most 8 options")
  .refine((options) => options.filter((o) => o.isCorrect).length === 1, {
    message: "Exactly one option must be marked as correct",
  });

export const createQuizValidator = z.object({
  lessonId: z.number().int().positive(),
  title: titleRule,
  passScore: z.number().int().min(0).max(100).optional(),
});

export const updateQuizValidator = z
  .object({
    title: titleRule.optional(),
    passScore: z.number().int().min(0).max(100).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });

export const addQuestionValidator = z.object({
  questionText: z.string().trim().min(1).max(2000),
  orderIndex: z.number().int().min(0).optional(),
  options: optionsRule,
});

export const replaceQuestionValidator = z
  .object({
    questionText: z.string().trim().min(1).max(2000).optional(),
    options: optionsRule.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });

export const submitAttemptValidator = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.number().int().positive(),
        optionId: z.number().int().positive().nullable(),
      })
    )
    .min(1),
});
