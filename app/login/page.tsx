import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth";
import { DEMO_TEACHER_EMAIL, getDemoCredentials } from "@/lib/demo";
import { demoLogin, demoTeacherLogin } from "@/app/actions/auth";
import { LoginForm } from "@/components/auth/LoginForm";
import { DemoButton } from "@/components/auth/DemoButton";
import { Tag } from "@/components/ui";
export async function generateMetadata() {
  const t = await getTranslations("auth");
  return { title: t("title") };
}
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const current = await getCurrentUser();
  if (current) redirect(current.teacher ? "/teacher" : "/dashboard");
  const t = await getTranslations(),
    params = await searchParams;
  let demo: ReturnType<typeof getDemoCredentials> | null = null;
  try {
    demo = getDemoCredentials();
  } catch {
    /* Setup is documented for the project owner. */
  }
  return (
    <main className="container motion-page py-2 md:py-8">
      <div className="card mx-auto max-w-lg space-y-2 md:space-y-4">
        <Image
          className="brand-light mx-auto h-16 w-auto"
          src="/brand/edubridge-logo-vertical.svg"
          width={114}
          height={96}
          alt="EduBridge"
        />
        <Image className="brand-dark mx-auto h-16 w-auto" src="/brand/edubridge-logo-vertical-on-dark.svg" width={114} height={96} alt="EduBridge" />
        <div className="text-center">
          <h1>{t("auth.title")}</h1>
          <p className="mt-1 text-sm text-muted">{t("auth.description")}</p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {["aiChip", "teacherChip", "safeChip"].map((key) => <Tag key={key}>{t(`auth.${key}`)}</Tag>)}
          </div>
        </div>
        <section className="space-y-2 rounded-xl bg-sky-50 p-3 md:p-4">
          <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-base">{t("auth.demoTitle")}</h2><Tag>{t("common.sample")}</Tag></div>
          {demo ? (
            <>
              <form action={demoLogin} className="grid grid-cols-2 gap-2">
                <DemoButton role="student" />
                <DemoButton role="teacher" formAction={demoTeacherLogin} />
              </form>
              <details>
                <summary className="min-h-11 cursor-pointer py-3 text-sm font-bold text-accent">{t("auth.demoCredentials")}</summary>
              <dl className="space-y-2 break-words text-sm">
                <div>
                  <dt className="text-muted">{t("auth.studentDemoEmail")}</dt>
                  <dd>{demo.email}</dd>
                </div>
                <div>
                  <dt className="text-muted">{t("auth.teacherDemoEmail")}</dt>
                  <dd>{DEMO_TEACHER_EMAIL}</dd>
                </div>
                <div>
                  <dt className="text-muted">{t("auth.password")}</dt>
                  <dd>{demo.password}</dd>
                </div>
              </dl>
              </details>
            </>
          ) : (
            <p className="text-sm">{t("auth.setup")}</p>
          )}
          <p className="text-xs text-muted">{t("auth.sampleHistory")}</p>
        </section>
        {params.error && (
          <p role="alert" className="text-sm text-danger">
            {t(
              params.error === "teacherSetup"
                ? "auth.teacherSetup"
                : params.error === "setup"
                  ? "errors.setup"
                  : "errors.login",
            )}
          </p>
        )}
        <LoginForm />
        <p className="text-center text-sm">
          <Link className="font-bold text-accent" href="/register">
            {t("common.register")}
          </Link>
        </p>
      </div>
    </main>
  );
}
