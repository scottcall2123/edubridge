import "server-only";
import { z } from "zod";
import type { Content } from "@google/genai";
import type { Question, TutorMessage } from "./types";
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
): Content[] {
  return [
    {
      role: "user",
      parts: [
        {
          text: `Savol: ${question.text.replace(/\[ACTION:[^\]]*\]/g, "")}\nSubject: ${subject}. Topic: ${topic}.`,
        },
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
