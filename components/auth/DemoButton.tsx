"use client";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui";
export function DemoButton({
  role,
  formAction,
}: {
  role?: "student" | "teacher";
  formAction?: () => Promise<void>;
}) {
  const { pending } = useFormStatus(),
    t = useTranslations();
  return (
    <Button
      type="submit"
      formAction={formAction}
      disabled={pending}
      className="h-full w-full text-center"
      variant={role === "teacher" ? "secondary" : "primary"}
    >
      {t(
        pending
          ? "common.loading"
          : role
            ? `auth.demo_${role}`
            : "common.demoLogin",
      )}
    </Button>
  );
}
