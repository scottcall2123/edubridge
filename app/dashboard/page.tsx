import { getTranslations } from "next-intl/server";
import { requireStudent } from "@/lib/auth";
import { loadDashboard } from "@/lib/dashboard";
import { DashboardView } from "@/components/dashboard/DashboardView";
export async function generateMetadata() {
  return { title: (await getTranslations("nav"))("home") };
}
export default async function Dashboard() {
  const { user } = await requireStudent();
  return <DashboardView {...await loadDashboard(user.id)} />;
}
