# ADR-003: Client-Side Auth Strategy

Status: Accepted
Date: 2026-06-17

## Context

The admin panel (`/admin`) must be protected from public access. However, because the site uses `output: 'export'`, there is no server middleware that can enforce auth before serving the HTML. All auth enforcement must happen client-side after the page loads.

## Decision

A four-tier cascade resolves the auth mode at module load time. The first matching tier wins.

```
Tier 0: Supabase email/password  (NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY)
Tier 1: Google OAuth JWT         (NEXT_PUBLIC_GOOGLE_CLIENT_ID)
Tier 2: SHA-256 password gate    (NEXT_PUBLIC_ADMIN_PASS = hex string of length 64)
Tier 3: Production hard-block    (no env vars, NODE_ENV=production → setup screen)
Tier 4: Dev open access          (no env vars, NODE_ENV=development → allow through)
```

The cascade is detected once at module load in `src/components/admin/AdminAuthGate.tsx` via compile-time constants (`process.env.NEXT_PUBLIC_*`). This is safe because Next.js bakes these values into the static bundle at build time.

### Auth Token Storage

| Tier | Token stored in | Expiry |
|------|----------------|--------|
| Supabase | Supabase SDK internal (localStorage) | Per Supabase session policy |
| Google OAuth | `sessionStorage['jootacee-admin-auth-v1']` | Browser session close |
| SHA-256 gate | `sessionStorage['admin-gate-v1']` | Browser session close |

**Rule:** Auth tokens go in `sessionStorage`, not `localStorage`. The admin state (content, design, config) goes in `localStorage`. This prevents auth state from surviving a browser restart while content edits persist indefinitely.

### Security Posture

This is **security by obscurity for a personal site**, not enterprise-grade auth. The threat model is:
- Prevent casual discovery by web crawlers or curious visitors
- Prevent accidental public deployment without any auth (Tier 3 hard block)
- Not designed to prevent a determined attacker with the bundle source

For true security, deploy with Supabase (Tier 0) which validates credentials server-side via RLS.

### Future: `src/lib/auth/strategy.ts`

The auth mode detection logic should be extracted from `AdminAuthGate.tsx` into `src/lib/auth/strategy.ts` to make it testable. This refactor is tracked in Phase 2, Paso 7.

## Consequences

**Positive:**
- Works with `output: 'export'` (no middleware needed)
- Tier 3 hard block prevents accidental public exposure in production
- Developers can work locally without any auth config
- Four tiers cover the full spectrum from zero config to enterprise Supabase

**Negative:**
- The HTML and JS for the admin panel are always delivered to the browser — auth is UI-level, not HTTP-level
- A determined attacker with the bundle can read (but not write) admin UI code
- Auth mode is fixed at build time — changing auth method requires a redeploy

## Alternatives Considered

**Cloudflare Access / Netlify Identity:** Rejected — adds third-party service dependency and breaks the zero-config local dev experience.

**Basic Auth via `_headers`:** Rejected — Cloudflare Pages and Netlify support HTTP Basic Auth via `_headers`, but it can't read `NEXT_PUBLIC_*` build-time env vars, creating a split config. Also, Basic Auth credentials travel in every request header.

**Single middleware with all 4 tiers:** Rejected — `middleware.ts` requires server runtime, incompatible with `output: 'export'`.
