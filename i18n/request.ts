import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { isLocale } from "@/lib/i18n";
export default getRequestConfig(async () => {
  const value = (await cookies()).get("NEXT_LOCALE")?.value;
  const locale = isLocale(value) ? value : "uz";
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
