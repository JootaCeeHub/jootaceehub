'use client'

import { Radio } from 'lucide-react'
import { useAdmin } from '@/lib/admin/store'
import { rateVital, formatVital, vitalUnit } from '@/lib/analytics/live-metrics'
import type { NavigationMetrics, LongTaskSummary } from '@/lib/analytics/live-metrics'

const VITAL_NAMES = ['LCP', 'FCP', 'CLS', 'INP', 'TTFB'] as const

function ratingColor(r: string) {
  if (r === 'good') return 'text-emerald-400'
  if (r === 'needs-improvement') return 'text-amber-400'
  if (r === 'poor') return 'text-red-400'
  return 'text-white/25'
}
function ratingBg(r: string) {
  return r === 'poor' ? 'bg-red-400/[0.04]' : 'bg-black/30'
}
function ratingBadge(r: string) {
  if (r === 'good') return '✓'
  if (r === 'needs-improvement') return '~'
  if (r === 'poor') return '✗'
  return '…'
}

interface Props {
  liveVitals:  Record<string, number>
  navMetrics:  NavigationMetrics | null
  longTasks:   LongTaskSummary
  errorCount:  number
}

export function VitalsStrip({ liveVitals, navMetrics, longTasks, errorCount }: Props) {
  const { dispatch } = useAdmin()

  return (
    <div className="overflow-hidden rounded-xl border border-white/8 bg-white/[0.02]">
      <div className="flex items-center gap-2 border-b border-white/8 px-4 py-2.5">
        <Radio className="h-2.5 w-2.5 text-emerald-400/60" />
        <span className="flex-1 font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/30">
          Web Vitals · PerformanceObserver
        </span>
        <button
          onClick={() => dispatch({ type: 'SET_PANEL', payload: 'analytics' })}
          className="font-mono text-[8.5px] text-white/25 hover:text-white/55 transition-colors"
        >
          Details →
        </button>
      </div>

      <div className="grid grid-cols-4 gap-px bg-white/4 sm:grid-cols-7">
        {VITAL_NAMES.map(name => {
          const raw     = liveVitals[name]
          const rating  = raw != null ? rateVital(name, raw) : 'pending'
          const display = raw != null
            ? `${formatVital(name, raw)}${vitalUnit(name) ? ` ${vitalUnit(name)}` : ''}`
            : '—'
          return (
            <div key={name} className={`flex flex-col items-center gap-0.5 px-3 py-3 ${ratingBg(rating)}`}>
              <div className="font-mono text-[7.5px] uppercase tracking-wider text-white/25">{name}</div>
              <div className={`font-mono text-[11px] font-bold tabular-nums ${ratingColor(rating)}`}>{display}</div>
              <div className={`font-mono text-[8px] ${ratingColor(rating).replace('text-', 'text-').replace('/[0-9]+', '/60')}`}>
                {ratingBadge(rating)}
              </div>
            </div>
          )
        })}

        <div className={`flex flex-col items-center gap-0.5 px-3 py-3 ${ratingBg(errorCount === 0 ? 'good' : 'poor')}`}>
          <div className="font-mono text-[7.5px] uppercase tracking-wider text-white/25">Errors</div>
          <div className={`font-mono text-[11px] font-bold tabular-nums ${ratingColor(errorCount === 0 ? 'good' : 'poor')}`}>
            {errorCount}
          </div>
          <div className={`font-mono text-[8px] ${errorCount === 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {errorCount === 0 ? '✓' : '✗'}
          </div>
        </div>

        <div className={`flex flex-col items-center gap-0.5 px-3 py-3 ${ratingBg(longTasks.count === 0 ? 'good' : longTasks.count <= 2 ? 'needs-improvement' : 'poor')}`}>
          <div className="font-mono text-[7.5px] uppercase tracking-wider text-white/25">LongTasks</div>
          <div className={`font-mono text-[11px] font-bold tabular-nums ${ratingColor(longTasks.count === 0 ? 'good' : 'poor')}`}>
            {longTasks.count}
          </div>
          <div className={`font-mono text-[8px] ${longTasks.count === 0 ? 'text-emerald-400' : longTasks.count <= 2 ? 'text-amber-400' : 'text-red-400'}`}>
            {longTasks.count === 0 ? '✓' : '~'}
          </div>
        </div>
      </div>

      {navMetrics && (
        <div className="grid grid-cols-4 gap-px bg-white/4 border-t border-white/5">
          {[
            { label: 'TTFB',            val: navMetrics.ttfb != null ? `${navMetrics.ttfb}ms` : 'N/A' },
            { label: 'DOM Interactive', val: navMetrics.domInteractive != null ? `${navMetrics.domInteractive}ms` : 'N/A' },
            { label: 'Heap',            val: navMetrics.jsHeapUsed != null ? `${navMetrics.jsHeapUsed}MB` : 'N/A' },
            { label: 'Resources',       val: `${navMetrics.resourceCount}` },
          ].map(({ label, val }) => (
            <div key={label} className="flex flex-col items-center gap-0.5 bg-black/20 px-3 py-2">
              <div className="font-mono text-[10px] font-bold text-white/60 tabular-nums">{val}</div>
              <div className="font-mono text-[7px] uppercase tracking-wider text-white/25">{label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
