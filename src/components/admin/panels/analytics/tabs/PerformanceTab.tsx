'use client'

import { useEffect, useState } from 'react'
import { Radio, CheckCircle2, Wifi } from 'lucide-react'
import { Card, AuditRow } from '../shared-components'
import { CWV_STATIC, RECOMMENDATIONS } from '../constants'
import { rateVital, formatVital, vitalUnit, computePerformanceScore } from '@/lib/analytics/live-metrics'
import type { NavigationMetrics, LongTaskSummary, PerformanceScore } from '@/lib/analytics/live-metrics'
import type { ResourceSummary } from '@/lib/analytics/resource-timing'
import type { PSIResult } from '@/lib/analytics/pagespeed'
import type { DOMCheck } from '@/lib/analytics/dom-audit'
import type { CWVStatus } from '../types'
import { getRUMSamples } from '@/lib/performance/rum'
import type { RUMSample } from '@/lib/performance/rum'
import { getSectionPerfEntries, clearSectionPerf } from '@/lib/performance/section-tracker'
import type { SectionPerfEntry } from '@/lib/performance/section-tracker'
import { cn } from '@/lib/utils'

// ─── RUM live card ────────────────────────────────────────────────────────────

const RUM_RATING_CLS: Record<RUMSample['rating'], string> = {
  'good':              'text-emerald-400',
  'needs-improvement': 'text-amber-400',
  'poor':              'text-rose-400',
}

function RUMLiveCard() {
  const [samples, setSamples] = useState<RUMSample[]>([])

  useEffect(() => {
    const refresh = () => setSamples([...getRUMSamples()])
    refresh()
    const id = setInterval(refresh, 3000)
    return () => clearInterval(id)
  }, [])

  const latestByName = (['LCP', 'FCP', 'CLS', 'INP', 'TTFB'] as const).map(name => {
    const all = samples.filter(s => s.name === name)
    return { name, sample: all[all.length - 1] ?? null }
  })

  const hasData = samples.length > 0

  return (
    <Card dot="#f43f5e" title={`RUM — Real User Monitoring · ${hasData ? `${samples.length} samples` : 'waiting for data…'}`}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {latestByName.map(({ name, sample }) => {
          const rating = sample?.rating ?? 'pending'
          const displayVal = sample
            ? name === 'CLS'
              ? (sample.value / 1000).toFixed(3)
              : name === 'TTFB' || name === 'INP'
              ? `${Math.round(sample.value)}`
              : (sample.value / 1000).toFixed(1)
            : '—'
          const unit = name === 'CLS' ? '' : name === 'TTFB' || name === 'INP' ? 'ms' : 's'

          return (
            <div key={name} className={cn('flex flex-col items-center gap-1 rounded-xl border px-3 py-3',
              rating === 'good' ? 'border-emerald-400/20 bg-emerald-400/4'
              : rating === 'needs-improvement' ? 'border-amber-400/20 bg-amber-400/4'
              : rating === 'poor' ? 'border-rose-400/20 bg-rose-400/4'
              : 'border-white/8 bg-white/[0.02]',
            )}>
              <div className="font-mono text-[8px] uppercase tracking-wider text-white/30">{name} <span className="text-rose-400/50">RUM</span></div>
              <div className={cn('font-mono text-[20px] font-bold tabular-nums leading-none', sample ? RUM_RATING_CLS[rating] : 'text-white/15')}>
                {displayVal}
              </div>
              {unit && <div className="font-mono text-[8px] text-white/20">{unit}</div>}
              {sample && (
                <span className={cn('rounded-full border px-2 py-0.5 font-mono text-[7px] uppercase tracking-wider',
                  rating === 'good' ? 'border-emerald-400/20 text-emerald-400'
                  : rating === 'needs-improvement' ? 'border-amber-400/20 text-amber-400'
                  : 'border-rose-400/20 text-rose-400',
                )}>
                  {rating === 'good' ? 'good' : rating === 'needs-improvement' ? 'improve' : 'poor'}
                </span>
              )}
            </div>
          )
        })}
      </div>
      {!hasData && (
        <div className="flex items-center gap-3 mt-2 rounded-xl border border-white/6 bg-white/[0.015] px-4 py-4 text-[10px] text-white/25">
          <Wifi className="h-3.5 w-3.5 shrink-0 text-rose-400/40" />
          Navigate public pages to collect RUM vitals. Plausible &quot;Web Vital&quot; events fire automatically when NEXT_PUBLIC_PLAUSIBLE_DOMAIN is set.
        </div>
      )}
    </Card>
  )
}

