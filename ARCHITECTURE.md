# JootaCee — Architecture

## Overview

Production-grade Next.js 16 static-export PWA with bilingual i18n (en/es), dark/light theming, 3D visuals, and an embedded admin dashboard. Built for zero server runtime dependencies.

## Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16.2.6 (App Router) |
| React | 19.2.4 |
| Styling | TailwindCSS v4 |
| Animations | Framer Motion, GSAP |
| 3D | React Three Fiber + Drei |
| Icons | Lucide React |
| Themes | next-themes |
| i18n | Custom context (no next-intl) |
| State | React Context + useReducer (admin) |
| Validation | Zod v4 |
| Testing | Vitest + React Testing Library + jsdom |

## Directory Structure

```
src/
  app/
    layout.tsx              # Root layout: fonts, ThemeProvider, preconnect
    page.tsx                # Redirect / → /en
    [locale]/
      layout.tsx            # Nested locale layout: I18nProvider, metadata
      page.tsx              # Landing page: sections + error boundaries
    admin/
      page.tsx              # Admin dashboard entry
  components/
    layout/                 # Navigation, Footer, barrel index.ts
    sections/               # Hero, Systems, Labs, etc. + barrel
    shared/                 # ErrorFallback, SectionErrorBoundary, etc. + barrel
    ui/                     # Reusable UI primitives + barrel
    admin/                  # AdminShell, PanelRouter, panels/ + barrel
    admin/panels/           # 7 admin panels + barrel
  hooks/                    # useMockData, etc. + barrel
  lib/
    admin/                  # types.ts, state.ts, schema.ts, store.tsx
    i18n/                   # Context, hooks, DocumentLang + barrel
    error.ts                # AppError, reportError, isAppError
    logger.ts               # Level-gated logger, console filter
    env.ts                  # Environment validation
    visuals/                # 3D scene config, telemetry
    infrastructure/         # Mock data helpers
  test/
    setup.ts                # Vitest mocks for next/navigation + next-themes
public/
  sw.js                     # Service worker with precache + SWR
  _headers                  # Security headers for static hosts
  offline.html              # Standalone offline page
  icons/                    # PWA icons (192, 512, maskable)
```

## i18n Architecture

Custom lightweight i18n designed specifically for static export compatibility:

- **No server APIs**: Replaces `next-intl` which requires `headers()` and `requestLocale`
- **Message files**: `messages/en.json`, `messages/es.json` imported as static JSON
- **Context**: `I18nProvider` wraps `[locale]/layout.tsx` with `key={locale}` to force remount on language switch
- **Hook**: `useTranslations(namespace)` resolves dot-notation keys; returns `any` for strings/arrays/objects
- **Routing**: `useLocaleRouter` and `LocaleLink` handle client-side locale transitions

## State Management

### Admin Dashboard
- **Reducer**: `adminReducer` in `src/lib/admin/store.tsx` handles 13 action types
- **Persistence**: Auto-saves to `localStorage` (key: `jootacee-admin-v1`) with 800ms debounce
- **Validation**: Zod schemas (`AdminStateSchema`) validate both localStorage load and JSON import; failures fall back to `createInitialState()`
- **Context**: `AdminProvider` + `useAdmin()` hook

### Telemetry
- Client-side only (`store-client.ts`); no API routes in static export
- Device tier detection (`detectTier()`) runs in browser for scene config

## Error Handling

Three-layer resilience strategy:

1. **Per-section boundaries**: `SectionErrorBoundary` wraps each landing section; if R3F/GSAP crashes, only that section shows `ErrorFallback`
2. **Error taxonomy**: `AppError` with `code`, `severity`, `context`, `timestamp`; `reportError()` safe sink
3. **Console filtering**: `installConsoleFilter()` suppresses known upstream noise (THREE.Clock, scroll-behavior)

## Performance

- **Lazy loading**: All non-hero sections loaded via `React.lazy()` + `Suspense`
- **Font optimization**: `next/font/google` with `display: 'swap'` + `<link rel="preconnect">` for Google Fonts
- **Code splitting**: `@next/bundle-analyzer` available via `npm run analyze`
- **Static export**: `output: 'export'` generates 8 HTML pages with zero server runtime

## Security

- **Headers**: `public/_headers` for Netlify/Cloudflare Pages (HSTS, CSP, X-Frame-Options, etc.)
- **CSP fallback**: `<meta http-equiv>` in `src/app/[locale]/layout.tsx` for hosts without `_headers` support
- **No secrets in build**: `.env.example` documents optional vars; build requires zero env vars

## Testing

- **Framework**: Vitest with `@vitejs/plugin-react`, jsdom environment
- **Setup**: `src/test/setup.ts` mocks `next/navigation` and `next-themes`
- **Pattern**: Tests co-located with source (`*.test.{ts,tsx}`)
- **Coverage**: `coverage` reporter configured in `vitest.config.ts`

## Quality Gates

1. **Pre-commit** (Husky + lint-staged):
   - `eslint --fix` on staged `*.{ts,tsx}`
   - `tsc --noEmit`
   - `vitest run`

2. **CI** (GitHub Actions, 3-stage):
   - `quality`: typecheck + lint + tests
   - `build`: static export + artifact upload
   - `lighthouse`: `lhci autorun` with assertions

## Deployment

Static export to `dist/` directory. Deploy to any static host (Netlify, Cloudflare Pages, Vercel, GitHub Pages).

```bash
npm run build
# dist/ contains en/, es/, admin/, offline.html, sw.js, icons/
```
