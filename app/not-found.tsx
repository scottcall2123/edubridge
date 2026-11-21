import Link from "next/link";
import { getTranslations } from "next-intl/server";
export default async function NotFound() {
  const t = await getTranslations("common");
  return (
    <main className="container space-y-4 py-12">
      <h1>404</h1>
      <Link href="/" className="button button-primary">
        {t("back")}
      </Link>
    </main>
  );
}
