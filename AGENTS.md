<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Goal
- Fix Spanish locale `/es/` rendering English text in body sections, complete i18n wiring for all landing page sections, and maintain zero-build-error static export.

## Constraints & Preferences
- Next.js 16.2.6 (App Router), React 19.2.4, TailwindCSS v4, TypeScript
- Framer Motion + GSAP for animations
- React Three Fiber + Drei for 3D
- Dark futuristic sci-fi aesthetic with refined light theme support
- Desktop-first, fully responsive
- Production-grade, scalable, modular architecture
- Must build successfully with `output: 'export'`
- Lighthouse target: PWA installable, Accessibility 95+, SEO 100

## Progress
### Done
- Fixed `Navigation.tsx` syntax error (bracket mismatch after adding ThemeToggle/LanguageSwitcher)
- Fixed `next.config.ts`: removed deprecated `eslint` key; removed `next-intl` plugin
- Fixed `ThemeProvider` prop: `disableTransitionOnStorage` → `disableTransitionOnChange`
- Fixed `store-client.ts` types to align with `VisualTelemetryAggregate` interface
- Fixed `manifest.ts`: added `export const dynamic = 'force-static'`
- Replaced `next-intl` entirely with custom lightweight i18n system (`I18nProvider`, `useTranslations`, `useLocaleRouter`, `LocaleLink`) due to static export incompatibility
- Removed obsolete next-intl files: `src/i18n/navigation.ts`, `src/i18n/request.ts`, `src/i18n/routing.ts`, `src/middleware.ts`
- Updated `LanguageSwitcher.tsx` to use `useLocaleRouter` from custom i18n
- Updated `PageTransition.tsx` to import `usePathname` from `next/navigation`
- Built successfully with `output: 'export'`; `dist/` contains `/en/index.html`, `/es/index.html`, `/admin/index.html`
- Generated PWA PNG icons via ImageMagick: `icon-192x192.png`, `icon-512x512.png`, `apple-touch-icon.png`, `maskable-icon.png`
- Updated `manifest.ts` with comprehensive PWA config: `start_url`, `scope`, `categories`, `shortcuts`, maskable icon purpose
- Updated `src/app/[locale]/layout.tsx` with full Metadata export and `Viewport` export with `themeColor` for dark/light schemes
- Expanded `messages/en.json` and `messages/es.json` with namespaces: `contact.form`, `footer`, `command`, `theme`, `language`, `preloader`, `statusBar`, `admin.stats/activity/performance/traffic`, `accessibility`
- Updated `ContactSection.tsx` to consume translations; fixed `label-content-name-mismatch` via proper `htmlFor`/`id` associations
- Updated `Footer.tsx` to consume translations; fixed heading-order accessibility (changed `<h4>` to `<h3>` while preserving visual styling)
- Completed light theme CSS refinements: `color-scheme: dark/light`, `::selection` colors per theme, `:focus-visible` outline, `prefers-reduced-motion` reduce, updated viewport `themeColor` to `#f6f8fc`
- Rewrote `public/sw.js` with `CACHE_VERSION = 'v1'`, separate caches for static/images/fonts, precache manifest (`/`, `/en`, `/es`, `/admin`, `/offline.html`, PWA icons), stale-while-revalidate for CSS/JS/fonts, cache-first for images, network-first for navigation with offline fallback
- Created `public/offline.html` standalone dark-themed offline page with retry/home buttons
- Created `.github/workflows/ci.yml` with Node 22, `npm ci`, `tsc --noEmit`, `npm run build`, artifact upload, Lighthouse CI job with `lhci autorun`
- Created `lighthouserc.json` with assertions: accessibility ≥ 90 (error), SEO ≥ 95 (error), best-practices ≥ 85 (warn), performance ≥ 50 (warn), PWA ≥ 50 (warn)
- Fully i18n'd `Preloader.tsx`, `StatusBar.tsx`, `CommandPalette.tsx`, and `src/app/admin/page.tsx`
- Fixed root layout crash: created `src/app/layout.tsx` with `<html>`, `<body>`, fonts, `ThemeProvider`, `ServiceWorkerRegister`
- Refactored `src/app/[locale]/layout.tsx` to nested layout (no `<html>`/`<body>`); injects `I18nProvider`, metadata, viewport, and `DocumentLang` client component
- Created `src/app/page.tsx` redirecting `/` → `/en`
- Created `src/lib/i18n/DocumentLang.tsx` client component to sync `document.documentElement.lang`
- Rebuilt and verified `npm run build` produces zero errors (8/8 static pages)
- Ran Lighthouse audit on static export: Performance 44, Accessibility 96, Best Practices 96, SEO 100
- **Admin Dashboard fully rebuilt**: `src/lib/admin/types.ts` (15+ typed interfaces), `src/lib/admin/store.tsx` (Reducer + Context + localStorage persistence), `src/components/admin/AdminShell.tsx` (collapsible sidebar + mobile drawer + header with save/export/import/reset), `src/components/admin/PanelRouter.tsx` (7-panel routing)
- **Dashboard panel**: stat cards, system activity feed with severity, performance bars (LCP/CLS/INP/FCP), traffic bar chart
- **Config panel**: Site, SEO, WhatsApp, Features, Security sections with form inputs and toggles
- **Blocks panel**: section toggle/reorder with visual preview of active/inactive order
- **Navbar panel**: branding, behavior (layout/background/scroll), nav links CRUD, action buttons CRUD
- **Design panel**: default theme (dark/light/system), 6 color palettes + custom pickers, typography, shapes/spacing, shadows, gradients, buttons, live preview card
- **Personality panel**: 7 design personalities (Minimalist/Corporate/Creative/Futuristic/Playful/Elegant/Brutalist), 6 web effects with intensity sliders, design guide textarea with quick tags
- **Results panel**: 7 tabs (Quality/Metrics/Performance/A-B/Alerts/Reports/Tracking) with full data tables, sparklines, pass/fail checklists, alert acknowledge/remove
- Admin i18n wired: all 7 panels use `useTranslations('admin')` for titles/subtitles; `messages/en.json` and `messages/es.json` expanded with full `admin.*` namespace
- Fixed `useSceneConfig.ts`: removed `fetch('/api/visuals/scene-config')` that caused 404; now uses client-side `buildSceneConfig(detectTier())`
- Fixed `src/lib/visuals/telemetry/types.ts`: changed `source` type from `'api' | 'fallback'` to `'local' | 'fallback'`
- Fixed `src/lib/infrastructure/mock.ts`: changed `generatedAt` from `new Date().toISOString()` to static `'2026-05-18T00:00:00.000Z'`
- Fixed hydration mismatch in admin `DashboardPanel.tsx`: replaced dynamic `new Date()` / `Date.now()` timestamps in `defaultResults` (`src/lib/admin/types.ts`) with stable ISO strings; added `suppressHydrationWarning` to `toLocaleString()` date rendering
- Fixed Spanish locale switching: added `key={locale}` to `<I18nProvider>` in `src/app/[locale]/layout.tsx` to force full remount on locale change
- Wired `Navigation.tsx` to `useTranslations('nav')` for nav item names and "Collaborate" CTA; added `"collaborate"` key to `messages/en.json` and `messages/es.json`
- Wired `HeroSection.tsx` to `useTranslations('hero')` with fallback to `runtimeBrand` values
- Added live JSON preview section to `ConfigPanel.tsx`: scrollable `<pre>` block showing full `AdminState` with copy-to-clipboard button
- **Fixed `useTranslations` hook** (`src/lib/i18n/context.tsx`): changed return logic from `typeof current === 'string' ? current : key` to `current !== undefined ? current : key`, and typed return as `any` so arrays/objects can be consumed via casting (e.g., `t('focusAreas') as unknown as string[]`). This fixes runtime crashes when resolving non-string translation values.
- **Wired all remaining landing sections to i18n**:
  - `SystemsSection.tsx`: `badge`, `showcaseTitle`, `showcaseDescription`, `views` labels, `architectureNotes`, `notes` array
  - `LabsSection.tsx`: `badge`, `labsTitle`, `labsDescription`, `moduleRegistry`, `liveModule`
  - `InfrastructureSection.tsx`: `badge`, `commandCenterTitle`, `commandCenterDescription`, `labels` (uptime/region/orchestrator/source), `tabs`, `tabLabels`
  - `GitHubSection.tsx`: `badge`, `integrationTitle`, `integrationDescription`, `stats` (totalStars/totalForks/commits30d/source), `openRepository`
  - `AboutSection.tsx`: `badge`, `aboutTitle`, `aboutDescription`, `narrative`, `focusAreas` array with icon mapping by index
