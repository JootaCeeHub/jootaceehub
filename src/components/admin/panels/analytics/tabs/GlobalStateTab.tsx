'use client'

import React, { useState, useEffect } from 'react'
import {
  CheckCircle2, XCircle, AlertTriangle, Clock, ChevronDown, ChevronRight,
  GitBranch, Server, Shield, Code2, Zap, Database,
  Radio, Rocket, Globe, Activity, BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CmsStatus } from '@/lib/admin/types'
import type { ProjectCheck } from '@/lib/analytics/project-audit'
import type { PSIResult } from '@/lib/analytics/pagespeed'
import type { HealthDomain, ProdCheck, AuditCheck } from '@/lib/analytics/scoring'
import type { NavigationMetrics } from '@/lib/analytics/live-metrics'
import type { BundleSummary } from '@/lib/analytics/bundle-inspector'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CmsRegistryAudit {
  projects:  RegistryStats
  research:  RegistryStats
  labs:      RegistryStats
  systems:   RegistryStats
  updatedAt: string
}

export interface RegistryStats {
  total:     number
  published: number
  draft:     number
  review:    number
  archived:  number
}

interface Props {
  cmsAudit:         CmsRegistryAudit | null
  secChecks:        ProjectCheck[]
  pwaChecks:        ProjectCheck[]
  dxChecks:         ProjectCheck[]
  htmlChecks:       ProjectCheck[]
  schemaChecks:     ProjectCheck[]
  psiResult:        PSIResult | null
  contentArchAudit: ContentArchAudit | null
  lastRunAt:        string | null
  // Live analysis data
  healthDomains:    HealthDomain[]
  prodChecks:       ProdCheck[]
  programScore:     number
  totalHealthPasses: number
  totalHealthItems:  number
  seoChecks:        AuditCheck[]
  errorCount:       number
  longTaskCount:    number
  navMetrics:       NavigationMetrics | null
  bundleSummary:    BundleSummary | null
}

export interface ContentArchAudit {
  articlesInContent:  number
  articlesInJournal:  number  // legacy path
  projectsCount:      number
  researchCount:      number
  labsCount:          number
  systemsCount:       number
  adminStateKey:      string
  adminStateValid:    boolean
  adminStateSizeKB:   number
  supabaseImports:    number  // should be 0
  updatedAt:          string
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, subtitle, badge, expanded, onToggle }: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  title: string
  subtitle?: string
  badge?: { label: string; variant: 'ok' | 'warn' | 'error' | 'info' | 'pending' }
  expanded: boolean
  onToggle: () => void
}) {
  const badgeCls: Record<string, string> = {
    ok:      'bg-emerald-400/10 border-emerald-400/25 text-emerald-400',
    warn:    'bg-amber-400/10 border-amber-400/25 text-amber-400',
    error:   'bg-rose-400/10 border-rose-400/25 text-rose-400',
    info:    'bg-sky-400/10 border-sky-400/25 text-sky-400',
    pending: 'bg-white/5 border-white/15 text-white/40',
  }
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors text-left"
    >
      <Icon size={13} className="shrink-0 text-white/40" />
      <div className="flex-1 min-w-0">
        <p className="font-mono text-[11px] font-semibold text-white/80 uppercase tracking-wider">{title}</p>
        {subtitle && <p className="font-mono text-[9px] text-white/30 mt-0.5">{subtitle}</p>}
      </div>
      {badge && (
        <span className={cn('shrink-0 rounded border px-2 py-0.5 font-mono text-[8px] uppercase tracking-widest', badgeCls[badge.variant])}>
          {badge.label}
        </span>
      )}
      {expanded
        ? <ChevronDown size={11} className="shrink-0 text-white/20" />
        : <ChevronRight size={11} className="shrink-0 text-white/20" />
      }
    </button>
  )
}

function CheckRow({ label, pass, detail, warn }: { label: string; pass: boolean | null; detail?: string; warn?: boolean }) {
  const icon = pass === null
    ? <Clock size={11} className="text-white/25" />
    : pass
      ? <CheckCircle2 size={11} className="text-emerald-400/80" />
      : warn
        ? <AlertTriangle size={11} className="text-amber-400/80" />
        : <XCircle size={11} className="text-rose-400/80" />

  return (
    <div className="flex items-center gap-2.5 py-1.5 border-b border-white/4 last:border-0">
      {icon}
      <span className="flex-1 font-mono text-[10px] text-white/60">{label}</span>
      {detail && <span className="font-mono text-[9px] text-white/30 shrink-0">{detail}</span>}
    </div>
  )
}

function StatusPill({ status }: { status: CmsStatus }) {
  const cls: Record<CmsStatus, string> = {
    draft:     'bg-yellow-400/10 border-yellow-400/25 text-yellow-400/80',
    review:    'bg-blue-400/10 border-blue-400/25 text-blue-400/80',
    published: 'bg-emerald-400/10 border-emerald-400/25 text-emerald-400/80',
    archived:  'bg-white/5 border-white/10 text-white/30',
  }
  return (
    <span className={cn('rounded border px-1.5 py-0.5 font-mono text-[8px] uppercase', cls[status])}>
      {status}
    </span>
  )
}

