# JOOTACEEHUB — Engineering Constitution

> **Read this entire file before touching any code.**
> Historical context and progress log: [AGENTS.md](./AGENTS.md)
> This file is the law. AGENTS.md is the archive.

---

## 🚧 PHASE GIT-FIRST CMS — ACTIVE (started 2026-06-18)

**Architecture decision**: Supabase is deprecated. Git is the canonical content source. See [ADR-008](docs/adr/ADR-008-git-first-cms-architecture.md).

**Freeze rules (effective immediately, enforced as ANTI-PATTERNS below):**
- No new `import` from `@supabase/supabase-js` or `src/lib/supabase/`
- No new Supabase tables, RPC calls, or schema changes
- Content canonical location: `src/content/` (committed to Git)
- Admin panel writes: read-only until Content API (Phase 3) is implemented

**Phase 1 (Decision + Freeze) complete:** ADR-008 written, `src/content/` scaffolded, Supabase frozen.
**Phase 2 (Content migration):** Move journal MDX → `src/content/articles/`, migrate AdminState data to JSON files.
**Phase 3 (VPS backend):** Content API on Hostinger VPS — file ops, Git commit, media upload, JWT auth.

---

## ✅ PHASE 2 — ARCHITECTURE CONSOLIDATION (completed 2026-06-17)

Phase 1 feature freeze has been **lifted**. All 10 architecture consolidation steps are complete.

**Phase 2 summary:**
- Paso 1: ADRs (5 decisions) + ownership map in `docs/`
- Paso 2: Design token SSoT → `src/lib/design/tokens.ts`
- Paso 3: ContentItem schema → `src/lib/content/`
- Paso 4: Inline data → data modules (`lib/systems/`, `lib/resources/`, `lib/intelligence/`)
- Paso 5: Admin store sliced into 10 domain handlers (10 slice files under `lib/admin/slices/`)
- Paso 6: 3 monolithic panels split (ContentPanel→6 sub-files, StudioPanel→4, GitHubLayerPanel→5)
- Paso 7: Auth strategy centralized → `lib/auth/strategy.ts`; Google token moved to sessionStorage
- Paso 8: Design token separation verified (ui.ts → unidirectional from lib/design/)
- Paso 9: AI hub page at `/[locale]/ai/` (+2 static pages = 103 total)
- Paso 10: AGENTS.md updated, freeze lifted

**Current quality baseline:**
- 0 TypeScript errors · 0 lint errors · 401 tests · 103 static pages

---

## STACK

```
Next.js 16.2.6 · App Router · output: 'export' (static only)
React 19 · TypeScript strict · TailwindCSS v4
Framer Motion · GSAP · React Three Fiber + Drei
Vitest · React Testing Library · Zod · CVA
```

---

## LAW 1 — STATIC EXPORT IS SACRED

Every feature must work with `output: 'export'`. This is non-negotiable.

**Forbidden:**
- `getServerSideProps`, `headers()`, `cookies()`, server functions
- Dynamic routes without `generateStaticParams`
- API routes (`/api/...`) — use client-side state or localStorage instead
- `fetch()` to localhost at runtime — all data is either static or client-side

**Required for every new route:**
```ts
export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'es' }]
}
```

**Gate:** `npm run build` must output the expected HTML file in `dist/`. If it doesn't exist, the feature is broken.

---

## LAW 2 — TYPE SAFETY IS TOTAL

- Zero TypeScript errors at all times: `npm run typecheck` is the gate
- No `any` unless there's a comment explaining exactly why it exists
- All Redux-style actions are typed via discriminated union `AdminAction`
- Zod validates all external/persisted data: localStorage, JSON import, URL params
- When a type changes, update: interface → action type → reducer → Zod schema → all call sites

**Cascading change rule:** Never change a type without tracing the full impact chain first.

---

## LAW 3 — CSS: INLINE + CVA, ZERO .styles.ts FILES

The `.styles.ts` pattern is abolished. Every new component is ONE `.tsx` file.

```tsx
// ✅ CORRECT
import { cn } from '@/lib/utils'
import { cva } from 'class-variance-authority'
import { panel, btn, field, filterChip } from '@/styles/ui'

const card = cva('rounded-xl border bg-card/30', {
  variants: { muted: { true: 'opacity-60', false: '' } }
})

export function MyComponent({ visible }: { visible: boolean }) {
  return <div className={card({ muted: !visible })} />
}

// ❌ FORBIDDEN
import { styles as s } from './MyComponent.styles'
```

