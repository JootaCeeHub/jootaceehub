'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown, Filter, Check, Palette } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdmin } from '@/lib/admin/store'
import type { AdminPanel, StudioPanelConfig } from '@/lib/admin/types'
import { ALL_PANELS, NAV_GROUPS_META, SLabel, Swatch } from './primitives'

// ─── Card style visual config ─────────────────────────────────────────────────

type CardStyle = 'filled' | 'glass' | 'outlined' | 'flat'

const CARD_STYLES: Array<{ id: CardStyle; label: string; desc: string; preview: string }> = [
  { id: 'filled',   label: 'Filled',   desc: 'Solid background, subtle border', preview: 'bg-white/[0.025] border border-white/8' },
  { id: 'glass',    label: 'Glass',    desc: 'Transparent with luminous border', preview: 'bg-white/[0.04] border border-white/15 backdrop-blur' },
  { id: 'outlined', label: 'Outlined', desc: 'Transparent, prominent border',    preview: 'bg-transparent border border-white/25' },
  { id: 'flat',     label: 'Flat',     desc: 'No border, no fill — minimal',    preview: 'bg-transparent' },
]

const ACCENT_PRESETS = ['#22d3ee', '#a78bfa', '#34d399', '#f43f5e', '#f59e0b', '#818cf8', '#fb923c', '#f472b6']

const WIDTH_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'auto', label: 'Auto'      },
  { value: 'sm',   label: 'Compact'   },
  { value: 'md',   label: 'Normal'    },
  { value: 'lg',   label: 'Wide'      },
  { value: 'full', label: 'Full'      },
]

// ─── Mini card preview ────────────────────────────────────────────────────────

function CardPreview({ style, accent, opacity, border }: {
  style: CardStyle; accent: string; opacity: number; border: number
}) {
  const bg = style === 'flat' || style === 'outlined'
    ? 'transparent'
    : style === 'glass'
    ? `rgba(255,255,255,${(opacity / 100) * 1.8})`
    : `rgba(255,255,255,${opacity / 100})`
  const borderColor = style === 'flat'
    ? 'transparent'
    : style === 'outlined'
    ? `rgba(255,255,255,${border / 100 * 0.6})`
    : style === 'glass'
    ? `rgba(255,255,255,${border / 100 * 0.3})`
    : `rgba(255,255,255,${border / 100 * 0.15})`

  return (
    <div className="overflow-hidden rounded-xl" style={{ background: bg, border: `1px solid ${borderColor}`, padding: '10px 12px' }}>
      <div className="mb-2 flex items-center gap-1.5">
        <div className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
        <div className="h-0.5 w-14 rounded-full bg-white/20" />
      </div>
      <div className="space-y-1">
        <div className="h-0.5 w-full rounded-full bg-white/12" />
        <div className="h-0.5 w-3/4 rounded-full bg-white/8" />
        <div className="h-0.5 w-1/2 rounded-full bg-white/6" />
      </div>
      {style === 'glass' && (
        <div className="mt-2 h-px rounded-full" style={{ background: `linear-gradient(90deg, ${accent}30, transparent)` }} />
      )}
    </div>
  )
}

// ─── Per-panel design row ─────────────────────────────────────────────────────

