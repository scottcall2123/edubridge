import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ownedQuestion } from "@/lib/questions";
import { tutorInput, tutorContents, loadQuestionImage } from "@/lib/tutor";
import { generateTutorReply } from "@/lib/gemini";
import type { Subject, Topic, TutorMessage } from "@/lib/types";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!isSupabaseConfigured())
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const client = await createClient(),
    {
      data: { user },
      error: authError,
    } = await client.auth.getUser();
  if (authError || !user)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > 12000)
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const parsed = tutorInput.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  const input = parsed.data,
    question = await ownedQuestion(input.questionId, user.id).catch(() => null);
  if (!question)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const requestId = input.requestId ?? crypto.randomUUID();
  const snapshot = async () => {
    const [q, m] = await Promise.all([
      client
        .from("questions")
        .select("simpler_count,understood_count,status")
        .eq("id", question.id)
        .eq("user_id", user.id)
        .single(),
      client
        .from("tutor_messages")
        .select("*")
        .eq("question_id", question.id)
        .eq("user_id", user.id)
        .order("created_at")
        .order("id"),
    ]);
    if (q.error || m.error) throw new Error("History unavailable");
    return {
      simplerCount: q.data.simpler_count,
      understoodCount: q.data.understood_count,
      showTeacherBanner: q.data.simpler_count >= 2,
      messages: m.data as TutorMessage[],
      status: q.data.status,
    };
  };
  if (!process.env.GEMINI_API_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY)
    return NextResponse.json(
      { error: "busy", ...(await snapshot()) },
      { status: 503 },
    );
  const admin = createAdminClient();
  let reserved = false;
  try {
    const t = await getTranslations({
      locale: input.locale,
      namespace: "tutor",
    });
    const studentContent =
      input.action === "start"
        ? null
        : input.action === "reply"
          ? input.message!
          : t(input.action);
    const reservation = await admin.rpc("reserve_tutor_turn", {
      p_request: requestId,
      p_user: user.id,
      p_question: question.id,
      p_action: input.action,
      p_content: studentContent,
    });
    if (reservation.error) throw new Error("Reservation unavailable");
    const state = reservation.data as { state: string; reply_id?: string };
    if (state.state === "limit")
      return NextResponse.json(
        { error: "limit", ...(await snapshot()) },
        { status: 429 },
      );
    if (state.state === "closed")
      return NextResponse.json(
        { error: "closed", ...(await snapshot()) },
        { status: 409 },
      );
    if (!["reserved", "complete"].includes(state.state))
      return NextResponse.json(
        { error: "busy", ...(await snapshot()) },
        { status: 503 },
      );
    if (state.state === "complete") {
      const saved = await snapshot();
      const reply = saved.messages.find(
        (m) => m.id === state.reply_id,
      )?.content;
      if (!reply) throw new Error("Reply unavailable");
      return NextResponse.json({ reply, ...saved });
    }
    reserved = true;
    const [s, tp, profile, history, image] = await Promise.all([
      client
        .from("subjects")
        .select("*")
        .eq("id", question.subject_id)
        .single(),
      question.topic_id
        ? client.from("topics").select("*").eq("id", question.topic_id).single()
        : Promise.resolve({ data: null, error: null }),
      client.from("profiles").select("grade").eq("id", user.id).single(),
      snapshot(),
      loadQuestionImage(question.image_url),
    ]);
    if (s.error || tp.error || profile.error)
      throw new Error("Context unavailable");
    const subject = (s.data as Subject)[`name_${input.locale}`],
      topic = tp.data ? (tp.data as Topic)[`title_${input.locale}`] : "";
    const reply = await generateTutorReply({
      locale: input.locale,
      subject,
      topic,
      grade: profile.data!.grade,
      contents: tutorContents(
        question,
        history.messages,
        subject,
        topic,
        image,
      ),
    });
    const saved = await admin.rpc("finish_tutor_turn", {
      p_request: requestId,
      p_user: user.id,
      p_reply: reply,
    });
    if (saved.error) throw new Error("Reply could not be saved");
    return NextResponse.json({ reply, ...(await snapshot()) });
  } catch {
    if (reserved)
      await admin.rpc("release_tutor_turn", {
        p_request: requestId,
        p_user: user.id,
      });
    const saved = await snapshot().catch(() => ({}));
    return NextResponse.json({ error: "busy", ...saved }, { status: 503 });
  }
}
