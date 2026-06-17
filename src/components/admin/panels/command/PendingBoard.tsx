'use client'

import { CheckCircle2, Target } from 'lucide-react'
import { useAdmin } from '@/lib/admin/store'
import type { AdminPanel } from '@/lib/admin/types'

interface PendingAction {
  label: string
  cat:   string
  value: string
  panel: AdminPanel | null
}

interface Props {
  pendingActions: PendingAction[]
}

export function PendingBoard({ pendingActions }: Props) {
  const { dispatch } = useAdmin()

  return (
    <div className="overflow-hidden rounded-xl border border-rose-400/12 bg-rose-400/[0.02]">
      <div className="flex items-center gap-2 border-b border-rose-400/8 px-4 py-2.5">
        <Target className="h-3 w-3 text-rose-400/60" />
        <span className="flex-1 font-mono text-[9.5px] uppercase tracking-[0.18em] text-rose-400/60">
          Pending Actions · {pendingActions.length === 0 ? 'All clear' : `${pendingActions.length} item${pendingActions.length !== 1 ? 's' : ''} to fix`}
        </span>
        {pendingActions.length > 0 && (
          <span className="font-mono text-[9px] text-white/22">
            {pendingActions.filter(a => a.panel).length} actionable
          </span>
        )}
      </div>

      {pendingActions.length === 0 ? (
        <div className="flex items-center gap-2 px-4 py-3 font-mono text-[10px] text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5" />
          All audit + production checks pass — ready to ship
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {pendingActions.slice(0, 12).map(action => (
            <div key={action.label} className="flex items-center gap-2.5 px-4 py-2 hover:bg-white/[0.015] transition-colors">
              <span className="shrink-0 rounded border border-white/10 bg-white/4 px-1.5 py-0.5 font-mono text-[7.5px] uppercase tracking-wider text-white/28">
                {action.cat.slice(0, 10)}
              </span>
              <span className="flex-1 min-w-0 font-mono text-[9.5px] text-white/60 truncate">{action.label}</span>
              {action.value !== '—' && (
                <span className="shrink-0 font-mono text-[8.5px] text-white/28">{action.value}</span>
              )}
              {action.panel ? (
                <button
                  onClick={() => dispatch({ type: 'SET_PANEL', payload: action.panel! })}
                  className="shrink-0 font-mono text-[8.5px] text-sky-400/55 hover:text-sky-400 transition-colors"
                >
                  Fix →
                </button>
              ) : (
                <span className="shrink-0 font-mono text-[8.5px] text-white/28">manual</span>
              )}
            </div>
          ))}
          {pendingActions.length > 12 && (
            <div className="px-4 py-1.5 font-mono text-[8px] text-white/22">
              +{pendingActions.length - 12} more items
            </div>
          )}
        </div>
      )}
    </div>
  )
}
