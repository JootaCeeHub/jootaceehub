'use client'

import { useEffect, useState } from 'react'
import { Radio, TrendingDown, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Card } from '../shared-components'
import type { LiveBundleGroup, BundleSummary } from '@/lib/analytics/bundle-inspector'
import { cn } from '@/lib/utils'

interface Props {
  bundleSummary: BundleSummary | null
  liveBundles: LiveBundleGroup[]
  lastRefreshed: string | null
}

// ─── Bundle manifest types ────────────────────────────────────────────────────

interface ChunkEntry {
  name: string
  rawBytes: number
  rawKB: number
  deltaKB?: number
}

interface ChunkManifest {
  generatedAt: string
  chunkCount: number
  totalRawKB: number
  deltaKB: number | null
  largestChunks: ChunkEntry[]
  routeCount: number
  budgets: {
    totalBudgetKB: number
    withinBudget: boolean
    scriptBudgetKB: number
    scriptKB: number
    scriptWithinBudget: boolean
  }
}

interface HistoryEntry {
  generatedAt: string
  totalRawKB: number
  chunkCount: number
  deltaKB: number | null
  scriptKB: number
  withinBudget: boolean
  routeCount: number
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function BundleManifestCard() {
  const [manifest, setManifest] = useState<ChunkManifest | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mRes, hRes] = await Promise.allSettled([
          fetch('/chunk-manifest.json'),
          fetch('/data/bundle-history.json'),
        ])
        if (mRes.status === 'fulfilled' && mRes.value.ok) {
          setManifest(await mRes.value.json())
        }
        if (hRes.status === 'fulfilled' && hRes.value.ok) {
          setHistory(await hRes.value.json())
        }
      } catch { /**/ }
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="rounded-xl border border-white/6 bg-white/[0.015] px-4 py-5 text-[10px] text-white/25 animate-pulse">
        Loading bundle manifest…
      </div>
    )
  }

  if (!manifest) {
    return (
      <div className="rounded-xl border border-white/6 bg-white/[0.015] px-4 py-5 text-[10px] text-white/25">
        chunk-manifest.json not found — run <code className="font-mono text-emerald-400/60">npm run build</code> to generate it.
      </div>
    )
  }

  const budgetOk    = manifest.budgets?.withinBudget ?? true
  const scriptOk    = manifest.budgets?.scriptWithinBudget ?? true
  const deltaKB     = manifest.deltaKB
  const deltaSign   = deltaKB != null ? (deltaKB >= 0 ? `+${deltaKB}` : `${deltaKB}`) : null
  const deltaColor  = deltaKB == null ? 'text-white/25' : deltaKB > 0 ? 'text-rose-400' : 'text-emerald-400'
  const maxChunk    = manifest.largestChunks[0]?.rawKB ?? 1

  return (
    <div className="space-y-3">
      {/* Summary row */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: 'Total raw',    value: `${manifest.totalRawKB} KB`,    accent: budgetOk ? 'text-emerald-400' : 'text-rose-400' },
          { label: 'Chunks',       value: manifest.chunkCount,            accent: 'text-white/65' },
          { label: 'Routes',       value: manifest.routeCount,            accent: 'text-sky-400'  },
          { label: 'vs prev',      value: deltaSign ? `${deltaSign} KB` : '—', accent: deltaColor },
        ].map(({ label, value, accent }) => (
          <div key={label} className="rounded-lg border border-white/6 bg-white/[0.02] px-3 py-2.5 text-center">
            <p className={cn('font-mono text-sm font-bold tabular-nums', accent)}>{value}</p>
            <p className="mt-0.5 font-mono text-[8px] uppercase tracking-widest text-white/25">{label}</p>
          </div>
        ))}
      </div>

      {/* Budget status */}
      <div className="flex flex-wrap gap-2">
        <div className={cn('flex items-center gap-1.5 rounded border px-2.5 py-1 text-[9px] font-mono',
          budgetOk ? 'border-emerald-400/20 bg-emerald-400/6 text-emerald-400' : 'border-rose-400/20 bg-rose-400/6 text-rose-400')}>
          {budgetOk ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
          Total ≤{manifest.budgets?.totalBudgetKB ?? 2048} KB budget: {budgetOk ? 'pass' : `fail (+${manifest.totalRawKB - (manifest.budgets?.totalBudgetKB ?? 2048)} KB over)`}
        </div>
        <div className={cn('flex items-center gap-1.5 rounded border px-2.5 py-1 text-[9px] font-mono',
          scriptOk ? 'border-emerald-400/20 bg-emerald-400/6 text-emerald-400' : 'border-amber-400/20 bg-amber-400/6 text-amber-400')}>
          {scriptOk ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
          Script ≤{manifest.budgets?.scriptBudgetKB ?? 900} KB: {manifest.budgets?.scriptKB ?? '?'} KB ({scriptOk ? 'pass' : 'over'})
        </div>
        {deltaKB != null && (
          <div className={cn('flex items-center gap-1.5 rounded border px-2.5 py-1 text-[9px] font-mono',
            deltaKB <= 0 ? 'border-emerald-400/20 bg-emerald-400/6 text-emerald-400' : 'border-amber-400/20 bg-amber-400/6 text-amber-400')}>
            {deltaKB <= 0 ? <TrendingDown size={10} /> : <TrendingUp size={10} />}
            {deltaSign} KB vs previous build
          </div>
        )}
      </div>

      {/* Largest chunks bar chart */}
      <div className="rounded-xl border border-white/6 bg-white/[0.015] p-3 space-y-2">
        <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-white/25 mb-2">Largest chunks</p>
        {manifest.largestChunks.slice(0, 12).map((c) => (
          <div key={c.name} className="flex items-center gap-2">
            <span className="w-36 shrink-0 truncate font-mono text-[9px] text-white/40">{c.name.slice(0, 20)}</span>
            <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
              <div
                className={cn('h-full rounded-full', c.rawKB > 300 ? 'bg-rose-400/50' : c.rawKB > 150 ? 'bg-amber-400/50' : 'bg-emerald-400/40')}
                style={{ width: `${Math.round((c.rawKB / maxChunk) * 100)}%` }}
              />
            </div>
            <span className="w-14 shrink-0 text-right font-mono text-[9px] text-white/45 tabular-nums">{c.rawKB} KB</span>
            {c.deltaKB != null && (
              <span className={cn('w-10 shrink-0 text-right font-mono text-[8px] tabular-nums', c.deltaKB > 0 ? 'text-rose-400/60' : 'text-emerald-400/60')}>
                {c.deltaKB > 0 ? '+' : ''}{c.deltaKB}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* History trend */}
      {history.length > 1 && (
        <div className="rounded-xl border border-white/6 bg-white/[0.015] p-3">
          <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-white/25 mb-2.5">Release trend (last {history.length} builds)</p>
          <div className="flex items-end gap-1 h-12">
            {history.map((h, i) => {
              const max = Math.max(...history.map(x => x.totalRawKB), 1)
              const pct = Math.round((h.totalRawKB / max) * 100)
              const isLast = i === history.length - 1
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1" title={`${h.totalRawKB} KB · ${h.generatedAt.slice(0, 10)}`}>
                  <div
                    className={cn('w-full rounded-sm', isLast ? 'bg-cyan-400/60' : h.withinBudget ? 'bg-emerald-400/30' : 'bg-rose-400/30')}
                    style={{ height: `${Math.max(pct, 8)}%` }}
                  />
                </div>
              )
            })}
          </div>
          <div className="flex justify-between mt-1">
            <span className="font-mono text-[7px] text-white/15">{history[0]?.generatedAt.slice(0, 10)}</span>
            <span className="font-mono text-[7px] text-white/30">{history[history.length - 1]?.generatedAt.slice(0, 10)} (latest)</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function BundleTab({ bundleSummary, liveBundles, lastRefreshed }: Props) {
  const splitStatusCls = (status: 'done' | 'partial' | 'pending') =>
    `mt-1 h-2 w-2 shrink-0 rounded-full ${status === 'done' ? 'bg-emerald-400' : status === 'partial' ? 'bg-amber-400' : 'bg-white/20'}`
  const splitBadgeCls = (status: 'done' | 'partial' | 'pending') =>
    `ml-auto shrink-0 rounded border px-1.5 py-0.5 font-mono text-[7.5px] uppercase tracking-wider ${status === 'done' ? 'border-emerald-400/20 text-emerald-400' : status === 'partial' ? 'border-amber-400/20 text-amber-400' : 'border-white/10 text-white/25'}`

  return (
    <div className="space-y-4">

      {/* ── Build bundle manifest + history ───────────────────────────────── */}
      <Card dot="#818cf8" title="Build manifest · chunk sizes per release">
        <BundleManifestCard />
      </Card>

      {/* ── Runtime resource timing ───────────────────────────────────────── */}
      {bundleSummary && (
        <div className="overflow-hidden rounded-xl border border-emerald-400/20 bg-emerald-400/4">
          <div className="flex items-center gap-2 border-b border-emerald-400/15 px-4 py-2.5">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 animate-pulse" />
            <span className="flex-1 font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400/80">Resource summary · window.performance · live session</span>
            <span className="font-mono text-[9px] text-white/30">{lastRefreshed ?? '—'}</span>
          </div>
          <div className="grid grid-cols-3 gap-px bg-white/5 p-px lg:grid-cols-6">
            {[
              { label: 'Scripts',      value: bundleSummary.scriptCount },
              { label: 'Decoded KB',   value: bundleSummary.totalDecodedKB },
              { label: 'Transfer KB',  value: bundleSummary.totalTransferKB },
              { label: 'Cache ratio',  value: `${Math.round(bundleSummary.cacheRatio * 100)}%` },
              { label: 'Slow >500ms',  value: bundleSummary.slowCount },
              { label: 'CSS files',    value: bundleSummary.cssCount },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center gap-1 bg-black/30 px-3 py-3">
                <div className="font-mono text-[12px] font-bold text-white/75 tabular-nums">{value}</div>
                <div className="font-mono text-[7.5px] uppercase tracking-wider text-white/30">{label}</div>
              </div>
            ))}
          </div>
          {/* Resource type breakdown */}
          <div className="border-t border-white/6 px-4 py-3 space-y-2">
            <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-white/25 mb-2">Resource types · by count</p>
            {(() => {
              const types = [
                { label: 'JS Scripts',  count: bundleSummary.scriptCount, color: '#38bdf8' },
                { label: 'CSS',         count: bundleSummary.cssCount,    color: '#a78bfa' },
                { label: 'Images',      count: bundleSummary.imageCount,  color: '#34d399' },
                { label: 'Fonts',       count: bundleSummary.fontCount,   color: '#f59e0b' },
                { label: 'Other',       count: bundleSummary.otherCount,  color: '#ffffff40' },
              ]
              const maxCount = Math.max(...types.map(t => t.count), 1)
              return types.map(({ label, count, color }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <span className="w-20 shrink-0 font-mono text-[8.5px] text-white/40">{label}</span>
                  <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-white/5">
                    <div className="h-full rounded-full transition-all" style={{ width: `${Math.round((count / maxCount) * 100)}%`, background: color + '80' }} />
                  </div>
                  <span className="w-6 shrink-0 text-right font-mono text-[8.5px] text-white/40 tabular-nums">{count}</span>
                </div>
              ))
            })()}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-1.5">
                <span className={cn('h-2 w-2 rounded-full', bundleSummary.cacheRatio >= 0.5 ? 'bg-emerald-400' : 'bg-amber-400')} />
                <span className="font-mono text-[8.5px] text-white/30">{Math.round(bundleSummary.cacheRatio * 100)}% cache hit rate</span>
              </div>
              {bundleSummary.slowCount > 0 && (
                <span className="font-mono text-[8.5px] text-rose-400/60">{bundleSummary.slowCount} slow resource{bundleSummary.slowCount !== 1 ? 's' : ''} (&gt;500ms)</span>
              )}
            </div>
          </div>
        </div>
      )}

      <Card dot="#f472b6" title={liveBundles.length > 0 ? `Bundle analysis · live resource timing · ${liveBundles.length} vendor groups` : 'Bundle analysis · inspecting…'}>
        {liveBundles.length === 0 ? (
          <div className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/[0.015] px-4 py-5 text-[11px] text-white/30">
            <Radio className="h-4 w-4 shrink-0" />
            Reading resource timing entries… data appears automatically after page load.
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {liveBundles.map((entry) => {
                const maxKB = Math.max(...liveBundles.map((e) => e.decodedKB), 1)
                return (
                  <div key={entry.name} className="flex items-center gap-3">
                    <div className="flex w-52 shrink-0 items-center gap-2 min-w-0">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: entry.color }} />
                      <span className="truncate font-mono text-[10px] text-white/55">{entry.name}</span>
                      {entry.lazy && <span className="shrink-0 rounded border border-sky-400/20 bg-sky-400/8 px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-wider text-sky-400">lazy</span>}
                    </div>
                    <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-white/6">
                      <div className="h-full rounded-full transition-all" style={{ width: `${Math.round((entry.decodedKB / maxKB) * 100)}%`, background: `${entry.color}60` }} />
                    </div>
                    <div className="flex w-28 shrink-0 items-center gap-2 justify-end">
                      <span className="font-mono text-[10px] font-semibold text-white/60 tabular-nums">{entry.label}</span>
                      <span className="font-mono text-[9px] text-white/25 tabular-nums">{entry.gzip}</span>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center gap-3 border-t border-white/8 pt-3 mt-1">
              <span className="font-mono text-[9px] text-white/25">
                Sizes from performance.getEntriesByType(&quot;resource&quot;) · decoded = parsed / gzip = transferred
              </span>
            </div>
          </>
        )}
        <div className="flex items-center gap-3 border-t border-white/8 pt-3 mt-1" style={{ marginTop: liveBundles.length > 0 ? '4px' : '0' }}>
          <code className="rounded-md border border-white/10 bg-black/30 px-2.5 py-1.5 font-mono text-[9px] text-emerald-400/70">ANALYZE=true npm run build</code>
          <span className="font-mono text-[9px] text-white/25">Opens interactive chunk treemap in browser</span>
        </div>
      </Card>

      <Card dot="#34d399" title="Code splitting opportunities">
        <div className="space-y-2">
          {[
            { title: 'NeuralNetworkScene (R3F)',   desc: 'dynamic(ssr:false) + Suspense. requestIdleCallback gate. frameloop paused when scrolled out. Antialias conditional on tier=high. Three.js isolated in dedicated chunk via webpack cacheGroups.three.', status: 'done'    as const },
            { title: 'Admin panel chunks',         desc: 'PanelRouter lazy-loads each panel. useAdmin never imported in [locale] routes. Admin JS stays in its own async chunk — verified via grep.',                        status: 'done'    as const },
            { title: 'Framer Motion',              desc: 'motion.* imports tree-shake via bundler DCE. optimizePackageImports in next.config.ts ensures only used motion components are bundled.',                          status: 'done'    as const },
            { title: 'Lucide icons',               desc: 'Named imports only — each icon is a separate tree-shakeable module. No barrel import of the entire icon set.',                                                     status: 'done'    as const },
            { title: 'GSAP',                       desc: 'GSAP is NOT in the bundle — animations use Framer Motion exclusively. ScrollReveal.tsx comment confirms: "GSAP + ScrollTrigger replaced with framer-motion useInView".',                                                            status: 'done'    as const },
            { title: 'LabsSection 3D components', desc: 'TradingLab, STLLab, ERPLab use R3F inline. Each is wrapped in LazySection (IntersectionObserver gate) so chunks only download when near viewport.', status: 'partial' as const },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3 border-b border-white/5 last:border-0 py-2.5">
              <span className={splitStatusCls(item.status)} />
              <div>
                <div className="font-mono text-[10.5px] text-white/65">{item.title}</div>
                <div className="mt-0.5 font-mono text-[8.5px] text-white/30 leading-relaxed">{item.desc}</div>
              </div>
              <span className={splitBadgeCls(item.status)}>{item.status}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
