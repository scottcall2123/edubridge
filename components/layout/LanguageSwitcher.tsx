"use client";
import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { setLocale } from "@/app/actions/locale";
import { locales } from "@/lib/i18n";
export function LanguageSwitcher() {
  const locale = useLocale(),
    t = useTranslations("common"),
    router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState(false);
  return (
    <div
      role="group"
      aria-label={t("language")}
      className="relative flex rounded-xl border border-white/25 p-1"
    >
      {locales.map((l) => (
        <button
          key={l}
          aria-pressed={l === locale}
          disabled={pending}
          onClick={() =>
            start(async () => {
              setError(false);
              try {
                await setLocale(l);
                router.refresh();
              } catch {
                setError(true);
              }
            })
          }
          className={`min-h-11 min-w-11 rounded-lg text-xs font-bold ${l === locale ? "bg-white text-navy" : "text-white hover:bg-white/10"}`}
        >
          {l.toUpperCase()}
        </button>
      ))}
      {error && (
        <span
          role="alert"
          className="absolute right-0 top-full z-40 mt-2 w-56 rounded-xl bg-white p-3 text-sm text-danger"
        >
          {t("languageError")}
        </span>
      )}
    </div>
  );
}
