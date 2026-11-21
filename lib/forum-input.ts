import { z } from "zod";
export const answerInput = z.object({
  requestId: z.uuid(),
  questionId: z.uuid(),
  steps: z.array(z.string().trim().min(3).max(1000)).min(2).max(20),
});
export const ratingInput = z.object({
  answerId: z.uuid(),
  stars: z.number().int().min(1).max(5),
});
export const reportInput = z.object({
  targetType: z.enum(["question", "answer"]),
  targetId: z.uuid(),
});
