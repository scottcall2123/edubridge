"use client";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { login, type AuthState } from "@/app/actions/auth";
import { Button } from "@/components/ui";
export function LoginForm() {
  const t = useTranslations(),
    [state, action, pending] = useActionState<AuthState, FormData>(login, {});
  return (
    <form action={action} className="space-y-3">
      <div>
        <label className="mb-1" htmlFor="email">{t("auth.email")}</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
        />
      </div>
      <div>
        <label className="mb-1" htmlFor="password">{t("auth.password")}</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={200}
        />
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-danger">
          {t(`errors.${state.error}`)}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {t(pending ? "common.loading" : "common.login")}
      </Button>
    </form>
  );
}
