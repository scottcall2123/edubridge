"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { ensureDemoUser } from "@/lib/demo";
import { isLocale } from "@/lib/i18n";
export type AuthState = { error?: "invalid" | "login" | "setup" };
async function saveProfileLocale(
  supabase: Awaited<ReturnType<typeof createClient>>,
  id: string,
) {
  const { data } = await supabase
    .from("profiles")
    .select("locale")
    .eq("id", id)
    .single();
  if (isLocale(data?.locale))
    (await cookies()).set("NEXT_LOCALE", data.locale, {
      path: "/",
      maxAge: 31536000,
      sameSite: "lax",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
}
export async function login(
  _state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const input = z
    .object({ email: z.email(), password: z.string().min(1).max(200) })
    .safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });
  if (!input.success) return { error: "invalid" };
  if (!isSupabaseConfigured()) return { error: "setup" };
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword(input.data);
    if (error || !data.user) return { error: "login" };
    await saveProfileLocale(supabase, data.user.id);
  } catch {
    return { error: "login" };
  }
  redirect("/dashboard");
}
export async function demoLogin(): Promise<void> {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY)
    redirect("/login?error=setup");
  let failure = false;
  try {
    const credentials = await ensureDemoUser(),
      supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    if (error || !data.user) failure = true;
    else await saveProfileLocale(supabase, data.user.id);
  } catch {
    failure = true;
  }
  if (failure) redirect("/login?error=setup");
  redirect("/dashboard");
}
export async function logout(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.getUser();
    const { error } = await supabase.auth.signOut();
    if (error) redirect("/login?error=login");
  }
  redirect("/login");
}
