import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// TEMPORARY diagnostic route. Delete before submission.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET() {
  const key = process.env.GEMINI_API_KEY;
  const out: Record<string, unknown> = { build: "fallback-v2" };
  if (!key) return NextResponse.json({ ...out, error: "no key" });
  const ai = new GoogleGenAI({ apiKey: key });
  const results: Record<string, string> = {};
  for (const model of [
    "gemini-3.1-flash-lite",
    "gemini-3.6-flash",
    "gemini-3.7-flash",
    "gemini-3-flash-preview",
    "gemini-3.1-flash-lite-preview",
    "gemini-3.8-flash",
  ]) {
    try {
      const res = await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts: [{ text: "Say OK" }] }],
        config: { maxOutputTokens: 20, httpOptions: { timeout: 20000 } },
      });
      results[model] = `ok: ${(res.text ?? "").trim().slice(0, 30)}`;
    } catch (e) {
      results[model] = `fail: ${(e instanceof Error ? e.message : String(e)).slice(0, 160)}`;
    }
  }
  out.models = results;
  return NextResponse.json(out);
}
