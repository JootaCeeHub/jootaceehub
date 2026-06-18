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
  status:     'in-progress',
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
    todo('Per-route chunk table in BundleTab admin panel',
      'BundleTab currently shows live resource timing groups. Add a static chunk table (loaded from build manifest or build-time JSON) showing chunk name → size → routes that include it.'),
    todo('Build-time chunk manifest JSON generated',
      'Add a postbuild script that reads .next/build-manifest.json and writes dist/chunk-manifest.json: { [chunkName]: { raw: number, gzip: number, routes: string[] } }. BundleTab reads this file via fetch() on load.'),
    todo('Heavy library identified and documented',
      'Run npm run analyze. Document top 5 heaviest chunks in AGENTS.md with their gzip sizes and which routes include them. Minimum: Three.js, Framer Motion, GSAP, react-three-fiber/drei.'),
    todo('Tree-shaking verified for GSAP',
      "GSAP tree-shakes only if imports are from 'gsap/dist/CSSPlugin' not 'gsap' root. Verify no barrel imports. Run analyze to confirm gsap chunk is ≤ 50 KB gzip."),
  ],
}

// ─── Goal 1 — Separate Admin Chunks ──────────────────────────────────────────

export const GOAL_ADMIN_CHUNKS: PerfGoal = {
  id:         'admin-chunks',
  order:      1,
  title:      'Admin Chunk Separation',
  subtitle:   'Zero admin JS on public routes',
  objective:  'The /admin route must not contribute any JS to the public landing page. Heavy admin libs (react-md-editor, chart libs) stay isolated.',
  status:     'in-progress',
  impact:     'high',
  layers:     ['js'],
  dependsOn:  ['bundle-analyzer'],
  baseline:   'Unknown — admin/public boundary not verified',
  target:     '0 admin chunks on /en/ route',
  estimatedGain: '+5–10 Lighthouse points (TBT reduction)',
  checks: [
    done('/admin route is outside [locale] segment',
      'src/app/admin/ is a separate route group from src/app/[locale]/. Next.js creates separate page bundles for separate route segments. Admin page bundle is not included in landing pages.'),
    todo('Verify via chunk manifest that admin chunks are absent from /en/',
      "After chunk-manifest.json is generated, grep for 'admin' chunks in /en/ route entry. CI test: assert dist/en/index.html does not reference any admin-prefixed JS files."),
    todo('@uiw/react-md-editor isolated to admin route',
      '@uiw/react-md-editor (~200 KB) is dynamically imported in src/components/cms/MarkdownEditor.tsx with ssr:false. Verify this component is only used inside /admin/ routes, never in public pages.'),
    todo('Admin-specific state (useAdmin hook) not bundled on public routes',
      'The AdminContext provider lives in src/app/admin/layout.tsx. Verify src/lib/admin/store.tsx is not imported by any public route component. Run: grep -r "useAdmin" src/app/[locale]/ — must return nothing.'),
    todo('Heavy admin dependencies audited',
      'Run npm run analyze and document any admin-only chunks > 50 KB gzip: MDEditor, chart lib, admin store. Confirm each has a matching ssr:false or dynamic() boundary.'),
  ],
}

// ─── Goal 2 — Hero and 3D Optimization ───────────────────────────────────────

