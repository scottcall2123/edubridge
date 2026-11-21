"use server";
import { cookies } from "next/headers";
import { z } from "zod";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
export async function setLocale(value: string) {
  const locale = z.enum(["uz", "en", "ru"]).parse(value);
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from("profiles")
        .update({ locale })
        .eq("id", user.id);
      if (error) throw new Error("Could not save language");
    }
  }
  (await cookies()).set("NEXT_LOCALE", locale, {
    maxAge: 31536000,
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
}
