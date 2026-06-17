'use client'

import { useAdmin } from '@/lib/admin/store'
import { STATUS_OPTIONS, CATEGORY_OPTIONS } from './constants'

export function AnalyticsTab() {
  const { state } = useAdmin()
  const projects = state.projectsRegistry

  const byStatus   = STATUS_OPTIONS.map((s) => ({ ...s, count: projects.filter((p) => p.status === s.value).length }))
  const byCategory = CATEGORY_OPTIONS.map((c) => ({ ...c, count: projects.filter((p) => p.category === c.value).length }))

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
        <div className="flex items-center gap-2 border-b border-white/8 px-4 py-2.5">
          <div className="h-1.5 w-1.5 rounded-full bg-violet-400 shrink-0" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 flex-1">Status Breakdown</span>
        </div>
        <div className="p-4 space-y-3">
          {byStatus.map((item) => (
            <div key={item.value} className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-white/40 w-20">{item.label}</span>
              <div className="flex-1 h-1 rounded-full bg-white/8 overflow-hidden">
                <div className="h-full rounded-full bg-violet-400/50 transition-all" style={{ width: `${projects.length ? (item.count / projects.length) * 100 : 0}%` }} />
              </div>
              <span className="font-mono text-[9px] text-white/30 w-4 text-right">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
        <div className="flex items-center gap-2 border-b border-white/8 px-4 py-2.5">
          <div className="h-1.5 w-1.5 rounded-full bg-violet-400 shrink-0" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 flex-1">Category Breakdown</span>
        </div>
        <div className="p-4 space-y-3">
          {byCategory.filter((c) => c.count > 0).map((item) => (
            <div key={item.value} className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-white/40 w-24">{item.label}</span>
              <div className="flex-1 h-1 rounded-full bg-white/8 overflow-hidden">
                <div className="h-full rounded-full bg-violet-400/40 transition-all" style={{ width: `${projects.length ? (item.count / projects.length) * 100 : 0}%` }} />
              </div>
              <span className="font-mono text-[9px] text-white/30 w-4 text-right">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
