import { getTranslations } from "next-intl/server";
import { requireUser } from "@/lib/auth";
import { Card, Tag } from "@/components/ui";
export async function generateMetadata() {
  const t = await getTranslations("nav");
  return { title: t("home") };
}
export default async function Dashboard() {
  const { profile } = await requireUser(),
    t = await getTranslations();
  return (
    <main className="container space-y-6 py-10">
      <Card className="space-y-4">
        <p className="eyebrow">{t("auth.signedIn")}</p>
        <h1>
          {t("dashboard.hello", {
            name: profile?.full_name.split(" ")[0] ?? "—",
          })}
        </h1>
        {profile?.is_demo && <Tag>{t("common.sample")}</Tag>}
        <p className="text-muted">{t("auth.next")}</p>
      </Card>
    </main>
  );
}
