'use client'

import React, { useState } from 'react'
import { CheckCircle2, XCircle, TestTube2, BookOpen, Cpu, Globe, Wifi, ShieldCheck, Activity, Database, Gauge } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AuditCheck } from '@/lib/analytics/scoring'
import type { ProjectCheck } from '@/lib/analytics/project-audit'

interface Props {
  testsChecks:     AuditCheck[]
  docsChecks:      AuditCheck[]
  archChecks:      AuditCheck[]
  htmlChecks:      ProjectCheck[]
  pwaChecks:       ProjectCheck[]
  secChecks:       ProjectCheck[]
  dxChecks:        ProjectCheck[]
  schemaChecks?:   ProjectCheck[]
  perfDeepChecks?: ProjectCheck[]
}

function pToA(c: ProjectCheck): AuditCheck {
  return { label: c.label, value: c.value, pass: c.pass, hint: c.hint }
}

function scoreOf(checks: { pass: boolean }[]): number {
  if (!checks.length) return 0
  return Math.round(checks.filter((c) => c.pass).length / checks.length * 100)
}

function ScoreBar({ score, color: _color }: { score: number; color: string }) {
  const barColor = score >= 80 ? '#34d399' : score >= 55 ? '#fb923c' : '#f87171'
  return (
    <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-white/6">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, background: barColor }} />
    </div>
  )
}

function CheckRow({ check }: { check: AuditCheck }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 rounded px-1 py-1.5 text-left transition-colors hover:bg-white/[0.025]"
      >
        {check.pass
          ? <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-400/65" />
          : <XCircle      className="h-3 w-3 shrink-0 text-rose-400/70" />
        }
        <span className={cn('flex-1 truncate font-mono text-[9px]', check.pass ? 'text-white/50' : 'text-white/75')}>
          {check.label}
        </span>
        <span className="ml-2 shrink-0 max-w-[80px] truncate text-right font-mono text-[8px] text-white/25">{check.value}</span>
      </button>
      {open && (
        <p className="mb-1.5 ml-5 rounded bg-white/[0.03] px-2 py-1.5 font-mono text-[8.5px] leading-relaxed text-white/38">
          {check.hint}
        </p>
      )}
    </div>
  )
}

interface CardProps {
  icon:     React.ComponentType<{ className?: string }>
  title:    string
  subtitle: string
  checks:   AuditCheck[]
  live?:    boolean
}

function DomainCard({ icon: Icon, title, subtitle, checks, live }: CardProps) {
  const [expanded, setExpanded] = useState(false)
  const [showAll,  setShowAll]  = useState(false)

  const score   = scoreOf(checks)
  const passing = checks.filter((c) => c.pass).length
  const failing = checks.filter((c) => !c.pass)
  const visible = showAll ? checks : failing.length > 0 ? failing : checks
  const trimmed = expanded ? visible : visible.slice(0, 6)

  const scoreColor = score >= 80 ? '#34d399' : score >= 55 ? '#fb923c' : '#f87171'
  const iconBg     = score >= 80 ? '#34d39912' : score >= 55 ? '#fb923c12' : '#f8717112'

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-white/8 bg-white/[0.025]">
      {/* Header */}
      <div className="flex items-start gap-3 px-4 pb-3 pt-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/8" style={{ background: iconBg }}>
          <span style={{ color: scoreColor }}><Icon className="h-4 w-4" /></span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-white/80">{title}</span>
            {live && (
              <span className="rounded-full border border-sky-400/20 bg-sky-400/8 px-1.5 font-mono text-[7px] uppercase tracking-wider text-sky-400/60">
                live DOM
              </span>
            )}
          </div>
          <p className="mt-0.5 font-mono text-[8px] text-white/28">{subtitle}</p>
          <ScoreBar score={score} color={scoreColor} />
        </div>
        <div className="flex flex-col items-end gap-0.5 pl-2">
          <span className="font-mono text-[22px] font-bold tabular-nums leading-none" style={{ color: scoreColor }}>
            {score}
          </span>
          <span className="font-mono text-[7px] text-white/22">{passing}/{checks.length}</span>
        </div>
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-2 border-t border-white/[0.05] px-4 py-1.5">
        <button
          onClick={() => { setShowAll((v) => !v); setExpanded(false) }}
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

      {/* Checks */}
      <div className="flex-1 divide-y divide-white/[0.035] px-3 pb-3">
        {visible.length === 0 && (
          <p className="py-3 text-center font-mono text-[8px] text-emerald-400/50">All checks passing ✓</p>
        )}
        {trimmed.map((c) => <CheckRow key={c.label} check={c} />)}
        {visible.length > trimmed.length && (
          <button
            onClick={() => setExpanded(true)}
            className="w-full pt-2 font-mono text-[8px] text-white/22 transition-colors hover:text-white/42"
          >
            +{visible.length - trimmed.length} more
          </button>
        )}
        {expanded && visible.length > 6 && (
          <button
            onClick={() => setExpanded(false)}
            className="w-full pt-1 font-mono text-[8px] text-white/18 transition-colors hover:text-white/38"
          >
            show fewer
          </button>
        )}
      </div>
    </div>
  )
}

