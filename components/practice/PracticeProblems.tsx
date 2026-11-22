"use client";
import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button, Card, Spinner, Tag } from "@/components/ui";
import type { PracticeResult } from "@/lib/practice";
export function PracticeProblems({ questionId }: { questionId: string }) {
  const t = useTranslations("practice");
  const locale = useLocale();
  const [result, setResult] = useState<PracticeResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState(3);
  const inFlight = useRef(false);
  async function generate() {
    if (inFlight.current) return;
    inFlight.current = true; setBusy(true); setError("");
    try {
      const response = await fetch("/api/practice", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questionId, requestId: crypto.randomUUID(), locale }), signal: AbortSignal.timeout(55000) });
      const data = await response.json();
      if (!response.ok) { setError(data.error === "limit" ? "limit" : "error"); if (data.error === "limit") setRemaining(0); return; }
      setResult(data); setRemaining(data.remaining);
    } catch { setError("error"); }
    finally { setBusy(false); inFlight.current = false; }
  }
  return <section aria-labelledby="practice-title" className="mx-auto mt-8 max-w-2xl space-y-4">
    <h2 id="practice-title">{t("title")}</h2>
    <p className="text-sm text-muted">{t("hint")}</p>
    <Tag>{t("aiLabel")}</Tag>
    <div><Button disabled={busy || remaining === 0} onClick={() => void generate()}>{t(result ? "again" : "generate")}</Button></div>
    {busy && <Spinner label={t("loading")} />}
    {error && <p role="alert" className="text-sm text-danger">{t(error)}</p>}
    {result?.problems.map((problem, index) => <Card key={`${locale}-${problem.question}-${index}`} className="space-y-3">
      <h3 className="font-bold">{index + 1}. {problem.question}</h3>
      <details><summary className="min-h-11 cursor-pointer py-3 font-bold text-accent">{t("reveal")}</summary>
        <ol className="list-decimal space-y-2 pl-6">{problem.steps.map((step, i) => <li key={i}>{step}</li>)}</ol>
      </details>
    </Card>)}
  </section>;
}
