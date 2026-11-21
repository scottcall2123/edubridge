"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { ensureDemoTeacher, ensureDemoUser } from "@/lib/demo";
import { getTeacherRole } from "@/lib/auth";
import { isLocale } from "@/lib/i18n";
import type { User } from "@supabase/supabase-js";
export type AuthState = { error?: "invalid" | "login" | "setup" };
async function saveProfileLocale(
  supabase: Awaited<ReturnType<typeof createClient>>,
  user: User,
  isTeacher = false,
) {
  const locale = isTeacher
    ? user.user_metadata.edubridge_locale
    : (
        await supabase
          .from("profiles")
          .select("locale")
          .eq("id", user.id)
          .single()
      ).data?.locale;
  if (isLocale(locale))
    (await cookies()).set("NEXT_LOCALE", locale, {
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
  let teacher = false;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword(input.data);
    if (error || !data.user) return { error: "login" };
    teacher = Boolean(await getTeacherRole(data.user.id));
    await saveProfileLocale(supabase, data.user, teacher);
  } catch {
    return { error: "login" };
  }
  redirect(teacher ? "/teacher" : "/dashboard");
}
async function signInDemo(role: "student" | "teacher"): Promise<void> {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY)
    redirect("/login?error=setup");
  let failure = false;
  try {
    const credentials = await (role === "teacher"
        ? ensureDemoTeacher()
        : ensureDemoUser()),
      supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    if (error || !data.user) failure = true;
    else await saveProfileLocale(supabase, data.user, role === "teacher");
  } catch {
    failure = true;
  }
  if (failure)
    redirect(
      role === "teacher" ? "/login?error=teacherSetup" : "/login?error=setup",
    );
  redirect(role === "teacher" ? "/teacher" : "/dashboard");
}
export async function demoLogin(): Promise<void> {
  await signInDemo("student");
}
export async function demoTeacherLogin(): Promise<void> {
  await signInDemo("teacher");
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
