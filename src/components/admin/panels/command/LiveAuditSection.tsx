'use client'

import type { AuditCategory } from './utils'

const auditGrid      = 'grid gap-3 lg:grid-cols-2'
const auditCard      = 'overflow-hidden rounded-xl border border-white/8 bg-white/[0.02]'
const auditCardHdr   = 'flex items-center gap-2 border-b border-white/6 px-4 py-2.5'
const auditItem      = 'flex items-center gap-3 border-b border-white/5 last:border-0 px-4 py-2'
const auditItemLabel = 'flex-1 font-mono text-[9.5px] text-white/50'
const auditItemValue = 'font-mono text-[9px] text-white/35'
const auditBarWrap   = 'h-0.5 w-16 overflow-hidden rounded-full bg-white/6'

const auditCardDot   = (color: string) => `h-1.5 w-1.5 rounded-full ${color}`
const auditCardTitle = 'font-mono text-[10px] uppercase tracking-[0.2em] text-white/40'
const auditCardScore = (pct: number) =>
  `ml-auto font-mono text-[11px] font-semibold tabular-nums ${pct >= 85 ? 'text-emerald-400' : pct >= 60 ? 'text-amber-400' : 'text-red-400'}`
const auditItemIcon  = (pass: boolean) => `text-[10px] ${pass ? 'text-emerald-400' : 'text-red-400/70'}`
const auditItemBadge = (pass: boolean) =>
  `rounded border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider ${pass ? 'border-emerald-400/20 text-emerald-400' : 'border-red-400/20 text-red-400/70'}`
const auditBarFill   = (pct: number) =>
  `h-full rounded-full ${pct >= 85 ? 'bg-emerald-400' : pct >= 60 ? 'bg-amber-400' : 'bg-red-400'}`
const globalScoreColor = (score: number) =>
  score >= 85 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-red-400'

export function LiveAuditSection({ categories }: { categories: AuditCategory[] }) {
  const globalScore = Math.round(
    categories.reduce((acc, c) => acc + c.score, 0) / categories.length
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-cyan-400/60">Live Audit</p>
          <h3 className="text-sm font-semibold text-white/80">Estado del Programa</h3>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="font-mono text-[9px] text-white/30">Score global</span>
          <span className={`font-mono text-[18px] font-bold tabular-nums ${globalScoreColor(globalScore)}`}>
            {globalScore}
          </span>
          <span className="font-mono text-[10px] text-white/30">/100</span>
        </div>
      </div>

      <div className={auditGrid}>
        {categories.map((cat) => (
          <div key={cat.title} className={auditCard}>
            <div className={auditCardHdr}>
              <span className={auditCardDot(cat.dot)} />
              <span className={auditCardTitle}>{cat.title}</span>
              <span className={auditCardScore(cat.score)}>{cat.score}</span>
            </div>
            {cat.items.map((item) => (
              <div key={item.label} className={auditItem}>
                <span className={auditItemIcon(item.pass)}>{item.pass ? '✓' : '✗'}</span>
                <span className={auditItemLabel}>{item.label}</span>
                {item.pct !== undefined && (
                  <div className={auditBarWrap}>
                    <div className={auditBarFill(item.pct)} style={{ width: `${item.pct}%` }} />
                  </div>
                )}
                <span className={auditItemValue}>{item.value}</span>
                <span className={auditItemBadge(item.pass)}>{item.pass ? 'ok' : 'fix'}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
