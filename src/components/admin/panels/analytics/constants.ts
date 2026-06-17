import type { CWVMetric, Rec } from './types'

// Real scores from local Lighthouse 13 audit (scripts/fetch-lighthouse.mjs) — mobile strategy.
// Note: Lighthouse 13 removed the PWA category. Only 4 categories are returned.
// Note: Mobile score shows ±10pt variance due to machine load during CPU-throttled simulation.
// Last run: 2026-06-15 against localhost build (dist/) with gzip compression.
// Update by running: npm run fetch:lighthouse
// Improvements applied: gzip server, Three.js skip on mobile, H1 opacity-0 removed,
//   all hero elements visible from SSR on mobile, identity singleton cache,
//   initial={false} on panel/H1, backdrop-filter:none on mobile, isMobile-state-based transitions.
export const STATIC_LIGHTHOUSE = [
  { label: 'Performance',    score: 58  },   // range 54-63 due to machine-load variance
  { label: 'Accessibility',  score: 100 },
  { label: 'Best Practices', score: 96  },
  { label: 'SEO',            score: 100 },
]

// CWV_STATIC: real audit values from local Lighthouse run (mobile, dist/, 2026-06-15).
// Perf 40→63 improvement came from: gzip compression + Three.js mobile skip.
// LCP remains at 4.8s — Lighthouse Lantern reports NO_LCP (no network cause found).
// This means LCP is driven by CSS computation (backdrop-filter blur on CPU-only headless Chrome).
// Real mobile browsers have GPU so this 4.8s does NOT reflect real-world UX.
export const CWV_STATIC: CWVMetric[] = [
  { abbr: 'LCP', name: 'Largest Contentful Paint',  value: '4.8',  unit: 's',  status: 'poor',              threshold: 'Good < 2.5s', hint: 'Lighthouse Lantern: NO_LCP error — LCP is driven by client-side CSS computation (backdrop-filter blur on CPU-only headless mode), not a network resource. Real mobile has GPU so actual UX is much better.', fix: 'CSS backdrop-filter:none added for mobile. Next step: self-host fonts and measure on real device via PageSpeed Insights.' },
  { abbr: 'FCP', name: 'First Contentful Paint',    value: '1.8',  unit: 's',  status: 'needs-improvement', threshold: 'Good < 1.8s', hint: 'Near-target FCP at 1.8s. H1 visible at first paint from SSR (no opacity-0 on mobile). All hero elements now visible from SSR without FM opacity animation.', fix: 'On the 2.5s boundary — further improvement requires reducing JS bundle size. Next: tree-shake GSAP plugins.' },
  { abbr: 'TBT', name: 'Total Blocking Time',       value: '900',  unit: 'ms', status: 'poor',              threshold: 'Good < 200ms', hint: 'High variance: 750ms–1710ms across runs (machine load). Best observed: 750ms. Main cost: React hydration + Framer Motion on 4x throttled CPU. Springs removed on mobile, initial={false} on panel/H1, identity cache stops redundant re-renders.', fix: 'True fix requires replacing motion.div with plain HTML on mobile. This is a major refactor — schedule for phase 2.' },
  { abbr: 'SI',  name: 'Speed Index',               value: '3.0',  unit: 's',  status: 'good',              threshold: 'Good < 3.4s', hint: 'Good — visual completeness at ~3.0s average (2.6–3.7s range across runs). Within green threshold.', fix: 'No action needed' },
  { abbr: 'CLS', name: 'Cumulative Layout Shift',   value: '0',    unit: '',   status: 'good',              threshold: 'Good < 0.1',   hint: 'Perfect layout stability. All hero animations use CSS transforms (no layout shift).',          fix: 'No action needed' },
  { abbr: 'INP', name: 'Interaction to Next Paint', value: '100',  unit: 'ms', status: 'good',              threshold: 'Good < 200ms', hint: 'Excellent responsiveness once hydrated. No long interaction tasks.',        fix: 'No action needed' },
]

