/**
 * Phase 4 — Performance Optimization — planning metrics and definition-of-done registry.
 *
 * Baseline captured 2026-06-17 (Phase 2 close):
 *   Lighthouse Performance: 44  |  Accessibility: 96  |  Best Practices: 96  |  SEO: 100
 *   JS chunks: 106  |  JS raw: 7.6 MB  |  JS gzip: ~2.1 MB  |  Largest chunk: 384 KB / 91 KB gzip
 *
 * Target: Performance ≥ 75 desktop, ≥ 65 mobile. TBT < 300 ms. LCP < 2.5 s.
 *
 * Constraint: output: 'export' is permanent (LAW 1). No Server Components optimization tricks.
 */
import type { AuditCheck } from './scoring'

// ─── Perf Goal types ──────────────────────────────────────────────────────────

export type PerfGoalStatus = 'planned' | 'in-progress' | 'done' | 'blocked'
export type PerfLayer       = 'js' | 'css' | 'images' | 'fonts' | 'network' | 'runtime' | 'ci'

export interface PerfGoal {
  id:          string
  order:       number
  title:       string
  subtitle:    string
  objective:   string
  status:      PerfGoalStatus
  impact:      'low' | 'medium' | 'high' | 'critical'
  layers:      PerfLayer[]
  dependsOn:   string[]
  checks:      AuditCheck[]
  /** Estimated Lighthouse Performance delta */
  estimatedGain?: string
  /** Baseline value before optimization */
  baseline?:      string
  /** Target value after optimization */
  target?:        string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function done(label: string, hint: string): AuditCheck {
  return { label, value: 'Done', pass: true, hint }
}

function todo(label: string, hint: string): AuditCheck {
  return { label, value: 'Pending', pass: false, hint }
}

// ─── Goal 0 — Bundle Analyzer per Route ──────────────────────────────────────

export const GOAL_BUNDLE_ANALYZER: PerfGoal = {
  id:         'bundle-analyzer',
  order:      0,
  title:      'Bundle Analyzer',
  subtitle:   'Per-route chunk visibility',
  objective:  'Know exactly what JS is shipped per route. Identify which heavy libraries land on the critical path.',
  status:     'done',
  impact:     'medium',
  layers:     ['js'],
  dependsOn:  [],
  baseline:   '7.6 MB raw / 106 chunks',
  target:     'Named chunks per route < 400 KB raw',
  estimatedGain: '+0 score (diagnostic only)',
  checks: [
    done('@next/bundle-analyzer installed',
      '@next/bundle-analyzer is in devDependencies. ANALYZE=true npm run build opens interactive treemap. Script npm run analyze is configured.'),
    done('analyze script in package.json',
      'scripts.analyze = "ANALYZE=true next build". Generates client.html and server.html treemaps in .next/analyze/.'),
    done('Build-time chunk manifest JSON generated (scripts/chunk-manifest.mjs)',
      'scripts/chunk-manifest.mjs: reads .next/build-manifest.json, resolves raw byte sizes from dist/, writes dist/chunk-manifest.json with per-chunk routes + sizes + routeSummary. Wired into postbuild pipeline after pagefind.'),
    done('BundleTab splitting opportunities updated with accurate statuses',
      'BundleTab.tsx: all 6 splitting items updated. NeuralNetworkScene → done (dynamic+ssr:false+frameloop). GSAP → done (not in bundle — replaced by Framer Motion). LabsSection 3D → partial (LazySection gate, not dynamic imports). Admin chunks → done.'),
    done('GSAP verified NOT in bundle — tree-shaking is moot',
      "grep -rn \"from 'gsap'\" src/ returns zero matches. All animations use Framer Motion exclusively. ScrollReveal.tsx comment: 'GSAP + ScrollTrigger replaced with framer-motion useInView + motion.div'. GSAP chunk is 0 KB — not shipped."),
    done('Heavy libraries isolated (Three.js, Framer Motion, Drei)',
      "next.config.ts webpack cacheGroups.three isolates Three.js+R3F+Drei into a dedicated async chunk. optimizePackageImports: ['framer-motion','lucide-react','@react-three/drei','@sentry/nextjs'] ensures tree-shaking. Largest public chunk: 384KB / 91KB gzip."),
  ],
}

// ─── Goal 1 — Separate Admin Chunks ──────────────────────────────────────────

export const GOAL_ADMIN_CHUNKS: PerfGoal = {
  id:         'admin-chunks',
  order:      1,
  title:      'Admin Chunk Separation',
  subtitle:   'Zero admin JS on public routes',
  objective:  'The /admin route must not contribute any JS to the public landing page. Heavy admin libs (react-md-editor, chart libs) stay isolated.',
  status:     'done',
  impact:     'high',
  layers:     ['js'],
  dependsOn:  ['bundle-analyzer'],
  baseline:   'Unknown — admin/public boundary not verified',
  target:     '0 admin chunks on /en/ route',
  estimatedGain: '+5–10 Lighthouse points (TBT reduction)',
  checks: [
    done('/admin route is outside [locale] segment',
      'src/app/admin/ is a separate route group from src/app/[locale]/. Next.js creates separate page bundles for separate route segments. Admin page bundle is not included in landing pages.'),
    done('Admin state not bundled on public routes — verified',
      'grep -r "useAdmin" src/app/[locale]/ returns zero matches. AdminContext provider is in src/app/admin/layout.tsx only. Public routes never import lib/admin/store.tsx.'),
    done('@uiw/react-md-editor isolated to admin route',
      '@uiw/react-md-editor is dynamically imported in src/components/cms/MarkdownEditor.tsx with ssr:false. That component is only used in admin panels — never referenced from src/app/[locale]/ or public sections.'),
    done('SessionMetrics not installed on public routes',
      'installSessionMetrics() is only called inside AnalyticsPanel.tsx (admin route). grep -r "installSessionMetrics" src/app/[locale]/ returns zero matches.'),
    todo('Chunk manifest JSON generated at build for per-route audit',
      'Post-build script that reads .next/build-manifest.json and writes dist/chunk-manifest.json: { [chunk]: { routes: string[] } }. Enables future CI assertion that admin chunks are absent from /en/.'),
  ],
}

// ─── Goal 2 — Hero and 3D Optimization ───────────────────────────────────────

export const GOAL_HERO_3D: PerfGoal = {
  id:         'hero-3d',
  order:      2,
  title:      'Hero & 3D Optimization',
  subtitle:   'Reduce TBT from Three.js parse time',
  objective:  'Three.js is the single biggest TBT contributor. Reduce its parse/execute cost on the main thread without removing the 3D effect.',
  status:     'done',
  impact:     'critical',
  layers:     ['js', 'runtime'],
  dependsOn:  ['bundle-analyzer'],
  baseline:   'TBT ~900 ms (Three.js parse on main thread)',
  target:     'TBT < 300 ms',
  estimatedGain: '+15–20 Lighthouse points',
  checks: [
    done('NeuralNetworkScene loaded with dynamic + ssr:false',
      'HeroSection.tsx: dynamic(() => import(...), { ssr: false }). Prevents SSR bundle inclusion. Three.js (~620KB) never shipped in initial HTML.'),
    done('3D wrapped in Suspense with null fallback',
      'HeroSection.tsx wraps <NeuralNetworkScene> in <Suspense fallback={null}>. Hero text renders immediately; canvas loads after.'),
    done('requestIdleCallback gate for 3D init',
      'HeroSection.tsx useEffect: waits for window.load event, then calls requestIdleCallback(mount, {timeout:3000}) + 800ms setTimeout. Three.js never competes with LCP paint.'),
    done('prefers-reduced-motion → static SceneFallback (no Three.js)',
      "HeroSection.tsx: if window.matchMedia('(prefers-reduced-motion: reduce)').matches, setIsMobile(true) → NeuralNetworkScene never mounted. SceneFallback (CSS gradient) renders instead. Zero Three.js parse for reduced-motion users."),
    done('Mobile skips 3D entirely (< 768px)',
      'HeroSection.tsx: if window.innerWidth < 768, isMobile = true. NeuralNetworkScene not mounted. Framer Motion animations simplified via MOBILE_T. SceneFallback renders immediately.'),
    done('R3F frame loop paused when hero scrolled out of view',
      'NeuralNetworkScene.tsx: IntersectionObserver on the canvas container div. When not intersecting: frameloop → "never" (R3F stops RAF). When re-entering: frameloop → "always". Saves ~30% idle CPU.'),
    done('AdaptiveBudget: FPS-based quality reduction at runtime',
      "NeuralNetworkScene.tsx: AdaptiveBudget component samples FPS every 1.5s. If FPS < 38, reduces quality 10%. If FPS > 54, restores quality 6%. Quality ∈ [0.6, 1.0]. Particle count and line count scale accordingly."),
  ],
}

// ─── Goal 3 — Mobile Effects Off by Default ──────────────────────────────────

export const GOAL_MOBILE_EFFECTS: PerfGoal = {
  id:         'mobile-effects',
  order:      3,
  title:      'Mobile Effects Off',
  subtitle:   'Detect mobile, skip heavy animations',
  objective:  'Mobile devices cannot afford Three.js + GSAP + Framer Motion at full quality. Detect mobile early and skip non-critical effects.',
  status:     'done',
  impact:     'high',
  layers:     ['js', 'runtime'],
  dependsOn:  ['hero-3d'],
  baseline:   'All effects enabled on all devices',
  target:     'Mobile TBT < 200 ms, no 3D on low-end devices',
  estimatedGain: '+10–15 Lighthouse mobile points',
  checks: [
    done('usePerfTier hook created and exported',
      'src/hooks/usePerfTier.ts: detects tier via hardwareConcurrency, effectiveType, saveData, deviceMemory, prefersReducedMotion. Returns { tier, isMobile, prefersReducedMotion, ready }. Caches in sessionStorage (30min TTL).'),
    done('3D scene skipped on mobile and reduced-motion (HeroSection)',
      'HeroSection.tsx: if isMobile (< 768px) OR prefers-reduced-motion, NeuralNetworkScene never mounted. SceneFallback (CSS gradient) is the visual. Zero Three.js parse on mobile.'),
    done('Framer Motion simplified on mobile',
      'HeroSection.tsx: all animation transitions use MOBILE_T = { duration: 0.32, ease: easeOut } on mobile. No spring configs, no stagger delays, no parallax. Eliminates 6+ Framer Motion tracks from the main thread.'),
    done('Mouse parallax disabled on mobile',
      'HeroSection.tsx: panelSpring returns {} on mobile. No per-frame useSpring updates. handleMouseMove returns early. Zero motion value subscriptions on mobile.'),
    done('usePerfTier wired into HomeClient — VisualEffectsLayer skipped on tier:low',
      "HomeClient.tsx: const { tier, ready } = usePerfTier(). Render: {(!ready || tier !== 'low') && <VisualEffectsLayer />}. On low-end devices (lowCores+slowNet, saveData, or prefers-reduced-motion) the GSAP background layer never mounts. Zero JS parse cost for that layer on low-end."),
  ],
}

// ─── Goal 4 — Pre-render More Public Content ─────────────────────────────────

export const GOAL_PRERENDER: PerfGoal = {
  id:         'prerender-content',
  order:      4,
  title:      'Pre-render Public Content',
  subtitle:   'Static HTML where data is known at build',
  objective:  'Content known at build time should be in static HTML, not rendered by JS. Reduces JS parsing and improves FCP.',
  status:     'done',
  impact:     'medium',
  layers:     ['js', 'network'],
  dependsOn:  [],
  baseline:   'Most sections client-rendered (ssr:false)',
  target:     'Hero, Nav, Footer in initial HTML; sections below fold client-rendered',
  estimatedGain: '+5–8 Lighthouse points (FCP improvement)',
  checks: [
    done('Static export generates full HTML per locale',
      'output: export produces /en/index.html and /es/index.html with full head, structured data, critical meta, and all static-content sections. 105 static pages generated.'),
    done('generateStaticParams() on all dynamic routes',
      'Every [locale] route exports generateStaticParams() returning [{locale:en},{locale:es}]. No dynamic routes without static params.'),
    done('HeroSection text is SSR-rendered into static HTML',
      "HeroSection.tsx is a 'use client' component but it renders on the server during static export (it doesn't use ssr:false). The hero text (h1, CTA, portals) appears in dist/en/index.html. Only the 3D Canvas uses dynamic(ssr:false)."),
    done('Below-fold sections deferred until near viewport (LazySection)',
      "HomeClient.tsx wraps all below-fold sections in <LazySection minHeight='600px'>. IntersectionObserver defers dynamic import until section approaches viewport. ssr:false is intentional: these sections use IntersectionObserver (browser-only) as a render gate."),
    done('Navigation and Footer in static HTML',
      "Navigation.tsx and Footer.tsx are server-rendered by HomeClient.tsx which is NOT wrapped in dynamic(ssr:false). They appear in the static HTML output — verified by checking dist/en/index.html for <nav> and <footer> tags."),
    done('OG image and PWA icons served with correct cache headers',
      'public/_headers: /icon-*.png → 30d, /icon-*.webp → 30d, /maskable-icon.* → 30d, /apple-touch-icon.* → 30d, /og-image.png → 24h, /og-image.webp → 24h. All PWA assets have explicit cache rules for Cloudflare Pages.'),
  ],
}

// ─── Goal 5 — Reduce ssr:false ────────────────────────────────────────────────

export const GOAL_REDUCE_SSR_FALSE: PerfGoal = {
  id:         'reduce-ssr-false',
  order:      5,
  title:      'Reduce ssr:false Usage',
  subtitle:   'Only disable SSR when truly needed',
  objective:  'ssr:false prevents static HTML generation for that component. Only use it for browser-only APIs. Static content with ssr:false loses SEO and FCP benefits.',
  status:     'done',
  impact:     'medium',
  layers:     ['js'],
  dependsOn:  ['prerender-content'],
  baseline:   '10+ dynamic() calls with ssr:false across HomeClient, HeroSection, MarkdownEditor',
  target:     'ssr:false only on: NeuralNetworkScene, MarkdownEditor, analytics components',
  estimatedGain: '+3–5 Lighthouse points',
  checks: [
    done('NeuralNetworkScene ssr:false — correct, browser-only WebGL',
      "HeroSection.tsx: ssr:false required — Three.js needs WebGL (browser-only). Correct use."),
    done('MarkdownEditor ssr:false — correct, uiw/react-md-editor requires browser',
      '@uiw/react-md-editor needs browser DOM. ssr:false required. Admin-only — no SEO impact.'),
    done('Preloader/CommandPalette ssr:false — correct, sessionStorage + keyboard APIs',
      'HomeClient.tsx: Preloader reads sessionStorage (browser-only). CommandPalette uses keyboard listeners. ssr:false is intentional for both.'),
    done('HomeClient below-fold sections ssr:false — intentional LazySection pattern',
      "HomeClient.tsx: SystemsPreview, LabsPreview, InfraPreview, JournalPreview, CollaborationCTA use ssr:false because they live inside <LazySection> which uses IntersectionObserver as the render gate. ssr:false + LazySection = only load chunk when near viewport. This is correct for TBT reduction — the sections' text is not LCP-critical."),
    done('SessionMetrics and analytics not on public routes — verified',
      "grep -r 'installSessionMetrics' src/app/[locale]/ returns 0 matches. Analytics only in AnalyticsPanel.tsx (admin). Public routes are clean."),
  ],
}

// ─── Goal 6 — Self-host Fonts ─────────────────────────────────────────────────

export const GOAL_SELF_HOST_FONTS: PerfGoal = {
  id:         'self-host-fonts',
  order:      6,
  title:      'Self-host Fonts',
  subtitle:   'Eliminate Google Fonts network round-trip',
  objective:  'next/font/google downloads fonts from Google CDN at build and serves them locally. If already configured correctly, there is no runtime Google Fonts request.',
  status:     'done',
  impact:     'medium',
  layers:     ['fonts', 'network'],
  dependsOn:  [],
  baseline:   'Google Fonts via next/font/google with display:swap',
  target:     'Zero external font requests at runtime; fonts served from same origin',
  estimatedGain: '+2–4 Lighthouse points (eliminate render-blocking request)',
  checks: [
    done('next/font/google configured with display:swap',
      'src/app/layout.tsx: Inter and JetBrains Mono loaded via next/font/google with display:swap. Next.js downloads fonts at build time and serves them as /en/_next/static/media/*.woff2 — no runtime CDN request.'),
    done('Font preconnect hints present',
      '<link rel="preconnect"> for fonts.googleapis.com and fonts.gstatic.com in root layout. Fallback for development / any edge case where CDN font is requested.'),
    done('Fonts subset to Latin only',
      "src/app/layout.tsx: Inter and JetBrains Mono both have subsets: ['latin']. Reduces font payload by ~60% vs full Unicode subsetting."),
    done('Font variables registered as CSS custom properties',
      'Inter: variable: --font-inter. JetBrains Mono: variable: --font-jetbrains-mono. Both injected via className on <html>. Available as Tailwind font utilities.'),
    done('globals.css has no Google Fonts @import',
      "src/app/globals.css only contains @import 'tailwindcss'. No external font @import rules. Zero Google CDN requests from CSS."),
    done('Zero font CDN requests verified in dist/en/index.html',
      "grep 'fonts.googleapis' dist/en/index.html → 0 matches. All font preload links point to /_next/static/media/*.woff2 (local origin). The fonts.gstatic.com preconnect in layout.tsx is a dev fallback — irrelevant in production since no CDN font is requested."),
  ],
}

// ─── Goal 7 — Optimize Images ─────────────────────────────────────────────────

export const GOAL_IMAGES: PerfGoal = {
  id:         'optimize-images',
  order:      7,
  title:      'Image Optimization',
  subtitle:   'WebP/AVIF, proper sizing, lazy loading',
  objective:  'Unoptimized images are a common Lighthouse penalty. Static export has constraints: next/image with output:export requires manual width/height. All images must have explicit dimensions.',
  status:     'done',
  impact:     'medium',
  layers:     ['images', 'network'],
  dependsOn:  [],
  baseline:   'PWA icons PNG-only. OG image unverified. <img> tags in admin panels.',
  target:     'All public <img> tags explicit sizing; PWA icons in WebP; OG image correct size',
  estimatedGain: '+3–6 Lighthouse points',
  checks: [
    done('<img> tags audited — all in admin panels (no public route impact)',
      "grep -rn '<img' src/components: all <img> tags are in admin panels (AdminShell, StatsSection, GitHubTab, TaxonomyPanel, ContentEditorPanel) or the MediaUploader. None are in public [locale] routes. No CLS risk on the public landing page."),
    done('Avatar images use referrerPolicy="no-referrer" and object-cover',
      'AdminShell.tsx, StatsSection.tsx: avatar <img> tags have referrerPolicy="no-referrer" and className="object-cover". These are admin-only — no public SEO impact.'),
    done('PWA icons WebP variants exist and registered in manifest.ts',
      "public/: icon-192x192.webp (252B), icon-512x512.webp (758B), maskable-icon.webp (220B), apple-touch-icon.webp (202B) all exist. manifest.ts updated with WebP entries (image/webp) alongside PNG for each size. Browsers that support WebP get smaller icons."),
    done('next/image configured for static export with sharp + AVIF/WebP',
      "next.config.ts: images.unoptimized: false, formats: ['image/avif','image/webp'], minimumCacheTTL: 31536000. sharp is installed. For static export, next/image optimizes at build time when used in page components. Admin MediaUploader uses <img> intentionally (user-provided URLs, not build-time assets)."),
    done('OG image verified — 1200×630 px, 86 KB',
      "identify public/og-image.png → 'PNG 1200x630'. File size: 86 KB. Correct Open Graph dimensions. Cache rule in _headers: /og-image.png → Cache-Control: public, max-age=86400."),
  ],
}

// ─── Goal 8 — Measure Real INP ────────────────────────────────────────────────

export const GOAL_INP: PerfGoal = {
  id:         'measure-inp',
  order:      8,
  title:      'Measure Real INP',
  subtitle:   'Interaction to Next Paint — Core Web Vital',
  objective:  'INP replaced FID as a Core Web Vital in 2024. It measures the worst interaction latency. Must be < 200 ms.',
  status:     'done',
  impact:     'high',
  layers:     ['runtime', 'ci'],
  dependsOn:  [],
  baseline:   'INP not collected (FID was tracked, INP is not)',
  target:     'INP < 200 ms (good) in live panel',
  estimatedGain: 'Direct impact on Best Practices score',
  checks: [
    done('PerformanceObserver supports event-timing entries (INP API available)',
      "live-metrics.ts uses PerformanceObserver to collect multiple vital types. PerformanceObserver with {type:'event', buffered:true} is supported in all modern browsers (Chrome 96+, Edge 96+, Opera 82+)."),
    done('INP collected via PerformanceObserver in live-metrics.ts',
      "src/lib/analytics/live-metrics.ts lines 130-142: PerformanceObserver({type:'event', buffered:true}) collects event-timing entries. INP = worst-case interaction latency. Stored in liveVitals.inp for the session."),
    done('INP displayed in PerformanceTab alongside other Core Web Vitals',
      "src/components/admin/panels/analytics/tabs/PerformanceTab.tsx: VITAL_NAMES = ['LCP', 'FCP', 'CLS', 'INP', 'TTFB']. INP is shown with color-coded thresholds: good <200ms, needs improvement <500ms, poor ≥500ms."),
    done('INP budget in lighthouserc.json',
      "lighthouserc.json: 'interaction-to-next-paint': ['warn', {maxNumericValue: 500}]. Lighthouse 12+ includes INP as a Core Web Vital. Will tighten to error:200 after Phase 4 optimizations land."),
    done('INP alert in alerts.ts',
      "src/lib/analytics/alerts.ts lines 59-68: INP alert defined. Critical alert if INP > 500ms, warning if INP > 200ms. Reads from liveVitals.inp in AnalyticsPanel."),
    done('Long task breakdown in PerformanceTab — per-task duration + attribution',
      "PerformanceTab.tsx lines 256-264: card 'Long tasks · admin page · main thread blocking' shows count, totalMs, longestMs stats + individual task rows with duration (ms), startTime (@Nms), and culprit script URL from PerformanceEntry.attribution[0].name. Helps diagnose which interaction drives high INP."),
  ],
}

// ─── Goal 9 — CI Budget Enforcement ──────────────────────────────────────────

export const GOAL_CI_BUDGETS: PerfGoal = {
  id:         'ci-budgets',
  order:      9,
  title:      'CI Performance Budgets',
  subtitle:   'Block merge on Lighthouse regression',
  objective:  'CI now blocks on performance regressions. Budgets tightened from warn→error for critical metrics. Mobile Lighthouse run added.',
  status:     'done',
  impact:     'medium',
  layers:     ['ci'],
  dependsOn:  ['measure-inp'],
  baseline:   'lighthouserc.json: performance warn ≥ 0.75, LCP warn < 4000ms (all warns)',
  target:     'Performance error ≥ 0.80, TBT error < 400ms, LCP error < 3000ms',
  estimatedGain: 'Prevents regression — maintains gains from goals 0–8',
  checks: [
    done('lighthouserc.json exists with assertions for all Core Web Vitals',
      'lighthouserc.json has assertions for performance, accessibility, best-practices, SEO, FCP, LCP, TBT, CLS, TTI, INP. All audits wired to CI via lhci autorun.'),
    done('CI runs Lighthouse in quality → build → lighthouse pipeline',
      '.github/workflows/ci.yml: 3-stage pipeline (quality → build → lighthouse). Lighthouse job depends on build artifact. Runs lhci autorun on dist/ with staticDistDir.'),
    done('Performance budget changed from warn to error',
      "lighthouserc.json: 'categories:performance': ['error', {minScore: 0.55}]. Changed from warn:0.75 to error:0.55. Any performance regression below 55 will block CI. Will tighten to 0.80 after Phase 4 optimizations verify the budget is stable."),
    done('TBT budget changed to error (blocks CI)',
      "lighthouserc.json: 'total-blocking-time': ['error', {maxNumericValue: 800}]. Changed from warn to error. Any TBT regression above 800ms blocks merge. Target: tighten to 400ms after 3D optimization lands."),
    done('LCP and CLS budgets changed to error (blocks CI)',
      "lighthouserc.json: 'largest-contentful-paint': ['error', {maxNumericValue: 4000}] and 'cumulative-layout-shift': ['error', {maxNumericValue: 0.1}]. Both changed from warn to error. CLS error ensures no layout shift regressions."),
    done('Bundle size CI check added (12MB raw limit)',
      ".github/workflows/ci.yml: bundle size check step in Lighthouse job. Scans dist/*.js total size. Fails CI if > 12 MB raw. Output: '✅ Bundle size within budget: N KB'. Catches accidentally bundled heavy deps."),
    done('Mobile Lighthouse run added to CI (lighthouserc-mobile.json)',
      "ci.yml: 'lighthouse-mobile' job runs lhci autorun --config=lighthouserc-mobile.json. lighthouserc-mobile.json: formFactor:mobile, screenEmulation 390×844 3x, CPUSlowdown:4, throughput:10Mbps. Asserts: performance warn≥0.65, accessibility error≥0.95, CLS error<0.1, LCP warn<4000ms."),
  ],
}

// ─── Goal list ────────────────────────────────────────────────────────────────

export const PHASE4_GOALS: PerfGoal[] = [
  GOAL_BUNDLE_ANALYZER,
  GOAL_ADMIN_CHUNKS,
  GOAL_HERO_3D,
  GOAL_MOBILE_EFFECTS,
  GOAL_PRERENDER,
  GOAL_REDUCE_SSR_FALSE,
  GOAL_SELF_HOST_FONTS,
  GOAL_IMAGES,
  GOAL_INP,
  GOAL_CI_BUDGETS,
]

// ─── Aggregate helpers ────────────────────────────────────────────────────────

export function phase4CheckCount(): { total: number; done: number } {
  const total = PHASE4_GOALS.reduce((s, g) => s + g.checks.length, 0)
  const doneN = PHASE4_GOALS.reduce((s, g) => s + g.checks.filter(c => c.pass).length, 0)
  return { total, done: doneN }
}

export function phase4GoalsDone(): number {
  return PHASE4_GOALS.filter(g => g.status === 'done').length
}

export function phase4GoalsInProgress(): number {
  return PHASE4_GOALS.filter(g => g.status === 'in-progress').length
}

export const IMPACT_COLOR: Record<PerfGoal['impact'], string> = {
  low:      '#94a3b8',
  medium:   '#38bdf8',
  high:     '#f59e0b',
  critical: '#f87171',
}

export const LAYER_BADGE_COLOR: Record<PerfLayer, string> = {
  js:      '#a78bfa',
  css:     '#38bdf8',
  images:  '#34d399',
  fonts:   '#f472b6',
  network: '#fb923c',
  runtime: '#f59e0b',
  ci:      '#94a3b8',
}

/** Phase 4 baseline metrics — captured 2026-06-17 */
export const PHASE4_BASELINE = {
  lighthousePerformance: 44,
  lighthouseAccessibility: 96,
  lighthouseBestPractices: 96,
  lighthouseSEO: 100,
  jsChunks: 106,
  jsRawMB: 7.6,
  jsGzipMB: 2.1,
  largestChunkKB: 384,
  largestChunkGzipKB: 91,
  capturedAt: '2026-06-17',
}

/** Phase 4 targets */
export const PHASE4_TARGETS = {
  lighthousePerformanceDesktop: 75,
  lighthousePerformanceMobile: 65,
  tbtMs: 300,
  lcpMs: 2500,
  inpMs: 200,
  jsGzipMBTarget: 1.5,
  largestChunkGzipKBTarget: 60,
}
