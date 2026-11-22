import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { getLocale, getTranslations } from "next-intl/server";
import { getCurrentUser, requireStudent } from "@/lib/auth";
import { ownedQuestion } from "@/lib/questions";
import { loadTeachers } from "@/lib/teachers";
import { timeFilter } from "@/lib/teacher-time";
import { TeacherList } from "@/components/teachers/TeacherList";
import { TeacherSearch } from "@/components/teachers/TeacherSearch";
import type { Locale } from "@/lib/i18n";
export async function generateMetadata() {
  return { title: (await getTranslations("teachers"))("title") };
}
export default async function Teachers({
  searchParams,
}: {
  searchParams: Promise<{
    subject?: string;
    q?: string;
    when?: string;
    search?: string;
  }>;
}) {
  const params = await searchParams;
  if ((await getCurrentUser())?.teacher) redirect("/teacher");
  if (params.q) {
    if (!z.uuid().safeParse(params.q).success) notFound();
    const { user } = await requireStudent();
    if (!(await ownedQuestion(params.q, user.id).catch(() => null))) notFound();
  }
  const data = await loadTeachers();
  const selected = data.subjects.some((s) => s.slug === params.subject)
    ? params.subject
    : "";
  const locale = (await getLocale()) as Locale;
  const subjectName = data.subjects.find((s) => s.slug === selected)?.[
    `name_${locale}`
  ];
  // Only when the student just escalated from AI Ustoz, never on a filter click.
  // Needs the subject too, since the panel names it.
  const searching =
    params.search === "1" && Boolean(params.q) && Boolean(subjectName);
  return (
    <>
      {searching && <TeacherSearch subject={subjectName!} />}
      <TeacherList
        {...data}
        selected={selected}
        questionId={params.q}
        when={timeFilter(params.when)}
      />
    </>
  );
}
