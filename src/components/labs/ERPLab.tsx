'use client'

import { useEffect, useState } from 'react'

const MODULES = [
  { id: 'inventory', label: 'Inventory', accent: '#fb923c' },
  { id: 'finance', label: 'Finance', accent: '#34d399' },
  { id: 'hr', label: 'HR', accent: '#a78bfa' },
  { id: 'supply', label: 'Supply Chain', accent: '#49b7ff' },
]

const LOG_LINES = [
  'Procurement pipeline synced with inventory planner.',
  'Billing batch closed — no integrity violations.',
  'Manufacturing queue reprioritized by AI scheduler.',
  'Supply chain event: reorder triggered for SKU-4821.',
  'Finance module: reconciliation complete — 0 exceptions.',
]

export function ERPLab() {
  const [throughput, setThroughput] = useState(128)
  const [automation, setAutomation] = useState(84)
  const [health, setHealth] = useState(97)
  const [logIndex, setLogIndex] = useState(0)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setThroughput((v) => Math.max(95, Math.min(165, v + Math.round((Math.random() - 0.5) * 8))))
      setAutomation((v) => Math.max(70, Math.min(97, v + Math.round((Math.random() - 0.5) * 3))))
      setHealth((v) => Math.max(90, Math.min(99, v + Math.round((Math.random() - 0.5) * 2))))
      setLogIndex((i) => (i + 1) % LOG_LINES.length)
      setTick((t) => t + 1)
    }, 2200)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/30">
          ERP RUNTIME / TICK {tick}
        </span>
        <span className="font-mono text-[10px] text-amber-400/70">{health}% health</span>
      </div>

      {/* Module status strip */}
      <div className="grid grid-cols-4 gap-2">
        {MODULES.map((mod) => (
          <div key={mod.id} className="rounded-lg border border-white/6 bg-white/2 p-2 text-center">
            <div
              className="mx-auto mb-1.5 h-1.5 w-1.5 rounded-full animate-pulse"
              style={{ background: mod.accent, boxShadow: `0 0 6px ${mod.accent}80` }}
            />
            <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-white/35">{mod.label}</div>
          </div>
        ))}
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Throughput', value: `${throughput}/h`, color: 'text-amber-400' },
          { label: 'Automation', value: `${automation}%`, color: 'text-violet-400' },
          { label: 'Health', value: `${health}%`, color: 'text-emerald-400' },
        ].map((m) => (
          <div key={m.label} className="rounded-lg border border-white/6 bg-white/2 p-3">
            <div className="mb-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-white/25">{m.label}</div>
            <div className={`font-mono text-sm font-semibold tabular-nums ${m.color}`}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Live log */}
      <div className="rounded-lg border border-white/6 bg-black/30 px-3 py-2.5">
        <div className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-white/20">System Log</div>
        <div className="font-mono text-[11px] text-white/40">
          <span className="text-amber-400/50">→ </span>{LOG_LINES[logIndex]}
        </div>
      </div>

      <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/15">
        4-module integration bus · Kafka event pipeline · simulation mode
      </div>
    </div>
  )
}
