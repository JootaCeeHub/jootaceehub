'use client'

import { Radio, CheckCircle2 } from 'lucide-react'
import { Card, AuditRow } from '../shared-components'
import { CWV_STATIC, RECOMMENDATIONS } from '../constants'
import { rateVital, formatVital, vitalUnit } from '@/lib/analytics/live-metrics'
import type { NavigationMetrics, LongTaskSummary } from '@/lib/analytics/live-metrics'
import type { ResourceSummary } from '@/lib/analytics/resource-timing'
import type { PSIResult } from '@/lib/analytics/pagespeed'
import type { DOMCheck } from '@/lib/analytics/dom-audit'
import type { CWVStatus } from '../types'

const VITAL_NAMES = ['LCP', 'FCP', 'CLS', 'INP', 'TTFB'] as const

interface Props {
  liveVitals: Record<string, number>
  cwvLive: Record<string, number>
  navMetrics: NavigationMetrics | null
  longTasks: LongTaskSummary
  resourceSummary: ResourceSummary | null
  networkFails: { url: string; status: number; ts: string }[]
  bundleSummary: { totalDecodedKB: number; totalTransferKB: number; scriptCount: number; cssCount: number } | null
  psiResult: PSIResult | null
  psiCachedAt: string | null
  isLighthouseLive: boolean
  performanceHints: DOMCheck[]
}

const liveVitalCardCls = (rating: 'good' | 'needs-improvement' | 'poor' | 'pending') => {
  const m = { good: 'border-emerald-400/20 bg-emerald-400/4', 'needs-improvement': 'border-amber-400/20 bg-amber-400/4', poor: 'border-red-400/20 bg-red-400/4', pending: 'border-white/8 bg-white/[0.02]' }
  return `flex flex-col items-center gap-1 rounded-xl border px-3 py-3 ${m[rating]}`
}
const liveVitalValueCls = (rating: 'good' | 'needs-improvement' | 'poor' | 'pending') => {
  const m = { good: 'text-emerald-400', 'needs-improvement': 'text-amber-400', poor: 'text-red-400', pending: 'text-white/20' }
  return `font-mono text-[20px] font-bold tabular-nums leading-none ${m[rating]}`
}
const liveVitalBadgeCls = (rating: 'good' | 'needs-improvement' | 'poor' | 'pending') => {
  const m = { good: 'border-emerald-400/20 text-emerald-400', 'needs-improvement': 'border-amber-400/20 text-amber-400', poor: 'border-red-400/20 text-red-400', pending: 'border-white/10 text-white/20' }
  return `rounded-full border px-2 py-0.5 font-mono text-[7px] uppercase tracking-wider ${m[rating]}`
}
const cwvValueCls = (status: 'good' | 'needs-improvement' | 'poor') =>
  `text-[20px] font-bold leading-none ${status === 'good' ? 'text-emerald-400' : status === 'needs-improvement' ? 'text-amber-400' : 'text-red-400'}`
const cwvStatusBadgeCls = (status: 'good' | 'needs-improvement' | 'poor') =>
  `inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[7.5px] uppercase tracking-wider ${status === 'good' ? 'border border-emerald-400/20 bg-emerald-400/8 text-emerald-400' : status === 'needs-improvement' ? 'border border-amber-400/20 bg-amber-400/8 text-amber-400' : 'border border-red-400/20 bg-red-400/8 text-red-400'}`
const cwvChartBarFillCls = (status: 'good' | 'needs-improvement' | 'poor') =>
  `h-full rounded-full transition-all ${status === 'good' ? 'bg-emerald-400/70' : status === 'needs-improvement' ? 'bg-amber-400/70' : 'bg-red-400/70'}`
const cwvChartValCls = (status: 'good' | 'needs-improvement' | 'poor') =>
  `w-20 shrink-0 font-mono text-[9px] text-right tabular-nums ${status === 'good' ? 'text-emerald-400' : status === 'needs-improvement' ? 'text-amber-400' : 'text-red-400'}`
const budgetBarFillCls = (pct: number) =>
  `h-full rounded-full ${pct > 90 ? 'bg-red-400/70' : pct > 70 ? 'bg-amber-400/70' : 'bg-emerald-400/70'}`
const budgetBadgeCls = (pct: number) =>
  `shrink-0 rounded border px-1.5 py-0.5 font-mono text-[7.5px] uppercase tracking-wider ${pct > 90 ? 'border-red-400/20 text-red-400' : pct > 70 ? 'border-amber-400/20 text-amber-400' : 'border-emerald-400/20 text-emerald-400'}`
