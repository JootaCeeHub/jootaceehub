'use client'

import { useState, useEffect } from 'react'
import { Check, RefreshCw, Globe, Palette, Sliders, Layers, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdmin } from '@/lib/admin/store'
import { getPaletteColors } from './design/primitives'
import { ColorsTab }     from './design/ColorsTab'
import { GlowTab }       from './design/GlowTab'
import { ComponentsTab } from './design/ComponentsTab'
import { TokensTab }     from './design/TokensTab'
import { PreviewTab }    from './design/PreviewTab'

// ─── Main panel tabs ──────────────────────────────────────────────────────────

type DesignTab = 'palette' | 'glow' | 'components' | 'tokens' | 'preview'

const DESIGN_TABS: { id: DesignTab; label: string; icon: React.ReactNode }[] = [
  { id: 'palette',    label: 'Colors',     icon: <Palette className="h-3.5 w-3.5" /> },
  { id: 'glow',       label: 'Glow',       icon: <Sparkles className="h-3.5 w-3.5" /> },
  { id: 'components', label: 'Components', icon: <Layers className="h-3.5 w-3.5" /> },
  { id: 'tokens',     label: 'Tokens',     icon: <Sliders className="h-3.5 w-3.5" /> },
  { id: 'preview',    label: 'Preview',    icon: <Globe className="h-3.5 w-3.5" /> },
]

// ─── Main export ──────────────────────────────────────────────────────────────

export default function DesignPanel() {
  const { state, forceSave } = useAdmin()
  const { design } = state
  const { tokens } = design
  const [tab, setTab] = useState<DesignTab>('palette')
  const [lastApplied, setLastApplied] = useState<number | null>(null)

  useEffect(() => {
    const onSave = () => setLastApplied(Date.now())
    window.addEventListener('admin-state-saved', onSave)
    return () => window.removeEventListener('admin-state-saved', onSave)
  }, [])

  const { primary } = getPaletteColors(design)
  const secondsSince = lastApplied ? Math.round((Date.now() - lastApplied) / 1000) : null // eslint-disable-line react-hooks/purity

  return (
    <div className="space-y-4">
      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.24em] text-indigo-400/60">
            Visual Engine · Design System
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-white/90">Design System</h1>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white/25">
            {design.palette} · {tokens.typography} · {tokens.borderRadius} · {tokens.cardStyle}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn(
            'flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[8px] transition-all',
            secondsSince !== null
              ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
              : 'border-white/10 text-white/25'
          )}>
            {secondsSince !== null ? (
              <>
                <Check className="h-2.5 w-2.5" />
                Applied to website · {secondsSince < 5 ? 'just now' : `${secondsSince}s ago`}
              </>
            ) : (
              <>
                <Globe className="h-2.5 w-2.5" />
                Saved changes apply to website
              </>
            )}
          </div>
          <button type="button" onClick={forceSave}
            className="flex items-center gap-1.5 rounded-full border border-indigo-400/30 bg-indigo-400/10 px-2.5 py-1 font-mono text-[8px] text-indigo-300 hover:bg-indigo-400/20 transition-all">
            <RefreshCw className="h-2.5 w-2.5" />
            Force apply
          </button>
        </div>
      </div>

      {/* ── Tab selector ──────────────────────────────────────────────────────── */}
      <div className="flex gap-1 rounded-xl border border-white/8 bg-black/20 p-0.5">
        {DESIGN_TABS.map(t => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[10px] font-medium transition-all duration-150',
              tab === t.id
                ? 'bg-indigo-500/90 text-white shadow-sm'
                : 'text-white/35 hover:text-white/65 hover:bg-white/5'
            )}>
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ───────────────────────────────────────────────────────── */}
      <div
        className="rounded-xl border border-white/5 bg-white/[0.01] p-1"
        style={{ '--tw-ring-color': `${primary}20` } as React.CSSProperties}
      >
        {tab === 'palette'    && <ColorsTab />}
        {tab === 'glow'       && <GlowTab />}
        {tab === 'components' && <ComponentsTab />}
        {tab === 'tokens'     && <TokensTab />}
        {tab === 'preview'    && <PreviewTab />}
      </div>
    </div>
  )
}
