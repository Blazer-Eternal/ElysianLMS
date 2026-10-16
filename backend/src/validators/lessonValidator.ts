import { z } from "zod";
import { VideoProviderEnum } from "../enums/videoProviderEnum";

const titleRule = z.string().trim().min(1).max(200);

// videoProvider and videoRef travel together (mirrors the DB CHECK)
const videoFields = {
  videoProvider: z.enum(VideoProviderEnum).nullable().optional(),
  videoRef: z.string().min(1).nullable().optional(),
};

export const createLessonValidator = z
  .object({
    title: titleRule,
    ...videoFields,
    content: z.string().nullable().optional(),
    isPreview: z.boolean().optional(),
    orderIndex: z.number().int().min(0).optional(),
  })
  .refine((data) => (data.videoProvider === null || data.videoProvider === undefined) === (data.videoRef === null || data.videoRef === undefined), {
    message: "videoProvider and videoRef must be provided together",
  });

export const updateLessonValidator = z
  .object({
    title: titleRule.optional(),
    ...videoFields,
    content: z.string().nullable().optional(),
    isPreview: z.boolean().optional(),
    orderIndex: z.number().int().min(0).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  })
  .refine((data) => {
    // only enforce the pair rule when both sides are actually being set
    const providerTouched = "videoProvider" in data;
    const refTouched = "videoRef" in data;
    if (!providerTouched && !refTouched) return true;
    return (data.videoProvider ?? null) !== null === ((data.videoRef ?? null) !== null);
  }, {
    message: "videoProvider and videoRef must be provided together",
  });

export const moveLessonValidator = z.object({
  sectionId: z.number().int().positive(),
  orderIndex: z.number().int().min(0).optional(),
});

export const reorderLessonValidator = z.object({
  orderIndex: z.number().int().min(0),
});
