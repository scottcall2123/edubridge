"use client";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Send, Users, Check, RotateCcw } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { markSolvedByAI } from "@/app/actions/tutor";
import type { TutorMessage } from "@/lib/types";
type Action = "start" | "reply" | "simpler" | "understood";
type Turn = {
  action: Action;
  message?: string;
  requestId: string;
  locale: string;
};
export function TutorChat({
  questionId,
  subjectSlug,
  initialMessages,
  initialSimpler,
  initialUnderstood,
  open,
}: {
  questionId: string;
  subjectSlug: string;
  initialMessages: TutorMessage[];
  initialSimpler: number;
  initialUnderstood: number;
  open: boolean;
}) {
  const t = useTranslations(),
    locale = useLocale(),
    router = useRouter();
  const [messages, setMessages] = useState(initialMessages),
    [simpler, setSimpler] = useState(initialSimpler),
    [understood, setUnderstood] = useState(initialUnderstood),
    [input, setInput] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [saving, startSaving] = useTransition();
  const started = useRef(false),
    inflight = useRef(false),
    failed = useRef<Turn | null>(null),
    bottom = useRef<HTMLDivElement>(null);
  const teacherHref = `/teachers?subject=${encodeURIComponent(subjectSlug)}&q=${questionId}`;
  const send = useCallback(
    async (action: Action, message?: string, retry?: Turn) => {
      if (inflight.current || !open) return;
      inflight.current = true;
      setBusy(true);
      setError("");
      const turn = retry ?? {
        action,
        message,
        requestId: crypto.randomUUID(),
        locale,
      };
      try {
        const response = await fetch("/api/tutor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId, ...turn }),
          signal: AbortSignal.timeout(55000),
        });
        const data = await response.json();
        if (Array.isArray(data.messages)) setMessages(data.messages);
        if (typeof data.simplerCount === "number")
          setSimpler(data.simplerCount);
        if (typeof data.understoodCount === "number")
          setUnderstood(data.understoodCount);
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        if (!response.ok) {
          setError(
            data.error === "limit"
              ? "limit"
              : data.error === "closed"
                ? "closed"
                : "busy",
          );
          failed.current = turn;
          return;
        }
        failed.current = null;
        setInput("");
      } catch {
        failed.current = turn;
        setError("busy");
      } finally {
        inflight.current = false;
        setBusy(false);
      }
    },
    [questionId, locale, open, router],
  );
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!started.current) {
        started.current = true;
        if (open && !initialMessages.some((m) => m.role === "ai"))
          void send("start");
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [open, initialMessages, send]);
  useEffect(() => {
    bottom.current?.scrollIntoView({
      block: "nearest",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }, [messages, busy]);
  const disabled = busy || saving,
    hasAi = messages.some((m) => m.role === "ai");
  const solve = () => {
    setError("");
    startSaving(async () => {
      try {
        const result = await markSolvedByAI(questionId);
        if (result.error) setError("save");
        else router.push(`/ask/success?q=${questionId}`);
      } catch {
        setError("save");
      }
    });
  };
  return (
    <div className="space-y-6">
      <section
        aria-label={t("tutor.history")}
        aria-live="polite"
        aria-busy={busy}
        className="space-y-4"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === "ai" ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`chat-message max-w-[92%] rounded-2xl p-4 ${m.role === "ai" ? "bg-sky-50 text-ink" : "bg-royal text-white"}`}
            >
              <div className="mb-2 flex items-center gap-2 text-xs font-bold">
                {m.role === "ai" && (
                  <Image
                    src="/brand/edubridge-seal.svg"
                    width={28}
                    height={28}
                    alt="EduBridge"
                  />
                )}
                {t(m.role === "ai" ? "tutor.title" : "tutor.you")}
              </div>
              <p className="whitespace-pre-wrap break-words">{m.content}</p>
            </div>
          </div>
        ))}
        {busy && (
          <div
            role="status"
            className="inline-flex items-center gap-2 rounded-2xl bg-sky-50 p-4 text-sm"
          >
            <span className="flex gap-1" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{ animationDelay: `${i * 150}ms` }}
                  className="size-2 animate-pulse rounded-full bg-royal"
                />
              ))}
            </span>
            {t("tutor.thinking")}
          </div>
        )}
        <div ref={bottom} />
      </section>
      {open ? (
        <>
          {simpler >= 2 && (
            <Card className="sticky bottom-20 z-10 space-y-3 border-gold bg-gold-50 md:bottom-4">
              <div className="flex gap-3">
                <Users className="text-gold" />
                <h2 className="text-base">{t("tutor.banner")}</h2>
              </div>
              <Link href={teacherHref} className="button button-gold">
                {t("teachers.connect")}
              </Link>
            </Card>
          )}
          {error && (
            <Card className="space-y-3">
              <p role="alert" className="text-danger">
                {t(`tutor.${error}`)}
              </p>
              <div className="flex flex-wrap gap-3">
                {error !== "limit" && error !== "closed" && (
                  <Button
                    variant="secondary"
                    disabled={disabled}
                    onClick={() => {
                      if (error === "save") {
                        solve();
                        return;
                      }
                      const turn = failed.current;
                      if (turn) void send(turn.action, turn.message, turn);
                    }}
                  >
                    <RotateCcw />
                    {t("errors.retry")}
                  </Button>
                )}
                <Link href={teacherHref} className="button button-secondary">
                  {t("teachers.connect")}
                </Link>
                {error === "closed" && (
                  <Button onClick={() => router.refresh()}>
                    {t("tutor.refresh")}
                  </Button>
                )}
              </div>
            </Card>
          )}
          {hasAi && error !== "limit" && error !== "closed" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                disabled={disabled}
                onClick={() => void send("understood")}
              >
                {t("tutor.understood")}
              </Button>
              <Button
                variant="secondary"
                disabled={disabled}
                onClick={() => void send("simpler")}
              >
                {t("tutor.simpler")}
              </Button>
            </div>
          )}
          {error !== "limit" && error !== "closed" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (input.trim()) void send("reply", input.trim());
              }}
              className="flex items-end gap-2"
            >
              <div className="min-w-0 flex-1">
                <label htmlFor="reply">{t("tutor.replyLabel")}</label>
                <textarea
                  id="reply"
                  rows={2}
                  maxLength={1000}
                  required
                  disabled={disabled || !hasAi}
                  placeholder={t("tutor.placeholder")}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                disabled={disabled || !hasAi || !input.trim()}
                aria-label={t("tutor.send")}
                className="mb-2 px-4"
              >
                <Send />
              </Button>
            </form>
          )}
          {understood >= 1 && error !== "closed" && (
            <Button
              className="bg-success-700 text-white hover:bg-success-700/90"
              disabled={disabled}
              onClick={solve}
            >
              <Check />
              {t(saving ? "common.loading" : "tutor.solved")}
            </Button>
          )}
        </>
      ) : (
        <Card>
          <p>{t("tutor.closed")}</p>
          <Link href="/ask" className="button button-primary mt-4">
            {t("ask.again")}
          </Link>
        </Card>
      )}
    </div>
  );
}
