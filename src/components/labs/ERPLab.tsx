'use client'

import { useEffect, useState } from 'react'

export function ERPLab() {
  const [throughput, setThroughput] = useState(128)
  const [automation, setAutomation] = useState(84)
  const [workflowHealth, setWorkflowHealth] = useState(97)

  useEffect(() => {
    const id = setInterval(() => {
      setThroughput((v) => Math.max(95, Math.min(165, v + Math.round((Math.random() - 0.5) * 8))))
      setAutomation((v) => Math.max(70, Math.min(97, v + Math.round((Math.random() - 0.5) * 3))))
      setWorkflowHealth((v) => Math.max(90, Math.min(99, v + Math.round((Math.random() - 0.5) * 2))))
    }, 2200)

    return () => clearInterval(id)
  }, [])

  return (
    <div className="glass rounded-2xl p-5">
      <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-primary">ERP / Operational Analytics</p>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border bg-card/55 p-3">
          <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">Throughput</p>
          <p className="text-lg font-semibold text-foreground">{throughput}/h</p>
        </div>
        <div className="rounded-lg border border-border bg-card/55 p-3">
          <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">Automation</p>
          <p className="text-lg font-semibold text-foreground">{automation}%</p>
        </div>
        <div className="rounded-lg border border-border bg-card/55 p-3">
          <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">Health</p>
          <p className="text-lg font-semibold text-foreground">{workflowHealth}%</p>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-xs text-muted-foreground">
        <p className="data-line pl-4">Procurement pipeline synced with inventory planner.</p>
        <p className="data-line pl-4">Billing batch closed with no integrity violations.</p>
        <p className="data-line pl-4">Manufacturing queue reprioritized by AI scheduler.</p>
      </div>
    </div>
  )
}
