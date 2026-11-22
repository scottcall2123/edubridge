"use client";
import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { CalendarDays, CircleHelp } from "lucide-react";
import { Card, StatTile, Tag } from "@/components/ui";
import {
  SAMPLE_ATTENDANCE,
  type TimetableDay,
  type SchoolSubject,
} from "@/lib/timetable";
import type { Locale } from "@/lib/i18n";
import { weekdayName } from "@/lib/date-format";

export function TimetableView({
  days,
  today,
  openQuestions,
}: {
  days: TimetableDay[];
  today: number;
  openQuestions: Record<string, number>;
}) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const [active, setActive] = useState(
    days.some((day) => day.weekday === today) ? today : days[0].weekday,
  );
  const day = days.find((d) => d.weekday === active) ?? days[0];

  const studied = new Set<string>();
  for (const d of days) for (const l of d.lessons) studied.add(l.subject.key);
  let attended = 0,
    held = 0;
  for (const key of studied) {
    const row = SAMPLE_ATTENDANCE[key];
    if (!row) continue;
    attended += row[0];
    held += row[1];
  }
  const percent = held ? Math.round((attended / held) * 100) : 0;

  const name = (subject: SchoolSubject) => subject[locale];

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <StatTile
          icon={<CalendarDays aria-hidden="true" />}
          figure={day.lessons.length}
          label={weekdayName(active, locale)}
        />
        <StatTile
          gold
          icon={<CircleHelp aria-hidden="true" />}
          figure={`${percent}%`}
          label={t("timetable.overall")}
        >
          <p className="text-xs text-muted">
            {t("timetable.ofLessons", { attended, held })} ·{" "}
            {t("common.sample")}
          </p>
        </StatTile>
      </div>

      <div
        role="tablist"
        aria-label={t("timetable.title")}
        className="flex flex-wrap gap-2"
      >
        {days.map(({ weekday }) => (
          <button
            key={weekday}
            role="tab"
            aria-selected={weekday === active}
            onClick={() => setActive(weekday)}
            className={`motion-tab min-h-11 rounded-xl border px-4 text-sm font-bold ${
              weekday === active
                ? "border-accent text-white"
                : "border-line text-ink"
            }`}
          >
            {weekdayName(weekday, locale)}
            {weekday === today && (
              <span className="ms-2 text-xs font-semibold opacity-80">
                {t("timetable.today")}
              </span>
            )}
          </button>
        ))}
      </div>

      {day.lessons.length === 0 ? (
        <Card key={active} className="motion-day">{t("timetable.noLessons")}</Card>
      ) : (
        <ol key={active} className="motion-day space-y-3">
          {day.lessons.map((lesson) => {
            const slug = lesson.subject.slug;
            const open = slug ? (openQuestions[slug] ?? 0) : 0;
            return (
              <li
                key={lesson.order}
                className="card flex flex-wrap items-center gap-x-5 gap-y-3"
              >
                <div className="w-28 shrink-0">
                  <p className="font-extrabold">
                    {lesson.start}
                    <span className="text-muted"> – {lesson.end}</span>
                  </p>
                  <p className="text-xs text-muted">
                    {t("timetable.lesson", { order: lesson.order })}
                  </p>
                </div>
                <p className="min-w-0 grow text-lg font-bold wrap-anywhere">
                  {name(lesson.subject)}
                </p>
                {slug && open > 0 && (
                  <Tag>{t("timetable.openQuestions", { count: open })}</Tag>
                )}
                {slug && (
                  <Link className="button button-secondary" href="/ask">
                    {t("timetable.ask")}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      )}

      <section aria-labelledby="attendance" className="space-y-4">
        <h2 id="attendance" className="section-title">
          {t("timetable.attendance")}
          <Tag simulated>{t("common.sample")}</Tag>
        </h2>
        <p className="text-sm text-muted">{t("timetable.attendanceHint")}</p>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...studied].map((key) => {
            const row = SAMPLE_ATTENDANCE[key];
            if (!row) return null;
            const subject = days
              .flatMap((d) => d.lessons)
              .find((l) => l.subject.key === key)!.subject;
            const share = Math.round((row[0] / row[1]) * 100);
            return (
              <li key={key} className="card space-y-2">
                <p className="font-bold wrap-anywhere">{name(subject)}</p>
                <div
                  className="h-2 rounded-full bg-sky-50"
                  role="img"
                  aria-label={`${share}%`}
                >
                  <div
                    className={`motion-bar h-2 rounded-full ${share >= 90 ? "bg-royal" : "bg-gold"}`}
                    style={{ width: `${share}%` }}
                  />
                </div>
                <p className="text-sm text-muted">
                  {t("timetable.ofLessons", {
                    attended: row[0],
                    held: row[1],
                  })}
                </p>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
