"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
export function LessonTimer() {
  const [seconds, setSeconds] = useState(900);
  const t = useTranslations("lesson");
  useEffect(() => {
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return <span className="rounded-lg bg-sky-50 px-3 py-2 font-extrabold tabular-nums text-accent" aria-label={t("remaining")}>
    {String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}
  </span>;
}
