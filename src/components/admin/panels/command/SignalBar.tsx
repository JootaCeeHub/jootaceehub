'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'
import { rateVital } from '@/lib/analytics/live-metrics'
import { formatDuration, type SessionMetrics } from '@/lib/analytics/session-metrics'
import type { LongTaskSummary } from '@/lib/analytics/live-metrics'
import type { Alert } from '@/lib/analytics/alerts'
import type { BundleSummary } from '@/lib/analytics/bundle-inspector'

interface AlertCounts { critical: number; warning: number; info: number }

interface Props {
  liveVitals:    Record<string, number>
  longTasks:     LongTaskSummary
  errorCount:    number
  lastRefreshed: string | null
  currentHeap:   number | null
  activeAlerts:  Alert[]
  alertCounts:   AlertCounts
  sessionMetrics: SessionMetrics | null
  bundleSummary:  BundleSummary | null
  onRefresh:     () => void
}

const VITAL_NAMES = ['LCP', 'FCP', 'CLS', 'INP', 'TTFB'] as const

const dot  = (ok: boolean) => `h-1.5 w-1.5 shrink-0 rounded-full ${ok ? 'bg-emerald-400' : 'bg-red-400 animate-pulse'}`
const sep  = 'h-3 w-px shrink-0 bg-white/8'
const item = 'flex items-center gap-1.5'
const lbl  = 'font-mono text-[8.5px] uppercase tracking-[0.14em] text-white/35'
const val  = 'font-mono text-[8.5px] text-white/55'

export function SignalBar({
  liveVitals, longTasks, errorCount, lastRefreshed, currentHeap,
  activeAlerts, alertCounts, sessionMetrics, bundleSummary, onRefresh,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 overflow-hidden rounded-xl border border-cyan-400/15 bg-cyan-400/[0.03] px-4 py-2.5">
      <div className={item}>
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 animate-pulse" />
        <span className={lbl}>Live</span>
        {lastRefreshed && <span className={val}>{lastRefreshed}</span>}
      </div>
      <span className={sep} />

      <div className={item}>
        <span className={dot(errorCount === 0)} />
        <span className={lbl}>Errors</span>
        <span className={val}>{errorCount === 0 ? 'clean' : `${errorCount} active`}</span>
      </div>
      <span className={sep} />

      <div className={item}>
        <span className={dot(Object.keys(liveVitals).length > 0)} />
        <span className={lbl}>Vitals</span>
        <span className={val}>
          {Object.keys(liveVitals).length > 0
            ? VITAL_NAMES.filter(n => liveVitals[n] != null).map(n => {
                const r = rateVital(n, liveVitals[n])
                return `${n}:${r === 'good' ? '✓' : r === 'needs-improvement' ? '~' : '✗'}`
              }).join(' ')
            : 'observing…'}
        </span>
      </div>
      <span className={sep} />

      <div className={item}>
        <span className={dot(longTasks.count === 0)} />
        <span className={lbl}>Main thread</span>
        <span className={val}>
          {longTasks.count === 0
            ? 'clear'
            : `${longTasks.count} long task${longTasks.count > 1 ? 's' : ''} · ${longTasks.totalMs}ms`}
        </span>
      </div>
      <span className={sep} />

      {currentHeap != null && (
        <>
          <div className={item}>
            <span className={dot(currentHeap < 200)} />
            <span className={lbl}>JS Heap</span>
            <span className={val}>{currentHeap}MB</span>
          </div>
          <span className={sep} />
        </>
      )}

      {activeAlerts.length > 0 && (
        <div className={item}>
          <AlertTriangle className="h-2.5 w-2.5 text-amber-400/70" />
          <span className={lbl}>Alerts</span>
          <span className={val} style={{ color: alertCounts.critical > 0 ? '#f87171' : '#fbbf24' }}>
            {alertCounts.critical > 0 ? `${alertCounts.critical} critical` : `${alertCounts.warning} warn`}
          </span>
        </div>
      )}

      {sessionMetrics && (
        <>
          <span className={sep} />
          <div className={item}>
            <span className={dot(true)} />
            <span className={lbl}>Session</span>
            <span className={val}>
              {formatDuration(sessionMetrics.durationMs)} · {sessionMetrics.interactions} events · {sessionMetrics.scrollDepthPct}% scroll
            </span>
          </div>
        </>
      )}

      {bundleSummary && (
        <>
          <span className={sep} />
          <div className={item}>
            <span className={lbl}>Bundle</span>
            <span className={val}>
              {bundleSummary.totalDecodedKB}KB decoded · {bundleSummary.scriptCount} scripts · {Math.round(bundleSummary.cacheRatio * 100)}% cached
            </span>
          </div>
        </>
      )}

      <button
        onClick={onRefresh}
        className="ml-auto inline-flex h-5 w-5 items-center justify-center rounded-md border border-white/8 bg-white/4 text-white/30 transition-all hover:text-white/60 hover:bg-white/8"
        title="Refresh live data"
      >
        <RefreshCw className="h-2.5 w-2.5" />
      </button>
    </div>
  )
}
