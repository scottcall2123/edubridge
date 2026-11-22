"use client";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Sigma, Atom, FlaskConical, ArrowLeft } from "lucide-react";
import { createQuestion } from "@/app/actions/questions";
import { uploadQuestionImage } from "@/lib/upload-image";
import { MAX_IMAGE_BYTES } from "@/lib/image-input";
import { Button, Card } from "@/components/ui";
import type { Subject, Topic } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
export function Steps({ step }: { step: number }) {
  const t = useTranslations("ask");
  return (
    <ol aria-label={t("steps")} className="mb-8 grid grid-cols-3 gap-2">
      {[1, 2, 3].map((n) => (
        <li
          key={n}
          aria-current={step === n ? "step" : undefined}
          className={`motion-step rounded-xl border px-3 py-3 text-center text-sm font-bold ${n === step ? "border-accent text-accent" : "border-line text-muted"}`}
        >
          {n}
          <span className="mt-1 block text-xs">{t(`step${n}`)}</span>
        </li>
      ))}
    </ol>
  );
}
export function AskWizard({
  subjects,
  topics,
  publicMode = false,
}: {
  subjects: Subject[];
  topics: Topic[];
  publicMode?: boolean;
}) {
  const t = useTranslations(),
    locale = useLocale() as Locale,
    router = useRouter();
  const [step, setStep] = useState(1),
    [subject, setSubject] = useState(""),
    [topic, setTopic] = useState(""),
    [text, setText] = useState(""),
    [error, setError] = useState(""),
    [pending, start] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const requestId = useRef("");
  const icons: Record<string, typeof Sigma> = {
    algebra: Sigma,
    fizika: Atom,
    kimyo: FlaskConical,
  };
  return (
    <>
      <Steps step={step} />
      {step === 1 ? (
        <>
          <header className="page-header mb-6">
            <div>
              <p className="eyebrow">{t("nav.ask")}</p>
              <h1>{t("ask.chooseSubject")}</h1>
              <Link href="/forum" className="inline-flex min-h-11 items-center font-bold text-accent">{t("forum.peerFirst")}</Link>
              <p>{t("ask.chooseSubjectHint")}</p>
            </div>
          </header>
          <div className="motion-stagger grid gap-4 md:grid-cols-3">
            {subjects.map((s) => {
              const Icon = icons[s.slug] ?? Sigma;
              const own = topics.filter((topic) => topic.subject_id === s.id);
              const chosen = subject === s.id;
              return (
                <button
                  key={s.id}
                  className={`card motion-card flex min-h-44 flex-col gap-3 text-left ${chosen ? "border-accent bg-sky-50" : ""}`}
                  aria-pressed={chosen}
                  onClick={() => {
                    setSubject(s.id);
                    setTopic("");
                  }}
                >
                  <span
                    className={`stat-icon ${chosen ? "stat-icon-gold" : ""}`}
                  >
                    <Icon aria-hidden="true" />
                  </span>
                  <span className="text-lg font-extrabold">
                    {s[`name_${locale}`]}
                  </span>
                  <span className="text-sm font-bold text-muted">
                    {t("ask.topicCount", { count: own.length })}
                  </span>
                  <span className="flex flex-wrap gap-1">
                    {own.slice(0, 3).map((topic) => (
                      <span
                        key={topic.id}
                        className="inline-flex rounded-full bg-sky-50 px-2 py-0.5 text-xs font-semibold text-accent"
                      >
                        {topic[`title_${locale}`]}
                      </span>
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
          {!subjects.length && <Card>{t("ask.noSubjects")}</Card>}
          <Button
            className="mt-6"
            disabled={!subject}
            onClick={() => setStep(2)}
          >
            {t("common.continue")}
          </Button>
          <section aria-labelledby="ask-flow" className="mt-10 space-y-4">
            <h2 id="ask-flow" className="section-title">
              {t("ask.flowTitle")}
            </h2>
            <ol className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <li key={n} className="card flex gap-3">
                  <span className="stat-icon shrink-0 font-extrabold">{n}</span>
                  <p className="text-sm">{t(`ask.flow${n}`)}</p>
                </li>
              ))}
            </ol>
          </section>
        </>
      ) : (
        <Card>
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              setError("");
              if (
                text.trim().length < 10 ||
                text.trim().length > 1000 ||
                !topic
              ) {
                setError("validation");
                return;
              }
              requestId.current ||= crypto.randomUUID();
              start(async () => {
                try {
                  const result = await createQuestion({
                    requestId: requestId.current,
                    subjectId: subject,
                    topicId: topic,
                    text,
                    isPublic: publicMode,
                  });
                  if (result.error) setError(result.error);
                  else {
                    let imageError = false;
                    if (file && !publicMode) {
                      try {
                        await uploadQuestionImage(result.questionId!, file);
                      } catch {
                        imageError = true;
                      }
                    }
                    router.push(
                      publicMode
                        ? `/forum/${result.questionId}`
                        : `/tutor/${result.questionId}${imageError ? "?imageError=1" : ""}`,
                    );
                  }
                } catch {
                  setError("save");
                }
              });
            }}
          >
            <h1>{t("ask.step2")}</h1>
            <div>
              <label htmlFor="topic">{t("ask.topic")}</label>
              <select
                id="topic"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              >
                <option value="">{t("ask.chooseTopic")}</option>
                {topics
                  .filter((t) => t.subject_id === subject)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t[`title_${locale}`]}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label htmlFor="question">{t("ask.writeQuestion")}</label>
              <textarea
                id="question"
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
                minLength={10}
                maxLength={1000}
                rows={6}
              />
              <p className="mt-2 text-xs text-muted">
                {t("ask.length", { count: text.length })}
              </p>
              <p className="mt-2 text-xs text-muted">
                {t(publicMode ? "forum.publicNotice" : "ask.private")}
              </p>
            </div>
            {!publicMode && (
              <div className="space-y-2">
                <label htmlFor="question-image">{t("ask.image")}</label>
                <input
                  id="question-image"
                  type="file"
                  accept="image/jpeg,image/png"
                  disabled={pending}
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    if (
                      f &&
                      (f.size > MAX_IMAGE_BYTES ||
                        !["image/jpeg", "image/png"].includes(f.type))
                    ) {
                      setError("imageInvalid");
                      setFile(null);
                      e.target.value = "";
                    } else {
                      setFile(f);
                      setError("");
                    }
                  }}
                />
                <p className="text-xs text-muted">{t("ask.imageHint")}</p>
              </div>
            )}
            {error && (
              <p role="alert" className="text-danger">
                {t(`ask.${error}`)}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="secondary"
                disabled={pending}
                onClick={() => setStep(1)}
              >
                <ArrowLeft />
                {t("ask.back")}
              </Button>
              <Button disabled={pending} type="submit">
                {t(pending ? "common.loading" : "common.continue")}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </>
  );
}
