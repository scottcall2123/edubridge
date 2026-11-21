import "server-only";
import { createAdminClient } from "./supabase/admin";
import type { Profile, PointReason } from "./types";

export const POINTS = {
  daily_visit: 5,
  question_asked: 2,
  forum_helped: 5,
  ai_understood: 10,
  helper_star: 4,
  booking_made: 3,
  streak_loss: -5,
} as const;
export const GOAL_REASONS: PointReason[] = [
  "forum_helped",
  "ai_understood",
  "helper_star",
];
type Progress = Pick<
  Profile,
  "points" | "streak_days" | "last_streak_date" | "last_visit_date"
>;
type Event = { reason: PointReason; points: number };
export function tashkentDay(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tashkent",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
export function dayStart(day = tashkentDay()) {
  return new Date(`${day}T00:00:00+05:00`).toISOString();
}
function daysBetween(a: string, b: string) {
  return Math.round((Date.parse(a) - Date.parse(b)) / 86400000);
}
export function progressOf(p: Progress): Progress {
  return {
    points: p.points,
    streak_days: p.streak_days,
    last_streak_date: p.last_streak_date,
    last_visit_date: p.last_visit_date,
  };
}
export function streakAfter(p: Progress, today: string): Progress {
  if (p.last_streak_date === today) return { ...p };
  return {
    ...p,
    streak_days:
      p.last_streak_date && daysBetween(today, p.last_streak_date) === 1
        ? p.streak_days + 1
        : 1,
    last_streak_date: today,
  };
}
export function dailyProgress(
  p: Progress,
  today: string,
): { next: Progress; events: Event[] } {
  if (p.last_visit_date === today) return { next: p, events: [] };
  const events: Event[] = [
    { reason: "daily_visit", points: POINTS.daily_visit },
  ];
  let next = {
    ...p,
    points: p.points + POINTS.daily_visit,
    last_visit_date: today,
  };
  const gap = p.last_streak_date ? daysBetween(today, p.last_streak_date) : 0;
  if (gap >= 3) {
    const loss = Math.min(50, (gap - 2) * 5);
    events.push({ reason: "streak_loss", points: -loss });
    next = { ...next, points: Math.max(0, next.points - loss), streak_days: 0 };
  }
  return { next, events };
}
type Effect = {
  questionId?: string;
  status?: "solved_by_forum" | "solved_by_ai";
  newQuestion?: { subject_id: string; topic_id: string; text: string;is_public?:boolean };
};
async function commit(
  userId: string,
  transform: (p: Progress) => { next: Progress; events: Event[] },
  effect: Effect = {},
) {
  const admin = createAdminClient();
  for (let attempt = 0; attempt < 8; attempt++) {
    const { data, error } = await admin
      .from("profiles")
      .select("points,streak_days,last_streak_date,last_visit_date")
      .eq("id", userId)
      .single();
    if (error || !data) throw new Error("Progress unavailable");
    const expected = progressOf(data),
      change = transform(expected);
    if (
      !change.events.length &&
      JSON.stringify(expected) === JSON.stringify(change.next)
    )
      return false;
    const result = await admin.rpc("commit_progress", {
      p_user: userId,
      p_expected: expected,
      p_next: change.next,
      p_events: change.events,
      p_question: effect.questionId ?? null,
      p_status: effect.status ?? null,
      p_new_question: effect.newQuestion ?? null,
    });
    if (result.error) throw new Error("Progress could not be saved");
    if (result.data === "conflict") continue;
    return result.data === "applied";
  }
  throw new Error("Progress is busy");
}
export async function onDailyVisit(userId: string) {
  return commit(userId, (p) => dailyProgress(p, tashkentDay()));
}
export async function awardPoints(
  userId: string,
  reason: PointReason,
  points: number,
  questionId?: string,
  effect: Omit<Effect, "questionId"> = {},
) {
  if (
    !Number.isInteger(points) ||
    reason === "streak_loss" ||
    (reason === "helper_star"
      ? points < 4 || points > 20 || points % 4 !== 0
      : points !== POINTS[reason])
  )
    throw new Error("Invalid award");
  return commit(
    userId,
    (p) => {
      let next = { ...p, points: Math.max(0, p.points + points) };
      if (GOAL_REASONS.includes(reason))
        next = streakAfter(next, tashkentDay());
      return { next, events: [{ reason, points }] };
    },
    { questionId, ...effect },
  );
}
export async function touchStreak(userId: string) {
  return commit(userId, (p) => ({
    next: streakAfter(p, tashkentDay()),
    events: [],
  }));
}

export async function rateHelper(ownerId:string,answerId:string,stars:number){
 if(!Number.isInteger(stars)||stars<1||stars>5)throw new Error('Invalid stars');
 const admin=createAdminClient();const {data:answer,error:answerError}=await admin.from('answers').select('author_id,question_id,is_sample').eq('id',answerId).single();if(answerError||!answer?.author_id||answer.author_id===ownerId||answer.is_sample)throw new Error('Invalid answer');
 for(let attempt=0;attempt<8;attempt++){const {data,error}=await admin.from('profiles').select('points,streak_days,last_streak_date,last_visit_date').eq('id',answer.author_id).single();if(error||!data)throw new Error('Helper unavailable');const expected=progressOf(data),points=POINTS.helper_star*stars,next=streakAfter({...expected,points:expected.points+points},tashkentDay());const result=await admin.rpc('rate_forum_answer',{p_answer:answerId,p_owner:ownerId,p_stars:stars,p_expected:expected,p_next:next,p_points:points});if(result.error)throw new Error('Rating unavailable');if(result.data==='conflict')continue;return result.data==='applied';}throw new Error('Rating busy');
}

export async function bookWithPoints(
  userId: string,
  slotId: string,
  questionId?: string,
) {
  const admin = createAdminClient();
  for (let attempt = 0; attempt < 8; attempt++) {
    const { data, error } = await admin
      .from("profiles")
      .select("points,streak_days,last_streak_date,last_visit_date")
      .eq("id", userId)
      .single();
    if (error || !data) throw new Error("Progress unavailable");
    const expected = progressOf(data),
      next = { ...expected, points: expected.points + POINTS.booking_made };
    const result = await admin.rpc("book_slot_with_points", {
      p_slot: slotId,
      p_user: userId,
      p_question: questionId ?? null,
      p_expected: expected,
      p_next: next,
      p_points: POINTS.booking_made,
    });
    if (result.error) {
      if (result.error.message.includes("SLOT_TAKEN"))
        throw new Error("slotTaken");
      if (result.error.message.includes("INVALID_QUESTION"))
        throw new Error("invalidQuestion");
      throw new Error("save");
    }
    if (result.data.state === "conflict") continue;
    return result.data.booking_id as string;
  }
  throw new Error("save");
}
