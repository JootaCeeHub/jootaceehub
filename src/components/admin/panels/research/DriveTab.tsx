'use client'

import { useState } from 'react'
import { useAdmin } from '@/lib/admin/store'
import type { DriveResourceType } from '@/lib/admin/types'
import { DRIVE_TYPES } from './utils'
import { TagChips } from './TagChips'

export function DriveTab() {
  const { state, dispatch } = useAdmin()
  const [filterType, setFilterType] = useState<DriveResourceType | 'all'>('all')

  const resources = state.driveResources
  const filtered = filterType === 'all' ? resources : resources.filter((r) => r.resourceType === filterType)

  // suppress unused warning — dispatch used in JSX below
  void dispatch

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {DRIVE_TYPES.map((t) => {
          const count = resources.filter((r) => r.resourceType === t.id).length
          if (count === 0) return null
          return (
            <button key={t.id} onClick={() => setFilterType(filterType === t.id ? 'all' : t.id)} className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 font-mono text-[9px] transition-colors ${filterType === t.id ? 'border-white/20 bg-white/8 text-white/70' : 'border-white/8 bg-white/[0.02] text-white/35 hover:text-white/55'}`}>
              <span>{t.icon}</span>
              <span style={{ color: t.color }}>{count}</span>
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex flex-wrap gap-1 flex-1">
          {(['all', ...DRIVE_TYPES.map((t) => t.id)] as (DriveResourceType | 'all')[]).map((type) => {
            const info = type === 'all' ? { label: 'Todos', icon: '🗂️' } : DRIVE_TYPES.find((t) => t.id === type)
            return (
              <button key={type} onClick={() => setFilterType(type)} className={filterType === type ? 'rounded-full border border-white/20 bg-white/8 px-2 py-0.5 font-mono text-[8px] text-white/60 transition-colors' : 'rounded-full border border-white/10 px-2 py-0.5 font-mono text-[8px] text-white/30 hover:text-white/55 transition-colors'}>
                {info?.icon} {info?.label ?? type}
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        {filtered.map((res) => {
          const typeInfo = DRIVE_TYPES.find((t) => t.id === res.resourceType)
          return (
            <div key={res.id} className={res.published ? 'overflow-hidden rounded-xl border border-emerald-400/12 bg-white/[0.02]' : 'overflow-hidden rounded-xl border border-white/5 bg-white/[0.01] opacity-60'}>
              <div className="flex items-start gap-3 px-4 py-3">
                <div className="flex flex-1 items-start gap-3 min-w-0">
                  <span className="mt-0.5 text-[18px] shrink-0" style={{ color: typeInfo?.color }}>{typeInfo?.icon ?? '📁'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-medium text-white/75">{res.title}</div>
                    <div className="font-mono text-[8.5px] mt-0.5" style={{ color: typeInfo?.color }}>{typeInfo?.label}</div>
                    {res.description && <div className="text-[10px] text-white/40 mt-1 leading-snug">{res.description}</div>}
                    {res.tags.length > 0 && <TagChips tags={res.tags} />}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <a href={res.driveUrl} target="_blank" rel="noreferrer" className="rounded border border-white/10 px-1.5 py-0.5 font-mono text-[9px] text-white/30 hover:border-white/20 hover:text-white/60 transition-colors">↗ Drive</a>
                  <button onClick={() => dispatch({ type: 'UPDATE_DRIVE_RESOURCE', payload: { id: res.id, data: { published: !res.published } } })} className={res.published ? 'rounded border border-emerald-400/20 text-emerald-400/70 bg-emerald-400/5 px-1.5 py-0.5 font-mono text-[8px] uppercase transition-colors' : 'rounded border border-white/10 text-white/25 px-1.5 py-0.5 font-mono text-[8px] uppercase hover:border-white/20 transition-colors'}>
                    {res.published ? 'pub' : 'draft'}
                  </button>
                  <button onClick={() => dispatch({ type: 'REMOVE_DRIVE_RESOURCE', payload: res.id })} className="rounded border border-red-400/10 px-1.5 py-0.5 font-mono text-[9px] text-red-400/25 hover:border-red-400/30 hover:text-red-400/70 transition-colors">✕</button>
                </div>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && <div className="rounded-xl border border-white/5 bg-white/[0.01] py-8 text-center"><div className="text-[11px] text-white/20 max-w-xs mx-auto leading-relaxed">No Drive resources. Add Markdown files, automations, configs, etc.</div></div>}
      </div>
    </div>
  )
}
