# Domain Ownership Map

> Last updated: 2026-06-17 (Phase 2 start)
> See [ADR-001](./adr/ADR-001-bounded-contexts.md) for the rationale behind these boundaries.

Each domain lists its entry-point files, key exported types, and which other domains may import from it.

---

## 1. Public

Everything a visitor sees. No admin, no CMS logic.

**Entry points:**
- `src/app/[locale]/page.tsx` — landing page
- `src/app/[locale]/layout.tsx` — locale layout with i18n provider
- `src/app/[locale]/*/page.tsx` — all public routes (journal, labs, systems, resources, research, projects, github, intelligence, about, contact)
- `src/components/layout/Navigation.tsx`, `Footer.tsx`
- `src/components/sections/` — landing page sections

**Key types:**
- `NavItem` (Navigation)
- `LocaleCode = 'en' | 'es'`
- i18n message namespaces (from `messages/*.json`)

**Key hooks / utilities:**
- `src/lib/i18n/context.tsx` — `useTranslations(namespace)`
- `src/lib/i18n/LocaleLink.tsx` — locale-aware `<a>`
- `src/lib/error.ts` — `reportError()`
- `src/components/shared/SectionErrorBoundary.tsx`

**Permitted importers:** Any domain (Public is the outermost layer — nothing may import FROM Public except `src/app/` route files).

**Must NOT import from:** `src/lib/admin/`, `src/components/admin/` (except the two intentional bridges — see ADR-001).

---

## 2. Content

Static and semi-static content types. Bridges the data layer (admin registries) and the public presentation layer.

**Entry points (target state after Phase 2):**
- `src/lib/content/types.ts` — `ContentItem` base + subtypes
- `src/lib/content/schema.ts` — Zod `ContentItemSchema`
- `src/lib/content/loaders.ts` — unified content loader
- `src/lib/journal/` — MDX article loading
- `src/content/journal/` — MDX source files + frontmatter

**Key types:**
- `ContentItem` — base interface for all content
- `Article`, `ProjectEntry`, `ResearchEntry`, `LabEntry`, `SystemEntry`, `ResourceEntry`

**Permitted importers:** Public pages, Admin panels (read-write).

**Must NOT import from:** `src/components/admin/` (content types are framework-agnostic).

---

## 3. Admin

The CMS shell: state management, panels, persistence, and auth gate.

**Entry points:**
- `src/app/admin/` — admin routes (layout, page)
- `src/lib/admin/store.tsx` — `AdminContext`, `useAdmin()`, `adminReducer`
- `src/lib/admin/types.ts` — `AdminState`, `AdminAction`, `AdminPanel` union
- `src/lib/admin/state.ts` — `createInitialState()`
- `src/lib/admin/schema.ts` — `AdminStateSchema` (Zod)
- `src/lib/admin/idb.ts` — IndexedDB parallel write
- `src/components/admin/AdminShell.tsx` — sidebar nav + header
- `src/components/admin/PanelRouter.tsx` — panel routing
- `src/components/admin/AdminAuthGate.tsx` — auth cascade

**Key types:**
- `AdminState` (59 top-level keys)
- `AdminAction` (159 discriminated union members → target: moved to slice files)
- `AdminPanel` (union of all panel IDs)

**Active panels (29 total):**

| Panel | File | LOC | Status |
|-------|------|-----|--------|
| About | `AboutPanel.tsx` | ~400 | OK |
| AI Assistant | `AIAssistantPanel.tsx` | ~600 | OK |
| Analytics | `AnalyticsPanel.tsx` + `analytics/` | ~1357 | Has sub-dir |
| Blocks | `BlocksPanel.tsx` | ~450 | OK |
| Capabilities | `CapabilitiesPanel.tsx` | ~800 | OK |
| Command | `CommandPanel.tsx` + `command/` | ~900 | Has sub-dir |
| Content Editor | `ContentEditorPanel.tsx` | ~350 | OK |
| Content | `ContentPanel.tsx` | ~1895 | **Split target** |
| Design Lab | `DesignLabPanel.tsx` | ~80 | OK |
| Design Studio | `DesignStudioPanel.tsx` | ~80 | OK |
| Design | `DesignPanel.tsx` | ~884 | OK |
| Footer Config | `FooterConfigPanel.tsx` | ~500 | OK |
| GitHub Layer | `GitHubLayerPanel.tsx` | ~1179 | **Split target** |
| Infra Manager | `InfraManagerPanel.tsx` | ~500 | OK |
| Intake | `IntakePanel.tsx` + `intake/` | ~400 | Has sub-dir |
| Integrations | `IntegrationsPanel.tsx` + `integrations/` | ~1400 | Has sub-dir |
| Intelligence Feeds | `IntelligenceFeedsPanel.tsx` + `intelligence/` | ~1000 | Has sub-dir |
| Labs Manager | `LabsManagerPanel.tsx` | ~700 | OK |
| Media Library | `MediaLibraryPanel.tsx` | ~200 | OK |
| Navbar Config | `NavbarConfigPanel.tsx` | ~550 | OK |
| Pages Dashboard | `PagesDashboard.tsx` | ~250 | OK |
| Pages | `PagesPanel.tsx` | ~120 | OK |
| Personality | `PersonalityPanel.tsx` | ~500 | OK |
| Posts Manager | `PostsManagerPanel.tsx` | ~280 | OK |
| Projects | `ProjectsPanel.tsx` + `projects/` | ~50 | Has sub-dir |
| Research Manager | `ResearchManagerPanel.tsx` + `research/` | ~100 | Has sub-dir |
| Search | `SearchPanel.tsx` | ~560 | OK |
| SEO | `SEOPanel.tsx` | ~380 | OK |
| Showcase | `ShowcasePanel.tsx` | ~750 | OK |
| Site Core | `SiteCorePanel.tsx` | ~320 | OK |
| Studio | `StudioPanel.tsx` | ~3011 | **Split target** |
| Systems Manager | `SystemsManagerPanel.tsx` | ~380 | OK |

