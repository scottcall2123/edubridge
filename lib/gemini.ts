import "server-only";
import { GoogleGenAI, type Content } from "@google/genai";
import { buildTutorPrompt, normalizeTutorReply } from "./tutor-prompt";
import type { Locale } from "./i18n";
export const DEFAULT_GEMINI_MODEL = "gemini-3.1-flash-lite";
// Judges may test at any moment, so a single overloaded model must not break
// the tutor. Try the configured model first, then widely available fallbacks.
export const FALLBACK_GEMINI_MODELS = ["gemini-3.8-flash"] as const;
function isRetryable(error: unknown) {
  const text = error instanceof Error ? error.message : String(error);
  return /\b(429|500|502|503|504)\b|UNAVAILABLE|RESOURCE_EXHAUSTED|high demand|overloaded/i.test(
    text,
  );
}
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
  const primary = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
  const models = [
    primary,
    ...FALLBACK_GEMINI_MODELS.filter((m) => m !== primary),
  ];
  let lastError: unknown = new Error("Empty model response");
  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: input.contents,
        config: {
          systemInstruction: buildTutorPrompt(input),
          temperature: 0.4,
          maxOutputTokens: 500,
          httpOptions: { timeout: 15000 },
        },
      });
      if (!response.text?.trim()) throw new Error("Empty model response");
      return normalizeTutorReply(response.text, input.locale);
    } catch (error) {
      lastError = error;
      if (!isRetryable(error)) throw error;
    }
  }
  throw lastError;
}
