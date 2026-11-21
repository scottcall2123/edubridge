import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "./supabase/server";
import type { Profile } from "./types";
export const getCurrentUser = cache(async () => {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  return { user, profile: profile as Profile | null };
});
export async function requireUser() {
  const current = await getCurrentUser();
  if (!current) redirect("/login");
  return current;
}
