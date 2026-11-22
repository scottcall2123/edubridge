import { getTranslations } from "next-intl/server";
import { requireStudent } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Tag } from "@/components/ui";
import { TimetableView } from "@/components/timetable/TimetableView";
import { todayInFergana, weekPlan } from "@/lib/timetable";
import type { Subject } from "@/lib/types";

export async function generateMetadata() {
  return { title: (await getTranslations("timetable"))("title") };
}

export default async function TimetablePage() {
  const { user } = await requireStudent();
  const t = await getTranslations();
  const client = await createClient();
  // The lesson hours are sample data, but the open questions beside them are
  // this student's real ones.
  const [subjects, open] = await Promise.all([
    client.from("subjects").select("id,slug"),
    client
      .from("questions")
      .select("subject_id")
      .eq("user_id", user.id)
      .eq("status", "open"),
  ]);
  const bySlug = new Map(
    ((subjects.data ?? []) as Pick<Subject, "id" | "slug">[]).map((s) => [
      s.id,
      s.slug,
    ]),
  );
  const openQuestions: Record<string, number> = {};
  for (const row of open.data ?? []) {
    const slug = bySlug.get(row.subject_id as string);
    if (slug) openQuestions[slug] = (openQuestions[slug] ?? 0) + 1;
  }

  return (
    <main className="container motion-page space-y-6 py-8">
      <PageHeader
        eyebrow={t("nav.timetable")}
        title={t("timetable.title")}
        subtitle={t("timetable.subtitle")}
        action={<Tag simulated>{t("common.sample")}</Tag>}
      />
      <p className="text-sm text-muted">{t("timetable.sample")}</p>
      <TimetableView
        days={weekPlan()}
        today={todayInFergana()}
        openQuestions={openQuestions}
      />
    </main>
  );
}
