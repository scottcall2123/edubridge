import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { getTranslations } from "next-intl/server";
import { requireStudent } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ownedQuestion } from "@/lib/questions";
import { findSimilar } from "@/app/actions/questions";
import { AskWizard } from "@/components/ask/AskWizard";
import { SimilarQuestions } from "@/components/ask/SimilarQuestions";
import { PhotoRetry } from "@/components/ask/PhotoRetry";
import { QuestionImage } from "@/components/ask/QuestionImage";
import type { Subject, Topic } from "@/lib/types";
export async function generateMetadata() {
  return { title: (await getTranslations("nav"))("ask") };
}
export default async function Ask({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; imageError?: string }>;
}) {
  const { user } = await requireStudent(),
    { q, imageError } = await searchParams;
  if (q) {
    if (!z.uuid().safeParse(q).success) notFound();
    const question = await ownedQuestion(q, user.id).catch(() => null);
    if (!question) notFound();
    if (
      question.status === "solved_by_forum" ||
      question.status === "solved_by_ai"
    )
      redirect(`/ask/success?q=${q}`);
    return (
      <main className="container max-w-3xl py-8">
        {imageError && !question.image_url && <PhotoRetry questionId={q} />}
        <QuestionImage
          path={question.image_url}
          userId={user.id}
          questionId={q}
        />
        <SimilarQuestions questionId={q} questions={await findSimilar(q)} />
      </main>
    );
  }
  const client = await createClient();
  const [subjects, topics] = await Promise.all([
    client.from("subjects").select("*").order("sort"),
    client.from("topics").select("*").order("sort"),
  ]);
  if (subjects.error || topics.error) throw new Error("Subjects unavailable");
  return (
    <main className="container py-8">
      <AskWizard
        subjects={subjects.data as Subject[]}
        topics={topics.data as Topic[]}
      />
    </main>
  );
}
