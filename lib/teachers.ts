import "server-only";
import { createAdminClient } from "./supabase/admin";
import { createClient } from "./supabase/server";
import { slotCandidates } from "./booking";
import type { Teacher, TeacherSlot, Subject, Booking } from "./types";
export type TeacherWithSlots = Teacher & {
  subject: Subject;
  slots: TeacherSlot[];
};
// Topping up slots needs several round trips, so it must not run on every
// page view. Each warm server instance repeats it at most once a minute.
let lastSlotTopUp = 0;
const SLOT_TOP_UP_INTERVAL = 60_000;
export async function ensureFutureSlots(force = false) {
  if (!force && Date.now() - lastSlotTopUp < SLOT_TOP_UP_INTERVAL) return;
  const admin = createAdminClient(),
    now = new Date();
  const [teachers, slots] = await Promise.all([
    admin.from("teachers").select("id"),
    admin.from("teacher_slots").select("*").gt("starts_at", now.toISOString()),
  ]);
  if (teachers.error || slots.error) throw new Error("Slots unavailable");
  const inserts = [];
  for (const teacher of teachers.data) {
    const existing = (slots.data as TeacherSlot[]).filter(
      (s) => s.teacher_id === teacher.id,
    );
    let needed = 3 - existing.filter((s) => !s.is_booked).length;
    for (const start of slotCandidates(now)) {
      if (needed <= 0) break;
      if (
        existing.some(
          (s) => new Date(s.starts_at).getTime() === Date.parse(start),
        )
      )
        continue;
      inserts.push({
        teacher_id: teacher.id,
        starts_at: start,
        ends_at: new Date(Date.parse(start) + 15 * 60000).toISOString(),
      });
      needed--;
    }
  }
  if (inserts.length) {
    const { error } = await admin.from("teacher_slots").upsert(inserts, {
      onConflict: "teacher_id,starts_at",
      ignoreDuplicates: true,
    });
    if (error) throw new Error("Slots unavailable");
  }
  lastSlotTopUp = Date.now();
}
export async function loadTeachers(): Promise<{
  teachers: TeacherWithSlots[];
  subjects: Subject[];
}> {
  const client = await createClient();
  // The top-up runs beside the reads rather than before them, so a visitor
  // waits for the slowest query instead of the sum of all of them.
  const [, teachers, subjects, slots] = await Promise.all([
    ensureFutureSlots(),
    client.from("teachers").select("*").order("rating", { ascending: false }),
    client.from("subjects").select("*").order("sort"),
    client
      .from("teacher_slots")
      .select("*")
      .eq("is_booked", false)
      .gt("starts_at", new Date().toISOString())
      .order("starts_at"),
  ]);
  if (teachers.error || subjects.error || slots.error)
    throw new Error("Teachers unavailable");
  return {
    subjects: subjects.data as Subject[],
    teachers: (teachers.data as Teacher[]).map((t) => ({
      ...t,
      subject: (subjects.data as Subject[]).find((s) => s.id === t.subject_id)!,
      slots: (slots.data as TeacherSlot[]).filter((s) => s.teacher_id === t.id),
    })),
  };
}
export async function ownedBooking(id: string, userId: string) {
  const client = await createClient();
  const { data, error } = await client
    .from("bookings")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();
  if (error || !data) return null;
  return data as Booking;
}
