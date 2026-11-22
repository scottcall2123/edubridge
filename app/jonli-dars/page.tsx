import { getTranslations } from "next-intl/server";
import { Avatar, Card, PageHeader, Tag } from "@/components/ui";
import { LessonTimer } from "@/components/lesson/LessonTimer";
export async function generateMetadata() {
  return { title: (await getTranslations("lesson"))("title") };
}
export default async function LessonPage() {
  const t = await getTranslations();
  return <main className="container motion-page space-y-6 py-8">
    <PageHeader title={t("lesson.title")} subtitle={t("lesson.subtitle")} action={<Tag simulated>{t("common.sample")}</Tag>} />
    <p className="rounded-xl bg-gold-50 p-4 text-sm">{t("lesson.disclaimer")}</p>
    <Card className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <h2>{t("lesson.title")}</h2><LessonTimer />
        <div className="flex flex-wrap gap-2 text-xs">
          <Tag>{t("lesson.camera")}</Tag>
          <Tag simulated><span className="mr-2 inline-block size-2 rounded-full bg-danger" />{t("lesson.recording")}</Tag>
          <Tag>{t("lesson.parent")}</Tag>
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-[200px_1fr]">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
          {["teacher", "you"].map((role) => <div key={role} className={`flex flex-col items-center justify-center gap-3 rounded-xl border bg-paper p-4 ${role === "you" ? "border-accent" : "border-line"}`}>
            <Avatar name={t(`lesson.${role}Name`)} />
            <p className="text-sm font-bold">{t(`lesson.${role}`)}</p>
            <div aria-hidden="true" className={`lesson-audio flex h-5 items-center gap-1 ${role === "you" ? "opacity-40" : ""}`}>
              {[1,2,3,4,5].map((n) => <span key={n} className="size-1.5 rounded-full bg-accent" />)}
            </div>
          </div>)}
        </div>
        <section aria-label={t("lesson.board")} className="lesson-board min-w-0 rounded-xl border border-line p-5 md:p-8">
          <p className="mb-6 text-xs font-bold uppercase tracking-wider text-muted">{t("lesson.board")}</p>
          <ol className="lesson-writing space-y-5 font-mono text-lg font-semibold sm:text-2xl" aria-label={t("lesson.example")}>
            <li>x² − 5x + 6 = 0</li>
            <li>D = b² − 4ac</li>
            <li>D = 25 − 24 = 1</li>
            <li><span className="relative inline-block px-3 py-1">x₁ = 3　x₂ = 2
              <svg aria-hidden="true" className="lesson-ring pointer-events-none absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 240 45" preserveAspectRatio="none"><ellipse cx="120" cy="22.5" rx="119" ry="22" fill="none" stroke="var(--c-gold)" strokeWidth="2" /></svg>
            </span></li>
          </ol>
        </section>
      </div>
    </Card>
    <p className="text-center text-sm text-muted">{t("lesson.safety")}</p>
  </main>;
}
