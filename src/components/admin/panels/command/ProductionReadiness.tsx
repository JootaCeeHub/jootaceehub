'use client'

import { CheckCircle2 } from 'lucide-react'
import { useAdmin } from '@/lib/admin/store'
import type { buildProductionReadiness } from './utils'

type ProdReadiness = ReturnType<typeof buildProductionReadiness>

interface Props {
  readiness: ProdReadiness
}

function scoreColor(pct: number) {
  if (pct >= 90) return 'text-emerald-400'
  if (pct >= 70) return 'text-amber-400'
  return 'text-red-400'
}
function barColor(pct: number) {
  if (pct >= 90) return 'bg-emerald-400'
  if (pct >= 70) return 'bg-amber-400'
  return 'bg-red-400/80'
}

export function ProductionReadiness({ readiness }: Props) {
  const { dispatch } = useAdmin()

  return (
    <div className="overflow-hidden rounded-xl border border-white/8 bg-white/[0.02]">
      <div className="flex items-center justify-between border-b border-white/8 px-4 py-2.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">
          Production Readiness · Go-live Checklist
        </span>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[9px] text-white/22">
            {readiness.passing}/{readiness.items.length} checks
          </span>
          <button
            onClick={() => dispatch({ type: 'SET_PANEL', payload: 'analytics' })}
            className="font-mono text-[8.5px] text-white/25 hover:text-white/55 transition-colors"
          >
            Full audit →
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 border-b border-white/6 px-4 py-3">
        <div className="flex-1 h-2 overflow-hidden rounded-full bg-white/6">
          <div
            className={`h-full rounded-full ${barColor(readiness.score)}`}
            style={{ width: `${readiness.score}%` }}
          />
        </div>
        <span className={`shrink-0 font-mono text-[13px] font-bold tabular-nums ${scoreColor(readiness.score)}`}>
          {readiness.score}%
        </span>
        <span className="shrink-0 font-mono text-[10px] text-white/28">ready to ship</span>
      </div>

      {readiness.items.filter(i => !i.pass).length === 0 ? (
        <div className="flex items-center gap-2 px-4 py-3 font-mono text-[10px] text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5" />
          All {readiness.items.length} checks pass — platform is ready to ship
        </div>
      ) : (
        <div className="grid gap-0 lg:grid-cols-2">
          <div>
            {readiness.items.filter(i => !i.pass).map(item => (
              <div key={item.label} className="flex items-center gap-2.5 px-4 py-2 border-b border-white/5 last:border-0">
                <span className="w-3 shrink-0 font-mono text-[9px] text-red-400/70">✗</span>
                <span className="shrink-0 rounded border border-white/10 bg-white/4 px-1.5 py-0.5 font-mono text-[7.5px] uppercase tracking-wider text-white/26">
                  {item.cat}
                </span>
                <span className="flex-1 min-w-0 font-mono text-[9.5px] truncate text-white/60">{item.label}</span>
              </div>
            ))}
          </div>
          <div>
            {readiness.items.filter(i => i.pass).map(item => (
              <div key={item.label} className="flex items-center gap-2.5 px-4 py-2 border-b border-white/5 last:border-0">
                <span className="w-3 shrink-0 font-mono text-[9px] text-emerald-400">✓</span>
                <span className="shrink-0 rounded border border-white/10 bg-white/4 px-1.5 py-0.5 font-mono text-[7.5px] uppercase tracking-wider text-white/26">
                  {item.cat}
                </span>
                <span className="flex-1 min-w-0 font-mono text-[9.5px] truncate text-white/40">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
