# EduBridge

[Open EduBridge](https://edubridge-seven-alpha.vercel.app) · Team Renessans · UzHack 2026

A step-by-step learning platform for grades 8–11 in Fergana. Students first explore explained examples, then work with AI Ustoz, and can book a Fergana teacher if they are still stuck.

## Run locally

Use Node.js 22+. Run `npm ci`, copy `.env.example` to `.env.local`, fill the values, and run `npm run dev`.

Checks: `npm run build`, `npm run lint`, `npm test`.

## Database setup

On the deployed project, run [007_teachers.sql](supabase/migrations/007_teachers.sql) in Supabase SQL Editor after the teacher dashboard deploys. If 005 or 006 is still pending, apply it first:

1. `supabase/migrations/005_forum.sql`
2. `supabase/migrations/006_question_images.sql`

No seed rerun or new environment variables are needed. 006 creates/configures the private image bucket and owner-only policies.

For a brand-new project, run migrations 001 through 007 in numeric order, then `supabase/seed.sql`. See [human setup and acceptance checks](docs/TODO_FOR_HUMAN.md).

## Environment

The Supabase URL and anon key are public. Service-role key, Gemini key and demo password stay on the server. Never commit `.env.local`. Keep your working deployment variables unchanged.

`GEMINI_MODEL` optionally overrides the model. The current upstream default is `gemini-3.1-flash-lite`, with `gemini-3.8-flash` as a fallback. The model key is read only in server code.

## Status

Steps 1–12 are implemented: responsive UZ/EN/RU layout, real Supabase auth and demo login, dashboard/points/streaks, ask and similar answers, Gemini tutor, teachers/booking, profile histories, landing, public forum with answers/stars/reports, Top-100 leaderboard, registration with simulated parent code, and private JPEG/PNG uploads up to 5 MB.

Forum posts are explicitly public. Private homework and images are available to the student and, for upcoming confirmed bookings with a linked question, the booked teacher. Student text and team-written sample answers keep their original language. Interface text, subjects, topics and teacher bios support UZ/EN/RU.

The login page offers student and teacher demo buttons. The teacher demo uses `ustoz.demo@edubridge.app` and the existing `DEMO_PASSWORD`. The first login links it to Dilnoza Rahimova. Her shared demo shows the demo student’s bookings only. The teacher dashboard shows upcoming lessons, AI Ustoz preparation cards with a five-minute homework photo URL, booking-based stats, and public forum questions in the teacher’s subject.

Language switching uses one server action to save the cookie/account preference and return the translated page, without a second forced page fetch. The selected language responds immediately while saving, and selecting the current language sends no request. No SQL or environment changes are needed for this optimization.

Online teacher lessons are free for school students. Teacher cards and booking/profile screens show free lessons; booking uses a review and confirmation with no payment step. Planned compensation for teachers’ extra online teaching comes from Farg‘ona hokimiyat. No approved funding agreement or actual payout is claimed. This update needs no new SQL or environment variables; existing database rate/payment fields remain only for compatibility.

Parent SMS and offline-course requests are clearly simulated. Teachers, ratings, slots, example questions, sample leaderboard entries and demo history are labeled sample data. No real video meeting is created. Offline courses are separate offers with terms set by the learning center.

Lessons and the Barkamol-Raqamli portfolio remain intentional P2 coming-soon cards.

The team reports steps 1–10 are deployed and live-tested. This session added local tests for the P1 features; run the live acceptance checks after applying 005/006. No known failing local build/lint/tests. Next.js still emits a middleware-to-proxy deprecation notice; middleware.ts is retained to match AGENTS.md. Upstream Gemini fixes and removal of the temporary diagnostic endpoint are preserved.

## Handoff

- [Human actions](docs/TODO_FOR_HUMAN.md)
- [Verification evidence and limitations](docs/VERIFICATION.md)
- [Decisions](docs/DECISIONS.md)
- [Submission notes](docs/SUBMISSION_NOTES.md)
- AGENTS.md is the full product specification.

Demo login creates Aziza Karimova and sample past activity only once, and never resets later results automatically.