export function ProjectTab({ testsChecks, docsChecks, archChecks, htmlChecks, pwaChecks, secChecks, dxChecks, schemaChecks = [], perfDeepChecks = [] }: Props) {
  const htmlNorm     = htmlChecks.map(pToA)
  const pwaNorm      = pwaChecks.map(pToA)
  const secNorm      = secChecks.map(pToA)
  const dxNorm       = dxChecks.map(pToA)
  const schemaNorm   = schemaChecks.map(pToA)
  const perfDeepNorm = perfDeepChecks.map(pToA)

  const domains = [
    scoreOf(testsChecks), scoreOf(docsChecks), scoreOf(archChecks),
    scoreOf(htmlNorm), scoreOf(pwaNorm), scoreOf(secNorm), scoreOf(dxNorm),
    ...(schemaNorm.length ? [scoreOf(schemaNorm)] : []),
    ...(perfDeepNorm.length ? [scoreOf(perfDeepNorm)] : []),
  ]
  const overall  = Math.round(domains.reduce((a, b) => a + b, 0) / domains.length)
  const liveDomainChecks = [...htmlChecks, ...pwaChecks, ...secChecks, ...dxChecks, ...schemaChecks, ...perfDeepChecks]
  const liveNote = liveDomainChecks.length > 0
    ? `${liveDomainChecks.filter((c) => c.pass).length}/${liveDomainChecks.length} live checks passing`
    : 'Run Analysis to load live DOM checks'
  const domainCount = 7 + (schemaNorm.length > 0 ? 1 : 0) + (perfDeepNorm.length > 0 ? 1 : 0)

  return (
    <div className="space-y-4">
      {/* Panel header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/28">Project Health Audit</div>
          <p className="mt-0.5 font-mono text-[8px] text-white/20">
            {domainCount} domains · click any check for hint · {liveNote}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span className={cn(
            'font-mono text-[32px] font-bold tabular-nums leading-none',
            overall >= 80 ? 'text-emerald-400/80' : overall >= 60 ? 'text-amber-400/80' : 'text-rose-400/80',
          )}>
            {overall}
          </span>
          <span className="font-mono text-[7.5px] text-white/22">overall / 100</span>
        </div>
      </div>

      {/* Row 1 — static knowledge (Tests, Docs, Architecture) */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/22">Static Analysis</span>
          <div className="h-px flex-1 bg-white/5" />
          <span className="font-mono text-[8px] text-white/18">derived from project knowledge</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <DomainCard icon={TestTube2} title="Tests"        subtitle="Coverage · CI gates · tooling"      checks={testsChecks} />
          <DomainCard icon={BookOpen}  title="Docs"         subtitle="Project documentation quality"      checks={docsChecks}  />
          <DomainCard icon={Cpu}       title="Architecture" subtitle="Static export · i18n · CSS laws"    checks={archChecks}  />
        </div>
      </div>

      {/* Row 2 — live DOM (HTML, PWA, Security, DX) */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/22">Live DOM Audit</span>
          <div className="h-px flex-1 bg-white/5" />
          <span className="font-mono text-[8px] text-white/18">refreshed on Run Analysis</span>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <DomainCard icon={Globe}       title="HTML"       subtitle="Landmarks · meta · OG tags"         checks={htmlNorm}     live />
          <DomainCard icon={Wifi}        title="PWA"        subtitle="Manifest · SW · installability"     checks={pwaNorm}      live />
          <DomainCard icon={ShieldCheck} title="Security"   subtitle="CSP · headers · safe links"         checks={secNorm}      live />
          <DomainCard icon={Activity}    title="Runtime DX" subtitle="Browser APIs · prefs · hardware"    checks={dxNorm}       live />
        </div>
      </div>

      {/* Row 3 — structured data + performance deep */}
      {(schemaNorm.length > 0 || perfDeepNorm.length > 0) && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/22">SEO & Performance Deep</span>
            <div className="h-px flex-1 bg-white/5" />
            <span className="font-mono text-[8px] text-white/18">schema · i18n · real vitals</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {schemaNorm.length > 0 && (
              <DomainCard icon={Database} title="Schema / i18n" subtitle="JSON-LD · hreflang · OG locale"    checks={schemaNorm}   live />
            )}
            {perfDeepNorm.length > 0 && (
              <DomainCard icon={Gauge}    title="Perf Deep"   subtitle="LCP hints · scripts · real vitals"  checks={perfDeepNorm} live />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
