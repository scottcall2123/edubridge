import Image from "next/image";
import clsx from "clsx";
import Link from "next/link";
import { CalendarDays, Clock, MapPin, Star, Users } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Avatar, Card, StatTile, Tag } from "@/components/ui";
import type { Locale } from "@/lib/i18n";
import {
  formatDateTime,
  formatDayHeading,
  formatTime,
} from "@/lib/date-format";
import type { loadTeacherDashboard } from "@/lib/teacher-dashboard";

type Dashboard = Awaited<ReturnType<typeof loadTeacherDashboard>>;
type Question = NonNullable<Dashboard["upcoming"][number]["question"]>;

async function QuestionCard({ question }: { question: Question }) {
  const t = await getTranslations();
  const locale = (await getLocale()) as Locale;
  const lastStep = question.messages.findLast(
    (message) => message.role === "ai",
  );
  return (
    <section className="space-y-4 rounded-xl border border-line p-4">
      <h4 className="font-extrabold">{t("teacherDashboard.questionCard")}</h4>
      <div className="flex flex-wrap gap-2">
        <Tag>{question.subject[`name_${locale}`]}</Tag>
        {question.topic && <Tag>{question.topic[`title_${locale}`]}</Tag>}
      </div>
      <p className="whitespace-pre-wrap wrap-anywhere">{question.text}</p>
      {question.imageUrl ? (
        <a
          href={question.imageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-xl"
        >
          <Image
            unoptimized
            src={question.imageUrl}
            width={800}
            height={600}
            className="max-h-80 w-full rounded-xl object-contain"
            referrerPolicy="no-referrer"
            alt={t("ask.imageAlt")}
          />
        </a>
      ) : question.hasImage ? (
        <p className="text-sm text-muted">{t("ask.imageUnavailable")}</p>
      ) : null}
      <div className="space-y-2 rounded-xl bg-sky-50 p-4">
        <p className="font-extrabold">{t("teacherDashboard.struggled")}</p>
        <p className="text-sm text-muted">
          {t("teacherDashboard.simplerCount", {
            count: question.simpler_count,
          })}
        </p>
        {lastStep ? (
          <div className="space-y-1">
            <p className="text-sm font-bold">
              {t("teacherDashboard.lastStep")}
            </p>
            <p className="whitespace-pre-wrap wrap-anywhere">
              {lastStep.content}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted">{t("teacherDashboard.noStep")}</p>
        )}
      </div>
      {question.messages.length > 0 && (
        <details className="rounded-xl border border-line px-4">
          <summary className="min-h-11 cursor-pointer py-3 font-bold text-royal">
            {t("profile.chats")}
          </summary>
          <ol className="space-y-3 pb-4">
            {question.messages.map((message) => (
              <li
                key={message.id}
                className={`space-y-1 rounded-xl p-3 ${message.role === "ai" ? "bg-sky-50" : "bg-paper"}`}
              >
                <p className="text-sm font-bold">
                  {t(
                    message.role === "ai"
                      ? "tutor.title"
                      : "teacherDashboard.student",
                  )}
                </p>
                <p className="whitespace-pre-wrap wrap-anywhere text-sm">
                  {message.content}
                </p>
              </li>
            ))}
          </ol>
        </details>
      )}
    </section>
  );
}

export async function TeacherDashboard({
  teacher,
  subject,
  lessons_this_week,
  students_helped,
  upcoming,
  slots,
  forum,
}: Dashboard) {
  const t = await getTranslations();
  const locale = (await getLocale()) as Locale;

  // The teacher thinks in days, not in a flat list of timestamps.
  const days = new Map<string, Dashboard["slots"]>();
  for (const slot of slots.slice(0, 24)) {
    const key = formatDayHeading(slot.starts_at, locale);
    const day = days.get(key);
    if (day) day.push(slot);
    else days.set(key, [slot]);
  }
  const bookedCount = slots.filter((slot) => slot.is_booked).length;

  return (
    <>
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar name={teacher.full_name} />
          <div className="min-w-0">
            <p className="eyebrow">{t("nav.teacherHome")}</p>
            <h1 className="wrap-anywhere">{teacher.full_name}</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <Tag>{subject[`name_${locale}`]}</Tag>
          <span className="inline-flex items-center gap-1">
            <MapPin aria-hidden="true" />
            {teacher.district}
          </span>
          <span className="inline-flex items-center gap-1">
            <Star aria-hidden="true" className="text-gold" />
            {t("teachers.rating", { rating: teacher.rating })}
          </span>
          {teacher.is_sample && <Tag>{t("common.sample")}</Tag>}
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile
          icon={<CalendarDays aria-hidden="true" />}
          figure={lessons_this_week}
          label={t("teacherDashboard.lessonsThisWeek")}
        />
        <StatTile
          icon={<Users aria-hidden="true" />}
          figure={students_helped}
          label={t("teacherDashboard.studentsHelped")}
        >
          <p className="text-xs text-muted">
            {t("teacherDashboard.helpedHint")}
          </p>
        </StatTile>
        <StatTile
          gold
          icon={<Star aria-hidden="true" />}
          figure={teacher.rating.toFixed(1)}
          label={t("teacherDashboard.rating")}
        >
          {teacher.is_sample && <Tag>{t("common.sample")}</Tag>}
        </StatTile>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <section
          aria-labelledby="upcoming-lessons"
          className="space-y-4 lg:col-span-2"
        >
          <div className="space-y-1">
            <h2 id="upcoming-lessons">{t("teacherDashboard.upcoming")}</h2>
            <p className="text-sm text-muted">{t("teachers.timezone")}</p>
            {teacher.is_demo && (
              <p className="text-sm text-muted">
                {t("teacherDashboard.demoScope")}
              </p>
            )}
          </div>
          {upcoming.length === 0 && (
            <Card>{t("teacherDashboard.noLessons")}</Card>
          )}
          {upcoming.map((lesson) => (
            <Card key={lesson.id} className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <h3 className="wrap-anywhere text-lg font-extrabold">
                    {lesson.first_name || t("teacherDashboard.student")}
                  </h3>
                  <p className="wrap-anywhere text-sm text-muted">
                    {lesson.grade && t("profile.grade", { grade: lesson.grade })}
                    {lesson.grade && lesson.school && " · "}
                    {lesson.school}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Tag>{t(`booking.${lesson.status}`)}</Tag>
                  {lesson.is_sample && <Tag>{t("common.sample")}</Tag>}
                </div>
              </div>
              <p>
                <time dateTime={lesson.starts_at}>
                  {formatDateTime(lesson.starts_at, locale)}
                </time>{" "}
                · {t("booking.duration")}
              </p>
              <p className="text-sm text-muted">{t("booking.meeting")}</p>
              {lesson.question && <QuestionCard question={lesson.question} />}
            </Card>
          ))}
        </section>

        <section aria-labelledby="teacher-schedule" className="space-y-4">
          <div className="space-y-1">
            <h2 id="teacher-schedule">{t("teacherDashboard.schedule")}</h2>
            <p className="text-sm text-muted">
              {t("teacherDashboard.scheduleHint")}
            </p>
          </div>
          <Card className="space-y-4">
            {slots.length === 0 ? (
              <p className="text-sm text-muted">
                {t("teacherDashboard.noSlots")}
              </p>
            ) : (
              <>
                <p className="text-sm font-bold text-muted">
                  {t("teacherDashboard.slotsSummary", {
                    booked: bookedCount,
                    free: slots.length - bookedCount,
                  })}
                </p>
                <ul className="space-y-4">
                  {[...days].map(([label, daySlots]) => (
                    <li key={label} className="space-y-2">
                      <p className="text-sm font-extrabold">{label}</p>
                      <ul className="flex flex-wrap gap-2">
                        {daySlots.map((slot) => (
                          <li
                            key={slot.id}
                            className={clsx(
                              "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-bold",
                              slot.is_booked
                                ? "bg-royal text-white"
                                : "bg-sky-50 text-navy",
                            )}
                          >
                            <Clock aria-hidden="true" className="size-4" />
                            {formatTime(slot.starts_at)}
                            <span className="sr-only">
                              {" "}
                              {t(
                                slot.is_booked
                                  ? "teacherDashboard.booked"
                                  : "teacherDashboard.free",
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
                <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                  <span className="inline-flex items-center gap-1">
                    <span className="size-3 rounded bg-royal" />
                    {t("teacherDashboard.booked")}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="size-3 rounded bg-sky-50" />
                    {t("teacherDashboard.free")}
                  </span>
                </p>
              </>
            )}
          </Card>
        </section>
      </div>

      <section aria-labelledby="teacher-forum" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="teacher-forum">{t("teacherDashboard.forum")}</h2>
          <Link
            className="button button-secondary"
            href={`/forum?subject=${subject.slug}`}
          >
            {t("teacherDashboard.openForum")}
          </Link>
        </div>
        {forum.length === 0 && <Card>{t("teacherDashboard.noForum")}</Card>}
        {forum.length > 0 && (
          <ul className="grid gap-4 md:grid-cols-2">
            {forum.map((question) => (
              <li key={question.id} className="card space-y-2">
                {question.is_sample && <Tag>{t("common.sample")}</Tag>}
                <Link
                  href={`/forum/${question.id}`}
                  className="flex min-h-11 items-center wrap-anywhere font-bold text-royal hover:underline"
                >
                  {question.text}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
