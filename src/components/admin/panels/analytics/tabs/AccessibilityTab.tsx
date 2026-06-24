'use client'

import { CheckCircle2, XCircle, Eye, Keyboard, Layers, Code2, AlertTriangle } from 'lucide-react'
import { Card, AuditRow, ScoreRing } from '../shared-components'
import { cn } from '@/lib/utils'
import type { AuditCheck } from '@/lib/analytics/scoring'
import type { DOMCheck } from '@/lib/analytics/dom-audit'

interface Props {
  domA11yChecks: DOMCheck[]
  a11yChecks:    AuditCheck[]
  activeA11yChecks: AuditCheck[]
}

// ─── WCAG 2.1 principle mapping ───────────────────────────────────────────────
// Maps DOM check labels to WCAG 2.1 principles (P/O/U/R)

const WCAG_PRINCIPLE: Record<string, { code: string; color: string; label: string }> = {
  'HTML lang attribute':     { code: 'P', color: '#818cf8', label: 'Perceivable' },
  'Images alt text':         { code: 'P', color: '#818cf8', label: 'Perceivable' },
  'Autoplay media':          { code: 'P', color: '#818cf8', label: 'Perceivable' },
  'CSS design tokens':       { code: 'P', color: '#818cf8', label: 'Perceivable' },
  'Skip navigation link':    { code: 'O', color: '#34d399', label: 'Operable' },
  'Focusable elements':      { code: 'O', color: '#34d399', label: 'Operable' },
  'Positive tabindex':       { code: 'O', color: '#34d399', label: 'Operable' },
  ':focus-visible styles':   { code: 'O', color: '#34d399', label: 'Operable' },
  'prefers-reduced-motion':  { code: 'O', color: '#34d399', label: 'Operable' },
  'Heading order':           { code: 'U', color: '#f59e0b', label: 'Understandable' },
  'Empty headings':          { code: 'U', color: '#f59e0b', label: 'Understandable' },
  'Form input labels':       { code: 'U', color: '#f59e0b', label: 'Understandable' },
  'Unlabeled controls':      { code: 'U', color: '#f59e0b', label: 'Understandable' },
  '<main> landmark':         { code: 'R', color: '#f43f5e', label: 'Robust' },
  '<nav> landmark':          { code: 'R', color: '#f43f5e', label: 'Robust' },
  '<footer> landmark':       { code: 'R', color: '#f43f5e', label: 'Robust' },
  'ARIA roles':              { code: 'R', color: '#f43f5e', label: 'Robust' },
  'ARIA live regions':       { code: 'R', color: '#f43f5e', label: 'Robust' },
  'Duplicate IDs':           { code: 'R', color: '#f43f5e', label: 'Robust' },
  'Table headers':           { code: 'R', color: '#f43f5e', label: 'Robust' },
}

const PRINCIPLES = [
  { code: 'P', label: 'Perceivable',    color: '#818cf8', desc: '1.x — Content available to all senses' },
  { code: 'O', label: 'Operable',       color: '#34d399', desc: '2.x — Interface is navigable and usable' },
  { code: 'U', label: 'Understandable', color: '#f59e0b', desc: '3.x — Content and UI are understandable' },
  { code: 'R', label: 'Robust',         color: '#f43f5e', desc: '4.x — Compatible with assistive technologies' },
]

function WCAGBadge({ code, color }: { code: string; color: string }) {
  return (
    <span
      className="shrink-0 rounded border px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-wider"
      style={{ borderColor: `${color}30`, color, background: `${color}10` }}
    >
      {code}
    </span>
  )
}

function DOMCheckRow({ item }: { item: DOMCheck }) {
  const principle = WCAG_PRINCIPLE[item.label]
  return (
    <div className="flex items-center gap-3 px-4 py-2 border-b border-white/[0.03] last:border-0">
      <span className={cn('shrink-0 font-mono text-[9px]', item.pass ? 'text-emerald-400' : 'text-rose-400/80')}>
        {item.pass ? '✓' : '✗'}
      </span>
      <span className="flex-1 min-w-0 font-mono text-[9.5px] text-white/55 truncate">{item.label}</span>
      {principle && <WCAGBadge code={principle.code} color={principle.color} />}
      <span className="hidden font-mono text-[8px] text-white/22 lg:block max-w-[160px] truncate">{item.hint}</span>
      <span className="font-mono text-[9px] text-white/40 shrink-0 max-w-[100px] truncate">{item.value}</span>
      <span className={cn('shrink-0 rounded border px-1.5 py-0.5 font-mono text-[7.5px] uppercase tracking-wider', item.pass ? 'border-emerald-400/20 text-emerald-400' : 'border-rose-400/20 text-rose-400/80')}>
        {item.pass ? 'pass' : 'fail'}
      </span>
    </div>
  )
}