export const GOAL_HERO_3D: PerfGoal = {
  id:         'hero-3d',
  order:      2,
  title:      'Hero & 3D Optimization',
  subtitle:   'Reduce TBT from Three.js parse time',
  objective:  'Three.js is the single biggest TBT contributor. Reduce its parse/execute cost on the main thread without removing the 3D effect.',
  status:     'in-progress',
  impact:     'critical',
  layers:     ['js', 'runtime'],
  dependsOn:  ['bundle-analyzer'],
  baseline:   'TBT ~900 ms (Three.js parse on main thread)',
  target:     'TBT < 300 ms',
  estimatedGain: '+15–20 Lighthouse points',
  checks: [
    done('NeuralNetworkScene loaded with dynamic + ssr:false',
      'src/components/sections/HeroSection.tsx: const NeuralNetworkScene = dynamic(() => import(...), { ssr: false }). Prevents SSR bundle inclusion. Network transfer deferred to client.'),
    done('3D wrapped in Suspense with null fallback',
      'HeroSection.tsx wraps <NeuralNetworkScene> in <Suspense fallback={null}>. Hero text renders immediately; 3D loads after.'),
    todo('requestIdleCallback gate for 3D init',
      "Add a client-side gate: only mount <NeuralNetworkScene> after window.requestIdleCallback fires (or a 300ms setTimeout fallback). Prevents Three.js from competing with LCP paint. Implementation: useState(false) + useEffect(() => { requestIdleCallback(() => setShow(true)) })."),
    todo('Shader compilation deferred via offscreenCanvas or worker',
      'Three.js shader compilation blocks main thread. Evaluate WebGL OffscreenCanvas + transferControlToOffscreen(). If too complex, use renderer.compile() pre-warming in an idle callback after first paint.'),
    todo('Three.js version pinned and unused modules excluded',
      "Verify package.json: three pinned to exact version (no ^). Check if drei imports like OrbitControls, Environment, Stars can be individually imported from 'three/examples/jsm' to avoid shipping the full drei bundle."),
    todo('3D scene quality reduced on reduced-motion preference',
      "Add CSS/JS prefers-reduced-motion check: if window.matchMedia('(prefers-reduced-motion: reduce)').matches, replace 3D scene with a static SVG/CSS gradient. Saves full Three.js parse for users who prefer it."),
    todo('R3F frame loop stopped when hero scrolled out of view',
      "Use IntersectionObserver on the hero section: when not visible, call gl.setAnimationLoop(null) to pause the RAF loop. Resume on re-entry. Reduces idle CPU usage by ~30%."),
  ],
}

// ─── Goal 3 — Mobile Effects Off by Default ──────────────────────────────────

export const GOAL_MOBILE_EFFECTS: PerfGoal = {
  id:         'mobile-effects',
  order:      3,
  title:      'Mobile Effects Off',
  subtitle:   'Detect mobile, skip heavy animations',
  objective:  'Mobile devices cannot afford Three.js + GSAP + Framer Motion at full quality. Detect mobile early and skip non-critical effects.',
  status:     'planned',
  impact:     'high',
  layers:     ['js', 'runtime'],
  dependsOn:  ['hero-3d'],
  baseline:   'All effects enabled on all devices',
  target:     'Mobile TBT < 200 ms, no 3D on low-end devices',
  estimatedGain: '+10–15 Lighthouse mobile points',
  checks: [
    todo('Device tier detection at startup (not navigator.userAgent)',
      "Use performance.memory (if available), navigator.hardwareConcurrency < 4, and connection.effectiveType === '2g'/'3g' to detect low-end devices. Store tier in sessionStorage: 'perf-tier': 'low'|'medium'|'high'. Never use userAgent for this."),
    todo('3D scene skipped on tier:low devices',
      "HeroSection.tsx: if perfTier === 'low', render a CSS animated gradient placeholder instead of <NeuralNetworkScene>. Full Three.js bundle never fetched on these devices."),
    todo('GSAP animations simplified on tier:low',
      "GSAP scroll triggers and stagger animations should use a lighter variant on low-end: fewer elements, shorter duration. Add a context: const { simplified } = usePerfTier() hook."),
    todo('Framer Motion reduced on mobile',
      "On mobile (width < 768px), replace spring animations with simple CSS transitions. Use <MotionConfig reducedMotion='always'> for screens < 640px to prevent Framer Motion overhead."),
    todo('usePerfTier hook created and exported',
      "Create src/hooks/usePerfTier.ts: returns { tier: 'low'|'medium'|'high', isMobile: boolean, prefersReducedMotion: boolean }. Reads from sessionStorage cache set at app init. Used by HeroSection, HomeClient, NeuralNetworkScene."),
  ],
}

// ─── Goal 4 — Pre-render More Public Content ─────────────────────────────────