const longTaskSummaryValCls = (bad: boolean) =>
  `font-mono text-[22px] font-bold tabular-nums leading-none ${bad ? 'text-red-400' : 'text-emerald-400'}`
const resourceDurationCls = (slow: boolean) =>
  `shrink-0 font-mono text-[9px] tabular-nums w-16 text-right ${slow ? 'text-amber-400' : 'text-white/35'}`
const recItemCls = (priority: string) => {
  const m: Record<string, string> = { high: 'border-red-400/15 bg-red-400/4', medium: 'border-amber-400/15 bg-amber-400/4', low: 'border-emerald-400/10 bg-emerald-400/3' }
  return `flex items-start gap-3 rounded-lg border px-3.5 py-3 ${m[priority] ?? ''}`
}
const recDotCls = (priority: string) => {
  const m: Record<string, string> = { high: 'bg-red-400', medium: 'bg-amber-400', low: 'bg-emerald-400' }
  return `mt-1.5 h-2 w-2 shrink-0 rounded-full ${m[priority] ?? 'bg-white/20'}`
}
const recPriorityCls = (priority: string) => {
  const m: Record<string, string> = { high: 'text-red-400/80', medium: 'text-amber-400/80', low: 'text-emerald-400/80' }
  return `ml-auto shrink-0 font-mono text-[8px] uppercase tracking-wider ${m[priority] ?? 'text-white/30'}`
}

