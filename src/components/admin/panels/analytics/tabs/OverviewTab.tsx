'use client'

import { useState, useCallback } from 'react'
import { Loader2, RefreshCw } from 'lucide-react'
import { Card, ScoreRing, AuditRow } from '../shared-components'
import { RECOMMENDATIONS, STATIC_LIGHTHOUSE } from '../constants'
import { isPSIOnCooldown, staleLabel } from '../psi-cache'
import type { PSIResult } from '@/lib/analytics/pagespeed'
import type { AuditCheck } from '@/lib/analytics/scoring'
import type { HealthDomain } from '@/lib/analytics/scoring'
import type { Tab } from '../types'

interface Props {
  psiLoading: boolean
  psiUrl: string
  psiResult: PSIResult | null
  psiCachedAt: string | null
  psiExpanded: boolean
  psiStrategy: 'mobile' | 'desktop'
  isLighthouseLive: boolean
  isLighthouseReal: boolean
  lighthouseScores: { label: string; score: number }[]
  canonicalBase: string
  configSeoChecks: AuditCheck[]
  activeA11yChecks: AuditCheck[]
  a11yPassing: number
  domA11yChecks: AuditCheck[]
  healthDomains: HealthDomain[]
  globalScore: number
  prodScore: number
  programScore: number
  totalHealthPasses: number
  totalHealthItems: number
  setPsiExpanded: (v: boolean | ((prev: boolean) => boolean)) => void
  setPsiUrl: (v: string) => void
  setPsiStrategy: (v: 'mobile' | 'desktop') => void
  fetchPSI: () => void
  setActiveTab: (tab: Tab) => void
  psiCountdown: number
  onBuildDataLoaded?: (result: PSIResult, cachedAt: string) => void
}

const psiInlineScoreCls = (score: number) =>
  `font-mono text-[10px] font-bold tabular-nums ${score >= 90 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-red-400'}`
const psiCollapseChevronCls = (expanded: boolean) =>
  `shrink-0 font-mono text-[11px] text-white/25 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`
const psiFetchBtnCls = (loading: boolean) =>
  `inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 font-mono text-[9px] uppercase tracking-[0.1em] transition-all ${loading ? 'border-sky-400/20 bg-sky-400/8 text-sky-400/60 cursor-wait' : 'border-sky-400/30 bg-sky-400/10 text-sky-400 hover:bg-sky-400/18 cursor-pointer'}`
const psiAuditScoreCls = (score: number | null) =>
  `shrink-0 rounded border px-1.5 py-0.5 font-mono text-[7px] uppercase ${score == null ? 'border-white/10 text-white/20' : score >= 90 ? 'border-emerald-400/20 text-emerald-400' : score >= 50 ? 'border-amber-400/20 text-amber-400' : 'border-red-400/20 text-red-400'}`
const programScoreValCls = (pct: number) =>
  `font-mono text-[36px] font-bold tabular-nums leading-none ${pct >= 85 ? 'text-emerald-400' : pct >= 60 ? 'text-amber-400' : 'text-red-400'}`
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

