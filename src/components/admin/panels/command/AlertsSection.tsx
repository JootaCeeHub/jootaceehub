'use client'

import { AlertTriangle } from 'lucide-react'
import { useAdmin } from '@/lib/admin/store'
import type { Alert } from '@/lib/analytics/alerts'

interface AlertCounts { critical: number; warning: number; info: number }

interface Props {
  activeAlerts: Alert[]
  alertCounts:  AlertCounts
}

function alertRow(sev: string) {
  const m: Record<string, string> = { critical: 'border-l-2 border-red-400/60', warning: 'border-l-2 border-amber-400/50', info: 'border-l-2 border-sky-400/30' }
  return `flex items-center gap-3 px-4 py-2.5 ${m[sev] ?? ''}`
}
function alertDot(sev: string) {
  const m: Record<string, string> = { critical: 'bg-red-400', warning: 'bg-amber-400', info: 'bg-sky-400' }
  return `h-1.5 w-1.5 shrink-0 rounded-full ${m[sev] ?? 'bg-white/20'}`
}

export function AlertsSection({ activeAlerts, alertCounts }: Props) {
  const { dispatch } = useAdmin()

  if (activeAlerts.length === 0) return null

  return (
    <div className="overflow-hidden rounded-xl border border-amber-400/20 bg-amber-400/[0.03]">
      <div className="flex items-center gap-2 border-b border-amber-400/12 px-4 py-2.5">
        <AlertTriangle className="h-3 w-3 text-amber-400/80" />
        <span className="flex-1 font-mono text-[9.5px] uppercase tracking-[0.18em] text-amber-400/80">
          {alertCounts.critical > 0
            ? `${alertCounts.critical} critical · ${alertCounts.warning} warning`
            : `${alertCounts.warning} warning · ${alertCounts.info} info`}
        </span>
        <button
          onClick={() => dispatch({ type: 'SET_PANEL', payload: 'analytics' })}
          className="font-mono text-[8.5px] text-white/25 hover:text-white/55 transition-colors"
        >
          Full audit →
        </button>
      </div>
      <div className="divide-y divide-white/5">
        {activeAlerts.slice(0, 4).map(a => (
          <div key={a.id} className={alertRow(a.severity)}>
            <span className={alertDot(a.severity)} />
            <span className="shrink-0 rounded border border-white/10 bg-white/4 px-1.5 py-0.5 font-mono text-[7.5px] uppercase tracking-wider text-white/28">
              {a.category}
            </span>
            <span className="flex-1 font-mono text-[9.5px] text-white/65">{a.message}</span>
            {a.value && <span className="shrink-0 font-mono text-[9px] font-bold text-white/50">{a.value}</span>}
            {a.hint  && <span className="hidden font-mono text-[8px] text-white/25 lg:block shrink-0 max-w-[200px] truncate">{a.hint}</span>}
          </div>
        ))}
        {activeAlerts.length > 4 && (
          <div className="px-4 py-1.5 font-mono text-[8px] text-white/25">
            +{activeAlerts.length - 4} more alerts — click Full audit
          </div>
        )}
      </div>
    </div>
  )
}
