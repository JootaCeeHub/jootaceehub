'use client'

import { useMemo } from 'react'
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

// Patterns from known upstream libraries — not app bugs
const NOISE_PATTERNS = [
  'THREE.Clock: This module has been deprecated',
  'Detected scroll-behavior',
  'ChunkLoadError',
  'Invariant: attempted to hard navigate',
  'ResizeObserver loop limit',
  'ResizeObserver loop completed',
  'Non-Error promise rejection',
  'Loading chunk',
  '__webpack_require__',
]

function isNoise(err: RuntimeError) {
  return NOISE_PATTERNS.some(p => err.message.includes(p) || (err.stack ?? '').includes(p))
}

function severity(err: RuntimeError): 'fatal' | 'error' | 'warning' | 'noise' {
  if (isNoise(err)) return 'noise'
  if (err.type === 'react') return 'fatal'
  if (err.type === 'js' && err.stack) return 'error'
  if (err.type === 'promise') return 'warning'
  return 'error'
}

const SEV_COLOR: Record<ReturnType<typeof severity>, string> = {
  fatal:   '#f43f5e',
  error:   '#fb923c',
  warning: '#f59e0b',
  noise:   '#ffffff18',
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
  const noiseErrors = useMemo(() => runtimeErrors.filter(isNoise), [runtimeErrors])
  const realErrors  = useMemo(() => runtimeErrors.filter(e => !isNoise(e)), [runtimeErrors])

  const bySource = useMemo(() => {
    const map: Record<string, RuntimeError[]> = {}
    for (const err of realErrors) {
      const key = err.source ? err.source.split('/').pop()?.split('?')[0] ?? 'unknown' : 'unknown'
      if (!map[key]) map[key] = []
      map[key].push(err)
    }
    return Object.entries(map).sort((a, b) => b[1].length - a[1].length)
  }, [realErrors])

  const totalFires = runtimeErrors.reduce((a, e) => a + e.count, 0)
  const realCount  = realErrors.length

  // Top repeat offenders sorted by fire count
  const repeatOffenders = useMemo(() =>
    [...realErrors].sort((a, b) => b.count - a.count).filter(e => e.count >= 2),
  [realErrors])

  // Error type distribution with fire rate
  const typeStats = useMemo(() => {
    return (['js', 'promise', 'react', 'network'] as const).map((type) => {
      const errs  = realErrors.filter(e => e.type === type)
      const fires = errs.reduce((a, e) => a + e.count, 0)
      return { type, count: errs.length, fires }
    }).filter(s => s.count > 0)
  }, [realErrors])

  return (
    <div className="space-y-4">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/30">Runtime · Error Monitor</div>
          <h2 className="font-mono text-[13px] font-semibold text-white/80">Error Collector</h2>
          <p className="font-mono text-[9px] text-white/30">
            Captured via window.onerror + unhandledrejection · auto-deduplicates by signature
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className={errorsCountCls(realCount)}>
            {realCount === 0 ? '✓ clean' : `${realCount} real error${realCount !== 1 ? 's' : ''}`}
          </span>
          {errorCount > 0 && (
            <button onClick={() => errorCollector.clear()} className="rounded-lg border border-white/8 bg-white/[0.02] px-3 py-1.5 font-mono text-[9px] uppercase tracking-wider text-white/30 hover:text-white/55 hover:border-white/15 transition-colors cursor-pointer">
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* ── Summary chips ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {(['js', 'promise', 'react', 'network'] as const).map((type) => {
          const n = realErrors.filter(e => e.type === type).length
          return (
            <div key={type} className={summaryChipCls(n > 0 ? 'error' : 'success')}>
              <div className="font-mono text-[13px] font-bold tabular-nums">{n}</div>
              <div className="font-mono text-[7.5px] uppercase tracking-wider">{type}</div>
            </div>
          )
        })}
        <div className={summaryChipCls(totalFires > 0 ? 'warning' : 'success')}>
          <div className="font-mono text-[13px] font-bold tabular-nums">{totalFires}</div>
          <div className="font-mono text-[7.5px] uppercase tracking-wider">total fires</div>
        </div>
        {noiseErrors.length > 0 && (
          <div className={summaryChipCls('neutral')}>
            <div className="font-mono text-[13px] font-bold tabular-nums">{noiseErrors.length}</div>
            <div className="font-mono text-[7.5px] uppercase tracking-wider">noise filtered</div>
          </div>
        )}
      </div>

      {/* ── Error pattern analysis (only when errors present) ─────────── */}
      {realCount > 0 && typeStats.length > 0 && (
        <Card dot="#fb923c" title={`Error type distribution · ${typeStats.length} type${typeStats.length > 1 ? 's' : ''} · ${totalFires} total fires`}>
          <div className="space-y-1.5">
            {typeStats.map(({ type, count, fires }) => {
              const maxFires = Math.max(...typeStats.map(s => s.fires), 1)
              const pct = Math.round((fires / maxFires) * 100)
              const typeColor: Record<string, string> = { js: '#fb923c', promise: '#f59e0b', react: '#a78bfa', network: '#38bdf8' }
              const color = typeColor[type] ?? '#ffffff40'
              return (
                <div key={type} className="flex items-center gap-3">
                  <span className="w-16 shrink-0 font-mono text-[8.5px] uppercase" style={{ color }}>{type}</span>
                  <div className="flex-1 h-2.5 overflow-hidden rounded-full bg-white/6">
                    <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(pct, 2)}%`, background: color + '70' }} />
                  </div>
                  <span className="w-8 shrink-0 font-mono text-[8.5px] tabular-nums text-right" style={{ color }}>{count}</span>
                  <span className="w-16 shrink-0 font-mono text-[7.5px] tabular-nums text-right text-white/30">{fires} fires</span>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {repeatOffenders.length > 0 && (
        <Card dot="#f43f5e" title={`Repeat offenders · ${repeatOffenders.length} error${repeatOffenders.length > 1 ? 's' : ''} firing multiple times`}>
          <div className="space-y-1.5">
            {repeatOffenders.slice(0, 6).map((err) => {
              const sev = severity(err)
              return (
                <div key={err.id} className="flex items-center gap-2.5 rounded-lg border border-white/6 bg-white/[0.015] px-3 py-2">
                  <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full font-mono text-[9px] font-bold tabular-nums" style={{ background: SEV_COLOR[sev] + '20', color: SEV_COLOR[sev] }}>{err.count}</span>
                  <span className="flex-1 min-w-0 font-mono text-[9px] text-white/55 truncate">{err.message}</span>
                  <span className="shrink-0 font-mono text-[7.5px] uppercase tracking-wider" style={{ color: SEV_COLOR[sev] }}>{sev}</span>
                </div>
              )
            })}
          </div>
          <div className="mt-1 font-mono text-[7.5px] text-white/20">
            Errors firing {repeatOffenders[0]?.count ?? 1}+ times — deduplication accumulates in-place
          </div>
        </Card>
      )}

      {/* ── Real errors ────────────────────────────────────────────────── */}
      {realCount === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-emerald-400/15 bg-emerald-400/4 py-10 text-center">
          <div className="text-3xl mb-2">✓</div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-emerald-400/70">No runtime errors detected</div>
          <div className="mt-1 font-mono text-[9px] text-white/20">window.onerror and unhandledrejection are being monitored</div>
          {noiseErrors.length > 0 && (
            <div className="mt-2 font-mono text-[8.5px] text-white/22">
              {noiseErrors.length} upstream noise error{noiseErrors.length !== 1 ? 's' : ''} suppressed (THREE.js, Next.js internal)
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Group by source file */}
          {bySource.length > 1 && (
            <Card dot="#fb923c" title={`Errors by source · ${bySource.length} files affected`}>
              <div className="space-y-1.5">
                {bySource.map(([file, errs]) => {
                  const pct = Math.round((errs.length / realCount) * 100)
                  const worst = errs.reduce((a, e) => severity(e) === 'fatal' ? e : a, errs[0])
                  const sev = severity(worst)
                  return (
                    <div key={file} className="flex items-center gap-2.5">
                      <span className="font-mono text-[7.5px] uppercase tracking-wider w-10 shrink-0 text-right" style={{ color: SEV_COLOR[sev] }}>{sev.slice(0,3)}</span>
                      <div className="flex-1 h-2 overflow-hidden rounded-full bg-white/6">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: SEV_COLOR[sev] + 'aa' }} />
                      </div>
                      <span className="font-mono text-[8.5px] text-white/50 truncate max-w-[160px]">{file}</span>
                      <span className="font-mono text-[8px] text-white/25 shrink-0">{errs.length}×</span>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}

          {/* Error cards with severity */}
          <div className="space-y-2">
            {realErrors.map((err) => {
              const sev = severity(err)
              return (
                <div key={err.id} className={errorCardCls(err.type)}>
                  <div className="flex items-center gap-2.5 px-4 py-2.5">
                    <span className="shrink-0 h-2 w-2 rounded-full" style={{ background: SEV_COLOR[sev] }} />
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
              )
            })}
          </div>
        </>
      )}

      {/* ── Filtered noise (collapsed) ─────────────────────────────────── */}
      {noiseErrors.length > 0 && realCount > 0 && (
        <Card dot="#ffffff18" title={`Noise suppressed · ${noiseErrors.length} upstream library warnings`}>
          <div className="space-y-1">
            {noiseErrors.map(err => (
              <div key={err.id} className="flex items-center gap-2 py-1">
                <span className="font-mono text-[8px] text-white/18">{err.type}</span>
                <span className="flex-1 font-mono text-[8.5px] text-white/22 truncate">{err.message.slice(0, 80)}</span>
                {err.count > 1 && <span className="font-mono text-[7.5px] text-white/15">×{err.count}</span>}
              </div>
            ))}
          </div>
          <p className="font-mono text-[7.5px] text-white/15">
            Suppressed patterns: THREE.Clock deprecation · Next.js scroll warnings · webpack internals
          </p>
        </Card>
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

      <Card dot="#38bdf8" title="Runtime environment · browser API support">
        <div className="divide-y divide-white/5">
          {(() => {
            const w = typeof window !== 'undefined'
            const checks = [
              { label: 'PerformanceObserver',  pass: w && typeof PerformanceObserver !== 'undefined',                                        value: w && typeof PerformanceObserver !== 'undefined' ? 'supported' : 'unavailable',   hint: 'Required for live Web Vitals (LCP/CLS/INP/FCP)' },
              { label: 'window.onerror',        pass: true,                                                                                    value: 'active',          hint: 'Catches synchronous JS errors + eval exceptions' },
              { label: 'unhandledrejection',    pass: true,                                                                                    value: 'active',          hint: 'Catches unhandled Promise rejections' },
              { label: 'JS heap monitor',       pass: w && 'memory' in performance,                                                            value: w && 'memory' in performance ? 'supported' : 'Chrome only',                     hint: 'performance.memory — tracks heap pressure over time' },
              { label: 'Error deduplication',   pass: true,                                                                                    value: 'by signature',    hint: 'Same error accumulated in-place, not duplicated' },
              { label: 'Service Worker',        pass: w && 'serviceWorker' in navigator,                                                       value: w && 'serviceWorker' in navigator ? 'registered' : 'unavailable',               hint: 'Required for PWA offline support and caching' },
              { label: 'navigator.connection',  pass: w && 'connection' in navigator,                                                          value: w && 'connection' in navigator ? 'supported' : 'unavailable',                   hint: 'Network quality API — used in Performance tab' },
              { label: 'IndexedDB',             pass: w && typeof indexedDB !== 'undefined',                                                   value: w && typeof indexedDB !== 'undefined' ? 'supported' : 'unavailable',             hint: 'Required for admin state IndexedDB parallel write' },
              { label: 'Crypto API',            pass: w && typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined',               value: w && typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined' ? 'available' : 'unavailable', hint: 'SubtleCrypto for future secure token operations' },
              { label: 'Clipboard API',         pass: w && 'clipboard' in navigator,                                                           value: w && 'clipboard' in navigator ? 'available' : 'unavailable',                    hint: 'Used for admin copy-to-clipboard actions' },
              { label: 'Long task observer',    pass: w && (typeof PerformanceObserver !== 'undefined') && PerformanceObserver.supportedEntryTypes?.includes('longtask'), value: w && PerformanceObserver?.supportedEntryTypes?.includes('longtask') ? 'supported' : 'unavailable', hint: 'Detects JS tasks >50ms blocking main thread' },
            ]
            return checks.map(item => <AuditRow key={item.label} item={item} />)
          })()}
        </div>
      </Card>
    </div>
  )
}
