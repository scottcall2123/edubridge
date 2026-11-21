import "server-only";
import { GoogleGenAI, type Content } from "@google/genai";
import { buildTutorPrompt, normalizeTutorReply } from "./tutor-prompt";
import type { Locale } from "./i18n";
export const DEFAULT_GEMINI_MODEL = "gemini-3.1-flash-lite";
// Judges may test at any moment, so one overloaded model must not break the
// tutor. Try the configured model first, then a widely available fallback.
export const FALLBACK_GEMINI_MODELS = ["gemini-3.8-flash"] as const;
function isRetryable(error: unknown) {
  const text = error instanceof Error ? error.message : String(error);
  return /\b(429|500|502|503|504)\b|UNAVAILABLE|RESOURCE_EXHAUSTED|DEADLINE_EXCEEDED|high demand|overloaded/i.test(
    text,
  );
}
function rejectsThinkingConfig(error: unknown) {
  const text = error instanceof Error ? error.message : String(error);
  return /thinking|INVALID_ARGUMENT|\b400\b/i.test(text);
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
  const systemInstruction = buildTutorPrompt(input);
  let lastError: unknown = new Error("Empty model response");
  for (const [index, model] of models.entries()) {
    // A step-by-step hint needs no deep reasoning; skipping it keeps replies
    // fast enough for the serverless time limit. Some models reject the
    // option, so fall back to a plain request for the same model.
    for (const think of [false, true]) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: input.contents,
          config: {
            systemInstruction,
            temperature: 0.4,
            maxOutputTokens: 400,
            httpOptions: { timeout: index === 0 ? 32000 : 18000 },
            ...(think ? {} : { thinkingConfig: { thinkingBudget: 0 } }),
          },
        });
        if (!response.text?.trim()) throw new Error("Empty model response");
        return normalizeTutorReply(response.text, input.locale);
      } catch (error) {
        lastError = error;
        if (!think && rejectsThinkingConfig(error)) continue;
        break;
      }
    }
    if (!isRetryable(lastError)) throw lastError;
  }
  throw lastError;
}