function PanelDesignRow({
  panel, override, groupPanels, isFirst, isLast,
  onOverride, onReorder,
}: {
  panel: typeof ALL_PANELS[number]
  override: StudioPanelConfig | undefined
  groupPanels: AdminPanel[]
  isFirst: boolean
  isLast: boolean
  onOverride: (id: AdminPanel, data: Partial<StudioPanelConfig>) => void
  onReorder: (id: AdminPanel, groupPanels: AdminPanel[], direction: 'up' | 'down') => void
}) {
  const [expanded, setExpanded] = useState(false)
  const Icon = panel.icon
  const effectiveStyle = override?.cardStyle
  const effectiveAccent = override?.accentOverride ?? panel.accent
  const effectiveWidth = override?.widthOverride ?? 'auto'
  const hasOverrides = !!(override?.cardStyle || override?.accentOverride || override?.widthOverride)

  return (
    <div className={cn('rounded-xl border transition-all', expanded ? 'border-white/12 bg-white/[0.03]' : 'border-white/8 bg-white/[0.02]')}>
      <div className="flex items-center gap-2 p-3">
        {/* Reorder */}
        <div className="flex flex-col gap-0.5 shrink-0">
          <button onClick={() => onReorder(panel.id, groupPanels, 'up')} disabled={isFirst}
            className={cn('rounded p-0.5 transition-colors', isFirst ? 'text-white/10 cursor-default' : 'text-white/25 hover:text-white/60')}>
            <ChevronUp className="h-3 w-3" />
          </button>
          <button onClick={() => onReorder(panel.id, groupPanels, 'down')} disabled={isLast}
            className={cn('rounded p-0.5 transition-colors', isLast ? 'text-white/10 cursor-default' : 'text-white/25 hover:text-white/60')}>
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>

        {/* Icon */}
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border"
          style={{ borderColor: `${effectiveAccent}30`, background: `${effectiveAccent}12` }}>
          <Icon className="h-3.5 w-3.5" style={{ color: effectiveAccent }} />
        </div>

        {/* Label */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[10.5px] font-medium text-white/70">{override?.customLabel ?? panel.label}</span>
            {hasOverrides && <span className="rounded-full border border-violet-400/25 bg-violet-400/8 px-1.5 py-0.5 text-[7.5px] text-violet-400">custom design</span>}
          </div>
          <p className="text-[8.5px] text-white/28">{panel.group}</p>
        </div>

        {/* Card style pills */}
        <div className="hidden sm:flex items-center gap-1">
          {(['filled', 'glass', 'outlined', 'flat'] as CardStyle[]).map(s => (
            <button key={s} onClick={() => onOverride(panel.id, { cardStyle: effectiveStyle === s ? undefined : s })}
              className={cn(
                'rounded-md border px-1.5 py-0.5 font-mono text-[7.5px] uppercase tracking-wider transition-all',
                effectiveStyle === s
                  ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-400'
                  : 'border-white/8 text-white/25 hover:text-white/50'
              )}>
              {s}
            </button>
          ))}
        </div>

        {/* Expand */}
        <button onClick={() => setExpanded(e => !e)}
          className={cn('rounded-md p-1.5 transition-colors', expanded ? 'bg-white/8 text-white/60' : 'text-white/25 hover:text-white/55')}>
          <Palette className="h-3 w-3" />
        </button>

        {/* Reset */}
        {hasOverrides && (
          <button onClick={() => onOverride(panel.id, { cardStyle: undefined, accentOverride: undefined, widthOverride: undefined })}
            className="rounded-md px-2 py-1 font-mono text-[8px] text-white/20 hover:text-rose-400/60 transition-colors">
            ×
          </button>
        )}
      </div>

      {expanded && (
        <div className="border-t border-white/5 px-3 pb-4 pt-3 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Card style override */}
            <div>
              <SLabel>Card style override</SLabel>
              <div className="grid grid-cols-2 gap-1.5">
                {CARD_STYLES.map(s => (
                  <button key={s.id} onClick={() => onOverride(panel.id, { cardStyle: effectiveStyle === s.id ? undefined : s.id })}
                    className={cn(
                      'rounded-xl border p-2 text-left transition-all',
                      effectiveStyle === s.id
                        ? 'border-white/20 bg-white/[0.06]'
                        : 'border-white/8 bg-white/[0.02] hover:border-white/14'
                    )}>
                    {effectiveStyle === s.id && (
                      <div className="mb-1 flex items-center gap-1">
                        <Check className="h-2.5 w-2.5 text-cyan-400" />
                        <span className="font-mono text-[7px] text-cyan-400 uppercase tracking-wider">active</span>
                      </div>
                    )}
                    <div className="text-[9.5px] font-semibold text-white/70">{s.label}</div>
                    <div className="text-[8px] text-white/30 mt-0.5 leading-tight">{s.desc}</div>
                  </button>
                ))}
                <button onClick={() => onOverride(panel.id, { cardStyle: undefined })}
                  className={cn(
                    'col-span-2 rounded-xl border p-2 text-center transition-all',
                    !effectiveStyle
                      ? 'border-emerald-400/25 bg-emerald-400/6 text-emerald-400'
                      : 'border-white/8 text-white/25 hover:text-white/45'
                  )}>
                  <span className="text-[9px] font-medium">Use global style</span>
                </button>
              </div>
            </div>

            {/* Accent override + preview */}
            <div className="space-y-3">
              <div>
                <SLabel>Accent color override</SLabel>
                <div className="flex flex-wrap gap-2 mb-2">
                  {ACCENT_PRESETS.map(c => (
                    <Swatch key={c} color={c}
                      selected={override?.accentOverride === c}
                      onClick={() => onOverride(panel.id, { accentOverride: override?.accentOverride === c ? undefined : c })} />
                  ))}
                </div>
                {override?.accentOverride && (
                  <div className="flex items-center gap-2 rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ background: override.accentOverride }} />
                    <input type="color" value={override.accentOverride}
                      onChange={e => onOverride(panel.id, { accentOverride: e.target.value })}
                      className="h-5 w-8 cursor-pointer rounded border-0 bg-transparent p-0" />
                    <span className="font-mono text-[9px] text-white/40">{override.accentOverride}</span>
                    <button onClick={() => onOverride(panel.id, { accentOverride: undefined })}
                      className="ml-auto font-mono text-[9px] text-white/20 hover:text-rose-400/60">×</button>
                  </div>
                )}
              </div>

              <div>
                <SLabel>Content width</SLabel>
                <div className="flex gap-1 flex-wrap">
                  {WIDTH_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => onOverride(panel.id, { widthOverride: opt.value === 'auto' ? undefined : opt.value as StudioPanelConfig['widthOverride'] })}
                      className={cn(
                        'rounded-lg border px-2.5 py-1 font-mono text-[8.5px] transition-all',
                        (effectiveWidth === opt.value || (opt.value === 'auto' && !override?.widthOverride))
                          ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-400'
                          : 'border-white/8 text-white/30 hover:text-white/55'
                      )}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mini live preview */}
              <div>
                <SLabel>Preview</SLabel>
                <div className="rounded-xl overflow-hidden p-1" style={{ background: '#060610' }}>
                  <CardPreview
                    style={effectiveStyle ?? 'filled'}
                    accent={effectiveAccent}
                    opacity={20}
                    border={50}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main section ─────────────────────────────────────────────────────────────

export function PanelDesignSection() {
  const { state, dispatch } = useAdmin()
  const cfg = state.studioConfig
  const [search, setSearch] = useState('')

  const set = (partial: Partial<typeof cfg>) =>
    dispatch({ type: 'UPDATE_STUDIO', payload: partial })

  const setOverride = (id: AdminPanel, data: Partial<StudioPanelConfig>) =>
    dispatch({ type: 'STUDIO_SET_PANEL_OVERRIDE', payload: { id, data } })

  const reorder = (id: AdminPanel, groupPanels: AdminPanel[], direction: 'up' | 'down') =>
    dispatch({ type: 'STUDIO_REORDER_PANEL', payload: { id, groupPanels, direction } })

  const getOverride = (id: AdminPanel) =>
    cfg.panelOverrides.find(p => p.id === id)

  const globalStyle  = cfg.panelCardStyle          ?? 'filled'
  const bgOpacity    = cfg.panelCardBgOpacity       ?? 20
  const borderInt    = cfg.panelCardBorderIntensity ?? 50

  const customized = cfg.panelOverrides.filter(o => o.cardStyle || o.accentOverride || o.widthOverride).length

  return (
    <div className="space-y-5">

      {/* ─ Global card design ─ */}
      <div className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <SLabel>Global card design</SLabel>
            <p className="text-[9px] text-white/30">Default style for all content cards across panels</p>
          </div>
          {customized > 0 && (
            <span className="rounded-full border border-violet-400/25 bg-violet-400/8 px-2 py-0.5 font-mono text-[8px] text-violet-400">{customized} overrides</span>
          )}
        </div>

        {/* Style picker */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {CARD_STYLES.map(s => (
            <button key={s.id} onClick={() => set({ panelCardStyle: s.id })}
              className={cn(
                'relative rounded-xl border p-3 text-left transition-all',
                globalStyle === s.id
                  ? 'border-white/22 bg-white/[0.06]'
                  : 'border-white/8 bg-white/[0.02] hover:border-white/14 hover:bg-white/[0.035]'
              )}>
              {globalStyle === s.id && (
                <div className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-400">
                  <Check className="h-2.5 w-2.5 text-black" />
                </div>
              )}
              {/* Mini style preview */}
              <div className="mb-2.5 overflow-hidden rounded-lg" style={{ background: '#060610', padding: '6px 8px' }}>
                <div
                  className="overflow-hidden rounded-lg"
                  style={{
                    background: s.id === 'flat' || s.id === 'outlined' ? 'transparent' : s.id === 'glass' ? `rgba(255,255,255,${(bgOpacity / 100) * 1.6})` : `rgba(255,255,255,${bgOpacity / 100})`,
                    border: s.id === 'flat' ? 'none' : s.id === 'outlined' ? `1px solid rgba(255,255,255,${borderInt / 100 * 0.5})` : s.id === 'glass' ? `1px solid rgba(255,255,255,${borderInt / 100 * 0.25})` : `1px solid rgba(255,255,255,${borderInt / 100 * 0.12})`,
                    padding: '6px 8px',
                  }}>
                  <div className="h-0.5 w-10 rounded-full bg-cyan-400/50 mb-1" />
                  <div className="space-y-0.5">
                    <div className="h-0.5 w-full rounded-full bg-white/15" />
                    <div className="h-0.5 w-3/4 rounded-full bg-white/10" />
                  </div>
                </div>
              </div>
              <div className="text-[9.5px] font-semibold text-white/70">{s.label}</div>
              <div className="text-[8px] text-white/28 mt-0.5 leading-tight">{s.desc}</div>
            </button>
          ))}
        </div>

        {/* BG opacity + border intensity sliders */}
        <div className="grid gap-4 sm:grid-cols-2">
          {globalStyle !== 'flat' && globalStyle !== 'outlined' && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="text-[10px] font-medium text-white/60">Background opacity</div>
                <span className="font-mono text-[10px] tabular-nums text-white/40">{bgOpacity}%</span>
              </div>
              <input type="range" min={2} max={60} step={1} value={bgOpacity}
                onChange={e => set({ panelCardBgOpacity: Number(e.target.value) })}
                className="w-full h-1 rounded-full accent-cyan-400" />
              <div className="mt-1 flex justify-between text-[8px] text-white/18">
                <span>2% ghost</span><span>60% solid</span>
              </div>
            </div>
          )}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="text-[10px] font-medium text-white/60">Border intensity</div>
              <span className="font-mono text-[10px] tabular-nums text-white/40">{borderInt}%</span>
            </div>
            <input type="range" min={0} max={100} step={5} value={borderInt}
              onChange={e => set({ panelCardBorderIntensity: Number(e.target.value) })}
              className="w-full h-1 rounded-full accent-cyan-400" />
            <div className="mt-1 flex justify-between text-[8px] text-white/18">
              <span>0% invisible</span><span>100% prominent</span>
            </div>
          </div>
        </div>

        {/* Card glow toggle */}
        <div className="flex items-center justify-between py-1.5 border-t border-white/5">
          <div>
            <div className="text-[10.5px] font-medium text-white/70">Card hover glow</div>
            <div className="mt-0.5 text-[9px] text-white/28">Subtle accent glow on card hover interaction</div>
          </div>
          <button onClick={() => set({ panelCardGlow: !(cfg.panelCardGlow ?? false) })}
            className={cn('relative h-5 w-9 rounded-full transition-colors', cfg.panelCardGlow ? 'bg-cyan-400/70' : 'bg-white/10')}>
            <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all', cfg.panelCardGlow ? 'left-[18px]' : 'left-0.5')} />
          </button>
        </div>

        {/* Global preview */}
        <div className="rounded-xl overflow-hidden p-3" style={{ background: '#060610' }}>
          <SLabel>Live preview</SLabel>
          <div className="grid grid-cols-2 gap-2">
            {[{ label: 'Overview',  accent: '#22d3ee' }, { label: 'Analytics', accent: '#f43f5e' }].map(({ label, accent }) => (
              <CardPreview key={label} style={globalStyle} accent={accent} opacity={bgOpacity} border={borderInt} />
            ))}
          </div>
        </div>
      </div>

      {/* ─ Per-panel design + reorder ─ */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.15em] text-white/55">Per-panel overrides &amp; order</span>
          <div className="h-px flex-1 bg-white/6" />
          <span className="font-mono text-[8px] text-white/25">↑↓ to reorder in sidebar</span>
        </div>

        <div className="relative">
          <Filter className="pointer-events-none absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-white/25" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter panels…"
            className="w-full rounded-lg border border-white/8 bg-white/[0.025] pl-8 pr-3 py-2 font-mono text-[10.5px] text-white/60 placeholder:text-white/20 focus:border-cyan-400/30 focus:outline-none" />
        </div>

        {NAV_GROUPS_META.map(group => {
          const groupPanels = ALL_PANELS.filter(p => p.group === group.key)
          const filtered = groupPanels.filter(p =>
            !search || p.label.toLowerCase().includes(search.toLowerCase()) || p.desc.toLowerCase().includes(search.toLowerCase())
          )
          if (filtered.length === 0) return null

          // Sort by current effective order
          const overrides = cfg.panelOverrides
          const sorted = [...groupPanels].sort((a, b) => {
            const ao = overrides.find(o => o.id === a.id)?.order ?? groupPanels.indexOf(a) * 10
            const bo = overrides.find(o => o.id === b.id)?.order ?? groupPanels.indexOf(b) * 10
            return ao - bo
          })
          const sortedFiltered = sorted.filter(p => filtered.includes(p))

          return (
            <div key={group.key} className="space-y-1.5">
              <div className="flex items-center gap-2 px-1 pt-1">
                <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: group.color }} />
                <span className="font-mono text-[8.5px] uppercase tracking-[0.18em]" style={{ color: group.color }}>{group.label}</span>
                <div className="h-px flex-1 bg-white/5" />
                <span className="font-mono text-[7.5px] text-white/20">{sortedFiltered.length} panels</span>
              </div>
              {sortedFiltered.map((panel, idx) => (
                <PanelDesignRow
                  key={panel.id}
                  panel={panel}
                  override={getOverride(panel.id)}
                  groupPanels={sortedFiltered.map(p => p.id)}
                  isFirst={idx === 0}
                  isLast={idx === sortedFiltered.length - 1}
                  onOverride={setOverride}
                  onReorder={reorder}
                />
              ))}
            </div>
          )
        })}
      </div>

      {/* ─ Quick reset ─ */}
      {customized > 0 && (
        <button
          onClick={() => {
            const cleaned = cfg.panelOverrides.map(o => ({
              id: o.id, visible: o.visible, order: o.order,
              customLabel: o.customLabel, customDesc: o.customDesc,
            }))
            dispatch({ type: 'UPDATE_STUDIO', payload: { panelOverrides: cleaned } })
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/8 py-2.5 font-mono text-[9px] uppercase tracking-widest text-white/25 transition-all hover:border-rose-400/20 hover:text-rose-400/60">
          × Reset all panel design overrides
        </button>
      )}
    </div>
  )
}
