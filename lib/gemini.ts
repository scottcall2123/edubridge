import "server-only";
import { GoogleGenAI, type Content } from "@google/genai";
import { buildTutorPrompt, normalizeTutorReply } from "./tutor-prompt";
import type { Locale } from "./i18n";
export const DEFAULT_GEMINI_MODEL = "gemini-3.1-flash-lite";
// Free-tier capacity moves between models through the day, and judges may test
// at any moment, so the tutor tries several models instead of depending on one.
// Overloaded models refuse in a few seconds, which keeps the whole chain short.
export const FALLBACK_GEMINI_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
] as const;
// The serverless function is cut off at 60s, so stop trying well before that
// and let the page show its "try again" message instead of timing out.
const TOTAL_BUDGET_MS = 46_000;
const ATTEMPT_TIMEOUT_MS = 22_000;
const MIN_ATTEMPT_MS = 8_000;
function isRetryable(error: unknown) {
  const text = error instanceof Error ? error.message : String(error);
  return /\b(400|404|429|500|502|503|504)\b|UNAVAILABLE|RESOURCE_EXHAUSTED|DEADLINE_EXCEEDED|INVALID_ARGUMENT|not found|high demand|overloaded/i.test(
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
  const systemInstruction = buildTutorPrompt(input);
  const deadline = Date.now() + TOTAL_BUDGET_MS;
  let lastError: unknown = new Error("Empty model response");
  for (const model of models) {
    const remaining = deadline - Date.now();
    if (remaining < MIN_ATTEMPT_MS) break;
    try {
      const response = await ai.models.generateContent({
        model,
        contents: input.contents,
        config: {
          systemInstruction,
          temperature: 0.4,
          maxOutputTokens: 300,
          // A step-by-step hint needs no deep reasoning, and skipping it keeps
          // replies fast enough for the serverless time limit.
          thinkingConfig: { thinkingBudget: 0 },
          httpOptions: { timeout: Math.min(ATTEMPT_TIMEOUT_MS, remaining) },
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
