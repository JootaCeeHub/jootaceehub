'use client'

import { useEffect, useMemo, useState } from 'react'

type Stage = 'lead' | 'qualified' | 'proposal' | 'won'

const stageOrder: Stage[] = ['lead', 'qualified', 'proposal', 'won']

export function CRMLab() {
  const [counts, setCounts] = useState<Record<Stage, number>>({
    lead: 22,
    qualified: 14,
    proposal: 8,
    won: 4,
  })

  useEffect(() => {
    const id = setInterval(() => {
      setCounts((prev) => {
        const moveLead = Math.min(prev.lead, Math.round(Math.random() * 2))
        const moveQualified = Math.min(prev.qualified, Math.round(Math.random() * 2))
        const moveProposal = Math.min(prev.proposal, Math.round(Math.random() * 1))

        return {
          lead: Math.max(12, prev.lead - moveLead + Math.round(Math.random() * 2)),
          qualified: Math.max(8, prev.qualified + moveLead - moveQualified),
          proposal: Math.max(5, prev.proposal + moveQualified - moveProposal),
          won: Math.max(2, prev.won + moveProposal),
        }
      })
    }, 2500)

    return () => clearInterval(id)
  }, [])

  const conversion = useMemo(() => {
    const total = stageOrder.reduce((acc, key) => acc + counts[key], 0)
    return total ? Math.round((counts.won / total) * 100) : 0
  }, [counts])

  return (
    <div className="glass rounded-2xl p-5">
      <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-primary">CRM / Pipeline Automation</p>
      <div className="grid grid-cols-4 gap-2">
        {stageOrder.map((stage) => (
          <div key={stage} className="rounded-lg border border-border bg-card/55 p-2 text-center">
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{stage}</p>
            <p className="text-lg font-semibold text-foreground">{counts[stage]}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-border bg-card/55 p-3">
        <p className="mb-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Automation conversion</p>
        <div className="h-2 overflow-hidden rounded-full bg-secondary/80">
          <div className="h-full bg-gradient-to-r from-primary to-cyan-200" style={{ width: `${conversion}%` }} />
        </div>
        <p className="mt-1 text-xs text-foreground">{conversion}% won through automation-assisted flows</p>
      </div>
    </div>
  )
}
