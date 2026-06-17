'use client'

import { Radio, Clock } from 'lucide-react'
import { useAdmin } from '@/lib/admin/store'

interface SessionEvent {
  time:     string
  msg:      string
  severity: 'ok' | 'info' | 'warn' | 'error'
}

interface Props {
  sessionEvents: SessionEvent[]
  onClearSession: () => void
}

function sevDotColor(sev: string) {
  if (sev === 'ok')   return 'bg-emerald-400'
  if (sev === 'info') return 'bg-sky-400'
  if (sev === 'warn') return 'bg-amber-400'
  if (sev === 'error') return 'bg-red-400 animate-pulse'
  return 'bg-white/20'
}

export function FeedsSessionRow({ sessionEvents, onClearSession }: Props) {
  const { state, dispatch } = useAdmin()

  const feeds      = (state.intelligence?.feeds ?? []) as { id?: string; name?: string; type?: string; connected?: boolean }[]
  const connFeeds  = feeds.filter(f => f.connected)
  const offFeeds   = feeds.filter(f => !f.connected)
  const apiCount   = feeds.filter(f => f.type === 'api' || f.type === 'API').length
  const rssCount   = feeds.filter(f => f.type === 'rss' || f.type === 'RSS').length
  const dataSources    = state.integrations?.dataSources?.length ?? 0
  const indexedSources = state.integrations?.dataSources?.filter(s => s.status === 'ready').length ?? 0

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      {/* Intelligence Feeds */}
      <div className="overflow-hidden rounded-xl border border-white/8 bg-white/[0.02]">
        <div className="flex items-center gap-2 border-b border-white/8 px-4 py-2.5">
          <Radio className="h-2.5 w-2.5 text-cyan-400/50" />
          <span className="flex-1 font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/30">
            Intelligence Feeds
          </span>
          {feeds.length > 0
            ? <span className="font-mono text-[9px] text-emerald-400/70">{connFeeds.length}/{feeds.length} live</span>
            : <span className="font-mono text-[9px] text-white/22">0 configured</span>
          }
          <button
            onClick={() => dispatch({ type: 'SET_PANEL', payload: 'integrations' })}
            className="font-mono text-[8.5px] text-white/25 hover:text-white/55 transition-colors"
          >
            Manage →
          </button>
        </div>

        {feeds.length === 0 ? (
          <div className="px-4 py-5 text-center font-mono text-[9px] text-white/20">No feeds configured</div>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-px bg-white/4 border-b border-white/5">
              {[
                { label: 'Live',    value: connFeeds.length, color: '#34d399' },
                { label: 'Offline', value: offFeeds.length,  color: '#f87171' },
                { label: 'API',     value: apiCount,         color: '#38bdf8' },
                { label: 'RSS',     value: rssCount,         color: '#fb923c' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex flex-col items-center justify-center gap-0.5 bg-black/25 py-3">
                  <span className="font-mono text-[14px] font-bold tabular-nums" style={{ color }}>{value}</span>
                  <span className="font-mono text-[7.5px] uppercase tracking-wider text-white/25">{label}</span>
                </div>
              ))}
            </div>

            {connFeeds.length > 0 && (
              <div className="border-b border-white/5 last:border-0">
                <div className="flex items-center gap-1.5 px-4 py-1.5 font-mono text-[8px] uppercase tracking-wider text-white/28">
                  <span className="h-1 w-1 rounded-full bg-emerald-400 shrink-0" />Live feeds
                </div>
                {connFeeds.slice(0, 4).map((feed, i) => (
                  <div key={feed.id ?? i} className="flex items-center gap-2.5 px-4 py-1.5 last:pb-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                    <span className="flex-1 font-mono text-[9.5px] text-white/50 truncate">{feed.name ?? `Feed ${i + 1}`}</span>
                    {feed.type && (
                      <span className="shrink-0 rounded border border-white/10 bg-white/4 px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-wider text-white/22">
                        {feed.type.toUpperCase()}
                      </span>
                    )}
                  </div>
                ))}
                {connFeeds.length > 4 && (
                  <div className="px-4 py-1.5 font-mono text-[8px] text-white/22">+{connFeeds.length - 4} more live</div>
                )}
              </div>
            )}

            {offFeeds.length > 0 && (
              <div className="border-b border-white/5 last:border-0" style={{ opacity: 0.5 }}>
                <div className="flex items-center gap-1.5 px-4 py-1.5 font-mono text-[8px] uppercase tracking-wider text-white/28">
                  <span className="h-1 w-1 rounded-full bg-red-400/60 shrink-0" />
                  Offline · {offFeeds.length} feeds
                </div>
                {offFeeds.slice(0, 2).map((feed, i) => (
                  <div key={feed.id ?? i} className="flex items-center gap-2.5 px-4 py-1.5 last:pb-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-400/50" />
                    <span className="flex-1 font-mono text-[9.5px] text-white/50 truncate">{feed.name ?? `Feed ${i + 1}`}</span>
                    {feed.type && (
                      <span className="shrink-0 rounded border border-white/10 bg-white/4 px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-wider text-white/22">
                        {feed.type.toUpperCase()}
                      </span>
                    )}
                  </div>
                ))}
                {offFeeds.length > 2 && (
                  <div className="px-4 py-1.5 font-mono text-[8px] text-white/22">+{offFeeds.length - 2} more offline</div>
                )}
              </div>
            )}
          </>
        )}

        {dataSources > 0 && (
          <div className="flex items-center gap-3 border-t border-white/6 px-4 py-2">
            <span className="font-mono text-[8px] uppercase tracking-wider text-white/28 shrink-0">
              {indexedSources}/{dataSources} sources indexed
            </span>
            <div className="flex-1 h-1 rounded-full bg-white/8 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-400/50 transition-all"
                style={{ width: `${Math.round(indexedSources / dataSources * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Session Timeline */}
      <div className="overflow-hidden rounded-xl border border-white/8 bg-white/[0.02]">
        <div className="flex items-center gap-2 border-b border-white/8 px-4 py-2.5">
          <Clock className="h-2.5 w-2.5 text-white/30" />
          <span className="flex-1 font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/30">
            Session Timeline · {sessionEvents.length} events
          </span>
          <button
            onClick={onClearSession}
            className="font-mono text-[8.5px] text-white/22 hover:text-white/50 transition-colors"
          >
            Clear
          </button>
        </div>
        <div className="divide-y divide-white/5 max-h-60 overflow-y-auto">
          {sessionEvents.length === 0 ? (
            <div className="px-4 py-6 text-center font-mono text-[9px] text-white/20">No events logged yet</div>
          ) : (
            sessionEvents.map((evt, i) => (
              <div key={i} className="flex items-start gap-2.5 px-4 py-2">
                <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${sevDotColor(evt.severity)}`} />
                <span className="flex-1 min-w-0 font-mono text-[9.5px] text-white/55 leading-snug">{evt.msg}</span>
                <span className="shrink-0 font-mono text-[8px] text-white/20">{evt.time}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
