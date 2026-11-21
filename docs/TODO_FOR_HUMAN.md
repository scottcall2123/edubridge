# Human actions for the deployed app

Steps 1–10 are already deployed and live-tested according to the team. Keep the existing working environment variables and seed data.

## Run exactly these new SQL files

In Supabase → SQL Editor, run these once, in this order:

1. `supabase/migrations/005_forum.sql` — public forum visibility; retry-safe answer posting, owner-only one-time ratings and helper points; report handling.
2. `supabase/migrations/006_question_images.sql` — creates/configures PRIVATE `question-images` storage, a 5 MB limit, JPEG/PNG MIME types and owner-folder read/upload/delete policies.

Do NOT rerun migrations 001–004 or the seed on your deployed project. No additional API keys or SMS provider are needed. 006 creates the bucket, so you do not need to create it manually. If you previously added custom broad storage policies, review them so they do not override owner-only access.

After the GitHub-triggered Vercel deployment is ready, perform the checks below. Redeploy only if you change environment variables; applying SQL does not itself require an app rebuild.

## Check new P1 features live

1. Open https://edubridge-seven-alpha.vercel.app in an incognito browser. Register a new grade 8 test student. Confirm that a profile is created and login reaches the dashboard.
2. Register a grade 7 test student: parent phone → Send code → on-screen **4821** with the simulation label. No SMS is sent. The form must stay disabled until the correct code is entered. This is a demonstration, not real parental identity verification.
3. In Forum, post a PUBLIC question. Confirm that a different account can see it, while private /ask homework remains invisible to other users.
4. From a second account, add at least two answer steps. As the question owner, give 1–5 stars. Confirm the helper receives +4 per star once, including after refresh/retry. The helper must not rate their own answer, and a non-owner must not rate it.
5. Report a question and an answer. Confirm the friendly acknowledgement and saved rows in Supabase `reports`; the team still needs to review reports manually.
6. Open the leaderboard logged out and logged in. Confirm sample labels, sorting, and highlighting of the current student when in the Top-100.
7. Ask a PRIVATE question with a genuine JPG/PNG up to 5 MB. Confirm the image persists on the similar-answer and tutor pages. Type the problem text too: the tutor uses text, not OCR.
8. Try SVG, an invalid file and a file over 5 MB. Confirm friendly rejection. Use a second account to verify that the first account’s storage folder and question image cannot be read, replaced or deleted.
9. If an upload fails, confirm the question remains saved and can continue without the image or retry the upload.
10. Switch UZ/EN/RU on register, forum, leaderboard, dashboard, tutor, teachers and profile. Confirm language survives refresh and login. Existing student-authored text/sample answers stay in their original language.
11. Test at 375, 768 and 1280 pixels. Check keyboard focus, skip link, tablet navigation, mobile menu, empty states and error messages. No raw errors or keys should appear.
12. Repeat the AGENTS.md section 21 main-flow checklist after the new migrations. In particular: demo → ask → AI → two simpler clicks → teacher → simulated payment → confirmation → saved Profile → logout/login.

## Submission

`docs/SUBMISSION_NOTES.md` contains the two judge notes and the real deployment URL. Verify the URL and demo login button, review the stated AI credits, and ensure all team members can explain the MVP before copying the notes into the submission. Never copy API/service keys into the submission.

The temporary debug-setup endpoint was removed by upstream commits and is not reintroduced.

## For a brand-new project only

Create Supabase project `edubridge` in Singapore; keep its database password private. Copy the project URL, anon key and service-role key into the environment. Turn OFF Email → Confirm email. Run migrations 001–006 in order, then `supabase/seed.sql`.

Import the repository into Vercel using detected Next.js settings. Set all variables from `.env.example` in Production and Preview. Keep secret keys server-only. Set dedicated demo email/password; the demo credentials are intentionally displayed for judges, so never reuse a personal password.

For local work: Node.js 22+, `npm ci`, copy `.env.example` to `.env.local`, fill it privately, then `npm run dev`. Run build/lint/tests before changes are committed.
