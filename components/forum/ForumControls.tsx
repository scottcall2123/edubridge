"use client";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Star, Plus, Trash2, Flag } from "lucide-react";
import { Button } from "@/components/ui";
import { postAnswer, rateAnswer, reportPost } from "@/app/actions/forum";
export function AnswerForm({ questionId }: { questionId: string }) {
  const t = useTranslations(),
    router = useRouter(),
    [steps, setSteps] = useState(["", ""]),
    [error, setError] = useState(""),
    [saved, setSaved] = useState(false),
    [pending, start] = useTransition(),
    request = useRef("");
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setSaved(false);
        setError("");
        request.current ||= crypto.randomUUID();
        start(async () => {
          try {
            const r = await postAnswer({
              questionId,
              requestId: request.current,
              steps,
            });
            if (r.error) setError(r.error);
            else {
              setSteps(["", ""]);
              request.current = "";
              setSaved(true);
              router.refresh();
            }
          } catch {
            setError("save");
          }
        });
      }}
    >
      <h2>{t("forum.answerTitle")}</h2>
      {steps.map((step, i) => (
        <div key={i} className="flex items-end gap-2">
          <div className="min-w-0 flex-1">
            <label htmlFor={`answer-step-${i}`}>
              {t("forum.step", { n: i + 1 })}
            </label>
            <textarea
              id={`answer-step-${i}`}
              value={step}
              required
              minLength={3}
              maxLength={1000}
              rows={2}
              disabled={pending}
              onChange={(e) =>
                setSteps(steps.map((s, n) => (n === i ? e.target.value : s)))
              }
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            disabled={pending || steps.length <= 2}
            aria-label={t("forum.removeStep", { n: i + 1 })}
            onClick={() => setSteps(steps.filter((_, n) => n !== i))}
          >
            <Trash2 />
          </Button>
        </div>
      ))}
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="secondary"
          disabled={pending || steps.length >= 20}
          onClick={() => setSteps([...steps, ""])}
        >
          <Plus />
          {t("forum.addStep")}
        </Button>
        <Button disabled={pending}>
          {t(pending ? "common.loading" : "forum.submit")}
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-danger">
          {t(`forum.${error}`)}
        </p>
      )}
      {saved && (
        <p role="status" className="text-success-700">
          {t("forum.saved")}
        </p>
      )}
    </form>
  );
}
export function RateAnswer({ answerId }: { answerId: string }) {
  const t = useTranslations(),
    router = useRouter(),
    [pending, start] = useTransition(),
    [error, setError] = useState(false);
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">{t("forum.rateHint")}</p>
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5].map((stars) => (
          <Button
            key={stars}
            variant="secondary"
            disabled={pending}
            aria-label={t("forum.rate", { n: stars })}
            onClick={() => {
              setError(false);
              start(async () => {
                try {
                  const r = await rateAnswer({ answerId, stars });
                  if (r.error) setError(true);
                  else router.refresh();
                } catch {
                  setError(true);
                }
              });
            }}
          >
            <Star className="text-gold" />
            {stars}
          </Button>
        ))}
      </div>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {t("forum.save")}
        </p>
      )}
    </div>
  );
}
export function ReportButton({
  targetId,
  targetType,
}: {
  targetId: string;
  targetType: "question" | "answer";
}) {
  const t = useTranslations(),
    [pending, start] = useTransition(),
    [done, setDone] = useState(false),
    [error, setError] = useState(false);
  return (
    <div className="space-y-2">
      <Button
        variant="secondary"
        disabled={pending || done}
        onClick={() =>
          start(async () => {
            try {
              const r = await reportPost({ targetId, targetType });
              if (r.error) setError(true);
              else setDone(true);
            } catch {
              setError(true);
            }
          })
        }
      >
        <Flag />
        {t("forum.report")}
      </Button>
      {done && (
        <p role="status" className="text-sm">
          {t("forum.reportThanks")}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-danger">
          {t("forum.save")}
        </p>
      )}
    </div>
  );
}
