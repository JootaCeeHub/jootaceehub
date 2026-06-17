'use client'

import { CheckCircle2 } from 'lucide-react'
import { Card, ScoreRing } from '../shared-components'
import type { HealthDomain, ProdCheck } from '@/lib/analytics/scoring'
import type { ChangeEntry } from '../types'
import type { PSIResult } from '@/lib/analytics/pagespeed'

interface Props {
  healthDomains: HealthDomain[]
  prodChecks: ProdCheck[]
  prodScore: number
  programScore: number
  totalHealthPasses: number
  totalHealthItems: number
  lighthouseScores: { label: string; score: number }[]
  changeLog: ChangeEntry[]
  psiResult: PSIResult | null
}

const programTabScoreCls = (pct: number) =>
  `font-mono text-[52px] font-bold tabular-nums leading-none ${pct >= 85 ? 'text-emerald-400' : pct >= 60 ? 'text-amber-400' : 'text-red-400'}`
const healthDomainScoreCls = (pct: number) =>
  `font-mono text-[12px] font-bold tabular-nums ${pct >= 85 ? 'text-emerald-400' : pct >= 60 ? 'text-amber-400' : 'text-red-400'}`
const healthDomainBarFillCls = (pct: number) =>
  `h-full rounded-full ${pct >= 85 ? 'bg-emerald-400' : pct >= 60 ? 'bg-amber-400' : 'bg-red-400'}`
const healthItemIconCls = (pass: boolean) =>
  `w-3 shrink-0 font-mono text-[9px] ${pass ? 'text-emerald-400' : 'text-red-400/70'}`
const healthItemBadgeCls = (pass: boolean) =>
  `shrink-0 rounded border px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-wider ${pass ? 'border-emerald-400/20 text-emerald-400' : 'border-red-400/20 text-red-400/70'}`
const prodReadinessBarFillCls = (pct: number) =>
  `h-full rounded-full ${pct >= 90 ? 'bg-emerald-400' : pct >= 70 ? 'bg-amber-400' : 'bg-red-400/80'}`
const prodReadinessScoreCls = (pct: number) =>
  `shrink-0 font-mono text-[13px] font-bold tabular-nums ${pct >= 90 ? 'text-emerald-400' : pct >= 70 ? 'text-amber-400' : 'text-red-400'}`
const prodReadinessIconCls = (pass: boolean) =>
  `w-3 shrink-0 font-mono text-[9px] ${pass ? 'text-emerald-400' : 'text-red-400/70'}`

