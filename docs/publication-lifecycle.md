# Publication Lifecycle

> How content moves from idea to production in the Git-First CMS (ADR-008).

---

## Overview

```
Draft (localStorage) → Review (admin panel) → Commit (src/content/) → Build → Deploy
```

All canonical content lives in `src/content/` and is versioned in Git. The admin
panel is the editing interface; Git is the database.

---

## Stage 1 — Authoring (Admin Panel)

**Where:** `/admin` → Content panel  
**Persistence:** AdminState in `localStorage` (`jootacee-command-v2`)  
**Backup:** IndexedDB parallel write (survives localStorage clear)

1. Writer opens the admin panel and edits a content item (article, project, lab, etc.)
2. Changes are saved automatically to localStorage via the admin reducer (800 ms debounce)
3. The item is in `status: 'draft'` — invisible on public pages

**Files involved:**
- `src/lib/admin/store.tsx` — reducer + auto-save
- `src/lib/admin/slices/cms.ts` — content mutation actions
- `src/lib/admin/idb.ts` — IndexedDB backup

---

## Stage 2 — Review (Admin Preview)

**Where:** `/admin` → Preview panel (or `/preview` route)

1. Writer switches item to `status: 'published'` in the admin panel
2. The preview page renders the full site using current AdminState
3. Writer verifies layout, i18n, and content accuracy
4. Any issues go back to Stage 1

---

## Stage 3 — Export to Git (Phase 3: VPS API)

> **Current status (Phase 2):** Manual export via admin panel Download button.  
> **Phase 3 target:** Automated Git commit via VPS Content API.

**Manual (Phase 2):**
1. Writer clicks "Download" in admin panel header
2. JSON export saved locally as `backups/admin-state-{date}.json`
3. Writer extracts article MDX and metadata from the export
4. Writer writes the MDX file to `src/content/articles/{slug}.mdx`
5. Writer updates `src/content/research/index.json` if it's a research item
6. Writer commits to Git: `git add src/content/ && git commit -m "content: publish {slug}"`

**Phase 3 (VPS API — planned):**
1. Admin panel calls `POST /api/content/publish` with item data
2. VPS API writes MDX + JSON to the Git working tree on the server
3. VPS commits with a structured message and pushes to `main`
4. CI/CD pipeline triggers automatically (Stage 4)

**Files involved:**
- `src/lib/api/content.ts` — VPS Content API client (Phase 3)
- `src/lib/api/git.ts` — VPS Git API client (Phase 3)
- `src/content/articles/` — MDX destination for articles
- `src/content/research/index.json` — JSON index for research items

---

## Stage 4 — Build (CI/CD)

**Trigger:** Push to `main` branch  
**Pipeline:** `.github/workflows/ci.yml` (quality → build → lighthouse → deploy)

1. `npm run typecheck` — zero TypeScript errors required
2. `npm run lint` — zero lint violations
3. `npm run test` — all Vitest tests pass
4. `npm run build` — Next.js static export to `dist/`
   - `getAllMeta()` reads MDX from `src/content/journal/` via Node.js `fs`
   - JSON loaders import all `src/content/**/*.json` at compile time
   - All routes generate static HTML files

**Files involved:**
- `src/lib/journal/articles.ts` — Node.js `fs` MDX loader
- `src/lib/content/json-loaders.ts` — JSON content imports
- `src/lib/content/adapters/mdx.ts` — `ContentRepository<ContentItem>` for articles

---

## Stage 5 — Deploy (Cloudflare Pages)

1. GitHub Actions pushes `dist/` artifact to Cloudflare Pages
2. Cloudflare propagates to global CDN (~30 seconds)
3. Public URL `https://jootacee.com/en/{slug}` becomes live

**Rollback:** Revert the Git commit that added the content, push to `main`.

---

## Content Types and Canonical Locations

| Content type | Canonical file | Build-time loader |
|---|---|---|
| Article (MDX) | `src/content/journal/{slug}.mdx` | `getAllMeta()` in `lib/journal/articles.ts` |
| Research | `src/content/research/index.json` | `RESEARCH_JSON` in `lib/content/json-loaders.ts` |
| Project | `src/content/projects/index.json` | `PROJECTS_JSON` in `lib/content/json-loaders.ts` |
| Lab | `src/content/labs/index.json` | `LABS_JSON` in `lib/content/json-loaders.ts` |
| System | `src/content/systems/index.json` | `SYSTEMS_JSON` in `lib/content/json-loaders.ts` |
| Tag | `src/content/taxonomies/tags.json` | `ALL_TAGS` in `lib/content/taxonomy.ts` |

---

## Canonical IDs

Every content item has a stable canonical ID in the format `{type}:{slug}`.

Examples: `article:building-with-llms`, `lab:aura`, `project:jootaceehub`

See `src/lib/content/canonical-id.ts` for the ID utilities.

---

## Transition Rules (ADR-008 Freeze)

- **No Supabase**: All content lives in `src/content/` — not in any database
- **No API routes**: `output: 'export'` prohibits server-side APIs at runtime
- **Admin = editing surface only**: AdminState never overrides committed content at build time
- **Git = canonical**: If AdminState and `src/content/` diverge, Git wins

---

## Future: Series Support (Phase 3)

When `src/content/taxonomies/series.json` is added, articles can belong to a
named series (e.g., "Building an AI Stack"). The `ALL_SERIES` export in
`lib/content/taxonomy.ts` is pre-wired as a stable empty array until then.
