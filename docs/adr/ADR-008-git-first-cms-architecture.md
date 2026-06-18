# ADR-008: Git-First CMS + Private VPS Backend

**Status:** Accepted  
**Date:** 2026-06-18  
**Deciders:** JootaCee  
**Supersedes:** ADR-006 (Content Source of Truth — Dual-Track CMS)  
**Related:** ADR-002 (static export), ADR-004 (admin state persistence), ADR-007 (deploy hook security)

---

## Context

ADR-006 accepted a three-track CMS where Supabase (Track A), localStorage (Track B), and MDX Git files (Track C) coexist. This was a pragmatic decision that preserved the `output: 'export'` constraint while enabling in-browser editing.

After operating under this model, the following problems are unresolved and architectural rather than implementation bugs:

1. **Three sources of truth** — Git, Supabase, and localStorage each hold content. No single source of truth. Taxonomy is duplicated between Supabase tags and AdminState registries. Media assets are split between Supabase `media_assets` and AdminState `MediaRegistry`.

2. **Supabase is client-side only** — Because `output: 'export'` forbids server-side APIs, Supabase is used purely client-side. This means zero pre-rendering for editorial content, SEO impact, and the content disappears if JavaScript fails. The core value proposition of Supabase (server-side auth, row-level security, realtime) is unusable in this configuration.

3. **localStorage is not a CMS** — AdminState in `localStorage` cannot support collaborative authoring, audit history, media storage, or schema evolution. Exporting it as JSON is manual and fragile. Its content is invisible to search engines until a rebuild.

4. **Every content change requires two operations** — Edit in admin panel → rebuild → deploy. Without a VPS build trigger, the second step is manual. This is already tracked in ADR-007 (deploy hook), but the root issue is that the pipeline lacks a canonical write path.

5. **Supabase adds operational overhead** — env vars in CI, a third-party dependency for a single-user site, potential billing changes, and vendor lock-in for content that is fundamentally just files.

---

## Decision

**Git is the single canonical source of truth for all content.**

All content lives in `src/content/` as versioned files (`.mdx`, `.json`). The admin web UI becomes an editor that writes to the repository, not the authoritative store.

A lightweight **private VPS backend** mediates all write operations:

```
Admin Web UI (Next.js static)
    │ HTTPS + JWT
    ▼
Content API — VPS (jootacee.com/api or api.jootacee.com)
    ├── Auth (JWT, session management)
    ├── Validation (Zod schemas for frontmatter + JSON)
    ├── File operations (read, write, rename, delete)
    ├── Git operations (commit, push to origin)
    ├── Media upload (resize, WebP conversion, write to public/media/)
    ├── Build trigger (npm run build → dist/ → Nginx swap)
    └── Audit log (append-only log of all mutations)
         │ writes
         ▼
Git Repository (canonical)
    src/content/
    ├── articles/        ← journal posts (.mdx)
    ├── research/        ← research articles (.mdx)
    ├── projects/        ← project registry (.json)
    ├── resources/       ← resource registry (.json)
    ├── labs/            ← lab entries (.json)
    ├── systems/         ← systems entries (.json)
    ├── collections/     ← curated collections (.json)
    └── taxonomies/      ← tags, categories (.json)
         │ npm run build
         ▼
Next.js Static Export → Nginx on Hostinger VPS
```

### What changes

| Before (ADR-006) | After (ADR-008) |
|------------------|-----------------|
| Supabase (Track A) | Deprecated → removed in Phase 3 |
| localStorage AdminState (Track B) | Persists as UI state only; not the canonical data store |
| MDX Git files (Track C) | Promoted to canonical; extended to all content types |
| Three taxonomies | One taxonomy: `src/content/taxonomies/` |
| Media in Supabase + AdminState | All media in `public/media/` committed to Git |

### What does NOT change (Phase 1)

- `output: 'export'` remains — LAW 1 is unchanged
- `localStorage` key `jootacee-command-v2` persists for UI preferences and admin panel state
- Existing `src/content/journal/` MDX files are untouched
- Existing build pipeline (GitHub Actions → Cloudflare Pages) continues working
- No Supabase code is deleted yet — it is frozen (no new features)

### Supabase freeze rule (effective immediately)

