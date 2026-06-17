'use client'

import { useAdmin } from '@/lib/admin/store'
import type { AuditCategory } from './utils'

interface FailingItem {
  cat:   string
  label: string
  value: string
  pass:  boolean
}

interface Props {
  categories:   AuditCategory[]
  globalScore:  number
  failingItems: FailingItem[]
}

function scoreColor(pct: number) {
  if (pct >= 85) return 'text-emerald-400'
  if (pct >= 60) return 'text-amber-400'
  return 'text-red-400'
}
function barColor(pct: number) {
  if (pct >= 85) return 'bg-emerald-400'
  if (pct >= 60) return 'bg-amber-400'
  return 'bg-red-400'
}

export function HealthScoreCard({ categories, globalScore, failingItems }: Props) {
  const { dispatch } = useAdmin()

  const totalPass = categories.reduce((a, c) => a + c.items.filter(i => i.pass).length, 0)
  const totalItems = categories.reduce((a, c) => a + c.items.length, 0)

  return (
    <div className="overflow-hidden rounded-xl border border-white/8 bg-white/[0.02]">
      <div className="flex items-center justify-between border-b border-white/8 px-4 py-2.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">
          Program Health · Full Audit
        </span>
        <button
          onClick={() => dispatch({ type: 'SET_PANEL', payload: 'analytics' })}
          className="font-mono text-[8.5px] text-white/25 hover:text-white/55 transition-colors"
        >
          Full report →
        </button>
      </div>

      <div className="grid gap-0 grid-cols-[auto_1fr]">
        <div className="flex flex-col items-center justify-center gap-0.5 border-r border-white/6 px-5 py-4">
          <div className={`font-mono text-[44px] font-bold tabular-nums leading-none ${scoreColor(globalScore)}`}>
            {globalScore}
          </div>
          <div className="font-mono text-[10px] text-white/28">/100</div>
          <div className="font-mono text-[8px] text-white/22 text-center">
            {totalPass}/{totalItems} ok
          </div>
        </div>

        <div className="px-4 py-3 space-y-2">
          {categories.map(cat => (
            <div key={cat.title} className="flex items-center gap-3">
              <span className="w-28 shrink-0 font-mono text-[9px] text-white/40 truncate">{cat.title}</span>
              <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-white/6">
                <div
                  className={`h-full rounded-full ${barColor(cat.score)}`}
                  style={{ width: `${cat.score}%` }}
                />
              </div>
              <span className={`w-7 shrink-0 font-mono text-[9px] text-right tabular-nums ${scoreColor(cat.score)}`}>
                {cat.score}
              </span>
            </div>
          ))}
        </div>
      </div>

      {failingItems.length > 0 && (
        <div className="border-t border-white/6">
          <div className="px-4 pt-2.5 pb-1 font-mono text-[8px] uppercase tracking-[0.2em] text-white/22">
            {failingItems.length} pending fix{failingItems.length > 1 ? 'es' : ''}
          </div>
          {failingItems.slice(0, 5).map(item => (
            <div key={`${item.cat}-${item.label}`} className="flex items-center gap-3 px-4 py-2 border-b border-white/5 last:border-0">
              <span className="shrink-0 rounded border border-white/10 bg-white/4 px-1.5 py-0.5 font-mono text-[7.5px] uppercase tracking-wider text-white/28">
                {item.cat.split(' ')[0]}
              </span>
              <span className="flex-1 min-w-0 font-mono text-[9.5px] text-white/50 truncate">{item.label}</span>
              <span className="shrink-0 font-mono text-[8.5px] text-white/25">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
