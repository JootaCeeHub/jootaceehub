'use client'

import React, { useState } from 'react'
import { CheckCircle2, XCircle, GitBranch, Layers, Palette, FileCode2, Database, Shield, Zap, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buildPhase2Domains, SLICE_COUNT, STATIC_PAGE_COUNT, TEST_COUNT, ADR_COUNT, PANEL_LOC, PANEL_SUBFILES } from '@/lib/analytics/arch-metrics'
import type { AuditCheck } from '@/lib/analytics/scoring'

// ─── Domain icon map ──────────────────────────────────────────────────────────

const DOMAIN_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'bounded-context': GitBranch,
  'panel-modularity': Layers,
  'design-tokens':   Palette,
  'content-schema':  FileCode2,
  'data-modules':    Database,
  'auth-strategy':   Shield,
  'ai-routing':      Zap,
}

// ─── Summary stats ────────────────────────────────────────────────────────────

function ScoreBar({ score }: { score: number }) {
  const color = score >= 90 ? '#34d399' : score >= 70 ? '#fb923c' : '#f87171'
  return (
    <div className="mt-2 h-0.5 w-full overflow-hidden rounded-full bg-white/6">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, background: color }} />
    </div>
  )
}

function StatChip({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-white/8 bg-white/[0.025] px-3 py-2.5">
      <span className="font-mono text-[18px] font-bold tabular-nums" style={{ color: accent }}>{value}</span>
      <span className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.12em] text-white/28">{label}</span>
    </div>
  )
}

// ─── Check row ────────────────────────────────────────────────────────────────

function CheckRow({ check }: { check: AuditCheck }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center gap-2 rounded px-1 py-1.5 text-left transition-colors hover:bg-white/[0.025]"
      >
        {check.pass
          ? <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-400/65" />
          : <XCircle      className="h-3 w-3 shrink-0 text-rose-400/70" />
        }
        <span className={cn('flex-1 truncate font-mono text-[9px]', check.pass ? 'text-white/50' : 'text-white/75')}>
          {check.label}
        </span>
        <span className="ml-2 shrink-0 max-w-[90px] truncate text-right font-mono text-[8px] text-white/25">
          {check.value}
        </span>
      </button>
      {open && (
        <p className="mb-1.5 ml-5 rounded bg-white/[0.03] px-2 py-1.5 font-mono text-[8.5px] leading-relaxed text-white/38">
          {check.hint}
        </p>
      )}
    </div>
  )
}

// ─── Domain card ──────────────────────────────────────────────────────────────

function DomainCard({ id, title, subtitle, checks }: { id: string; title: string; subtitle: string; checks: AuditCheck[] }) {
  const [showAll,  setShowAll]  = useState(false)
  const [expanded, setExpanded] = useState(false)

  const Icon    = DOMAIN_ICONS[id] ?? GitBranch
  const passing = checks.filter(c => c.pass).length
  const failing = checks.filter(c => !c.pass)
  const score   = Math.round(passing / checks.length * 100)
  const scoreColor = score >= 90 ? '#34d399' : score >= 70 ? '#fb923c' : '#f87171'
  const iconBg     = score >= 90 ? '#34d39912' : score >= 70 ? '#fb923c12' : '#f8717112'

  const visible = showAll ? checks : failing.length > 0 ? failing : checks
  const trimmed = expanded ? visible : visible.slice(0, 5)

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-white/8 bg-white/[0.025]">
      <div className="flex items-start gap-3 px-4 pb-3 pt-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/8" style={{ background: iconBg }}>
          <span style={{ color: scoreColor }}><Icon className="h-4 w-4" /></span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-white/80">{title}</div>
          <p className="mt-0.5 font-mono text-[8px] text-white/28">{subtitle}</p>
          <ScoreBar score={score} />
        </div>
        <div className="flex flex-col items-end gap-0.5 pl-2">
          <span className="font-mono text-[22px] font-bold tabular-nums leading-none" style={{ color: scoreColor }}>{score}</span>
          <span className="font-mono text-[7px] text-white/22">{passing}/{checks.length}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-white/[0.05] px-4 py-1.5">
        <button
          onClick={() => { setShowAll(v => !v); setExpanded(false) }}
          className={cn(
            'rounded px-2 py-0.5 font-mono text-[7.5px] uppercase tracking-wider transition-colors',
            showAll ? 'bg-white/8 text-white/55' : 'text-white/28 hover:text-white/48',
          )}
        >
          {showAll ? `All (${checks.length})` : `Failing (${failing.length})`}
        </button>
        <span className="flex-1" />
        <span className="font-mono text-[7.5px] text-emerald-400/50">{passing} pass</span>
        {failing.length > 0 && (
          <span className="font-mono text-[7.5px] text-rose-400/55">{failing.length} fail</span>
        )}
      </div>

      <div className="flex-1 divide-y divide-white/[0.035] px-3 pb-3">
        {visible.length === 0 && (
          <p className="py-3 text-center font-mono text-[8px] text-emerald-400/50">All checks passing ✓</p>
        )}
        {trimmed.map(c => <CheckRow key={c.label} check={c} />)}
        {visible.length > trimmed.length && (
          <button onClick={() => setExpanded(true)} className="w-full pt-2 font-mono text-[8px] text-white/22 hover:text-white/42">
            +{visible.length - trimmed.length} more
          </button>
        )}
        {expanded && visible.length > 5 && (
          <button onClick={() => setExpanded(false)} className="w-full pt-1 font-mono text-[8px] text-white/18 hover:text-white/38">
            show fewer
          </button>
        )}
      </div>
    </div>
  )
}

