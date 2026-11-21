import "server-only";
import { z } from "zod";
import type { Content } from "@google/genai";
import type { Question, TutorMessage } from "./types";
import { createAdminClient } from "./supabase/admin";
export interface TutorImage {
  mimeType: "image/png" | "image/jpeg";
  data: string;
}
// The homework photo lives in a private bucket, so the server reads it and
// hands it to Gemini directly; a failed read just means a text-only answer.
export async function loadQuestionImage(
  path: string | null,
): Promise<TutorImage | null> {
  if (!path) return null;
  try {
    const { data, error } = await createAdminClient()
      .storage.from("question-images")
      .download(path);
    if (error || !data) return null;
    return {
      mimeType: path.endsWith(".png") ? "image/png" : "image/jpeg",
      data: Buffer.from(await data.arrayBuffer()).toString("base64"),
    };
  } catch {
    return null;
  }
}
export const tutorInput = z
  .object({
    questionId: z.uuid(),
    requestId: z.uuid().optional(),
    action: z.enum(["start", "reply", "simpler", "understood"]),
    message: z.string().trim().max(1000).optional(),
    locale: z.enum(["uz", "en", "ru"]),
  })
  .superRefine((v, ctx) => {
    if (v.action === "reply" && !v.message)
      ctx.addIssue({
        code: "custom",
        path: ["message"],
        message: "Message required",
      });
  });
export function tutorContents(
  question: Question,
  messages: TutorMessage[],
  subject: string,
  topic: string,
  image: TutorImage | null = null,
): Content[] {
  return [
    {
      role: "user",
      parts: [
        {
          text: `Savol: ${question.text.replace(/\[ACTION:[^\]]*\]/g, "")}\nSubject: ${subject}. Topic: ${topic}.${image ? "\n[The student attached a photo of the homework.]" : ""}`,
        },
        ...(image ? [{ inlineData: image }] : []),
      ],
    },
    ...messages.slice(-12).map((m) => ({
      role: m.role === "ai" ? "model" : "user",
      parts: [
        {
          text:
            m.role === "student"
              ? m.content.replace(/\[ACTION:[^\]]*\]/g, "") +
                (m.kind === "understood" || m.kind === "simpler"
                  ? `\n[ACTION: ${m.kind}]`
                  : "")
              : m.content,
        },
      ],
    })),
  ];
}
