'use client'

import { CheckCircle2, Sparkles } from 'lucide-react'
import { Card } from '../shared-components'
import type { AIAnalysisResult } from '@/lib/analytics/scoring'
import type { ProdCheck } from '@/lib/analytics/scoring'
import type { HealthDomain } from '@/lib/analytics/scoring'

interface Props {
  aiAnalysis: AIAnalysisResult
  prodChecks: ProdCheck[]
  healthDomains: HealthDomain[]
}

const aiVerdictCardCls = (level: 'excellent' | 'good' | 'caution' | 'critical') => {
  const m = { excellent: 'border-emerald-400/25 bg-emerald-400/[0.04]', good: 'border-sky-400/25 bg-sky-400/[0.04]', caution: 'border-amber-400/25 bg-amber-400/[0.04]', critical: 'border-red-400/25 bg-red-400/[0.04]' }
  return `flex items-start gap-5 overflow-hidden rounded-xl border px-5 py-4 ${m[level]}`
}
const aiVerdictScoreCls = (level: 'excellent' | 'good' | 'caution' | 'critical') => {
  const m = { excellent: 'text-emerald-400', good: 'text-sky-400', caution: 'text-amber-400', critical: 'text-red-400' }
  return `font-mono text-[52px] font-bold tabular-nums leading-none ${m[level]}`
}
const aiVerdictBadgeCls = (level: 'excellent' | 'good' | 'caution' | 'critical') => {
  const m = { excellent: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-400', good: 'border-sky-400/30 bg-sky-400/10 text-sky-400', caution: 'border-amber-400/30 bg-amber-400/10 text-amber-400', critical: 'border-red-400/30 bg-red-400/10 text-red-400' }
  return `rounded-full border px-2 py-0.5 font-mono text-[7.5px] uppercase tracking-wider ${m[level]}`
}
const aiDimCardCls = (score: number) => {
  const border = score >= 85 ? 'border-emerald-400/15' : score >= 60 ? 'border-amber-400/15' : 'border-red-400/15'
  return `flex flex-col items-center gap-1.5 rounded-xl border ${border} bg-white/[0.02] px-3 py-4`
}
const aiDimScoreValCls = (score: number) =>
  `font-mono text-[28px] font-bold tabular-nums leading-none ${score >= 85 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-red-400'}`
const aiDimBarFillCls = (score: number) =>
  `h-full rounded-full ${score >= 85 ? 'bg-emerald-400/70' : score >= 60 ? 'bg-amber-400/70' : 'bg-red-400/70'}`
const aiQueueItemCls = (impact: 'critical' | 'high' | 'medium' | 'low') => {
  const m = { critical: 'border-red-400/20 bg-red-400/[0.03]', high: 'border-orange-400/18 bg-orange-400/[0.025]', medium: 'border-amber-400/15 bg-amber-400/[0.02]', low: 'border-white/8 bg-white/[0.015]' }
  return `flex items-start gap-3 rounded-xl border px-3.5 py-3 ${m[impact]}`
}
const aiQueueImpactCls = (impact: 'critical' | 'high' | 'medium' | 'low') => {
  const m = { critical: 'text-red-400', high: 'text-orange-400', medium: 'text-amber-400', low: 'text-emerald-400' }
  return `font-mono text-[8px] uppercase tracking-wider ${m[impact]}`
}
const aiQueueEffortCls = (effort: 'low' | 'medium' | 'high') => {
  const m = { low: 'text-emerald-400/55', medium: 'text-amber-400/55', high: 'text-red-400/55' }
  return `font-mono text-[8px] uppercase tracking-wider ${m[effort]}`
}
const aiRiskItemCls = (impact: 'critical' | 'high' | 'medium') => {
  const m = { critical: 'border-red-400/20 bg-red-400/[0.03]', high: 'border-orange-400/18 bg-orange-400/[0.025]', medium: 'border-amber-400/15 bg-white/[0.02]' }
  return `rounded-xl border px-3.5 py-3 space-y-1.5 ${m[impact]}`
}
const aiRiskImpactBadgeCls = (impact: 'critical' | 'high' | 'medium') => {
  const m = { critical: 'border-red-400/30 text-red-400', high: 'border-orange-400/30 text-orange-400', medium: 'border-amber-400/30 text-amber-400' }
  return `rounded border px-1.5 py-0.5 font-mono text-[7.5px] uppercase tracking-wider ${m[impact]}`
}
const aiRiskProbBadgeCls = (prob: 'high' | 'medium' | 'low') => {
  const m = { high: 'text-red-400/65', medium: 'text-amber-400/55', low: 'text-emerald-400/55' }
  return `font-mono text-[8px] ${m[prob]}`
}
const aiRoadmapCompletionCls = (pct: number) =>
  `font-mono text-[11px] font-bold tabular-nums ${pct >= 70 ? 'text-emerald-400' : pct >= 35 ? 'text-amber-400' : 'text-white/28'}`
const aiDnaCardCls = (quality: 'excellent' | 'good' | 'needs-work') => {
  const m = { excellent: 'border-emerald-400/12 bg-emerald-400/[0.025]', good: 'border-white/8 bg-white/[0.02]', 'needs-work': 'border-amber-400/15 bg-amber-400/[0.025]' }
  return `rounded-xl border p-3 space-y-1 ${m[quality]}`
}
const aiDnaQualityBadgeCls = (quality: 'excellent' | 'good' | 'needs-work') => {
  const m = { excellent: 'text-emerald-400/65', good: 'text-sky-400/55', 'needs-work': 'text-amber-400/65' }
  return `font-mono text-[7.5px] ${m[quality]}`
}

export function InsightsTab({ aiAnalysis, prodChecks, healthDomains: _healthDomains }: Props) {
  return (
    <div className="space-y-4">
      <div className={aiVerdictCardCls(aiAnalysis.verdictLevel)}>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-1.5 font-mono text-[8.5px] uppercase tracking-[0.2em] text-white/30">
            <Sparkles className="h-3 w-3" />
            AI Analysis Engine · Computed from live state + metrics · {aiAnalysis.generatedAt}
          </div>
          <p className="font-mono text-[10.5px] leading-relaxed text-white/60">{aiAnalysis.verdictText}</p>
          <div className="font-mono text-[8px] text-white/18 leading-relaxed">
            Análisis determinístico derivado de: prod readiness ({prodChecks.length} checks) · health domains · lighthouse scores · live web vitals · error collector · admin state
          </div>
        </div>
        <div className="shrink-0 flex flex-col items-center gap-1">
          <div className={aiVerdictScoreCls(aiAnalysis.verdictLevel)}>{aiAnalysis.overallScore}</div>
          <div className={aiVerdictBadgeCls(aiAnalysis.verdictLevel)}>{aiAnalysis.verdictLevel}</div>
          <div className="font-mono text-[7.5px] uppercase tracking-wider text-white/20">overall score</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {aiAnalysis.dimensions.map((dim) => (
          <div key={dim.label} className={aiDimCardCls(dim.score)}>
            <div className="text-[15px] opacity-40 leading-none">{dim.icon}</div>
            <div className={aiDimScoreValCls(dim.score)}>{dim.score}</div>
            <div className="font-mono text-[8px] uppercase tracking-[0.14em] text-white/30 text-center leading-snug">{dim.label}</div>
            <div className="font-mono text-[7.5px] text-white/38 text-center leading-snug">{dim.assessment}</div>
            <div className="w-full h-0.5 overflow-hidden rounded-full bg-white/8 mt-1">
              <div className={aiDimBarFillCls(dim.score)} style={{ width: `${dim.score}%` }} />
            </div>
          </div>
        ))}
      </div>

      <Card dot="#f43f5e" title={`Priority Action Queue · ${aiAnalysis.priorityQueue.length} items · ordenados por impacto-esfuerzo`}>
        <div className="space-y-2">
          {aiAnalysis.priorityQueue.map((item) => (
            <div key={item.rank} className={aiQueueItemCls(item.impact)}>
              <div className="shrink-0 flex h-6 w-6 items-center justify-center rounded-lg bg-white/5 font-mono text-[9px] font-bold text-white/35">{item.rank}</div>
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10.5px] font-medium text-white/70">{item.title}</span>
                  <span className={aiQueueImpactCls(item.impact)}>{item.impact}</span>
                  <span className={aiQueueEffortCls(item.effort)}>esfuerzo: {item.effort}</span>
                  <span className="rounded border border-white/10 px-1.5 py-0.5 font-mono text-[7.5px] uppercase tracking-wider text-white/28">{item.domain}</span>
                </div>
                <div className="font-mono text-[9px] leading-relaxed text-white/35">{item.context}</div>
                {item.actionCode && <pre className="mt-1.5 overflow-x-auto rounded-md border border-white/6 bg-black/40 px-2.5 py-2 font-mono text-[8.5px] text-emerald-400/70 leading-relaxed whitespace-pre">{item.actionCode}</pre>}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card dot="#34d399" title={`Fortalezas detectadas · ${aiAnalysis.strengths.length} señales positivas`}>
          <div className="space-y-2.5">
            {aiAnalysis.strengths.map((strength) => (
              <div key={strength.title} className="flex items-start gap-2.5">
                <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-400/60 mt-0.5" />
                <div>
                  <div className="font-mono text-[10px] font-medium text-white/65">{strength.title}</div>
                  <div className="mt-0.5 font-mono text-[8.5px] text-white/28 leading-relaxed">{strength.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card dot="#f43f5e" title={`Riesgos identificados · ${aiAnalysis.risks.length} activos`}>
          <div className="space-y-2">
            {aiAnalysis.risks.map((risk, idx) => (
              <div key={idx} className={aiRiskItemCls(risk.impact)}>
                <div className="flex items-center gap-2">
                  <span className={aiRiskImpactBadgeCls(risk.impact)}>{risk.impact}</span>
                  <span className={aiRiskProbBadgeCls(risk.probability)}>prob {risk.probability}</span>
                </div>
                <div className="font-mono text-[9.5px] text-white/55">{risk.risk}</div>
                <div className="font-mono text-[8.5px] text-white/28 leading-relaxed">→ {risk.mitigation}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card dot="#818cf8" title="AI Roadmap · plan de acción estratégico 30 / 60 / 90 días">
        <div className="grid gap-4 lg:grid-cols-3">
          {aiAnalysis.roadmap.map((phase) => (
            <div key={phase.phase} className="overflow-hidden rounded-xl border border-white/8 bg-white/[0.02]">
              <div className="flex items-center gap-2 border-b px-4 py-2.5" style={{ borderBottomColor: `${phase.color}25` }}>
                <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: phase.color }} />
                <span className="flex-1 font-mono text-[9px] uppercase tracking-[0.18em] text-white/45">{phase.phase}</span>
                <span className={aiRoadmapCompletionCls(phase.completion)}>{phase.completion}%</span>
              </div>
              <div className="px-4 pt-3 pb-1 font-mono text-[8px] uppercase tracking-[0.14em] text-white/22">{phase.focus}</div>
              <div className="mx-4 mb-2 h-0.5 overflow-hidden rounded-full bg-white/6">
                <div className="h-full rounded-full transition-all" style={{ width: `${phase.completion}%`, background: `${phase.color}70` }} />
              </div>
              <ul className="list-none px-4 pb-4 pt-1 space-y-2">
                {phase.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 font-mono text-[9px] text-white/42 leading-snug before:content-['·'] before:shrink-0 before:text-white/18">{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      <Card dot="#a78bfa" title="Project DNA · architecture &amp; stack profile completo">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {aiAnalysis.projectDNA.map((trait) => (
            <div key={trait.trait} className={aiDnaCardCls(trait.quality)}>
              <div className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/22">{trait.trait}</div>
              <div className="font-mono text-[9px] text-white/55 leading-snug">{trait.value}</div>
              <span className={aiDnaQualityBadgeCls(trait.quality)}>
                {trait.quality === 'excellent' ? '✦ excellent' : trait.quality === 'good' ? '✓ good' : '⚠ needs work'}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
