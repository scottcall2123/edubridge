# EduBridge

A learning platform for grades 8–11 in Fergana. Next.js App Router, TypeScript, Tailwind, next-intl and Supabase. AGENTS.md is the full specification.

## Development

Use Node.js 22 or newer. Run `npm ci`, copy `.env.example` to `.env.local`, fill in environment variables, then `npm run dev`. Run `npm run build` and `npm run lint` before committing.

## Environment

Supabase URL and anon key are public. Service-role key, Gemini key and demo password belong in server environment variables. Never commit `.env.local`.

## Status

Steps 1–4 are implemented: scaffold and shared UI, responsive navigation, UZ/EN/RU cookie-based languages, full database schema and seed files, email/password login, one-click demo login, logout and protected routes.

The dashboard is an authenticated welcome page for now. Learning, points logic, tutor, booking, profile and registration features are later steps; unfinished pages show a coming-soon card.

## Database and hosting

Follow [docs/TODO_FOR_HUMAN.md](docs/TODO_FOR_HUMAN.md). Run `supabase/migrations/001_init.sql` once on a new Supabase project, then `supabase/seed.sql`. The seed is safe to rerun. Demo user creation and sample history happen on first demo login and are never reset automatically.

No project secrets were provided, so hosted Supabase authentication has not been tested. Local PostgreSQL schema/seed checks and build results are recorded in docs/VERIFICATION.md. Next.js supports the requested middleware.ts file but reports a deprecation warning in favor of proxy.ts; the spec filename is retained.

Next: section 19 step 5, the complete dashboard and daily points rules.
