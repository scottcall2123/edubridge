import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { getTranslations } from "next-intl/server";
import { getCurrentUser, requireStudent } from "@/lib/auth";
import { ownedQuestion } from "@/lib/questions";
import { loadTeachers } from "@/lib/teachers";
import { TeacherList } from "@/components/teachers/TeacherList";
export async function generateMetadata() {
  return { title: (await getTranslations("teachers"))("title") };
}
export default async function Teachers({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string; q?: string }>;
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
  return <TeacherList {...data} selected={selected} questionId={params.q} />;
}
