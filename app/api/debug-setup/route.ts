import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { DEFAULT_GEMINI_MODEL } from "@/lib/gemini";

// TEMPORARY diagnostic route. Delete before submission.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET() {
  const key = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
  const out: Record<string, unknown> = {
    geminiKeyPresent: Boolean(key),
    geminiKeyLength: key ? key.length : 0,
    modelUsed: model,
  };
  if (key) {
    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const res = await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts: [{ text: "Say OK" }] }],
        config: { maxOutputTokens: 20 },
      });
      out.call = `ok: ${res.text?.slice(0, 40)}`;
    } catch (e) {
      out.call = `failed: ${e instanceof Error ? e.message : String(e)}`.slice(
        0,
        500,
      );
    }
    try {
      const r = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models",
        { headers: { "x-goog-api-key": key } },
      );
      const j = (await r.json()) as {
        models?: { name: string; supportedGenerationMethods?: string[] }[];
      };
      out.availableModels = (j.models ?? [])
        .filter((m) => m.supportedGenerationMethods?.includes("generateContent"))
        .map((m) => m.name.replace("models/", ""))
        .slice(0, 40);
    } catch (e) {
      out.availableModels = `failed: ${e instanceof Error ? e.message : String(e)}`;
    }
  }
  return NextResponse.json(out);
}
