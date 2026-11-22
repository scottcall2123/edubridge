import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { z } from "zod";
import { getLocale, getTranslations } from "next-intl/server";
import { requireStudent } from "@/lib/auth";
import { ownedQuestion } from "@/lib/questions";
import { createClient } from "@/lib/supabase/server";
import { Card, Tag } from "@/components/ui";
import { TutorChat } from "@/components/tutor/TutorChat";
import { QuestionImage } from "@/components/ask/QuestionImage";
import type { Locale } from "@/lib/i18n";
import type { Subject, Topic, TutorMessage } from "@/lib/types";
export async function generateMetadata() {
  return { title: (await getTranslations("tutor"))("title") };
}
export default async function TutorPage({
  params,
}: {
  params: Promise<{ questionId: string }>;
}) {
  const { user } = await requireStudent(),
    { questionId } = await params;
  if (!z.uuid().safeParse(questionId).success) notFound();
  const q = await ownedQuestion(questionId, user.id).catch(() => null);
  if (!q) notFound();
  const client = await createClient(),
    locale = (await getLocale()) as Locale,
    t = await getTranslations();
  const [subject, topic, messages] = await Promise.all([
    client.from("subjects").select("*").eq("id", q.subject_id).single(),
    q.topic_id
      ? client.from("topics").select("*").eq("id", q.topic_id).single()
      : Promise.resolve({ data: null, error: null }),
    client
      .from("tutor_messages")
      .select("*")
      .eq("question_id", q.id)
      .eq("user_id", user.id)
      .order("created_at")
      .order("id"),
  ]);
  if (subject.error || topic.error || messages.error)
    throw new Error("Tutor unavailable");
  const s = subject.data as Subject,
    tp = topic.data as Topic | null;
  return (
    <main className="container motion-page max-w-3xl space-y-6 py-8">
      <Link
        href="/ask"
        className="inline-flex min-h-11 items-center gap-2 font-bold text-accent"
      >
        <ArrowLeft />
        {t("ask.back")}
      </Link>
      <h1>{t("tutor.title")}</h1>
      <Card className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Tag>{s[`name_${locale}`]}</Tag>
          {tp && <Tag>{tp[`title_${locale}`]}</Tag>}
        </div>
        <p className="whitespace-pre-wrap break-words">{q.text}</p>
      </Card>
      <QuestionImage path={q.image_url} userId={user.id} questionId={q.id} />
      <TutorChat
        key={q.id}
        questionId={q.id}
        subjectSlug={s.slug}
        initialMessages={messages.data as TutorMessage[]}
        initialSimpler={q.simpler_count}
        initialUnderstood={q.understood_count}
        open={q.status === "open"}
      />
    </main>
  );
}
