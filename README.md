# EduBridge

A learning platform for grades 8–11 in Fergana. Next.js App Router, TypeScript, Tailwind, next-intl and Supabase. AGENTS.md is the full specification.

## Development

Use Node.js 22 or newer. Run `npm ci`, copy `.env.example` to `.env.local`, fill in environment variables, then `npm run dev`. Run `npm run build` and `npm run lint` before committing.

## Environment

Supabase URL and anon key are public. Service-role key, Gemini key and demo password belong in server environment variables. Never commit `.env.local`.

## Status

Steps 1–10 are implemented: shared UI, UZ/EN/RU, Supabase auth/demo login, dashboard and points, ask/similar answers, Gemini AI Ustoz, teachers and booking, saved-results profile, and the full landing page.

The learning paths save questions, chat history, counters, points, solved results and teacher bookings. AI Ustoz works one step at a time, supports simpler explanations, unlocks the teacher option after two simpler requests and limits each student to 30 AI replies per Tashkent day. Profile shows persisted histories and computed badges. Payments and offline-course requests are clearly simulated. Registration, forum posting, leaderboard and photo upload are P1 and still show coming-soon cards.

## Database and hosting

Follow [docs/TODO_FOR_HUMAN.md](docs/TODO_FOR_HUMAN.md). On a new project run migrations `001_init.sql`, `002_progress.sql`, `003_tutor.sql`, `004_booking.sql` in order, then `supabase/seed.sql`. On your deployed steps 1–7 project, run **only the new 004 migration**. No new keys or seed rerun are needed for steps 8–10. Demo history is initialized once and never reset automatically.

No project secrets were provided, so hosted Supabase authentication has not been tested. Local PostgreSQL schema/seed checks and build results are recorded in docs/VERIFICATION.md. Next.js supports the requested middleware.ts file but reports a deprecation warning in favor of proxy.ts; the spec filename is retained.

## AI setup and verification

Set server-only `GEMINI_API_KEY` from Google AI Studio. `GEMINI_MODEL` defaults to `gemini-3.8-flash`, checked against Google’s official model/pricing documentation. It can be overridden without code changes. No model call runs during build; missing keys produce the friendly busy state at runtime.

Run `npm test` for date/streak, input, history and tutor-prompt checks. Local PostgreSQL tests also exercised transaction idempotency, retry counters and the daily cap. Screen fixtures were tested at 375/768/1280 with synthetic tutor responses; fixtures are not included in production. Live Supabase/Gemini integration still requires your keys; see docs/VERIFICATION.md.

Build passed after each of steps 8, 9 and 10; lint and the expanded test suite pass. Local PostgreSQL checks cover booking retries, atomic points, ownership, subject match, past-slot rejection and cross-user booking isolation. Live deployment smoke checks remain for the human because production credentials are not in this workspace.

Next: section 19 step 11 (P1 features), then the final polish/submission checklist. The temporary debug-setup endpoint added before this work remains unchanged; remove or disable it after setup verification.
