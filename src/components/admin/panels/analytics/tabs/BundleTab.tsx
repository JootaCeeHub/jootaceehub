'use client'

import { Radio } from 'lucide-react'
import { Card } from '../shared-components'
import type { LiveBundleGroup, BundleSummary } from '@/lib/analytics/bundle-inspector'

interface Props {
  bundleSummary: BundleSummary | null
  liveBundles: LiveBundleGroup[]
  lastRefreshed: string | null
}

export function BundleTab({ bundleSummary, liveBundles, lastRefreshed }: Props) {
  const splitStatusCls = (status: 'done' | 'partial' | 'pending') =>
    `mt-1 h-2 w-2 shrink-0 rounded-full ${status === 'done' ? 'bg-emerald-400' : status === 'partial' ? 'bg-amber-400' : 'bg-white/20'}`
  const splitBadgeCls = (status: 'done' | 'partial' | 'pending') =>
    `ml-auto shrink-0 rounded border px-1.5 py-0.5 font-mono text-[7.5px] uppercase tracking-wider ${status === 'done' ? 'border-emerald-400/20 text-emerald-400' : status === 'partial' ? 'border-amber-400/20 text-amber-400' : 'border-white/10 text-white/25'}`

  return (
    <div className="space-y-4">
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
            { title: 'NeuralNetworkScene (R3F)',   desc: 'dynamic(ssr:false) + Suspense. requestIdleCallback gate. frameloop paused when scrolled out. Three.js isolated in dedicated chunk via webpack cacheGroups.three.', status: 'done'    as const },
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
