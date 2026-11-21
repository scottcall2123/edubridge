# Your setup steps

The code builds without keys, but real login needs your Supabase project. Never paste private keys into GitHub or chat.

## Supabase

1. Open https://supabase.com and sign in with GitHub. Create project `edubridge` in Singapore. Save the database password privately.
2. In Project Settings → API, copy the project URL, `anon` public key and `service_role` secret key.
3. Authentication → Sign In / Providers → Email: turn OFF **Confirm email**.
4. In SQL Editor, run `supabase/migrations/001_init.sql` first, then `supabase/seed.sql`. Run the migration only once on a new project. The seed can be rerun.
5. Later, for P1 photo uploads: create a PRIVATE Storage bucket named `question-images`. Upload policies will be added with that feature.

## Environment variables

Copy `.env.example` to `.env.local` locally, or add the variables in Vercel → Settings → Environment Variables for Production and Preview:

- `NEXT_PUBLIC_SUPABASE_URL`: your project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: your anon public key.
- `SUPABASE_SERVICE_ROLE_KEY`: your secret service-role key. Server only.
- `DEMO_EMAIL`: `demo@edubridge.app` (dedicated demo account).
- `DEMO_PASSWORD`: choose a password for this demo account (the spec suggests `EduBridge2026!`). This account’s login details are deliberately visible on the login page for judges. Never reuse a personal password.
- `GEMINI_API_KEY`: obtain from Google AI Studio for step 7. It is not used by steps 1–4.
- `GEMINI_MODEL`: set to the available free Flash model when implementing step 7.

The demo button creates Aziza Karimova once and adds sample history once. It preserves later activity. If you change DEMO_PASSWORD after first login, update that demo user’s password in Supabase too.

## Vercel

1. Add New Project → import your `edubridge` repository. Use the detected Next.js settings.
2. Add the environment variables above for Production and Preview, then deploy. Redeploy after changing variables.
3. Open the deployed link in a private/incognito browser window. Test home → demo login → dashboard → logout → login again. Switch UZ/EN/RU and confirm the selection survives refresh.
4. Test a wrong password and direct access to `/dashboard` while logged out. Confirm a friendly error and a redirect to login.
5. With two separate Supabase test accounts and the anon key, confirm private questions, tutor messages, bookings and point events cannot be read across accounts. These hosted checks cannot run until you supply project configuration.
6. Run the full AGENTS.md section 21 checklist after steps 5 onward are implemented. The main learning flow is not part of this delivery.

## Optional local run

Use Node.js 22+, run `npm ci`, fill `.env.local`, then `npm run dev`. Visit http://localhost:3000. Run `npm run build` and `npm run lint` to verify changes.