**Rules:**
- Static class → inline string
- Conditional merge → `cn("base", condition && "extra")`
- Enum/boolean variant → `cva()` in the same file
- Repeated pattern (3+ components) → add to `src/styles/ui.ts`
- Dynamic hex color from data → `style={{ color: accent }}` is OK (only for runtime values)
- When refactoring an existing `.styles.ts`: inline all classes, delete the file, run typecheck

---

## LAW 4 — ADMIN CMS ARCHITECTURE

```
State:   useReducer + React Context (AdminContext)
Persist: localStorage key 'jootacee-command-v2' + IndexedDB parallel write
Validate: Zod (AdminStateSchema.partial().safeParse) on every load
Actions: typed AdminAction discriminated union — never mutate state directly
```

**Adding a new panel:**
1. Add type to `AdminPanel` union in `types.ts`
2. Add action types to `AdminAction` union in `types.ts`
3. Add reducer cases in `store.tsx`
4. Add Zod schema entry in `schema.ts`
5. Add panel entry in `AdminShell.tsx` PANEL_GROUPS
6. Add `case 'panel-id': return <MyPanel />` in `PanelRouter.tsx`
7. Export from `panels/index.ts`

**Removing a panel:** reverse all 7 steps. Zero orphan imports.

---

## LAW 5 — I18N IS MANDATORY

Every user-visible string must come from `useTranslations(namespace)`.

```ts
const t = useTranslations('namespace')
// String: t('key')
// Array:  t('arrayKey') as unknown as string[]
// Object: t('obj') as unknown as Record<string, string>
```

**Commit rule:** New i18n keys must be added to BOTH `messages/en.json` AND `messages/es.json` in the same commit. Never one without the other.

**Gate:** Manually switch locale to `/es/` and verify translated text appears.

---

## LAW 6 — ERROR HANDLING IS SYSTEMATIC

```ts
// ✅ Everywhere in application code
import { reportError } from '@/lib/error'
try { ... } catch (err) { reportError(err, { context: 'where this happened' }) }

// ✅ Every landing section in page.tsx
<SectionErrorBoundary name="SectionName">
  <Suspense fallback={<SectionSkeleton />}>
    <LazySection />
  </Suspense>
</SectionErrorBoundary>

// ❌ Never in production code paths
console.error(...)
throw new Error(...) // without catching it upstream
```

---

## LAW 7 — PERFORMANCE GATES

| Metric | Minimum | Gate |
|--------|---------|------|
| Lighthouse Accessibility | ≥ 95 | CI blocks merge |
| Lighthouse SEO | = 100 | CI blocks merge |
| Lighthouse Best Practices | ≥ 85 | CI warns |
| Bundle: hero + nav | < 150kb gzipped | Manual check |
| Three.js / R3F | Lazy-loaded only | Code review |

**Mandatory lazy-loading:**
```ts
// Every heavy section / 3D component
const HeavySection = lazy(() => import('./HeavySection'))
// In JSX:
<Suspense fallback={null}><HeavySection /></Suspense>
```

---

## LAW 8 — TESTING IS NOT OPTIONAL

- Every new hook: at least one test covering the main behavior
- Every new utility function: at least one test per edge case
- UI components: test user interactions, not DOM structure
- Run: `npm run test` before marking any task done

```ts
// Pattern
import { render, screen, fireEvent } from '@testing-library/react'
// Test behavior: "user clicks X, Y happens" — not "div has class Z"
```

---

## LAW 9 — REFACTORING LAWS

**Extract when:**
- Same pattern appears in 3+ places → extract to shared component/utility
- A function exceeds ~40 lines → split into focused sub-functions
- A component exceeds ~300 lines → extract sub-components

**Never extract when:**
- The pattern appears only once or twice
- The abstraction requires more explanation than the duplication

**Migration pattern (`.styles.ts` → inline):**
```bash
# 1. Read the .styles.ts file — understand all values
# 2. Read the .tsx file — find all s.xxx references
# 3. Replace s.xxx with inline class strings or @/styles/ui imports
# 4. Delete the .styles.ts file
# 5. npm run typecheck — must pass before committing
```

**Deletion rule:** When a feature is removed, delete ALL associated code:
file → index.ts export → PanelRouter case → AdminShell nav entry → types.ts union → schema.ts enum → messages keys

