import { z } from "zod";
export const bookingInput = z.object({
  slotId: z.uuid(),
  questionId: z.uuid().optional(),
});
export function localDay(value: Date | string) {
  return new Date(new Date(value).getTime() + 5 * 3600000)
    .toISOString()
    .slice(0, 10);
}
export function slotDate(value: Date | string) {
  return localDay(value).split("-").reverse().join(".");
}
export function formatUzs(value: number) {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
// The next quarter hour at least 10 minutes away, so "Hozir bo‘sh ustozlar"
// always has a real slot a student can actually book instead of sending them to
// tomorrow morning. Uzbekistan is a whole number of hours from UTC, so quarter
// hours line up and this needs no timezone maths.
export const SOON_LEAD_MS = 10 * 60000;
export const SOON_WINDOW_MS = 75 * 60000;
export function soonSlot(now = new Date()) {
  const quarter = 15 * 60000;
  return new Date(
    Math.ceil((now.getTime() + SOON_LEAD_MS) / quarter) * quarter,
  ).toISOString();
}
export function slotCandidates(now = new Date()) {
  const day = localDay(now),
    result: string[] = [];
  for (let offset = 0; offset < 4; offset++) {
    const date = new Date(Date.parse(`${day}T00:00:00Z`) + offset * 86400000)
      .toISOString()
      .slice(0, 10);
    for (const hour of ["09", "14", "17"]) {
      const at = new Date(`${date}T${hour}:00:00+05:00`);
      if (at > now) result.push(at.toISOString());
    }
  }
  return result;
}
export function slotLabel(
  startsAt: string,
  locale: string,
  t: (key: string) => string,
  now = new Date(),
) {
  // ICU locale data differs between Node and browsers. Keep numeric dates/times canonical.
  void locale;
  const day = localDay(startsAt),
    today = localDay(now),
    tomorrow = localDay(new Date(now.getTime() + 86400000));
  const date =
    day === today
      ? t("today")
      : day === tomorrow
        ? t("tomorrow")
        : slotDate(startsAt);
  return `${date} ${new Date(Date.parse(startsAt) + 5 * 3600000).toISOString().slice(11, 16)}`;
}
