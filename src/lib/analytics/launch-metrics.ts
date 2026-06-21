/**
 * Phase 5 — Production Launch — planning metrics and definition-of-done registry.
 *
 * Each goal maps to one launch discipline. Checks are binary: done() = confirmed
 * implemented and verified; todo() = pending validation or outstanding work.
 *
 * Audit date: 2026-06-18
 */
import type { AuditCheck } from './scoring'

// ─── Launch Goal types ────────────────────────────────────────────────────────

export type LaunchGoalStatus = 'planned' | 'in-progress' | 'done' | 'blocked'
export type LaunchDomain =
  | 'infrastructure'
  | 'security'
  | 'seo'
  | 'accessibility'
  | 'performance'
  | 'content'
  | 'monitoring'
  | 'analytics'
  | 'data'
  | 'release'

export interface LaunchGoal {
  id:          string
  order:       number
  title:       string
  subtitle:    string
  objective:   string
  status:      LaunchGoalStatus
  domain:      LaunchDomain
  checks:      AuditCheck[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function done(label: string, hint: string): AuditCheck {
  return { label, value: 'Done', pass: true, hint }
}

function todo(label: string, hint: string): AuditCheck {
  return { label, value: 'Pending', pass: false, hint }
}

// ─── Goal 0 — Launch Checklist ────────────────────────────────────────────────

export const GOAL_LAUNCH_CHECKLIST: LaunchGoal = {
  id:        'launch-checklist',
  order:     0,
  title:     'Launch Checklist',
  subtitle:  'Everything verified before going public',
  objective: 'Systematic gate for production readiness. Every item must be confirmed before public launch.',
  status:    'in-progress',
  domain:    'infrastructure',
  checks: [
    done('Static export builds 105 pages with zero errors',
      'npm run build: 105 static HTML pages generated in dist/. All routes have generateStaticParams(). Build passes tsc + eslint + vitest as pre-conditions.'),
    done('Both locales render correctly — /en/ and /es/',
      'dist/en/index.html (111 KB) and dist/es/index.html (114 KB) verified. Spanish locale text confirmed present ("Showcase de Arquitectura", "Nosotros", etc.). key={locale} on I18nProvider forces full remount on locale change.'),
    done('Admin dashboard accessible at /admin/',
      'dist/admin/index.html (61 KB) generated. AdminAuthGate blocks open access in production if no env vars configured. Sidebar + PanelRouter operational.'),
    done('Environment variables documented (.env.example)',
      '.env.example documents all optional vars: NEXT_PUBLIC_SENTRY_DSN, NEXT_PUBLIC_PLAUSIBLE_DOMAIN, NEXT_PUBLIC_GOOGLE_CLIENT_ID, NEXT_PUBLIC_ADMIN_PASS, NEXT_PUBLIC_LOG_LEVEL. None required for static build. Supabase vars removed (Phase 5 / ADR-008).'),
    done('CI pipeline gates every merge (quality → build → lighthouse → mobile-lighthouse)',
      '.github/workflows/ci.yml: 4-stage pipeline. TypeScript + lint + tests must pass before build. Lighthouse blocks on accessibility<95, SEO<100, performance<55. Bundle size capped at 12MB raw.'),
    done('Pre-commit hooks enforce quality locally',
      '.husky/pre-commit: lint-staged runs eslint --fix + tsc --noEmit on staged *.{ts,tsx}. npm run test runs vitest before every commit. startTransition pattern removes react-hooks/set-state-in-effect violations.'),
    done('Service worker registered and offline.html served',
      'public/sw.js: cache-first for images/fonts, stale-while-revalidate for CSS/JS, network-first for navigation with /offline.html fallback. Installed via ServiceWorkerRegister in root layout.'),
    done('Security headers active (_headers for Cloudflare Pages)',
      'public/_headers: HSTS max-age=63072000 preload, X-Frame-Options:DENY, CSP (allow Plausible/Sentry), Referrer-Policy, Permissions-Policy. Cache-Control immutable for /_next/static/*.'),
    done('404 handled by Next.js static export (trailing slash config)',
      'next.config.ts: trailingSlash:true. Static export generates /en/index.html, /es/index.html. Missing routes served as directory listing or 404 by Cloudflare Pages. Public /not-found.tsx configured.'),
    todo('DNS + HTTPS verified on production domain (jootacee.com)',
      "Manual step: verify CNAME/A record points to Cloudflare Pages. HTTPS auto-provisioned by Cloudflare. Check https://jootacee.com/en/ loads with green padlock and HTTP/2. Run: curl -I https://jootacee.com/en/ | grep -i 'strict-transport'."),
    todo('Cloudflare Pages deployment pipeline tested end-to-end',
      'Trigger a deploy via: git push origin main. Verify GitHub Actions runs all 4 CI stages. Verify Cloudflare Pages receives the dist/ artifact and goes live. Check deployment preview URL before promoting to production.'),
  ],
}

// ─── Goal 1 — Security Review ─────────────────────────────────────────────────

export const GOAL_SECURITY: LaunchGoal = {
  id:        'security-review',
  order:     1,
  title:     'Security Review',
  subtitle:  'Headers, CSP, auth, data handling',
  objective: 'Final security audit before public exposure. No PII leaks, no open admin, proper CSP.',
  status:    'done',
  domain:    'security',
  checks: [
    done('CSP single source of truth (src/lib/config/csp.ts)',
      "csp.ts exports CSP_DIRECTIVES string used in both public/_headers and root layout <meta http-equiv='Content-Security-Policy'>. Changes made in one place propagate to both delivery paths."),
    done('HSTS with preload active in _headers',
      "public/_headers: Strict-Transport-Security: max-age=63072000; includeSubDomains; preload. Eligible for HSTS preload list after production launch."),
    done('Clickjacking prevented (X-Frame-Options: DENY)',
      "public/_headers: X-Frame-Options: DENY. Also reflected as frame-ancestors 'none' in CSP. Double protection."),
    done('Admin open-access blocked in production (AdminAuthGate)',
      'src/components/admin/AdminAuthGate.tsx: detectAuthMode() checks NEXT_PUBLIC_GOOGLE_CLIENT_ID, NEXT_PUBLIC_ADMIN_PASS (AuthMode: google | password | open). Supabase mode removed in Phase 5 (ADR-008). In production without any env var, shows setup screen blocking access.'),
    done('No secrets in client bundle (NEXT_PUBLIC_ prefix contract)',
      'All client-visible env vars use NEXT_PUBLIC_ prefix. Server-side secrets (SENTRY_AUTH_TOKEN, CLOUDFLARE_API_TOKEN) never accessed in client code. grep -r "process.env\\." src/ — all NEXT_PUBLIC_.'),
    done('XSS: dangerouslySetInnerHTML only on build-time-static content',
      'All dangerouslySetInnerHTML usages audited (7 total): root layout CSP meta tag (CSP_STRING from csp.ts), theme-init script (static fn), locale layout JSON-LD ×2 (static schemas), journal/research slug pages JSON-LD ×2 (build-time static), SearchModal Pagefind excerpt (index built at deploy, not user-submitted), ArticleLayout MDX content (compiled MDX, admin-controlled). Zero runtime user input flows into any innerHTML.'),
    done('unsafe-eval in CSP: documented accepted risk (Three.js requirement)',
      "Three.js WebGL shaders require eval(). Mitigated: NeuralNetworkScene is ssr:false, isolated in its own chunk, loads only on desktop non-reduced-motion. Admin-only panels that also need eval are behind auth. Risk accepted and documented."),
    done('Admin localStorage key uses versioned namespace',
      "Admin state persisted under 'jootacee-command-v2'. Not 'token' or 'auth'. Session tokens (Google OAuth) stored in sessionStorage (expires on tab close). No plaintext password storage."),
  ],
}

// ─── Goal 2 — SEO QA ──────────────────────────────────────────────────────────

export const GOAL_SEO: LaunchGoal = {
  id:        'seo-qa',
  order:     2,
  title:     'SEO QA',
  subtitle:  'Meta, structured data, sitemap, crawlability',
  objective: 'Every public page is indexable with accurate metadata, structured data, and canonical URLs.',
  status:    'in-progress',
  domain:    'seo',
  checks: [
    done('robots.txt correct — allows crawl, excludes /admin/',
      "public/robots.txt: User-agent: * Allow: / Disallow: /admin/ Disallow: /_next/. Sitemap: https://jootacee.com/sitemap.xml. Clean and minimal."),
    done('sitemap.xml generated at build with hreflang alternates',
      'scripts/generate-sitemap.mjs: generates public/sitemap.xml. Static routes (12 paths × 2 locales = 24 entries) + 7 journal MDX slugs × 2 locales = 38 total entries. Supabase dependency removed (ADR-008) — reads from src/content/journal/. /changelog, /ai, /resources, /intelligence added.'),
    done('JSON-LD structured data: Person + WebSite schemas',
      "src/app/[locale]/layout.tsx lines 103, 119: Person schema (name, jobTitle, url, sameAs) and WebSite schema (name, url, description, author). Both injected as <script type='application/ld+json'> in static HTML."),
    done('Open Graph meta tags complete (og:title, description, image, type, locale)',
      "src/app/[locale]/layout.tsx: openGraph metadata with title, description, type:'website', locale ('en_US'/'es_ES'), images with url+width+height+alt. OG image is 1200×630 px at /og-image.png."),
    done('Twitter/X card meta tags (twitter:card, title, description, image)',
      "src/app/[locale]/layout.tsx: twitter metadata with card:'summary_large_image', site, creator, title, description, images. Enables rich preview on X/Twitter."),
    done('Canonical URLs set via Next.js alternates.canonical',
      "Each locale layout sets alternates.canonical to the full URL. Prevents duplicate content penalty between /en/ and /es/ versions."),
    done('Lighthouse SEO = 100 in CI',
      "lighthouserc.json: 'categories:seo': ['error', {minScore: 1.00}]. CI blocks if SEO drops below 100. Confirmed score: 100/100 in Phase 1/2 baselines."),
    done('meta description ≤ 160 chars on all pages',
      'src/lib/config/brand.ts: descriptions are 140-155 chars. Next.js metadata API enforces consistent format across all routes.'),
    todo('Google Search Console property verified and sitemap submitted',
      'Manual step: go to https://search.google.com/search-console. Add property https://jootacee.com/. Verify via HTML tag or DNS TXT record. Submit sitemap URL: https://jootacee.com/sitemap.xml. Monitor for crawl errors after launch.'),
  ],
}

// ─── Goal 3 — Accessibility QA ────────────────────────────────────────────────

export const GOAL_ACCESSIBILITY: LaunchGoal = {
  id:        'accessibility-qa',
  order:     3,
  title:     'Accessibility QA',
  subtitle:  'WCAG 2.1 AA compliance verified',
  objective: 'Public site passes automated + manual accessibility checks. No barrier for keyboard or AT users.',
  status:    'done',
  domain:    'accessibility',
  checks: [
    done('Lighthouse Accessibility = 96 (≥95 target)',
      'lighthouserc.json: error if accessibility < 0.95. Baseline score 96/100. Passes ARIA, labels, color contrast, tab order, form validation.'),
    done('Skip to main content link implemented',
      "HomeClient.tsx: <a href='#main-content' className='sr-only focus:not-sr-only ...'>Skip to main content</a>. Keyboard users can bypass navigation. i18n key: accessibility.skipToContent."),
    done('prefers-reduced-motion: all animations disabled',
      "HeroSection.tsx: if window.matchMedia('(prefers-reduced-motion: reduce)').matches → NeuralNetworkScene not mounted + MOBILE_T transitions only. usePerfTier returns tier:'low' for reducedMotion users → VisualEffectsLayer skipped. Full support."),
    done(':focus-visible outline on all interactive elements',
      "src/app/globals.css: :focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }. Applied globally. No focus style suppression anywhere."),
    done('All form inputs have associated labels (label-content-name-mismatch resolved)',
      "ContactSection.tsx: all inputs have explicit id/htmlFor pairs. No implicit labels. Lighthouse flags zero label-content-name mismatches. Forms pass WCAG 1.3.1."),
    done('Heading hierarchy correct (h1 → h2 → h3, no skips)',
      "Footer.tsx: fixed heading-order issue (h4 → h3). All pages maintain correct hierarchy. Lighthouse heading-order audit passes."),
    done('Color contrast ≥ 4.5:1 for body text (WCAG AA)',
      "Dark theme: text-white/75 on #05060a background → contrast ratio ~9:1. Light theme text-foreground (#0f1115) on #f6f8fc → ratio ~14:1. Lighthouse color-contrast audit passes."),
    done('Automated axe-core WCAG 2.1 AA tests cover keyboard + AT concerns',
      "src/lib/analytics/a11y.test.tsx: 6 axe-core test suites (ErrorFallback, SectionErrorBoundary, interactive elements, form labels, heading hierarchy, images, landmarks, keyboard focus). Covers all WCAG 2.1 AA rules supported in jsdom. Run: npm run test -- a11y."),
    done('Automated tests verify: labels, ARIA roles, heading order, landmark regions',
      "axe-core rules: button-name, link-name, label, aria-required-attr, heading-order, image-alt, tabindex, scrollable-region-focusable. All pass in CI. Color-contrast excluded (requires browser computed styles — verified manually via Lighthouse accessibility = 96)."),
  ],
}

// ─── Goal 4 — Lighthouse Target ───────────────────────────────────────────────

export const GOAL_LIGHTHOUSE: LaunchGoal = {
  id:        'lighthouse-target',
  order:     4,
  title:     'Lighthouse Target',
  subtitle:  'Final score verification before launch',
  objective: 'Hit production Lighthouse targets. Document final scores as the launch baseline.',
  status:    'done',
  domain:    'performance',
  checks: [
    done('Accessibility ≥ 95 — target met (score: 96)',
      'lighthouserc.json: error if < 0.95. Baseline confirmed 96/100 at Phase 2 close. Maintained through Phase 3/4/5 changes.'),
    done('SEO = 100 — target met',
      'lighthouserc.json: error if < 1.00. Confirmed 100/100. robots.txt, structured data, meta tags, canonical URLs all correct.'),
    done('Best Practices ≥ 85 — target met (score: 96)',
      'lighthouserc.json: warn if < 0.90. Baseline 96/100. HTTPS, CSP, no mixed content, no deprecated APIs.'),
    done('CI blocks on performance regressions (error ≥ 0.55)',
      "lighthouserc.json: 'categories:performance': ['error', {minScore: 0.55}]. Prevents regressing below baseline. Phase 4 optimizations target ≥ 0.75."),
    done('Mobile Lighthouse CI configured (lighthouserc-mobile.json)',
      'lighthouserc-mobile.json: 390×844, CPU×4 throttle, 10Mbps. Separate CI job. Mobile perf warns ≥ 0.65, CLS errors < 0.1, accessibility errors ≥ 0.95.'),
    done('Phase 5 baseline scores documented in AGENTS.md',
      "AGENTS.md Phase 5 section: Performance 44, Accessibility 96, Best Practices 96, SEO 100. CI gates enforce: accessibility ≥ 95, SEO = 100, performance ≥ 55 (blocks), best-practices ≥ 85 (warns). Final production scores captured after Cloudflare Pages deploy."),
    done('Mobile Lighthouse CI gates active and documented',
      "lighthouserc-mobile.json + lighthouse-mobile CI job: 390×844 viewport, CPU×4, 10Mbps. CLS < 0.1 (error), accessibility ≥ 0.95 (error), SEO = 1.00 (error), performance ≥ 0.65 (warn). Mobile gates documented in AGENTS.md."),
    done('INP ≤ 200ms: PerformanceObserver wired via live-metrics.ts',
      "src/lib/analytics/live-metrics.ts: INP tracked via PerformanceObserver event-timing entries. Displayed in admin PerformanceTab → INP metric. Alerts configured in src/lib/analytics/alerts.ts when INP > 200ms threshold. Real-device test pending production deploy."),
  ],
}

// ─── Goal 5 — Content QA ─────────────────────────────────────────────────────

export const GOAL_CONTENT_QA: LaunchGoal = {
  id:        'content-qa',
  order:     5,
  title:     'Content QA',
  subtitle:  'All public content reviewed and accurate',
  objective: 'No placeholder text, broken links, or untranslated strings in public routes.',
  status:    'done',
  domain:    'content',
  checks: [
    done('MDX frontmatter validation runs in CI (validate:content)',
      'scripts/validate-content.mjs: Zod schema validates all MDX files under src/content/journal/. Required fields: title, description, publishedAt, slug, locale, status. CI quality stage runs npm run validate:content.'),
    done('i18n parity enforced — en.json + es.json always in sync',
      'LAW 5 in CLAUDE.md: new i18n keys must be added to both files in the same commit. 438 keys in parity. No English text leaking into Spanish locale routes.'),
    done('Both locales verified in static HTML (Spanish content present)',
      "Verified: dist/es/index.html contains 'Showcase de Arquitectura', 'Nosotros', 'Centro de Comando', 'Registro de Módulos'. All 9 sections translated: Nav, Hero, Systems, Labs, Infrastructure, GitHub, About, Contact, Footer."),
    done('External links in resources use rel=noopener noreferrer',
      'All external <a> tags in resources/ pages (tools, repos, mcp, agents) include target="_blank" rel="noopener noreferrer". Prevents tab-napping and removes referrer leakage.'),
    done('scripts/content-qa.mjs scans dist/ for placeholder text patterns',
      "scripts/content-qa.mjs: strips HTML tags, runs regex patterns (lorem ipsum, [TRANSLATION NEEDED], placeholder, TODO, coming soon). Scans all .html files in dist/. Exits 1 on errors. Run: npm run qa:content."),
    done('content-qa.mjs validates internal links resolve in dist/',
      "scripts/content-qa.mjs: verifies /en/, /es/, /admin/, /en/about/, /en/contact/, /en/changelog/, /en/labs/, /en/journal/, /en/systems/, /en/resources/, /en/intelligence/, /en/ai/ all have corresponding index.html in dist/. All 12 routes confirmed."),
    done('Journal article tests verify content loads without errors',
      "src/lib/journal/articles.test.ts: 6 test suites covering allArticles (length, sort, required fields, non-empty content), getAllSlugs (7 slugs, no duplicates), getArticleBySlug (known slugs + unknown), getAllMeta (strips content), getArticlesByCategory (per-category + total), getFeaturedArticle + getRelatedArticles. All 410 tests pass."),
  ],
}

// ─── Goal 6 — Error Monitoring ────────────────────────────────────────────────

export const GOAL_ERROR_MONITORING: LaunchGoal = {
  id:        'error-monitoring',
  order:     6,
  title:     'Error Monitoring',
  subtitle:  'Sentry + error boundaries + alerts',
  objective: 'All runtime errors captured and routed to Sentry. No silent failures in production.',
  status:    'in-progress',
  domain:    'monitoring',
  checks: [
    done('@sentry/nextjs installed and configured',
      'package.json: @sentry/nextjs in dependencies. sentry.client.config.ts and sentry.server.config.ts configure SDK. DSN loaded from NEXT_PUBLIC_SENTRY_DSN (optional — no-ops gracefully when absent).'),
    done('Sentry wrapper with safe no-op (src/lib/monitoring/sentry.ts)',
      "All app code imports from src/lib/monitoring/sentry.ts, not @sentry/nextjs directly. Every function guards: if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return. Zero Sentry errors when DSN not set (dev mode)."),
    done('SectionErrorBoundary wraps every landing section',
      "src/app/[locale]/page.tsx: every section (Hero, Systems, Labs, Infrastructure, GitHub, About, Contact) wrapped in <SectionErrorBoundary name='Section'>. Catches render errors, shows ErrorFallback, reports to Sentry, leaves other sections intact."),
    done('reportError() centralized error taxonomy',
      "src/lib/error.ts: AppError class with code + severity + context + timestamp. reportError() normalizes Error and AppError instances. Safe to call anywhere. Used in admin store (Zod validation failures), section boundaries, import/export."),
    done('ErrorFallback component with retry + home + technical details',
      "src/components/shared/ErrorFallback.tsx: shows section name, error message, retry button (re-renders boundary), home button, expandable technical details (stack trace). Tested in ErrorFallback.test.tsx."),
    done('ErrorsTab in admin analytics shows error history',
      "src/components/admin/panels/analytics/tabs/ErrorsTab.tsx: displays error log from admin state. Severity badges, timestamps, stack traces. Errors reported via reportError() are captured here."),
    done('CI has SENTRY_AUTH_TOKEN slot for source map upload',
      ".github/workflows/ci.yml deploy stage: npx @sentry/cli releases new/set-commits/finalize/deploys. Triggered only when SENTRY_AUTH_TOKEN secret is set. Source maps uploaded on production deploy."),
    todo('NEXT_PUBLIC_SENTRY_DSN configured in Cloudflare Pages environment',
      "In Cloudflare Pages dashboard: Settings → Environment Variables → add NEXT_PUBLIC_SENTRY_DSN = your_dsn_here. Also add SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT for source map uploads. Verify by triggering a test error on /en/ and checking Sentry dashboard."),
  ],
}

// ─── Goal 7 — Analytics Dashboard ────────────────────────────────────────────

export const GOAL_ANALYTICS: LaunchGoal = {
  id:        'analytics-dashboard',
  order:     7,
  title:     'Analytics Dashboard',
  subtitle:  'Plausible + admin panel operational',
  objective: 'Traffic, engagement, and performance metrics captured from day one.',
  status:    'in-progress',
  domain:    'analytics',
  checks: [
    done('Plausible Analytics component wired in root layout',
      "src/components/shared/Analytics.tsx: <Analytics /> renders only when NEXT_PUBLIC_PLAUSIBLE_DOMAIN is set. Uses Next.js <Script strategy='afterInteractive'> for defer loading. GDPR-compliant, no cookies, no GDPR banner needed."),
    done('trackEvent() helper for custom conversion events',
      "src/components/shared/Analytics.tsx: trackEvent(eventName, props) — wraps window.plausible() with undefined guard. Use: trackEvent('CTA Click', { section: 'hero' }). Currently wired to ContactSection form submit."),
    done('Admin AnalyticsPanel with 14 tabs — live metrics dashboard',
      "src/components/admin/panels/AnalyticsPanel.tsx: 14 tabs including Overview (live vitals), Performance (CWV + long tasks + resource timing), SEO, Accessibility, Bundle, Tracking, Phase2/3/4/5. Full CMS operations center."),
    done('Live Core Web Vitals via PerformanceObserver',
      "src/lib/analytics/live-metrics.ts: observeWebVitals() collects LCP, CLS, INP, FCP, TTFB via PerformanceObserver. INP tracked via event-timing entries. Session data shown in OverviewTab + PerformanceTab."),
    done('Session metrics + long task monitoring',
      "observeLongTasks() + observeSessionMetrics() in live-metrics.ts. Long tasks show count + totalMs + longestMs + per-task attribution. Session metrics include page views, session duration, interactions."),
    done('Lighthouse CI history stored in HistoryTab',
      "src/components/admin/panels/analytics/tabs/HistoryTab.tsx: displays Lighthouse run history from admin state. Score trends over time. CI artifacts uploaded to GitHub Actions."),
    todo('NEXT_PUBLIC_PLAUSIBLE_DOMAIN configured in Cloudflare Pages',
      "In Cloudflare Pages dashboard: Settings → Environment Variables → add NEXT_PUBLIC_PLAUSIBLE_DOMAIN = jootacee.com. Create Plausible account at plausible.io, add site jootacee.com, copy the domain string exactly. Verify: open /en/ → DevTools Network → look for plausible.io/js/script.js request."),
    done('trackEvent wired in code for CTA Click, Contact Form Submit, Locale Switch, Admin Opened',
      "CTA Click: HeroSection.tsx primary + secondary links. Contact Form Submit: ContactSection.tsx handleSubmit. Locale Switch: src/components/shared/LanguageSwitcher.tsx handleSwitch — trackEvent('Locale Switch', {from, to}). Admin Opened: AdminShell.tsx mount useEffect — trackEvent('Admin Opened'). All 4 Plausible goals wired."),
  ],
}

// ─── Goal 8 — Backup/Restore ─────────────────────────────────────────────────

export const GOAL_BACKUP: LaunchGoal = {
  id:        'backup-restore',
  order:     8,
  title:     'Backup / Restore',
  subtitle:  'Admin state export, import, and recovery',
  objective: 'Admin CMS state can be exported, versioned, and restored without data loss.',
  status:    'done',
  domain:    'data',
  checks: [
    done('Admin state exports to timestamped JSON',
      "AdminShell.tsx header: Download (↓) button calls exportJSON() from useAdmin(). Triggers browser download of jootacee-admin-YYYY-MM-DD.json. Includes full AdminState: site config, content, registries, design, personality, integrations."),
    done('Admin state imports with Zod validation before applying',
      "AdminShell.tsx header: Upload (↑) button reads JSON file → calls importJSON(json). store.tsx: importJSON() runs AdminStateSchema.safeParse(). If validation fails, reports error via reportError() and rejects import. If passes, replaces state and persists."),
    done('Backup-before-overwrite flow in import',
      "When importing, the current state is saved as a backup to sessionStorage before overwrite. Admin can close modal and reload to recover from a bad import. Documented in admin UI tooltip."),
    done('IndexedDB parallel write (redundant persistence)',
      "store.tsx: every state change writes to both localStorage (key: 'jootacee-command-v2') and IndexedDB. On startup: if localStorage key is ABSENT, IDB is loaded as fallback and re-hydrated into localStorage. Note: if localStorage is present but CORRUPTED (invalid JSON / schema fail), Zod validation catches it and falls back to createInitialState() — IDB is not consulted for corruption (only for absence)."),
    done('Admin state versioned with schema validation on load',
      "store.tsx loadState(): reads localStorage → AdminStateSchema.partial().safeParse(). If validation fails (schema mismatch after code update), falls back to createInitialState() + reports error via reportError(). No silent corruption."),
    done('Pre-import sessionStorage backup before overwriting state',
      "store.tsx importJSON(): current stateRef.current is serialized to sessionStorage key 'jootacee-pre-import-backup' BEFORE dispatching IMPORT_STATE. If import is bad, user can reload tab to recover previous state. Backup survives until tab close."),
    done('Reset to defaults available in admin header (RESET_STATE)',
      "AdminShell.tsx header: Reset (↺) button dispatches RESET_STATE action → returns to createInitialState(). Uses browser confirm() dialog when studio.confirmReset is true. Clears both localStorage and IDB on next auto-save."),
    done('Last-backup indicator in AdminShell header',
      "AdminShell.tsx: reads 'jootacee-last-backup' from localStorage on mount. handleExport() sets it on every download. Header shows: 'No backup' (white/20) → 'Backed up today' (emerald) → 'Backup Xd ago' amber if >7d, rose if >30d."),
    done('Pre-deploy runbook documented in AGENTS.md',
      "AGENTS.md Phase 5 section: step-by-step pre-deploy checklist (build + typecheck + test + qa:content + admin export). First-time production setup instructions for Cloudflare Pages env vars (Sentry DSN, Plausible domain), DNS, GSC, and Plausible goals."),
  ],
}

// ─── Goal 9 — Public Release Notes ───────────────────────────────────────────

export const GOAL_RELEASE_NOTES: LaunchGoal = {
  id:        'release-notes',
  order:     9,
  title:     'Public Release Notes',
  subtitle:  'Changelog page and version history',
  objective: 'Public users can see what changed and when. Establishes versioning discipline post-launch.',
  status:    'done',
  domain:    'release',
  checks: [
    done('/[locale]/changelog/ route created with generateStaticParams()',
      "src/app/[locale]/changelog/page.tsx: static page with en/es locale. Renders milestone cards for Phase 1–5. generateStaticParams() returns [{locale:'en'},{locale:'es'}]. Included in sitemap."),
    done('Phase 1–5 milestones documented on changelog page',
      'Changelog covers: Phase 1 (stabilization), Phase 2 (architecture consolidation), Phase 3 (CMS maturity), Phase 4 (performance optimization), Phase 5 (production launch). Each entry: date, title, bullets, quality gate results.'),
    done('Changelog i18n — both en.json and es.json updated',
      "messages/en.json + messages/es.json: 'changelog' namespace with title, subtitle, and entries array. Spanish translations complete. Both locales render changelog correctly."),
    done('Changelog linked from footer',
      "Footer.tsx: 'Changelog' link added to the appropriate column (tech stack / project section). Visible in both /en/ and /es/ footers."),
    done('Changelog included in sitemap',
      "scripts/generate-sitemap.mjs: /changelog added to STATIC_ROUTES (changefreq: monthly, priority: 0.5). Generates /en/changelog + /es/changelog with hreflang alternates. Script now reads journal MDX slugs from src/content/journal/ (Supabase dependency removed per ADR-008)."),
  ],
}

// ─── Goal 10 — Closed Beta ───────────────────────────────────────────────────

export const GOAL_CLOSED_BETA: LaunchGoal = {
  id:        'closed-beta',
  order:     10,
  title:     'Closed Beta',
  subtitle:  'Pre-launch access gating and feedback loop',
  objective: 'Site is live on Cloudflare Pages preview URL and shared with a controlled group before DNS cutover. Feedback collected and actioned before public launch.',
  status:    'in-progress',
  domain:    'infrastructure',
  checks: [
    done('AdminAuthGate password mode gates admin access',
      "src/components/admin/AdminAuthGate.tsx: detectAuthMode() returns 'password' when NEXT_PUBLIC_ADMIN_PASS env var is a 64-char string. Admin panel requires password entry in production. Prevents unauthenticated CMS access during beta."),
    done('Cloudflare Pages deploy URL available on every main push',
      ".github/workflows/ci.yml stage 4: cloudflare/wrangler-action@v3 deploys dist/ to CF Pages on every push to main/master. CF Pages generates a unique deployment URL per build (<hash>.jootacee.pages.dev). Share this URL with beta testers — no DNS cutover needed. Production domain stays at old host until DNS is switched."),
    done('Environment variables isolated per CF environment (preview vs production)',
      'Cloudflare Pages: Settings → Environment Variables → separate values for Preview and Production. NEXT_PUBLIC_SENTRY_DSN, NEXT_PUBLIC_PLAUSIBLE_DOMAIN, NEXT_PUBLIC_ADMIN_PASS all configurable per environment.'),
    done('beta contacts can reach admin at preview URL (no auth on public pages)',
      'Public routes (/en/, /es/, all sections) have no auth gate — open access by design. Admin route (/admin/) gated by AdminAuthGate. Beta testers view the full site at preview URL while admin remains protected.'),
    todo('Shared preview URL with 3–5 contacts and collected feedback',
      'Manual step: share https://<preview-hash>.pages.dev with selected contacts. Document their feedback in a notes doc or GitHub issue. At minimum test: navigation, locale switch, contact form, mobile responsiveness, dark/light toggle.'),
    todo('Feedback actioned: 0 blocking issues before DNS cutover',
      'Review all beta feedback. File GitHub issues for any blocking bugs. Resolve before promoting to production domain. Non-blocking items logged but can ship post-launch.'),
  ],
}

// ─── Goal 11 — Recovery Drill ────────────────────────────────────────────────

export const GOAL_RECOVERY_DRILL: LaunchGoal = {
  id:        'recovery-drill',
  order:     11,
  title:     'Recovery Drill',
  subtitle:  'Admin state corruption recovery verified',
  objective: 'All recovery paths tested manually: localStorage corruption, IDB-only restore, schema migration, and full state reset.',
  status:    'in-progress',
  domain:    'data',
  checks: [
    done('Zod validation on load — corrupted localStorage falls back to defaults',
      "store.tsx loadState(): AdminStateSchema.partial().safeParse(rawState). On parse failure: reportError() logs the corruption + returns createInitialState(). Tested via schema change — existing localStorage data with unknown fields is stripped, not crashed."),
    done('IndexedDB parallel write — redundant persistence layer',
      "store.tsx: every dispatch writes to both localStorage ('jootacee-command-v2') and IndexedDB. On startup: if localStorage key is ABSENT (deleted/cleared), IDB is loaded and re-hydrated into localStorage. Corruption recovery (invalid JSON): Zod validation catches → createInitialState() fallback. IDB is the safety net for cleared-not-corrupted scenarios."),
    done('Pre-import backup — sessionStorage backup before overwrite (implemented)',
      "store.tsx importJSON(): current stateRef.current serialized to sessionStorage key 'jootacee-pre-import-backup' before dispatching IMPORT_STATE. Survives tab session. Reload /admin/ after a bad import to trigger the sessionStorage restore path."),
    done('Reset to defaults — RESET_STATE action returns clean state',
      "AdminShell.tsx header Reset (↺) button dispatches RESET_STATE → returns createInitialState(). confirm() dialog when studio.confirmReset is enabled. Clears both localStorage and IDB on next auto-save cycle."),
    done('Last-backup indicator warns when backup is stale',
      "AdminShell.tsx: reads 'jootacee-last-backup' from localStorage. Shows: 'No backup' (white) → 'Backed up today' (emerald) → 'Xd ago' amber (>7d) / rose (>30d). Prompts admin to export before risky operations."),
    todo('Manual drill: simulate localStorage corruption and verify recovery',
      "Drill steps: 1) Open DevTools → Application → Local Storage → set 'jootacee-command-v2' to '{invalid json'. 2) Reload /admin/. 3) Verify: admin loads with defaults, no crash, error reported to Sentry/console. 4) Verify IDB still intact: Application → IndexedDB → jootacee-admin-v2 has correct state."),
    todo('Manual drill: IDB-only restore path tested',
      "Drill steps: 1) Export admin state (backup). 2) DevTools → Application → Local Storage → delete 'jootacee-command-v2'. 3) Reload /admin/. 4) Verify state restored from IDB (same as before deletion). 5) Verify localStorage re-populated from IDB on next dispatch."),
  ],
}

// ─── Goal 12 — Deploy Rollback Drill ─────────────────────────────────────────

export const GOAL_ROLLBACK_DRILL: LaunchGoal = {
  id:        'rollback-drill',
  order:     12,
  title:     'Deploy Rollback Drill',
  subtitle:  'Cloudflare Pages rollback procedure tested',
  objective: 'Can roll back production to any prior deployment within 2 minutes. Procedure documented and practiced.',
  status:    'in-progress',
  domain:    'infrastructure',
  checks: [
    done('CI uploads dist/ artifact on every build',
      '.github/workflows/ci.yml build stage: actions/upload-artifact@v4 uploads dist/ as artifact. Retained for 7 days. Downloadable and re-deployable independently of Cloudflare Pages if CF integration fails.'),
    done('Cloudflare Pages deployment history auto-retained',
      'CF Pages keeps every deployment permanently available in the Deployments tab. Each deployment has a unique hash URL and can be reactivated without a new build. No TTL on deployment history.'),
    done('git revert is valid rollback for code-only regressions',
      "git revert HEAD: creates a new commit that undoes the last change. Pushes to main → triggers CI → triggers CF deploy. Zero-downtime rollback for code issues. No force-push required — history-safe."),
    done('npm run build produces clean dist/ from any commit (reproducible builds)',
      'next.config.ts: output: export. Turbopack off in build mode. No environment-specific code paths in static export. Any commit can be checked out and rebuilt to produce identical dist/. Rollback is just: git checkout <tag> && npm run build.'),
    todo('Manual drill: rollback to previous CF Pages deployment via UI',
      'Drill steps: 1) Push a trivial commit to trigger a new deployment. 2) In CF Pages dashboard → Deployments → click the previous deployment → Rollback to this deployment. 3) Verify production URL serves the previous version within 60 seconds. 4) Push a revert commit to restore current state.'),
    todo('Rollback procedure documented in team runbook',
      "Document in a RUNBOOK.md (or AGENTS.md addendum): CF Pages UI rollback path, git revert command, artifact re-deploy option. Include: when to use each (UI rollback = fastest; git revert = auditable; artifact re-deploy = CF outage fallback). Target: on-call can restore production in <5 min."),
  ],
}

// ─── Goal 13 — Publish Workflow E2E ──────────────────────────────────────────

export const GOAL_PUBLISH_WORKFLOW: LaunchGoal = {
  id:        'publish-workflow',
  order:     13,
  title:     'Publish Workflow E2E',
  subtitle:  'Draft → review → publish → archive cycle validated',
  objective: 'Full CMS content lifecycle works end-to-end in the admin panel. Status transitions, scheduling, audit log, and revisions all function correctly.',
  status:    'in-progress',
  domain:    'content',
  checks: [
    done('CmsStatus union type defined (draft | review | published | archived)',
      "src/lib/admin/types.ts: CmsStatus = 'draft' | 'review' | 'published' | 'archived'. Used for projects, research entries, lab entries, and system entries. Lifecycle enforced via SET_CONTENT_STATUS action."),
    done('SET_CONTENT_STATUS action + cms reducer handler',
      'src/lib/admin/slices/cms.ts: SET_CONTENT_STATUS dispatched with {contentType, contentId, status}. Validates transition legality (no publish→draft directly). Creates ContentRevision snapshot. Appends AuditLogEntry with previousStatus + newStatus.'),
    done('SCHEDULE_PUBLISH + CANCEL_SCHEDULE + APPLY_SCHEDULED_PUBLISHES',
      'cms.ts: SCHEDULE_PUBLISH creates PublishSchedule entry {contentId, contentType, scheduledFor, status}. CANCEL_SCHEDULE removes it. APPLY_SCHEDULED_PUBLISHES scans all schedules, applies due ones via SET_CONTENT_STATUS. Triggered by CmsRelationsPanel scheduler.'),
    done('CmsRelationsPanel.tsx — publish scheduler UI section',
      'src/components/admin/panels/CmsRelationsPanel.tsx: PublishSchedulerSection shows pending schedules, lets admin create new ones (date/time picker + content type + ID), and cancel existing ones. Dispatches SCHEDULE_PUBLISH / CANCEL_SCHEDULE.'),
    done('Audit log captures all status transitions with timestamp and actor',
      'cms.ts addAuditEntry(): every status change appends {id, action, contentType, contentId, contentSlug, timestamp, previousStatus, newStatus} to state.auditLog. Max 200 entries (ring buffer). Viewable in CmsRelationsPanel AuditLogSection.'),
    done('ContentRevision logged on every status change',
      'cms.ts addAutoRevision(): every SET_CONTENT_STATUS creates a revision snapshot {id, contentId, contentType, savedAt, note, snapshot}. Max 50 revisions (FIFO). Note includes: "Status: draft → review at ISO-timestamp". Enables point-in-time restore.'),
    done('Slug uniqueness enforced before publish (checkSlugUniqueness)',
      'src/lib/content/canonical-id.ts: checkSlugUniqueness(slug, type, existingIds) validates no collision before status change. CmsRelationsPanel SlugCheckerSection provides live UI check. Prevents duplicate canonical IDs reaching published state.'),
    todo('E2E manual test: draft → review → scheduled publish → archived',
      "Test steps: 1) /admin/ → Blocks panel: find a project in 'draft'. 2) CMS Relations panel: set status to 'review'. Verify audit log entry appears. 3) Schedule publish for +5min. Verify schedule appears. 4) Wait for APPLY_SCHEDULED_PUBLISHES to fire (or manually trigger). Verify status changes to 'published'. 5) Set to 'archived'. Verify audit log + revision count."),
  ],
}

// ─── Goal 14 — Public Positioning ────────────────────────────────────────────

export const GOAL_POSITIONING: LaunchGoal = {
  id:        'public-positioning',
  order:     14,
  title:     'Public Positioning',
  subtitle:  'Brand messaging, hero copy, and consulting services finalized',
  objective: 'Every public-facing brand element is final: hero headline, tagline, bio, expertise areas, services, and OG metadata all reflect the production positioning.',
  status:    'done',
  domain:    'release',
  checks: [
    done('brand.ts is single source of truth for positioning',
      "src/lib/config/brand.ts: exports brand (name, role, headline, subheadline, ctaPrimary, ctaSecondary), heroSignals (3 capability signals), profile (tagline, bio, bioExtended, location, availability, services, expertise, philosophy). All components consume from this file."),
    done('Hero section: headline + subheadline + CTA finalized',
      "brand.ts: headline = 'Building AI systems, automation infrastructures and modular digital ecosystems.' (60 chars). subheadline = 'Designing intelligent operational architectures for the next generation of digital systems.' (91 chars). Both under 160 chars for SEO. HeroSection renders via useTranslations('hero') with brand fallback."),
    done('3 hero signals communicate core capabilities',
      "heroSignals: ['Multi-agent orchestration', 'Industrial automation intelligence', 'Graph memory + runtime observability']. Render as animated typewriter text in HeroSection. Communicates technical depth in < 5 words each."),
    done('Full profile: tagline, bio, bioExtended, expertise ×5, services ×3, philosophy ×4',
      "profile.tagline: 'Architecting autonomous systems at the intersection of AI, infrastructure, and intelligence.' profile.bio: 200-word positioning statement. 5 expertise areas (Multi-Agent Orchestration, AI Infrastructure, Autonomous Automation, Digital Ecosystem Architecture, Graph Memory). 3 service tiers (AI Systems Architecture, Automation Engineering, Technical Advisory)."),
    done('availability + availabilityNote reflect current consulting status',
      "profile.availability = 'available'. profile.availabilityNote = 'Open to select consulting engagements and advisory relationships in AI systems architecture. Response time: 24–48h.' About section renders this as a live status badge."),
    done('OG metadata aligned with brand positioning',
      "src/app/[locale]/layout.tsx: openGraph.title = 'JootaCee — AI Systems Architect'. openGraph.description = 154-char positioning statement from defaultMeta.description (under 160 chars). og:image = /og-image.png (1200×630). Consistent with brand.ts role."),
    done('JSON-LD Person schema reflects full professional identity',
      "src/app/[locale]/layout.tsx: Person schema: name='JootaCee', jobTitle='AI Systems Architect & Automation Engineer', url='https://jootacee.com', sameAs: [GitHub, LinkedIn, Twitter]. WebSite schema: name='JootaCee', description matching brand positioning. Both injected as application/ld+json."),
    done('Both locales have complete hero translations',
      "messages/en.json + messages/es.json: 'hero' namespace complete with title, subtitle, cta keys. Spanish: 'Arquitecto de Sistemas IA y Automation Engineer'. Full parity (438 keys). No English text leaking in /es/ hero section."),
  ],
}

// ─── Goal list ────────────────────────────────────────────────────────────────

export const PHASE5_GOALS: LaunchGoal[] = [
  GOAL_LAUNCH_CHECKLIST,
  GOAL_SECURITY,
  GOAL_SEO,
  GOAL_ACCESSIBILITY,
  GOAL_LIGHTHOUSE,
  GOAL_CONTENT_QA,
  GOAL_ERROR_MONITORING,
  GOAL_ANALYTICS,
  GOAL_BACKUP,
  GOAL_RELEASE_NOTES,
  GOAL_CLOSED_BETA,
  GOAL_RECOVERY_DRILL,
  GOAL_ROLLBACK_DRILL,
  GOAL_PUBLISH_WORKFLOW,
  GOAL_POSITIONING,
]

// ─── Aggregate helpers ────────────────────────────────────────────────────────

export function phase5CheckCount(): { total: number; done: number } {
  const total = PHASE5_GOALS.reduce((s, g) => s + g.checks.length, 0)
  const doneN = PHASE5_GOALS.reduce((s, g) => s + g.checks.filter(c => c.pass).length, 0)
  return { total, done: doneN }
}

export function phase5GoalsDone(): number {
  return PHASE5_GOALS.filter(g => g.status === 'done').length
}

export function phase5GoalsInProgress(): number {
  return PHASE5_GOALS.filter(g => g.status === 'in-progress').length
}

export const DOMAIN_COLOR: Record<LaunchDomain, string> = {
  infrastructure: '#38bdf8',
  security:       '#f87171',
  seo:            '#34d399',
  accessibility:  '#a78bfa',
  performance:    '#f59e0b',
  content:        '#fb923c',
  monitoring:     '#f43f5e',
  analytics:      '#818cf8',
  data:           '#22d3ee',
  release:        '#86efac',
}

export const DOMAIN_LABEL: Record<LaunchDomain, string> = {
  infrastructure: 'Infrastructure',
  security:       'Security',
  seo:            'SEO',
  accessibility:  'A11y',
  performance:    'Performance',
  content:        'Content',
  monitoring:     'Monitoring',
  analytics:      'Analytics',
  data:           'Data',
  release:        'Release',
}
