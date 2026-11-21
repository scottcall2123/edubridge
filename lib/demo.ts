import "server-only";
import { z } from "zod";
import { createAdminClient } from "./supabase/admin";
export const DEMO_TEACHER_EMAIL = "ustoz.demo@edubridge.app";
const demoTeacherId = "00000003-0000-4000-8000-000000000001";
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

export async function ensureDemoTeacher(retrying = false): Promise<{
  email: string;
  password: string;
}> {
  const email = DEMO_TEACHER_EMAIL;
  const password = z.string().min(8).parse(process.env.DEMO_PASSWORD);
  if (process.env.DEMO_EMAIL?.toLowerCase() === email)
    throw new Error("Demo roles must use separate accounts");

  const admin = createAdminClient();
  const { data: teacher, error: teacherError } = await admin
    .from("teachers")
    .select("id,user_id")
    .eq("id", demoTeacherId)
    .eq("is_sample", true)
    .single();
  if (teacherError) throw teacherError;

  let account;
  if (teacher.user_id) {
    const { data, error } = await admin.auth.admin.getUserById(teacher.user_id);
    if (error) throw error;
    account = data.user;
  } else {
    for (let page = 1; ; page++) {
      const { data, error } = await admin.auth.admin.listUsers({
        page,
        perPage: 1000,
      });
      if (error) throw error;
      account = data.users.find((u) => u.email?.toLowerCase() === email);
      if (account || data.users.length < 1000) break;
    }
    if (!account) {
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        app_metadata: { edubridge_demo_teacher: true },
      });
      if (error) {
        if (
          !retrying &&
          [
            "email_exists",
            "email_already_exists",
            "user_already_exists",
          ].includes(error.code ?? "")
        )
          return ensureDemoTeacher(true);
        throw error;
      }
      account = data.user;
    }
  }

  // An account with the reserved email alone must never acquire teacher access.
  if (
    account.email?.toLowerCase() !== email ||
    account.app_metadata.edubridge_demo_teacher !== true
  )
    throw new Error("Demo teacher account conflict");
  if (teacher.user_id === account.id) return { email, password };
  const { error } = await admin
    .from("teachers")
    .update({ user_id: account.id })
    .eq("id", teacher.id)
    .or(`user_id.is.null,user_id.eq.${account.id}`)
    .select("id")
    .single();
  if (error) throw error;
  return { email, password };
}
