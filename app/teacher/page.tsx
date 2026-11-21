import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { TeacherDashboard } from "@/components/teachers/TeacherDashboard";
import { Spinner } from "@/components/ui";
import { loadTeacherDashboard } from "@/lib/teacher-dashboard";
import { requireTeacher } from "@/lib/auth";

export async function generateMetadata() {
  return { title: (await getTranslations("nav"))("teacherHome") };
}

async function DashboardContent() {
  return <TeacherDashboard {...await loadTeacherDashboard()} />;
}

export default async function TeacherPage() {
  await requireTeacher();
  const t = await getTranslations("common");
  return (
    <main className="container space-y-8 py-8">
      <Suspense fallback={<Spinner label={t("loading")} />}>
        <DashboardContent />
      </Suspense>
    </main>
  );
}
