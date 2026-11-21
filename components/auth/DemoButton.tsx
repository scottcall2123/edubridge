"use client";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui";
export function DemoButton() {
  const { pending } = useFormStatus(),
    t = useTranslations("common");
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {t(pending ? "loading" : "demoLogin")}
    </Button>
  );
}