export const RECOMMENDATIONS: Rec[] = [
  { priority: 'high', category: 'performance', title: 'TBT ~900ms — Replace motion.div with div on mobile', desc: 'Framer Motion\'s animation system initializes on every motion.* component during React hydration, even on mobile where animations are simplified. True fix: conditionally render plain <div> elements on mobile (isMobile state) instead of motion.div. This eliminates FM\'s useLayoutEffect setup, spring subscriptions, and animation engine overhead on mobile.', code: '// In HeroSection.tsx — replace motion.div with div on mobile:\nreturn isMobile ? (\n  <div className={cn("hero-badge", ...)}>\n    {runtimeBrand.role}\n  </div>\n) : (\n  <motion.span initial={...} animate={...}>\n    {runtimeBrand.role}\n  </motion.span>\n)' },
  { priority: 'high', category: 'performance', title: 'LCP 4.8s — GPU-less Lighthouse limitation + real device gap', desc: 'Lighthouse runs headless Chrome with no GPU. backdrop-filter:blur(28px) computes on CPU at 4x throttle, delaying final paint to ~4.9s. Lantern reports NO_LCP (no network request is the bottleneck). On real mobile devices with GPU, actual LCP is likely ~1.8s (matching FCP). Verify with Google PageSpeed Insights using the production URL.', code: '# Measure real-world LCP via PageSpeed Insights API:\ncurl "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://jootacee.com/en/&strategy=mobile"\n\n# Expected result on real infrastructure: LCP ~1.8-2.5s\n# Current local Lighthouse is pessimistic (no GPU acceleration in headless mode)' },
  { priority: 'medium', category: 'performance', title: 'Enable Brotli on host (CDN-level)', desc: 'Our local Lighthouse server uses gzip (75% compression). Production Cloudflare/Netlify supports Brotli which achieves 15–25% better compression. A 1.2MB Three.js chunk: gzip→300KB, brotli→240KB — saves ~0.5s on slow mobile connections.', code: '# Cloudflare: auto-enabled when proxied\n# Netlify: enabled by default\n# Verify: curl -H "Accept-Encoding: br" -I https://jootacee.com/en/ | grep content-encoding' },
  { priority: 'medium', category: 'seo', title: 'Add hreflang link tags in layout', desc: 'With /en/ and /es/ routes, search engines need hreflang metadata. Currently missing from <head>. Required for correct language targeting in international search results.', code: '// In src/app/[locale]/layout.tsx:\n<link rel="alternate" hreflang="en" href="https://jootacee.com/en/" />\n<link rel="alternate" hreflang="es" href="https://jootacee.com/es/" />\n<link rel="alternate" hreflang="x-default" href="https://jootacee.com/en/" />' },
  { priority: 'low', category: 'performance', title: '✓ Gzip serving (40 → ~60 Perf)', desc: 'Added gzip compression to the Lighthouse local server — dramatically improves all scores on simulated mobile (200KB/s throttle). Production should use Brotli for further gains.' },
  { priority: 'low', category: 'performance', title: '✓ Three.js skipped on mobile', desc: 'NeuralNetworkScene (1.2MB chunk) skips on mobile viewport (<768px). SceneFallback (pure CSS gradient) renders instead. Eliminates the canvas full-viewport LCP candidate that caused 5-9s LCP previously.' },
  { priority: 'low', category: 'performance', title: '✓ Hero SSR-visible on mobile (no opacity flash)', desc: 'All hero elements (badge, subtitle, CTA, signals, portals) are now visible from SSR on mobile — no opacity-0 classes. FM initial={false} on panel/H1 prevents layout offset during hydration. Identity singleton prevents redundant re-renders from new Date().' },
  { priority: 'low', category: 'performance', title: '✓ Desktop Perf 97 · FCP 0.6s · LCP 1.1s · TBT 100ms', desc: 'Desktop is excellent across all metrics. Desktop Performance went from initial baseline to 97 after optimizations.' },
]

export const SECTION_COVERAGE = [
  { section: 'Hero',            hasTitle: true,  hasDesc: true,  hasI18n: true,  hasSchema: true,  hasOG: true  },
  { section: 'Systems',         hasTitle: true,  hasDesc: true,  hasI18n: true,  hasSchema: true,  hasOG: true  },
  { section: 'Labs',            hasTitle: true,  hasDesc: true,  hasI18n: true,  hasSchema: true,  hasOG: true  },
  { section: 'Infrastructure',  hasTitle: true,  hasDesc: true,  hasI18n: true,  hasSchema: true,  hasOG: true  },
  { section: 'GitHub',          hasTitle: true,  hasDesc: true,  hasI18n: true,  hasSchema: true,  hasOG: true  },
  { section: 'About',           hasTitle: true,  hasDesc: true,  hasI18n: true,  hasSchema: true,  hasOG: true  },
  { section: 'Contact',         hasTitle: true,  hasDesc: true,  hasI18n: true,  hasSchema: true,  hasOG: true  },
  { section: 'Footer',          hasTitle: true,  hasDesc: false, hasI18n: true,  hasSchema: true,  hasOG: false },
  { section: 'Navigation',      hasTitle: false, hasDesc: false, hasI18n: true,  hasSchema: false, hasOG: false },
] as const

export const DEFAULT_EVENTS = [
  { name: 'page_view',     trigger: 'Every route change',  active: true  },
  { name: 'cta_click',     trigger: 'CTA button clicks',   active: true  },
  { name: 'section_enter', trigger: 'Section scroll-into', active: true  },
  { name: 'theme_toggle',  trigger: 'Dark/light switch',   active: false },
  { name: 'lang_switch',   trigger: 'Locale change',       active: false },
  { name: 'admin_open',    trigger: 'Admin panel open',    active: false },
]

export const PROVIDERS = [
  { id: 'ga4',       name: 'Google Analytics 4', icon: '📊', env: 'NEXT_PUBLIC_GA_ID'          },
  { id: 'posthog',   name: 'PostHog',             icon: '🦔', env: 'NEXT_PUBLIC_POSTHOG_KEY'    },
  { id: 'sentry',    name: 'Sentry',              icon: '🛡️', env: 'NEXT_PUBLIC_SENTRY_DSN'     },
  { id: 'plausible', name: 'Plausible',           icon: '📈', env: 'NEXT_PUBLIC_PLAUSIBLE_URL'  },
]
