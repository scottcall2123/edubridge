import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { loadLeaderboard } from "@/lib/leaderboard";
import { LeaderboardView } from "@/components/leaderboard/LeaderboardView";
export async function generateMetadata() {
  return { title: (await getTranslations("leaderboard"))("title") };
}
export default async function Leaderboard() {
  const current = await getCurrentUser();
  if (current?.teacher) redirect("/teacher");
  return <LeaderboardView rows={await loadLeaderboard(current?.user.id)} />;
}
