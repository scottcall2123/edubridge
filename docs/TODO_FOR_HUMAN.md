# Human actions for the deployed app

Steps 1–10 are already deployed and live-tested according to the team. Keep the existing working environment variables and seed data.

## Enable and test the teacher dashboard

1. Wait for Vercel to deploy the teacher dashboard update. Open **Supabase → SQL Editor → New query**, paste the full contents of [007_teachers.sql](../supabase/migrations/007_teachers.sql), and click **Run** once. Apply 005 and 006 first if they are still pending. Keep the existing seed and `DEMO_PASSWORD`. The first teacher demo login creates and links `ustoz.demo@edubridge.app` to the seeded algebra teacher Dilnoza Rahimova.
2. In one private browser window, open [/login](https://edubridge-seven-alpha.vercel.app/login) and choose **O‘quvchi sifatida kirish**. Ask an algebra question with a sample photo, start AI Ustoz, request a simpler explanation twice, and book a free time with **Dilnoza Rahimova** using the teacher link from the chat. Check that the booking appears in Profile.
3. In a separate browser profile or after logging out, open [/login](https://edubridge-seven-alpha.vercel.app/login) and choose **O‘qituvchi sifatida kirish**. Open the upcoming booking and check the student’s first name, UTC+5 time, homework photo, last AI step, simpler-request count and expandable chat. Use sample homework only in the shared demos.
4. Check that `/dashboard` and `/ask` send the teacher back to `/teacher`, and that the student account cannot open `/teacher`. A demo booking with a different teacher should stay out of Dilnoza’s dashboard. A booking by a regular student should also stay out of the shared teacher demo.
5. Publish a sample public algebra question as the demo student. Open it from the teacher’s forum section and save a reply with at least two steps. Confirm that the reply uses the linked teacher name. Try UZ, EN and RU and check the layout on a phone.

## Language switching speed update

No new SQL or environment settings are needed. After deployment, switch UZ/EN/RU from the header and Profile while logged in. Confirm the selected control reacts immediately, translated content follows, and any typed draft remains intact. Refresh, then log out and back in: the saved account language should return. Clicking the current language should not reload the page. Local network checks cover request count and simulated slow/failing switches; production account round-trip timing still depends on the connection and server/database region.

## Free online lesson update

No new SQL, environment variables or payment provider is needed for this change. After the app deployment, check teacher cards, teacher details, free lesson review, booking confirmation, saved Profile and landing in UZ/EN/RU. They must show that online lessons are free for school students, with no student price or payment step. Book a time and confirm that the booking and +3 points still persist after refresh/login.

Funding is described as a planned Farg‘ona hokimiyat model. Confirm the funding agreement, teacher eligibility, approved rates and attendance verification before real teacher payments begin. Actual payouts and compensation reports are not implemented. A later phase can add completed-lesson approval and a monthly teacher compensation report; keep pupil booking free.

## P1 SQL from the previous update, if not already applied

In Supabase → SQL Editor, run these once, in this order, only if you have not already applied them:

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
12. Repeat the AGENTS.md section 21 main-flow checklist after the new migrations. In particular: demo → ask → AI → two simpler clicks → teacher → free lesson review → confirmation → saved Profile → logout/login.

## Submission

`docs/SUBMISSION_NOTES.md` contains the two judge notes and the real deployment URL. Verify the URL and demo login button, review the stated AI credits, and ensure all team members can explain the MVP before copying the notes into the submission. Never copy API/service keys into the submission.

The temporary debug-setup endpoint was removed by upstream commits and is not reintroduced.

## For a brand-new project only

Create Supabase project `edubridge` in Singapore. Keep its database password private. Copy the project URL, anon key and service-role key into the environment. Turn OFF Email → Confirm email. Run migrations 001–007 in order, then `supabase/seed.sql`.

Import the repository into Vercel using detected Next.js settings. Set all variables from `.env.example` in Production and Preview. Keep secret keys server-only. Set dedicated demo email/password; the demo credentials are intentionally displayed for judges, so never reuse a personal password.

For local work: Node.js 22+, `npm ci`, copy `.env.example` to `.env.local`, fill it privately, then `npm run dev`. Run build/lint/tests before changes are committed.
