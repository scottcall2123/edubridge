export const locales = ["uz", "en", "ru"] as const;
export type Locale = (typeof locales)[number];
export function isLocale(value: unknown): value is Locale {
  return locales.includes(value as Locale);
}
export function pickLocale(
  row: Record<string, unknown>,
  field: string,
  locale: Locale,
): string {
  return String(row[`${field}_${locale}`] ?? row[`${field}_uz`] ?? "");
}
