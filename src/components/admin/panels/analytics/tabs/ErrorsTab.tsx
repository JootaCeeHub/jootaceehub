'use client'

import { Card, AuditRow } from '../shared-components'
import { errorCollector } from '@/lib/analytics/error-collector'
import type { RuntimeError } from '@/lib/analytics/error-collector'

interface Feed {
  connected?: boolean
}

interface Props {
  runtimeErrors: RuntimeError[]
  errorCount: number
  intelligenceFeeds?: Feed[]
}

const errorsCountCls = (n: number) => {
  const variant = n === 0 ? 'border-emerald-400/20 bg-emerald-400/6 text-emerald-400' : 'border-red-400/20 bg-red-400/6 text-red-400'
  return `flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[9px] uppercase tracking-wider ${variant}`
}
const summaryChipCls = (variant: string) => {
  const m: Record<string, string> = {
    error: 'border-red-400/20 bg-red-400/6 text-red-400', warning: 'border-amber-400/20 bg-amber-400/6 text-amber-400',
    success: 'border-emerald-400/20 bg-emerald-400/6 text-emerald-400', info: 'border-sky-400/20 bg-sky-400/6 text-sky-400',
    neutral: 'border-white/10 bg-white/4 text-white/50',
  }
  return `flex flex-col items-center rounded-xl border px-4 py-2 ${m[variant] ?? m.neutral}`
}
const errorCardCls = (type: string) => {
  const m: Record<string, string> = { js: 'border-red-400/15 bg-red-400/4', promise: 'border-amber-400/15 bg-amber-400/4', react: 'border-violet-400/15 bg-violet-400/4', network: 'border-sky-400/15 bg-sky-400/4' }
  return `overflow-hidden rounded-xl border ${m[type] ?? 'border-white/10 bg-white/4'}`
}
const errorTypeBadgeCls = (type: string) => {
  const m: Record<string, string> = { js: 'border-red-400/20 text-red-400', promise: 'border-amber-400/20 text-amber-400', react: 'border-violet-400/20 text-violet-400', network: 'border-sky-400/20 text-sky-400' }
  return `rounded-full border px-1.5 py-0.5 font-mono text-[7.5px] uppercase tracking-wider shrink-0 ${m[type] ?? 'border-white/10 text-white/30'}`
}

export function ErrorsTab({ runtimeErrors, errorCount, intelligenceFeeds }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/30">Runtime · Error Monitor</div>
          <h2 className="font-mono text-[13px] font-semibold text-white/80">Error Collector</h2>
          <p className="font-mono text-[9px] text-white/30">
            Captured via window.onerror + unhandledrejection · auto-deduplicates by signature
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className={errorsCountCls(errorCount)}>
            {errorCount === 0 ? '✓ clean' : `${errorCount} error${errorCount !== 1 ? 's' : ''}`}
          </span>
          {errorCount > 0 && (
            <button onClick={() => errorCollector.clear()} className="rounded-lg border border-white/8 bg-white/[0.02] px-3 py-1.5 font-mono text-[9px] uppercase tracking-wider text-white/30 hover:text-white/55 hover:border-white/15 transition-colors cursor-pointer">
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        {(['js', 'promise', 'react', 'network'] as const).map((type) => {
          const n = runtimeErrors.filter((e) => e.type === type).length
          return (
            <div key={type} className={summaryChipCls(n > 0 ? 'error' : 'success')}>
              <div className="font-mono text-[13px] font-bold tabular-nums">{n}</div>
              <div className="font-mono text-[7.5px] uppercase tracking-wider">{type}</div>
            </div>
          )
        })}
        <div className={summaryChipCls(runtimeErrors.reduce((a, e) => a + e.count, 0) > 0 ? 'warning' : 'success')}>
          <div className="font-mono text-[13px] font-bold tabular-nums">{runtimeErrors.reduce((a, e) => a + e.count, 0)}</div>
          <div className="font-mono text-[7.5px] uppercase tracking-wider">total fires</div>
        </div>
      </div>

      {errorCount === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-emerald-400/15 bg-emerald-400/4 py-10 text-center">
          <div className="text-3xl mb-2">✓</div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-emerald-400/70">No runtime errors detected</div>
          <div className="mt-1 font-mono text-[9px] text-white/20">window.onerror and unhandledrejection are being monitored</div>
        </div>
      ) : (
        <div className="space-y-2">
          {runtimeErrors.map((err) => (
            <div key={err.id} className={errorCardCls(err.type)}>
              <div className="flex items-center gap-2.5 px-4 py-2.5">
                <span className={errorTypeBadgeCls(err.type)}>{err.type}</span>
                <span className="flex-1 min-w-0 font-mono text-[10px] text-white/65 truncate">{err.message}</span>
                {err.count > 1 && <span className="shrink-0 rounded-full border border-white/12 bg-white/5 px-1.5 py-0.5 font-mono text-[8px] text-white/30">×{err.count}</span>}
                <span className="shrink-0 font-mono text-[8px] text-white/20">{err.timestamp.split('T')[1]?.slice(0, 8) ?? ''}</span>
              </div>
              {err.source && (
                <div className="px-4 pb-2 font-mono text-[8.5px] text-white/25 truncate">
                  {err.source}{err.lineno != null ? `:${err.lineno}` : ''}{err.colno != null ? `:${err.colno}` : ''}
                </div>
              )}
              {err.stack && <pre className="mx-4 mb-3 max-h-24 overflow-y-auto rounded-md border border-white/6 bg-black/40 px-3 py-2 font-mono text-[8px] text-white/30 leading-relaxed whitespace-pre-wrap break-words">{err.stack}</pre>}
            </div>
          ))}
        </div>
      )}

      {intelligenceFeeds && intelligenceFeeds.length > 0 && (
        <Card dot="#a78bfa" title="Intelligence feeds · connectivity">
          <div className="grid grid-cols-3 gap-px bg-white/5 p-px lg:grid-cols-6">
            {[
              { label: 'Total',     value: intelligenceFeeds.length },
              { label: 'Connected', value: intelligenceFeeds.filter((f) => f.connected).length },
              { label: 'Ratio',     value: `${Math.round(intelligenceFeeds.filter((f) => f.connected).length / intelligenceFeeds.length * 100)}%` },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center gap-1 bg-black/30 px-3 py-3">
                <div className="font-mono text-[12px] font-bold text-white/75 tabular-nums">{value}</div>
                <div className="font-mono text-[7.5px] uppercase tracking-wider text-white/30">{label}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card dot="#38bdf8" title="Runtime environment">
        <div className="divide-y divide-white/5">
          {[
            { label: 'PerformanceObserver', value: typeof window !== 'undefined' && typeof PerformanceObserver !== 'undefined' ? 'supported' : 'not available', pass: typeof window !== 'undefined' && typeof PerformanceObserver !== 'undefined', hint: 'Required for live Web Vitals' },
            { label: 'window.onerror',      value: 'active',        pass: true, hint: 'Catching synchronous JS errors' },
            { label: 'unhandledrejection',  value: 'active',        pass: true, hint: 'Catching unhandled promise rejections' },
            { label: 'JS heap monitor',     value: typeof window !== 'undefined' && 'memory' in performance ? 'supported' : 'not available', pass: typeof window !== 'undefined' && 'memory' in performance, hint: 'Chrome only (performance.memory)' },
            { label: 'Error deduplication', value: 'by signature',  pass: true, hint: 'Same error accumulated, not duplicated' },
          ].map((item) => <AuditRow key={item.label} item={item} />)}
        </div>
      </Card>
    </div>
  )
}