export const GOAL_PRERENDER: PerfGoal = {
  id:         'prerender-content',
  order:      4,
  title:      'Pre-render Public Content',
  subtitle:   'Static HTML where data is known at build',
  objective:  'Content known at build time should be in static HTML, not rendered by JS. Reduces JS parsing and improves FCP.',
  status:     'in-progress',
  impact:     'medium',
  layers:     ['js', 'network'],
  dependsOn:  [],
  baseline:   'Most sections client-rendered (ssr:false)',
  target:     'Hero, Nav, Footer in initial HTML; sections below fold client-rendered',
  estimatedGain: '+5–8 Lighthouse points (FCP improvement)',
  checks: [
    done('Static export generates full HTML per locale',
      'output: export produces /en/index.html and /es/index.html with full head, structured data, and critical meta. 105 static pages generated.'),
    done('generateStaticParams() on all dynamic routes',
      'Every [locale] route exports generateStaticParams() returning [{locale: en},{locale: es}]. No missing routes.'),
    todo('Hero section text in static HTML (remove ssr:false from hero text)',
      "HeroSection text content (headline, CTA) can be server-rendered — it doesn't need client-side state. Only the 3D canvas requires ssr:false. Split HeroSection into HeroText (SSR-safe) + HeroCanvas (dynamic ssr:false). Reduces hero JS parse."),
    todo('Navigation in static HTML',
      'Navigation.tsx currently uses useTranslations() which requires I18nProvider. Verify Navigation renders into static HTML (check /en/index.html for <nav> in the body). If missing, the hydration cost is paid before any visible content.'),
    todo('Footer in static HTML',
      'Footer.tsx uses useTranslations(). Same check: verify <footer> appears in dist/en/index.html. If not, the footer is JS-rendered unnecessarily.'),
    todo('Lab pages pre-render card grid from static data',
      "Lab cards use static data from src/lib/resources/. The card grid can be generated server-side. Remove ssr:false from LabsPreview if the data is static. Test: check dist/en/labs/index.html for card content in body HTML."),
  ],
}

// ─── Goal 5 — Reduce ssr:false ────────────────────────────────────────────────

export const GOAL_REDUCE_SSR_FALSE: PerfGoal = {
  id:         'reduce-ssr-false',
  order:      5,
  title:      'Reduce ssr:false Usage',
  subtitle:   'Only disable SSR when truly needed',
  objective:  'ssr:false prevents static HTML generation for that component. Only use it for browser-only APIs. Static content with ssr:false loses SEO and FCP benefits.',
  status:     'in-progress',
  impact:     'medium',
  layers:     ['js'],
  dependsOn:  ['prerender-content'],
  baseline:   '10+ dynamic() calls with ssr:false across HomeClient, HeroSection, MarkdownEditor',
  target:     'ssr:false only on: NeuralNetworkScene, MarkdownEditor, analytics components',
  estimatedGain: '+3–5 Lighthouse points',
  checks: [
    done('NeuralNetworkScene ssr:false — correct, browser-only WebGL',
      "HeroSection.tsx: dynamic import with ssr:false is required because Three.js uses WebGL which doesn't exist in Node.js. This is correct."),
    done('MarkdownEditor ssr:false — correct, uiw/react-md-editor requires browser',
      '@uiw/react-md-editor uses browser DOM APIs. ssr:false is required. Admin-only component — no SEO impact.'),
    todo('HomeClient ssr:false audit — remove for static-data sections',
      "HomeClient.tsx has 5+ dynamic() with ssr:false: SystemsPreview, LabsPreview, InfraPreview, JournalPreview, CollaborationCTA. Audit each: if the component only renders static data and uses no browser APIs, remove ssr:false. Restore ssr:true for at least SystemsPreview and LabsPreview."),
    todo('IntersectionObserver in components replaced with CSS',
      'Some below-fold sections use IntersectionObserver for entry animations. This requires ssr:false. Replace with CSS @starting-style or CSS animation-timeline where supported, removing the browser-API dependency.'),
    todo('SessionMetrics and analytics components verified not on public path',
      "Analytics instruments (liveVitals, navMetrics) are only mounted inside AnalyticsPanel.tsx (admin route). Verify via grep that installSessionMetrics() is never imported by [locale]/page.tsx or [locale]/layout.tsx."),
  ],
}

// ─── Goal 6 — Self-host Fonts ─────────────────────────────────────────────────