**localStorage key:** `jootacee-command-v2`
**IDB store:** `admin-state`

**Permitted importers:** `src/app/admin/` only.

**Must NOT import from:** `src/app/[locale]/` (no public routes in admin logic).

---

## 4. Integrations

Third-party API configuration and data fetching. Owned by Admin (write), read by Public via localStorage feature flags only.

**Entry points:**
- `src/lib/github/` — GitHub GraphQL client + types
- `src/lib/integrations/` — integration config types + validators
- `src/lib/intelligence/` — intelligence feed types + categories
- `src/lib/newsletter/` — newsletter subscription logic
- `src/lib/cloudinary/` — image CDN helpers
- `src/lib/cms/` — CMS adapter (headless CMS abstraction)

**Key types:**
- `GithubConfig`, `GithubStats`, `GithubRepo`
- `IntegrationsConfig` (Platform, Source, File configs)
- `IntelligenceConfig`, `FeedItem`, `RSSFeed`

**Permitted importers:**
- Admin panels (read + write config)
- Public `github/page.tsx` and `intelligence/page.tsx` (intentional bridges — read-only via localStorage)

**Must NOT import from:** `src/lib/admin/store.tsx` directly (use localStorage bridges).

---

## 5. Design

Visual tokens and theme management. Two layers with different mutability:

**Layer A — Static (build-time, never mutated):**
- `src/styles/ui.ts` — CVA class string primitives for components
- `src/app/globals.css` — base CSS variables and keyframes

**Layer B — Runtime-configurable (target state after Paso 2):**
- `src/lib/design/tokens.ts` — `PALETTE_VARS`, `SHADER_GRADS`, palette option arrays ← **SINGLE SOURCE**
- `src/components/shared/ThemeApplicator.tsx` — applies `tokens.ts` as CSS custom properties
- `src/lib/config/theme-init.ts` — blocking init script (serializes `tokens.ts` to inline JS)

**Key types:**
- `PaletteName`, `PaletteVar`, `ShaderGrad`
- CVA variant maps in `ui.ts` (no exported types, just class strings)

**Permitted importers:**
- Layer A (`ui.ts`): anyone
- Layer B (`tokens.ts` → appliers): Design context only; Admin panels for palette switching

---

## 6. Analytics

Performance data collection and PSI snapshots. Write path is Admin-only; CI/CD reads the snapshot for Lighthouse gates.

**Entry points:**
- `src/lib/analytics/` — analytics event types + client
- `src/lib/monitoring/` — health monitoring types
- `src/lib/visuals/telemetry/` — scene performance telemetry
- `src/components/admin/panels/AnalyticsPanel.tsx` — UI for reading analytics
- `src/components/admin/panels/analytics/` — sub-components for 11 analytics tabs

**Key types:**
- `PSIResult`, `PerformanceSnapshot` (in AdminState)
- `VisualTelemetryAggregate`

**Permitted importers:**
- Admin Analytics panel (read + trigger audits)
- CI/CD via `lighthouserc.json` (reads `dist/` output)

**Must NOT import from:** `src/app/[locale]/` (no analytics injection in public pages — privacy).

---

## Cross-Domain Import Rules Summary

```
Public      → Content ✓, Design (Layer A) ✓
Content     → Public ✓, Admin (types only) ✓
Admin       → All ✓
Integrations→ Admin types ✓; Public via localStorage bridge only
Design A    → (no imports)
Design B    → tokens.ts imported by ThemeApplicator and theme-init only
Analytics   → Admin ✓
```

**Forbidden:**
```
Public   ← Admin       ✗  (admin state in public bundle)
Admin    ← Public      ✗  (circular)
Design A ← Design B    ✗  (static must not depend on runtime)
```
