'use client'

import React, { useState } from 'react'
import {
  AlertCircle, ChevronDown, ChevronRight, CheckCircle2, CircleDashed,
  Zap, Package, Box, Smartphone, Image, Type, BarChart3, Gauge,
  GitPullRequest, Layers, BookOpen, Paintbrush, Radio, ListTodo,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  PHASE4_GOALS, PHASE4_BASELINE, PHASE4_TARGETS,
  phase4CheckCount, phase4GoalsDone, phase4GoalsInProgress,
  IMPACT_COLOR, LAYER_BADGE_COLOR,
} from '@/lib/analytics/perf-metrics'
import type { PerfGoal } from '@/lib/analytics/perf-metrics'

// ─── Icon map ─────────────────────────────────────────────────────────────────

const GOAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'bundle-analyzer':    Package,
  'admin-chunks':       Box,
  'hero-3d':            Zap,
  'mobile-effects':     Smartphone,
  'prerender-content':  Layers,
  'reduce-ssr-false':   Layers,
  'self-host-fonts':    Type,
  'optimize-images':    Image,
  'measure-inp':        Gauge,
  'ci-budgets':         GitPullRequest,
  'reader-mode':        BarChart3,
  'css-paint':          BarChart3,
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: PerfGoal['status'] }) {
  const cfg = {
    planned:      { label: 'Planned',     cls: 'border-white/12 bg-white/4 text-white/35' },
    'in-progress': { label: 'In Progress', cls: 'border-sky-400/25 bg-sky-400/8 text-sky-400/75' },
    done:          { label: 'Done',        cls: 'border-emerald-400/25 bg-emerald-400/8 text-emerald-400/70' },
    blocked:       { label: 'Blocked',     cls: 'border-rose-400/25 bg-rose-400/8 text-rose-400/70' },
  }[status]
  return (
    <span className={cn('rounded-full border px-2 py-0.5 font-mono text-[7px] uppercase tracking-wider', cfg.cls)}>
      {cfg.label}
    </span>
  )
}

// ─── Check row ────────────────────────────────────────────────────────────────

function CheckRow({ label, hint, pass }: { label: string; hint: string; pass: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-start gap-2 rounded px-1 py-1.5 text-left transition-colors hover:bg-white/[0.025]"
      >
        {pass
          ? <CheckCircle2 className="mt-px h-3 w-3 shrink-0 text-emerald-400/65" />
          : <CircleDashed  className="mt-px h-3 w-3 shrink-0 text-sky-400/40" />
        }
        <span className="flex-1 font-mono text-[9px] leading-relaxed text-white/55">{label}</span>
        {open
          ? <ChevronDown  className="mt-px h-3 w-3 shrink-0 text-white/20" />
          : <ChevronRight className="mt-px h-3 w-3 shrink-0 text-white/15" />
        }
      </button>
      {open && (
        <p className="mb-1.5 ml-5 rounded bg-white/[0.03] px-2 py-1.5 font-mono text-[8.5px] leading-relaxed text-white/38">
          {hint}
        </p>
      )}
    </div>
  )
}

// ─── Goal card ────────────────────────────────────────────────────────────────

