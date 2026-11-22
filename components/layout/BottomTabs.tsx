"use client";
import { Home, MessageCircleQuestion, Users, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
export function BottomTabs() {
  const path = usePathname(),
    t = useTranslations("nav");
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
      {[
        { href: "/dashboard", key: "home", Icon: Home },
        { href: "/ask", key: "question", Icon: MessageCircleQuestion },
        { href: "/teachers", key: "teachers", Icon: Users },
        { href: "/profile", key: "profile", Icon: UserRound },
      ].map(({ href, key, Icon }) => (
        <Link
          key={key}
          aria-current={path.startsWith(href) ? "page" : undefined}
          href={href}
          className={`flex min-h-16 flex-col items-center justify-center gap-1 text-xs ${path.startsWith(href) ? "text-accent" : "text-muted"}`}
        >
          <Icon />
          {t(key)}
        </Link>
      ))}
    </nav>
  );
}