- No new Supabase tables, RPC calls, or schema changes
- No new imports from `@supabase/supabase-js` or `src/lib/supabase/`
- Existing Supabase-dependent components (`usePosts`, `useRelatedPosts`, `useMediaLibrary`, `useAdminStateSync`, `SupabaseLoginForm`, `AdminAuthGate [supabase mode]`) are frozen: no new features, only critical bug fixes
- Supabase env vars are kept in CI to avoid breaking the existing auth gate in production until Phase 3 removes it

---

## Content Schema: `src/content/`

### Articles (`.mdx`) — frontmatter

```yaml
---
id: string                    # kebab-case, unique
title: string
slug: string                  # URL slug, unique
description: string           # 120-160 chars for SEO
status: draft | published | archived
locale: en | es
tags: string[]                # refs to taxonomies/tags.json slugs
publishedAt: string           # ISO 8601
updatedAt: string             # ISO 8601
featured: boolean
coverImage: string | null     # path relative to /public/media/
readingTimeMinutes: number    # computed at build time
---
```

### Projects / Labs / Systems / Resources (`.json`) — schema

```json
{
  "id": "string",
  "title": "string",
  "slug": "string",
  "description": "string",
  "status": "draft | published | archived | deprecated",
  "locale": "en | es",
  "tags": ["string"],
  "publishedAt": "ISO 8601",
  "updatedAt": "ISO 8601",
  "featured": false,
  "coverImage": null
}
```

### Taxonomies (`.json`) — schema

```json
{
  "tags": [
    { "slug": "string", "label": "string", "color": "#hex", "description": "string" }
  ],
  "categories": [
    { "slug": "string", "label": "string", "parent": "string | null" }
  ]
}
```

---

## Migration Plan

| Phase | Work | When |
|-------|------|------|
| **1 — Freeze** | This ADR. Supabase frozen. `src/content/` scaffold created. | 2026-06-18 |
| **2 — Content migration** | Move `src/content/journal/` → `src/content/articles/`. Migrate AdminState data to JSON files. Create Zod schemas from frontmatter spec. | Phase 3 sprint |
| **3 — VPS backend** | Implement Content API on VPS (Hono/Bun or Express/Node). File ops, Git commit, media upload. JWT auth replacing Supabase auth. | Phase 4 sprint |
| **4 — Admin UI wiring** | Connect admin panels to Content API instead of localStorage/Supabase. CRUD operations write JSON/MDX to Git via API. | Phase 4 sprint |
| **5 — Supabase removal** | Delete `src/lib/supabase/`. Remove `@supabase/supabase-js` from package.json. Clean up all callers. | Phase 5 sprint |

---

## Consequences

**Positive:**
- One source of truth — every content item is a versioned file with full Git history
- SEO: all content is pre-rendered (static HTML) since it exists at build time
- No external service dependency for content reads
- Offline writing: authors can write `.mdx` files locally
- Taxonomy is unified — one `taxonomies/` directory, one tag namespace
- Media in Git (or Git LFS for large files) is reproducible and portable
- Admin audit log is just Git log

**Negative:**
- VPS backend is new infrastructure to maintain (Phase 3 work)
- Content changes require a build + deploy (~60–90s latency vs. instant Supabase write)
- Large media files need Git LFS or an external media CDN (acceptable tradeoff for this scale)
- Collaborative editing is impossible (single-admin site — non-issue)

**Mitigations:**
- Build trigger in Content API makes latency transparent to the editor (click Save → build runs in background)
- Git LFS available for media if repo size becomes an issue
- The VPS can serve media directly, keeping Git repo lean

---

## Alternatives Reconsidered

**Keep Supabase (status quo):** Rejected. The fundamental mismatch between `output: 'export'` and Supabase's server-side value adds more complexity than it resolves. The three-track CMS is a maintenance burden that grows with every content type added.

**Headless CMS (Sanity, Contentful, Tina):** Rejected. Third-party dependency, cost, vendor lock-in. The requirements (single-admin, infrequent updates, full Git history) are exactly what Git-native tools solve.

**Supabase with edge functions (breaking static export):** Rejected. LAW 1 (`output: 'export'`) is permanent for the public site. The admin panel can talk to a VPS backend but the public site must be static.

**Local Content API only (no VPS, edit via CLI):** Viable as interim. Admin web UI would only show content (no writes) until Phase 3. Acceptable for Phase 2.
