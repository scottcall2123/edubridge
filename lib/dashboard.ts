import "server-only";
import { createAdminClient } from "./supabase/admin";
import { createClient } from "./supabase/server";
import { dayStart, GOAL_REASONS, onDailyVisit } from "./points";
import type { PointEvent, Profile } from "./types";
export async function loadDashboard(userId: string) {
  await onDailyVisit(userId);
  const client = await createClient(),
    admin = createAdminClient();
  const [profile, recent, goal, real, samples] = await Promise.all([
    client.from("profiles").select("*").eq("id", userId).single(),
    client
      .from("point_events")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5),
    client
      .from("point_events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .in("reason", GOAL_REASONS)
      .gte("created_at", dayStart()),
    admin
      .from("profiles")
      .select("full_name,school,district,points,is_demo")
      .order("points", { ascending: false })
      .limit(5),
    client
      .from("leaderboard_samples")
      .select("full_name,school,district,points,is_sample")
      .order("points", { ascending: false })
      .limit(5),
  ]);
  if ([profile, recent, goal, real, samples].some((r) => r.error))
    throw new Error("Dashboard unavailable");
  const leaders = [
    ...(real.data ?? []).map((p) => ({ ...p, is_sample: p.is_demo })),
    ...(samples.data ?? []),
  ]
    .sort((a, b) => b.points - a.points)
    .slice(0, 5);
  return {
    profile: profile.data as Profile,
    recent: recent.data as PointEvent[],
    goalDone: (goal.count ?? 0) > 0,
    leaders,
  };
}
