import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { TopBar } from "@/components/layout/TopBar";
import { BottomTabs } from "@/components/layout/BottomTabs";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/app/actions/auth";
const manrope = Manrope({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
});
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: {
      default: `EduBridge — ${t("common.tagline")}`,
      template: "EduBridge — %s",
    },
    description: t("landing.subtitle"),
    icons: {
      icon: [
        { url: "/brand/favicon-16.png", sizes: "16x16" },
        { url: "/brand/favicon-32.png", sizes: "32x32" },
      ],
      apple: "/brand/favicon-192.png",
    },
    manifest: "/manifest.webmanifest",
  };
}
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale(),
    current = await getCurrentUser();
  const t = await getTranslations();
  return (
    <html lang={locale} className={manrope.variable}>
      <body>
        <NextIntlClientProvider>
          <a href="#main-content" className="skip-link">
            {t("common.skipContent")}
          </a>
          <TopBar
            name={
              current?.teacher?.full_name ??
              current?.profile?.full_name ??
              (current ? "—" : undefined)
            }
            teacher={Boolean(current?.teacher)}
            logout={logout}
          />
          <div
            id="main-content"
            tabIndex={-1}
            className={current && !current.teacher ? "pb-20 md:pb-0" : ""}
          >
            {children}
          </div>
          {current && !current.teacher && <BottomTabs />}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
