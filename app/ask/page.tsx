import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { getTranslations } from "next-intl/server";
import { requireStudent } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ownedQuestion } from "@/lib/questions";
import { AskWizard } from "@/components/ask/AskWizard";
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
    redirect(`/tutor/${q}${imageError ? "?imageError=1" : ""}`);
  }
  const client = await createClient();
  const [subjects, topics] = await Promise.all([
    client.from("subjects").select("*").order("sort"),
    client.from("topics").select("*").order("sort"),
  ]);
  if (subjects.error || topics.error) throw new Error("Subjects unavailable");
  return (
    <main className="container motion-page py-8">
      <AskWizard
        subjects={subjects.data as Subject[]}
        topics={topics.data as Topic[]}
      />
    </main>
  );
}
