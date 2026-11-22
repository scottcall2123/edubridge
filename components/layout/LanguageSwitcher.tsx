"use client";
import { useOptimistic, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { setLocale } from "@/app/actions/locale";
import { locales } from "@/lib/i18n";
export function LanguageSwitcher() {
  const locale = useLocale(),
    t = useTranslations("common");
  const [pending, start] = useTransition();
  const [error, setError] = useState(false);
  const [selectedLocale, selectLocale] = useOptimistic(locale);
  return (
    <div
      role="group"
      aria-label={t("language")}
      aria-busy={pending}
      className="relative flex rounded-xl border border-white/25 p-1"
    >
      {locales.map((l) => (
        <button
          key={l}
          aria-pressed={l === selectedLocale}
          disabled={pending}
          onClick={() => {
            if (l === locale) return;
            start(async () => {
              selectLocale(l);
              setError(false);
              try {
                // Setting the cookie returns the translated page in this same action.
                await setLocale(l);
              } catch {
                setError(true);
              }
            });
          }}
          className={`min-h-11 min-w-11 rounded-lg text-xs font-bold disabled:cursor-wait ${l === selectedLocale ? "bg-white text-navy" : "text-white hover:bg-white/10"}`}
        >
          {l.toUpperCase()}
        </button>
      ))}
      {pending && (
        <span role="status" className="sr-only">
          {t("loading")}
        </span>
      )}
      {error && (
        <span
          role="alert"
          className="absolute right-0 top-full z-40 mt-2 w-56 rounded-xl bg-surface p-3 text-sm text-danger"
        >
          {t("languageError")}
        </span>
      )}
    </div>
  );
}
