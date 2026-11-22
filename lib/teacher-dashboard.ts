import "server-only";
import { redirect } from "next/navigation";
import { requireTeacher } from "./auth";
import { validImagePath } from "./image-input";
import { createAdminClient } from "./supabase/admin";
import { ensureFutureSlots } from "./teachers";
import type { Booking, Subject, Topic, TutorMessage } from "./types";

type Preparation = {
  id: string;
  text: string;
  subject: Subject;
  topic: Topic | null;
  owner_id: string;
  image_path: string | null;
  simpler_count: number;
  messages: Pick<TutorMessage, "id" | "role" | "kind" | "content">[];
};

type Dashboard = {
  teacher: {
    id: string;
    full_name: string;
    district: string;
    rating: number;
    is_sample: boolean;
    is_demo: boolean;
  };
  subject: Subject;
  lessons_this_week: number;
  students_helped: number;
  upcoming: {
    id: string;
    starts_at: string;
    status: Booking["status"];
    first_name: string | null;
    grade: number | null;
    school: string | null;
    is_sample: boolean;
    question: Preparation | null;
  }[];
  slots: {
    id: string;
    starts_at: string;
    ends_at: string;
    is_booked: boolean;
  }[];
  forum: { id: string; text: string; is_sample: boolean }[];
};

export async function loadTeacherDashboard() {
  const { user } = await requireTeacher();

  const admin = createAdminClient();
  // The demo lesson is only useful while it is still ahead of us, so move it
  // forward before reading the dashboard. It touches demo rows only.
  // Both are housekeeping: the page still renders if either is not ready yet.
  await Promise.all([
    admin.rpc("refresh_demo_lesson", {}).then(
      () => undefined,
      () => undefined,
    ),
    ensureFutureSlots().catch(() => undefined),
  ]);
  const { data, error } = await admin.rpc("teacher_dashboard", {
    p_user: user.id,
  });
  if (error) throw new Error("Teacher dashboard unavailable");
  if (!data) redirect("/dashboard");

  const raw = data as Dashboard;
  const dashboard: Dashboard = { ...raw, slots: raw.slots ?? [] };
  const upcoming = await Promise.all(
    dashboard.upcoming.map(async (lesson) => {
      if (!lesson.question) return { ...lesson, question: null };
      const { owner_id, image_path, ...question } = lesson.question;
      let imageUrl: string | null = null;
      if (image_path && validImagePath(image_path, owner_id, question.id)) {
        const { data } = await admin.storage
          .from("question-images")
          .createSignedUrl(image_path, 300);
        imageUrl = data?.signedUrl ?? null;
      }
      return {
        ...lesson,
        question: { ...question, imageUrl, hasImage: Boolean(image_path) },
      };
    }),
  );

  return { ...dashboard, upcoming };
}
