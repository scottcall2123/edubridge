import "server-only";
import { createAdminClient } from "./supabase/admin";
import { rankEntries } from "./ranking";
export async function loadLeaderboard(userId?: string) {
  const admin = createAdminClient();
  const [real, sample] = await Promise.all([
    admin
      .from("profiles")
      .select("id,full_name,school,district,points,is_demo")
      .order("points", { ascending: false })
      .order("full_name")
      .limit(100),
    admin
      .from("leaderboard_samples")
      .select("full_name,school,district,points,is_sample")
      .order("points", { ascending: false })
      .limit(100),
  ]);
  if (real.error || sample.error) throw new Error("Leaderboard unavailable");
  return rankEntries([
    ...(real.data ?? []).map((p) => ({
      full_name: p.full_name,
      school: p.school,
      district: p.district,
      points: p.points,
      is_sample: p.is_demo,
      isCurrent: p.id === userId,
    })),
    ...(sample.data ?? []).map((p) => ({ ...p, isCurrent: false })),
  ]);
}
