'use client'

import { Card } from '../shared-components'
import { clearHistory, getScoreTrend, buildSparklinePath } from '@/lib/analytics/history'
import type { AnalysisSnapshot, HistoryStats } from '@/lib/analytics/history'

interface Props {
  historyEntries: AnalysisSnapshot[]
  historyStats: HistoryStats | null
  heapSamples: number[]
  setHistoryEntries: (v: AnalysisSnapshot[]) => void
  setHistoryStats: (v: HistoryStats | null) => void
}

const historyRunTypeCls = (type: string) => {
  const m: Record<string, string> = { psi: 'border-sky-400/25 text-sky-400', manual: 'border-violet-400/25 text-violet-400', auto: 'border-emerald-400/25 text-emerald-400' }
  return `shrink-0 rounded border px-1.5 py-0.5 font-mono text-[7.5px] uppercase tracking-wider ${m[type] ?? 'border-white/10 text-white/25'}`
}
const sparkPathCls = (good: boolean) => `fill-none stroke-2 ${good ? 'stroke-emerald-400/60' : 'stroke-amber-400/60'}`

export function HistoryTab({
  historyEntries, historyStats, heapSamples,
  setHistoryEntries, setHistoryStats,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-rose-400/60">Analysis · Run History</div>
          <h2 className="text-xl font-semibold tracking-tight text-white/90">History &amp; Trends</h2>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white/25">
            {historyStats?.totalRuns ?? 0} runs stored · max 30 · persisted in localStorage
          </p>
        </div>
        {historyEntries.length > 0 && (
          <button
            onClick={() => { clearHistory(); setHistoryEntries([]); setHistoryStats(null) }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/4 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.1em] transition-all text-white/40 hover:border-white/20 hover:text-white/65"
          >
            Clear history
          </button>
        )}
      </div>

      {historyEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-emerald-400/15 bg-emerald-400/4 py-10 text-center">
          <div className="text-3xl mb-2">📊</div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-emerald-400/70">No analysis runs yet</div>
          <div className="mt-1 font-mono text-[9px] text-white/20">Click &quot;Run Analysis&quot; to start recording history and trend data</div>
        </div>
      ) : (
        <>
          {historyStats && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {[
                { label: 'Total runs',   value: historyStats.totalRuns },
                { label: 'PSI runs',     value: historyStats.psiRuns },
                { label: 'Avg perf',     value: historyStats.avgPerformance != null ? `${historyStats.avgPerformance}` : '—' },
                { label: 'Best perf',    value: historyStats.bestPerf != null ? `${historyStats.bestPerf}` : '—' },
                { label: 'Total errors', value: historyStats.totalErrors },
                { label: 'Last run',     value: historyStats.lastRun ? (historyStats.lastRun.split('T')[1]?.slice(0, 5) ?? '—') : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-1 rounded-xl border border-white/8 bg-black/20 p-3">
                  <div className="font-mono text-[12px] font-bold text-white/75 tabular-nums">{value}</div>
                  <div className="font-mono text-[7.5px] uppercase tracking-wider text-white/30">{label}</div>
                </div>
              ))}
            </div>
          )}

          <Card dot="#38bdf8" title="Lighthouse score trends · last 10 PSI runs">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(['Performance', 'Accessibility', 'SEO', 'Best Practices'] as const).map((label) => {
                const trend = getScoreTrend(label)
                const path  = buildSparklinePath(trend)
                const last  = trend[trend.length - 1]
                const good  = last != null && last >= 90
                return (
                  <div key={label} className="overflow-hidden rounded-xl border border-white/8 bg-black/20">
                    <div className="px-3 py-2 h-10">
                      {path ? (
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 80 24" fill="none">
                          <path d={path} className={sparkPathCls(good)} />
                        </svg>
                      ) : (
                        <div className="flex h-6 items-center justify-center font-mono text-[8px] text-white/20">no data</div>
                      )}
                    </div>
                    <div className="flex items-center justify-between px-3 pb-2">
                      <span className="font-mono text-[7.5px] uppercase tracking-wider text-white/30">{label}</span>
                      <span className="font-mono text-[12px] font-bold text-white/75 tabular-nums">{last ?? '—'}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {heapSamples.length >= 2 && (
            <Card dot="#f59e0b" title={`JS heap · live sparkline · ${heapSamples.length} samples · every 10s`}>
              <svg viewBox="0 0 80 24" fill="none" style={{ width: '100%', height: '48px' }}>
                <path
                  d={buildSparklinePath(heapSamples, 80, 24)}
                  className={sparkPathCls(heapSamples[heapSamples.length - 1] < 100)}
                />
              </svg>
              <div className="mt-1 flex justify-between font-mono text-[8px] text-white/25">
                <span>min {Math.min(...heapSamples)}MB</span>
                <span>current {heapSamples[heapSamples.length - 1]}MB</span>
                <span>max {Math.max(...heapSamples)}MB</span>
              </div>
            </Card>
          )}

          <Card dot="#818cf8" title="Run log">
            <div>
              {historyEntries.map((run) => (
                <div key={run.id} className="flex items-center gap-2.5 rounded-lg border border-white/6 bg-white/[0.015] px-3 py-2 hover:border-white/12 transition-colors mb-1.5 last:mb-0">
                  <span className={historyRunTypeCls(run.type)}>{run.type}</span>
                  <span className="font-mono text-[7.5px] uppercase tracking-wider text-white/30">{run.timestamp.split('T')[0]} {run.timestamp.split('T')[1]?.slice(0, 8) ?? ''}</span>
                  {run.lighthouseScores && (
                    <span className="font-mono text-[12px] font-bold text-white/75 tabular-nums">
                      perf {run.lighthouseScores.find((sc) => sc.label === 'Performance')?.score ?? '—'}
                    </span>
                  )}
                  <span className="font-mono text-[7.5px] uppercase tracking-wider text-white/30">{run.errorCount} errs</span>
                  {run.navTTFB != null && <span className="font-mono text-[7.5px] uppercase tracking-wider text-white/30">TTFB {run.navTTFB}ms</span>}
                  {run.resourceCount != null && <span className="font-mono text-[7.5px] uppercase tracking-wider text-white/30">{run.resourceCount} res</span>}
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
