import { z } from "zod";

export const progressLessonValidator = z.object({
  lessonId: z.number().int().positive(),
});
