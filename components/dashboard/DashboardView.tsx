import Link from "next/link";
import {
  Flame,
  Star,
  Target,
  MessageCircleQuestion,
  ArrowRight,
  History,
  BookOpen,
} from "lucide-react";
import { getLocale, getTranslations, getFormatter } from "next-intl/server";
import type { loadDashboard } from "@/lib/dashboard";
import { Card, Tag, Avatar, PageHeader, StatTile } from "@/components/ui";
import { todayInFergana, weekPlan } from "@/lib/timetable";
export async function DashboardView({
  profile,
  recent,
  goalDone,
  leaders,
}: Awaited<ReturnType<typeof loadDashboard>>) {
  const t = await getTranslations(),
    format = await getFormatter(),
    locale = await getLocale(),
    now = new Date();
  const weekday = todayInFergana();
  const today =
    weekPlan().find((day) => day.weekday === weekday)?.lessons ?? [];
  return (
    <main className="container space-y-8 py-8">
      <PageHeader
        eyebrow={t("common.tagline")}
        title={t("dashboard.hello", {
          name: profile.full_name.split(" ")[0],
        })}
        subtitle={t("dashboard.subtitle")}
        action={
          <Link href="/ask" className="button button-primary">
            <MessageCircleQuestion />
            {t("nav.ask")}
          </Link>
        }
      />
      <section className="grid gap-4 sm:grid-cols-3">
        <StatTile
          gold
          icon={<Flame />}
          figure={profile.streak_days}
          label={t("dashboard.streak")}
        >
          <p className="text-sm text-muted">{t("dashboard.streakHint")}</p>
          {profile.is_demo && <Tag>{t("common.sample")}</Tag>}
        </StatTile>
        <StatTile
          gold
          icon={<Star />}
          figure={format.number(profile.points)}
          label={t("dashboard.points")}
        >
          <Link
            href="/profile#points"
            className="inline-flex min-h-11 items-center gap-2 font-bold text-royal"
          >
            <History />
            {t("dashboard.history")}
          </Link>
        </StatTile>
        <StatTile
          icon={<Target />}
          figure={`${goalDone ? 1 : 0}/1`}
          label={t("dashboard.goal")}
        >
          <p className="text-sm text-muted">{t("dashboard.goalText")}</p>
        </StatTile>
      </section>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="section-title">
            <h2>{t("dashboard.activity")}</h2>
          </div>
          {recent.length ? (
            <ul className="divide-y divide-line">
              {recent.map((e) => (
                <li key={e.id} className="flex items-start gap-3 py-4">
                  <Star className={e.points < 0 ? "text-muted" : "text-gold"} />
                  <div className="min-w-0 flex-1 space-y-1">
                    <p>{t(`events.${e.reason}`)}</p>
                    <p className="text-xs text-muted">
                      <time
                        dateTime={e.created_at}
                        title={new Intl.DateTimeFormat(locale, {
                          timeZone: "Asia/Tashkent",
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(e.created_at))}
                      >
                        {format.relativeTime(new Date(e.created_at), now)}
                      </time>
                    </p>
                    {e.is_sample && <Tag>{t("common.sample")}</Tag>}
                  </div>
                  <span className="font-bold">
                    {e.points > 0 ? "+" : ""}
                    {e.points}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">{t("dashboard.noActivity")}</p>
          )}
        </Card>
        <Card>
          <div className="section-title">
            <h2>{t("dashboard.top5")}</h2>
            <Link
              className="inline-flex min-h-11 shrink-0 items-center gap-1 text-sm font-bold text-royal"
              href="/leaderboard"
              aria-label={t("nav.leaderboard")}
            >
              <ArrowRight />
            </Link>
          </div>
          {leaders.length ? (
            <ol className="space-y-4">
              {leaders.map((p, i) => (
                <li
                  key={`${p.full_name}-${i}`}
                  className="flex items-start gap-3"
                >
                  <Avatar name={p.full_name} />
                  <div className="min-w-0">
                    <p className="font-bold">
                      {i + 1}. {p.full_name}
                    </p>
                    <p className="text-xs text-muted">
                      {p.school} · {p.district}
                    </p>
                    <p className="text-sm">
                      {p.points} {t("dashboard.points")}
                    </p>
                    {p.is_sample && <Tag>{t("common.sample")}</Tag>}
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p>{t("dashboard.noLeaders")}</p>
          )}
        </Card>
        <Card className="lg:col-span-2">
          <div className="section-title">
            <h2>{t("timetable.todayLessons")}</h2>
            <Link
              className="inline-flex min-h-11 shrink-0 items-center gap-1 text-sm font-bold text-royal"
              href="/timetable"
            >
              {t("timetable.openTimetable")}
              <ArrowRight />
            </Link>
          </div>
          {today.length ? (
            <ul className="divide-y divide-line">
              {today.map((lesson) => (
                <li
                  key={lesson.order}
                  className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3"
                >
                  <span className="w-28 shrink-0 font-extrabold">
                    {lesson.start}
                    <span className="text-muted"> – {lesson.end}</span>
                  </span>
                  <span className="min-w-0 grow font-bold wrap-anywhere">
                    {lesson.subject[locale as "uz" | "en" | "ru"]}
                  </span>
                  {lesson.subject.slug && (
                    <Link className="button button-secondary" href="/ask">
                      {t("timetable.ask")}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="flex items-start gap-4 text-muted">
              <span className="stat-icon">
                <BookOpen />
              </span>
              {t("timetable.noLessons")}
            </p>
          )}
          <p className="mt-4 text-xs text-muted">{t("timetable.sample")}</p>
        </Card>
        <Card>
          <details>
            <summary className="min-h-11 cursor-pointer font-bold">
              {t("dashboard.rules")}
            </summary>
            <ul className="mt-4 grid gap-3 text-sm text-muted">
              {[
                "daily_visit",
                "question_asked",
                "forum_helped",
                "ai_understood",
                "helper_star",
                "booking_made",
                "streak_loss",
              ].map((r) => (
                <li key={r}>{t(`dashboard.rule_${r}`)}</li>
              ))}
            </ul>
          </details>
        </Card>
      </div>
    </main>
  );
}
