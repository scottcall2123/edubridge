import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Avatar } from "@/components/ui";
import { LogIn } from "lucide-react";
export async function UserMenu({
  name,
  teacher,
  logout,
}: {
  name?: string;
  teacher?: boolean;
  logout?: () => Promise<void>;
}) {
  const t = await getTranslations();
  return name ? (
    <details className="relative">
      <summary
        aria-label={t("nav.menu")}
        className="cursor-pointer list-none rounded-full p-1"
      >
        <Avatar name={name} />
      </summary>
      <div className="absolute right-0 z-30 mt-3 w-48 rounded-xl border border-line bg-surface p-2 text-ink shadow-lg">
        <Link
          className="block min-h-11 rounded-lg p-3"
          href={teacher ? "/teacher" : "/dashboard"}
        >
          {t(teacher ? "nav.teacherHome" : "nav.home")}
        </Link>
        {!teacher && (
          <Link className="block rounded-lg p-3" href="/profile">
            {t("nav.profile")}
          </Link>
        )}
        {!teacher && (
          <Link className="block min-h-11 rounded-lg p-3" href="/timetable">
            {t("nav.timetable")}
          </Link>
        )}
        <Link className="block min-h-11 rounded-lg p-3" href="/forum">
          {t("nav.forum")}
        </Link>
        {!teacher && (
          <Link className="block min-h-11 rounded-lg p-3" href="/leaderboard">
            {t("nav.leaderboard")}
          </Link>
        )}
        {logout && (
          <form action={logout}>
            <button className="w-full rounded-lg p-3 text-left">
              {t("common.logout")}
            </button>
          </form>
        )}
      </div>
    </details>
  ) : (
    <Link
      className="inline-flex min-h-11 min-w-11 items-center justify-center text-sm font-bold sm:px-3"
      href="/login"
      aria-label={t("common.login")}
    >
      <span className="sm:hidden" aria-label={t("common.login")}>
        <LogIn />
      </span>
      <span className="hidden sm:inline">{t("common.login")}</span>
    </Link>
  );
}
