'use client'

import { useAdmin } from '@/lib/admin/store'
import { buildPanelStatus } from './utils'

function dot(st: 'ok' | 'warn' | 'empty') {
  return `h-1.5 w-1.5 rounded-full shrink-0 ${st === 'ok' ? 'bg-emerald-400' : st === 'warn' ? 'bg-amber-400 animate-pulse' : 'bg-white/18'}`
}
function legDot(st: 'ok' | 'warn' | 'empty') {
  return `h-1.5 w-1.5 rounded-full ${st === 'ok' ? 'bg-emerald-400' : st === 'warn' ? 'bg-amber-400' : 'bg-white/18'}`
}
function item(status: 'ok' | 'warn' | 'empty') {
  return `group flex flex-col gap-1 bg-black/30 p-3 text-left transition-all cursor-pointer hover:bg-white/[0.03] ${status === 'ok' ? 'hover:border-b hover:border-emerald-400/20' : status === 'warn' ? 'hover:border-b hover:border-amber-400/20' : ''}`
}

export function PanelStatusMap() {
  const { state, dispatch } = useAdmin()
  const panelStatuses = buildPanelStatus(state)

  return (
    <div className="overflow-hidden rounded-xl border border-white/8 bg-white/[0.02]">
      <div className="flex items-center justify-between border-b border-white/8 px-4 py-2.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">Panel Status Map</span>
        <span className="font-mono text-[9px] text-white/22">
          {panelStatuses.filter(p => p.status === 'ok').length} ok ·{' '}
          {panelStatuses.filter(p => p.status === 'warn').length} warn ·{' '}
          {panelStatuses.filter(p => p.status === 'empty').length} empty
        </span>
      </div>
      <div className="grid grid-cols-3 gap-px bg-white/4 sm:grid-cols-6">
        {panelStatuses.map(p => (
          <button key={p.id} onClick={() => dispatch({ type: 'SET_PANEL', payload: p.id })} className={item(p.status)}>
            <div className="flex items-center gap-1.5">
              <span className={dot(p.status)} />
              <span className="font-mono text-[9.5px] text-white/55 group-hover:text-white/75 transition-colors">{p.label}</span>
            </div>
            <span className="font-mono text-[7.5px] text-white/20 truncate group-hover:text-white/35 transition-colors">{p.detail}</span>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-4 border-t border-white/6 px-4 py-2">
        {(['ok', 'warn', 'empty'] as const).map(status => (
          <div key={status} className="flex items-center gap-1.5 font-mono text-[8px] text-white/25">
            <span className={legDot(status)} />
            <span className="capitalize">{status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
