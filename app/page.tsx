import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  MessageCircleQuestion,
  Users,
  Flame,
  Star,
  Trophy,
  ShieldCheck,
  GraduationCap,
  ArrowRight,
  School,
  MessagesSquare,
  Bot,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth";
import { Footer } from "@/components/layout/Footer";
import { demoLogin } from "@/app/actions/auth";
import { DemoButton } from "@/components/auth/DemoButton";
import { Card } from "@/components/ui";
async function StartAction({ home }: { home?: "/dashboard" | "/teacher" }) {
  const t = await getTranslations();
  return home ? (
    <Link href={home} className="button button-primary">
      {t(home === "/teacher" ? "nav.teacherHome" : "landing.dashboard")}
      <ArrowRight />
    </Link>
  ) : (
    <form action={demoLogin}>
      <DemoButton />
    </form>
  );
}
export async function generateMetadata() {
  const t = await getTranslations();
  return { title: t("common.tagline"), description: t("landing.subtitle") };
}
export default async function Home() {
  const t = await getTranslations(),
    current = await getCurrentUser();
  const home = current?.teacher ? "/teacher" : current ? "/dashboard" : undefined;
  const problems = [
      { key: "class", Icon: School },
      { key: "groups", Icon: MessagesSquare },
      { key: "answers", Icon: Bot },
    ],
    steps = [
      { n: 1, Icon: BookOpen },
      { n: 2, Icon: MessageCircleQuestion },
      { n: 3, Icon: Users },
    ];
  return (
    <>
      <main className="motion-page">
        <section className="border-b border-line bg-surface">
          <div className="container grid items-center gap-12 py-12 md:grid-cols-[1.2fr_1fr] md:py-20">
            <div className="space-y-6">
              <p className="eyebrow flex items-center gap-3">
                <span className="h-px w-8 bg-royal" />
                {t("common.tagline")}
              </p>
              <h1 className="max-w-lg">{t("landing.title")}</h1>
              <p className="max-w-xl text-muted">{t("landing.subtitle")}</p>
              <div className="flex flex-wrap gap-3">
                <StartAction home={home} />
                <Link href="/register" className="button button-secondary">
                  {t("common.register")}
                </Link>
              </div>
              <p className="text-sm text-muted">{t("landing.forStudents")}</p>
            </div>
            <div className="mx-auto w-full max-w-[360px] rounded-full bg-sky-50 p-6">
              <Image
                src="/brand/edubridge-seal.svg"
                width={340}
                height={340}
                className="h-auto w-full"
                alt="EduBridge"
                priority
              />
            </div>
          </div>
        </section>
        <div className="container space-y-16 py-16 md:space-y-20">
          <section aria-labelledby="problem-title" className="space-y-6">
            <div className="space-y-2">
              <p className="eyebrow">{t("landing.understand")}</p>
              <h2 id="problem-title">{t("landing.problemTitle")}</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {problems.map(({ key, Icon }) => (
                <Card key={key} className="space-y-5">
                  <span className="inline-flex rounded-xl bg-sky-50 p-3 text-accent">
                    <Icon />
                  </span>
                  <h3 className="font-bold">{t(`landing.problem_${key}`)}</h3>
                </Card>
              ))}
            </div>
          </section>
          <section aria-labelledby="how-title" className="space-y-6">
            <h2 id="how-title">{t("landing.how")}</h2>
            <Link href="/jonli-dars" className="inline-flex min-h-11 items-center font-bold text-accent">{t("lesson.preview")}</Link>
            <div className="grid gap-6 md:grid-cols-3">
              {steps.map(({ n, Icon }) => (
                <Card key={n} className="relative space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="flex size-11 items-center justify-center rounded-full bg-royal text-sm font-extrabold text-white">
                      0{n}
                    </span>
                    <Icon className="text-accent" />
                  </div>
                  <h3 className="text-xl font-bold">{t(`landing.step${n}`)}</h3>
                  <p className="text-xs font-bold uppercase tracking-wider text-accent">
                    {t("landing.free")}
                  </p>
                  <p className="text-sm text-muted">
                    {t(`landing.stepText${n}`)}
                  </p>
                  {n !== 3 && (
                    <ArrowRight
                      aria-hidden="true"
                      className="absolute -right-6 top-12 z-10 hidden text-accent md:block"
                    />
                  )}
                </Card>
              ))}
            </div>
          </section>
          <section
            aria-labelledby="rewards-title"
            className="rounded-2xl bg-navy p-6 text-white md:p-8"
          >
            <h2 id="rewards-title">{t("landing.rewards")}</h2>
            <div className="mt-6 grid gap-8 md:grid-cols-3">
              {[
                { key: "fire", Icon: Flame },
                { key: "points", Icon: Star },
                { key: "ranking", Icon: Trophy },
              ].map(({ key, Icon }) => (
                <div key={key} className="space-y-3">
                  <Icon className="text-gold" />
                  <h3 className="font-bold">{t(`landing.reward_${key}`)}</h3>
                  <p className="text-sm text-white/80">
                    {t(`landing.rewardText_${key}`)}
                  </p>
                </div>
              ))}
            </div>
          </section>
          <section
            aria-labelledby="teacher-title"
            className="grid gap-6 md:grid-cols-2"
          >
            <Card className="space-y-5">
              <GraduationCap className="text-accent" />
              <h2 id="teacher-title">{t("landing.forTeachers")}</h2>
              <p className="text-muted">{t("landing.teacherText")}</p>
              <Link
                href="/teachers"
                className="inline-flex min-h-11 items-center gap-2 font-bold text-accent"
              >
                {t("teachers.title")}
                <ArrowRight />
              </Link>
            </Card>
            <Card className="space-y-5">
              <BookOpen className="text-accent" />
              <h2>{t("landing.modelTitle")}</h2>
              <p className="text-muted">{t("landing.modelText")}</p>
            </Card>
          </section>
          <section
            aria-labelledby="safety-title"
            className="flex flex-col gap-5 rounded-2xl border border-line bg-sky-50 p-6 md:flex-row md:p-8"
          >
            <ShieldCheck className="text-accent" />
            <div className="space-y-3">
              <h2 id="safety-title">{t("landing.safety")}</h2>
              <p>{t("landing.safetyText")}</p>
              <p className="text-sm text-muted">{t("landing.privacy")}</p>
            </div>
          </section>
          <section
            aria-labelledby="start-title"
            className="space-y-6 text-center"
          >
            <h2 id="start-title" className="text-2xl font-extrabold">
              {t("landing.finalTitle")}
            </h2>
            <p className="mx-auto max-w-xl text-muted">
              {t("landing.finalText")}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <StartAction home={home} />
              <Link href="/register" className="button button-secondary">
                {t("common.register")}
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
