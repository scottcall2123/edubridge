import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Card, Tag, PageHeader } from "@/components/ui";
import type { rankEntries } from "@/lib/ranking";
export async function LeaderboardView({
  rows,
}: {
  rows: ReturnType<typeof rankEntries>;
}) {
  const t = await getTranslations();
  return (
    <main className="container space-y-6 py-8">
      <PageHeader title={t("leaderboard.title")} />
      <p className="text-sm text-muted">{t("leaderboard.notice")}</p>
      <Card>
        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <caption className="sr-only">{t("leaderboard.title")}</caption>
              <thead className="border-b border-line text-muted">
                <tr>
                  {["rank", "name", "school", "district", "points"].map((k) => (
                    <th scope="col" className="p-3" key={k}>
                      {t(`leaderboard.${k}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.rank}
                    className={`border-b border-line last:border-0 ${r.isCurrent ? "bg-sky-50" : ""}`}
                    aria-current={r.isCurrent ? "true" : undefined}
                  >
                    <td className="p-3 font-bold">{r.rank}</td>
                    <td className="p-3">
                      <span className="font-bold">{r.full_name}</span>
                      {r.isCurrent && (
                        <span className="ml-2 text-royal">
                          {t("leaderboard.you")}
                        </span>
                      )}
                      {r.is_sample && (
                        <span className="ml-2">
                          <Tag>{t("common.sample")}</Tag>
                        </span>
                      )}
                    </td>
                    <td className="p-3">{r.school ?? "—"}</td>
                    <td className="p-3">{r.district ?? "—"}</td>
                    <td className="p-3 font-bold">{r.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="space-y-4">
            <p>{t("leaderboard.empty")}</p>
            <Link href="/ask" className="button button-primary">
              {t("nav.ask")}
            </Link>
          </div>
        )}
      </Card>
    </main>
  );
}
