import { NextResponse } from "next/server";
import { generateTutorReply, FALLBACK_GEMINI_MODELS } from "@/lib/gemini";

// TEMPORARY diagnostic route. Delete before submission.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET() {
  const started = Date.now();
  const out: Record<string, unknown> = {
    marker: "tutorpath-v4",
    fallbacks: FALLBACK_GEMINI_MODELS,
  };
  try {
    const reply = await generateTutorReply({
      locale: "uz",
      subject: "Algebra",
      topic: "Chiziqli tenglamalar",
      grade: 8,
      contents: [
        {
          role: "user",
          parts: [{ text: "Savol: 5x - 8 = 2x + 7 tenglamani qanday yechaman?" }],
        },
      ],
    });
    out.reply = reply.slice(0, 300);
  } catch (e) {
    out.error = (e instanceof Error ? e.message : String(e)).slice(0, 400);
  }
  out.ms = Date.now() - started;
  return NextResponse.json(out);
}
