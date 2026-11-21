import type { Locale } from "./i18n";
export type QuestionStatus =
  "open" | "solved_by_forum" | "solved_by_ai" | "sent_to_teacher";
export type PointReason =
  | "daily_visit"
  | "question_asked"
  | "forum_helped"
  | "ai_understood"
  | "helper_star"
  | "booking_made"
  | "streak_loss";
export interface Profile {
  id: string;
  full_name: string;
  grade: number;
  school: string | null;
  district: string | null;
  locale: Locale;
  points: number;
  streak_days: number;
  last_streak_date: string | null;
  last_visit_date: string | null;
  parent_phone: string | null;
  is_demo: boolean;
  created_at: string;
}
export interface Subject {
  id: string;
  slug: string;
  name_uz: string;
  name_en: string;
  name_ru: string;
  icon: string;
  sort: number;
}
export interface Topic {
  id: string;
  subject_id: string;
  grade: number;
  title_uz: string;
  title_en: string;
  title_ru: string;
  sort: number;
}
export interface Question {
  id: string;
  user_id: string | null;
  subject_id: string;
  topic_id: string | null;
  text: string;
  image_url: string | null;
  status: QuestionStatus;
  simpler_count: number;
  understood_count: number;
  is_public: boolean;
  is_sample: boolean;
  created_at: string;
}
export interface Answer {
  id: string;
  question_id: string;
  author_id: string | null;
  author_name: string;
  steps: string[];
  stars: number | null;
  is_sample: boolean;
  created_at: string;
}
export interface TutorMessage {
  id: string;
  question_id: string;
  user_id: string;
  role: "student" | "ai";
  kind: "text" | "understood" | "simpler";
  content: string;
  created_at: string;
}
export interface Teacher {
  id: string;
  full_name: string;
  initials: string;
  subject_id: string;
  district: string;
  rating: number;
  price_uzs_15min: number; // Legacy sample rate, never a student charge.
  bio_uz: string;
  bio_en: string;
  bio_ru: string;
  offline_center: string;
  is_sample: boolean;
}
export interface TeacherSlot {
  id: string;
  teacher_id: string;
  starts_at: string;
  ends_at: string;
  is_booked: boolean;
}
export interface Booking {
  id: string;
  user_id: string;
  teacher_id: string;
  slot_id: string;
  question_id: string | null;
  status: "confirmed" | "cancelled";
  payment_simulated: boolean; // Legacy MVP metadata; no student payment or teacher payout occurs.
  meeting_link: string | null;
  created_at: string;
}
export interface PointEvent {
  id: string;
  user_id: string;
  reason: PointReason;
  points: number;
  question_id: string | null;
  is_sample: boolean;
  created_at: string;
}
export interface LeaderboardSample {
  id: string;
  full_name: string;
  school: string;
  district: string;
  points: number;
  is_sample: true;
}
export interface Report {
  id: string;
  reporter_id: string;
  target_type: "question" | "answer";
  target_id: string;
  created_at: string;
}
