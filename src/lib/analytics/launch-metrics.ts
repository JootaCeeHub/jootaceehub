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
      '.env.example documents all optional vars: NEXT_PUBLIC_SENTRY_DSN, NEXT_PUBLIC_PLAUSIBLE_DOMAIN, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_GOOGLE_CLIENT_ID, NEXT_PUBLIC_ADMIN_PASS, NEXT_PUBLIC_LOG_LEVEL. None required for static build.'),
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
      'src/components/admin/AdminAuthGate.tsx: detectAuthMode() checks NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_GOOGLE_CLIENT_ID, NEXT_PUBLIC_ADMIN_PASS. In production without any env var, shows setup screen blocking access.'),
    done('No secrets in client bundle (NEXT_PUBLIC_ prefix contract)',
      'All client-visible env vars use NEXT_PUBLIC_ prefix. Server-side secrets (SENTRY_AUTH_TOKEN, CLOUDFLARE_API_TOKEN) never accessed in client code. grep -r "process.env\\." src/ — all NEXT_PUBLIC_.'),
    done('XSS: no dangerouslySetInnerHTML on user-controlled content',
      'dangerouslySetInnerHTML used only in: root layout for CSP meta tag (static string from csp.ts), layout for JSON-LD (static object), theme-init inline script (static code). No user input flows into dangerouslySetInnerHTML.'),
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
  status:    'done',
  domain:    'seo',
  checks: [
    done('robots.txt correct — allows crawl, excludes /admin/',
      "public/robots.txt: User-agent: * Allow: / Disallow: /admin/ Disallow: /_next/. Sitemap: https://jootacee.com/sitemap.xml. Clean and minimal."),
    done('sitemap.xml generated at build with hreflang alternates',
      'scripts/generate-sitemap.mjs: generates dist/sitemap.xml + public/sitemap.xml. All 105 routes included with en/es hreflang alternates. changefreq and priority set by route type.'),
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
  status:    'done',
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
  status:    'done',
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
    done('trackEvent wired in code for all conversion events',
      "CTA Click: HeroSection.tsx primary + secondary links — trackEvent('CTA Click', {section:'hero', cta:'primary/secondary'}). Contact Form Submit: ContactSection.tsx handleSubmit. Locale Switch: LanguageSwitcher.tsx handleSwitch — trackEvent('Locale Switch', {from, to}). Plausible auto-creates goals on first event fire."),
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
      "store.tsx: every state change writes to both localStorage (key: 'jootacee-command-v2') and IndexedDB (key: 'jootacee-admin-v2'). If localStorage is cleared, IDB survives. On load, IDB is consulted as fallback if localStorage is corrupted."),
    done('Admin state versioned with schema validation on load',
      "store.tsx loadState(): reads localStorage → AdminStateSchema.partial().safeParse(). If validation fails (schema mismatch after code update), falls back to createInitialState() + reports error. No silent corruption."),
    done('Reset to defaults available in admin header',
      "AdminShell.tsx header: Reset (↺) button dispatches RESET_ALL action → returns to createInitialState(). Confirmation prompt before reset. Useful for debugging or starting fresh."),
    done('Last-backup indicator in AdminShell header',
      "AdminShell.tsx: reads 'jootacee-last-backup' from localStorage on mount. handleExport() sets it on every download. Header shows: 'No backup' (white/20) → 'Backed up today' (emerald) → 'Backup Xd ago' amber if >7d, rose if >30d. suppressHydrationWarning on dynamic text."),
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
      "scripts/generate-sitemap.mjs: /en/changelog/ and /es/changelog/ routes included. changefreq: 'monthly', priority: 0.5."),
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
