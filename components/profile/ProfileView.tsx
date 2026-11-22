import Link from "next/link";
import { Award, Flame, Star, CheckCircle } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { Card, Avatar, Tag, PageHeader } from "@/components/ui";
import { LocaleSelect } from "./LocaleSelect";
import { earnedBadges } from "@/lib/badges";
import type { loadProfile } from "@/lib/profile";
import type { Locale } from "@/lib/i18n";
import { formatDate, formatDateTime } from "@/lib/date-format";
export async function ProfileView({
  profile,
  events,
  questions,
  bookings,
  messages,
}: Awaited<ReturnType<typeof loadProfile>>) {
  const t = await getTranslations(),
    locale = (await getLocale()) as Locale;
  const date = (value: string) => formatDate(value, locale),
    time = (value: string) => formatDateTime(value, locale);
  const badges = earnedBadges(profile, questions, bookings);
  return (
    <main className="container space-y-8 py-8">
      <PageHeader title={t("profile.title")} />
      <Card className="space-y-5">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar name={profile.full_name} />
          <div className="min-w-0 flex-1">
            <h2>{profile.full_name}</h2>
            <p className="text-sm text-muted">
              {t("profile.grade", { grade: profile.grade })} · {profile.school}{" "}
              · {profile.district}
            </p>
          </div>
          {profile.is_demo && <Tag>{t("common.sample")}</Tag>}
        </div>
        <div className="flex flex-wrap gap-6">
          <p className="flex items-center gap-2 font-bold">
            <Star className="text-gold" />
            {profile.points} {t("dashboard.points")}
          </p>
          <p className="flex items-center gap-2 font-bold">
            <Flame className="text-gold" />
            {profile.streak_days} {t("dashboard.streak")}
          </p>
        </div>
        <p className="text-sm text-muted">
          {t("profile.joined", { date: date(profile.created_at) })}
        </p>
        <ul aria-label={t("profile.badges")} className="flex flex-wrap gap-2">
          {Object.entries(badges).map(([key, earned]) => (
            <li
              key={key}
              className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold ${earned ? "bg-sky-50 text-accent" : "bg-paper text-muted"}`}
            >
              <Award />
              <span>{t(`profile.${key}`)}</span>
              <span className="sr-only">
                {t(earned ? "profile.earned" : "profile.notEarned")}
              </span>
            </li>
          ))}
        </ul>
      </Card>
      <nav aria-label={t("profile.sections")} className="flex flex-wrap gap-2">
        {["points", "questions", "chats", "bookings", "portfolio"].map(
          (key) => (
            <a href={`#${key}`} key={key} className="button button-secondary">
              {t(`profile.${key}`)}
            </a>
          ),
        )}
      </nav>
      <Card id="points" className="scroll-mt-6 space-y-5">
        <h2>{t("profile.points")}</h2>
        {events.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <caption className="sr-only">{t("profile.points")}</caption>
              <thead>
                <tr className="border-b border-line text-muted">
                  <th className="p-3">{t("profile.date")}</th>
                  <th className="p-3">{t("profile.activity")}</th>
                  <th className="p-3 text-right">{t("dashboard.points")}</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id} className="border-b border-line last:border-0">
                    <td className="p-3">
                      <time dateTime={e.created_at}>{date(e.created_at)}</time>
                    </td>
                    <td className="p-3">
                      {t(`events.${e.reason}`)}
                      {e.is_sample && (
                        <span className="ml-2 inline-block">
                          <Tag>{t("common.sample")}</Tag>
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right font-bold">
                      {e.points > 0 ? "+" : ""}
                      {e.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted">{t("dashboard.noActivity")}</p>
        )}
      </Card>
      <Card id="questions" className="scroll-mt-6 space-y-5">
        <h2>{t("profile.questions")}</h2>
        {questions.length ? (
          <ul className="divide-y divide-line">
            {questions.map((q) => (
              <li key={q.id} className="space-y-3 py-4">
                <Link
                  href={`/tutor/${q.id}`}
                  className="inline-flex min-h-11 items-center break-words font-bold text-accent hover:underline"
                >
                  {q.text}
                </Link>
                <div className="flex flex-wrap gap-2">
                  <Tag>{t(`profile.status_${q.status}`)}</Tag>
                  {q.is_sample && <Tag>{t("common.sample")}</Tag>}
                  <time dateTime={q.created_at} className="text-sm text-muted">
                    {date(q.created_at)}
                  </time>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">{t("profile.noQuestions")}</p>
        )}
        <Link href="/ask" className="button button-primary">
          {t("nav.ask")}
        </Link>
      </Card>
      <Card id="chats" className="scroll-mt-6 space-y-5">
        <h2>{t("profile.chats")}</h2>
        {questions
          .filter((q) => messages.some((m) => m.question_id === q.id))
          .map((q) => (
            <details key={q.id} className="rounded-xl border border-line p-4">
              <summary className="min-h-11 cursor-pointer break-words font-bold">
                {q.text}
              </summary>
              <ol className="mt-4 space-y-3">
                {messages
                  .filter((m) => m.question_id === q.id)
                  .map((m) => (
                    <li
                      key={m.id}
                      className={`rounded-xl p-3 ${m.role === "ai" ? "bg-sky-50" : "bg-paper"}`}
                    >
                      <p className="mb-2 text-xs font-bold">
                        {t(m.role === "ai" ? "tutor.title" : "tutor.you")}
                      </p>
                      <p className="whitespace-pre-wrap break-words text-sm">
                        {m.content}
                      </p>
                    </li>
                  ))}
              </ol>
              <Link
                href={`/tutor/${q.id}`}
                className="mt-4 inline-flex min-h-11 items-center font-bold text-accent"
              >
                {t("profile.openChat")}
              </Link>
            </details>
          ))}
        {!messages.length && (
          <p className="text-muted">{t("profile.noChats")}</p>
        )}
      </Card>
      <Card id="bookings" className="scroll-mt-6 space-y-5">
        <h2>{t("profile.bookings")}</h2>
        <p className="text-sm text-muted">{t("teachers.timezone")}</p>
        {bookings.length ? (
          <ul className="grid gap-4 md:grid-cols-2">
            {bookings.map((b) => (
              <li
                key={b.id}
                className="space-y-3 rounded-xl border border-line p-4"
              >
                <h3 className="font-bold">
                  {b.teacher?.full_name ?? t("nav.teachers")}
                </h3>
                {b.slot && (
                  <p>
                    {time(b.slot.starts_at)} · {t("booking.duration")}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Tag>{t(`booking.${b.status}`)}</Tag>
                  {b.teacher?.is_sample && <Tag>{t("common.sample")}</Tag>}
                  <Tag>{t("teachers.freeForStudents")}</Tag>
                </div>
                <p className="text-sm text-muted">{t("booking.meeting")}</p>
                <Link
                  href={`/teachers/${b.teacher_id}?booking=${b.id}`}
                  className="inline-flex min-h-11 items-center gap-2 font-bold text-accent"
                >
                  <CheckCircle />
                  {t("profile.viewBooking")}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <>
            <p className="text-muted">{t("profile.noBookings")}</p>
            <Link href="/teachers" className="button button-secondary">
              {t("nav.teachers")}
            </Link>
          </>
        )}
      </Card>
      <Card id="portfolio" className="scroll-mt-6 space-y-4">
        <h2>{t("profile.portfolio")}</h2>
        <Tag>{t("common.soon")}</Tag>
        <p className="text-muted">{t("profile.portfolioText")}</p>
      </Card>
      <Card>
        <LocaleSelect />
      </Card>
    </main>
  );
}
