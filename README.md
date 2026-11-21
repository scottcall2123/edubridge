# EduBridge

A learning platform for grades 8–11 in Fergana. Next.js App Router, TypeScript, Tailwind, next-intl and Supabase. AGENTS.md is the full specification.

## Development

Use Node.js 22 or newer. Run `npm ci`, copy `.env.example` to `.env.local`, fill in environment variables, then `npm run dev`. Run `npm run build` and `npm run lint` before committing.

## Environment

Supabase URL and anon key are public. Service-role key, Gemini key and demo password belong in server environment variables. Never commit `.env.local`.

## Status

Step 1 scaffold. Database and auth follow in steps 3–4.
