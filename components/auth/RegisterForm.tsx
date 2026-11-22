"use client";
import { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Button, Tag } from "@/components/ui";
import { DISTRICTS, PARENT_DEMO_CODE } from "@/lib/registration";
import {
  register,
  startParentCheck,
  type RegistrationState,
} from "@/app/actions/register";
export function RegisterForm() {
  const t = useTranslations(),
    locale = useLocale(),
    [state, action, pending] = useActionState<RegistrationState, FormData>(
      register,
      {},
    ),
    [grade, setGrade] = useState(8),
    [phone, setPhone] = useState(""),
    [code, setCode] = useState(""),
    [sent, setSent] = useState(false),
    [parentError, setParentError] = useState(""),
    [sending, start] = useTransition();
  const younger = grade <= 7;
  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="fullName">{t("auth.fullName")}</label>
        <input
          id="fullName"
          name="fullName"
          required
          minLength={2}
          maxLength={100}
          autoComplete="name"
        />
      </div>
      <div>
        <label htmlFor="register-email">{t("auth.email")}</label>
        <input
          id="register-email"
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
        />
      </div>
      <div>
        <label htmlFor="register-password">{t("auth.password")}</label>
        <input
          id="register-password"
          name="password"
          type="password"
          required
          minLength={8}
          maxLength={128}
          autoComplete="new-password"
        />
        <p className="mt-2 text-xs text-muted">{t("auth.passwordHint")}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="grade">{t("auth.grade")}</label>
          <select
            id="grade"
            name="grade"
            value={grade}
            onChange={(e) => {
              setGrade(Number(e.target.value));
              setCode("");
              setSent(false);
            }}
          >
            {[5, 6, 7, 8, 9, 10, 11].map((g) => (
              <option value={g} key={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="locale">{t("profile.language")}</label>
          <select name="locale" id="locale" defaultValue={locale}>
            <option value="uz">UZ</option>
            <option value="en">EN</option>
            <option value="ru">RU</option>
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="school">{t("auth.school")}</label>
        <input
          id="school"
          name="school"
          required
          minLength={2}
          maxLength={100}
        />
      </div>
      <div>
        <label htmlFor="district">{t("auth.district")}</label>
        <select id="district" name="district" required defaultValue="">
          <option value="" disabled>
            {t("auth.chooseDistrict")}
          </option>
          {DISTRICTS.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </div>
      {younger && (
        <section className="space-y-4 rounded-xl bg-sky-50 p-4">
          <Tag simulated>{t("common.simulated")}</Tag>
          <p className="text-sm">{t("auth.parentHint")}</p>
          <div>
            <label htmlFor="parentPhone">{t("auth.parentPhone")}</label>
            <input
              id="parentPhone"
              name="parentPhone"
              type="tel"
              placeholder="+998901234567"
              value={phone}
              required
              onChange={(e) => {
                setPhone(e.target.value);
                setSent(false);
                setCode("");
              }}
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            disabled={sending || pending || !phone}
            onClick={() => {
              setParentError("");
              start(async () => {
                try {
                  const r = await startParentCheck(phone);
                  if (r.error) setParentError(r.error);
                  else setSent(true);
                } catch {
                  setParentError("setup");
                }
              });
            }}
          >
            {t(sending ? "common.loading" : "auth.sendCode")}
          </Button>
          {sent && (
            <>
              <p role="status" className="text-sm font-bold">
                {t("auth.codeShown", { code: PARENT_DEMO_CODE })}
              </p>
              <label htmlFor="parentCode">{t("auth.parentCode")}</label>
              <input
                id="parentCode"
                name="parentCode"
                inputMode="numeric"
                required
                pattern="4821"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={4}
              />
            </>
          )}
          {parentError && (
            <p role="alert" className="text-sm text-danger">
              {t(`auth.parent_${parentError}`)}
            </p>
          )}
        </section>
      )}
      {state.error && (
        <p role="alert" className="text-sm text-danger">
          {t(`auth.register_${state.error}`)}
        </p>
      )}
      <Button
        type="submit"
        className="w-full"
        disabled={
          pending ||
          sending ||
          (younger && (!sent || code !== PARENT_DEMO_CODE))
        }
      >
        {t(pending ? "common.loading" : "common.register")}
      </Button>
      <Link
        className="inline-flex min-h-11 items-center font-bold text-accent"
        href="/login"
      >
        {t("common.login")}
      </Link>
    </form>
  );
}
