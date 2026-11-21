import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "./ui";
export async function ComingSoon() {
  const t = await getTranslations();
  return (
    <main className="container py-12">
      <EmptyState title={t("common.soon")}>
        <p className="text-muted">{t("auth.next")}</p>
        <Link className="button button-primary" href="/">
          {t("common.back")}
        </Link>
      </EmptyState>
    </main>
  );
}
