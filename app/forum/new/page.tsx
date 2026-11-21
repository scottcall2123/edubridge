import { getTranslations } from "next-intl/server";
import { requireStudent } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AskWizard } from "@/components/ask/AskWizard";
import type { Subject, Topic } from "@/lib/types";
export async function generateMetadata() {
  return { title: (await getTranslations("forum"))("newQuestion") };
}
export default async function NewQuestion() {
  await requireStudent();
  const client = await createClient(),
    [s, p] = await Promise.all([
      client.from("subjects").select("*").order("sort"),
      client.from("topics").select("*").order("sort"),
    ]);
  if (s.error || p.error) throw new Error("Subjects unavailable");
  return (
    <main className="container py-8">
      <AskWizard
        publicMode
        subjects={s.data as Subject[]}
        topics={p.data as Topic[]}
      />
    </main>
  );
}