export const GOAL_SELF_HOST_FONTS: PerfGoal = {
  id:         'self-host-fonts',
  order:      6,
  title:      'Self-host Fonts',
  subtitle:   'Eliminate Google Fonts network round-trip',
  objective:  'next/font/google downloads fonts from Google CDN at build and serves them locally. If already configured correctly, there is no runtime Google Fonts request.',
  status:     'in-progress',
  impact:     'medium',
  layers:     ['fonts', 'network'],
  dependsOn:  [],
  baseline:   'Google Fonts via next/font/google with display:swap',
  target:     'Zero external font requests at runtime; fonts served from same origin',
  estimatedGain: '+2–4 Lighthouse points (eliminate render-blocking request)',
  checks: [
    done('next/font/google configured with display:swap',
      'src/app/layout.tsx: Inter and JetBrains Mono loaded via next/font/google with display:swap. Next.js downloads and serves font files locally at build time — no runtime Google Fonts CDN request.'),
    done('Font preconnect hints present',
      '<link rel="preconnect" href="https://fonts.googleapis.com"> and fonts.gstatic.com added to root layout. Belt-and-suspenders in case of fallback.'),
    todo('Verify zero external font requests in production',
      "Open dist/en/index.html. Search for fonts.googleapis.com or fonts.gstatic.com. Should be 0 matches — next/font/google inlines the font face into a <style> tag with local /en/_next/static/media/*.woff2 URLs. If Google CDN requests still appear, check that no @import url(fonts.googleapis.com) remains in globals.css."),
    todo('globals.css audited for @import font rules',
      "Search src/app/globals.css for '@import' rules. Any @import of Google Fonts must be replaced with next/font/google equivalent. next/font handles subsetting and cache headers automatically."),
    todo('Font subset configured for Latin only',
      "next/font/google: add subsets: ['latin'] to Inter and JetBrains Mono. Reduces font file size by ~60% by excluding non-Latin glyphs. This is a one-line change in src/app/layout.tsx."),
    todo('Font variable CSS registered in Tailwind config',
      "Inter loaded as variable font → CSS var --font-inter. Verify tailwind.config.ts uses fontFamily.sans: ['var(--font-inter)', ...defaultTheme.fontFamily.sans]. Ensures Tailwind font utilities map to the self-hosted font."),
  ],
}

// ─── Goal 7 — Optimize Images ─────────────────────────────────────────────────

export const GOAL_IMAGES: PerfGoal = {
  id:         'optimize-images',
  order:      7,
  title:      'Image Optimization',
  subtitle:   'WebP/AVIF, proper sizing, lazy loading',
  objective:  'Unoptimized images are a common Lighthouse penalty. Static export has constraints: next/image with output:export requires manual width/height. All images must have explicit dimensions.',
  status:     'planned',
  impact:     'medium',
  layers:     ['images', 'network'],
  dependsOn:  [],
  baseline:   'PWA icons are PNG. OG image is unverified. No next/image usage found.',
  target:     'All images use next/image or have explicit width/height; no unoptimized-images warning',
  estimatedGain: '+3–6 Lighthouse points',
  checks: [
    todo('Audit all <img> tags in codebase',
      "Run: grep -rn '<img' src/ --include='*.tsx'. Every <img> without width/height causes layout shift (CLS). Replace with next/image or add explicit dimensions."),
    todo('PWA icons converted to WebP (in addition to PNG)',
      "public/icon-192x192.png, icon-512x512.png, apple-touch-icon.png exist as PNG. Add WebP versions using ImageMagick: convert icon-512x512.png icon-512x512.webp. Update manifest.ts to include WebP versions with type:'image/webp'."),
    todo('OG image verified and optimized',
      'Check that public/og-image.jpg or og-image.png exists and is ≤ 300 KB. Open Graph images should be exactly 1200x630 px. Use ImageMagick to resize and compress.'),
    todo('next/image configured for static export',
      "next.config.ts: add images.unoptimized: true only as last resort. Prefer images.loader: 'custom' with a CDN or use static width/height props on <Image> components. Static export with next/image requires explicit dimensions — never use fill without a positioned parent."),
    todo('Lab card images use consistent aspect ratio',
      'Lab cards and project cards that show external thumbnails should use a fixed aspect ratio container (aspect-video, aspect-square) to prevent CLS. Replace any dynamic-height image containers.'),
  ],
}

// ─── Goal 8 — Measure Real INP ────────────────────────────────────────────────

