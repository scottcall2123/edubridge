"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, Tag, Button } from "@/components/ui";
import { markHelped } from "@/app/actions/questions";
import type { SimilarQuestion } from "@/lib/questions";
import { Steps } from "./AskWizard";
export function SimilarQuestions({
  questionId,
  questions,
}: {
  questionId: string;
  questions: SimilarQuestion[];
}) {
  const t = useTranslations(),
    router = useRouter(),
    [pending, start] = useTransition(),
    [error, setError] = useState(false);
  return (
    <>
      <Steps step={3} />
      <h1 className="mb-6">{t("ask.similar")}</h1>
      <div className="space-y-6">
        {questions.map((q) => (
          <Card key={q.id} className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Tag>{q.subject}</Tag>
              <span className="text-sm text-muted">{q.topic}</span>
              {q.is_sample && <Tag>{t("common.sample")}</Tag>}
            </div>
            <h2>{q.text}</h2>
            <ol className="list-decimal space-y-3 pl-6">
              {q.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
            <Button
              disabled={pending}
              onClick={() => {
                setError(false);
                start(async () => {
                  try {
                    const result = await markHelped({
                      questionId,
                      answerId: q.answerId,
                    });
                    if (result.error) setError(true);
                    else router.push(`/ask/success?q=${questionId}`);
                  } catch {
                    setError(true);
                  }
                });
              }}
            >
              {t(pending ? "common.loading" : "ask.helped")}
            </Button>
          </Card>
        ))}
        {!questions.length && (
          <Card>
            <p className="text-muted">{t("ask.noSimilar")}</p>
          </Card>
        )}
        {error && (
          <p role="alert" className="text-danger">
            {t("ask.save")}
          </p>
        )}
        <Link
          aria-disabled={pending}
          className={`button button-primary ${pending ? "pointer-events-none opacity-60" : ""}`}
          href={`/tutor/${questionId}`}
        >
          {t("ask.toAi")}
        </Link>
      </div>
    </>
  );
}
