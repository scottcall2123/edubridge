import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Footer } from "@/components/layout/Footer";
import { demoLogin } from "@/app/actions/auth";
import { DemoButton } from "@/components/auth/DemoButton";
export default async function Home() {
  const t = await getTranslations();
  return (
    <>
      <main className="container py-12 md:py-20">
        <section className="card grid items-center gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <p className="eyebrow">{t("common.tagline")}</p>
            <h1>{t("landing.title")}</h1>
            <p className="text-muted">{t("landing.subtitle")}</p>
            <div className="flex flex-wrap gap-3">
              <form action={demoLogin}>
                <DemoButton />
              </form>
              <Link className="button button-secondary" href="/register">
                {t("common.register")}
              </Link>
            </div>
          </div>
          <div className="mx-auto rounded-full bg-sky-50 p-4 sm:p-6">
            <Image
              className="h-auto max-w-full"
              src="/brand/edubridge-seal.svg"
              width={280}
              height={280}
              alt="EduBridge"
              priority
            />
          </div>
        </section>
        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div className="card space-y-2" key={n}>
              <p className="eyebrow">0{n}</p>
              <h2>{t(`landing.step${n}`)}</h2>
              <p className="text-sm text-muted">
                {t(n === 3 ? "landing.last" : "landing.free")}
              </p>
            </div>
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}
