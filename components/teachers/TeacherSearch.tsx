import { Search } from "lucide-react";
import { getTranslations } from "next-intl/server";

// Shown only when the student arrives from AI Ustoz, so the escalation reads as
// a search rather than a jump. The three lines name what the page actually does
// with the data it already holds: pick the question's subject, keep the free
// slots that match the chosen time, then order by the nearest slot.
//
// Driven entirely by CSS so there is no client JavaScript, no hydration risk and
// nothing to clean up: the panel fades itself out and stops taking clicks. Under
// prefers-reduced-motion globals.css hides it outright, so those students go
// straight to the list.
export async function TeacherSearch({ subject }: { subject: string }) {
  const t = await getTranslations("teachers");
  const steps = [
    t("searchStep1", { subject }),
    t("searchStep2"),
    t("searchStep3"),
  ];
  return (
    <div className="teacher-search" role="status" aria-live="polite">
      <div className="teacher-search-card">
        <Search className="teacher-search-icon" aria-hidden />
        <p className="text-lg font-bold">{t("searchTitle")}</p>
        <ol className="teacher-search-steps">
          {steps.map((step, i) => (
            <li key={step} className={`teacher-search-step step-${i + 1}`}>
              {step}
            </li>
          ))}
        </ol>
        <div className="teacher-search-bar" aria-hidden>
          <span />
        </div>
      </div>
    </div>
  );
}
