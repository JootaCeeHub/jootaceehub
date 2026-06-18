# ADR-002: Static Export vs. CMS Backend

Status: Accepted
Date: 2026-06-17

## Context

The portfolio + hub is a personal site for a single admin user (JootaCee). The content changes infrequently. The deployment target is static hosting (Netlify / Cloudflare Pages). Early versions used `next-intl` which required server runtime APIs incompatible with `output: 'export'`.

## Decision

**`output: 'export'` is the permanent deployment target.** No API routes, no server components with runtime data fetching, no `headers()` / `cookies()` calls.

All CMS data flows:
```
Admin edits → localStorage (jootacee-command-v2) + IndexedDB → Static page renders from embedded data
```

For content that must be truly dynamic (live GitHub stats, AI feeds), the pattern is:
1. Client-side fetch from the public third-party API directly (GitHub GraphQL, RSS, etc.)
2. Optionally cache in `sessionStorage` / `IndexedDB` with a TTL
3. Never proxy through a Next.js API route

### What This Prohibits

- `getServerSideProps`, `headers()`, `cookies()`, server actions
- API routes under `/api/...`
- `fetch()` to localhost at runtime
- Dynamic routes without `generateStaticParams`

### What This Enables

- Zero-downtime deploys (static files have no server to restart)
- Free / cheap hosting forever
- No backend maintenance overhead
- Offline support via Service Worker (already implemented)

### Public AI Routing Implication (Paso 9)

The `/[locale]/ai/` hub is a static page that lists AI tools. Individual tools (AURA, Trading AI) remain client-side apps that can fetch from external APIs freely. The hub itself requires no server runtime.

## Consequences

**Positive:**
- Deployment is trivially reproducible (`npm run build` → upload `dist/`)
- No server attack surface for the public site
- Lighthouse SEO = 100 maintained (SSG = full HTML)
- No cold starts, no function timeouts

**Negative:**
- Content visible to crawlers is the content at build time — very-dynamic content (live feed counts, real-time analytics) must be loaded client-side after hydration
- Personalisation is impossible at the HTTP level (must be client-side)
- If the admin user wants a managed CMS backend in the future, this decision requires a full architecture change (tracked as Phase 3 option)

## Alternatives Considered

**Next.js with a Supabase backend (server components):** Viable if the site ever needs multi-user CMS or real-time content publishing. Would require migrating from `output: 'export'` to a serverless deployment. Tracked as a Phase 3 option.

**Headless CMS (Contentful, Sanity):** Rejected for now — adds cost and complexity for a single-user site. The admin panel already functions as a lightweight CMS via localStorage persistence.

**Astro for static, Next.js for admin:** Rejected — two frameworks for one codebase is more complex than one framework with a static export constraint.
