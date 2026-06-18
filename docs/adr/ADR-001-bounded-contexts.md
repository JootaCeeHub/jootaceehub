# ADR-001: Bounded Contexts

Status: Accepted
Date: 2026-06-17

## Context

The codebase grew organically from a Next.js landing page into a full CMS + portfolio system with 29 admin panels, 17 public routes, and a monolithic admin store with 59 top-level state keys. Without explicit domain boundaries, components import from anywhere and the responsibility of each subsystem is unclear.

## Decision

We define six bounded contexts. Each context owns its types, state slice, and components. Cross-context imports must flow in one direction only: Public can never import from Admin. Admin can never import from Analytics internals.

### Context Map

```
Public           ← entry point, no imports from Admin
  └── Content    ← static content rendered from Admin state (read-only at runtime)
  └── Design     ← public design tokens (CVA primitives, no runtime mutation)

Admin            ← CMS shell, panels, actions
  └── Integrations ← third-party API configs (GitHub, feeds, AI, newsletter)
  └── Analytics  ← performance data, PSI snapshots, history

(Admin ← Content bridge: intentional, one-way, feature-flag reads via localStorage only)
```

### Bounded Context Definitions

| Context | Entry Points | Key Types | Permitted Importers |
|---------|-------------|-----------|---------------------|
| **Public** | `src/app/[locale]/` | `NavItem`, `LocaleCode`, i18n messages | Anyone |
| **Content** | `src/lib/content/` | `ContentItem`, `Article`, `ProjectEntry` | Public pages, Admin panels |
| **Admin** | `src/lib/admin/`, `src/components/admin/` | `AdminState`, `AdminAction`, `AdminPanel` | Admin routes only (`src/app/admin/`) |
| **Integrations** | `src/lib/github/`, `src/lib/integrations/`, `src/lib/intelligence/` | `GithubConfig`, `IntegrationsConfig`, `IntelligenceConfig` | Admin (write), Public (read feature flags via localStorage) |
| **Design** | `src/styles/ui.ts`, `src/lib/design/` | `PaletteVar`, `ShaderGrad`, CVA tokens | Anyone (public tokens), Admin only (runtime palette mutations) |
| **Analytics** | `src/lib/analytics/`, `src/lib/monitoring/` | `PSIResult`, `PerfSnapshot` | Admin (write), CI/CD (read) |

### Known Intentional Bridges

Two public pages intentionally read admin config from localStorage:

1. `src/app/[locale]/github/page.tsx` — reads `adminState.github.showcase` to toggle live GitHub stats
2. `src/app/[locale]/intelligence/page.tsx` — reads `adminState.intelligence.feeds` to load curated sources

These are documented exceptions. They read only, never write, and use `safeLocalStorageRead()` with Zod validation as a fallback.

## Consequences

**Positive:**
- Clear ownership for each file — any engineer can answer "which context does this belong to?"
- Prevents Admin state leaking into public bundle (performance + security)
- Enables slice-level testing without loading the full AdminContext

**Negative:**
- Existing files that violate these boundaries need refactoring (tracked in Phase 2)
- The two intentional bridges must be explicitly maintained; adding a third requires a new ADR entry

## Alternatives Considered

**Monorepo with separate packages per context:** Rejected — adds toolchain complexity without benefit at current team size (1-2 devs). File-level boundaries enforced by convention + ESLint import rules are sufficient.

**Redux with separate stores per context:** Rejected — the admin CMS is a single user session; slicing the store while keeping a single `AdminContext` is the right trade-off (see ADR-004).
