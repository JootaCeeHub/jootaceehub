'use client'

import { useEffect, useState } from 'react'

interface AgentEvent {
  id: number
  model: string
  action: string
  tool?: string
  status: 'dispatched' | 'running' | 'complete'
  ms: number
}

const MODELS = ['Claude', 'GPT-4o', 'Gemini']
const ACTIONS = ['analyze', 'summarize', 'retrieve', 'classify', 'generate', 'route']
const TOOLS = ['search', 'memory.read', 'memory.write', 'code.exec', 'web.fetch', 'file.read']

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

let nextId = 1

function newEvent(): AgentEvent {
  return {
    id: nextId++,
    model: randomItem(MODELS),
    action: randomItem(ACTIONS),
    tool: Math.random() > 0.4 ? randomItem(TOOLS) : undefined,
    status: 'dispatched',
    ms: Math.floor(80 + Math.random() * 200),
  }
}

export function AURALab() {
  const [events, setEvents] = useState<AgentEvent[]>(() =>
    Array.from({ length: 4 }, () => ({ ...newEvent(), status: 'complete' as const }))
  )
  const [metrics, setMetrics] = useState({ latency: 140, requests: 2847, tools: 47 })

  useEffect(() => {
    const id = setInterval(() => {
      const e = newEvent()

      setEvents((prev) => {
        const updated = prev
          .map((ev) => ({
            ...ev,
            status: ev.status === 'dispatched' ? 'running' as const : ev.status === 'running' ? 'complete' as const : ev.status,
          }))
          .slice(-6)
        return [...updated, e]
      })

      setMetrics((prev) => ({
        latency: Math.round(Math.max(80, Math.min(220, prev.latency + (Math.random() - 0.5) * 20))),
        requests: prev.requests + Math.floor(Math.random() * 3),
        tools: 47,
      }))
    }, 1600)

    return () => clearInterval(id)
  }, [])

  const statusColor = (status: AgentEvent['status']) =>
    status === 'complete' ? 'text-emerald-400' : status === 'running' ? 'text-sky-400 animate-pulse' : 'text-white/30'

  const statusSymbol = (status: AgentEvent['status']) =>
    status === 'complete' ? '●' : status === 'running' ? '◉' : '○'

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">AURA / Orchestration Runtime</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-white/30">{metrics.latency}ms avg</span>
          <span className="h-0.5 w-0.5 rounded-full bg-white/15" />
          <span className="font-mono text-[10px] text-white/30">{metrics.tools} tools</span>
          <span className="h-0.5 w-0.5 rounded-full bg-white/15" />
          <span className="font-mono text-[10px] text-white/30" suppressHydrationWarning>{metrics.requests.toLocaleString('en-US')} req/today</span>
        </div>
      </div>

      {/* Event feed */}
      <div className="rounded-lg border border-white/6 bg-black/30 p-3">
        <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.18em] text-white/20">Live Dispatch Feed</div>
        <div className="space-y-2">
          {events.slice(-5).reverse().map((ev) => (
            <div key={ev.id} className="flex items-center gap-2 font-mono text-[11px]">
              <span className={`w-3 shrink-0 text-[9px] ${statusColor(ev.status)}`}>
                {statusSymbol(ev.status)}
              </span>
              <span className="text-white/60 font-semibold w-16 shrink-0">{ev.model}</span>
              <span className="text-sky-400/70">{ev.action}</span>
              {ev.tool && (
                <>
                  <span className="text-white/20">→</span>
                  <span className="text-emerald-400/60">{ev.tool}</span>
                </>
              )}
              <span className="ml-auto text-white/20">{ev.ms}ms</span>
            </div>
          ))}
        </div>
      </div>

      {/* Model status grid */}
      <div className="grid grid-cols-3 gap-2">
        {MODELS.map((model) => {
          const recent = events.filter((e) => e.model === model).slice(-1)[0]
          const active = recent?.status === 'running'
          return (
            <div key={model} className="rounded-lg border border-white/6 bg-white/2 p-3">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="h-1.5 w-1.5 rounded-full transition-all duration-500"
                  style={{
                    background: active ? '#22d3ee' : 'rgba(255,255,255,0.2)',
                    boxShadow: active ? '0 0 8px #22d3ee60' : 'none',
                  }}
                />
                <span className="font-mono text-[11px] font-semibold text-white/65">{model}</span>
              </div>
              <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/25">
                {active ? 'running' : recent?.status ?? 'idle'}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