// ─── LOC reduction timeline ───────────────────────────────────────────────────

const LOC_DATA = [
  { panel: 'ContentPanel',      before: 3011, after: PANEL_LOC.content,     subs: PANEL_SUBFILES.content,  color: '#a78bfa' },
  { panel: 'StudioPanel',       before: 1895, after: PANEL_LOC.studio,      subs: PANEL_SUBFILES.studio,   color: '#38bdf8' },
  { panel: 'GitHubLayerPanel',  before: 1357, after: PANEL_LOC.githubLayer, subs: PANEL_SUBFILES.github,   color: '#f472b6' },
]

function LOCTable() {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.025] overflow-hidden">
      <div className="px-4 py-3 border-b border-white/8">
        <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">Panel LOC Reduction</div>
        <p className="mt-0.5 font-mono text-[8px] text-white/22">Shell file lines before → after split</p>
      </div>
      <div className="divide-y divide-white/[0.05]">
        {LOC_DATA.map(row => {
          const pct = Math.round((1 - row.after / row.before) * 100)
          const barW = Math.round((row.after / row.before) * 100)
          return (
            <div key={row.panel} className="px-4 py-3 space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[9px] text-white/60">{row.panel}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[8px] text-white/30 line-through">{row.before}</span>
                  <span className="font-mono text-[9px] font-semibold" style={{ color: row.color }}>{row.after}</span>
                  <span className="rounded-full border px-1.5 py-0.5 font-mono text-[7px] border-emerald-400/20 text-emerald-400/60">
                    −{pct}%
                  </span>
                  <span className="font-mono text-[7px] text-white/20">+{row.subs} sub-files</span>
                </div>
              </div>
              <div className="h-0.5 w-full overflow-hidden rounded-full bg-white/5">
                <div className="h-full rounded-full" style={{ width: `${barW}%`, background: row.color, opacity: 0.6 }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main tab ─────────────────────────────────────────────────────────────────

export function Phase2Tab() {
  const domains  = buildPhase2Domains()
  const allChecks = domains.flatMap(d => d.checks)
  const passing  = allChecks.filter(c => c.pass).length
  const overall  = Math.round(passing / allChecks.length * 100)
  const scoreColor = overall >= 90 ? 'text-emerald-400/80' : overall >= 70 ? 'text-amber-400/80' : 'text-rose-400/80'

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="h-3.5 w-3.5 text-amber-400/60" />
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/28">Phase 2 — Architecture Consolidation</span>
          </div>
          <p className="font-mono text-[8px] text-white/20">
            Completed 2026-06-17 · {domains.length} domains · {allChecks.length} checks · {passing} passing
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span className={cn('font-mono text-[36px] font-bold tabular-nums leading-none', scoreColor)}>{overall}</span>
          <span className="font-mono text-[7.5px] text-white/22">arch health / 100</span>
        </div>
      </div>

      {/* Summary chips */}
      <div className="grid grid-cols-5 gap-2">
        <StatChip label="Slices"     value={SLICE_COUNT}        accent="#a78bfa" />
        <StatChip label="ADRs"       value={ADR_COUNT}          accent="#38bdf8" />
        <StatChip label="Tests"      value={TEST_COUNT}         accent="#34d399" />
        <StatChip label="Pages"      value={STATIC_PAGE_COUNT}  accent="#f472b6" />
        <StatChip label="TS errors"  value={0}                  accent="#34d399" />
      </div>

      {/* LOC table */}
      <LOCTable />

      {/* Domain grid — Row 1: Store + Panels */}
      <div>
        <div className="mb-2.5 flex items-center gap-2">
          <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/22">Store & Panel Architecture</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <DomainCard {...domains[0]} />
          <DomainCard {...domains[1]} />
        </div>
      </div>

      {/* Domain grid — Row 2: Tokens + Content */}
      <div>
        <div className="mb-2.5 flex items-center gap-2">
          <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/22">Tokens, Schema & Data</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <DomainCard {...domains[2]} />
          <DomainCard {...domains[3]} />
          <DomainCard {...domains[4]} />
        </div>
      </div>

      {/* Domain grid — Row 3: Auth + AI */}
      <div>
        <div className="mb-2.5 flex items-center gap-2">
          <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/22">Auth, Routing & Quality Gates</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <DomainCard {...domains[5]} />
          <DomainCard {...domains[6]} />
        </div>
      </div>
    </div>
  )
}
