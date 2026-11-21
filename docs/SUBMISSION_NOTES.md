# Judge note — working MVP

EduBridge — working MVP

Link: https://edubridge-seven-alpha.vercel.app

Demo login: click **Demo bilan kirish** on the home or login page. The dedicated demo email/password are also displayed on the login page; no account request or installation is needed.

Main flow to test:
Dashboard → Savol berish → choose subject and topic → write a question → see similar questions explained step by step → AI Ustoz bilan ishlash. The AI explains one step at a time and asks Tushundingmi? Press the simpler button twice to see the teacher option → book a Fergana teacher → simulated payment → confirmation → Profile. Alternatively, press understood, then problem solved, and open Profile to see saved points, questions and chat history. Log out and in again to verify persistence.

P1 extras:
Register a student; grades 5–7 have a clearly simulated parent-code check (4821 shown on screen; no SMS). Post a public forum question, answer in steps from another account, and let the owner rate it once. Each star awards the helper four points. Reports are saved for manual moderation. Browse the sample-labeled Top-100 leaderboard. Attach a private JPEG/PNG image up to 5 MB to homework; type the question text for the AI too.

Real: Supabase login/registration and sessions; saved questions, chats, points, streaks and bookings; Google Gemini tutor; Postgres similar-question search; forum posts/answers/one-time ratings/reports; private image storage; UZ/EN/RU interface and AI reply-language selection.

Simulated/sample: teacher profiles, ratings, prices and slots; payment (no money moves); meeting-link placeholder; parent SMS code; offline-course request; team-written example Q&A, sample leaderboard students and demo past activity.

Lessons and the Barkamol-Raqamli portfolio are labeled coming soon.

# Judge note — AI use

- ChatGPT Codex: wrote most application code from the team’s specification and performed local build, validation and screen checks.
- Claude (Anthropic), per the team-provided specification: brainstorming, logo design and the specification. The team should confirm any additional Claude Code review/improvement credit before submission.
- Google Gemini API: powers AI Ustoz inside the application.

Before submitting, all team members should review the MVP and be ready to explain how it works. Deployment configuration and the new P1 live acceptance checks must be verified by the team; local test evidence and its limits are in docs/VERIFICATION.md.
