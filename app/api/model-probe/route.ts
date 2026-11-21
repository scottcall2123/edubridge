import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// TEMPORARY diagnostic route. Delete before submission.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ error: "no key" });
  const ai = new GoogleGenAI({ apiKey: key });
  const results: Record<string, string> = {};
  await Promise.all(
    [
      "gemini-3.1-flash-lite",
      "gemini-3.8-flash",
      "gemini-3.7-flash",
      "gemini-3.6-flash",
      "gemini-3.5-flash",
      "gemini-3.5-flash-lite",
      "gemini-3.1-pro-preview",
    ].map(async (model) => {
      const t0 = Date.now();
      try {
        const res = await ai.models.generateContent({
          model,
          contents: [{ role: "user", parts: [{ text: "Say OK" }] }],
          config: {
            maxOutputTokens: 20,
            httpOptions: { timeout: 20000 },
            thinkingConfig: { thinkingBudget: 0 },
          },
        });
        results[model] = `ok ${Date.now() - t0}ms: ${(res.text ?? "").trim().slice(0, 20)}`;
      } catch (e) {
        results[model] =
          `fail ${Date.now() - t0}ms: ${(e instanceof Error ? e.message : String(e)).slice(0, 90)}`;
      }
    }),
  );
  return NextResponse.json(results);
}
