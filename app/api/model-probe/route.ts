import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { buildTutorPrompt } from "@/lib/tutor-prompt";

// TEMPORARY diagnostic route. Delete before submission.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ error: "no key" });
  const ai = new GoogleGenAI({ apiKey: key });
  const systemInstruction = buildTutorPrompt({
    locale: "uz",
    subject: "Algebra",
    topic: "Chiziqli tenglamalar",
    grade: 8,
  });
  const results: Record<string, string> = {};
  await Promise.all(
    [
      "gemini-3.5-flash",
      "gemini-3.6-flash",
      "gemini-3.8-flash",
      "gemini-3.7-flash",
      "gemini-3.1-flash-lite",
    ].map(async (model) => {
      const t0 = Date.now();
      try {
        const res = await ai.models.generateContent({
          model,
          contents: [
            {
              role: "user",
              parts: [{ text: "Savol: 7x + 3 = 24 tenglamani qanday yechaman?" }],
            },
          ],
          config: {
            systemInstruction,
            temperature: 0.4,
            maxOutputTokens: 400,
            thinkingConfig: { thinkingBudget: 0 },
            httpOptions: { timeout: 30000 },
          },
        });
        results[model] =
          `ok ${Date.now() - t0}ms len=${(res.text ?? "").length}`;
      } catch (e) {
        results[model] =
          `fail ${Date.now() - t0}ms: ${(e instanceof Error ? e.message : String(e)).slice(0, 80)}`;
      }
    }),
  );
  return NextResponse.json(results);
}
