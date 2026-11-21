# Decisions

- Teacher access comes from a unique `teachers.user_id` link. The service-only dashboard query checks the link again and scopes each question and chat to a confirmed booking and its student. The shared demo is additionally limited to demo student bookings.
- Teacher forum replies use the linked teacher name and accept stars without adding a teacher to the student points system. Dashboard helped counts use distinct students with elapsed confirmed lessons because attendance is not tracked.

- Language switching: rely on Next.js cookie-mutation re-rendering instead of calling router.refresh again. This removes a measured extra RSC GET and its repeated page queries. Both language controls use an optimistic selection with pending/error feedback; same-language clicks do nothing. Keep authenticated profile persistence awaited before cookie success so errors remain retryable and preference saves are not moved to unordered background writes.

- 21 November product update: free online teacher lessons for school students, with planned Farg‘ona hokimiyat compensation for teachers. Replace student prices/payment simulation with free lesson review/confirmation in UZ/EN/RU, including Profile and landing. Actual payouts/attendance reporting are future work. Keep legacy database rate/payment fields without changing stored bookings; no new SQL is required. This supersedes earlier simulated-payment UI decisions below.

- Step 12: complete UZ/EN/RU key and ICU parity, localized metadata/errors, keyboard skip link and tablet icon navigation. Student-authored text and existing Uzbek sample answers retain their original language.
- P1 images use direct authenticated uploads to a private owner-folder bucket, avoiding the hosting request-body limit. Server attachment validates ownership, bytes, MIME and a conditional image update; signed URLs expire after five minutes. AI uses the typed question, without OCR.
- Registration uses real Supabase Auth. The simulated parent check is bound to the normalized phone and a ten-minute signed httpOnly cookie; it sends no SMS and does not claim parental identity verification.
- Public leaderboard returns only the displayed name/school/district/points projection; user IDs stay server-side and sample entries remain labeled. Forum subject filtering happens before the result limit, with paged answer counts.
- Existing deployed projects run only new migrations 005 and 006. No seed rerun, new secrets or manual storage bucket creation is needed. Live P1 acceptance remains a team task because production credentials are unavailable locally.

- P1 forum: open public posts are readable, while /ask questions remain private. Public page loaders query only public rows and return a limited projection; private answer/chat data remains behind ownership checks.
- Forum stars use a service-only transaction with the helper profile lock and expected snapshot. Only the question owner can rate another real author once; points/streak amounts stay in lib/points.ts.

- Preserved concurrent upstream Gemini fallback/diagnostic commits by rebasing the final landing commit onto updated main and rebuilding the combined state.

- Use deterministic numeric booking prices/dates and a server-provided reference time: Node and Chromium disagree on Uzbek ICU number grouping, which caused a hydration mismatch during screen tests. Canonical formatting fixes it without hiding hydration warnings.

- Step 10: landing copy follows all seven specified sections, keeps the supplied logos, and presents funding as a planned model rather than claiming signed partners. No invented statistics or reviews.
- Authenticated landing CTAs open the student dashboard instead of switching the current account to the demo user. All new UI copy has UZ/EN/RU keys.

- Step 9: profile histories use user-scoped RLS plus explicit user IDs and paged reads so Supabase’s default row limit does not silently truncate saved results. Badges are computed from saved questions/bookings/current streak, not invented activity.
- Profile language selection reuses the existing validated server action to save both profiles.locale and NEXT_LOCALE. Step 9 needs no SQL migration.

- Step 8: migration 004 retains book_slot and wraps it in a profile-locked transaction with the booking points from lib/points.ts; retrying the same user/slot/question returns the saved booking without another award.
- Future slots are generated relative to Asia/Tashkent at 09:00, 14:00, 17:00 and inserted only until each teacher has three future free slots. Unique teacher/time keys handle concurrent refreshes.
- Booking links preserve the originating question; both application checks and SQL enforce ownership and matching teacher subject. Payment/offline-course requests are explicitly simulated; meeting text is not a link.

- Next dev automatically appends its framework guidance block to AGENTS.md; retained it and consulted the installed Next.js guides for server mutations, fetching and route handlers.

- Step 7: use the official @google/genai SDK on the server, with gemini-3.8-flash as the env-overridable default, checked at https://ai.google.dev/gemini-api/docs/models and https://ai.google.dev/gemini-api/docs/pricing.
- Tutor turns reserve a per-user database lease and durable request ID. Retries reuse saved student turns/counters and completed replies; parallel tabs cannot bypass the 30-reply daily cap.
- Failed model calls keep the student turn but release the lease. No fabricated tutor answer is returned; the localized busy state offers retry and a teacher link.
- Keep the exact Socratic prompt and enforce a single localized final check question and short output in code. Real model behavior still requires live-key acceptance tests.

- Step 6: question creation, its +2 award, and profile totals share one transaction; a stable request UUID makes retries idempotent. Solves compare open status in the same transaction as the award.
- Similar answers are loaded through user-scoped RLS, sorted by stars then newest. The helped action accepts only an answer returned by that question’s similar search.

- Step 5: lib/points.ts owns all point and Tashkent date/streak rules; commit_progress locks the profile and uses an expected snapshot to retry concurrent updates without lost points or duplicate daily awards.
- Ask-flow questions are private by default, so solving homework does not publish student text automatically.

- Use create-next-app stable defaults, App Router, root app directory, npm and Tailwind.
- Use Manrope and supplied brand assets; light mode only.
- UI primitives share the design tokens from AGENTS.md.
- next-intl reads NEXT_LOCALE without URL prefixes; all three dictionaries have identical keys.
- Disable optional cacheComponents so cookie-based auth and locale remain request-scoped.
- Restrict database column grants as well as RLS; clients cannot award points, rate answers or book slots directly.
- Booking and one-time demo initialization use service-role-only transactions; explicit PUBLIC revokes close default function execution grants.
- Seed IDs are stable for safe reruns; slots are relative to seed time. Demo history has an is_sample flag.
- Use real Supabase authentication only; missing configuration shows a translated setup message rather than a fake login.
- Keep middleware.ts as specified, despite Next.js 16 recommending proxy.ts. Also verify authentication in protected server pages.
- Step 4 provides only an authenticated welcome dashboard; later features are explicitly coming soon.
- Demo credentials are rendered on the login page as required for judges; only dedicated demo credentials are exposed, and service/Gemini keys stay server-only.
