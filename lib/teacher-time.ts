import { localDay } from "./booking";
import type { TeacherSlot } from "./types";
export const TIME_FILTERS = ["today", "tomorrow", "morning", "afternoon", "evening"] as const;
export type TimeFilter = typeof TIME_FILTERS[number];
export function timeFilter(value?: string): TimeFilter | undefined {
  return TIME_FILTERS.find((filter) => filter === value);
}
export function matchesTime(slot: Pick<TeacherSlot, "starts_at">, when?: TimeFilter, now = new Date()) {
  if (!when) return true;
  if (when === "today") return localDay(slot.starts_at) === localDay(now);
  if (when === "tomorrow") return localDay(slot.starts_at) === localDay(new Date(now.getTime() + 86400000));
  const hour = new Date(Date.parse(slot.starts_at) + 5 * 3600000).getUTCHours();
  return when === "morning" ? hour >= 9 && hour < 12 : when === "afternoon" ? hour >= 12 && hour < 17 : hour >= 17 && hour < 21;
}
