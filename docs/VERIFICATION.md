# Verification — steps 1–12

## Teacher dashboard

Migrations 001–007 and the seed applied to an isolated PostgreSQL 17 database. SQL tests verified teacher-only lookup and unique account links, disconnection on Auth user deletion, private role linkage, service-only dashboard execution, same-booking question and chat ownership, exclusion of cancelled bookings, and isolation between teachers. The shared demo returned only its demo student’s booking, even when a regular student had booked the same teacher. The existing student booking and forum SQL regressions passed, including one-time point awards. Teachers could save and report forum posts and receive stars.

Chromium checked both demo login buttons, first teacher account creation and repeat login, student/teacher redirects, the upcoming lesson and preparation card, the five-minute signing request and photo rendering, expandable chat, and a saved teacher forum answer. UZ/EN/RU screens passed at 375, 768 and 1280 pixels. These checks used synthetic Auth and Storage endpoints with local PostgreSQL. Hosted Supabase verification follows the migration and demo walkthrough in TODO_FOR_HUMAN.md. Build, lint and all 26 unit tests passed.

## Language switching performance — 21 November 2026

Production build, lint and all 26 unit tests passed. A browser trace of the previous production build showed a locale-action POST followed by a redundant current-page RSC GET. The final production build switched UZ/EN/RU with only the action POST for the current page; automatic link prefetches were excluded from that comparison. Clicking the current language produced no page update request. Localized title/HTML language and cookie persistence after reload passed. This measures avoided work, not a production latency percentage.

At 375/768/1280, temporary local fixtures also checked both the header buttons and Profile language select. Each used one action without the extra page GET. With a simulated 400 ms action delay, the requested selection appeared immediately, controls stayed disabled while pending, and a typed form draft survived the translation update. A simulated HTTP 503 rolled the selected button back to the current locale, displayed a translated error and allowed a successful retry. No horizontal overflow or uncaught browser errors appeared. Fixtures were removed before the final build.

Checks were unauthenticated and local. The existing server action still verifies the Supabase user and awaits the profile preference write before setting the cookie; its account persistence behavior was not changed. Live account logout/login and timing checks remain in TODO_FOR_HUMAN.md. No new SQL or environment variables are required.

## Free online lessons update — 21 November 2026

Production build, lint and all 26 existing tests passed, including UZ/EN/RU key/ICU checks. Headless Chromium checked landing, teacher list, slot selection → free review → back, booking confirmation and saved Profile presentation in all three languages at 375/768/1280. It verified free lesson labels, planned funding copy, no displayed legacy rate or student payment simulation, preserved question links, retained slot selection, and the separate simulated offline-course request. No horizontal page overflow or uncaught browser errors appeared. Mobile teacher-list screenshot reviewed.

Screens used temporary synthetic-data fixtures, including a legacy booking with `payment_simulated=true`, to verify compatible display. Fixtures were removed before the production build. The existing reservation/points transaction was not changed. No production booking, teacher compensation or funding-agreement verification is claimed; live save/refresh/login checks remain in TODO_FOR_HUMAN.md. No new SQL files were added.

## Steps 11–12

Each P1 increment (forum, leaderboard, registration, images) passed a production build and lint before its commit. The polish pass checks all three dictionaries for matching, nonempty keys and ICU arguments, parses every message, and checks key text/background contrast ratios. The complete unit suite has 26 passing tests, including forum validation, leaderboard ordering, image type/path checks and signed parent-code expiry/tampering checks.

Migration 005 executed against local PostgreSQL 17. Transaction checks passed for retry-safe answer posting, public-only answers, owner-only ratings, blocked self-ratings, one-time helper points, deduplicated reports and service-only RPC permissions. Anonymous reads exposed public questions while hiding private homework. Migration 006 executed against a minimal local Supabase-style storage schema: private bucket configuration, 5 MB/type restrictions, owner uploads and cross-user/anonymous access denial passed. These are database checks, not a hosted Storage API test.

Headless Chromium checked register, forum list/detail controls, leaderboard, ask-image validation and navigation at 375/768/1280 pixels. No horizontal page overflow or uncaught browser errors appeared. Checks included dynamic answer steps, five rating controls, grade 7 parent-code simulation with submit gating, grade 8 removal of parent fields, invalid SVG rejection, tablet navigation, mobile forum access, skip link, and UZ/EN/RU copy with locale persistence. Temporary synthetic-data fixtures were removed before the final build.

Browser checks used dummy local Supabase configuration. They do not claim real new-account creation, hosted image upload, live Gemini responses or the new P1 end-to-end flow passed. The team reports steps 1–10 already deployed and tested live. Apply only migrations 005 and 006 to that existing project, then follow the new P1 and regression checklist in TODO_FOR_HUMAN.md.

## Step 10 and final screen checks

