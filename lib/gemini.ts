import "server-only";
import { GoogleGenAI, type Content } from "@google/genai";
import { buildTutorPrompt, normalizeTutorReply } from "./tutor-prompt";
import type { Locale } from "./i18n";
export const DEFAULT_GEMINI_MODEL = "gemini-3.8-flash";
export async function generateTutorReply(input: {
  locale: Locale;
  subject: string;
  topic: string;
  grade: number;
  contents: Content[];
}) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("AI not configured");
  const ai = new GoogleGenAI({ apiKey: key });
  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL,
    contents: input.contents,
    config: {
      systemInstruction: buildTutorPrompt(input),
      temperature: 0.4,
      maxOutputTokens: 500,
      httpOptions: { timeout: 40000 },
    },
  });
  if (!response.text?.trim()) throw new Error("Empty model response");
  return normalizeTutorReply(response.text, input.locale);
}