export function AccessibilityTab({ domA11yChecks, a11yChecks, activeA11yChecks }: Props) {
  const allChecks = [...domA11yChecks, ...a11yChecks]
  const totalPass = allChecks.filter((c) => c.pass).length
  const totalFail = allChecks.length - totalPass
  const domPass   = domA11yChecks.filter((c) => c.pass).length
  const cfgPass   = a11yChecks.filter((c) => c.pass).length
  const score     = allChecks.length > 0 ? Math.round((totalPass / allChecks.length) * 100) : 0

  // Focusable count from domA11yChecks
  const focusableCheck = domA11yChecks.find((c) => c.label === 'Focusable elements')
  const focusableCount = focusableCheck ? parseInt(focusableCheck.value, 10) || 0 : 0
  const ariaCheck      = domA11yChecks.find((c) => c.label === 'ARIA roles')
  const ariaCount      = ariaCheck ? parseInt(ariaCheck.value, 10) || 0 : 0
  const liveCheck      = domA11yChecks.find((c) => c.label === 'ARIA live regions')
  const liveCount      = liveCheck ? parseInt(liveCheck.value, 10) || 0 : 0

  // Per-principle pass/fail
  const principleStats = PRINCIPLES.map(({ code, label, color, desc }) => {
    const items = domA11yChecks.filter((c) => WCAG_PRINCIPLE[c.label]?.code === code)
    const pass  = items.filter((c) => c.pass).length
    const pct   = items.length > 0 ? Math.round((pass / items.length) * 100) : 100
    return { code, label, color, desc, pass, total: items.length, pct }
  })

  const failingDom   = domA11yChecks.filter((c) => !c.pass)
  const failingCfg   = activeA11yChecks.filter((c) => !c.pass)
  const totalFailing = failingDom.length + failingCfg.length

  return (
    <div className="space-y-4">

      {/* ── Top header row ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {/* Score ring */}
        <div className="flex flex-col items-center gap-1.5">
          <ScoreRing label={`${totalPass}/${allChecks.length} pass`} score={score} />
          <div className={cn('font-mono text-[8px] uppercase tracking-wider', score >= 90 ? 'text-emerald-400' : score >= 70 ? 'text-amber-400' : 'text-rose-400')}>
            {score >= 90 ? 'excellent' : score >= 70 ? 'needs work' : 'critical'}
          </div>
        </div>

        {/* KPI grid */}
        <div className="flex-1 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: 'Total checks',    value: allChecks.length,  color: 'text-white/60' },
            { label: 'Passing',         value: totalPass,          color: 'text-emerald-400' },
            { label: 'Failing',         value: totalFail,          color: totalFail > 0 ? 'text-rose-400' : 'text-emerald-400' },
            { label: 'Keyboard targets', value: focusableCount,   color: 'text-sky-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl border border-white/6 bg-white/[0.02] px-3 py-2.5 text-center">
              <div className={cn('font-mono text-base font-bold tabular-nums', color)}>{value}</div>
              <div className="mt-0.5 font-mono text-[8px] uppercase tracking-wider text-white/25">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── WCAG 2.1 Principle breakdown ────────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border border-white/8 bg-white/[0.02]">
        <div className="flex items-center gap-2.5 border-b border-white/8 px-4 py-2.5">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
          <span className="flex-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">WCAG 2.1 — Four Principles · live DOM</span>
          <span className="font-mono text-[8px] text-white/20">Perceivable · Operable · Understandable · Robust</span>
        </div>
        <div className="grid grid-cols-2 gap-px bg-white/[0.04] lg:grid-cols-4">
          {principleStats.map(({ code, label, color, desc, pass, total, pct }) => (
            <div key={code} className="bg-[#0d0d0f] p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-md font-mono text-[10px] font-bold"
                  style={{ background: `${color}18`, color }}
                >
                  {code}
                </span>
                <div className="min-w-0">
                  <div className="font-mono text-[9.5px] text-white/65 truncate">{label}</div>
                  <div className="font-mono text-[7.5px] text-white/25 truncate">{desc}</div>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className={cn('font-mono text-[11px] font-bold tabular-nums', pct === 100 ? 'text-emerald-400' : pct >= 70 ? 'text-amber-400' : 'text-rose-400')}>
                    {pct}%
                  </span>
                  <span className="font-mono text-[8px] text-white/30">{pass}/{total}</span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-white/6">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: pct === 100 ? '#34d399' : pct >= 70 ? '#f59e0b' : '#f43f5e' }}
                  />
                </div>
                {total === 0 && <div className="font-mono text-[7.5px] text-white/20">Run analysis to populate</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Dual score row (DOM vs config) ──────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/8 bg-white/[0.015] px-4 py-3 flex items-center gap-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-400/15 bg-emerald-400/8">
            <Eye className="h-4 w-4 text-emerald-400/70" />
          </div>
          <div>
            <div className="font-mono text-[8px] uppercase tracking-wider text-white/25">DOM Audit · live</div>
            <div className="font-mono text-[13px] font-bold text-emerald-400 tabular-nums">{domPass}/{domA11yChecks.length}</div>
            <div className="font-mono text-[8px] text-white/25">checks passing</div>
          </div>
          <div className="ml-auto font-mono text-[11px] font-bold text-white/40">
            {domA11yChecks.length > 0 ? `${Math.round((domPass / domA11yChecks.length) * 100)}%` : '—'}
          </div>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/[0.015] px-4 py-3 flex items-center gap-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-violet-400/15 bg-violet-400/8">
            <Layers className="h-4 w-4 text-violet-400/70" />
          </div>
          <div>
            <div className="font-mono text-[8px] uppercase tracking-wider text-white/25">Config Audit · static</div>
            <div className="font-mono text-[13px] font-bold text-violet-400 tabular-nums">{cfgPass}/{a11yChecks.length}</div>
            <div className="font-mono text-[8px] text-white/25">checks passing</div>
          </div>
          <div className="ml-auto font-mono text-[11px] font-bold text-white/40">
            {a11yChecks.length > 0 ? `${Math.round((cfgPass / a11yChecks.length) * 100)}%` : '—'}
          </div>
        </div>
      </div>

      {/* ── DOM A11y checks with WCAG labels ─────────────────────────────────── */}
      {domA11yChecks.length > 0 && (
        <Card dot="#34d399" title={`DOM A11y audit · ${domPass}/${domA11yChecks.length} passing · live DOM inspection`}>
          <div className="flex items-center gap-2 border-b border-white/6 pb-2 mb-1">
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/8 px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-wider text-emerald-400">live</span>
            <span className="font-mono text-[9px] text-white/30">Results from real DOM — run analysis to refresh</span>
            <span className="ml-auto font-mono text-[7.5px] text-white/20 hidden lg:block">P = Perceivable · O = Operable · U = Understandable · R = Robust</span>
          </div>
          <div className="divide-y divide-white/[0.03]">
            {domA11yChecks.map((item) => <DOMCheckRow key={item.label} item={item} />)}
          </div>
        </Card>
      )}

      {/* ── Keyboard & ARIA stats card ──────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            icon: Keyboard,
            label: 'Keyboard targets',
            value: focusableCount,
            sub: 'focusable elements',
            color: '#38bdf8',
            pass: focusableCount >= 3,
          },
          {
            icon: Code2,
            label: 'ARIA attributes',
            value: ariaCount,
            sub: 'elements with [role]',
            color: '#a78bfa',
            pass: ariaCount >= 2,
          },
          {
            icon: Eye,
            label: 'Live regions',
            value: liveCount,
            sub: 'dynamic announcements',
            color: '#34d399',
            pass: true,
          },
        ].map(({ icon: Icon, label, value, sub, color, pass }) => (
          <div key={label} className="rounded-xl border border-white/6 bg-white/[0.015] px-4 py-3 flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border" style={{ borderColor: `${color}20`, background: `${color}10` }}>
              <Icon className="h-3.5 w-3.5" style={{ color }} />
            </div>
            <div className="min-w-0">
              <div className="font-mono text-[8px] uppercase tracking-wider text-white/25 truncate">{label}</div>
              <div className={cn('font-mono text-[15px] font-bold tabular-nums', pass ? 'text-emerald-400' : 'text-amber-400')}>{value}</div>
              <div className="font-mono text-[7.5px] text-white/20 truncate">{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Config-based checks ──────────────────────────────────────────────── */}
      <Card dot="#818cf8" title={`Accessibility config · ${cfgPass}/${a11yChecks.length} passing · implementation-based`}>
        <div className="divide-y divide-white/5">
          {a11yChecks.map((item) => <AuditRow key={item.label} item={item} />)}
        </div>
      </Card>

      {/* ── Failing items — must fix ──────────────────────────────────────────── */}
      <Card dot="#f43f5e" title={totalFailing > 0 ? `Open issues · ${totalFailing} must fix` : 'Open issues · all clear'}>
        <div className="space-y-2">
          {failingDom.map((item) => {
            const principle = WCAG_PRINCIPLE[item.label]
            return (
              <div key={item.label} className="flex items-start gap-3 rounded-lg border border-rose-400/15 bg-rose-400/4 px-3.5 py-3">
                <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400/70" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-mono text-[10.5px] font-medium text-white/70 truncate">{item.label}</div>
                    {principle && <WCAGBadge code={principle.code} color={principle.color} />}
                  </div>
                  <div className="mt-0.5 font-mono text-[8.5px] text-white/30 leading-relaxed">{item.hint}</div>
                  <div className="mt-1 font-mono text-[8px] text-white/20">Current: {item.value}</div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="font-mono text-[7.5px] uppercase tracking-wider text-rose-400/80">DOM</span>
                </div>
              </div>
            )
          })}
          {failingCfg.map((item) => (
            <div key={item.label} className="flex items-start gap-3 rounded-lg border border-amber-400/15 bg-amber-400/4 px-3.5 py-3">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400/70" />
              <div className="min-w-0 flex-1">
                <div className="font-mono text-[10.5px] font-medium text-white/70 truncate">{item.label}</div>
                <div className="mt-0.5 font-mono text-[8.5px] text-white/30 leading-relaxed">{item.hint}</div>
              </div>
              <span className="font-mono text-[7.5px] uppercase tracking-wider text-amber-400/80 shrink-0">config</span>
            </div>
          ))}
          {totalFailing === 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/6 px-4 py-3 font-mono text-[11px] font-medium text-emerald-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              All accessibility checks pass
            </div>
          )}
        </div>
      </Card>

    </div>
  )
}
