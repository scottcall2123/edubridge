import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// TEMPORARY diagnostic route. Delete after setup is verified.
export const dynamic = "force-dynamic";

export async function GET() {
  const env = {
    NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    DEMO_EMAIL: Boolean(process.env.DEMO_EMAIL),
    DEMO_PASSWORD: Boolean(process.env.DEMO_PASSWORD),
    GEMINI_API_KEY: Boolean(process.env.GEMINI_API_KEY),
  };
  let adminCheck = "not-run";
  try {
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
    adminCheck = error ? `error: ${error.message}` : "ok";
  } catch (e) {
    adminCheck = `threw: ${e instanceof Error ? e.message : String(e)}`;
  }
  let dbCheck = "not-run";
  try {
    const admin = createAdminClient();
    const { error, count } = await admin
      .from("subjects")
      .select("id", { count: "exact", head: true });
    dbCheck = error ? `error: ${error.message}` : `ok: ${count} subjects`;
  } catch (e) {
    dbCheck = `threw: ${e instanceof Error ? e.message : String(e)}`;
  }
  return NextResponse.json({ env, adminCheck, dbCheck });
}
