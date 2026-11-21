# Verification — steps 1–4

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