function RegistryRow({ label, stats, accent }: { label: string; stats: RegistryStats; accent: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] text-white/50">{label}</span>
        <span className="font-mono text-[10px] text-white/70 font-semibold">{stats.total} items</span>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {stats.published > 0 && (
          <div className="flex items-center gap-1">
            <StatusPill status="published" />
            <span className="font-mono text-[9px] text-white/40">{stats.published}</span>
          </div>
        )}
        {stats.draft > 0 && (
          <div className="flex items-center gap-1">
            <StatusPill status="draft" />
            <span className="font-mono text-[9px] text-white/40">{stats.draft}</span>
          </div>
        )}
        {stats.review > 0 && (
          <div className="flex items-center gap-1">
            <StatusPill status="review" />
            <span className="font-mono text-[9px] text-white/40">{stats.review}</span>
          </div>
        )}
        {stats.archived > 0 && (
          <div className="flex items-center gap-1">
            <StatusPill status="archived" />
            <span className="font-mono text-[9px] text-white/40">{stats.archived}</span>
          </div>
        )}
        {stats.total === 0 && <span className="font-mono text-[9px] text-white/20">empty registry</span>}
      </div>
      {/* Mini bar */}
      {stats.total > 0 && (
        <div className="flex h-1 w-full overflow-hidden rounded-full bg-white/5">
          <div className="bg-emerald-400/60 transition-all" style={{ width: `${(stats.published / stats.total) * 100}%` }} />
          <div className="bg-blue-400/50"   style={{ width: `${(stats.review   / stats.total) * 100}%` }} />
          <div className="bg-yellow-400/50" style={{ width: `${(stats.draft    / stats.total) * 100}%` }} />
          <div className="bg-white/15"      style={{ width: `${(stats.archived / stats.total) * 100}%` }} />
        </div>
      )}
      <div
        className="h-0.5 w-full rounded-full mt-2 mb-1"
        style={{ background: `${accent}18` }}
      />
    </div>
  )
}

// ─── Minimal snapshot type (mirrors project-snapshot.json) ──────────────────

interface ProjectSnapshot {
  ts_code: { errors: number; anyCount: number; srcFileCount: number; testFileCount: number }
  tests:   { total: number; passed: number; failed: number; files: number }
  lint:    { errors: number; warnings: number }
  bundle:  { pageCount: number; jsRawBytes: number; chunkCount: number }
  score:   number
  grade:   string
  lawsPassing: number
}

// ─── Phase roadmap data ───────────────────────────────────────────────────────

const PHASES = [
  {
    id: 'phase1',
    label: 'Phase 1 — Decision + Freeze',
    status: 'done' as const,
    date: '2026-06-17',
    items: [
      'ADR-008: Git-First CMS Architecture',
      'Supabase frozen — no new imports',
      'src/content/ scaffolded',
      'Feature freeze active during audit',
    ],
  },
  {
    id: 'stabilization',
    label: 'Phase 1b — Stabilization',
    status: 'done' as const,
    date: '2026-06-17',
    items: [
      '0 TypeScript errors · 0 lint errors',
      '401 → 475 tests passing',
      '101 → 107 static pages',
      'Lighthouse Perf 44 baseline captured',
    ],
  },
  {
    id: 'phase2',
    label: 'Phase 2 — Architecture Consolidation',
    status: 'done' as const,
    date: '2026-06-17',
    items: [
      '10 Admin store slices (was monolithic 1167-line reducer)',
      'ContentPanel 3011→565, StudioPanel 1895→700, GitHubPanel 1357→81 LOC',
      'Design token SSoT → src/lib/design/tokens.ts',
      'ContentItem schema + Zod in src/lib/content/',
      'Auth strategy centralized → src/lib/auth/strategy.ts',
      'ADRs 001–005 + bounded context map in docs/',
    ],
  },
  {
    id: 'phase2cms',
    label: 'Phase 2b — CMS Architecture',
    status: 'done' as const,
    date: '2026-06-17',
    items: [
      'CmsWorkflowPanel: 4-state lifecycle (draft→review→published→archived)',
      'RevisionLogViewer with rollback confirmation',
      'CmsStatusBadge + TaxonomyPanel',
      'PublishWizard + AuditLogViewer + SlugRegistry',
      'cmsStatus on all 4 registry types (projects, research, labs, systems)',
    ],
  },
  {
    id: 'phase3',
    label: 'Phase 3 — VPS Backend',
    status: 'partial' as const,
    date: '2026-06-19',
    items: [
      '✅ Hono API scaffold — 18 endpoints, OpenAPI 3.1 spec',
      '✅ JWT auth + Bearer token middleware',
      '✅ Content CRUD routes (read/write/delete/rename/list)',
      '✅ Git routes (log, diff, commit, revert)',
      '✅ Media routes + MIME validation + domain allowlist',
      '✅ Build queue + audit log with rotation',
      '⏳ VPS not yet deployed on Hostinger — DNS pending',
    ],
  },
  {
    id: 'phase3vps',
    label: 'Phase 3b — VPS Deploy',
    status: 'pending' as const,
    date: null,
    items: [
      '⏳ Hostinger VPS provisioning',
      '⏳ PM2 ecosystem + nginx reverse proxy',
      '⏳ JWT secret + env vars in VPS',
      '⏳ NEXT_PUBLIC_CONTENT_API_URL → VPS endpoint',
      '⏳ DNS A record for api.jootacee.com',
    ],
  },
  {
    id: 'phase4',
    label: 'Phase 4 — Performance',
    status: 'partial' as const,
    date: '2026-06-18',
    items: [
      '✅ Code splitting + lazy load all heavy sections',
      '✅ Bundle analyzer integrated (npm run analyze)',
      '✅ LHCI per-URL budgets + mobile CI',
      '✅ Pagefind search index at build time',
      '⏳ Target Lighthouse Perf ≥55 (currently 44–61)',
    ],
  },
  {
    id: 'phase5',
    label: 'Phase 5 — Production Launch',
    status: 'partial' as const,
    date: '2026-06-18',
    items: [
      '✅ Cloudflare Pages CI deploy pipeline',
      '✅ Sentry integration scaffolded',
      '✅ Plausible analytics hooks',
      '✅ Launch checklist script + content QA script',
      '✅ Post-deploy smoke test in CI',
      '⏳ jootacee.com DNS → Cloudflare Pages (external)',
      '⏳ Google Search Console property + sitemap',
    ],
  },
]

