export interface RankingEntry {
  full_name: string;
  school: string | null;
  district: string | null;
  points: number;
  is_sample: boolean;
  isCurrent: boolean;
}
export function rankEntries(entries: RankingEntry[]) {
  return [...entries]
    .sort(
      (a, b) =>
        b.points - a.points || a.full_name.localeCompare(b.full_name, "uz"),
    )
    .slice(0, 100)
    .map((row, i) => ({ ...row, rank: i + 1 }));
}
