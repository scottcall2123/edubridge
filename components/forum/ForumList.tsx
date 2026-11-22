import { hasSampleOlympiadAnswer } from "@/lib/forum-samples";
import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { Card, Tag, PageHeader } from "@/components/ui";
import type { loadForum } from "@/lib/forum";
import type { Locale } from "@/lib/i18n";
export async function ForumList({
  questions,
  subjects,
  topics,
  selected = "",
  onlyOlympiad = false,
  hideNewQuestion = false,
}: Awaited<ReturnType<typeof loadForum>> & {
  selected?: string;
  onlyOlympiad?: boolean;
  hideNewQuestion?: boolean;
}) {
  const t = await getTranslations(),
    locale = (await getLocale()) as Locale;
  const rows = questions.filter(
    (q) =>
      (!selected || subjects.find((s) => s.id === q.subject_id)?.slug === selected) &&
      (!onlyOlympiad || hasSampleOlympiadAnswer(q)),
  );
  return (
    <main className="container motion-page space-y-6 py-8">
      <PageHeader
        title={t("forum.title")}
        action={
          hideNewQuestion ? undefined : (
            <Link href="/forum/new" className="button button-primary">
              {t("forum.newQuestion")}
            </Link>
          )
        }
      />
      <nav aria-label={t("ask.chooseSubject")} className="flex flex-wrap gap-2">
        {[
          { slug: "", label: t("teachers.all") },
          ...subjects.map((s) => ({
            slug: s.slug,
            label: s[`name_${locale}`],
          })),
        ].map((s) => (
          <Link
            href={`/forum?${new URLSearchParams({ ...(s.slug ? { subject: s.slug } : {}), ...(onlyOlympiad ? { olympiad: "1" } : {}) })}`}
            key={s.slug}
            className={`button ${selected === s.slug ? "button-primary" : "button-secondary"}`}
            aria-current={selected === s.slug ? "page" : undefined}
          >
            {s.label}
          </Link>
        ))}
      </nav>
      <Link className={`button ${onlyOlympiad ? "button-gold" : "button-secondary"}`} href={`/forum?${new URLSearchParams({ ...(selected ? { subject: selected } : {}), ...(!onlyOlympiad ? { olympiad: "1" } : {}) })}`} aria-current={onlyOlympiad ? "page" : undefined}>{t("forum.olympiadFilter")}</Link>
      <div className="motion-stagger grid gap-4 md:grid-cols-2">
        {rows.map((q) => (
          <Card key={q.id} className="motion-card space-y-4">
            <div className="flex flex-wrap gap-2">
              <Tag>
                {
                  subjects.find((s) => s.id === q.subject_id)?.[
                    `name_${locale}`
                  ]
                }
              </Tag>
              {hasSampleOlympiadAnswer(q) && <Tag simulated>{t("forum.olympiadWinner")}</Tag>}
              {q.is_sample && <Tag simulated>{t("common.sample")}</Tag>}
            </div>
            <Link
              className="inline-flex min-h-11 items-center break-words text-lg font-bold text-accent"
              href={`/forum/${q.id}${onlyOlympiad ? "?olympiad=1" : ""}`}
            >
              {q.text}
            </Link>
            <p className="text-sm text-muted">
              {topics.find((p) => p.id === q.topic_id)?.[`title_${locale}`]}
            </p>
            <p className="text-sm">
              {t("forum.answers", { count: q.answerCount })}
            </p>
          </Card>
        ))}
      </div>
      {!rows.length && (
        <Card>
          <p>{t("forum.empty")}</p>
          {!hideNewQuestion && (
            <Link href="/forum/new" className="button button-primary mt-4">
              {t("forum.newQuestion")}
            </Link>
          )}
        </Card>
      )}
    </main>
  );
}
