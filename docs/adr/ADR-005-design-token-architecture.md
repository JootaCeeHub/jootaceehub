# ADR-005: Design Token Architecture

Status: Accepted
Date: 2026-06-17

## Context

Design tokens exist in three partially-overlapping locations that must be kept manually in sync:

1. **`src/styles/ui.ts`** — CVA static primitives (class strings for components). Public, used by both landing pages and admin panels.
2. **`src/components/shared/ThemeApplicator.tsx`** — Runtime palette maps (`PALETTE_VARS`, `SHADER_GRADS`) applied as CSS custom properties when the user switches palettes. The comment in the file says "mirrors theme-init.ts" — an explicit admission of manual sync.
3. **`src/lib/config/theme-init.ts`** — A blocking inline `<script>` that runs before React hydration to apply the saved theme (prevents flash of unstyled content). It duplicates `PALETTE_VARS` and `SHADER_GRADS` as a self-contained JavaScript string, because the script must be independent of ES module bundling.

The manual sync between #2 and #3 is error-prone. A palette added to `ThemeApplicator.tsx` but forgotten in `theme-init.ts` causes the saved palette to flash back to default on every hard reload.

## Decision

**Two layers of tokens with a clear boundary:**

```
Layer A — Static (build-time, never mutated at runtime)
  src/styles/ui.ts          ← CVA class strings for components
  
Layer B — Runtime-configurable (user can switch palette / shader in admin)
  src/lib/design/tokens.ts  ← PALETTE_VARS, SHADER_GRADS, token option arrays (SINGLE SOURCE)
  ↑ imported by:
    src/components/shared/ThemeApplicator.tsx  (runtime applier)
    src/lib/config/theme-init.ts               (blocking init script)
```

### The `theme-init.ts` self-contained problem

`theme-init.ts` must emit a self-contained `<script>` string with no `import` calls (it runs before bundling in the browser). The solution:

```typescript
// src/lib/config/theme-init.ts
import { PALETTE_VARS, SHADER_GRADS } from '@/lib/design/tokens'

export function generateThemeInitScript(): string {
  return `
    (function() {
      var PALETTE_VARS = ${JSON.stringify(PALETTE_VARS)};
      var SHADER_GRADS = ${JSON.stringify(SHADER_GRADS)};
      // ... rest of the init logic
    })();
  `
}
```

At build time, Next.js bundles `generateThemeInitScript()` and `JSON.stringify()` of the imported constants becomes a static string literal in the compiled output. The browser receives a plain, import-free `<script>` block.

### Boundary rules

- `src/styles/ui.ts` must NEVER import from `src/lib/design/` (no circular dependency risk, clear separation of static vs. runtime)
- `src/lib/design/tokens.ts` is the single source for anything that `ThemeApplicator` and `theme-init` both need
- Adding a new palette requires editing ONLY `tokens.ts` — both appliers pick it up automatically

### Token Categories in `tokens.ts`

```typescript
export const PALETTE_VARS: Record<PaletteName, Record<string, string>> = { ... }
export const SHADER_GRADS: Record<PaletteName, [string, string]> = { ... }
export const PALETTE_OPTIONS: PaletteOption[] = [ ... ]  // for UI dropdowns
export type PaletteName = 'cyber' | 'aurora' | 'ember' | 'void' | 'ocean' | 'custom'
```

## Consequences

**Positive:**
- Adding a palette is a one-file change — no risk of forgetting the init script
- The `ThemeApplicator` comment "mirrors theme-init.ts" can be deleted — it's no longer true
- Type safety: `PaletteName` is defined once, used in both the applier and the init script type

**Negative:**
- `theme-init.ts` now imports from `tokens.ts` — a module that previously had no dependencies. If `tokens.ts` ever imports something heavy (unlikely), it would bloat the blocking init script via JSON.stringify.
- `JSON.stringify(PALETTE_VARS)` in the generated script adds ~2-4KB to the inline script. Acceptable given the FOUC prevention benefit.

## Alternatives Considered

**CSS custom property files (`.css`) as the source of truth:** Rejected — the admin panel allows custom hex colors that are applied via JavaScript, not statically-generable CSS. CSS variables as source requires a CSS-in-JS runtime or build step that doesn't fit the current stack.

**Keep all three in sync via a lint rule:** Rejected — a lint rule that diffs two JS objects is complex to write and fragile. Single-source-of-truth is simpler and more reliable.

**Extract to a `design-tokens.json` file:** Viable as a next step if the design token set grows large enough to warrant tooling (Style Dictionary, Theo). For the current size, a TypeScript file with named exports is clearer.
