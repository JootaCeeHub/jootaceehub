'use client'

import React, { useState } from 'react'
import {
  ChevronDown, ChevronRight, CheckCircle2, CircleDashed,
  Rocket, Shield, Search, Eye, Gauge, FileText,
  AlertTriangle, BarChart3, Database, BookOpen,
  Users, RotateCcw, Undo2, GitBranch, Target,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  PHASE5_GOALS,
  phase5CheckCount, phase5GoalsDone, phase5GoalsInProgress,
  DOMAIN_COLOR, DOMAIN_LABEL,
} from '@/lib/analytics/launch-metrics'
import type { LaunchGoal } from '@/lib/analytics/launch-metrics'

// ─── Icon map ─────────────────────────────────────────────────────────────────

const GOAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'launch-checklist':    Rocket,
  'security-review':     Shield,
  'seo-qa':              Search,
  'accessibility-qa':    Eye,
  'lighthouse-target':   Gauge,
  'content-qa':          FileText,
  'error-monitoring':    AlertTriangle,
  'analytics-dashboard': BarChart3,
  'backup-restore':      Database,
  'release-notes':       BookOpen,
  'closed-beta':         Users,
  'recovery-drill':      RotateCcw,
  'rollback-drill':      Undo2,
  'publish-workflow':    GitBranch,
  'public-positioning':  Target,
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: LaunchGoal['status'] }) {
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
    <div className="rounded-lg border border-white/5 bg-white/[0.015]">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-start gap-2.5 px-3 py-2 text-left"
      >
        {pass
          ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
          : <CircleDashed  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/20" />}
        <span className={cn('flex-1 font-mono text-[10px]', pass ? 'text-white/65' : 'text-white/30')}>
          {label}
        </span>
        {open
          ? <ChevronDown  className="mt-0.5 h-3 w-3 shrink-0 text-white/25" />
          : <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-white/25" />}
      </button>
      {open && (
        <div className="border-t border-white/5 px-9 pb-2.5 pt-2">
          <p className="font-mono text-[9px] leading-relaxed text-white/35">{hint}</p>
        </div>
      )}
    </div>
  )
}

// ─── Goal card ────────────────────────────────────────────────────────────────

function GoalCard({ goal }: { goal: LaunchGoal }) {
  const [open, setOpen] = useState(false)
  const Icon = GOAL_ICONS[goal.id] ?? Rocket
  const passCount = goal.checks.filter(c => c.pass).length
  const color = DOMAIN_COLOR[goal.domain]
  const progress = goal.checks.length > 0 ? Math.round((passCount / goal.checks.length) * 100) : 0

  return (
    <div className="overflow-hidden rounded-xl border border-white/8 bg-white/[0.02]">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-start gap-3 px-4 py-3.5 text-left hover:bg-white/[0.02] transition-colors"
      >
        <span className="mt-0.5 flex items-center justify-center" style={{ color }}>
          <Icon className="h-4 w-4" />
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[11.5px] font-semibold text-white/75">{goal.title}</span>
            <StatusBadge status={goal.status} />
            <span
              className="rounded border px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-wider"
              style={{ color, borderColor: `${color}30`, background: `${color}10` }}
            >
              {DOMAIN_LABEL[goal.domain]}
            </span>
          </div>
          <p className="mt-0.5 font-mono text-[9px] text-white/35 truncate">{goal.subtitle}</p>

          <div className="mt-2 flex items-center gap-2">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${progress}%`, background: goal.status === 'done' ? '#34d399' : color }}
              />
            </div>
            <span className="shrink-0 font-mono text-[9px] text-white/30 tabular-nums">
              {passCount}/{goal.checks.length}
            </span>
          </div>
        </div>

        <div className="shrink-0 mt-0.5">
          {open
            ? <ChevronDown  className="h-3.5 w-3.5 text-white/25" />
            : <ChevronRight className="h-3.5 w-3.5 text-white/25" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-white/6 px-4 pb-4 pt-3 space-y-1.5">
          <p className="font-mono text-[9px] text-white/30 leading-relaxed mb-3">{goal.objective}</p>
          {goal.checks.map((check) => (
            <CheckRow key={check.label} label={check.label} hint={check.hint ?? ''} pass={check.pass} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Launch status table ──────────────────────────────────────────────────────

function LaunchReadinessTable() {
  const rows = [
    { metric: 'Lighthouse Accessibility', baseline: '96',  target: '≥ 95',  status: 'pass' },
    { metric: 'Lighthouse SEO',           baseline: '100', target: '= 100', status: 'pass' },
    { metric: 'Lighthouse Best Practices',baseline: '96',  target: '≥ 85',  status: 'pass' },
    { metric: 'Lighthouse Performance',   baseline: '44',  target: '≥ 55',  status: 'pending' },
    { metric: 'TypeScript errors',        baseline: '0',   target: '0',     status: 'pass' },
    { metric: 'Lint errors',              baseline: '0',   target: '0',     status: 'pass' },
    { metric: 'Test suite',               baseline: '460', target: '≥ 400', status: 'pass' },
    { metric: 'Static pages generated',   baseline: '107', target: '≥ 100', status: 'pass' },
    { metric: 'Sitemap entries',          baseline: '38',  target: '≥ 30',  status: 'pass' },
    { metric: 'Plausible events wired',   baseline: '4',   target: '4',     status: 'pass' },
  ] as const

  return (
    <div className="overflow-hidden rounded-xl border border-white/8">
      <div className="flex items-center gap-2 border-b border-white/8 px-4 py-2.5">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
          Launch readiness · current baseline vs target
        </span>
      </div>
      <div className="divide-y divide-white/5">
        {rows.map(({ metric, baseline, target, status }) => (
          <div key={metric} className="grid grid-cols-3 gap-4 px-4 py-2.5">
            <span className="font-mono text-[10px] text-white/55">{metric}</span>
            <span className="font-mono text-[10px] text-white/40 tabular-nums text-center">{baseline}</span>
            <span className={cn(
              'font-mono text-[10px] tabular-nums text-right',
              status === 'pass' ? 'text-emerald-400' : 'text-amber-400'
            )}>
              {target}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Phase5Tab ────────────────────────────────────────────────────────────────

export function Phase5Tab() {
  const { total, done } = phase5CheckCount()
  const goalsDone      = phase5GoalsDone()
  const goalsInProgress = phase5GoalsInProgress()
  const pct            = total > 0 ? Math.round((done / total) * 100) : 0

  const doneGoals       = PHASE5_GOALS.filter(g => g.status === 'done')
  const inProgressGoals = PHASE5_GOALS.filter(g => g.status === 'in-progress')
  const plannedGoals    = PHASE5_GOALS.filter(g => g.status === 'planned' || g.status === 'blocked')

  return (
    <div className="space-y-5">

      {/* Summary header */}
      <div className="overflow-hidden rounded-xl border border-emerald-400/20 bg-emerald-400/4">
        <div className="flex items-center gap-2 border-b border-emerald-400/15 px-4 py-2.5">
          <Rocket className="h-3.5 w-3.5 text-emerald-400" />
          <span className="flex-1 font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400/80">
            Phase 5 — Production Launch
          </span>
          <span className="font-mono text-[9px] text-white/30">{done}/{total} checks · {pct}%</span>
        </div>
        <div className="grid grid-cols-2 gap-px bg-white/5 p-px sm:grid-cols-4">
          {[
            { label: 'Goals Done',        value: goalsDone,        accent: 'text-emerald-400' },
            { label: 'In Progress',       value: goalsInProgress,  accent: 'text-sky-400' },
            { label: 'Checks Done',       value: done,             accent: 'text-emerald-400' },
            { label: 'Total Checks',      value: total,            accent: 'text-white/50' },
          ].map(({ label, value, accent }) => (
            <div key={label} className="flex flex-col items-center gap-1 bg-black/30 px-3 py-3">
              <div className={cn('font-mono text-[16px] font-bold tabular-nums', accent)}>{value}</div>
              <div className="font-mono text-[7.5px] uppercase tracking-wider text-white/30">{label}</div>
            </div>
          ))}
        </div>
        <div className="px-4 py-2.5">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Launch readiness table */}
      <LaunchReadinessTable />

      {/* In-progress goals */}
      {inProgressGoals.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/35">
              In progress · {inProgressGoals.length} goals
            </span>
          </div>
          <div className="space-y-2">
            {inProgressGoals.map(g => <GoalCard key={g.id} goal={g} />)}
          </div>
        </div>
      )}

      {/* Done goals */}
      {doneGoals.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/35">
              Done · {doneGoals.length} goals
            </span>
          </div>
          <div className="space-y-2">
            {doneGoals.map(g => <GoalCard key={g.id} goal={g} />)}
          </div>
        </div>
      )}

      {/* Planned/blocked goals */}
      {plannedGoals.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/35">
              Planned · {plannedGoals.length} goals
            </span>
          </div>
          <div className="space-y-2">
            {plannedGoals.map(g => <GoalCard key={g.id} goal={g} />)}
          </div>
        </div>
      )}

      {/* 15-item scope coverage map */}
      <div className="overflow-hidden rounded-xl border border-white/8">
        <div className="flex items-center gap-2 border-b border-white/8 px-4 py-2.5">
          <Rocket className="h-3 w-3 text-white/30" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
            Phase 5 · 15-item scope coverage map
          </span>
        </div>
        <div className="divide-y divide-white/5">
          {([
            { item: 'Closed beta',             goal: 'closed-beta',         status: 'in-progress' },
            { item: 'Content QA',              goal: 'content-qa',          status: 'done' },
            { item: 'Security review',         goal: 'security-review',     status: 'done' },
            { item: 'SEO validation',          goal: 'seo-qa',              status: 'in-progress' },
            { item: 'Accessibility audit',     goal: 'accessibility-qa',    status: 'done' },
            { item: 'Recovery drill',          goal: 'recovery-drill',      status: 'in-progress' },
            { item: 'Deploy rollback drill',   goal: 'rollback-drill',      status: 'in-progress' },
            { item: 'Backup restore drill',    goal: 'backup-restore',      status: 'done' },
            { item: 'Publish workflow E2E',    goal: 'publish-workflow',     status: 'in-progress' },
            { item: 'Lighthouse final',        goal: 'lighthouse-target',   status: 'done' },
            { item: 'Search Console',          goal: 'seo-qa',              status: 'in-progress' },
            { item: 'Analytics goals',         goal: 'analytics-dashboard', status: 'in-progress' },
            { item: 'Public positioning',      goal: 'public-positioning',  status: 'done' },
            { item: 'Launch changelog',        goal: 'release-notes',       status: 'done' },
            { item: 'Post-launch monitoring',  goal: 'error-monitoring',    status: 'in-progress' },
          ] as { item: string; goal: string; status: string }[]).map(({ item, goal, status }) => (
            <div key={item} className="grid grid-cols-2 gap-4 px-4 py-2">
              <span className="font-mono text-[10px] text-white/55">{item}</span>
              <div className="flex items-center justify-end gap-2">
                <span className="font-mono text-[9px] text-white/30">{goal}</span>
                <span className={cn(
                  'rounded-full border px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-wider',
                  status === 'done'
                    ? 'border-emerald-400/25 bg-emerald-400/8 text-emerald-400/70'
                    : 'border-sky-400/25 bg-sky-400/8 text-sky-400/75'
                )}>
                  {status === 'done' ? 'done' : 'partial'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
