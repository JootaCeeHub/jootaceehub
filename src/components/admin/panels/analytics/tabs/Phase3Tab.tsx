'use client'

import React, { useState } from 'react'
import {
  AlertCircle, BookMarked, CheckCircle2, ChevronDown, ChevronRight,
  CircleDashed, Clock, Construction, FileText, GitMerge,
  Layers, Lock, Puzzle, RefreshCcw, Workflow,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  PHASE3_GOALS,
  phase3CheckCount,
  phase3GoalsDone,
  phase3TotalEffort,
  COMPLEXITY_LABEL,
  COMPLEXITY_COLOR,
  LAYER_COLOR,
} from '@/lib/analytics/cms-metrics'
import type { CMSGoal } from '@/lib/analytics/cms-metrics'

// ─── Goal icon map ────────────────────────────────────────────────────────────

const GOAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'sst-decision':        GitMerge,
  'draft-published':     Layers,
  'preview':             FileText,
  'content-validation':  CheckCircle2,
  'taxonomies':          Puzzle,
  'media-model':         BookMarked,
  'import-export':       RefreshCcw,
  'revisions':           Clock,
  'publishing-workflow': Workflow,
  'rebuild-trigger':     Construction,
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: CMSGoal['status'] }) {
  const cfg = {
    planned:     { label: 'Planned',     cls: 'border-amber-400/20 bg-amber-400/8 text-amber-400/70' },
    'in-progress': { label: 'In Progress', cls: 'border-sky-400/25 bg-sky-400/8 text-sky-400/75' },
    done:        { label: 'Done',         cls: 'border-emerald-400/25 bg-emerald-400/8 text-emerald-400/70' },
    blocked:     { label: 'Blocked',      cls: 'border-rose-400/25 bg-rose-400/8 text-rose-400/70' },
  }[status]

  return (
    <span className={cn('rounded-full border px-2 py-0.5 font-mono text-[7px] uppercase tracking-wider', cfg.cls)}>
      {cfg.label}
    </span>
  )
}

// ─── Dependency chip ──────────────────────────────────────────────────────────