- Verified Spanish text present in exported `/es/index.html`: "Showcase de Arquitectura", "Nosotros", "Centro de Comando", "Registro de Módulos", "Capa Narrativa", etc.
- Verified zero-build-error static export (8/8 pages)
- **Enterprise resilience added**:
  - Created `src/lib/error.ts`: `AppError` class with `code`, `severity`, `context`, `timestamp`; `reportError()` safe sink; `isAppError()` guard
  - Created `src/lib/logger.ts`: level-gated logger (`debug/info/warn/error`) with `SILENCED_PATTERNS` for upstream noise; `installConsoleFilter()` patches `console.warn` at runtime
  - Created `src/components/shared/ErrorFallback.tsx`: reusable error UI with retry, home, and technical details toggle
  - Created `src/components/shared/SectionErrorBoundary.tsx`: per-section React error boundary that renders `ErrorFallback` with section name
  - Wrapped every landing section in `src/app/[locale]/page.tsx` with `<SectionErrorBoundary>` and `<Suspense>`; added `useEffect(() => installConsoleFilter(), [])`
  - Created `public/_headers`: security headers for static hosting (Netlify/Cloudflare Pages)
  - Created `src/lib/env.ts`: environment variable validation helpers
  - Created `.env.example`: documented optional environment variables
