'use client'

import { cn } from '@/lib/utils'

// ─── Input class strings ───────────────────────────────────────────────────────

export const inp  = "w-full rounded-lg border border-white/10 bg-white/4 px-3 py-1.5 text-[11px] text-white/75 placeholder-white/15 focus:outline-none focus:border-cyan-400/40 transition-colors"
export const area = "w-full rounded-lg border border-white/10 bg-white/4 px-3 py-2 text-[11px] text-white/75 placeholder-white/15 focus:outline-none focus:border-cyan-400/40 transition-colors resize-none leading-relaxed"

// ─── Field wrapper ─────────────────────────────────────────────────────────────

export function F({ l, children }: { l: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/40">{l}</label>
      {children}
    </div>
  )
}

// ─── Toggle ────────────────────────────────────────────────────────────────────

export function Tog({ label, on, toggle }: { label: string; on: boolean; toggle: () => void }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-[11px] text-white/65">{label}</span>
      <button onClick={toggle}
        className={cn('relative h-5 w-9 shrink-0 rounded-full border transition-all',
          on ? 'border-cyan-400/40 bg-cyan-400/20' : 'border-white/15 bg-white/5')}>
        <span className={cn('absolute top-0.5 h-4 w-4 rounded-full transition-all duration-200',
          on ? 'left-[18px] bg-cyan-400' : 'left-0.5 bg-white/30')} />
      </button>
    </div>
  )
}

// ─── Slider ────────────────────────────────────────────────────────────────────

export function Slider({ label, value, min, max, step = 0.05, onChange }: {
  label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-white/35">{label}</span>
        <span className="font-mono text-[9px] text-white/45">{Math.round(value * 100) / 100}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="h-1 w-full cursor-pointer appearance-none rounded bg-white/10 accent-cyan-400" />
    </div>
  )
}

// ─── I18n row ──────────────────────────────────────────────────────────────────

export function I18nRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-white/6 bg-white/[0.015] px-3 py-2">
      <span className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-white/30 shrink-0 min-w-[70px]">{label}</span>
      <span className="text-[11px] text-white/60 leading-relaxed">{value}</span>
    </div>
  )
}

// ─── Status color maps (shared across multiple editors) ────────────────────────

export const STATUS_COL_SYS: Record<string, string>  = { operational: '#34d399', degraded: '#fbbf24', maintenance: '#94a3b8', offline: '#f87171' }
export const STATUS_COL_LAB: Record<string, string>  = { live: '#34d399', beta: '#60a5fa', rd: '#a78bfa', roadmap: '#94a3b8' }
export const STATUS_COL_PROJ: Record<string, string> = { live: '#34d399', beta: '#60a5fa', wip: '#fbbf24', archived: '#94a3b8' }
export const STATUS_COL_NODE: Record<string, string> = { running: '#34d399', stopped: '#f87171', degraded: '#fbbf24' }
export const CAT_COL: Record<string, string> = { opinion: '#a78bfa', research: '#34d399', essays: '#fbbf24', news: '#38bdf8' }
export const LINK_CAT_COL: Record<string, string> = {
  tools: '#34d399', articles: '#a78bfa', repos: '#60a5fa', videos: '#f472b6',
  docs: '#fbbf24', agents: '#fb923c', automations: '#38bdf8', other: '#94a3b8',
}
export const SOURCE_TYPE_COL: Record<string, string> = {
  newsletter: '#60a5fa', blog: '#34d399', youtube: '#f87171',
  podcast: '#a78bfa', github: '#94a3b8', twitter: '#38bdf8', other: '#fbbf24',
}
export const LANG_COL: Record<string, string> = {
  typescript: '#3178c6', javascript: '#f7df1e', python: '#3572A5',
  rust: '#dea584', go: '#00ADD8', css: '#563d7c', html: '#e34c26',
  mdx: '#fcb32c', shell: '#89e051',
}
