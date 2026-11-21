import "server-only";
import { z } from "zod";
import { createClient } from "./supabase/server";
import type { Question } from "./types";
export async function ownedQuestion(id: string, userId: string) {
  z.uuid().parse(id);
  const client = await createClient();
  const { data, error } = await client
    .from("questions")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();
  if (error || !data) throw new Error("Question unavailable");
  return data as Question;
}
export const questionInput = z.object({
  requestId: z.uuid(),
  subjectId: z.uuid(),
  topicId: z.uuid(),
  text: z.string().trim().min(10).max(1000),
  isPublic:z.boolean().optional().default(false),
});
export interface SimilarQuestion {
  id: string;
  text: string;
  topic: string;
  subject: string;
  steps: string[];
  answerId: string;
  is_sample: boolean;
}
