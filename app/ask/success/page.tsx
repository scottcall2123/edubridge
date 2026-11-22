import { PracticeProblems } from "@/components/practice/PracticeProblems";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { getLocale, getTranslations } from "next-intl/server";
import { requireStudent } from "@/lib/auth";
import { ownedQuestion } from "@/lib/questions";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui";
export async function generateMetadata() {
  return { title: (await getTranslations("ask"))("saved") };
}
export default async function Success({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { user } = await requireStudent(),
    { q } = await searchParams;
  if (!z.uuid().safeParse(q).success) notFound();
  const question = await ownedQuestion(q!, user.id).catch(() => null);
  if (!question) notFound();
  if (!["solved_by_forum", "solved_by_ai"].includes(question.status))
    redirect(`/ask?q=${q}`);
  const client = await createClient(),
    reason =
      question.status === "solved_by_ai" ? "ai_understood" : "forum_helped";
  const { data, error } = await client
    .from("point_events")
    .select("points")
    .eq("user_id", user.id)
    .eq("question_id", q!)
    .eq("reason", reason)
    .maybeSingle();
  if (error) throw new Error("Result unavailable");
  const t = await getTranslations();
  return (
    <main className="container motion-page py-12">
      <Card className="mx-auto max-w-lg space-y-6 text-center">
        <Image
          src="/brand/edubridge-seal.svg"
          width={128}
          height={128}
          className="mx-auto"
          alt="EduBridge"
        />
        <h1 className="earned-points">
          {data ? t("success.points", { n: data.points }) : t("ask.saved")}
        </h1>
        <p className="text-muted">{t("ask.savedText")}</p>
        <p className="rounded-xl bg-sky-50 p-4 text-sm">{question.text}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/ask" className="button button-primary">
            {t("ask.again")}
          </Link>
          <Link href="/profile" className="button button-secondary">
            {t("ask.toProfile")}
          </Link>
        </div>
      </Card>
      {question.status === "solved_by_ai" && <PracticeProblems key={`${question.id}-${await getLocale()}`} questionId={question.id} />}
    </main>
  );
}
