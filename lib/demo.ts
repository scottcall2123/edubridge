import "server-only";
import { z } from "zod";
import { createAdminClient } from "./supabase/admin";
export function getDemoCredentials() {
  return z.object({ email: z.email(), password: z.string().min(8) }).parse({
    email: process.env.DEMO_EMAIL,
    password: process.env.DEMO_PASSWORD,
  });
}
export async function ensureDemoUser(
  retrying = false,
): Promise<{ email: string; password: string }> {
  const admin = createAdminClient(),
    { email, password } = getDemoCredentials();
  // Paginate instead of assuming the demo is among the first thousand users.
  let userId: string | undefined;
  for (let page = 1; !userId; page++) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 1000,
    });
    if (error) throw error;
    userId = data.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase(),
    )?.id;
    if (data.users.length < 1000) break;
  }
  if (!userId) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) {
      // Concurrent first logins may race to create the same account. Retry lookup once.
      if (
        !retrying &&
        ["email_exists", "email_already_exists"].includes(error.code ?? "")
      )
        return ensureDemoUser(true);
      throw error;
    }
    userId = data.user.id;
  }
  const { error: profileError } = await admin.from("profiles").upsert(
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
  if (profileError) throw profileError;
  const { error } = await admin.rpc("initialize_demo", { p_user: userId });
  if (error) throw error;
  return { email, password };
}
