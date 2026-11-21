"use client";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui";
export default function ErrorPage({ reset }: { reset: () => void }) {
  const t = useTranslations("errors");
  return (
    <main className="container space-y-4 py-12">
      <h1>{t("general")}</h1>
      <Button onClick={reset}>{t("retry")}</Button>
    </main>
  );
}