export const GOAL_INP: PerfGoal = {
  id:         'measure-inp',
  order:      8,
  title:      'Measure Real INP',
  subtitle:   'Interaction to Next Paint — Core Web Vital',
  objective:  'INP replaced FID as a Core Web Vital in 2024. It measures the worst interaction latency. Must be < 200 ms. Currently not tracked in the analytics panel.',
  status:     'in-progress',
  impact:     'high',
  layers:     ['runtime', 'ci'],
  dependsOn:  [],
  baseline:   'INP not collected (FID was tracked, INP is not)',
  target:     'INP < 200 ms (good) in live panel',
  estimatedGain: 'Direct impact on Best Practices score',
  checks: [
    done('web-vitals library installed or PerformanceObserver available',
      'live-metrics.ts uses PerformanceObserver to collect CLS, LCP, FID. The same API supports INP via event timing entries.'),
    todo('INP collected in live-metrics.ts',
      "Add INP observer to observeWebVitals() in src/lib/analytics/live-metrics.ts. Use PerformanceObserver with {type: 'event', buffered: true} to collect event-timing entries. INP = max(duration) of all interactions. Or use: import {onINP} from 'web-vitals' if installed."),
    todo('INP displayed in OverviewTab / PerformanceTab',
      "OverviewTab and PerformanceTab show LCP, CLS, FID, TTFB. Add INP alongside FID (or replace FID since it's deprecated). Show green/yellow/red threshold: good < 200ms, needs improvement < 500ms, poor ≥ 500ms."),
    todo('INP budget in lighthouserc.json',
      "Add to lighthouserc.json assertions: 'interaction-to-next-paint': ['warn', {maxNumericValue: 200}]. Lighthouse 12+ includes INP in its audit set."),
    todo('INP alert in alerts.ts',
      "Add to src/lib/analytics/alerts.ts: if INP > 500ms, push critical alert. If INP > 200ms, push warning. INP should be read from liveVitals.inp in the AnalyticsPanel."),
    todo('Long task breakdown shown in PerformanceTab',
      'Long tasks (>50ms) are already collected via observeLongTasks(). Add a breakdown chart in PerformanceTab showing the top long tasks that drive high INP: task name, duration, attribution (script URL).'),
  ],
}

// ─── Goal 9 — CI Budget Enforcement ──────────────────────────────────────────

export const GOAL_CI_BUDGETS: PerfGoal = {
  id:         'ci-budgets',
  order:      9,
  title:      'CI Performance Budgets',
  subtitle:   'Block merge on Lighthouse regression',
  objective:  'Currently CI warns on performance metrics but does not block. Tighten budgets to block merges when performance regresses from the baseline.',
  status:     'in-progress',
  impact:     'medium',
  layers:     ['ci'],
  dependsOn:  ['measure-inp'],
  baseline:   'lighthouserc.json: performance warn ≥ 0.75, LCP warn < 4000ms',
  target:     'Performance error ≥ 0.80, TBT error < 400ms, LCP error < 3000ms',
  estimatedGain: 'Prevents regression — maintains gains from goals 0–8',
  checks: [
    done('lighthouserc.json exists with basic assertions',
      'lighthouserc.json has assertions for performance (warn ≥ 0.75), accessibility (error = 1.0), SEO (error = 1.0), FCP, LCP, TBT, CLS, TTI.'),
    done('CI runs Lighthouse in quality → build → lighthouse pipeline',
      '.github/workflows/ci.yml: 3-stage pipeline. Lighthouse job depends on build. Runs lhci autorun on dist/ with staticDistDir.'),
    todo('Tighten performance budget to error (not warn)',
      "Update lighthouserc.json: 'categories:performance': ['error', {minScore: 0.80}]. Currently warn at 0.75. After Phase 4 optimizations land, flip to error to block regressions."),
    todo('TBT budget tightened to < 400ms error',
      "Update: 'total-blocking-time': ['error', {maxNumericValue: 400}]. Currently warn < 600ms. TBT is the biggest Lighthouse lever for this codebase."),
    todo('LCP budget tightened to < 3000ms error',
      "Update: 'largest-contentful-paint': ['error', {maxNumericValue: 3000}]. Currently warn < 4000ms."),
    todo('bundle-size CI check added',
      "Add a CI step that runs npm run build and checks dist/ total JS size. Use bundlesize or a custom script: node -e 'assert total gzip < 1.5MB'. Block merge if over budget."),
    todo('Mobile Lighthouse run added to CI',
      "Add a second lhci job with mobile preset (throttlingMethod: simulate, mobile: true). Track mobile scores separately. Mobile LCP target: < 4000ms."),
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
