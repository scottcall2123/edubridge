"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Home,
  MessageCircleQuestion,
  Users,
  MessagesSquare,
  Trophy,
  CalendarDays,
} from "lucide-react";
export function DesktopNav({ teacher }: { teacher?: boolean }) {
  const t = useTranslations("nav"),
    path = usePathname();
  return (
    <nav
      aria-label={t("navigation")}
      className="hidden items-center gap-1 md:flex xl:gap-3"
    >
      {(teacher
        ? [
            { key: "teacherHome", href: "/teacher", Icon: Home },
            { key: "forum", href: "/forum", Icon: MessagesSquare },
          ]
        : [
            { key: "home", href: "/dashboard", Icon: Home },
            { key: "ask", href: "/ask", Icon: MessageCircleQuestion },
            { key: "timetable", href: "/timetable", Icon: CalendarDays },
            { key: "teachers", href: "/teachers", Icon: Users },
            { key: "forum", href: "/forum", Icon: MessagesSquare },
            { key: "leaderboard", href: "/leaderboard", Icon: Trophy },
          ]
      ).map(({ key, href, Icon }) => (
        <Link
          key={key}
          href={href}
          aria-label={t(key)}
          title={t(key)}
          aria-current={path.startsWith(href) ? "page" : undefined}
          className={`flex min-h-11 min-w-11 items-center justify-center rounded-lg px-2 text-sm ${path.startsWith(href) ? "bg-white/15" : "hover:bg-white/10"}`}
        >
          <span className="lg:hidden">
            <Icon />
          </span>
          <span className="hidden items-center gap-2 lg:inline-flex">
            <Icon />
            {t(key)}
          </span>
        </Link>
      ))}
    </nav>
  );
}
