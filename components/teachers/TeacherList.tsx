import Link from "next/link";
import { Star, MapPin, Clock } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { Avatar, Card, Tag, PageHeader } from "@/components/ui";
import { slotLabel } from "@/lib/booking";
import type { TeacherWithSlots } from "@/lib/teachers";
import type { Subject } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
export async function TeacherList({
  teachers,
  subjects,
  selected = "",
  questionId,
}: {
  teachers: TeacherWithSlots[];
  subjects: Subject[];
  selected?: string;
  questionId?: string;
}) {
  const t = await getTranslations(),
    locale = (await getLocale()) as Locale;
  const href = (slug: string) =>
    `/teachers?${new URLSearchParams({ ...(slug ? { subject: slug } : {}), ...(questionId ? { q: questionId } : {}) })}`;
  const visible = teachers.filter(
    (t) => !selected || t.subject.slug === selected,
  );
  return (
    <main className="container space-y-6 py-8">
      <PageHeader
        title={t("teachers.title")}
        subtitle={t("teachers.freeForStudents")}
      />
      <div className="space-y-2 rounded-xl bg-sky-50 p-4 text-sm">
        <p className="text-muted">{t("teachers.fundingPlan")}</p>
        <p className="text-royal">{t("teachers.notice")}</p>
      </div>
      <nav aria-label={t("ask.chooseSubject")} className="flex flex-wrap gap-2">
        {[
          { slug: "", name: t("teachers.all") },
          ...subjects.map((s) => ({ slug: s.slug, name: s[`name_${locale}`] })),
        ].map((s) => (
          <Link
            key={s.slug}
            href={href(s.slug)}
            aria-current={selected === s.slug ? "page" : undefined}
            className={`button ${selected === s.slug ? "button-primary" : "button-secondary"}`}
          >
            {s.name}
          </Link>
        ))}
      </nav>
      <p className="text-sm text-muted">{t("teachers.timezone")}</p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((teacher) => (
          <Card key={teacher.id} className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Avatar name={teacher.full_name} />
              <div>
                <h2>{teacher.full_name}</h2>
                <p className="text-sm text-muted">
                  {teacher.subject[`name_${locale}`]}
                </p>
              </div>
            </div>
            <p className="flex items-center gap-2 text-sm text-muted">
              <MapPin />
              {teacher.district}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Star className="text-gold" />
              <span
                aria-label={t("teachers.rating", { rating: teacher.rating })}
              >
                {teacher.rating}
              </span>
              {teacher.is_sample && <Tag>{t("common.sample")}</Tag>}
            </div>
            <p className="font-bold">
              {t("teachers.freeSession")}
            </p>
            <div className="flex flex-wrap gap-2">
              {teacher.slots.slice(0, 3).map((slot) => (
                <span key={slot.id} className="rounded-lg bg-paper p-2 text-xs">
                  {slotLabel(slot.starts_at, locale, (key) =>
                    t(`teachers.${key}`),
                  )}
                </span>
              ))}
              {!teacher.slots.length && (
                <p className="text-sm text-muted">
                  <Clock className="mb-2" />
                  {t("teachers.noSlots")}
                </p>
              )}
            </div>
            <Link
              className="button button-primary mt-auto"
              href={`/teachers/${teacher.id}${questionId ? `?q=${questionId}` : ""}`}
            >
              {t("teachers.connect")}
            </Link>
          </Card>
        ))}
      </div>
      {!visible.length && <Card>{t("teachers.empty")}</Card>}
    </main>
  );
}