- **Testing infrastructure**:
  - Installed `vitest`, `@vitest/ui`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`
  - Created `vitest.config.ts` with React plugin, jsdom environment, path aliases
  - Created `src/test/setup.ts` with mocks for `next/navigation` and `next-themes`
  - Created `src/hooks/useMockData.test.ts`: tests for generic mock data hook
  - Created `src/components/shared/ErrorFallback.test.tsx`: tests for error fallback UI (render, retry, details toggle)
- **Zod validation**:
  - Installed `zod`
  - Created `src/lib/admin/schema.ts`: full `AdminStateSchema` with nested schemas for SiteConfig, SeoConfig, BlockItem, NavbarConfig, DesignTokens, DesignConfig, PersonalityConfig, ResultsState, and all sub-types
  - Updated `src/lib/admin/store.tsx`: `loadState()` validates with `AdminStateSchema.partial().safeParse()`; `importJSON()` validates with `AdminStateSchema.safeParse()`; both report validation errors via `reportError()` and fall back to defaults
- **Performance optimizations**:
  - Added `<link rel="preconnect">` tags for `fonts.googleapis.com` and `fonts.gstatic.com` in `src/app/layout.tsx`
  - `next/font/google` already configured with `display: 'swap'` for Inter and JetBrains Mono
  - Lazy loading via `React.lazy()` + `Suspense` already active for all non-hero landing sections
- **CI/CD improvements**:
  - Restructured `.github/workflows/ci.yml` into 3 jobs: `quality` (typecheck + lint + tests), `build` (depends on quality), `lighthouse` (depends on build)
  - Added `npm run lint` and `npm run test` to CI pipeline
- **Git hooks**:
  - Installed `husky` and `lint-staged`
  - Configured `.husky/pre-commit` to run `npx lint-staged`, `npm run typecheck`, and `npm run test`
  - Configured `lint-staged` in `package.json` to run `eslint --fix` and `tsc --noEmit` on `*.{ts,tsx}` files
- **Removed dead dependency**: uninstalled `next-intl` (no longer used after custom i18n migration)

### In Progress
- (none)

### Blocked
- (none)

## Key Decisions
- Replaced `next-intl` with custom i18n because v4 plugin requires server runtime APIs (`headers()`, `requestLocale`) incompatible with `output: 'export'`; custom context provides `useTranslations`, `useLocaleRouter`, and `LocaleLink` with zero server dependencies
- Admin dashboard moved from `src/app/[locale]/admin/` to `src/app/admin/` to avoid locale-bound server rendering issues
- Client-side telemetry store (`store-client.ts`) remains the source of truth for all runtime metrics since API routes are prohibited in static export
- Performance score (~44) is blocked by large JS bundles (Three.js/R3F, GSAP, Framer Motion) and TBT; deferred loading via `Suspense` + `lazy` already applied
- Root layout in `src/app/layout.tsx` is mandatory in Next.js 16.2.6 with Turbopack when multiple route segments exist outside a single catch-all; nested layouts must not render `<html>` or `<body>`
- Lighthouse v12+ removed standalone PWA category; PWA validation now occurs within Best Practices and manual installability testing
- Admin state uses `useReducer` + React Context with auto-save debounce (800ms) to `localStorage` under key `jootacee-admin-v1`; no server persistence needed
- `useSceneConfig` eliminated server fetch entirely because `/api/visuals/scene-config` does not exist in static export; device tier detection runs client-side only
- `key={locale}` on `I18nProvider` is required because Next.js client-side navigation does not remount the layout tree by default; without it, `useTranslations` retains stale messages
- `useTranslations` returns `any` to support both string rendering and array/object extraction; callers are responsible for runtime validation (`Array.isArray`, `typeof === 'string'`)
- `distDir: 'dist'` is kept for deployment expectations; `next dev` and `next build` share the directory, so Turbopack cache corruption is possible but recoverable via `npm run clean`
- Security headers cannot be set via `next.config.ts` `headers()` when using `output: 'export'`; instead use `public/_headers` for static hosts and CSP `<meta>` tag as HTML fallback
- `installConsoleFilter()` runs once at app startup to suppress known upstream warnings (`THREE.Clock` deprecation, smooth-scroll detection) in both dev and production without mutating global state until called
- Zod validation on `localStorage` load and JSON import prevents corrupted/malformed admin state from crashing the dashboard; validation failures are logged and fall back to `createInitialState()`
- Vitest + jsdom + React Testing Library chosen for testing because they work seamlessly with Next.js App Router client components and require zero server runtime

## Next Steps
- Verify Lighthouse CI passes on GitHub Actions push
- Reduce JS bundle sizes to improve Performance score (code splitting, lazy R3F, tree-shake GSAP plugins)
- Add `next/script` strategy for non-critical third-party scripts
- Optimize image formats (WebP/AVIF) for PWA icons and OG image
- Run `npm run analyze` and audit chunk sizes for R3F/GSAP/Framer Motion
- Expand test coverage to admin panels and i18n utilities

## Enterprise Architecture Decisions (added)
- **Turbopack SST corruption recovery**: `dist/dev/cache/turbopack/*.sst` can corrupt when `next dev` is killed mid-write or multiple dev servers run concurrently. Added `npm run clean` script (`rm -rf dist`) and documented recovery flow: `Ctrl+C → npm run clean → npm run dev`. The `distDir: 'dist'` setting is kept for deployment expectations; dev and build share the same directory tree, so corruption is possible but recoverable.
- **Per-section error boundaries**: `src/components/shared/SectionErrorBoundary.tsx` wraps every landing section in `src/app/[locale]/page.tsx`. If one section crashes (e.g. R3F context lost), the rest of the page remains interactive. Boundaries log to `reportError()` with section name and React component stack.
- **Centralized error taxonomy**: `src/lib/error.ts` defines `AppError` with `code`, `severity`, `context`, and `timestamp`. `reportError()` normalizes both `AppError` and plain `Error` instances and is safe to call anywhere (never throws).
- **Safe logger with upstream noise filtering**: `src/lib/logger.ts` provides `logger.debug/info/warn/error` with level gating (`NEXT_PUBLIC_LOG_LEVEL`). `installConsoleFilter()` patches `console.warn` in the browser to drop known upstream noise (`THREE.Clock` deprecation, `scroll-behavior` warning). Called once in `page.tsx` via `useEffect`.
- **Security headers for static export**: `public/_headers` sets HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, and Permissions-Policy for Netlify/Cloudflare Pages. `src/app/[locale]/layout.tsx` also injects CSP via `<meta http-equiv>` in the HTML head as a fallback for hosts that don't support `_headers`.
- **Bundle analyzer integration**: `@next/bundle-analyzer` added as dev dependency. Run `ANALYZE=true npm run build` (or `npm run analyze`) to open the interactive treemap and identify heavy chunks.
- **Environment validation scaffold**: `src/lib/env.ts` provides `getEnv()`, `getBoolEnv()`, and `env` constants. `.env.example` documents optional variables (GA, PostHog, Sentry, maintenance mode, log level). No secrets are required for the static export build.
- **`data-scroll-behavior="smooth"`** added to `<html>` in `src/app/layout.tsx` to eliminate Next.js App Router warning about smooth scroll during route transitions.
- **Zod runtime validation**: `src/lib/admin/schema.ts` provides `AdminStateSchema` for validating localStorage persistence and JSON imports. Corrupted state gracefully falls back to defaults.
- **Preconnect hints**: `<link rel="preconnect">` added for Google Fonts domains to reduce connection latency.
- **Git quality gates**: Husky + lint-staged enforces `eslint --fix`, `tsc --noEmit`, and `vitest run` on every commit.
- **CI/CD pipeline**: 3-stage GitHub Actions workflow (`quality` → `build` → `lighthouse`) ensures no broken code reaches production.

## Critical Context
- `output: 'export'` is active; no API routes or server-side dynamic rendering allowed
- `next.config.ts` uses `turbopack.root` and `typescript.ignoreBuildErrors: false`
- `useTranslations` custom hook resolves dot-notation keys by walking the messages object tree; returns `any` (supports strings, arrays, nested objects)
- `messagesMap` in layout files imports JSON files directly; `generateStaticParams` returns `[{locale:'en'},{locale:'es'}]`
- `manifest.ts` must export `dynamic = 'force-static'` for static export compatibility
- **Spanish locale FULLY FIXED**: All sections (Nav, Hero, Systems, Labs, Infrastructure, GitHub, About, Contact, Footer) now render Spanish text correctly after `key={locale}` fix and complete section i18n wiring
- Console warnings (non-blocking): `THREE.Clock: This module has been deprecated` from R3F; `Detected scroll-behavior: smooth` from Next.js App Router — both silenced by `installConsoleFilter()` in production, visible but harmless in dev
- Admin `localStorage` key: `jootacee-admin-v1`
- `defaultResults` in `src/lib/admin/state.ts` uses static ISO timestamps to prevent SSR/client hydration mismatch
- Test files follow `*.test.{ts,tsx}` naming and are co-located with source files
- `npm run test` runs Vitest in CI mode; `npm run test:watch` for development; `npm run test:ui` for browser UI
- `npm run typecheck` runs `tsc --noEmit` for fast type-only validation

## Relevant Files
- `src/components/sections/SystemsSection.tsx`: fully wired to `useTranslations('systems')`
- `src/components/sections/LabsSection.tsx`: fully wired to `useTranslations('labs')`
- `src/components/sections/InfrastructureSection.tsx`: fully wired to `useTranslations('infrastructure')`
- `src/components/sections/GitHubSection.tsx`: fully wired to `useTranslations('github')`
- `src/components/sections/AboutSection.tsx`: fully wired to `useTranslations('about')`; icon array mapped by index to translated `focusAreas`
- `src/lib/i18n/context.tsx`: `useTranslations` returns `any`; resolves arrays/objects correctly
- `messages/en.json` & `messages/es.json`: complete `systems`, `labs`, `infrastructure`, `github`, `about` namespaces
- `src/app/[locale]/layout.tsx`: nested locale layout; `I18nProvider` has `key={locale}` for forced remount
- `src/components/layout/Navigation.tsx`: wired to `useTranslations('nav')`
- `src/components/sections/HeroSection.tsx`: wired to `useTranslations('hero')`
- `src/lib/admin/types.ts`: pure type definitions
- `src/lib/admin/state.ts`: runtime defaults + `createInitialState`
- `src/lib/admin/schema.ts`: Zod schemas for runtime validation
- `src/lib/admin/store.tsx`: validated localStorage load/import via Zod
- `src/components/admin/panels/DashboardPanel.tsx`: `suppressHydrationWarning` on `toLocaleString()` date elements
- `src/components/admin/panels/ConfigPanel.tsx`: live JSON preview with copy button
- `src/lib/error.ts`: centralized error taxonomy (`AppError`, `reportError`, `isAppError`)
- `src/lib/logger.ts`: safe logger with upstream noise filtering (`installConsoleFilter`)
- `src/components/shared/SectionErrorBoundary.tsx`: per-section React error boundary with graceful fallback
- `src/components/shared/ErrorFallback.tsx`: reusable error fallback UI with retry and home actions
- `public/_headers`: security headers for static hosting (Netlify/Cloudflare Pages)
- `src/lib/env.ts`: environment variable validation helpers
- `vitest.config.ts`: Vitest config with React plugin, jsdom, path aliases
- `src/test/setup.ts`: test setup with Next.js mocks
- `.github/workflows/ci.yml`: 3-stage CI (quality → build → lighthouse)
- `.husky/pre-commit`: lint-staged + typecheck + test