function GoalCard({ goal }: { goal: PerfGoal }) {
  const [expanded, setExpanded] = useState(false)
  const Icon       = GOAL_ICONS[goal.id] ?? Zap
  const doneChecks = goal.checks.filter(c => c.pass).length
  const total      = goal.checks.length
  const progress   = Math.round(doneChecks / total * 100)

  const impactColor = IMPACT_COLOR[goal.impact]
  const borderColor = goal.status === 'done'
    ? 'border-emerald-400/12'
    : goal.status === 'in-progress'
      ? 'border-sky-400/10'
      : 'border-white/6'
  const barColor = goal.status === 'done' ? '#34d39966' : goal.status === 'in-progress' ? '#38bdf866' : '#ffffff18'

  return (
    <div className={cn('flex flex-col overflow-hidden rounded-xl border bg-white/[0.02]', borderColor)}>
      {/* Header */}
      <div className="flex items-start gap-3 px-4 pb-3 pt-4">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/8"
          style={{ background: `${impactColor}08` }}
        >
          <span style={{ color: `${impactColor}88` }} className="flex items-center justify-center">
            <Icon className="h-4 w-4" />
          </span>
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-white/75">
              {goal.title}
            </span>
            <StatusBadge status={goal.status} />
            <span
              className="rounded border border-white/8 px-1.5 py-0.5 font-mono text-[7px] uppercase"
              style={{ color: impactColor, opacity: 0.8 }}
            >
              {goal.impact} impact
            </span>
          </div>
          <p className="font-mono text-[8px] text-white/28">{goal.subtitle}</p>

          {/* Progress bar */}
          <div className="h-0.5 w-full overflow-hidden rounded-full bg-white/5">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: barColor }} />
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 pl-1 shrink-0">
          <span className="font-mono text-[18px] font-bold tabular-nums leading-none text-white/20">{doneChecks}/{total}</span>
          <span className="font-mono text-[7px] text-white/18">checks</span>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.05] px-4 py-2">
        {goal.layers.map(layer => (
          <span key={layer} className="font-mono text-[7px]" style={{ color: LAYER_BADGE_COLOR[layer] }}>
            {layer}
          </span>
        ))}
        {goal.baseline && (
          <span className="font-mono text-[7px] text-white/20">was: {goal.baseline.slice(0, 30)}</span>
        )}
        {goal.estimatedGain && (
          <span className="ml-auto rounded border border-emerald-400/12 bg-emerald-400/4 px-1.5 py-0.5 font-mono text-[7px] text-emerald-400/50">
            {goal.estimatedGain}
          </span>
        )}
      </div>

      {/* Objective */}
      <div className="px-4 pb-3">
        <p className="font-mono text-[8px] leading-relaxed text-white/32">{goal.objective}</p>
      </div>

      {/* Checks toggle */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="flex w-full items-center gap-2 border-t border-white/[0.04] px-4 py-2 text-left transition-colors hover:bg-white/[0.02]"
      >
        {expanded
          ? <ChevronDown  className="h-3 w-3 text-white/20" />
          : <ChevronRight className="h-3 w-3 text-white/15" />
        }
        <span className="font-mono text-[8px] text-white/25">
          {expanded ? 'Hide' : 'Show'} definition of done ({total} checks)
        </span>
      </button>

      {expanded && (
        <div className="divide-y divide-white/[0.03] px-3 pb-3">
          {goal.checks.map(c => (
            <CheckRow key={c.label} label={c.label} hint={c.hint} pass={c.pass} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Baseline vs Target table ─────────────────────────────────────────────────

function BaselineTable() {
  const rows = [
    { metric: 'Lighthouse Performance',  baseline: String(PHASE4_BASELINE.lighthousePerformance), target: `≥ ${PHASE4_TARGETS.lighthousePerformanceDesktop} desktop`, good: false },
    { metric: 'Lighthouse Accessibility', baseline: String(PHASE4_BASELINE.lighthouseAccessibility), target: '≥ 96 (maintain)', good: true },
    { metric: 'Lighthouse SEO',          baseline: String(PHASE4_BASELINE.lighthouseSEO), target: '= 100 (maintain)', good: true },
    { metric: 'Total Blocking Time',     baseline: '~900 ms',                           target: `< ${PHASE4_TARGETS.tbtMs} ms`, good: false },
    { metric: 'Largest Contentful Paint',baseline: 'unknown',                            target: `< ${PHASE4_TARGETS.lcpMs} ms`, good: false },
    { metric: 'INP',                     baseline: 'not collected',                      target: `< ${PHASE4_TARGETS.inpMs} ms`, good: false },
    { metric: 'JS (gzip)',               baseline: `${PHASE4_BASELINE.jsGzipMB} MB`,    target: `< ${PHASE4_TARGETS.jsGzipMBTarget} MB`, good: false },
    { metric: 'Largest chunk (gzip)',    baseline: `${PHASE4_BASELINE.largestChunkGzipKB} KB`, target: `< ${PHASE4_TARGETS.largestChunkGzipKBTarget} KB`, good: false },
  ]
  return (
    <div className="overflow-hidden rounded-xl border border-white/8 bg-white/[0.015]">
      <div className="flex items-center gap-2 border-b border-white/6 px-4 py-2.5">
        <BarChart3 className="h-3 w-3 text-sky-400/50" />
        <span className="flex-1 font-mono text-[9px] uppercase tracking-[0.18em] text-white/35">
          Baseline vs Target — captured {PHASE4_BASELINE.capturedAt}
        </span>
      </div>
      <div className="divide-y divide-white/[0.04]">
        {rows.map(r => (
          <div key={r.metric} className="grid grid-cols-3 items-center gap-3 px-4 py-2">
            <span className="font-mono text-[9px] text-white/50">{r.metric}</span>
            <span className={cn('font-mono text-[9px] tabular-nums', r.good ? 'text-emerald-400/60' : 'text-rose-400/50')}>
              {r.baseline}
            </span>
            <span className="font-mono text-[9px] text-sky-400/55">{r.target}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Execution order ─────────────────────────────────────────────────────────

function ExecutionOrder() {
  const chains = [
    { label: 'Diagnostic first', ids: ['bundle-analyzer', 'admin-chunks'],                       color: '#38bdf8' },
    { label: 'TBT / 3D',        ids: ['hero-3d', 'mobile-effects', 'reduce-ssr-false'],          color: '#f59e0b' },
    { label: 'FCP / network',   ids: ['prerender-content', 'self-host-fonts', 'optimize-images'], color: '#a78bfa' },
    { label: 'Measurement',     ids: ['measure-inp', 'css-paint', 'ci-budgets'],                 color: '#34d399' },
    { label: 'Accessibility',   ids: ['reader-mode'],                                             color: '#f472b6' },
  ]
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4 space-y-3">
      <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/35">Execution Order</div>
      {chains.map(chain => (
        <div key={chain.label} className="flex flex-wrap items-center gap-2">
          <span className="w-28 shrink-0 font-mono text-[8px] text-white/30">{chain.label}</span>
          {chain.ids.map((id, i) => {
            const goal = PHASE4_GOALS.find(g => g.id === id)
            if (!goal) return null
            return (
              <React.Fragment key={id}>
                {i > 0 && <ChevronRight className="h-3 w-3 text-white/15" />}
                <span
                  className="rounded border border-white/8 bg-white/[0.03] px-2 py-0.5 font-mono text-[7.5px]"
                  style={{ color: chain.color, opacity: 0.75 }}
                >
                  {goal.title}
                </span>
              </React.Fragment>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// ─── Main tab ─────────────────────────────────────────────────────────────────

export function Phase4Tab() {
  const { total, done }   = phase4CheckCount()
  const goalsDone         = phase4GoalsDone()
  const goalsInProgress   = phase4GoalsInProgress()

  const criticalGoals   = PHASE4_GOALS.filter(g => g.impact === 'critical')
  const highGoals       = PHASE4_GOALS.filter(g => g.impact === 'high')
  const mediumLowGoals  = PHASE4_GOALS.filter(g => g.impact !== 'critical' && g.impact !== 'high')

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-3.5 w-3.5 text-sky-400/60" />
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/28">
              Phase 4 — Performance Optimization
            </span>
          </div>
          <p className="font-mono text-[8px] text-white/20">
            {PHASE4_GOALS.length} goals · {total} checks · {done}/{total} done · {goalsInProgress} in progress
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-mono text-[36px] font-bold tabular-nums leading-none text-sky-400/40">
            {goalsDone}/{PHASE4_GOALS.length}
          </span>
          <span className="font-mono text-[7.5px] text-white/22">goals complete</span>
        </div>
      </div>

      {/* Constraint banner */}
      <div className="flex items-start gap-3 rounded-xl border border-sky-400/15 bg-sky-400/5 px-4 py-3">
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-400/60" />
        <div>
          <p className="font-mono text-[9px] font-semibold text-sky-400/70 mb-0.5">
            Target: Performance ≥ 75 desktop · TBT &lt; 300 ms · LCP &lt; 2.5 s · INP &lt; 200 ms
          </p>
          <p className="font-mono text-[8px] text-sky-400/45 leading-relaxed">
            Baseline: Perf 44 · JS 7.6 MB raw / 2.1 MB gzip · 106 chunks · Largest chunk 91 KB gzip.
            output: &apos;export&apos; is permanent — no Server Components or ISR available.
          </p>
        </div>
      </div>

      {/* Summary chips */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Goals Done',     value: `${goalsDone}/${PHASE4_GOALS.length}`, accent: '#34d399' },
          { label: 'In Progress',    value: String(goalsInProgress),                accent: '#38bdf8' },
          { label: 'Checks Done',    value: `${done}/${total}`,                     accent: '#38bdf8' },
          { label: 'Perf Baseline',  value: `${PHASE4_BASELINE.lighthousePerformance}→${PHASE4_TARGETS.lighthousePerformanceDesktop}`, accent: '#f59e0b' },
        ].map(({ label, value, accent }) => (
          <div key={label} className="flex flex-col items-center rounded-xl border border-white/8 bg-white/[0.025] px-3 py-2.5">
            <span className="font-mono text-[18px] font-bold tabular-nums" style={{ color: accent }}>{value}</span>
            <span className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.12em] text-white/28">{label}</span>
          </div>
        ))}
      </div>

      {/* Baseline vs Target */}
      <BaselineTable />

      {/* Execution order */}
      <ExecutionOrder />

      {/* Critical impact */}
      {criticalGoals.length > 0 && (
        <div>
          <div className="mb-2.5 flex items-center gap-2">
            <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-rose-400/50">
              Critical Impact — TBT Reduction
            </span>
            <div className="h-px flex-1 bg-rose-400/10" />
          </div>
          <div className="space-y-3">
            {criticalGoals.map(g => <GoalCard key={g.id} goal={g} />)}
          </div>
        </div>
      )}

      {/* High impact */}
      {highGoals.length > 0 && (
        <div>
          <div className="mb-2.5 flex items-center gap-2">
            <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-amber-400/45">
              High Impact
            </span>
            <div className="h-px flex-1 bg-amber-400/10" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {highGoals.map(g => <GoalCard key={g.id} goal={g} />)}
          </div>
        </div>
      )}

      {/* Medium + Low impact */}
      {mediumLowGoals.length > 0 && (
        <div>
          <div className="mb-2.5 flex items-center gap-2">
            <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/22">
              Medium Impact
            </span>
            <div className="h-px flex-1 bg-white/5" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {mediumLowGoals.map(g => <GoalCard key={g.id} goal={g} />)}
          </div>
        </div>
      )}

      {/* 12-item scope coverage map */}
      <div>
        <div className="mb-2.5 flex items-center gap-2">
          <ListTodo className="h-3 w-3 text-white/30" />
          <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/30">
            Phase 4 — 12 Scope Items → Goal Coverage
          </span>
          <div className="h-px flex-1 bg-white/[0.04]" />
        </div>
        <div className="grid grid-cols-1 gap-1 md:grid-cols-2">
          {[
            { item: 'Budget por ruta',                   goal: 'budgets.json + lighthouserc.json',  done: true,  icon: Package    },
            { item: 'Mobile performance como error',     goal: 'ci-budgets (error ≥ 0.50)',         done: true,  icon: Smartphone },
            { item: 'Reducir public initial JS',         goal: 'admin-chunks + bundle-analyzer',    done: true,  icon: Box        },
            { item: 'Auditar Three/R3F',                 goal: 'hero-3d',                         done: true,  icon: Zap        },
            { item: 'Pausar canvas fuera de viewport',   goal: 'hero-3d (IntersectionObserver)',  done: true,  icon: Zap        },
            { item: 'Reader mode',                       goal: 'reader-mode (useReaderMode+CSS)', done: true,  icon: BookOpen   },
            { item: 'Desactivar efectos medium/low',     goal: 'mobile-effects (usePerfTier)',    done: true,  icon: Smartphone },
            { item: 'Optimizar imágenes GitHub',         goal: 'optimize-images (WebP+?s=112+lazy)', done: true, icon: Image   },
            { item: 'Analizar CSS/paint',                goal: 'css-paint (PerformanceObserver)', done: true,  icon: Paintbrush },
            { item: 'Añadir RUM',                        goal: 'measure-inp (live-metrics.ts)',   done: true,  icon: Radio      },
            { item: 'Medir long tasks',                  goal: 'measure-inp (observeLongTasks)',  done: true,  icon: Gauge      },
            { item: 'Optimizar editor/admin independ.',  goal: 'admin-chunks (route isolation)',  done: true,  icon: Box        },
          ].map(({ item, goal, done: isDone, icon: Icon }) => (
            <div key={item} className={`flex items-start gap-2 rounded-lg border px-3 py-2 ${
              isDone ? 'border-emerald-400/10 bg-emerald-400/[0.025]' : 'border-white/6 bg-white/[0.015]'
            }`}>
              {isDone
                ? <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400/60" />
                : <CircleDashed  className="mt-0.5 h-3 w-3 shrink-0 text-white/20" />
              }
              <Icon className="mt-0.5 h-3 w-3 shrink-0 text-white/20" />
              <div className="min-w-0">
                <p className="font-mono text-[9px] text-white/60 truncate">{item}</p>
                <p className="font-mono text-[8px] text-white/25 truncate">{goal}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-2 font-mono text-[8px] text-white/20">
          12/12 scope items covered by {PHASE4_GOALS.length} Phase 4 goals.
        </p>
      </div>

      {/* Footer note */}
      <div className="rounded-xl border border-white/5 bg-white/[0.015] px-4 py-3">
        <p className="font-mono text-[8px] leading-relaxed text-white/25">
          Phase 4 progress tracked here. Mark checks complete in{' '}
          <code className="text-white/40">src/lib/analytics/perf-metrics.ts</code> as optimizations ship.
          Run <code className="text-white/40">npm run analyze</code> to see live bundle treemap.
          Use <code className="text-white/40">npm run build</code> to verify static page count.
        </p>
      </div>
    </div>
  )
}
