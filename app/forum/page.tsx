import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { notFound } from "next/navigation";
import { loadForum } from "@/lib/forum";
import { ForumList } from "@/components/forum/ForumList";
import { SimilarQuestions } from "@/components/ask/SimilarQuestions";
import { getCurrentUser } from "@/lib/auth";
import { ownedQuestion } from "@/lib/questions";
import { createClient } from "@/lib/supabase/server";
import { findSimilar } from "@/app/actions/questions";
export async function generateMetadata() {
  return { title: (await getTranslations("forum"))("title") };
}
export default async function Forum({ searchParams }: {
  searchParams: Promise<{ subject?: string; olympiad?: string; q?: string }>;
}) {
  const { subject, olympiad, q } = await searchParams;
  const [data, current] = await Promise.all([loadForum(subject), getCurrentUser()]);
  const selected = data.subjects.find((s) => s.slug === subject);
  let questionId: string | undefined;
  if (current && !current.teacher) {
    if (q) {
      if (!z.uuid().safeParse(q).success) notFound();
      const question = await ownedQuestion(q, current.user.id).catch(() => null);
      if (!question) notFound();
      if (question.status === "open" && (!selected || selected.id === question.subject_id)) questionId = q;
    } else if (selected) {
      const client = await createClient();
      const latest = await client.from("questions").select("id").eq("user_id", current.user.id).eq("subject_id", selected.id).eq("status", "open").order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (!latest.error) questionId = latest.data?.id;
    }
  }
  const t = await getTranslations();
  const similar = questionId && olympiad !== "1" ? <section className="space-y-4 rounded-2xl border border-line p-4 md:p-6">
    <p className="text-sm text-muted">{t("forum.similarContext")}</p>
    <SimilarQuestions embedded key={questionId} questionId={questionId} questions={await findSimilar(questionId)} />
  </section> : undefined;
  return <ForumList {...data} onlyOlympiad={olympiad === "1"} hideNewQuestion={Boolean(current?.teacher)} selected={selected?.slug ?? ""} similar={similar} />;
}