Landing build/lint passed. Headless Chromium checked the production server with the actual landing plus temporary teacher-list, booking, confirmation and profile fixtures at 375/768/1280: no horizontal overflow, preserved question links, slot selection → payment → back, no card form, simulated offline CTA, saved-history sections/chat expansion, profile language selection surviving reload, and UZ/EN/RU landing copy. A discovered Node/browser Uzbek number-format mismatch was fixed with canonical booking prices/dates and a shared server reference time; the rerun had no uncaught browser/hydration errors. Fixtures are removed before the final build. All 15 unit tests pass. Live booking/logout-login checks remain in TODO_FOR_HUMAN.md.

## Step 9

Profile build and lint passed; all 14 unit tests passed, including computed badge conditions and a new profile having no invented achievements. Saved histories are explicitly filtered to the authenticated user. No SQL migration is needed for step 9. Full hosted logout/login persistence checks still require live project configuration.

## Step 8

Build, lint and 12 tests passed. Migration 004 ran successfully in local PostgreSQL 17. Transaction checks passed: saved booking and +3 once on retries, question status saved, second user cannot take the slot, foreign/mismatched questions rejected, past slots rejected, failed writes rolled back and booking RLS isolates users. Slot tests cover Tashkent day boundaries, future-only times and labels. Live Supabase keys are not available in this workspace.

## Step 7

Production build, lint and all 9 automated tests passed. Tutor tests cover request validation, question validation, last-12-turn context, trusted action markers, prompt requirements and exactly one localized final check question with a 120-word cap.

Migration 003 executed successfully against local PostgreSQL 17. SQL checks passed for per-user parallel-request exclusion, repeat-start deduplication, idempotent completion, failed-request retry without duplicate messages/counters, two simpler requests, understood counts, a hard 30-AI-reply limit and service-only function permissions.

Headless Chromium checked actual dashboard/ask/similar/tutor components through temporary local fixtures at 375/768/1280. Checked subject/topic selection, automatic tutor start, two-simpler banner and preserved subject/question link, understood enabling solve, retry reusing its request ID, and limit UI. The real unconfigured API returned 401. No uncaught browser errors. Mobile screenshots reviewed. Fixtures used synthetic responses, were removed before the final build, and do not substitute for live integration tests.

No Supabase or Gemini keys were available. Real model quality (including refusal to reveal final answers), hosted auth/session behavior and the entire live saved-data flow require the acceptance steps in TODO_FOR_HUMAN.md.

## Step 5

Production build and lint passed. Four point-rule tests cover Tashkent midnight, repeat daily visits, missed-day penalties/cap/floor and streak continuation/reset. Migration 002 executed successfully in the local PostgreSQL database. Hosted Supabase keys remain unavailable.

## Step 6

Production build passed. Local PostgreSQL checks verify atomic question/+2 creation, private-by-default questions, stale-snapshot rejection, duplicate-request protection, one-time solve/+5 award and privileged RPC execution restrictions. Live authenticated flow still needs the Supabase environment variables.

- Step 1: `npm run build` passed before commit `cd021c3`.
- Step 2: `npm run build` passed before commit `2466654`.
- Step 3: `npm run build` passed before commit `916062f`.
- Step 4: `npm run build` and `npm run lint` passed. Lint has no warnings. Next.js emits its middleware-to-proxy deprecation notice; middleware.ts is kept to match AGENTS.md.

## Database checks

Executed the migration and seed in a temporary PostgreSQL 17 database with minimal Supabase auth roles and auth.uid() stand-ins. This verifies PostgreSQL behavior, not the hosted Supabase Auth service.

- Migration executes successfully; seed executes successfully twice without duplicate rows.
- Counts: 3 subjects, 15 topics, 9 teachers, 12 sample questions and answers, 18 leaderboard samples.
- First demo initialization inserts six sample events totaling 340 points. Repeating initialization does not duplicate events or reset later points.
- Authenticated user B cannot read user A’s private questions, tutor messages, bookings or points. The owner can read their rows.
- An anonymous request with no user claim cannot read the private question.
- Client column privileges prevent modifying profile points or inserting question status. Anonymous/authenticated roles cannot invoke privileged booking/demo functions.
- Booking a slot twice fails; the original booking remains intact.
- Similar-question search returns three answered examples of the requested subject.

## Browser checks

Tested the production server in headless Chromium:

- Home and login have no horizontal overflow at 375, 768 and 1280 pixels.
- UZ, EN and RU switching updates the UI and HTML language; selection survives reload.
- Home demo button reaches a translated setup error when keys are absent.
- Logged-out requests to dashboard, ask, profile, tutor, teacher booking and forum posting redirect to login.
- Email/password submission without configuration shows a translated setup message.
- No browser console errors during these checks. Mobile landing screenshot reviewed.

## Still requires a configured Supabase project

Actual Supabase user creation, email/password sign-in, session renewal, logout and login again, plus profile locale persistence through a real account. Follow TODO_FOR_HUMAN.md. No live project credentials were available, and successful live authentication is not claimed here.