export function OverviewTab({
  psiLoading, psiUrl, psiResult, psiCachedAt, psiExpanded, psiStrategy,
  isLighthouseLive, isLighthouseReal, lighthouseScores, canonicalBase,
  configSeoChecks, activeA11yChecks, a11yPassing, domA11yChecks,
  healthDomains, globalScore, prodScore, programScore,
  totalHealthPasses, totalHealthItems,
  setPsiExpanded, setPsiUrl, setPsiStrategy, fetchPSI, setActiveTab,
  psiCountdown, onBuildDataLoaded,
}: Props) {
  const is429        = !!(psiResult?.error?.includes('429'))
  const hasRealScore = lighthouseScores.length > 0

  const [buildRefreshing, setBuildRefreshing] = useState(false)
  const refreshBuildData = useCallback(async () => {
    setBuildRefreshing(true)
    try {
      const json = await fetch('/data/lighthouse.json', { cache: 'no-store' }).then(r => r.ok ? r.json() : null)
      if (json?.mobile?.scores?.length && onBuildDataLoaded) {
        const age = json.generatedAt ? staleLabel(new Date(json.generatedAt).getTime()) : ''
        onBuildDataLoaded({ ...json.mobile, _source: 'build' }, `build · ${age}`)
      }
    } finally {
      setBuildRefreshing(false)
    }
  }, [onBuildDataLoaded])
  return (
    <div className="space-y-4">
      <Card dot="#f43f5e" title={
        psiLoading
          ? 'Lighthouse · fetching live scores…'
          : isLighthouseLive
            ? `Lighthouse · live · ${psiResult!.strategy} · ${psiCachedAt ?? ''}`
            : isLighthouseReal
              ? psiResult?._source === 'build'
                ? `Lighthouse · build baseline · ${psiResult!.strategy} · ${psiCachedAt ?? ''}`
                : `Lighthouse · ${psiResult?._source ?? 'cached'} · ${psiResult!.strategy} · ${psiCachedAt ?? ''}`
              : 'Lighthouse · no data · click Run Analysis'
      } action={
        !psiLoading && !isLighthouseLive && (
          <button
            onClick={refreshBuildData}
            disabled={buildRefreshing}
            className="inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[8px] text-white/25 hover:text-white/45 transition-colors disabled:opacity-40"
            title="Reload build scores from public/data/lighthouse.json"
          >
            <RefreshCw className={`h-2.5 w-2.5 ${buildRefreshing ? 'animate-spin' : ''}`} />
            {buildRefreshing ? 'loading…' : 'refresh build'}
          </button>
        )
      }>
        {/* Score rings — live, or static fallback */}
        {psiLoading ? (
          <div className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/[0.015] px-4 py-5 font-mono text-[11px] text-white/30">
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
            Fetching live Lighthouse scores from PageSpeed Insights for {psiUrl || canonicalBase}…
          </div>
        ) : hasRealScore ? (
          <div className={`grid gap-3 ${lighthouseScores.length <= 4 ? 'grid-cols-4' : 'grid-cols-5 lg:grid-cols-6'}`}>
            {lighthouseScores.map(({ label, score }) => (
              <ScoreRing key={label} label={label} score={score} />
            ))}
          </div>
        ) : (
          /* Fallback: show STATIC_LIGHTHOUSE as baseline reference */
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-amber-400/60">
                {is429 ? 'Rate limited — showing last known baseline' : 'Last known baseline (run fetch:lighthouse to refresh)'}
              </span>
              <div className="h-px flex-1 bg-white/5" />
              {psiCountdown > 0 && (
                <span className="font-mono text-[8px] tabular-nums text-sky-400/60">
                  auto-retry in {psiCountdown}s
                </span>
              )}
            </div>
            <div className={`gap-3 opacity-55 grid ${STATIC_LIGHTHOUSE.length <= 4 ? 'grid-cols-4' : 'grid-cols-5 lg:grid-cols-6'}`}>
              {STATIC_LIGHTHOUSE.map(({ label, score }) => (
                <ScoreRing key={label} label={label} score={score} />
              ))}
            </div>
            {!is429 && (
              <p className="font-mono text-[8px] text-white/22">
                Click <strong className="text-white/40">Run Analysis</strong> to fetch live scores from PageSpeed Insights.
              </p>
            )}
          </div>
        )}

        {/* Error + status lines */}
        {!psiLoading && psiResult?.fetchedAt && (
          <div className="mt-2 font-mono text-[8px]" style={{ color: psiResult.error ? 'rgba(248,113,113,0.65)' : 'rgba(255,255,255,0.2)' }}>
            {psiResult.error
              ? `PSI: ${psiResult.error}`
              : `Fetched ${new Date(psiResult.fetchedAt).toLocaleString()} · ${psiResult.url}`
            }
          </div>
        )}
        {!psiLoading && isLighthouseReal && !isLighthouseLive && (
          <div className="mt-1 font-mono text-[8px] text-amber-400/55">
            {psiResult?._source === 'build'
              ? 'Scores from last deploy build — Run Analysis to refresh'
              : psiResult?._source === 'stale'
                ? '⚠ Stale cache — outdated scores. Run Analysis to refresh.'
                : 'Cached scores — Run Analysis to refresh with live data'}
          </div>
        )}

        {/* 429 API key setup guide */}
        {is429 && (
          <div className="mt-3 overflow-hidden rounded-xl border border-amber-400/15 bg-amber-400/[0.04]">
            <div className="flex items-center gap-2 border-b border-amber-400/10 px-4 py-2.5">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/70" />
              <span className="flex-1 font-mono text-[9px] uppercase tracking-[0.18em] text-amber-400/70">
                Fix: add a free API key for unlimited PSI access
              </span>
              {psiCountdown > 0 && (
                <span className="font-mono text-[8.5px] tabular-nums text-sky-400/60">
                  auto-retry in {psiCountdown}s
                </span>
              )}
            </div>
            <div className="px-4 py-3 space-y-2">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { n: '1', text: 'console.cloud.google.com → APIs → "PageSpeed Insights API" → Enable' },
                  { n: '2', text: 'Credentials → Create API Key (no billing required for PSI)' },
                  { n: '3', text: 'Add to .env.local:\nNEXT_PUBLIC_PSI_API_KEY=your_key_here' },
                ].map(({ n, text }) => (
                  <div key={n} className="rounded-lg border border-white/6 bg-white/[0.025] px-3 py-2.5">
                    <div className="mb-1.5 font-mono text-[9px] font-bold text-amber-400/60">Step {n}</div>
                    <p className="font-mono text-[8px] leading-relaxed text-white/35 whitespace-pre-wrap">{text}</p>
                  </div>
                ))}
              </div>
              <p className="font-mono text-[7.5px] text-white/20">
                Free tier allows ~10,000 requests/day with an API key · no credit card required
              </p>
            </div>
          </div>
        )}
      </Card>

      <div className="overflow-hidden rounded-xl border border-sky-400/15 bg-sky-400/[0.03]">
        <button
          className="flex w-full cursor-pointer items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-sky-400/[0.04]"
          onClick={() => setPsiExpanded((v) => !v)}
          aria-expanded={psiExpanded}
        >
          <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: psiResult && !psiResult.error ? '#34d399' : '#38bdf8' }} />
          <span className="flex-1 font-mono text-[10px] uppercase tracking-[0.2em] text-sky-400/70">
            PageSpeed Insights ·{' '}
            {psiResult && !psiResult.error
              ? `live · ${psiResult.strategy} · fetched ${psiResult.fetchedAt?.split('T')[1]?.slice(0, 5) ?? ''}`
              : 'run live audit'}
          </span>
          {psiResult && !psiResult.error && psiResult.scores.length > 0 && (
            <div className="flex items-center gap-2 mr-2">
              {psiResult.scores.map(({ label, score }: { label: string; score: number }) => (
                <span key={label} className={psiInlineScoreCls(score)}>
                  {score} <span style={{ opacity: 0.5 }}>{label.slice(0, 3)}</span>
                </span>
              ))}
            </div>
          )}
          <span className={psiCollapseChevronCls(psiExpanded)}>▾</span>
        </button>
        {psiExpanded && (
          <div className="border-t border-sky-400/12 p-4 space-y-3">
            <div className="flex gap-2">
              <input
                type="url"
                value={psiUrl}
                onChange={(e) => setPsiUrl(e.target.value)}
                placeholder={canonicalBase || 'https://yoursite.com'}
                className="flex-1 rounded-lg border border-white/10 bg-white/4 px-3 py-2 font-mono text-[10px] text-white/70 placeholder-white/15 outline-none focus:border-sky-400/40 focus:bg-white/6 transition-colors"
              />
              <select
                value={psiStrategy}
                onChange={(e) => setPsiStrategy(e.target.value as 'mobile' | 'desktop')}
                className="rounded-lg border border-white/10 bg-white/4 px-2.5 py-2 font-mono text-[9px] text-white/50 outline-none focus:border-sky-400/40 transition-colors"
              >
                <option value="mobile">Mobile</option>
                <option value="desktop">Desktop</option>
              </select>
              <button onClick={fetchPSI} disabled={psiLoading || !psiUrl.trim()} className={psiFetchBtnCls(psiLoading)}>
                {psiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : '↻'}
                {psiLoading ? 'Fetching…' : 'Fetch'}
              </button>
            </div>
            {psiResult?.error && (
              <div className="rounded-lg border border-red-400/20 bg-red-400/5 px-3 py-2.5 font-mono text-[9px] text-red-400/80">
                {psiResult.error.includes('429') || psiResult.error.toLowerCase().includes('rate')
                  ? `⚠ Google PSI rate limit (free tier, ~2 req/100s). ${psiCountdown > 0 ? `Auto-retry in ${psiCountdown}s.` : 'Add NEXT_PUBLIC_PSI_API_KEY for unlimited access.'}`
                  : psiResult.error
                }
                {!psiResult.error.includes('429') && isPSIOnCooldown() && (
                  <span className="text-amber-400/70"> · Cooldown active (5 min)</span>
                )}
              </div>
            )}
            {psiResult && !psiResult.error && psiResult.audits && (
              <div>
                {Object.entries(psiResult.audits).map(([id, audit]) => (
                  <div key={id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                    <span className="flex-1 font-mono text-[9px] text-white/50 truncate">{audit.title}</span>
                    <span className="font-mono text-[9px] text-white/35 shrink-0">{audit.displayValue ?? '—'}</span>
                    <span className={psiAuditScoreCls(audit.score)}>
                      {audit.score != null ? audit.score : 'n/a'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main-thread diagnostics — shown when Lighthouse JSON has deep data */}
      {psiResult && !psiResult.error && (psiResult.mainThreadWork?.length || psiResult.unusedJsKb || psiResult.lcpElement || psiResult.renderBlockMs) && (
        <Card dot="#f97316" title="Main-thread diagnostics · from build Lighthouse">
          <div className="grid gap-3 lg:grid-cols-2">
            {/* Thread breakdown */}
            {psiResult.mainThreadWork && psiResult.mainThreadWork.length > 0 && (
              <div>
                <div className="mb-2 font-mono text-[8px] uppercase tracking-[0.14em] text-white/28">Thread work breakdown</div>
                {psiResult.mainThreadWork.map(({ group, duration }) => {
                  const total = psiResult.mainThreadWork!.reduce((s, i) => s + i.duration, 0)
                  const pct   = total > 0 ? Math.round((duration / total) * 100) : 0
                  const bar   = duration > 1500 ? '#f87171' : duration > 500 ? '#fb923c' : '#34d399'
                  return (
                    <div key={group} className="mb-1.5">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-mono text-[8.5px] text-white/50 truncate">{group}</span>
                        <span className="font-mono text-[8.5px] tabular-nums text-white/35 ml-2 shrink-0">{duration}ms</span>
                      </div>
                      <div className="h-1 overflow-hidden rounded-full bg-white/6">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: bar }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            {/* LCP + unused JS */}
            <div className="space-y-2.5">
              {psiResult.lcpElement && (
                <div>
                  <div className="mb-1 font-mono text-[8px] uppercase tracking-[0.14em] text-white/28">LCP element</div>
                  <pre className="overflow-x-auto rounded-md border border-white/6 bg-black/40 px-2.5 py-2 font-mono text-[8px] text-sky-400/70 leading-relaxed whitespace-pre-wrap break-all">{psiResult.lcpElement}</pre>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                {psiResult.unusedJsKb != null && (
                  <div className="rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2">
                    <div className="font-mono text-[8px] text-white/28 uppercase tracking-wider">Unused JS</div>
                    <div className={`font-mono text-[18px] font-bold tabular-nums leading-tight mt-0.5 ${psiResult.unusedJsKb > 200 ? 'text-red-400' : psiResult.unusedJsKb > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {psiResult.unusedJsKb}
                      <span className="text-[10px] font-normal text-white/30 ml-0.5">KB</span>
                    </div>
                  </div>
                )}
                {psiResult.renderBlockMs != null && (
                  <div className="rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2">
                    <div className="font-mono text-[8px] text-white/28 uppercase tracking-wider">Render-blocking</div>
                    <div className={`font-mono text-[18px] font-bold tabular-nums leading-tight mt-0.5 ${psiResult.renderBlockMs > 500 ? 'text-red-400' : psiResult.renderBlockMs > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {psiResult.renderBlockMs}
                      <span className="text-[10px] font-normal text-white/30 ml-0.5">ms</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card dot="#60a5fa" title={`SEO · ${configSeoChecks.filter(c => c.pass).length}/${configSeoChecks.length} passing · public pages`}>
          <div className="divide-y divide-white/5">
            {configSeoChecks.slice(0, 5).map((item) => <AuditRow key={item.label} item={item} />)}
          </div>
          <button onClick={() => setActiveTab('seo')} className="mt-2 block w-full pt-1 text-center font-mono text-[9px] text-white/25 hover:text-rose-400 transition-colors">
            See all {configSeoChecks.length} checks →
          </button>
        </Card>
        <Card dot="#818cf8" title={`A11y · ${a11yPassing}/${activeA11yChecks.length} passing${domA11yChecks.length > 0 ? ' · live DOM' : ' · config'}`}>
          <div className="divide-y divide-white/5">
            {activeA11yChecks.slice(0, 5).map((item) => <AuditRow key={item.label} item={item} />)}
          </div>
          <button onClick={() => setActiveTab('accessibility')} className="mt-2 block w-full pt-1 text-center font-mono text-[9px] text-white/25 hover:text-rose-400 transition-colors">
            See all {activeA11yChecks.length} checks →
          </button>
        </Card>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.025] px-5 py-4">
        <div className="space-y-0.5">
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/30">Program Health · Live Audit</div>
          <div className="text-[13px] font-medium text-white/70">Estado del ecosistema completo</div>
          <div className="font-mono text-[9px] text-white/25">
            {totalHealthPasses}/{totalHealthItems} checks passing · {healthDomains.filter(d => d.score >= 85).length}/4 domains healthy
          </div>
        </div>
        <div className={programScoreValCls(programScore)}>{programScore}</div>
      </div>

      <Card dot="#818cf8" title="Platform readiness · health domains + lighthouse + go-live">
        <div className="grid grid-cols-5 gap-3 lg:grid-cols-6">
          {healthDomains.map((d) => (
            <ScoreRing key={d.label} label={d.label.split(' ')[0]} score={d.score} />
          ))}
          <ScoreRing label="Lighthouse" score={globalScore} />
          <ScoreRing label="Go-live" score={prodScore} />
        </div>
      </Card>

      {healthDomains.flatMap(d => d.items.filter(i => !i.pass)).length > 0 && (
        <div className="overflow-hidden rounded-xl border border-white/8 bg-white/[0.015]">
          <div className="flex items-center gap-2 border-b border-white/6 px-4 py-2.5">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: '#f43f5e' }} />
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/50">
              {healthDomains.flatMap(d => d.items.filter(i => !i.pass)).length} items need attention
            </span>
            <button onClick={() => setActiveTab('program')} className="shrink-0 ml-2 font-mono text-[8.5px] text-rose-400/60 hover:text-rose-400 transition-colors">
              Full report →
            </button>
          </div>
          {healthDomains.flatMap((domain) =>
            domain.items.filter((item) => !item.pass).map((item) => ({
              ...item,
              domainLabel: domain.label,
            }))
          ).slice(0, 6).map((item) => (
            <div key={`${item.domainLabel}-${item.label}`} className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5 last:border-0">
              <span className="shrink-0 rounded border border-white/12 bg-white/4 px-1.5 py-0.5 font-mono text-[7.5px] uppercase tracking-wider text-white/30">{item.domainLabel.split(' ')[0]}</span>
              <span className="flex-1 min-w-0 font-mono text-[9.5px] text-white/55 truncate">{item.label}</span>
              <span className="hidden font-mono text-[8.5px] text-white/22 lg:block shrink-0 max-w-xs truncate">{item.hint}</span>
            </div>
          ))}
        </div>
      )}

      <Card dot="#f59e0b" title="Top recommendations · critical">
        <div className="space-y-2">
          {RECOMMENDATIONS.filter((r) => r.priority === 'high').map((r) => (
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
    </div>
  )
}
