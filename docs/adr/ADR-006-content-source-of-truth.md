# ADR-006: Content Source of Truth — Dual-Track CMS

**Status:** Superseded by [ADR-008](ADR-008-git-first-cms-architecture.md) (2026-06-18)  
**Date:** 2026-06-17  
**Deciders:** JootaCee  
**Related:** ADR-002 (static export), ADR-004 (admin state persistence)

> **This ADR is superseded.** The three-track CMS model accepted here proved to add more complexity than it resolved. Supabase is now deprecated (frozen, no new features). Git is the canonical content source. See ADR-008 for the new architecture and migration plan.

---

## Context

Phase 3 requires choosing a canonical storage layer for CMS content. The project has `output: 'export'` as an absolute constraint (LAW 1), ruling out server-side rendering, API routes, and `headers()`/`cookies()`. Two main candidates:

- **MDX Git-based**: Content lives as `.mdx` files in the repository. Processed at build time. Optimal SEO (pre-rendered HTML). Zero runtime cost. No runtime write capability.
- **Supabase client-side**: Content stored in PostgreSQL via Supabase. Fetched client-side after hydration. Compatible with `output: 'export'`. Supports runtime writes (CMS editing without rebuild).

Additionally, a third pattern already in use: **AdminState (localStorage)**, which manages portfolio-style content (projects, labs, systems, research) that rarely changes and is managed by a single admin.

---

## Decision

**Two-track CMS, not one.** The content domain splits naturally along edit frequency and authorship:

### Track A — Editorial Content (Supabase client-side)
- **Content types**: Journal posts, research articles with full rich text, media assets
- **Storage**: Supabase `journal_posts`, `media_assets` tables (already implemented)
- **Access pattern**: Client-side fetch after hydration, no SSG for content rows
- **Write path**: Admin CMS panels (`PostsManagerPanel`, `ContentEditorPanel`, `MediaLibraryPanel`)
- **Status**: Draft/published/archived via `PostStatus` enum on `journal_posts.status`
- **Tradeoff**: Content is not pre-rendered → JS must load before post is visible → SEO impact mitigated by static shell HTML + meta tags injected at build time

### Track B — Portfolio Content (AdminState / localStorage)
- **Content types**: ProjectEntry, LabEntry, SystemEntry, ResearchEntry (short-form registry items)
- **Storage**: localStorage key `jootacee-command-v2` + IndexedDB parallel backup
- **Access pattern**: Hydrates instantly from localStorage on admin panel open
- **Write path**: Admin panels dispatch `UPDATE_PROJECT`, `UPDATE_LAB`, etc. → stored in AdminState → rebuild required to publish to public pages
- **Status**: `cmsStatus: CmsStatus` field on ProjectEntry/ResearchEntry; `visible` on LabEntry/SystemEntry
- **Tradeoff**: Single-admin only. Changes require a rebuild to appear on the public site (addressed by Goal 9 — rebuild trigger).

### Track C — Static MDX (build-time only, read-only)
- **Content types**: Long-form articles committed as `.mdx` files in `src/content/`
- **Access pattern**: Processed by `gray-matter` / `next-mdx-remote` at build time
- **Write path**: Git commit + push + rebuild
- **Status**: Controlled by frontmatter `status: published` field (draft files excluded from `generateStaticParams`)
- **Use case**: Deep technical research that benefits from Git history, PR review, and offline writing

---

## Consequences

**Positive:**
- Each track is optimized for its content type and update frequency
- No impedance mismatch: fast portfolio updates via AdminState, rich editorial via Supabase, deep articles via Git
- Supabase is client-only → fully compatible with static export
- AdminState taxonomy (tagRegistry, categoryRegistry) serves Track B content; Supabase tags serve Track A
- MediaRegistry in AdminState handles portfolio item cover images; Supabase `media_assets` handles article media

**Negative:**
- Two separate tag systems that don't share data (Track A tags live in Supabase, Track B tags in AdminState)
- Public pages for portfolio content require a rebuild to reflect AdminState changes
- Supabase connection required for editorial CMS to work in admin; Portfolio CMS works offline

**Mitigations:**
- Deploy hook (Goal 9, ADR-007) provides one-click rebuild after portfolio edits
- Both tag systems use the same slug-based format — future unification possible if Supabase is extended to host portfolio content

---

## Alternatives Considered

**Pure MDX Git-based:**
- Pros: Zero external dependency, perfect SEO
- Cons: No in-browser CMS editing, requires Git knowledge for all content changes, no draft management without build

**Pure Supabase:**
- Pros: Single storage layer
- Cons: All public content becomes non-pre-rendered, significant SEO impact for portfolio items currently shipped as static HTML

**Hybrid MDX + AdminState only (no Supabase):**
- Pros: No external service dependency
- Cons: Rich text editing for journal posts becomes impossible without a build step per post
