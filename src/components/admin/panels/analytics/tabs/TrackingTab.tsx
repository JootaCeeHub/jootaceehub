'use client'

import React from 'react'
import { Radio, Clock, Eye, MousePointer, Activity } from 'lucide-react'
import { Card } from '../shared-components'
import { DEFAULT_EVENTS, PROVIDERS } from '../constants'
import { formatDuration } from '@/lib/analytics/session-metrics'
import type { SessionMetrics } from '@/lib/analytics/session-metrics'

interface Props {
  gaId: string
  providerConnected: Record<string, boolean>
  sessionMetrics: SessionMetrics | null
  setSiteField: (key: string, value: string | boolean) => void
}

const providerStatusCls = (connected: boolean) =>
  `ml-auto font-mono text-[8px] uppercase ${connected ? 'text-emerald-400' : 'text-white/20'}`
const budgetBarFillCls = (pct: number) =>
  `h-full rounded-full ${pct > 90 ? 'bg-red-400/70' : pct > 70 ? 'bg-amber-400/70' : 'bg-emerald-400/70'}`
const eventStatusDotCls = (active: boolean) =>
  `inline-block h-1.5 w-1.5 rounded-full mr-1.5 ${active ? 'bg-emerald-400' : 'bg-white/20'}`

export function TrackingTab({ gaId, providerConnected, sessionMetrics, setSiteField }: Props) {
  return (
    <div className="space-y-4">
      <Card dot="#c084fc" title="Analytics providers">
        <div className="grid grid-cols-2 gap-3">
          {PROVIDERS.map((p) => {
            const connected = providerConnected[p.id] ?? false
            return (
              <div key={p.id} className="rounded-xl border border-white/8 bg-black/20 p-3.5 space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-sm">{p.icon}</span>
                  <span className="text-[11px] font-medium text-white/70">{p.name}</span>
                  <span className={providerStatusCls(connected)}>{connected ? '● Live' : '○ Off'}</span>
                </div>
                {p.id === 'ga4' ? (
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/30">{p.env}</label>
                    <input
                      type="text"
                      value={gaId}
                      onChange={(e) => setSiteField('trackingId', e.target.value)}
                      placeholder="G-XXXXXXXXXX"
                      className="w-full rounded-lg border border-white/10 bg-white/4 px-3 py-2 font-mono text-[11px] text-white/80 placeholder-white/15 transition-colors focus:border-rose-400/40 focus:outline-none focus:bg-white/6"
                    />
                  </div>
                ) : (
                  <div className="mt-1 font-mono text-[8.5px] text-white/20">Configure via {p.env} env var</div>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      <Card dot="#38bdf8" title="Session engagement · live browser tracking">
        {sessionMetrics ? (
          <>
            <div className="overflow-hidden rounded-xl border border-emerald-400/20 bg-emerald-400/4" style={{ margin: 0, border: 'none', padding: '0 0 8px' }}>
              <div className="flex items-center gap-2 border-b border-emerald-400/15 px-4 py-2.5">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 animate-pulse" />
                <span className="flex-1 font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400/80">Current session · since admin panel opened</span>
                <span className="font-mono text-[9px] text-white/30">{new Date(sessionMetrics.startTime).toLocaleTimeString()}</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '10px' }}>
              {[
                { label: 'Duration',      value: formatDuration(sessionMetrics.durationMs),  Icon: Clock        },
                { label: 'Focused time',  value: formatDuration(sessionMetrics.focusedMs),   Icon: Eye          },
                { label: 'Interactions',  value: sessionMetrics.interactions,                 Icon: MousePointer },
                { label: 'Scroll depth',  value: `${sessionMetrics.scrollDepthPct}%`,        Icon: Activity     },
              ].map(({ label, value, Icon }) => (
                <div key={label} className="rounded-lg border border-white/6 bg-black/20 p-2.5 text-center">
                  <Icon style={{ display: 'block', margin: '0 auto 4px', width: '12px', height: '12px', color: 'rgba(255,255,255,0.35)' }} />
                  <div className="font-mono text-[13px] font-bold text-white/70">{value}</div>
                  <div className="font-mono text-[7.5px] text-white/25">{label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {[
                { label: 'Clicks',       value: sessionMetrics.clicks                    },
                { label: 'Keystrokes',   value: sessionMetrics.keystrokes                },
                { label: 'Blurred time', value: formatDuration(sessionMetrics.blurredMs) },
                { label: 'Page loads',   value: sessionMetrics.pageLoads                 },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg border border-white/6 bg-black/20 p-2.5 text-center">
                  <div className="font-mono text-[13px] font-bold text-white/70">{value}</div>
                  <div className="font-mono text-[7.5px] text-white/25">{label}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '10px', padding: '0 2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span className="font-mono text-[7.5px] uppercase tracking-wider text-white/30">Scroll depth</span>
                <span className="font-mono text-[7.5px] uppercase tracking-wider text-white/30">{sessionMetrics.scrollDepthPct}%</span>
              </div>
              <div className="flex-1 h-2.5 overflow-hidden rounded-full bg-white/6">
                <div className={budgetBarFillCls(sessionMetrics.scrollDepthPct)} style={{ width: `${sessionMetrics.scrollDepthPct}%` }} />
              </div>
            </div>
            <div className="mt-2 rounded-lg border border-white/6 bg-white/[0.02] px-3 py-2 font-mono text-[9px] text-white/25">
              Real-time session data from click, keydown, scroll, and visibility events · resets on page reload
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/[0.015] px-4 py-5 text-[11px] text-white/30">
            <Radio className="h-4 w-4 shrink-0" />
            Session tracking active — interaction data appears as events fire.
          </div>
        )}
      </Card>

      <Card dot="#34d399" title="Event tracking · configuración">
        <table className="w-full">
          <thead className="border-b border-white/8 text-left">
            <tr>
              <th className="pb-2 font-mono text-[8.5px] uppercase tracking-wider text-white/25">Event name</th>
              <th className="pb-2 font-mono text-[8.5px] uppercase tracking-wider text-white/25">Trigger</th>
              <th className="pb-2 font-mono text-[8.5px] uppercase tracking-wider text-white/25 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {DEFAULT_EVENTS.map((ev) => (
              <tr key={ev.name} className="border-b border-white/4 last:border-0">
                <td className="py-2 font-mono text-[10px] text-white/55">{ev.name}</td>
                <td className="py-2 font-mono text-[10px] text-white/35">{ev.trigger}</td>
                <td className="py-2 font-mono text-[10px] text-white/55 text-right">
                  <span className={eventStatusDotCls(ev.active)} />
                  <span className={ev.active ? 'text-emerald-400' : 'text-white/25'}>{ev.active ? 'Active' : 'Off'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-2 rounded-lg border border-white/6 bg-white/[0.02] px-3 py-2 font-mono text-[9px] text-white/25">Events fire to all connected analytics providers simultaneously.</div>
      </Card>

      {sessionMetrics ? (
        <Card dot="#f43f5e" title="Engagement funnel · current session · live">
          {(() => {
            const { pageLoads, focusedMs, durationMs, scrollDepthPct, interactions, clicks } = sessionMetrics
            const engagementRatio = durationMs > 0 ? Math.min(1, focusedMs / durationMs) : 0
            const funnelRows = [
              { stage: 'Page loads',        value: pageLoads,                                          color: '#38bdf8', unit: '' },
              { stage: 'Time on page',       value: Math.round(durationMs / 1000),                     color: '#a78bfa', unit: 's' },
              { stage: 'Focused time',       value: Math.round(focusedMs / 1000),                      color: '#34d399', unit: 's' },
              { stage: 'Scroll depth',       value: scrollDepthPct,                                    color: '#f59e0b', unit: '%' },
              { stage: 'Interactions',       value: interactions,                                       color: '#fb923c', unit: '' },
              { stage: 'Clicks',             value: clicks,                                             color: '#f43f5e', unit: '' },
            ]
            const maxVal = Math.max(...funnelRows.map(r => r.value), 1)
            return (
              <div className="space-y-1.5">
                {funnelRows.map((row) => {
                  const pct = Math.round((row.value / maxVal) * 100)
                  return (
                    <React.Fragment key={row.stage}>
                      <div className="flex items-center gap-3">
                        <span className="w-32 shrink-0 font-mono text-[9.5px] text-white/50 truncate">{row.stage}</span>
                        <div className="flex-1 h-4 overflow-hidden rounded-sm bg-white/5">
                          <div className="h-full rounded-sm transition-all" style={{ width: `${Math.max(pct, 2)}%`, background: row.color + '55' }} />
                        </div>
                        <span className="w-14 shrink-0 font-mono text-[10px] font-semibold text-white/65 tabular-nums text-right">{row.value}{row.unit}</span>
                      </div>
                    </React.Fragment>
                  )
                })}
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex-1 h-1 overflow-hidden rounded-full bg-white/6">
                    <div className="h-full rounded-full bg-emerald-400/50 transition-all" style={{ width: `${Math.round(engagementRatio * 100)}%` }} />
                  </div>
                  <span className="font-mono text-[8.5px] text-white/30">{Math.round(engagementRatio * 100)}% focus ratio</span>
                </div>
                <div className="mt-1 rounded-lg border border-white/6 bg-white/[0.02] px-3 py-2 font-mono text-[9px] text-white/25">
                  Real-time data from current admin session · resets on page reload · connect GA4 for aggregate funnel analytics
                </div>
              </div>
            )
          })()}
        </Card>
      ) : (
        <Card dot="#f43f5e" title="Conversion funnel · demo data">
          <div className="space-y-1.5">
            {([
              { stage: 'Page Views',      value: 438, color: '#38bdf8' },
              { stage: 'Unique Visitors', value: 312, color: '#a78bfa' },
              { stage: 'Engaged (>30s)',  value: 194, color: '#34d399' },
              { stage: 'Contact clicks',  value: 27,  color: '#f59e0b' },
              { stage: 'Sent message',    value: 11,  color: '#f43f5e' },
            ] as const).map((row, i, arr) => {
              const top     = arr[0].value
              const pct     = Math.round((row.value / top) * 100)
              const prevPct = i > 0 ? Math.round((row.value / arr[i - 1].value) * 100) : 100
              return (
                <React.Fragment key={row.stage}>
                  <div className="flex items-center gap-3">
                    <span className="w-36 shrink-0 font-mono text-[9.5px] text-white/50 truncate">{row.stage}</span>
                    <div className="flex-1 h-5 overflow-hidden rounded-sm bg-white/5">
                      <div className="h-full rounded-sm transition-all" style={{ width: `${pct}%`, background: row.color + '55' }} />
                    </div>
                    <span className="w-12 shrink-0 font-mono text-[10px] font-semibold text-white/65 tabular-nums text-right">{row.value}</span>
                    <span className="w-10 shrink-0 font-mono text-[8.5px] text-white/30 tabular-nums">{i === 0 ? '100%' : `${prevPct}%`}</span>
                  </div>
                  {i < arr.length - 1 && <div className="my-1 h-px bg-white/5" />}
                </React.Fragment>
              )
            })}
          </div>
          <div className="mt-2 rounded-lg border border-white/6 bg-white/[0.02] px-3 py-2 font-mono text-[9px] text-white/25">
            Demo data · session tracking loading… · connect GA4 or PostHog for real funnel analytics.
          </div>
        </Card>
      )}
    </div>
  )
}
