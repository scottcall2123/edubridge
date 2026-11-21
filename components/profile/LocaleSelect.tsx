"use client";
import { useOptimistic, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { setLocale } from "@/app/actions/locale";
export function LocaleSelect() {
  const locale = useLocale(),
    t = useTranslations(),
    [pending, start] = useTransition(),
    [error, setError] = useState(false);
  const [selectedLocale, selectLocale] = useOptimistic(locale);
  return (
    <div className="max-w-sm space-y-2">
      <label htmlFor="profile-locale">{t("profile.language")}</label>
      <select
        id="profile-locale"
        value={selectedLocale}
        disabled={pending}
        onChange={(e) => {
          const value = e.target.value;
          if (value === locale) return;
          setError(false);
          start(async () => {
            selectLocale(value);
            try {
              // The cookie mutation already refreshes the translated server components.
              await setLocale(value);
            } catch {
              setError(true);
            }
          });
        }}
      >
        <option value="uz">UZ</option>
        <option value="en">EN</option>
        <option value="ru">RU</option>
      </select>
      {pending && (
        <p role="status" className="text-sm text-muted">
          {t("common.loading")}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-danger">
          {t("errors.general")}
        </p>
      )}
    </div>
  );
}
