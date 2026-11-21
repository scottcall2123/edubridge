import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "./supabase/server";
import { createAdminClient } from "./supabase/admin";
import type { Profile } from "./types";

export const getTeacherRole = cache(async (userId: string) => {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  const { data, error } = await createAdminClient()
    .from("teachers")
    .select("id,full_name")
    .eq("user_id", userId)
    .maybeSingle();
  // Keep the student app available during the rollout before migration 007.
  if (error?.code === "42703" || error?.code === "PGRST204") return null;
  if (error) throw new Error("Teacher access unavailable");
  return data as { id: string; full_name: string } | null;
});

export const getCurrentUser = cache(async () => {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  const [{ data: profile }, teacher] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    getTeacherRole(user.id),
  ]);
  return { user, profile: profile as Profile | null, teacher };
});
export async function requireUser() {
  const current = await getCurrentUser();
  if (!current) redirect("/login");
  return current;
}
export async function requireStudent() {
  const current = await requireUser();
  if (current.teacher) redirect("/teacher");
  return current;
}
export async function requireTeacher() {
  const current = await requireUser();
  if (!current.teacher) redirect("/dashboard");
  return current;
}