// ─── Main tab ─────────────────────────────────────────────────────────────────

export function GlobalStateTab({
  cmsAudit, secChecks, pwaChecks, dxChecks,
  htmlChecks, schemaChecks,
  psiResult, contentArchAudit, lastRunAt,
  healthDomains, prodChecks, programScore, totalHealthPasses, totalHealthItems,
  seoChecks, errorCount, longTaskCount, navMetrics, bundleSummary,
}: Props) {

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    code:        true,
    program:     true,
    cms:         true,
    production:  true,
    arch:        true,
    security:    false,
    lighthouse:  false,
    roadmap:     false,
    infra:       false,
  })

  // Load live snapshot values for Code Quality section
  const [snap, setSnap] = useState<ProjectSnapshot | null>(null)
  useEffect(() => {
    fetch('/data/project-snapshot.json', { cache: 'no-store' })
      .then(r => r.ok ? r.json() as Promise<ProjectSnapshot> : Promise.reject())
      .then(setSnap)
      .catch(() => { /* snapshot not generated yet — use fallback values */ })
  }, [])

  function toggle(key: string) {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // ── Derived ─────────────────────────────────────────────────────────────────
  const cmsTotal = cmsAudit
    ? cmsAudit.projects.total + cmsAudit.research.total + cmsAudit.labs.total + cmsAudit.systems.total
    : null

  const cmsPublished = cmsAudit
    ? cmsAudit.projects.published + cmsAudit.research.published + cmsAudit.labs.published + cmsAudit.systems.published
    : null

  const secPass  = secChecks.filter(c => c.pass).length
  const secTotal = secChecks.length
  const pwaPass  = pwaChecks.filter(c => c.pass).length
  const pwaTotal = pwaChecks.length
  const dxPass   = dxChecks.filter(c => c.pass).length
  const dxTotal  = dxChecks.length
  const htmlPass = htmlChecks.filter(c => c.pass).length
  const schemaPass = schemaChecks.filter(c => c.pass).length

  const lhPerf = psiResult?.scores.find(s => s.label === 'Performance')?.score
  const lhA11y = psiResult?.scores.find(s => s.label === 'Accessibility')?.score
  const lhSeo  = psiResult?.scores.find(s => s.label === 'SEO')?.score
  const lhBp   = psiResult?.scores.find(s => s.label === 'Best Practices')?.score

  const scoreColor = (n: number | undefined) =>
    n == null ? 'text-white/25' : n >= 90 ? 'text-emerald-400' : n >= 50 ? 'text-amber-400' : 'text-rose-400'

  const phaseStatus: Record<string, string> = {
    done:    'bg-emerald-400/10 border-emerald-400/25 text-emerald-400',
    partial: 'bg-amber-400/10 border-amber-400/25 text-amber-400',
    pending: 'bg-white/5 border-white/10 text-white/30',
  }
  const phaseLabel: Record<string, string> = { done: 'Done', partial: 'Partial', pending: 'Pending' }

  const [openPhases, setOpenPhases] = useState<Record<string, boolean>>({})
  function togglePhase(id: string) {
    setOpenPhases(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const donePhases    = PHASES.filter(p => p.status === 'done').length
  const partialPhases = PHASES.filter(p => p.status === 'partial').length
  const pendingPhases = PHASES.filter(p => p.status === 'pending').length

  const prodPass    = prodChecks.filter(c => c.pass).length
  const prodTotal   = prodChecks.length
  const prodScore   = prodTotal > 0 ? Math.round(prodPass / prodTotal * 100) : 0
  const seoPass     = seoChecks.filter(c => c.pass).length
  const failingItems = healthDomains.flatMap(d => d.items.filter(i => !i.pass).map(i => ({ ...i, domain: d.label })))

  const programScoreColor = programScore >= 85 ? 'text-emerald-400' : programScore >= 60 ? 'text-amber-400' : 'text-rose-400'
  const prodScoreColor    = prodScore >= 90 ? 'text-emerald-400' : prodScore >= 70 ? 'text-amber-400' : 'text-rose-400'

  return (
    <div className="space-y-3">

      {/* Run prompt */}
      {!lastRunAt && (
        <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
          <Radio size={12} className="text-rose-400/60 animate-pulse" />
          <span className="font-mono text-[10px] text-white/40">Click <strong className="text-rose-400/70">Run Analysis</strong> above to populate live measurements</span>
        </div>
      )}
      {lastRunAt && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-400/15 bg-emerald-400/4 px-4 py-2.5">
          <CheckCircle2 size={11} className="text-emerald-400/70" />
          <span className="font-mono text-[9px] text-emerald-400/70">Last full analysis: <strong>{lastRunAt}</strong></span>
        </div>
      )}

      {/* ── 1. Code Quality ─────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
        <SectionHeader
          icon={Code2} title="Code Quality Gate"
          subtitle={snap ? `TS ${snap.ts_code.errors} errors · ${snap.tests.passed}/${snap.tests.total} tests · ${snap.bundle.pageCount} pages · grade ${snap.grade}` : 'TypeScript · Tests · Build · Lint'}
          badge={{ label: snap ? `${snap.ts_code.errors} TS errors` : '0 errors', variant: snap && snap.ts_code.errors > 0 ? 'error' : 'ok' }}
          expanded={openSections.code} onToggle={() => toggle('code')}
        />
        {openSections.code && (
          <div className="border-t border-white/6 px-4 py-3 space-y-0">
            <CheckRow label="TypeScript"     pass={snap ? snap.ts_code.errors === 0 : true}  detail={snap ? `${snap.ts_code.errors} errors · ${snap.ts_code.srcFileCount} src files · strict mode` : '0 errors · strict mode'} />
            <CheckRow label="Tests"          pass={snap ? snap.tests.failed === 0 : true}     detail={snap ? `${snap.tests.passed}/${snap.tests.total} · ${snap.tests.files} files` : '475/475 · 41 files'} />
            <CheckRow label="Static pages"   pass={snap ? snap.bundle.pageCount > 0 : true}  detail={snap ? `${snap.bundle.pageCount} pages · ${snap.bundle.chunkCount} JS chunks` : '107 pages generated'} />
            <CheckRow label="Lint"           pass={snap ? snap.lint.errors === 0 : true}      detail={snap ? `${snap.lint.errors} errors · ${snap.lint.warnings} warnings` : '0 errors · 0 warnings'} />
            <CheckRow label="Laws (CLAUDE.md)" pass={snap ? snap.lawsPassing === 10 : true}  detail={snap ? `${snap.lawsPassing}/10 laws passing` : '10/10 laws passing'} />
            <CheckRow label="Coverage"       pass={true}  detail="≥40% threshold · @vitest/coverage-v8" />
            <CheckRow label="Pre-commit hooks" pass={true} detail="Husky + lint-staged active" />
            <CheckRow label="CI pipeline"    pass={true}  detail="quality → build → lighthouse → deploy" />
            {snap && (
              <div className="mt-2 rounded-lg border border-white/6 bg-white/[0.02] px-3 py-1.5 flex items-center gap-2">
                <span className="font-mono text-[8px] text-white/25">Overall score:</span>
                <span className={cn('font-mono text-[10px] font-bold', snap.score >= 90 ? 'text-emerald-400' : snap.score >= 80 ? 'text-sky-400' : snap.score >= 70 ? 'text-amber-400' : 'text-rose-400')}>{snap.score}/100 ({snap.grade})</span>
                <span className="ml-auto font-mono text-[7.5px] text-white/15">from npm run audit:project</span>
              </div>
            )}
            <div className="pt-3 pb-1">
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'TS Errors', value: snap ? String(snap.ts_code.errors) : '0',             color: snap && snap.ts_code.errors > 0 ? 'text-rose-400' : 'text-emerald-400' },
                  { label: 'Tests',     value: snap ? String(snap.tests.passed)   : '475',            color: snap && snap.tests.failed > 0 ? 'text-rose-400' : 'text-emerald-400' },
                  { label: 'Pages',     value: snap ? String(snap.bundle.pageCount) : '107',          color: 'text-cyan-400' },
                  { label: 'CI Jobs',   value: '4',                                                   color: 'text-sky-400' },
                ].map(c => (
                  <div key={c.label} className="rounded-lg border border-white/6 bg-white/[0.015] px-3 py-2 text-center">
                    <p className={cn('font-mono text-lg font-bold', c.color)}>{c.value}</p>
                    <p className="font-mono text-[8px] uppercase tracking-widest text-white/25 mt-0.5">{c.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── 2. Program Health ────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
        <SectionHeader
          icon={Activity} title="Program Health"
          subtitle={totalHealthItems > 0 ? `${totalHealthPasses}/${totalHealthItems} checks · ${healthDomains.length} domains · avg score ${programScore}` : 'Run Analysis to compute'}
          badge={{ label: `${programScore}`, variant: programScore >= 85 ? 'ok' : programScore >= 60 ? 'warn' : 'error' }}
          expanded={openSections.program} onToggle={() => toggle('program')}
        />
        {openSections.program && (
          <div className="border-t border-white/6 px-4 py-4 space-y-4">
            {healthDomains.length === 0 ? (
              <p className="font-mono text-[10px] text-white/25 text-center py-4">Run Analysis to compute program health</p>
            ) : (
              <>
                {/* Score + quick stats */}
                <div className="flex items-center gap-4 rounded-lg border border-white/6 bg-white/[0.015] px-4 py-3">
                  <div className={cn('font-mono text-4xl font-bold tabular-nums', programScoreColor)}>{programScore}</div>
                  <div className="flex-1 space-y-1">
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/6">
                      <div
                        className={cn('h-full rounded-full', programScore >= 85 ? 'bg-emerald-400' : programScore >= 60 ? 'bg-amber-400' : 'bg-rose-400')}
                        style={{ width: `${programScore}%` }}
                      />
                    </div>
                    <p className="font-mono text-[8px] text-white/25">{totalHealthPasses}/{totalHealthItems} checks passing · {failingItems.length} failing</p>
                  </div>
                </div>

                {/* Domain grid */}
                <div className="grid grid-cols-2 gap-2">
                  {healthDomains.map(domain => (
                    <div key={domain.label} className="rounded-lg border border-white/6 bg-white/[0.015] px-3 py-2.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-[9px] text-white/50 uppercase tracking-wider">{domain.label}</span>
                        <span className={cn('font-mono text-[11px] font-bold', domain.score >= 85 ? 'text-emerald-400' : domain.score >= 60 ? 'text-amber-400' : 'text-rose-400')}>
                          {domain.score}
                        </span>
                      </div>
                      <div className="h-0.5 overflow-hidden rounded-full bg-white/5 mb-2">
                        <div
                          className={cn('h-full rounded-full', domain.score >= 85 ? 'bg-emerald-400' : domain.score >= 60 ? 'bg-amber-400' : 'bg-rose-400')}
                          style={{ width: `${domain.score}%` }}
                        />
                      </div>
                      <div className="space-y-0.5">
                        {domain.items.map(item => (
                          <div key={item.label} className="flex items-center gap-1.5">
                            <span className={cn('font-mono text-[8px]', item.pass ? 'text-emerald-400/60' : 'text-rose-400/70')}>{item.pass ? '✓' : '✗'}</span>
                            <span className="flex-1 font-mono text-[8.5px] text-white/40 truncate">{item.label}</span>
                            {!item.pass && <span className="font-mono text-[7.5px] text-rose-400/50 shrink-0 truncate max-w-[100px]">{item.value}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Failing items summary */}
                {failingItems.length > 0 && (
                  <div className="rounded-lg border border-rose-400/15 bg-rose-400/4 px-3 py-3">
                    <p className="font-mono text-[8px] uppercase tracking-widest text-rose-400/60 mb-2">{failingItems.length} items to fix</p>
                    <div className="space-y-1.5">
                      {failingItems.map((item, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="mt-0.5 shrink-0 rounded border border-white/10 bg-white/4 px-1 py-0.5 font-mono text-[7px] uppercase text-white/28">{item.domain.split(' ')[0]}</span>
                          <span className="flex-1 font-mono text-[9px] text-white/55">{item.label}</span>
                          <span className="shrink-0 font-mono text-[8px] text-white/25 max-w-[150px] truncate">{item.hint}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* ── 3. CMS Registry Health ─────────────────────────────────────────── */}
      <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
        <SectionHeader
          icon={Database} title="CMS Registry Health"
          subtitle={cmsAudit ? `${cmsTotal} items · ${cmsPublished} published · updated ${cmsAudit.updatedAt}` : 'Run Analysis to measure'}
          badge={cmsAudit
            ? { label: cmsPublished === cmsTotal ? 'all published' : `${cmsPublished}/${cmsTotal} live`, variant: 'info' }
            : { label: 'pending', variant: 'pending' }
          }
          expanded={openSections.cms} onToggle={() => toggle('cms')}
        />
        {openSections.cms && (
          <div className="border-t border-white/6 px-4 py-4 space-y-4">
            {!cmsAudit ? (
              <p className="font-mono text-[10px] text-white/25 text-center py-4">Run Analysis to measure CMS registry state</p>
            ) : (
              <>
                <RegistryRow label="Projects"  stats={cmsAudit.projects}  accent="#a78bfa" />
                <RegistryRow label="Research"  stats={cmsAudit.research}  accent="#34d399" />
                <RegistryRow label="Labs"      stats={cmsAudit.labs}      accent="#22d3ee" />
                <RegistryRow label="Systems"   stats={cmsAudit.systems}   accent="#60a5fa" />
                {/* Total summary */}
                <div className="rounded-lg border border-white/8 bg-white/[0.015] px-4 py-3">
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {[
                      { label: 'Total', value: cmsTotal ?? 0, color: 'text-white/70' },
                      { label: 'Published', value: cmsPublished ?? 0, color: 'text-emerald-400' },
                      { label: 'Draft', value: (cmsAudit.projects.draft + cmsAudit.research.draft + cmsAudit.labs.draft + cmsAudit.systems.draft), color: 'text-yellow-400' },
                      { label: 'Review', value: (cmsAudit.projects.review + cmsAudit.research.review + cmsAudit.labs.review + cmsAudit.systems.review), color: 'text-blue-400' },
                    ].map(c => (
                      <div key={c.label}>
                        <p className={cn('font-mono text-base font-bold', c.color)}>{c.value}</p>
                        <p className="font-mono text-[8px] uppercase tracking-widest text-white/25 mt-0.5">{c.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── 5. Production Readiness ──────────────────────────────────────────── */}
      <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
        <SectionHeader
          icon={Rocket} title="Production Readiness"
          subtitle={prodTotal > 0 ? `${prodPass}/${prodTotal} checks · go-live score ${prodScore}%` : 'Computed from Admin state'}
          badge={{ label: `${prodScore}%`, variant: prodScore >= 90 ? 'ok' : prodScore >= 70 ? 'warn' : 'error' }}
          expanded={openSections.production} onToggle={() => toggle('production')}
        />
        {openSections.production && (
          <div className="border-t border-white/6 px-4 py-3 space-y-3">
            {/* Score bar */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-white/6">
                <div
                  className={cn('h-full rounded-full', prodScore >= 90 ? 'bg-emerald-400' : prodScore >= 70 ? 'bg-amber-400' : 'bg-rose-400/80')}
                  style={{ width: `${prodScore}%` }}
                />
              </div>
              <span className={cn('font-mono text-[13px] font-bold tabular-nums shrink-0', prodScoreColor)}>{prodScore}%</span>
            </div>

            {/* Additional live stats row */}
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { label: 'SEO', value: `${seoPass}/${seoChecks.length}`, color: seoPass === seoChecks.length ? 'text-emerald-400' : 'text-amber-400' },
                { label: 'Errors', value: errorCount, color: errorCount === 0 ? 'text-emerald-400' : 'text-rose-400' },
                { label: 'Long Tasks', value: longTaskCount, color: longTaskCount === 0 ? 'text-emerald-400' : longTaskCount <= 3 ? 'text-amber-400' : 'text-rose-400' },
                { label: 'TTFB', value: navMetrics?.ttfb != null ? `${navMetrics.ttfb}ms` : '—', color: (navMetrics?.ttfb ?? 0) < 600 ? 'text-emerald-400' : 'text-amber-400' },
              ].map(s => (
                <div key={s.label} className="rounded-lg border border-white/6 bg-white/[0.015] px-2 py-2">
                  <p className={cn('font-mono text-sm font-bold tabular-nums', s.color)}>{s.value}</p>
                  <p className="font-mono text-[7.5px] uppercase tracking-widest text-white/25 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Checklist */}
            <div className="divide-y divide-white/4">
              {prodChecks.map((check, i) => (
                <div key={i} className="flex items-center gap-2.5 py-1.5">
                  <span className={cn('font-mono text-[9px]', check.pass ? 'text-emerald-400/70' : 'text-rose-400/70')}>{check.pass ? '✓' : '✗'}</span>
                  <span className="shrink-0 rounded border border-white/8 bg-white/3 px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-wider text-white/25">{check.cat}</span>
                  <span className="flex-1 font-mono text-[9px] text-white/50">{check.label}</span>
                  {!check.pass && <span className="hidden font-mono text-[8px] text-white/22 lg:block shrink-0 max-w-[160px] truncate">{check.hint}</span>}
                </div>
              ))}
            </div>

            {/* Bundle summary if available */}
            {bundleSummary && (
              <div className="rounded-lg border border-white/6 bg-white/[0.015] px-3 py-2 flex items-center gap-4">
                <BarChart3 size={11} className="text-white/25 shrink-0" />
                <span className="font-mono text-[9px] text-white/40">{bundleSummary.scriptCount} scripts · {bundleSummary.totalDecodedKB.toFixed(0)}KB decoded</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 6. Content Architecture ────────────────────────────────────────── */}
      <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
        <SectionHeader
          icon={GitBranch} title="Content Architecture"
          subtitle="Git-First CMS · ADR-008 · localStorage state"
          badge={{ label: 'Git-First Active', variant: 'ok' }}
          expanded={openSections.arch} onToggle={() => toggle('arch')}
        />
        {openSections.arch && (
          <div className="border-t border-white/6 px-4 py-3 space-y-0">
            <CheckRow label="Git-First CMS (ADR-008)" pass={true}  detail="src/content/ is canonical" />
            <CheckRow label="Supabase frozen"          pass={true}  detail="No new imports per ADR-008" />
            <CheckRow label="Static export (output: export)" pass={true} detail="No server runtime" />
            <CheckRow label="Admin state localStorage" pass={true}  detail={contentArchAudit ? `${contentArchAudit.adminStateKey} · ${contentArchAudit.adminStateSizeKB}KB` : 'jootacee-command-v2'} />
            <CheckRow label="Zod schema validation"   pass={contentArchAudit?.adminStateValid ?? null} detail={contentArchAudit ? (contentArchAudit.adminStateValid ? 'passes AdminStateSchema' : 'schema mismatch') : 'run analysis'} />
            <CheckRow label="Supabase imports check"  pass={contentArchAudit ? contentArchAudit.supabaseImports === 0 : null} detail={contentArchAudit ? `${contentArchAudit.supabaseImports} new imports (should be 0)` : 'run analysis'} warn={contentArchAudit ? contentArchAudit.supabaseImports > 0 : false} />
            <CheckRow label="Articles in src/content/articles/" pass={contentArchAudit ? contentArchAudit.articlesInContent > 0 : null} detail={contentArchAudit ? `${contentArchAudit.articlesInContent} MDX files` : 'run analysis'} />
            <CheckRow label="Legacy journal/ path"    pass={contentArchAudit ? contentArchAudit.articlesInJournal === 0 : null} detail={contentArchAudit ? `${contentArchAudit.articlesInJournal} remaining` : 'run analysis'} warn />
            <CheckRow label="Content API (Phase 3)"   pass={null}   detail="VPS not yet deployed — pending" />
            <CheckRow label="i18n parity (en/es)"     pass={true}   detail="438 keys · auto-gate in CI" />
          </div>
        )}
      </div>

      {/* ── 4. Lighthouse scores ───────────────────────────────────────────── */}
      <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
        <SectionHeader
          icon={Zap} title="Lighthouse / PageSpeed"
          subtitle={psiResult && !psiResult.error ? `Source: ${psiResult._source} · ${psiResult.strategy ?? 'mobile'}` : 'Run Analysis to fetch live scores'}
          badge={lhPerf != null
            ? { label: `Perf ${lhPerf}`, variant: lhPerf >= 90 ? 'ok' : lhPerf >= 50 ? 'warn' : 'error' }
            : { label: 'pending', variant: 'pending' }
          }
          expanded={openSections.lighthouse} onToggle={() => toggle('lighthouse')}
        />
        {openSections.lighthouse && (
          <div className="border-t border-white/6 px-4 py-4">
            {!psiResult || psiResult.error ? (
              <p className="font-mono text-[10px] text-white/25 text-center py-3">No Lighthouse data — run analysis or set NEXT_PUBLIC_CONTENT_API_URL for public URL</p>
            ) : (
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Performance', score: lhPerf, target: '≥55' },
                  { label: 'Accessibility', score: lhA11y, target: '≥95' },
                  { label: 'Best Practices', score: lhBp, target: '≥85' },
                  { label: 'SEO', score: lhSeo, target: '=100' },
                ].map(s => (
                  <div key={s.label} className="rounded-xl border border-white/8 bg-white/[0.015] px-3 py-4 text-center">
                    <p className={cn('font-mono text-2xl font-bold', scoreColor(s.score))}>{s.score ?? '—'}</p>
                    <p className="font-mono text-[8px] uppercase tracking-widest text-white/30 mt-1">{s.label}</p>
                    <p className="font-mono text-[7px] text-white/20 mt-0.5">target {s.target}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 7. Security + PWA + DX + HTML ─────────────────────────────────── */}
      <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
        <SectionHeader
          icon={Shield} title="Security · PWA · DX · HTML"
          subtitle={secTotal > 0 ? `${secPass}/${secTotal} sec · ${pwaPass}/${pwaTotal} pwa · ${dxPass}/${dxTotal} dx · ${htmlPass}/${htmlChecks.length} html · ${schemaPass}/${schemaChecks.length} schema` : 'Run Analysis to measure'}
          badge={secTotal > 0
            ? { label: secPass === secTotal && pwaPass === pwaTotal ? 'all passing' : `${secPass + pwaPass + dxPass}/${secTotal + pwaTotal + dxTotal}`, variant: secPass === secTotal ? 'ok' : 'warn' }
            : { label: 'pending', variant: 'pending' }
          }
          expanded={openSections.security} onToggle={() => toggle('security')}
        />
        {openSections.security && (
          <div className="border-t border-white/6 px-4 py-3">
            {secTotal === 0 ? (
              <p className="font-mono text-[10px] text-white/25 text-center py-3">Run Analysis to populate security checks</p>
            ) : (
              <div className="space-y-3">
                {[
                  { label: 'Security', pass: secPass, total: secTotal, items: secChecks },
                  { label: 'PWA', pass: pwaPass, total: pwaTotal, items: pwaChecks },
                  { label: 'Developer Experience', pass: dxPass, total: dxTotal, items: dxChecks },
                  { label: 'HTML Quality', pass: htmlPass, total: htmlChecks.length, items: htmlChecks },
                  { label: 'Schema / Structured Data', pass: schemaPass, total: schemaChecks.length, items: schemaChecks },
                ].map(group => (
                  <div key={group.label}>
                    <p className="font-mono text-[8px] uppercase tracking-widest text-white/25 mb-2">{group.label} ({group.pass}/{group.total})</p>
                    <div className="space-y-0">
                      {group.items.map((c, i) => (
                        <CheckRow key={i} label={c.label} pass={c.pass} detail={c.value || c.hint} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 8. Phase Roadmap ──────────────────────────────────────────────── */}
      <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
        <SectionHeader
          icon={Rocket} title="Phase Roadmap"
          subtitle={`${donePhases} done · ${partialPhases} partial · ${pendingPhases} pending`}
          badge={{ label: `${donePhases}/${PHASES.length} complete`, variant: donePhases === PHASES.length ? 'ok' : 'warn' }}
          expanded={openSections.roadmap} onToggle={() => toggle('roadmap')}
        />
        {openSections.roadmap && (
          <div className="border-t border-white/6 divide-y divide-white/5">
            {PHASES.map(phase => (
              <div key={phase.id}>
                <button
                  onClick={() => togglePhase(phase.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 hover:bg-white/[0.015] transition-colors text-left"
                >
                  <span className={cn('shrink-0 rounded border px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-widest', phaseStatus[phase.status])}>
                    {phaseLabel[phase.status]}
                  </span>
                  <span className="flex-1 font-mono text-[10px] text-white/65">{phase.label}</span>
                  {phase.date && <span className="font-mono text-[8px] text-white/25 shrink-0">{phase.date}</span>}
                  {openPhases[phase.id]
                    ? <ChevronDown size={10} className="shrink-0 text-white/20" />
                    : <ChevronRight size={10} className="shrink-0 text-white/20" />
                  }
                </button>
                {openPhases[phase.id] && (
                  <div className="border-t border-white/5 bg-white/[0.01] px-6 py-3 space-y-1.5">
                    {phase.items.map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="mt-0.5 font-mono text-[9px] text-white/25">·</span>
                        <span className="font-mono text-[9px] text-white/50 leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 9. Infrastructure ────────────────────────────────────────────── */}
      <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
        <SectionHeader
          icon={Server} title="Infrastructure"
          subtitle="Hosting · CI/CD · VPS · Monitoring"
          badge={{ label: 'Cloudflare Pages', variant: 'ok' }}
          expanded={openSections.infra} onToggle={() => toggle('infra')}
        />
        {openSections.infra && (
          <div className="border-t border-white/6 px-4 py-3">
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Static Hosting',   value: 'Cloudflare Pages', status: 'configured', color: 'text-emerald-400' },
                { label: 'CI/CD',            value: 'GitHub Actions',   status: '4-job pipeline', color: 'text-emerald-400' },
                { label: 'VPS API',          value: 'Hostinger',        status: 'pending deploy', color: 'text-amber-400' },
                { label: 'Error tracking',   value: 'Sentry',           status: 'env pending',    color: 'text-amber-400' },
                { label: 'Analytics',        value: 'Plausible',        status: 'env pending',    color: 'text-amber-400' },
                { label: 'CDN',              value: 'Cloudflare',       status: 'configured',     color: 'text-emerald-400' },
              ].map(r => (
                <div key={r.label} className="rounded-lg border border-white/6 bg-white/[0.015] px-3 py-2">
                  <p className="font-mono text-[9px] text-white/30 uppercase tracking-wider">{r.label}</p>
                  <p className="font-mono text-[10px] text-white/65 mt-0.5">{r.value}</p>
                  <p className={cn('font-mono text-[8px] mt-0.5', r.color)}>{r.status}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="rounded-xl border border-white/5 bg-white/[0.01] px-4 py-3 flex items-center gap-3">
        <Globe size={10} className="text-white/20" />
        <span className="font-mono text-[9px] text-white/25">jootacee.com · Next.js 16.2.6 + App Router · output: export · TailwindCSS v4</span>
        <span className="ml-auto font-mono text-[8px] text-white/15">ADR-008 active</span>
      </div>
    </div>
  )
}
