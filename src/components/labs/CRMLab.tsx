'use client'

import { useEffect, useMemo, useState } from 'react'

type Stage = 'lead' | 'qualified' | 'proposal' | 'won'
const STAGES: Stage[] = ['lead', 'qualified', 'proposal', 'won']

const STAGE_ACCENT: Record<Stage, string> = {
  lead: 'text-sky-400',
  qualified: 'text-violet-400',
  proposal: 'text-amber-400',
  won: 'text-emerald-400',
}

export function CRMLab() {
  const [counts, setCounts] = useState<Record<Stage, number>>({
    lead: 22,
    qualified: 14,
    proposal: 8,
    won: 4,
  })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setCounts((prev) => {
        const moveLead = Math.min(prev.lead, Math.round(Math.random() * 2))
        const moveQ = Math.min(prev.qualified, Math.round(Math.random() * 2))
        const moveP = Math.min(prev.proposal, Math.round(Math.random() * 1))
        return {
          lead: Math.max(12, prev.lead - moveLead + Math.round(Math.random() * 2)),
          qualified: Math.max(8, prev.qualified + moveLead - moveQ),
          proposal: Math.max(5, prev.proposal + moveQ - moveP),
          won: Math.max(2, prev.won + moveP),
        }
      })
      setTick((t) => t + 1)
    }, 2500)
    return () => clearInterval(id)
  }, [])

  const total = useMemo(() => STAGES.reduce((a, k) => a + counts[k], 0), [counts])
  const conversion = total ? Math.round((counts.won / total) * 100) : 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/30">
          PIPELINE / TICK {tick}
        </span>
        <span className="font-mono text-[10px] text-emerald-400/70">{conversion}% conversion</span>
      </div>

      {/* Stage pipeline */}
      <div className="grid grid-cols-4 gap-2">
        {STAGES.map((stage) => (
          <div key={stage} className="rounded-lg border border-white/6 bg-white/2 p-3 text-center">
            <div className={`mb-1 text-xl font-semibold tabular-nums ${STAGE_ACCENT[stage]}`}>
              {counts[stage]}
            </div>
            <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">{stage}</div>
          </div>
        ))}
      </div>

      {/* Conversion bar */}
      <div className="rounded-lg border border-white/6 bg-white/2 p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/25">
            Automation Conversion
          </span>
          <span className="font-mono text-[10px] text-emerald-400">{conversion}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-sky-400 transition-all duration-700"
            style={{ width: `${conversion}%` }}
          />
        </div>
      </div>

      {/* Flow diagram */}
      <div className="flex items-center gap-1">
        {STAGES.map((stage, i) => (
          <div key={stage} className="flex flex-1 items-center gap-1">
            <div className="flex-1 rounded border border-white/6 bg-white/2 px-2 py-1.5 text-center">
              <div className={`font-mono text-[9px] uppercase tracking-[0.1em] ${STAGE_ACCENT[stage]}`}>
                {stage}
              </div>
            </div>
            {i < STAGES.length - 1 && (
              <span className="shrink-0 font-mono text-[10px] text-white/15">→</span>
            )}
          </div>
        ))}
      </div>

      <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/15">
        AI-qualified pipeline · simulation mode · updates every 2.5s
      </div>
    </div>
  )
}
