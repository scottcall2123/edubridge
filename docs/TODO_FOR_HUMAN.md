# Your setup steps

The code builds without keys, but real login needs your Supabase project. Never paste private keys into GitHub or chat.

## Supabase

**New for steps 11–12: run `supabase/migrations/005_forum.sql` once after your existing 001–004 migrations.** It adds public forum visibility plus atomic answer/rating/report functions. A separate private-image storage migration will be listed below when added. No existing migration or seed needs rerunning.

**New for steps 8–10: run `supabase/migrations/004_booking.sql` once in Supabase SQL Editor.** It makes booking + question status + the +3 points award atomic and retry-safe. Steps 9 and 10 need no additional migration. Keep migrations 001–003 applied; do not rerun them on your deployed project. Future sample slots are now refreshed automatically by the app; no seed rerun is needed.

For an existing steps 1–4 project: run `supabase/migrations/002_progress.sql`, then `supabase/migrations/003_tutor.sql` in SQL Editor. These enable atomic points/question saves and the tutor’s daily limit/retry protection. Do not rerun 001 on an existing database.

1. Open https://supabase.com and sign in with GitHub. Create project `edubridge` in Singapore. Save the database password privately.
2. In Project Settings → API, copy the project URL, `anon` public key and `service_role` secret key.
3. Authentication → Sign In / Providers → Email: turn OFF **Confirm email**.
4. For a NEW project only, run migrations `001_init.sql`, `002_progress.sql`, `003_tutor.sql`, `004_booking.sql` in that order, then `supabase/seed.sql`. Run each migration once. The seed can be rerun.
5. Later, for P1 photo uploads: create a PRIVATE Storage bucket named `question-images`. Upload policies will be added with that feature.

## Environment variables

Copy `.env.example` to `.env.local` locally, or add the variables in Vercel → Settings → Environment Variables for Production and Preview:

- `NEXT_PUBLIC_SUPABASE_URL`: your project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: your anon public key.
- `SUPABASE_SERVICE_ROLE_KEY`: your secret service-role key. Server only.
- `DEMO_EMAIL`: `demo@edubridge.app` (dedicated demo account).
- `DEMO_PASSWORD`: choose a password for this demo account (the spec suggests `EduBridge2026!`). This account’s login details are deliberately visible on the login page for judges. Never reuse a personal password.
- `GEMINI_API_KEY`: create a key at https://aistudio.google.com/apikey and add it only to the server environment. It is needed now for AI Ustoz.
- `GEMINI_MODEL`: use `gemini-3.8-flash` (also the code default). Confirm your project has access in Google AI Studio. See the official [model list](https://ai.google.dev/gemini-api/docs/models) and [free-tier pricing](https://ai.google.dev/gemini-api/docs/pricing). If Google changes availability, change this variable and redeploy.

The demo button creates Aziza Karimova once and adds sample history once. It preserves later activity. If you change DEMO_PASSWORD after first login, update that demo user’s password in Supabase too.

## Vercel

1. Add New Project → import your `edubridge` repository. Use the detected Next.js settings.
2. Add the environment variables above for Production and Preview, then deploy. Redeploy after changing variables.
3. Open the deployed link in a private/incognito browser window. Test home → demo login → dashboard → logout → login again. Switch UZ/EN/RU and confirm the selection survives refresh.
4. Test a wrong password and direct access to `/dashboard` while logged out. Confirm a friendly error and a redirect to login.
5. With two separate Supabase test accounts and the anon key, confirm private questions, tutor messages, bookings and point events cannot be read across accounts. These hosted checks cannot run until you supply project configuration.
6. Test dashboard: refresh twice and confirm only one daily +5 event; ask Algebra → topic → question. Confirm the question saves and +2 is awarded once. Choose a similar worked answer → helped → saved result and +5.
7. Ask a new question → AI Ustoz. Confirm a real reply in UZ, EN and RU. Ask “just tell me the answer” and verify it keeps guiding rather than giving the final result. Click simpler twice → gold teacher banner. Click understood once → problem solved → saved +10. Reload and log in again to confirm chats and points remain saved.
8. Check with two accounts that a copied `/tutor/{questionId}` URL cannot open someone else’s chat. Test the 30-reply limit with a dedicated test user, plus a failed Gemini request/retry. The UI should show friendly messages, never keys or raw errors.
9. After running 004 and the new deployment is ready, use AI Ustoz → simpler twice → teacher → pick a slot → simulated payment → confirmation. Confirm that Profile shows the booking, question status and exactly one +3 award. Refresh the confirmation and verify no extra points appear. Log out/in and confirm all histories remain.
10. Open the same free slot in two separate test accounts. After the first books it, the second must see a friendly slot-taken error and fresh slots. Confirm no money moves and the meeting placeholder is plain text.
11. Check the full landing page and profile at 375px and desktop, in UZ/EN/RU. Check profile language preference survives logout/login. Run the full section 21 checklist, noting registration/forum/leaderboard remain P1.
12. The pre-existing `app/api/debug-setup/route.ts` is marked temporary and remains unchanged in this delivery. Remove or disable that diagnostic route after setup verification; the latest upstream version probes Gemini models and returns diagnostic details.

## Optional local run

Use Node.js 22+, run `npm ci`, fill `.env.local`, then `npm run dev`. Visit http://localhost:3000. Run `npm run build` and `npm run lint` to verify changes.
