import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { getLocale, getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth";
import { loadForumDetail } from "@/lib/forum";
import { Card, Tag } from "@/components/ui";
import {
  AnswerForm,
  RateAnswer,
  ReportButton,
} from "@/components/forum/ForumControls";
import type { Locale } from "@/lib/i18n";
export async function generateMetadata() {
  return { title: (await getTranslations("forum"))("title") };
}
export default async function ForumDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ olympiad?: string }>;
}) {
  const { id } = await params;
  const onlyOlympiad = (await searchParams).olympiad === "1";
  if (!z.uuid().safeParse(id).success) notFound();
  const current = await getCurrentUser(),
    data = await loadForumDetail(id, current?.user.id);
  if (!data) notFound();
  const t = await getTranslations(),
    locale = (await getLocale()) as Locale;
  const answers = data.answers.filter((answer) => !onlyOlympiad || answer.is_olympiad);
  return (
    <main className="container motion-page max-w-3xl space-y-6 py-8">
      <Link
        href="/forum"
        className="inline-flex min-h-11 items-center font-bold text-accent"
      >
        {t("forum.back")}
      </Link>
      <Card className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Tag>{data.subject[`name_${locale}`]}</Tag>
          {data.topic && <Tag>{data.topic[`title_${locale}`]}</Tag>}
          {data.question.is_sample && <Tag>{t("common.sample")}</Tag>}
        </div>
        <h1 className="break-words">{data.question.text}</h1>
        {current ? <ReportButton targetId={id} targetType="question" />:<Link href="/login" className="button button-secondary">{t('forum.report')}</Link>}
      </Card>
      <h2>{t("forum.answers", { count: data.answers.length })}</h2>
      <Link className={`button ${onlyOlympiad ? "button-gold" : "button-secondary"}`} href={`/forum/${id}${onlyOlympiad ? "" : "?olympiad=1"}`} aria-current={onlyOlympiad ? "page" : undefined}>{t("forum.olympiadFilter")}</Link>
      {answers.map((a) => (
        <Card key={a.id} className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-bold">{a.author_name}</p>
            {a.is_olympiad && <Tag simulated>{t("forum.olympiadWinner")}</Tag>}
            {a.is_sample && <Tag simulated>{t("common.sample")}</Tag>}
          </div>
          <ol className="list-decimal space-y-3 pl-6">
            {a.steps.map((s, i) => (
              <li className="whitespace-pre-wrap break-words" key={i}>
                {s}
              </li>
            ))}
          </ol>
          <p className="text-sm">
            {a.stars ? t("forum.rating", { n: a.stars }) : t("forum.unrated")}
          </p>
          {a.canRate && <RateAnswer answerId={a.id} />}{" "}
          {current ? <ReportButton targetId={a.id} targetType="answer" />:<Link href="/login" className="button button-secondary">{t('forum.report')}</Link>}
        </Card>
      ))}
      {!answers.length && <Card>{t("forum.noAnswers")}</Card>}
      <Card>
        {current ? (
          <AnswerForm questionId={id} />
        ) : (
          <Link href="/login" className="button button-primary">
            {t("forum.loginToAnswer")}
          </Link>
        )}
      </Card>
    </main>
  );
}
