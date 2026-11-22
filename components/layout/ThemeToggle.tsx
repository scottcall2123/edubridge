"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";

export const THEME_KEY = "edubridge-theme";

export function ThemeToggle() {
  const t = useTranslations("common");
  // The page is rendered light; the script in the document head has already
  // applied the stored choice, so the button reads it after mounting.
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.dataset.theme === "dark");
  }, []);

  function toggle() {
    const next = dark ? "light" : "dark";
    setDark(!dark);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // A browser with storage switched off simply forgets the choice.
    }
  }

  const label = t(dark ? "lightMode" : "darkMode");
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark}
      title={label}
      className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-white hover:bg-white/10"
    >
      {dark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
      <span className="sr-only">{label}</span>
    </button>
  );
}
