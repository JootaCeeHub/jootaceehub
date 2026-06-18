/**
 * Phase 1 — Critical Stabilization metrics registry.
 *
 * 12 stabilization goals tracking production-readiness. Each goal contains
 * typed AuditCheck objects so StabilizationTab can render progress consistently.
 * External/manual goals (Cloudflare Access, Sentry/Plausible, etc.) are marked
 * with done() only after the runbook is completed manually.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface StabilizationCheck {
  label: string
  pass: boolean
  hint?: string
}

export type StabilizationStatus = 'done' | 'in-progress' | 'planned' | 'external'

export interface StabilizationGoal {
  id: string
  order: number
  title: string
  subtitle: string
  objective: string
  status: StabilizationStatus
  domain: StabilizationDomain
  checks: StabilizationCheck[]
}

export type StabilizationDomain =
  | 'build'
  | 'quality'
  | 'security'
  | 'monitoring'
  | 'testing'
  | 'infrastructure'

// ── Check helpers ─────────────────────────────────────────────────────────────

function done(label: string, hint?: string): StabilizationCheck {
  return { label, pass: true, hint }
}

function todo(label: string, hint?: string): StabilizationCheck {
  return { label, pass: false, hint }
}

// ── Goals ─────────────────────────────────────────────────────────────────────

export const STABILIZATION_GOALS: StabilizationGoal[] = [
  {
    id: 'GOAL_FONTS',
    order: 1,
    title: 'Self-host Fonts',
    subtitle: 'Eliminate Google Fonts runtime dependency',
    objective: 'Fonts served from own domain — no runtime requests to fonts.gstatic.com',
    status: 'done',
    domain: 'build',
    checks: [
      done('next/font/google downloads at build time into _next/static/media/'),
      done('Removed preconnect hints to fonts.googleapis.com and fonts.gstatic.com'),
      done('CSP font-src updated: removed https://fonts.gstatic.com'),
      done('public/_headers font-src updated to match CSP'),
    ],
  },
  {
    id: 'GOAL_HERMETIC_BUILD',
    order: 2,
    title: 'Hermetic Build',
    subtitle: 'Confirm zero external network calls during build',
    objective: 'npm run build succeeds with no runtime fetches to external services',
    status: 'done',
    domain: 'build',
    checks: [
      done('No API routes in static export — all data is client-side or static'),
      done('no fetch() to localhost or external URLs at build time'),
      done('Fonts self-hosted — no Google Fonts request at build'),
      done('Build output: 107 static HTML pages, no server dependencies'),
    ],
  },
  {
    id: 'GOAL_CONTENT_QA_CI',
    order: 3,
    title: 'Content QA in CI',
    subtitle: 'Execute qa:content automatically on every build',
    objective: 'npm run qa:content runs in CI build stage after npm run build',
    status: 'done',
    domain: 'quality',
    checks: [
      done('scripts/content-qa.mjs created — scans dist/ for placeholders + broken links'),
      done('package.json: "qa:content": "node scripts/content-qa.mjs"'),
      done('ci.yml build stage: "Content QA" step after npm run build'),
      done('13 required routes validated on every push'),
    ],
  },
  {
    id: 'GOAL_COVERAGE_MANDATORY',
    order: 4,
    title: 'Coverage Mandatory',
    subtitle: 'Fail CI if coverage-summary.json is missing',
    objective: 'Coverage step exits 1 when @vitest/coverage-v8 is not installed',
    status: 'done',
    domain: 'quality',
    checks: [
      done('ci.yml coverage step: exit 1 (not exit 0) when summary file missing'),
      done('Threshold: ≥ 40% statement coverage enforced'),
      todo('@vitest/coverage-v8 installed as devDependency', 'Run: npm install -D @vitest/coverage-v8'),
    ],
  },
  {
    id: 'GOAL_LINT_CLEAN',
    order: 5,
    title: 'Zero Lint Warnings',
    subtitle: 'Resolve all 36 warnings and enforce --max-warnings=0',
    objective: 'npm run lint exits 0 with zero warnings; CI enforces --max-warnings=0',
    status: 'done',
    domain: 'quality',
    checks: [
      done('Fixed no-unused-vars: 28 warnings across 10 admin panel files'),
      done('Fixed no-unused-expressions: 2 warnings in ReposSection + PlatformsTab'),
      done('Fixed no-img-element: 3 warnings with eslint-disable-next-line'),
      done('ci.yml lint step: npm run lint -- --max-warnings=0'),
      done('npm run lint exits 0 with 0 warnings'),
    ],
  },
  {
    id: 'GOAL_LIGHTHOUSE',
    order: 7,
    title: 'Real Lighthouse Scores',
    subtitle: 'Execute Lighthouse and record new baseline results',
    objective: 'Run lhci autorun locally and document scores in AGENTS.md',
    status: 'planned',
    domain: 'quality',
    checks: [
      done('Lighthouse CI configured in lighthouserc.json (desktop + mobile)'),
      done('CI pipeline runs lhci autorun on every build'),
      todo('Run Lighthouse locally and record results', 'npx lhci autorun after npm run build'),
      todo('Update AGENTS.md Phase 1 baseline with new scores'),
    ],
  },
  {
    id: 'GOAL_CLOUDFLARE_DEPLOY',
    order: 8,
    title: 'Cloudflare Deployment',
    subtitle: 'Verify live deployment on Cloudflare Pages',
    objective: 'jootacee.com resolves to CF Pages, all 107 pages reachable',
    status: 'external',
    domain: 'infrastructure',
    checks: [
      todo('Set CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID in GitHub Secrets'),
      todo('Push to main → CI deploy stage succeeds'),
      todo('Verify jootacee.com returns HTTP 200 for /en/, /es/, /admin/'),
      todo('Verify _headers (CSP, HSTS) served correctly — check via curl -I'),
    ],
  },
  {
    id: 'GOAL_MONITORING',
    order: 9,
    title: 'Sentry + Plausible',
    subtitle: 'Configure error monitoring and privacy-first analytics',
    objective: 'NEXT_PUBLIC_SENTRY_DSN and NEXT_PUBLIC_PLAUSIBLE_DOMAIN set in CF env',
    status: 'external',
    domain: 'monitoring',
    checks: [
      todo('Create Sentry project → copy DSN'),
      todo('Set NEXT_PUBLIC_SENTRY_DSN in Cloudflare Pages environment variables'),
      todo('Create Plausible site → set NEXT_PUBLIC_PLAUSIBLE_DOMAIN'),
      todo('Verify trackEvent() calls appear in Plausible dashboard after first visit'),
    ],
  },
  {
    id: 'GOAL_ADMIN_AUTH',
    order: 10,
    title: 'Admin Cloudflare Access',
    subtitle: 'Protect /admin with Cloudflare Access (zero-trust)',
    objective: 'Unauthenticated visitors to /admin/ get CF Access login prompt',
    status: 'external',
    domain: 'security',
    checks: [
      todo('Create CF Access application for jootacee.com/admin/*'),
      todo('Set policy: allow your email only'),
      todo('Verify: incognito → jootacee.com/admin → CF login required'),
      todo('Verify: authenticated admin state still works after CF Access pass-through'),
    ],
  },
  {
    id: 'GOAL_LOCALSTORAGE_AUDIT',
    order: 11,
    title: 'localStorage Audit',
    subtitle: 'Verify no secrets stored in localStorage',
    objective: 'All localStorage.setItem calls store only UI state, no credentials',
    status: 'done',
    domain: 'security',
    checks: [
      done('Grep audit: no API keys, tokens, or passwords in localStorage.setItem calls'),
      done('jootacee-command-v2: stores AdminState (site config, design tokens — no secrets)'),
      done('psi-cache keys: store Lighthouse JSON results + timestamps (no secrets)'),
      done('jootacee-last-backup: stores ISO timestamp only'),
      done('Google auth token moved to sessionStorage (expires on browser close)'),
    ],
  },
  {
    id: 'GOAL_E2E_TESTS',
    order: 12,
    title: 'E2E Smoke Tests',
    subtitle: 'Add Playwright smoke tests for critical user paths',
    objective: 'E2E tests verify: home loads, locale switch works, admin accessible',
    status: 'planned',
    domain: 'testing',
    checks: [
      todo('Install Playwright: npm install -D @playwright/test && npx playwright install'),
      todo('Create e2e/smoke.spec.ts: home page loads + key sections visible'),
      todo('Create e2e/locale.spec.ts: /en/ → /es/ switch → Spanish text visible'),
      todo('Create e2e/admin.spec.ts: /admin/ loads, dashboard renders'),
      todo('Add e2e step to CI after build stage'),
    ],
  },
]

// ── Derived helpers ───────────────────────────────────────────────────────────

export function stabilizationCheckCount(): { total: number; done: number } {
  const all = STABILIZATION_GOALS.flatMap(g => g.checks)
  return { total: all.length, done: all.filter(c => c.pass).length }
}

export function stabilizationGoalsDone(): number {
  return STABILIZATION_GOALS.filter(g => g.status === 'done').length
}

export function stabilizationGoalsInProgress(): number {
  return STABILIZATION_GOALS.filter(g => g.status === 'in-progress').length
}

export const STABILIZATION_DOMAIN_COLOR: Record<StabilizationDomain, string> = {
  build:          '#22d3ee',
  quality:        '#a78bfa',
  security:       '#f87171',
  monitoring:     '#fb923c',
  testing:        '#34d399',
  infrastructure: '#60a5fa',
}

export const STABILIZATION_DOMAIN_LABEL: Record<StabilizationDomain, string> = {
  build:          'Build',
  quality:        'Quality',
  security:       'Security',
  monitoring:     'Monitoring',
  testing:        'Testing',
  infrastructure: 'Infrastructure',
}
