# Judge note — working MVP

EduBridge — working MVP

Link: https://edubridge-seven-alpha.vercel.app

Demo login: click **Demo bilan kirish** on the home page for the student demo. On the login page, choose **O‘quvchi sifatida kirish** for the student demo or **O‘qituvchi sifatida kirish** for the teacher demo. Both demo emails and the shared demo password are shown there.

Main flow to test:
Dashboard → Savol berish → choose subject and topic → write a question → see similar questions explained step by step → AI Ustoz bilan ishlash. The AI explains one step at a time and asks Tushundingmi? Press the simpler button twice to see the teacher option → choose a Fergana teacher and time → review the free lesson → confirm booking → Profile. Online lessons are free for school students, with no payment step. Alternatively, press understood, then problem solved, and open Profile to see saved points, questions and chat history. Log out and in again to verify persistence.

Teacher demo: sign in with **O‘qituvchi sifatida kirish**. Dilnoza Rahimova’s page opens on her next lesson with the demo student and shows what she needs before it starts: the student’s question, the attached homework photo, the exact AI Ustoz step the student stopped at, how many times they asked for a simpler explanation, and the full chat. Beside it, her own hours for the coming days are marked booked or free. She can also answer public algebra questions from the forum section. A teacher account cannot open any student page. To see a lesson arrive, book an algebra lesson with her from the student demo first.

Timetable: the student menu has **Jadval**, a grade 8 week from the national curriculum. The lesson hours and the attendance bars are sample data and are labelled as such on the page — EduBridge is not a school register. What sits beside them is real: for each lesson in a subject EduBridge covers, the page shows how many questions that student still has open in it and links straight to asking a new one. The dashboard shows the same for today, or for the next school day.

P1 extras:
Register a student; grades 5–7 have a clearly simulated parent-code check (4821 shown on screen; no SMS). Post a public forum question, answer in steps from another account, and let the owner rate it once. Each star awards the helper four points. Reports are saved for manual moderation. Browse the sample-labeled Top-100 leaderboard. Attach a private JPEG/PNG image up to 5 MB to homework; type the question text for the AI too.

Light and dark: the moon button in the top bar switches the whole interface; the choice is remembered in the browser and applied before the page paints.

Real: Supabase login/registration and sessions; saved questions, chats, points, streaks and bookings; Google Gemini tutor, including reading an attached homework photo; Postgres similar-question search; forum posts/answers/one-time ratings/reports; private image storage; the teacher account, its lesson preparation view and its own booked and free hours; the open-question counts shown against the timetable; UZ/EN/RU interface and AI reply-language selection.

Planned funding: Farg‘ona hokimiyat covers compensation for teachers’ extra online teaching. The MVP does not process teacher payouts or claim an approved funding agreement. Offline courses are separate offers.

Simulated/sample: teacher profiles, ratings and slots; the class timetable hours and attendance figures; meeting-link placeholder; parent SMS code; offline-course request; team-written example Q&A, sample leaderboard students and demo past activity.

The Barkamol-Raqamli portfolio is labeled coming soon.

# Judge note — AI use

- ChatGPT Codex: wrote most application code from the team’s specification and performed local build, validation and screen checks.
- Claude (Anthropic): brainstorming, the logo, the build specification Codex worked from, and a later round of review and development — the teacher side, the timetable, the homework-photo input to the tutor, page speed and the visual structure.
- Google Gemini API: powers AI Ustoz inside the application.

Before submitting, all team members should review the MVP and be ready to explain how it works. Deployment configuration and the new P1 live acceptance checks must be verified by the team; local test evidence and its limits are in docs/VERIFICATION.md.
