import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { getTranslations } from "next-intl/server";
import { requireStudent } from "@/lib/auth";
import { ownedQuestion } from "@/lib/questions";
import { loadTeachers, ownedBooking } from "@/lib/teachers";
import { createClient } from "@/lib/supabase/server";
import { BookingFlow } from "@/components/teachers/BookingFlow";
import type { TeacherSlot } from "@/lib/types";
export async function generateMetadata() {
  return { title: (await getTranslations("teachers"))("title") };
}
export default async function TeacherPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string; booking?: string }>;
}) {
  const { user } = await requireStudent(),
    { id } = await params,
    query = await searchParams;
  if (
    !z.uuid().safeParse(id).success ||
    (query.q && !z.uuid().safeParse(query.q).success) ||
    (query.booking && !z.uuid().safeParse(query.booking).success)
  )
    notFound();
  if (query.q && !(await ownedQuestion(query.q, user.id).catch(() => null)))
    notFound();
  const { teachers } = await loadTeachers(),
    teacher = teachers.find((t) => t.id === id);
  if (!teacher) notFound();
  let confirmation;
  if (query.booking) {
    const booking = await ownedBooking(query.booking, user.id);
    if (!booking || booking.teacher_id !== id) notFound();
    const client = await createClient(),
      { data, error } = await client
        .from("teacher_slots")
        .select("*")
        .eq("id", booking.slot_id)
        .single();
    if (error || !data) notFound();
    confirmation = { booking, slot: data as TeacherSlot };
  }
  const t = await getTranslations();
  return (
    <main className="container motion-page space-y-6 py-8">
      <Link
        className="inline-flex min-h-11 items-center text-accent"
        href={`/teachers?subject=${teacher.subject.slug}${query.q ? `&q=${query.q}` : ""}`}
      >
        {t("teachers.back")}
      </Link>
      <BookingFlow
        key={`${id}-${query.booking ?? "new"}`}
        teacher={teacher}
        questionId={query.q}
        confirmation={confirmation}
        referenceTime={new Date().toISOString()}
      />
    </main>
  );
}