---

## LAW 10 — COMMIT DISCIPLINE

Every commit must:
1. Pass `npm run typecheck` (zero errors)
2. Pass `npm run build` (zero errors, all routes in dist/)
3. Pass `npm run lint` (zero violations)
4. Pass `npm run test` (no failing tests)

Pre-commit hooks enforce #1, #3, #4 automatically via Husky + lint-staged.

**Message format:** `<type>: <what changed> — <why if non-obvious>`
Types: `feat`, `fix`, `refactor`, `style`, `test`, `docs`, `chore`

---

## ANTI-PATTERNS — NEVER DO THESE

| Anti-pattern | Why | Alternative |
|---|---|---|
| `.styles.ts` companion files | Doubles file count, no real benefit | Inline + CVA |
| `any` without comment | Loses type safety silently | Type it properly or add `// reason:` |
| `console.error` in prod paths | Silent in monitoring | `reportError()` |
| Fetch to API route | Breaks static export | localStorage / static data |
| `Math.random()` in render | SSR/hydration mismatch | Stable IDs from data |
| `new Date()` in default state | Hydration mismatch | Static ISO string |
| `useRef` to trigger state | Breaks React model | `useState` or `useReducer` |
| Multiple `.styles.ts` imports | Old pattern, abolished | Single file, inline |
| Nested ternaries in JSX | Unreadable | Extract to variable or `cn()` |
| `// TODO:` without ticket | Forgotten forever | Fix it now or open a GitHub issue |
| **New Supabase imports** | **Deprecated per ADR-008 — frozen** | **Git content files in `src/content/`** |
| **Content in localStorage as canonical** | **Not versionable, not SEO, not portable** | **`src/content/*.{mdx,json}` committed to Git** |

---

## DIRECTORY CONTRACT

```
src/
├── app/                    # Routes only. No business logic.
│   └── [locale]/           # All public routes under locale
├── components/
│   ├── admin/              # CMS shell + panels
│   │   └── panels/         # ONE file per panel — no .styles.ts
│   ├── architecture/       # Systems architecture visualizations
│   ├── labs/               # Lab product components
│   ├── layout/             # Navigation, footer, domain layout
│   ├── sections/           # Landing page sections
│   └── shared/             # Truly reusable UI primitives
├── content/                # ← CANONICAL CONTENT (Git source of truth)
│   ├── _schema/            # JSON Schema definitions for content types
│   ├── articles/           # Journal / blog posts (.mdx)
│   ├── research/           # Research articles (.mdx)
│   ├── projects/           # Project registry (.json)
│   ├── resources/          # Resource registry (.json)
│   ├── labs/               # Lab entries (.json)
│   ├── systems/            # Systems entries (.json)
│   ├── collections/        # Curated collections (.json)
│   ├── taxonomies/         # Tags + categories (tags.json)
│   └── journal/            # ← Legacy path (Phase 2: migrate to articles/)
├── hooks/                  # Custom React hooks
├── lib/
│   ├── admin/              # types.ts · store.tsx · schema.ts · state.ts
│   ├── error.ts            # Centralized error taxonomy
│   ├── i18n/               # Custom i18n (no next-intl)
│   ├── supabase/           # ← DEPRECATED (ADR-008). Freeze. No new features.
│   └── logger.ts           # Safe logger with noise filter
├── styles/
│   └── ui.ts               # Shared CVA design tokens (THE source of truth)
└── test/
    └── setup.ts            # Vitest setup
```

---

## QUICK REFERENCE

```bash
npm run dev          # Turbopack dev server
npm run build        # Static export → dist/
npm run typecheck    # tsc --noEmit (must be clean)
npm run lint         # ESLint
npm run test         # Vitest (watch: npm run test:watch)
npm run analyze      # Bundle analyzer (ANALYZE=true npm run build)
npm run clean        # rm -rf dist (fix Turbopack SST corruption)
```

**Key files:**
- `src/lib/admin/types.ts` — all admin types + action union
- `src/lib/admin/store.tsx` — reducer + context + persistence
- `src/lib/admin/schema.ts` — Zod validation
- `src/styles/ui.ts` — shared CVA design tokens
- `src/components/admin/AdminShell.tsx` — sidebar nav + PANEL_GROUPS
- `src/components/admin/PanelRouter.tsx` — panel routing
- `messages/en.json` + `messages/es.json` — all translations

@AGENTS.md
