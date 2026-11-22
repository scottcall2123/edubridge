import type { Locale } from "./i18n";

// Browsers and Node do not agree on Uzbek date data — some builds render
// November as "M11" — so Uzbek dates are written out here instead of being
// left to Intl. Fergana is a fixed UTC+5 with no daylight saving.
const TASHKENT_OFFSET_MS = 5 * 3600 * 1000;

const UZ_MONTHS = [
  "yanvar",
  "fevral",
  "mart",
  "aprel",
  "may",
  "iyun",
  "iyul",
  "avgust",
  "sentabr",
  "oktabr",
  "noyabr",
  "dekabr",
];
// Index 1 is Monday, matching the ISO weekday numbering.
const UZ_WEEKDAYS = [
  "",
  "Dushanba",
  "Seshanba",
  "Chorshanba",
  "Payshanba",
  "Juma",
  "Shanba",
  "Yakshanba",
];

function tashkent(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  const iso = new Date(date.getTime() + TASHKENT_OFFSET_MS).toISOString();
  const weekday =
    ((new Date(`${iso.slice(0, 10)}T00:00:00Z`).getUTCDay() + 6) % 7) + 1;
  return {
    year: Number(iso.slice(0, 4)),
    month: Number(iso.slice(5, 7)),
    day: Number(iso.slice(8, 10)),
    time: iso.slice(11, 16),
    weekday,
  };
}

export function formatDate(value: string | Date, locale: Locale) {
  if (locale === "uz") {
    const { day, month, year } = tashkent(value);
    return `${day}-${UZ_MONTHS[month - 1]}, ${year}`;
  }
  return new Intl.DateTimeFormat(locale, {
    timeZone: "Asia/Tashkent",
    dateStyle: "medium",
  }).format(new Date(value));
}

export function formatDateTime(value: string | Date, locale: Locale) {
  if (locale === "uz") return `${formatDate(value, locale)}, ${tashkent(value).time}`;
  return new Intl.DateTimeFormat(locale, {
    timeZone: "Asia/Tashkent",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatTime(value: string | Date) {
  return tashkent(value).time;
}

// Weekday with the day of the month, for grouping a list by day.
export function formatDayHeading(value: string | Date, locale: Locale) {
  if (locale === "uz") {
    const { day, month, weekday } = tashkent(value);
    return `${UZ_WEEKDAYS[weekday]}, ${day}-${UZ_MONTHS[month - 1]}`;
  }
  return new Intl.DateTimeFormat(locale, {
    timeZone: "Asia/Tashkent",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(value));
}

// 1 January 2024 was a Monday, so a plain weekday name needs no real date.
export function weekdayName(weekday: number, locale: Locale) {
  if (locale === "uz") return UZ_WEEKDAYS[weekday] ?? "";
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2024, 0, weekday)));
}
