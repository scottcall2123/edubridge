# Judge note — working MVP

EduBridge — working MVP

Link: https://edubridge-seven-alpha.vercel.app

Demo login: click **Demo bilan kirish** on the home page for the student demo. On the login page, choose **O‘quvchi sifatida kirish** for the student demo or **O‘qituvchi sifatida kirish** for the teacher demo. Both demo emails and the shared demo password are shown there.

Main flow to test:
Dashboard → Savol berish → choose subject and topic → write a question → see similar questions explained step by step → AI Ustoz bilan ishlash. The AI explains one step at a time and asks Tushundingmi? Press the simpler button twice to see the teacher option → choose a Fergana teacher and time → review the free lesson → confirm booking → Profile. Online lessons are free for school students, with no payment step. Alternatively, press understood, then problem solved, and open Profile to see saved points, questions and chat history. Log out and in again to verify persistence.

Teacher demo: book an algebra lesson with Dilnoza Rahimova as the demo student, then sign in with the teacher demo. Open the booking’s question card to see the AI Ustoz chat, where the student got stuck, and the attached homework image. The teacher can answer public algebra questions from the forum section.

P1 extras:
Register a student; grades 5–7 have a clearly simulated parent-code check (4821 shown on screen; no SMS). Post a public forum question, answer in steps from another account, and let the owner rate it once. Each star awards the helper four points. Reports are saved for manual moderation. Browse the sample-labeled Top-100 leaderboard. Attach a private JPEG/PNG image up to 5 MB to homework; type the question text for the AI too.

Real: Supabase login/registration and sessions; saved questions, chats, points, streaks and bookings; Google Gemini tutor; Postgres similar-question search; forum posts/answers/one-time ratings/reports; private image storage; UZ/EN/RU interface and AI reply-language selection.

Planned funding: Farg‘ona hokimiyat covers compensation for teachers’ extra online teaching. The MVP does not process teacher payouts or claim an approved funding agreement. Offline courses are separate offers.

Simulated/sample: teacher profiles, ratings and slots; meeting-link placeholder; parent SMS code; offline-course request; team-written example Q&A, sample leaderboard students and demo past activity.

Lessons and the Barkamol-Raqamli portfolio are labeled coming soon.

# Judge note — AI use

- ChatGPT Codex: wrote most application code from the team’s specification and performed local build, validation and screen checks.
- Claude (Anthropic), per the team-provided specification: brainstorming, logo design and the specification. The team should confirm any additional Claude Code review/improvement credit before submission.
- Google Gemini API: powers AI Ustoz inside the application.

Before submitting, all team members should review the MVP and be ready to explain how it works. Deployment configuration and the new P1 live acceptance checks must be verified by the team; local test evidence and its limits are in docs/VERIFICATION.md.
