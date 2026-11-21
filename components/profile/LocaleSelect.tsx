"use client";
import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { setLocale } from "@/app/actions/locale";
export function LocaleSelect() {
  const locale = useLocale(),
    t = useTranslations(),
    router = useRouter(),
    [pending, start] = useTransition(),
    [error, setError] = useState(false);
  return (
    <div className="max-w-sm space-y-2">
      <label htmlFor="profile-locale">{t("profile.language")}</label>
      <select
        id="profile-locale"
        value={locale}
        disabled={pending}
        onChange={(e) => {
          const value = e.target.value;
          setError(false);
          start(async () => {
            try {
              await setLocale(value);
              router.refresh();
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
