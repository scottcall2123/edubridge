import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// TEMPORARY diagnostic route. Delete after setup is verified.
export const dynamic = "force-dynamic";

function describe(v: string | undefined) {
  if (!v) return "missing";
  return { length: v.length, trimmedLength: v.trim().length };
}

export async function GET() {
  const out: Record<string, unknown> = {
    demoEmail: describe(process.env.DEMO_EMAIL),
    demoEmailValue: process.env.DEMO_EMAIL ?? null,
    demoPassword: describe(process.env.DEMO_PASSWORD),
    supabaseUrl: describe(process.env.NEXT_PUBLIC_SUPABASE_URL),
    anonKey: describe(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    serviceKey: describe(process.env.SUPABASE_SERVICE_ROLE_KEY),
  };

  const email = (process.env.DEMO_EMAIL ?? "").trim();
  const password = (process.env.DEMO_PASSWORD ?? "").trim();

  let userId: string | undefined;
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (error) out.listUsers = `error: ${error.message}`;
    else {
      out.listUsers = `ok: ${data.users.length} users`;
      userId = data.users.find(
        (u) => u.email?.toLowerCase() === email.toLowerCase(),
      )?.id;
      out.demoUserExists = Boolean(userId);
    }
  } catch (e) {
    out.listUsers = `threw: ${e instanceof Error ? e.message : String(e)}`;
  }

  if (!userId) {
    try {
      const admin = createAdminClient();
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (error)
        out.createUser = `error(${error.code ?? "?"}): ${error.message}`;
      else {
        out.createUser = "ok";
        userId = data.user.id;
      }
    } catch (e) {
      out.createUser = `threw: ${e instanceof Error ? e.message : String(e)}`;
    }
  }

  if (userId) {
    try {
      const admin = createAdminClient();
      const { error } = await admin.from("profiles").upsert(
        {
          id: userId,
          full_name: "Aziza Karimova",
          grade: 8,
          school: "12-maktab",
          district: "Farg‘ona sh.",
          is_demo: true,
        },
        { onConflict: "id", ignoreDuplicates: true },
      );
      out.profileUpsert = error ? `error: ${error.message}` : "ok";
    } catch (e) {
      out.profileUpsert = `threw: ${e instanceof Error ? e.message : String(e)}`;
    }
    try {
      const admin = createAdminClient();
      const { error } = await admin.rpc("initialize_demo", { p_user: userId });
      out.initializeDemo = error ? `error: ${error.message}` : "ok";
    } catch (e) {
      out.initializeDemo = `threw: ${e instanceof Error ? e.message : String(e)}`;
    }
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    out.signIn = error ? `error(${error.code ?? "?"}): ${error.message}` : "ok";
  } catch (e) {
    out.signIn = `threw: ${e instanceof Error ? e.message : String(e)}`;
  }

  return NextResponse.json(out);
}
