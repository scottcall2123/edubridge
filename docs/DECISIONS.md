# Decisions

- Use create-next-app stable defaults, App Router, root app directory, npm and Tailwind.
- Use Manrope and supplied brand assets; light mode only.
- UI primitives share the design tokens from AGENTS.md.
- next-intl reads NEXT_LOCALE without URL prefixes; all three dictionaries have identical keys.
- Disable optional cacheComponents so cookie-based auth and locale remain request-scoped.
