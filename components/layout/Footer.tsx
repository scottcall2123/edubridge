import Image from "next/image";
import { getTranslations } from "next-intl/server";
export async function Footer() {
  const t = await getTranslations();
  return (
    <footer className="mt-16 bg-navy py-10 text-white">
      <div className="container space-y-4">
        <Image
          src="/brand/edubridge-logo-horizontal-on-dark.svg"
          width={180}
          height={40}
          alt="EduBridge"
        />
        <p>{t("common.tagline")}</p>
        <p className="text-sm">{t("landing.team")}</p>
        <p className="text-xs text-white/80">{t("landing.notice")}</p>
        <p className="text-xs text-white/80">{t("landing.privacy")}</p>
      </div>
    </footer>
  );
}
