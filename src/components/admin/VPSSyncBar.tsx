'use client'

import { cn } from '@/lib/utils'
import { useAdmin } from '@/lib/admin/store'

const STATE_CONFIG = {
  idle:       { dot: 'bg-white/20',    text: 'text-white/30',    label: 'VPS' },
  saving:     { dot: 'bg-amber-400 animate-pulse',  text: 'text-amber-400',  label: 'Saving…' },
  saved:      { dot: 'bg-cyan-400',    text: 'text-cyan-400',    label: 'Saved' },
  validating: { dot: 'bg-violet-400 animate-pulse', text: 'text-violet-400', label: 'Validating…' },
  building:   { dot: 'bg-blue-400 animate-pulse',   text: 'text-blue-400',   label: 'Building…' },
  deployed:   { dot: 'bg-emerald-400', text: 'text-emerald-400', label: 'Deployed' },
  failed:     { dot: 'bg-red-400',     text: 'text-red-400',     label: 'Failed' },
} as const

export function VPSSyncBar() {
  const { state, dispatch } = useAdmin()
  const { state: syncState, message, error } = state.vpsStatus

  const cfg = STATE_CONFIG[syncState] ?? STATE_CONFIG.idle
  const isActive = syncState !== 'idle'

  return (
    <button
      title={error ?? message ?? 'VPS sync status'}
      onClick={() => {
        if (syncState === 'failed') dispatch({ type: 'CLEAR_VPS_ERROR' })
        else dispatch({ type: 'SET_PANEL', payload: 'vps' })
      }}
      className={cn(
        'hidden items-center gap-1.5 rounded border border-white/6 bg-white/[0.02] px-2 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.12em] transition-colors sm:inline-flex',
        isActive ? 'hover:bg-white/5' : 'hover:bg-white/[0.03]',
        cfg.text,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', cfg.dot)} />
      <span>{cfg.label}</span>
    </button>
  )
}
