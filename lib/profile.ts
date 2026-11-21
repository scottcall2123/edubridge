import "server-only";
import { createClient } from "./supabase/server";
import type {
  Profile,
  PointEvent,
  Question,
  Booking,
  TutorMessage,
  Teacher,
  TeacherSlot,
} from "./types";
export type ProfileBooking = Booking & {
  teacher: Pick<Teacher, "full_name" | "is_sample"> | null;
  slot: TeacherSlot | null;
};
export async function loadProfile(userId: string) {
  const client = await createClient();
  async function rows(table: string) {
    const all: unknown[] = [];
    for (let offset = 0; ; offset += 500) {
      const { data, error } = await client
        .from(table)
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .order("id")
        .range(offset, offset + 499);
      if (error) throw new Error("Profile history unavailable");
      all.push(...data);
      if (data.length < 500) return all;
    }
  }
  const [profile, events, questions, bookings, messages] = await Promise.all([
    client.from("profiles").select("*").eq("id", userId).single(),
    rows("point_events"),
    rows("questions"),
    rows("bookings"),
    rows("tutor_messages"),
  ]);
  if (profile.error || !profile.data) throw new Error("Profile unavailable");
  const bs = bookings as Booking[];
  let enriched: ProfileBooking[] = [];
  if (bs.length) {
    const [teachers, slots] = await Promise.all([
      client
        .from("teachers")
        .select("id,full_name,is_sample")
        .in("id", [...new Set(bs.map((b) => b.teacher_id))]),
      client
        .from("teacher_slots")
        .select("*")
        .in(
          "id",
          bs.map((b) => b.slot_id),
        ),
    ]);
    if (teachers.error || slots.error) throw new Error("Bookings unavailable");
    enriched = bs.map((b) => ({
      ...b,
      teacher: teachers.data.find((t) => t.id === b.teacher_id) ?? null,
      slot:
        (slots.data as TeacherSlot[]).find((s) => s.id === b.slot_id) ?? null,
    }));
  }
  return {
    profile: profile.data as Profile,
    events: events as PointEvent[],
    questions: questions as Question[],
    bookings: enriched,
    messages: (messages as TutorMessage[]).reverse(),
  };
}
