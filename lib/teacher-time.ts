import { localDay, SOON_WINDOW_MS } from "./booking";
import type { TeacherSlot } from "./types";
export const TIME_FILTERS = [
  "now",
  "today",
  "tomorrow",
  "morning",
  "afternoon",
  "evening",
] as const;
export type TimeFilter = (typeof TIME_FILTERS)[number];
export function timeFilter(value?: string): TimeFilter | undefined {
  return TIME_FILTERS.find((filter) => filter === value);
}
export function matchesTime(
  slot: Pick<TeacherSlot, "starts_at">,
  when?: TimeFilter,
  now = new Date(),
) {
  if (!when) return true;
  if (when === "now")
    return Date.parse(slot.starts_at) <= now.getTime() + SOON_WINDOW_MS;
  if (when === "today") return localDay(slot.starts_at) === localDay(now);
  if (when === "tomorrow")
    return localDay(slot.starts_at) === localDay(new Date(now.getTime() + 86400000));
  const hour = new Date(Date.parse(slot.starts_at) + 5 * 3600000).getUTCHours();
  return when === "morning"
    ? hour >= 9 && hour < 12
    : when === "afternoon"
      ? hour >= 12 && hour < 17
      : hour >= 17 && hour < 21;
}
// What to show under a teacher's name. "now" means they have a free slot inside
// the same window the "Hozir" filter uses, so the badge and the filter can never
// disagree with each other.
export type Availability = "now" | "today" | "tomorrow" | "later" | "none";
export function availability(
  slots: Pick<TeacherSlot, "starts_at">[],
  now = new Date(),
): Availability {
  const next = slots
    .map((slot) => Date.parse(slot.starts_at))
    .filter((time) => time > now.getTime())
    .sort((a, b) => a - b)[0];
  if (!next) return "none";
  if (next <= now.getTime() + SOON_WINDOW_MS) return "now";
  const day = localDay(new Date(next));
  if (day === localDay(now)) return "today";
  if (day === localDay(new Date(now.getTime() + 86400000))) return "tomorrow";
  return "later";
}