// ─── Performance Score card ───────────────────────────────────────────────────

const GRADE_COLOR: Record<PerformanceScore['grade'], string> = {
  A: '#34d399', B: '#86efac', C: '#fbbf24', D: '#fb923c', F: '#f43f5e',
}

function PerformanceScoreCard({ score }: { score: PerformanceScore }) {
  if (!score.hasData) return null
  const color    = GRADE_COLOR[score.grade]
  const circumf  = 2 * Math.PI * 38  // r=38
  const dash     = (score.total / 100) * circumf
  const dims: Array<{ label: string; score: number | null; weight: string }> = [
    { label: 'Core Web Vitals', score: score.cwv,        weight: '40%' },
    { label: 'Threading',       score: score.threading,  weight: '20%' },
    { label: 'Navigation TTFB', score: score.navigation, weight: '15%' },
    { label: 'Resources',       score: score.resources,  weight: '15%' },
    { label: 'Memory',          score: score.memory,     weight: '10%' },
  ]
  return (
    <Card dot={color} title="Performance Score · composite live measurement">
      <div className="flex items-center gap-6">
        {/* Ring gauge */}
        <div className="relative shrink-0 flex items-center justify-center" style={{ width: 96, height: 96 }}>
          <svg width={96} height={96} viewBox="0 0 96 96" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={48} cy={48} r={38} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
            <circle
              cx={48} cy={48} r={38} fill="none"
              stroke={color} strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumf}`}
              style={{ transition: 'stroke-dasharray 0.8s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-[26px] font-bold leading-none tabular-nums" style={{ color }}>{score.total}</span>
            <span className="font-mono text-[10px] font-bold mt-0.5" style={{ color }}>{score.grade}</span>
          </div>
        </div>
        {/* Dimension bars */}
        <div className="flex-1 space-y-2">
          {dims.map(({ label, score: dimScore, weight }) => {
            if (dimScore === null) return null
            const pct  = dimScore
            const fill = pct >= 75 ? '#34d399' : pct >= 50 ? '#fbbf24' : '#f43f5e'
            return (
              <div key={label} className="flex items-center gap-2.5">
                <span className="w-32 shrink-0 font-mono text-[8.5px] text-white/45 truncate">{label}</span>
                <div className="flex-1 h-2 overflow-hidden rounded-full bg-white/6">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: fill }} />
                </div>
                <span className="w-8 shrink-0 font-mono text-[8.5px] tabular-nums text-right" style={{ color: fill }}>{pct}</span>
                <span className="w-7 shrink-0 font-mono text-[7.5px] text-white/18 text-right">{weight}</span>
              </div>
            )
          })}
        </div>
      </div>
      <div className="mt-3 font-mono text-[7.5px] text-white/20 text-right">
        live browser data · no PSI required · updates on Run Analysis
      </div>
    </Card>
  )
}

// ─── Frame rate card ──────────────────────────────────────────────────────────

function FrameRateCard() {
  const [fps, setFps]           = useState<number | null>(null)
  const [jankFrames, setJank]   = useState(0)
  const [history, setHistory]   = useState<number[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return
    let frameCount = 0
    let jankCount  = 0
    let start      = performance.now()
    let lastFrame  = performance.now()
    let rafId: number

    const tick = (now: number) => {
      const delta = now - lastFrame
      lastFrame   = now
      frameCount++
      if (delta > 33.3) jankCount++           // >33ms gap = below 30fps

      if (now - start >= 1000) {
        const cur = Math.min(Math.round((frameCount * 1000) / (now - start)), 120)
        setFps(cur)
        setJank(jankCount)
        setHistory(prev => [...prev, cur].slice(-20))
        frameCount = 0
        jankCount  = 0
        start      = now
      }

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [])

  if (fps === null) return null

  const smooth   = fps >= 55
  const moderate = fps >= 30 && fps < 55
  const color    = smooth ? '#34d399' : moderate ? '#f59e0b' : '#f43f5e'
  const label    = smooth ? 'smooth' : moderate ? 'moderate' : 'janky'
  const circumf  = 2 * Math.PI * 32
  const dash     = (Math.min(fps, 60) / 60) * circumf
  const maxH     = Math.max(...history, 1)

  return (
    <Card dot={color} title={`Animation frame rate · live RAF monitor · ${label} · ${fps} fps`}>
      <div className="flex items-start gap-6">
        {/* Ring gauge */}
        <div className="relative shrink-0 flex items-center justify-center" style={{ width: 80, height: 80 }}>
          <svg width={80} height={80} viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={40} cy={40} r={32} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
            <circle cx={40} cy={40} r={32} fill="none" stroke={color} strokeWidth={6}
              strokeLinecap="round" strokeDasharray={`${dash} ${circumf}`}
              style={{ transition: 'stroke-dasharray 0.8s ease' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-[17px] font-bold tabular-nums leading-none" style={{ color }}>{fps}</span>
            <span className="font-mono text-[7px] uppercase mt-0.5 text-white/25">fps</span>
          </div>
        </div>
        {/* Info + bar history */}
        <div className="flex-1 space-y-2">
          <div className="grid grid-cols-3 gap-2">
            {([
              { label: 'Current',      value: `${fps} fps`,       col: color },
              { label: 'Jank frames',  value: String(jankFrames), col: jankFrames === 0 ? '#34d399' : '#f43f5e' },
              { label: 'Target',       value: '60 fps',           col: 'rgba(255,255,255,0.25)' },
            ] as Array<{ label: string; value: string; col: string }>).map(({ label: l, value, col }) => (
              <div key={l}>
                <div className="font-mono text-[11px] font-bold tabular-nums" style={{ color: col }}>{value}</div>
                <div className="font-mono text-[7.5px] uppercase tracking-wider text-white/30">{l}</div>
              </div>
            ))}
          </div>
          {history.length >= 3 && (
            <div className="flex items-end gap-px overflow-hidden rounded-lg bg-white/[0.03] p-2" style={{ height: 32 }}>
              {history.map((f, i) => {
                const h  = Math.max(2, (f / maxH) * 100)
                const fc = f >= 55 ? '#34d399' : f >= 30 ? '#f59e0b' : '#f43f5e'
                return <div key={i} className="flex-1 rounded-t-sm transition-all duration-300" style={{ height: `${h}%`, background: fc, opacity: 0.7 }} />
              })}
            </div>
          )}
          {jankFrames > 2 && (
            <div className="flex items-center gap-2 rounded-lg border border-rose-400/20 bg-rose-400/4 px-3 py-1.5">
              <span className="font-mono text-[9px] text-rose-400">{jankFrames} jank frames — long tasks or heavy animations blocking render thread</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

// ─── Network quality card ─────────────────────────────────────────────────────

interface NetworkInfo {
  effectiveType: string
  downlink: number
  rtt: number
  saveData: boolean
}

function NetworkQualityCard() {
  const [net, setNet] = useState<NetworkInfo | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const conn = (navigator as unknown as { connection?: NetworkInformation }).connection
    if (!conn) return

    interface NetworkInformation extends EventTarget {
      effectiveType?: string
      downlink?: number
      rtt?: number
      saveData?: boolean
    }

    const read = () => setNet({
      effectiveType: conn.effectiveType ?? 'unknown',
      downlink:      conn.downlink      ?? 0,
      rtt:           conn.rtt           ?? 0,
      saveData:      conn.saveData      ?? false,
    })
    read()
    conn.addEventListener('change', read)
    return () => conn.removeEventListener('change', read)
  }, [])

  if (!net) return null

  const qualityColor =
    net.effectiveType === '4g' ? '#34d399' :
    net.effectiveType === '3g' ? '#fbbf24' : '#f43f5e'

  return (
    <Card dot={qualityColor} title="Network quality · navigator.connection (live)">
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Type',      value: net.effectiveType.toUpperCase(), color: qualityColor },
          { label: 'Downlink',  value: `${net.downlink} Mbps`,          color: 'white'      },
          { label: 'RTT',       value: `${net.rtt}ms`,                  color: net.rtt > 100 ? '#fbbf24' : '#34d399' },
          { label: 'Data Saver',value: net.saveData ? 'ON' : 'OFF',     color: net.saveData ? '#f43f5e' : '#34d399'  },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex flex-col gap-1 rounded-xl border border-white/8 bg-black/20 p-3">
            <div className="font-mono text-[13px] font-bold tabular-nums leading-none" style={{ color: color === 'white' ? 'rgba(255,255,255,0.75)' : color }}>{value}</div>
            <div className="font-mono text-[7.5px] uppercase tracking-wider text-white/30">{label}</div>
          </div>
        ))}
      </div>
      {net.saveData && (
        <div className="mt-2 rounded-lg border border-rose-400/15 bg-rose-400/4 px-3 py-2 font-mono text-[9px] text-rose-400/70">
          Data Saver active — defer non-critical assets and compress aggressively
        </div>
      )}
    </Card>
  )
}

// ─── Memory Pressure card ─────────────────────────────────────────────────────

interface HeapInfo { used: number; total: number; limit: number }

function MemoryPressureCard() {
  const [heap, setHeap] = useState<HeapInfo | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mem = (performance as unknown as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory
    if (!mem) return
    const refresh = () => setHeap({
      used:  Math.round(mem.usedJSHeapSize  / 1048576),
      total: Math.round(mem.totalJSHeapSize / 1048576),
      limit: Math.round(mem.jsHeapSizeLimit / 1048576),
    })
    refresh()
    const id = setInterval(refresh, 5000)
    return () => clearInterval(id)
  }, [])

  if (!heap) return null

  const usedPct  = Math.round((heap.used  / heap.limit) * 100)
  const totalPct = Math.round((heap.total / heap.limit) * 100)
  const pressure: 'low' | 'medium' | 'high' = usedPct < 50 ? 'low' : usedPct < 75 ? 'medium' : 'high'
  const pressureColor = pressure === 'low' ? '#34d399' : pressure === 'medium' ? '#f59e0b' : '#f43f5e'
  const circumf = 2 * Math.PI * 32
  const dash    = (usedPct / 100) * circumf

  return (
    <Card dot={pressureColor} title={`JS Heap · memory pressure · ${pressure} · updates every 5s`}>
      <div className="flex items-center gap-6">
        <div className="relative shrink-0 flex items-center justify-center" style={{ width: 80, height: 80 }}>
          <svg width={80} height={80} viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={40} cy={40} r={32} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
            <circle cx={40} cy={40} r={32} fill="none" stroke={pressureColor} strokeWidth={6}
              strokeLinecap="round" strokeDasharray={`${dash} ${circumf}`}
              style={{ transition: 'stroke-dasharray 1s ease' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-[17px] font-bold tabular-nums leading-none" style={{ color: pressureColor }}>{usedPct}%</span>
            <span className="font-mono text-[7px] uppercase mt-0.5 text-white/25">used</span>
          </div>
        </div>
        <div className="flex-1 space-y-2.5">
          {[
            { label: 'Used heap',    mb: heap.used,  pct: usedPct,  color: pressureColor },
            { label: 'Allocated',   mb: heap.total, pct: totalPct, color: '#818cf8' },
          ].map(({ label, mb, pct, color }) => (
            <div key={label} className="flex items-center gap-2.5">
              <span className="w-24 shrink-0 font-mono text-[8.5px] text-white/40">{label}</span>
              <div className="flex-1 h-2 overflow-hidden rounded-full bg-white/6">
                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: color + '80' }} />
              </div>
              <span className="w-12 shrink-0 font-mono text-[8.5px] text-right tabular-nums" style={{ color }}>{mb} MB</span>
              <span className="w-10 shrink-0 font-mono text-[7.5px] text-right text-white/22">{pct}%</span>
            </div>
          ))}
          <div className="font-mono text-[7.5px] text-white/20">
            Limit {heap.limit} MB · Chrome only (performance.memory) · refreshes every 5s
          </div>
        </div>
      </div>
      {pressure === 'high' && (
        <div className="mt-2 rounded-lg border border-red-400/20 bg-red-400/6 px-3 py-2 font-mono text-[8.5px] text-red-400/70">
          High memory pressure ({heap.used} / {heap.limit} MB) — check for event listener leaks or large retained object trees
        </div>
      )}
    </Card>
  )
}

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

// ─── Section Profiler Card ─────────────────────────────────────────────────────
// Reads localStorage data written by SectionPerfWrapper on the public landing page.
// Sections are: hero, systems, labs, infrastructure, journal, collaborate.

const STATUS_COLOR: Record<SectionPerfEntry['status'], string> = {
  'good':              'text-emerald-400',
  'needs-improvement': 'text-amber-400',
  'poor':              'text-rose-400',
}
const STATUS_BAR_COLOR: Record<SectionPerfEntry['status'], string> = {
  'good':              '#34d399aa',
  'needs-improvement': '#f59e0baa',
  'poor':              '#f43f5eaa',
}
const STATUS_BADGE: Record<SectionPerfEntry['status'], string> = {
  'good':              'border-emerald-400/20 text-emerald-400 bg-emerald-400/5',
  'needs-improvement': 'border-amber-400/20 text-amber-400 bg-amber-400/5',
  'poor':              'border-rose-400/20 text-rose-400 bg-rose-400/5',
}

function SectionProfilerCard() {
  const [entries, setEntries]   = useState<SectionPerfEntry[]>([])
  const [cleared, setCleared]   = useState(false)

  useEffect(() => {
    const refresh = () => setEntries(getSectionPerfEntries())
    refresh()
    const id = setInterval(refresh, 3000)
    return () => clearInterval(id)
  }, [])

  const maxMs      = entries.length ? Math.max(...entries.map(e => e.visibleMs ?? e.renderMs)) : 5000
  const capturedAt = entries[0]?.capturedAt
    ? new Date(entries[0].capturedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null
  const url = entries[0]?.url ?? null
  const good = entries.filter(e => e.status === 'good').length
  const poor = entries.filter(e => e.status === 'poor').length

  function handleClear() {
    clearSectionPerf()
    setEntries([])
    setCleared(true)
    setTimeout(() => setCleared(false), 2000)
  }

  if (entries.length === 0) {
    return (
      <Card dot="#818cf8" title="Section Profiler · per-panel render timeline · no data yet">
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <div className="text-[9px] font-mono text-white/30 leading-relaxed max-w-xs">
            Navigate to{' '}
            <code className="rounded border border-white/10 bg-black/30 px-1.5 py-0.5 text-indigo-300/70">/en/</code>
            {' '}or{' '}
            <code className="rounded border border-white/10 bg-black/30 px-1.5 py-0.5 text-indigo-300/70">/es/</code>
            {' '}and scroll through each section. Metrics are recorded per-section and shown here automatically.
          </div>
          {cleared && (
            <span className="font-mono text-[9px] text-emerald-400">Data cleared</span>
          )}
        </div>
      </Card>
    )
  }

  return (
    <Card
      dot="#818cf8"
      title={`Section Profiler · ${entries.length} sections · ${good} good${poor > 0 ? ` · ${poor} poor` : ''}`}
    >
      {/* Source info */}
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-1.5 text-[8.5px] font-mono text-white/30">
          <span>Captured from</span>
          <code className="rounded border border-white/8 bg-black/20 px-1.5 py-0.5 text-indigo-300/60">{url}</code>
          {capturedAt && <><span>at</span><span className="text-white/40">{capturedAt}</span></>}
        </div>
        <button
          onClick={handleClear}
          className="ml-auto font-mono text-[8px] text-white/20 hover:text-rose-400/60 transition-colors px-2 py-1 rounded border border-white/5 hover:border-rose-400/20"
        >
          {cleared ? 'cleared' : 'clear'}
        </button>
      </div>

      {/* Flame chart */}
      <div className="space-y-2.5 mb-4">
        {entries.map((e) => {
          const ms       = e.visibleMs ?? e.renderMs
          const barPct   = Math.min(Math.round((ms / maxMs) * 100), 100)
          const renderPct = Math.min(Math.round((e.renderMs / maxMs) * 100), 100)
          const label    = ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms}ms`
          return (
            <div key={e.name} className="group flex items-center gap-3">
              {/* Section name */}
              <span className="w-24 shrink-0 font-mono text-[9px] font-semibold capitalize text-white/55 group-hover:text-white/80 transition-colors">
                {e.name}
              </span>

              {/* Timeline bar */}
              <div className="relative flex-1 h-5 overflow-hidden rounded bg-white/[0.03] border border-white/5">
                {/* render time marker */}
                <div
                  className="absolute top-0 h-full opacity-30 rounded"
                  style={{ width: `${renderPct}%`, background: STATUS_BAR_COLOR[e.status] }}
                />
                {/* visible time fill */}
                {e.visibleMs != null && (
                  <div
                    className="absolute top-0 h-full opacity-70 rounded"
                    style={{ width: `${barPct}%`, background: STATUS_BAR_COLOR[e.status] }}
                  />
                )}
                {/* label inside bar */}
                <span className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[8px] text-white/50 tabular-nums">
                  {e.visibleMs != null ? (
                    <>{label} <span className="text-white/25">vis</span></>
                  ) : (
                    <>{label} <span className="text-white/25">rend</span></>
                  )}
                </span>
              </div>

              {/* Status badge */}
              <span className={cn(
                'shrink-0 rounded-full border px-2 py-0.5 font-mono text-[7.5px] uppercase tracking-wider',
                STATUS_BADGE[e.status],
              )}>
                {e.status === 'needs-improvement' ? 'improve' : e.status}
              </span>
            </div>
          )
        })}
      </div>

      {/* Detail table */}
      <div className="rounded-lg border border-white/5 bg-black/20 overflow-hidden">
        <table className="w-full text-[8.5px] font-mono">
          <thead>
            <tr className="border-b border-white/5 text-white/25 uppercase tracking-wider text-left">
              <th className="px-3 py-2">Section</th>
              <th className="px-3 py-2 text-right">Render</th>
              <th className="px-3 py-2 text-right">Visible</th>
              <th className="px-3 py-2 text-right">Budget</th>
              <th className="px-3 py-2 text-right">FCP</th>
              <th className="px-3 py-2 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {entries.map((e) => (
              <tr key={e.name} className="hover:bg-white/[0.015] transition-colors">
                <td className="px-3 py-1.5 font-semibold capitalize text-white/60">{e.name}</td>
                <td className="px-3 py-1.5 text-right tabular-nums text-white/40">
                  {e.renderMs >= 1000 ? `${(e.renderMs / 1000).toFixed(2)}s` : `${e.renderMs}ms`}
                </td>
                <td className={cn('px-3 py-1.5 text-right tabular-nums', e.visibleMs != null ? STATUS_COLOR[e.status] : 'text-white/20')}>
                  {e.visibleMs != null
                    ? e.visibleMs >= 1000 ? `${(e.visibleMs / 1000).toFixed(2)}s` : `${e.visibleMs}ms`
                    : '—'}
                </td>
                <td className="px-3 py-1.5 text-right tabular-nums text-white/25">
                  {e.budget >= 1000 ? `${(e.budget / 1000).toFixed(1)}s` : `${e.budget}ms`}
                </td>
                <td className="px-3 py-1.5 text-right tabular-nums text-white/30">
                  {e.fcp != null ? `${e.fcp}ms` : '—'}
                </td>
                <td className={cn('px-3 py-1.5 text-right font-semibold', STATUS_COLOR[e.status])}>
                  {e.status === 'good' ? '✓' : e.status === 'poor' ? '✗' : '~'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 font-mono text-[8px] text-white/20 leading-relaxed">
        <span className="text-white/30">Render</span> = ms since nav start when component mounted.{' '}
        <span className="text-white/30">Visible</span> = ms when 10% of section crossed viewport.{' '}
        Budget thresholds: hero 2.5s · systems 3.5s · labs 4s · infra 4.5s · journal 5s.
      </div>
    </Card>
  )
}

