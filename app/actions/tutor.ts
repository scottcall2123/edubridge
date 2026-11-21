"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireStudent } from "@/lib/auth";
import { ownedQuestion } from "@/lib/questions";
import { awardPoints, POINTS } from "@/lib/points";
export async function markSolvedByAI(input: unknown) {
  const { user } = await requireStudent(),
    parsed = z.uuid().safeParse(input);
  if (!parsed.success) return { error: "validation" as const };
  try {
    const question = await ownedQuestion(parsed.data, user.id);
    if (question.status === "open") {
      if (question.understood_count < 1)
        return { error: "validation" as const };
      await awardPoints(
        user.id,
        "ai_understood",
        POINTS.ai_understood,
        question.id,
        { status: "solved_by_ai" },
      );
    }
    revalidatePath("/dashboard");
    return { questionId: question.id };
  } catch {
    return { error: "save" as const };
  }
}