export function ProgramTab({
  healthDomains, prodChecks, prodScore, programScore,
  totalHealthPasses, totalHealthItems, lighthouseScores,
  changeLog, psiResult,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl border border-violet-400/15 bg-violet-400/4 px-5 py-4">
        <div>
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-violet-400/60">Program Health · Full Audit</div>
          <div className="mt-0.5 text-[14px] font-medium text-white/70">Estado del ecosistema completo</div>
          <div className="mt-0.5 font-mono text-[9px] text-white/30">
            {totalHealthPasses}/{totalHealthItems} checks · avg across {healthDomains.length} domains
          </div>
        </div>
        <div className={programTabScoreCls(programScore)}>{programScore}</div>
      </div>

      <div className="overflow-hidden rounded-xl border border-violet-400/15 bg-violet-400/4">
        <div className="flex items-center gap-2 border-b border-violet-400/12 px-4 py-2.5">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: '#a78bfa' }} />
          <span className="flex-1 font-mono text-[10px] uppercase tracking-[0.2em] text-violet-400/70">Change detection · since last run</span>
        </div>
        {changeLog.length > 0 ? (
          <div className="divide-y divide-white/5">
            {changeLog.map((entry, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2">
                <span className="shrink-0 font-mono text-[8.5px] text-white/25">{entry.timestamp}</span>
                <span className="flex-1 font-mono text-[9.5px] text-white/55">{entry.what}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-3 font-mono text-[9px] text-white/20">No changes detected yet — run analysis twice to compare snapshots</div>
        )}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {healthDomains.map((domain) => (
          <div key={domain.label} className="overflow-hidden rounded-xl border border-white/8 bg-white/[0.015]">
            <div className="flex items-center gap-2.5 border-b border-white/6 px-4 py-2.5">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: domain.color }} />
              <span className="flex-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">{domain.label}</span>
              <div className="h-0.5 w-16 overflow-hidden rounded-full bg-white/8">
                <div className={healthDomainBarFillCls(domain.score)} style={{ width: `${domain.score}%` }} />
              </div>
              <span className={healthDomainScoreCls(domain.score)}>{domain.score}</span>
            </div>
            <div className="divide-y divide-white/5">
              {domain.items.map((item) => (
                <div key={item.label} className="flex items-center gap-3 px-4 py-1.5">
                  <span className={healthItemIconCls(item.pass)}>{item.pass ? '✓' : '✗'}</span>
                  <span className="flex-1 font-mono text-[9px] text-white/50">{item.label}</span>
                  <span className="font-mono text-[8.5px] text-white/30 shrink-0">{item.value}</span>
                  <span className={healthItemBadgeCls(item.pass)}>{item.pass ? 'ok' : 'fix'}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Card dot="#f59e0b" title={`Production readiness · ${prodChecks.filter(c => c.pass).length}/${prodChecks.length} checks · go-live score`}>
        <div className="flex items-center gap-3 border-b border-white/6 px-4 py-3">
          <div className="flex-1 h-2 overflow-hidden rounded-full bg-white/6">
            <div className={prodReadinessBarFillCls(prodScore)} style={{ width: `${prodScore}%` }} />
          </div>
          <span className={prodReadinessScoreCls(prodScore)}>{prodScore}%</span>
        </div>
        <div className="divide-y divide-white/5">
          {prodChecks.map((check) => (
            <div key={check.label} className="flex items-center gap-2.5 px-4 py-2">
              <span className={prodReadinessIconCls(check.pass)}>{check.pass ? '✓' : '✗'}</span>
              <span className="shrink-0 rounded border border-white/10 bg-white/4 px-1.5 py-0.5 font-mono text-[7.5px] uppercase tracking-wider text-white/28">{check.cat}</span>
              <span className="flex-1 min-w-0 font-mono text-[9.5px] text-white/50 truncate">{check.label}</span>
              {!check.pass && <span className="hidden font-mono text-[8px] text-white/22 lg:block shrink-0 max-w-[180px] truncate">{check.hint}</span>}
            </div>
          ))}
        </div>
      </Card>

      {healthDomains.flatMap(d => d.items.filter(i => !i.pass)).length > 0 ? (
        <Card dot="#f43f5e" title={`Quick fixes · ${healthDomains.flatMap(d => d.items.filter(i => !i.pass)).length} items`}>
          <div className="divide-y divide-white/5">
            {healthDomains.flatMap((domain) =>
              domain.items.filter((item) => !item.pass).map((item) => ({
                ...item,
                domainLabel: domain.label,
                domainColor: domain.color,
              }))
            ).map((item) => (
              <div key={`${item.domainLabel}-${item.label}`} className="flex items-center gap-3 px-4 py-2.5">
                <span className="shrink-0 rounded border border-white/12 bg-white/4 px-2 py-0.5 font-mono text-[8px] uppercase tracking-wider text-white/35">{item.domainLabel.split(' ')[0]}</span>
                <span className="flex-1 min-w-0 font-mono text-[10px] text-white/60 truncate">{item.label}</span>
                <span className="shrink-0 font-mono text-[9px] text-white/30">{item.value}</span>
                <span className="hidden font-mono text-[8.5px] text-white/25 lg:block shrink-0 max-w-xs truncate">{item.hint}</span>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/6 px-4 py-3 text-[11px] font-medium text-emerald-400">
          <CheckCircle2 className="h-4 w-4" />
          All {totalHealthItems} health checks pass — program is fully healthy
        </div>
      )}

      <Card dot="#f43f5e" title="Lighthouse scores · cross-reference">
        <div className="grid grid-cols-5 gap-3 lg:grid-cols-6">
          {lighthouseScores.map(({ label, score }) => (
            <ScoreRing key={label} label={label} score={score} />
          ))}
        </div>
        <div className="mt-3 rounded-lg border border-white/6 bg-white/[0.02] px-3 py-2 font-mono text-[9px] text-white/25">
          {psiResult && !psiResult.error
            ? `Live PSI scores · fetched at ${psiResult.fetchedAt.split('T')[1]?.slice(0, 8) ?? ''}`
            : 'Scores from last static export build. Enter a URL above and run PSI to get live scores.'
          }
        </div>
      </Card>
    </div>
  )
}
