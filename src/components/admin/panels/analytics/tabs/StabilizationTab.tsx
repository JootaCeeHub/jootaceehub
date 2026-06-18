'use client'

import React, { useState } from 'react'
import {
  ChevronDown, ChevronRight, CheckCircle2, CircleDashed,
  Hammer, Shield, Eye, TestTube2, Server, Activity, Package,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  STABILIZATION_GOALS,
  stabilizationCheckCount, stabilizationGoalsDone, stabilizationGoalsInProgress,
  STABILIZATION_DOMAIN_COLOR, STABILIZATION_DOMAIN_LABEL,
} from '@/lib/analytics/stabilization-metrics'
import type { StabilizationGoal } from '@/lib/analytics/stabilization-metrics'

// ─── Icon map ─────────────────────────────────────────────────────────────────

const GOAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  build:          Package,
  quality:        Eye,
  security:       Shield,
  monitoring:     Activity,
  testing:        TestTube2,
  infrastructure: Server,
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: StabilizationGoal['status'] }) {
  const cfg = {
    planned:      { label: 'Planned',    cls: 'border-white/12 bg-white/4 text-white/35' },
    'in-progress': { label: 'In Progress', cls: 'border-sky-400/25 bg-sky-400/8 text-sky-400/75' },
    done:          { label: 'Done',       cls: 'border-emerald-400/25 bg-emerald-400/8 text-emerald-400/70' },
    external:      { label: 'External',   cls: 'border-amber-400/25 bg-amber-400/8 text-amber-400/70' },
  }[status]
  return (
    <span className={cn('rounded-full border px-2 py-0.5 font-mono text-[7px] uppercase tracking-wider', cfg.cls)}>
      {cfg.label}
    </span>
  )
}

// ─── Check row ────────────────────────────────────────────────────────────────

function CheckRow({ label, hint, pass }: { label: string; hint?: string; pass: boolean }) {
  return (
    <div className="flex items-start gap-2 py-1">
      {pass
        ? <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400/70" />
        : <CircleDashed  className="mt-0.5 h-3 w-3 shrink-0 text-white/25" />
      }
      <div className="min-w-0">
        <p className={cn('font-mono text-[10px]', pass ? 'text-white/60' : 'text-white/35')}>{label}</p>
        {hint && <p className="font-mono text-[9px] text-white/25">{hint}</p>}
      </div>
    </div>
  )
}

// ─── Goal card ────────────────────────────────────────────────────────────────

function GoalCard({ goal }: { goal: StabilizationGoal }) {
  const [open, setOpen] = useState(false)
  const passCount = goal.checks.filter(c => c.pass).length
  const total     = goal.checks.length
  const pct       = total > 0 ? Math.round((passCount / total) * 100) : 0
  const color     = STABILIZATION_DOMAIN_COLOR[goal.domain]
  const Icon      = GOAL_ICONS[goal.domain] ?? Hammer

  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
      <button
        onClick={() => setOpen(p => !p)}
        className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.03]"
        aria-expanded={open}
      >
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg" style={{ background: `${color}18`, color }}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-mono text-[11px] font-semibold text-white/80">{goal.title}</p>
            <span className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-white/10 text-white/30">
              {STABILIZATION_DOMAIN_LABEL[goal.domain]}
            </span>
            <StatusBadge status={goal.status} />
          </div>
          <p className="mt-0.5 font-mono text-[9px] text-white/35">{goal.subtitle}</p>
          {/* Progress bar */}
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/6">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
            </div>
            <span className="font-mono text-[9px] text-white/30">{passCount}/{total}</span>
          </div>
        </div>
        {open
          ? <ChevronDown  className="mt-1 h-3 w-3 shrink-0 text-white/30" />
          : <ChevronRight className="mt-1 h-3 w-3 shrink-0 text-white/30" />
        }
      </button>
      {open && (
        <div className="border-t border-white/6 px-4 pb-3 pt-2">
          <p className="mb-2 font-mono text-[9px] text-white/30">{goal.objective}</p>
          <div className="space-y-0.5">
            {goal.checks.map((c, i) => (
              <CheckRow key={i} label={c.label} hint={c.hint} pass={c.pass} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Readiness summary ───────────────────────────────────────────────────────

function ReadinessSummary() {
  const { total, done: doneChecks } = stabilizationCheckCount()
  const goalsDone   = stabilizationGoalsDone()
  const goalsActive = stabilizationGoalsInProgress()
  const totalGoals  = STABILIZATION_GOALS.length
  const pct         = total > 0 ? Math.round((doneChecks / total) * 100) : 0

  const rows = [
    { label: 'Goals completed',  value: `${goalsDone}/${totalGoals}`, color: '#34d399' },
    { label: 'Goals in progress', value: `${goalsActive}`,           color: '#60a5fa' },
    { label: 'Checks passed',    value: `${doneChecks}/${total}`,    color: '#a78bfa' },
    { label: 'Overall progress', value: `${pct}%`,                   color: pct >= 80 ? '#34d399' : pct >= 50 ? '#fb923c' : '#f87171' },
  ]

  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
      <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-white/30">Phase 1 Readiness</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {rows.map(r => (
          <div key={r.label} className="rounded-lg border border-white/6 bg-white/[0.02] px-3 py-2.5 text-center">
            <p className="font-mono text-lg font-bold" style={{ color: r.color }}>{r.value}</p>
            <p className="mt-0.5 font-mono text-[8.5px] uppercase tracking-wider text-white/30">{r.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/6">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #22d3ee, #a78bfa)' }} />
      </div>
    </div>
  )
}

// ─── Tab root ────────────────────────────────────────────────────────────────

export function StabilizationTab() {
  const done        = STABILIZATION_GOALS.filter(g => g.status === 'done')
  const inProgress  = STABILIZATION_GOALS.filter(g => g.status === 'in-progress')
  const external    = STABILIZATION_GOALS.filter(g => g.status === 'external')
  const planned     = STABILIZATION_GOALS.filter(g => g.status === 'planned')

  return (
    <div className="space-y-4">
      <ReadinessSummary />

      {inProgress.length > 0 && (
        <section>
          <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-sky-400/60">In Progress</p>
          <div className="space-y-2">
            {inProgress.sort((a, b) => a.order - b.order).map(g => <GoalCard key={g.id} goal={g} />)}
          </div>
        </section>
      )}

      {done.length > 0 && (
        <section>
          <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-emerald-400/60">Completed</p>
          <div className="space-y-2">
            {done.sort((a, b) => a.order - b.order).map(g => <GoalCard key={g.id} goal={g} />)}
          </div>
        </section>
      )}

      {external.length > 0 && (
        <section>
          <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-amber-400/60">External (Manual Steps)</p>
          <div className="space-y-2">
            {external.sort((a, b) => a.order - b.order).map(g => <GoalCard key={g.id} goal={g} />)}
          </div>
        </section>
      )}

      {planned.length > 0 && (
        <section>
          <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-white/25">Planned</p>
          <div className="space-y-2">
            {planned.sort((a, b) => a.order - b.order).map(g => <GoalCard key={g.id} goal={g} />)}
          </div>
        </section>
      )}
    </div>
  )
}