function DepChip({ id }: { id: string }) {
  const goal = PHASE3_GOALS.find(g => g.id === id)
  if (!goal) return null
  return (
    <span className="rounded border border-white/8 bg-white/[0.03] px-1.5 py-0.5 font-mono text-[7px] text-white/35">
      ← {goal.title}
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
          : <CircleDashed  className="mt-px h-3 w-3 shrink-0 text-amber-400/45" />
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

function GoalCard({ goal }: { goal: CMSGoal }) {
  const [expanded, setExpanded] = useState(false)
  const Icon = GOAL_ICONS[goal.id] ?? Construction

  const doneChecks  = goal.checks.filter(c => c.pass).length
  const totalChecks = goal.checks.length
  const progress    = Math.round(doneChecks / totalChecks * 100)
  const isBlocked   = goal.dependsOn.some(dep => {
    const parent = PHASE3_GOALS.find(g => g.id === dep)
    return parent && parent.status !== 'done'
  })

  const borderColor = isBlocked ? 'border-rose-400/10' : goal.status === 'done' ? 'border-emerald-400/12' : 'border-white/8'
  const iconBg      = isBlocked ? '#f8717108' : goal.status === 'done' ? '#34d39908' : '#f59e0b08'
  const iconColor   = isBlocked ? 'text-rose-400/50' : goal.status === 'done' ? 'text-emerald-400/55' : goal.status === 'in-progress' ? 'text-amber-400/55' : 'text-white/25'

  return (
    <div className={cn('flex flex-col overflow-hidden rounded-xl border bg-white/[0.02]', borderColor)}>
      {/* Header */}
      <div className="flex items-start gap-3 px-4 pb-3 pt-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/8" style={{ background: iconBg }}>
          <Icon className={cn('h-4 w-4', iconColor)} />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-white/75">
              {goal.title}
            </span>
            <StatusBadge status={goal.status} />
            {goal.adr && (
              <span className={cn(
                'rounded border px-1.5 py-0.5 font-mono text-[7px]',
                goal.status === 'done' || goal.status === 'in-progress'
                  ? 'border-emerald-400/15 bg-emerald-400/5 text-emerald-400/55'
                  : 'border-sky-400/15 bg-sky-400/5 text-sky-400/55'
              )}>
                {goal.adr}
              </span>
            )}
            {isBlocked && (
              <span className="flex items-center gap-1 font-mono text-[7px] text-rose-400/55">
                <Lock className="h-2.5 w-2.5" /> blocked
              </span>
            )}
          </div>
          <p className="font-mono text-[8px] text-white/28">{goal.subtitle}</p>

          {/* Progress bar */}
          <div className="h-0.5 w-full overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progress}%`,
                background: goal.status === 'done' ? '#34d39966' : goal.status === 'in-progress' ? '#f59e0b66' : '#ffffff22',
              }}
            />
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 pl-1 shrink-0">
          <span className="font-mono text-[18px] font-bold tabular-nums leading-none text-white/20">{doneChecks}/{totalChecks}</span>
          <span className="font-mono text-[7px] text-white/18">checks</span>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.05] px-4 py-2">
        {/* Complexity */}
        <span
          className="rounded border border-white/8 px-1.5 py-0.5 font-mono text-[7px]"
          style={{ color: COMPLEXITY_COLOR[goal.complexity] }}
        >
          {COMPLEXITY_LABEL[goal.complexity]} complexity
        </span>

        {/* Effort */}
        <span className="font-mono text-[7px] text-white/25">~{goal.effortDays}d effort</span>

        {/* Layers */}
        {goal.layers.map(layer => (
          <span key={layer} className="font-mono text-[7px]" style={{ color: LAYER_COLOR[layer] }}>
            {layer}
          </span>
        ))}

        <span className="flex-1" />

        {/* Deps */}
        {goal.dependsOn.map(dep => <DepChip key={dep} id={dep} />)}
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
          {expanded ? 'Hide' : 'Show'} definition of done ({totalChecks} checks)
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

// ─── Dependency graph legend ──────────────────────────────────────────────────

function DepGraph() {
  const chains = [
    { label: 'ADR First', ids: ['sst-decision'], color: '#f59e0b' },
    { label: 'Content Lifecycle', ids: ['draft-published', 'preview', 'publishing-workflow', 'rebuild-trigger'], color: '#38bdf8' },
    { label: 'Schema & Quality', ids: ['content-validation', 'taxonomies', 'import-export'], color: '#a78bfa' },
    { label: 'History & UX', ids: ['revisions', 'media-model'], color: '#f472b6' },
  ]
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4 space-y-3">
      <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/35">Dependency Chains</div>
      {chains.map(chain => (
        <div key={chain.label} className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[8px] text-white/30 w-28 shrink-0">{chain.label}</span>
          {chain.ids.map((id, i) => {
            const goal = PHASE3_GOALS.find(g => g.id === id)
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

export function Phase3Tab() {
  const { total, done } = phase3CheckCount()
  const goalsDone = phase3GoalsDone()
  const totalEffort = phase3TotalEffort()

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Construction className="h-3.5 w-3.5 text-amber-400/60" />
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/28">
              Phase 3 — CMS Maturity
            </span>
          </div>
          <p className="font-mono text-[8px] text-white/20">
            Roadmap · {PHASE3_GOALS.length} goals · {total} checks · {done}/{total} done · ~{totalEffort}d total effort
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-mono text-[36px] font-bold tabular-nums leading-none text-amber-400/40">
            {goalsDone}/{PHASE3_GOALS.length}
          </span>
          <span className="font-mono text-[7.5px] text-white/22">goals complete</span>
        </div>
      </div>

      {/* Key constraint banner */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-400/15 bg-amber-400/5 px-4 py-3">
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400/60" />
        <div>
          <p className="font-mono text-[9px] font-semibold text-amber-400/70 mb-0.5">
            Constraint: output: &apos;export&apos; is permanent (LAW 1)
          </p>
          <p className="font-mono text-[8px] text-amber-400/45 leading-relaxed">
            All CMS features must work in a static export. Supabase can be used client-side only
            (no SSG for content). ADR-006 must be written before any Phase 3 implementation begins.
          </p>
        </div>
      </div>

      {/* Summary chips */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Goals',       value: `${goalsDone}/${PHASE3_GOALS.length}`, accent: '#f59e0b' },
          { label: 'Checks Done', value: `${done}/${total}`,                    accent: '#f59e0b' },
          { label: 'Est. Effort', value: `~${totalEffort}d`,                    accent: '#a78bfa' },
          { label: 'ADRs Needed', value: '2',                                   accent: '#38bdf8' },
        ].map(({ label, value, accent }) => (
          <div key={label} className="flex flex-col items-center rounded-xl border border-white/8 bg-white/[0.025] px-3 py-2.5">
            <span className="font-mono text-[18px] font-bold tabular-nums" style={{ color: accent }}>{value}</span>
            <span className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.12em] text-white/28">{label}</span>
          </div>
        ))}
      </div>

      {/* Dependency graph */}
      <DepGraph />

      {/* Critical path: SSoT decision first */}
      <div>
        <div className="mb-2.5 flex items-center gap-2">
          <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-amber-400/40">
            Step 0 — Prerequisite (must be first)
          </span>
          <div className="h-px flex-1 bg-amber-400/10" />
        </div>
        <GoalCard goal={PHASE3_GOALS[0]} />
      </div>

      {/* Content lifecycle chain */}
      <div>
        <div className="mb-2.5 flex items-center gap-2">
          <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/22">
            Content Lifecycle
          </span>
          <div className="h-px flex-1 bg-white/5" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <GoalCard goal={PHASE3_GOALS[1]} />
          <GoalCard goal={PHASE3_GOALS[2]} />
          <GoalCard goal={PHASE3_GOALS[8]} />
          <GoalCard goal={PHASE3_GOALS[9]} />
        </div>
      </div>

      {/* Schema & structure */}
      <div>
        <div className="mb-2.5 flex items-center gap-2">
          <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/22">
            Schema, Structure & Portability
          </span>
          <div className="h-px flex-1 bg-white/5" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <GoalCard goal={PHASE3_GOALS[3]} />
          <GoalCard goal={PHASE3_GOALS[4]} />
          <GoalCard goal={PHASE3_GOALS[6]} />
        </div>
      </div>

      {/* Media + revisions */}
      <div>
        <div className="mb-2.5 flex items-center gap-2">
          <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/22">
            Media & History
          </span>
          <div className="h-px flex-1 bg-white/5" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <GoalCard goal={PHASE3_GOALS[5]} />
          <GoalCard goal={PHASE3_GOALS[7]} />
        </div>
      </div>

      {/* Footer note */}
      <div className="rounded-xl border border-white/5 bg-white/[0.015] px-4 py-3">
        <p className="font-mono text-[8px] leading-relaxed text-white/25">
          Phase 3 progress is tracked here. Each goal starts as 0/N checks.
          Mark checks complete in <code className="text-white/40">src/lib/analytics/cms-metrics.ts</code> as features are implemented.
          This tab auto-recalculates totals from the source of truth.
        </p>
      </div>
    </div>
  )
}