export function PerformanceTab({
  liveVitals, cwvLive, navMetrics, longTasks,
  resourceSummary, networkFails, bundleSummary,
  psiResult, psiCachedAt, isLighthouseLive,
  performanceHints,
}: Props) {
  return (
    <div className="space-y-4">
      <Card dot="#34d399" title="Core Web Vitals · live PerformanceObserver">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {VITAL_NAMES.map((name) => {
            const raw    = liveVitals[name]
            const rating = raw != null ? rateVital(name, raw) : 'pending'
            const display = raw != null ? formatVital(name, raw) : '—'
            const unit   = vitalUnit(name)
            return (
              <div key={name} className={liveVitalCardCls(rating)}>
                <div className="font-mono text-[8px] uppercase tracking-wider text-white/30">{name}</div>
                <div className={liveVitalValueCls(rating)}>{display}</div>
                {unit && <div className="font-mono text-[8px] text-white/20">{unit}</div>}
                <div className={liveVitalBadgeCls(rating)}>
                  {rating === 'pending' ? 'pending' : rating === 'good' ? 'good' : rating === 'needs-improvement' ? 'improve' : 'poor'}
                </div>
                {raw != null && <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />}
              </div>
            )
          })}
        </div>
        {Object.keys(liveVitals).length === 0 && (
          <div className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/[0.015] px-4 py-5 text-[11px] text-white/30" style={{ marginTop: '8px' }}>
            <Radio className="h-4 w-4 shrink-0" />
            Observing in background via PerformanceObserver — values appear automatically as paint, layout, and interaction events fire.
          </div>
        )}
      </Card>

      <Card dot="#fb923c" title={isLighthouseLive ? `Core Web Vitals · PSI live · ${psiResult?.strategy ?? 'mobile'} · ${psiCachedAt ?? ''}` : 'Core Web Vitals · pre-optimization baseline (run PSI for live data)'}>
        <div className="grid grid-cols-3 gap-3">
          {CWV_STATIC.map((m) => {
            const auditId: Record<string, string> = {
              LCP: 'largest-contentful-paint', FCP: 'first-contentful-paint',
              TBT: 'total-blocking-time', CLS: 'cumulative-layout-shift',
              SI:  'speed-index', INP: 'interactive',
            }
            const auditKey    = auditId[m.abbr]
            const liveAudit   = psiResult?.audits[auditKey]
            const liveValue   = liveAudit?.displayValue
            const liveScore   = liveAudit?.score
            const psiStatus: CWVStatus | undefined =
              liveScore == null ? undefined :
              liveScore >= 0.9  ? 'good' :
              liveScore >= 0.5  ? 'needs-improvement' : 'poor'
            const displayValue  = liveValue ? liveValue.replace(/\s*s$/, '').replace(/\s*ms$/, '') : m.value
            const displayUnit   = liveValue ? (liveValue.endsWith(' s') ? 's' : liveValue.includes('ms') ? 'ms' : m.unit) : m.unit
            const displayStatus = psiStatus ?? m.status
            return (
              <div key={m.abbr} className="rounded-xl border border-white/8 bg-black/20 p-3 space-y-1.5">
                <div className="font-mono text-[8.5px] uppercase tracking-wider text-white/30">
                  {m.abbr}
                  {liveValue && <span style={{ color: '#34d399', fontSize: '7px', marginLeft: '3px' }}>● PSI</span>}
                </div>
                <div>
                  <span className={cwvValueCls(displayStatus)}>{displayValue}</span>
                  {displayUnit && <span className="font-mono text-[9px] text-white/25">{displayUnit}</span>}
                </div>
                <span className={cwvStatusBadgeCls(displayStatus)}>
                  {displayStatus === 'good' ? 'Good' : displayStatus === 'needs-improvement' ? 'Improve' : 'Poor'}
                </span>
                <div className="font-mono text-[8px] text-white/15">{m.threshold}</div>
                <div className="font-mono text-[8px] text-white/22 leading-relaxed">{liveValue ? m.name : m.hint}</div>
                {displayStatus !== 'good' && <div className="mt-1 rounded-md border border-white/6 bg-black/30 px-2 py-1.5 font-mono text-[8px] text-white/35 leading-relaxed">Fix: {m.fix}</div>}
              </div>
            )
          })}
        </div>
      </Card>

      <Card dot="#f43f5e" title="Recommendations · performance">
        <div className="space-y-2">
          {RECOMMENDATIONS.filter((r) => r.category === 'performance').map((r) => (
            <div key={r.title} className={recItemCls(r.priority)}>
              <div className={recDotCls(r.priority)} />
              <div>
                <div className="text-[11px] font-medium text-white/70">{r.title}</div>
                <div className="mt-0.5 font-mono text-[9px] text-white/30 leading-relaxed">{r.desc}</div>
                {r.code && <pre className="mt-1.5 overflow-x-auto rounded-md border border-white/6 bg-black/40 px-2.5 py-2 font-mono text-[8.5px] text-emerald-400/70 leading-relaxed whitespace-pre">{r.code}</pre>}
              </div>
              <span className={recPriorityCls(r.priority)}>{r.priority}</span>
            </div>
          ))}
        </div>
      </Card>

      {navMetrics && (
        <Card dot="#38bdf8" title="Navigation timing · live session">
          <div className="grid grid-cols-3 gap-px bg-white/5 p-px lg:grid-cols-6">
            {[
              { label: 'TTFB',            value: navMetrics.ttfb != null ? `${navMetrics.ttfb}ms` : 'N/A' },
              { label: 'FCP',             value: navMetrics.fcp != null ? `${navMetrics.fcp}ms` : 'N/A' },
              { label: 'DOM Interactive', value: navMetrics.domInteractive != null ? `${navMetrics.domInteractive}ms` : 'N/A' },
              { label: 'DOM Complete',    value: navMetrics.domComplete != null ? `${navMetrics.domComplete}ms` : 'N/A' },
              { label: 'JS Heap',         value: navMetrics.jsHeapUsed != null ? `${navMetrics.jsHeapUsed}/${navMetrics.jsHeapTotal}MB` : 'N/A' },
              { label: 'Resources',       value: `${navMetrics.resourceCount}` },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center gap-1 bg-black/30 px-3 py-3">
                <div className="font-mono text-[12px] font-bold text-white/75 tabular-nums">{value}</div>
                <div className="font-mono text-[7.5px] uppercase tracking-wider text-white/30">{label}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card dot="#38bdf8" title={
        isLighthouseLive
          ? `CWV vs thresholds · PSI ${psiResult?.strategy ?? 'mobile'} · ${psiCachedAt ?? ''}`
          : Object.keys(liveVitals).length > 0
            ? 'CWV vs thresholds · live PerformanceObserver (admin page)'
            : 'CWV vs thresholds · no data yet'
      }>
        <div className="space-y-3">
          {([
            { abbr: 'LCP',  goodMs: 2500, poorMs: 4000, unit: 's',  scale: 1000 },
            { abbr: 'FCP',  goodMs: 1800, poorMs: 3000, unit: 's',  scale: 1000 },
            { abbr: 'INP',  goodMs: 200,  poorMs: 500,  unit: 'ms', scale: 1    },
            { abbr: 'CLS',  goodMs: 100,  poorMs: 250,  unit: '',   scale: 1000 },
            { abbr: 'TTFB', goodMs: 800,  poorMs: 1800, unit: 'ms', scale: 1    },
          ] as const).map((m) => {
            const rawMs = cwvLive[m.abbr]
            if (rawMs == null) return null
            const psiAuditId =
              m.abbr === 'LCP'  ? 'largest-contentful-paint' :
              m.abbr === 'FCP'  ? 'first-contentful-paint'   :
              m.abbr === 'CLS'  ? 'cumulative-layout-shift'  :
              m.abbr === 'TTFB' ? 'server-response-time'     : 'interactive'
            const isPsi    = !!(psiResult && !psiResult.error && psiResult.audits[psiAuditId])
            const rating   = rateVital(m.abbr, rawMs) as CWVStatus
            const pct      = Math.min(Math.round((rawMs / m.poorMs) * 100), 100)
            const goodPct  = Math.min(Math.round((m.goodMs / m.poorMs) * 100), 100)
            const display  = m.scale === 1000
              ? (m.abbr === 'CLS' ? (rawMs / 1000).toFixed(3) : `${(rawMs / 1000).toFixed(1)}${m.unit}`)
              : `${Math.round(rawMs)}${m.unit}`
            return (
              <div key={m.abbr} className="flex items-center gap-3">
                <span className="w-9 shrink-0 font-mono text-[9px] font-bold text-white/55">
                  {m.abbr}
                  <span style={{ color: isPsi ? '#34d399' : '#818cf8', fontSize: '7px', marginLeft: '2px' }}>●</span>
                </span>
                <div className="relative flex-1 h-3 overflow-hidden rounded-full bg-white/6">
                  <div className={cwvChartBarFillCls(rating)} style={{ width: `${pct}%` }} />
                  <div className="absolute top-0 h-full w-px bg-white/30" style={{ left: `${goodPct}%` }} />
                </div>
                <span className={cwvChartValCls(rating)}>{display}</span>
              </div>
            )
          })}
        </div>
        <div className="mt-2 font-mono text-[7.5px] text-white/18 text-right">
          {isLighthouseLive
            ? `● green = PSI (landing page) · bar = actual vs poor threshold · line = good threshold · ${psiResult?.url}`
            : Object.keys(cwvLive).length > 0
              ? `● purple = PerformanceObserver (admin page) · ${Object.keys(cwvLive).length}/5 vitals · run PSI for landing-page data`
              : 'No data yet · run PSI or navigate to /en to capture live vitals'}
        </div>
      </Card>

      <Card dot="#f43f5e" title={`Long tasks · admin page · main thread blocking${longTasks.count > 0 ? ` · ${longTasks.count} detected` : ' · none'}`}>
        {longTasks.count === 0 ? (
          <div className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/[0.015] px-4 py-5 text-[11px] text-white/30">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            No long tasks detected — main thread is responsive.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Tasks',   value: longTasks.count,     bad: longTasks.count > 2 },
                { label: 'Total',   value: `${longTasks.totalMs}ms`, bad: longTasks.totalMs > 600 },
                { label: 'Longest', value: `${longTasks.longestMs}ms`, bad: longTasks.longestMs > 200 },
              ].map(({ label, value, bad }) => (
                <div key={label} className="flex flex-col gap-1 rounded-xl border border-white/8 bg-black/20 p-3">
                  <div className={longTaskSummaryValCls(bad)}>{value}</div>
                  <div className="font-mono text-[7.5px] uppercase tracking-wider text-white/30">{label}</div>
                </div>
              ))}
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 mt-3">
              {longTasks.tasks.slice(0, 8).map((t, i) => (
                <div key={i} className="flex items-center gap-2.5 rounded-lg border border-amber-400/10 bg-amber-400/4 px-3 py-2">
                  <span className="shrink-0 font-mono text-[11px] font-bold text-amber-400 tabular-nums w-16">{t.duration}ms</span>
                  <span className="font-mono text-[7.5px] uppercase tracking-wider text-white/30">@{t.startTime}ms</span>
                  {t.culprit && <span className="flex-1 font-mono text-[8.5px] text-white/40 truncate">{t.culprit}</span>}
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      <Card dot="#38bdf8" title={`Resource timing · ${resourceSummary ? `${resourceSummary.entries.length} resources · ${resourceSummary.totalKB}KB decoded` : 'run analysis to load'}`}>
        {resourceSummary == null ? (
          <div className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/[0.015] px-4 py-5 text-[11px] text-white/30">
            <Radio className="h-4 w-4 shrink-0" />
            Click &quot;Run Analysis&quot; to collect live resource timings from window.performance.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'Resources',   value: resourceSummary.entries.length },
                { label: 'Decoded KB',  value: resourceSummary.totalKB },
                { label: 'Transfer KB', value: resourceSummary.transferKB },
                { label: 'Cached',      value: `${Math.round(resourceSummary.cacheRatio * 100)}%` },
                { label: 'Slow (>500ms)', value: resourceSummary.slowCount },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-1 rounded-xl border border-white/8 bg-black/20 p-3">
                  <div className="font-mono text-[12px] font-bold text-white/75 tabular-nums">{value}</div>
                  <div className="font-mono text-[7.5px] uppercase tracking-wider text-white/30">{label}</div>
                </div>
              ))}
            </div>
            {resourceSummary.slowest.length > 0 && (
              <>
                <div className="text-[10px] uppercase tracking-[0.2em] text-white/50" style={{ padding: '8px 0 4px' }}>Slowest resources</div>
                <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                  {resourceSummary.slowest.map((r, i) => (
                    <div key={i} className="flex items-center gap-2.5 rounded-lg border border-white/5 bg-white/[0.01] px-3 py-1.5 hover:border-white/10 transition-colors">
                      <span className="font-mono text-[9px] text-sky-400/80">{r.type}</span>
                      <span className="flex-1 truncate font-mono text-[9px] text-white/60">{r.name}</span>
                      <span className={resourceDurationCls(r.slow)}>{r.duration}ms</span>
                      {r.cached && <span className="shrink-0 rounded border border-emerald-400/20 bg-emerald-400/6 px-1.5 py-0.5 font-mono text-[7px] text-emerald-400">cached</span>}
                    </div>
                  ))}
                </div>
              </>
            )}
            {networkFails.length > 0 && (
              <>
                <div className="text-[10px] uppercase tracking-[0.2em] text-white/50" style={{ padding: '8px 0 4px', color: '#f87171aa' }}>Network failures</div>
                {networkFails.slice(0, 6).map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5 rounded-lg border border-red-400/15 bg-red-400/4 px-3 py-2">
                    <span className="font-mono text-[9px] font-bold text-red-400">{f.status}</span>
                    <span className="flex-1 truncate font-mono text-[9px] text-white/50">{f.url}</span>
                    <span className="font-mono text-[9px] text-white/30">{f.ts.split('T')[1]?.slice(0, 8) ?? ''}</span>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </Card>

      <Card dot="#34d399" title={bundleSummary ? `Bundle budget · live resource data · ${bundleSummary.totalDecodedKB}KB total decoded` : 'Bundle budget · gzip targets'}>
        <div className="space-y-3">
          {(bundleSummary ? [
            { label: 'Total parsed JS',   size: bundleSummary.totalDecodedKB,  budget: 2000, unit: 'KB' },
            { label: 'Transferred (net)', size: bundleSummary.totalTransferKB, budget: 500,  unit: 'KB' },
            { label: 'Script files',      size: bundleSummary.scriptCount,     budget: 30,   unit: ''   },
            { label: 'CSS files',         size: bundleSummary.cssCount,        budget: 10,   unit: ''   },
          ] : [
            { label: 'Total parsed JS',  size: 1474, budget: 2000, unit: 'KB' },
            { label: 'Total gzip JS',    size: 427,  budget: 500,  unit: 'KB' },
            { label: 'Largest JS chunk', size: 580,  budget: 600,  unit: 'KB' },
            { label: 'CSS (all chunks)', size: 52,   budget: 100,  unit: 'KB' },
          ]).map((b) => {
            const pct = Math.min(Math.round((b.size / b.budget) * 100), 100)
            return (
              <div key={b.label} className="flex items-center gap-3">
                <span className="w-36 shrink-0 font-mono text-[9px] text-white/45 truncate">{b.label}</span>
                <div className="flex-1 h-2.5 overflow-hidden rounded-full bg-white/6">
                  <div className={budgetBarFillCls(pct)} style={{ width: `${pct}%` }} />
                </div>
                <span className="w-28 shrink-0 font-mono text-[8.5px] text-right text-white/35 tabular-nums">{b.size}{b.unit ? `/${b.budget} ${b.unit}` : `/${b.budget}`}</span>
                <span className={budgetBadgeCls(pct)}>{pct}%</span>
              </div>
            )
          })}
        </div>
        <div className="flex items-center gap-3 border-t border-white/8 pt-3 mt-3">
          <code className="rounded-md border border-white/10 bg-black/30 px-2.5 py-1.5 font-mono text-[9px] text-emerald-400/70">ANALYZE=true npm run build</code>
          <span className="font-mono text-[9px] text-white/25">Opens interactive chunk treemap</span>
        </div>
      </Card>

      <Card dot="#38bdf8" title={navMetrics ? 'Page load timeline · live navigation timing' : 'Page load timeline · static estimates'}>
        <div className="space-y-2.5">
          {(() => {
            const maxMs = navMetrics?.loadEventEnd ? Math.max(navMetrics.loadEventEnd, 2000) : 5000
            const items = navMetrics ? [
              { label: 'TTFB', ms: navMetrics.ttfb ?? 0,           color: '#38bdf8' },
              { label: 'FCP',  ms: navMetrics.fcp ?? 0,            color: '#34d399' },
              { label: 'DOM',  ms: navMetrics.domInteractive ?? 0, color: '#a78bfa' },
              { label: 'Load', ms: navMetrics.loadEventEnd ?? 0,   color: '#818cf8' },
              ...(liveVitals['LCP'] != null ? [{ label: 'LCP', ms: Math.round(liveVitals['LCP']), color: '#f59e0b' }] : []),
              ...(longTasks.totalMs > 0 ? [{ label: 'TBT', ms: longTasks.totalMs, color: '#f43f5e' }] : []),
            ] : [
              { label: 'TTFB', ms: 18,   color: '#38bdf8' },
              { label: 'FCP',  ms: 1800, color: '#34d399' },
              { label: 'LCP',  ms: 3200, color: '#f59e0b' },
              { label: 'TTI',  ms: 4100, color: '#a78bfa' },
              { label: 'TBT',  ms: 380,  color: '#f43f5e' },
              { label: 'Load', ms: 4800, color: '#818cf8' },
            ]
            return items.filter(m => m.ms > 0).sort((a, b) => a.ms - b.ms).map((m) => {
              const pct = Math.min(Math.round((m.ms / maxMs) * 100), 100)
              return (
                <div key={m.label} className="flex items-center gap-3">
                  <span className="w-10 shrink-0 font-mono text-[9px] font-bold text-white/55">{m.label}</span>
                  <div className="relative flex-1 h-4 overflow-hidden rounded-sm bg-white/5">
                    <div className="absolute left-0 top-0 h-full rounded-sm opacity-80" style={{ width: `${pct}%`, background: m.color + 'aa' }} />
                  </div>
                  <span className="w-14 shrink-0 font-mono text-[9px] text-right text-white/45 tabular-nums">{m.ms}ms</span>
                </div>
              )
            })
          })()}
          <div className="flex items-center justify-between border-t border-white/8 pt-2 mt-1">
            {navMetrics?.loadEventEnd
              ? [0, Math.round(navMetrics.loadEventEnd * 0.25), Math.round(navMetrics.loadEventEnd * 0.5), Math.round(navMetrics.loadEventEnd * 0.75), navMetrics.loadEventEnd].map((ms) => (
                  <span key={ms} className="font-mono text-[7.5px] text-white/18">{ms > 999 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`}</span>
                ))
              : [0, 1000, 2000, 3000, 4000, 5000].map((ms) => (
                  <span key={ms} className="font-mono text-[7.5px] text-white/18">{ms === 0 ? '0' : `${ms / 1000}s`}</span>
                ))
            }
          </div>
        </div>
        {!navMetrics && (
          <div className="font-mono text-[9px] text-white/25" style={{ paddingTop: '6px' }}>
            Static estimates — live values load automatically from Navigation Timing API
          </div>
        )}
      </Card>

      {performanceHints.length > 0 && (
        <Card dot="#a78bfa" title={`Performance Hints · ${performanceHints.filter(c => c.pass).length}/${performanceHints.length} passing · resource hints, lazy loading, SW`}>
          <div className="divide-y divide-white/5">
            {performanceHints.map((check) => (
              <AuditRow key={check.label} item={check} />
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
