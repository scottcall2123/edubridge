import { NextRequest, NextResponse } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ownedQuestion } from "@/lib/questions";
import { generatePractice, practiceInput, practiceResult, practiceSlotIds } from "@/lib/practice";
import type { Subject, Topic } from "@/lib/types";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: NextRequest) {
  const respond = (error: string, status: number) => NextResponse.json({ error }, { status });
  if (request.headers.get("origin") && request.headers.get("origin") !== request.nextUrl.origin) return respond("forbidden", 403);
  if (!isSupabaseConfigured()) return respond("unauthorized", 401);
  const client = await createClient();
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) return respond("unauthorized", 401);
  let body: unknown;
  try { const text = await request.text(); if (text.length > 2000) return respond("invalid", 400); body = JSON.parse(text); } catch { return respond("invalid", 400); }
  const parsed = practiceInput.safeParse(body);
  if (!parsed.success) return respond("invalid", 400);
  const input = parsed.data;
  const question = await ownedQuestion(input.questionId, user.id).catch(() => null);
  if (!question || question.status !== "solved_by_ai") return respond("forbidden", 403);
  if (!process.env.GEMINI_API_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) return respond("busy", 503);
  const admin = createAdminClient();
  const ids = practiceSlotIds(user.id, question.id);
  let reserved: string | undefined;
  try {
    // Three deterministic primary keys provide a durable per-question ceiling.
    // Metadata/results live only in the server-private reservation, never in chat history.
    for (let attempt = 0; attempt < 4; attempt++) {
      const rows = await admin.from("tutor_turns").select("id,state,student_content").in("id", ids).eq("user_id", user.id).eq("question_id", question.id);
      if (rows.error) throw new Error("Reservations unavailable");
      for (const row of rows.data) {
        const saved = JSON.parse(row.student_content ?? "{}");
        if (saved.requestId === input.requestId) {
          if (saved.locale !== input.locale) return respond("invalid", 400);
          if (row.state === "complete") return NextResponse.json({ ...practiceResult.parse(saved.result), remaining: 3 - rows.data.length });
          return respond("busy", 503);
        }
      }
      const next = ids.find((id) => !rows.data.some((row) => row.id === id));
      if (!next) return respond("limit", 429);
      const insert = await admin.from("tutor_turns").insert({ id: next, user_id: user.id, question_id: question.id, action: "reply", student_content: JSON.stringify({ type: "practice", requestId: input.requestId, locale: input.locale }), state: "pending", expires_at: new Date(Date.now() + 55000).toISOString() });
      if (!insert.error) { reserved = next; break; }
      if (insert.error.code !== "23505") throw new Error("Reservation unavailable");
    }
    if (!reserved) return respond("busy", 503);
    const [s, tp, profile] = await Promise.all([
      client.from("subjects").select("*").eq("id", question.subject_id).single(),
      question.topic_id ? client.from("topics").select("*").eq("id", question.topic_id).single() : Promise.resolve({ data: null, error: null }),
      client.from("profiles").select("grade").eq("id", user.id).single(),
    ]);
    if (s.error || tp.error || profile.error) throw new Error("Context unavailable");
    const result = await generatePractice({ locale: input.locale, question: question.text, subject: (s.data as Subject)[`name_${input.locale}`], topic: tp.data ? (tp.data as Topic)[`title_${input.locale}`] : "", grade: profile.data!.grade });
    const saved = await admin.from("tutor_turns").update({ state: "complete", student_content: JSON.stringify({ type: "practice", requestId: input.requestId, locale: input.locale, result }) }).eq("id", reserved).eq("user_id", user.id).eq("state", "pending");
    if (saved.error) throw new Error("Save unavailable");
    const count = await admin.from("tutor_turns").select("id", { count: "exact", head: true }).in("id", ids);
    return NextResponse.json({ ...result, remaining: 3 - (count.count ?? 3) });
  } catch {
    if (reserved) await admin.from("tutor_turns").update({ state: "failed", expires_at: new Date().toISOString() }).eq("id", reserved).eq("user_id", user.id).eq("state", "pending");
    return respond("busy", 503);
  }
}
