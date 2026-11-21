import { getTranslations } from "next-intl/server";
import { Spinner } from "@/components/ui";
export default async function Loading() {
  const t = await getTranslations("common");
  return (
    <main className="container py-16">
      <Spinner label={t("loading")} />
    </main>
  );
}
