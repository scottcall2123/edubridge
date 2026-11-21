# Decisions

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