export function PerformanceTab({
  liveVitals, cwvLive, navMetrics, longTasks,
  resourceSummary, networkFails, bundleSummary,
  psiResult, psiCachedAt, isLighthouseLive,
  performanceHints,
}: Props) {
  const perfScore = computePerformanceScore(liveVitals, longTasks, navMetrics, resourceSummary)

  return (
    <div className="space-y-4">
      {/* Composite live performance score */}
      <PerformanceScoreCard score={perfScore} />
      {/* JS heap memory pressure — Chrome only */}
      <MemoryPressureCard />
      {/* Animation frame rate — RAF-based jank detection */}
      <FrameRateCard />
      {/* Network quality from navigator.connection */}
      <NetworkQualityCard />
      {/* RUM — Real User Monitoring data from public pages */}
      <RUMLiveCard />

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

      {resourceSummary && Object.keys(resourceSummary.byType).length > 0 && (
        <Card dot="#a78bfa" title="Resource type breakdown · decoded KB + avg load time">
          <div className="space-y-2">
            {(() => {
              const entries = Object.entries(resourceSummary.byType).sort((a, b) => b[1].kb - a[1].kb)
              const maxKB = Math.max(...entries.map(([, s]) => s.kb), 1)
              const typeColor: Record<string, string> = {
                script: '#38bdf8', link: '#a78bfa', img: '#34d399', font: '#f59e0b', other: 'rgba(255,255,255,0.25)',
              }
              return entries.map(([type, stats]) => {
                const pct = Math.round((stats.kb / maxKB) * 100)
                const color = typeColor[type] ?? 'rgba(255,255,255,0.25)'
                return (
                  <div key={type} className="flex items-center gap-3">
                    <span className="w-16 shrink-0 font-mono text-[8.5px] uppercase text-white/45">{type}</span>
                    <div className="flex-1 h-2 overflow-hidden rounded-full bg-white/6">
                      <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(pct, 2)}%`, background: color + '80' }} />
                    </div>
                    <span className="w-14 shrink-0 font-mono text-[8.5px] text-right tabular-nums text-white/50">{stats.kb} KB</span>
                    <span className="w-10 shrink-0 font-mono text-[7.5px] text-right tabular-nums text-white/30">{stats.count}×</span>
                    <span className="w-16 shrink-0 font-mono text-[7.5px] text-right tabular-nums text-white/22">~{stats.avgMs}ms</span>
                  </div>
                )
              })
            })()}
          </div>
          <div className="mt-2 font-mono text-[7.5px] text-white/18 text-right">
            script · link (CSS) · img · font · other — decoded size from Performance API
          </div>
        </Card>
      )}

      {resourceSummary && resourceSummary.entries.length >= 3 && (() => {
        const filtered = resourceSummary.entries.filter((e) => e.duration > 10).sort((a, b) => a.startTime - b.startTime).slice(0, 30)
        if (filtered.length < 2) return null
        const maxEnd = Math.max(...filtered.map((e) => e.startTime + e.duration), 1)
        const typeColor: Record<string, string> = {
          script: '#38bdf8', link: '#a78bfa', img: '#34d399', font: '#f59e0b', other: 'rgba(255,255,255,0.35)',
        }
        return (
          <Card dot="#818cf8" title={`Resource waterfall · ${filtered.length} resources · sorted by start time`}>
            <div className="space-y-0.5 max-h-72 overflow-y-auto pr-1">
              {filtered.map((r, i) => {
                const startPct = Math.round((r.startTime / maxEnd) * 100)
                const widthPct = Math.max(Math.round((r.duration / maxEnd) * 100), 1)
                const color = r.slow ? '#f43f5e' : r.cached ? '#34d399' : (typeColor[r.type] ?? '#818cf8')
                return (
                  <div key={i} className="flex items-center gap-2 py-0.5">
                    <span className="w-28 shrink-0 truncate font-mono text-[7.5px] text-white/30">{r.name}</span>
                    <div className="relative flex-1 h-3 bg-white/[0.02] rounded-sm overflow-hidden">
                      <div
                        className="absolute top-0 h-full rounded-sm"
                        style={{ left: `${startPct}%`, width: `${widthPct}%`, background: color + '60' }}
                      />
                    </div>
                    <span className="w-16 shrink-0 text-right font-mono text-[7.5px] tabular-nums text-white/30">{r.duration}ms</span>
                  </div>
                )
              })}
            </div>
            <div className="mt-2 font-mono text-[7.5px] text-white/18">
              red = slow (&gt;500ms) · green = cached · bar width = duration · bar offset = start time · max end {Math.round(maxEnd)}ms
            </div>
          </Card>
        )
      })()}

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

      <SectionProfilerCard />
    </div>
  )
}
