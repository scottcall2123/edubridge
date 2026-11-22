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
    <main className="container py-10">
      <div className="card mx-auto max-w-lg space-y-6">
        <Image
          className="mx-auto"
          src="/brand/edubridge-seal.svg"
          width={96}
          height={96}
          alt="EduBridge"
        />
        <div className="text-center">
          <h1>{t("auth.title")}</h1>
          <p className="mt-2 text-muted">{t("common.tagline")}</p>
        </div>
        <section className="space-y-4 rounded-xl bg-sky-50 p-4">
          <h2 className="text-base">{t("auth.demoTitle")}</h2>
          {demo ? (
            <>
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
              <form action={demoLogin} className="grid grid-cols-2 gap-2">
                <DemoButton role="student" />
                <DemoButton role="teacher" formAction={demoTeacherLogin} />
              </form>
            </>
          ) : (
            <p className="text-sm">{t("auth.setup")}</p>
          )}
          <Tag>{t("common.sample")}</Tag>
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
