'use client'

import { useCallback } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { StudioConfig } from '@/lib/admin/types'
import { SLabel, Row, Toggle, Sel, Swatch, BUILTIN_PRESETS, getHarmonics, getTintScale } from './primitives'

const ACCENT_PRESETS = ['#22d3ee', '#a78bfa', '#34d399', '#f43f5e', '#f59e0b', '#818cf8', '#fb923c', '#f472b6']

const BG_MAP: Record<StudioConfig['backgroundStyle'], string> = {
  midnight: '#060610', dark: '#0a0a14', slate: '#0f172a', void: '#000000',
}

interface Props {
  cfg: StudioConfig
  set: (partial: Partial<StudioConfig>) => void
  tintCopied: string | null
  onCopyTint: (hex: string) => void
}

export function AppearanceSection({ cfg, set, tintCopied, onCopyTint }: Props) {
  const accentDisplay = cfg.useCustomAccent ? cfg.accentColor : '#22d3ee'
  const harmonics     = getHarmonics(accentDisplay)
  const tintScale     = getTintScale(accentDisplay)
  const bgColor       = BG_MAP[cfg.backgroundStyle]

  const applyBuiltinPreset = useCallback((p: typeof BUILTIN_PRESETS[number]) => set({
    backgroundStyle: p.bg, sidebarStyle: p.sidebar,
    accentColor: p.accent, useCustomAccent: true,
    borderRadius: p.borderRadius, glowEffect: p.glowEffect,
    sidebarBorder: p.sidebarBorder, activePreset: p.id,
  }), [set])

  return (
    <div className="space-y-3">
      {/* Color system */}
      <div className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3">
        <SLabel>Color system</SLabel>
        <div className="divide-y divide-white/5">
          <Row label="Background">
            <Sel value={cfg.backgroundStyle} onChange={v => set({ backgroundStyle: v })} options={[
              { value: 'midnight', label: 'Midnight (#060610)' },
              { value: 'dark',     label: 'Dark (#0a0a14)'     },
              { value: 'slate',    label: 'Slate (#0f172a)'    },
              { value: 'void',     label: 'Void (#000000)'     },
            ]} />
          </Row>
          <Row label="Sidebar style">
            <Sel value={cfg.sidebarStyle} onChange={v => set({ sidebarStyle: v })} options={[
              { value: 'solid',  label: 'Solid'        },
              { value: 'glass',  label: 'Glassmorphic' },
              { value: 'border', label: 'Border only'  },
            ]} />
          </Row>
        </div>
      </div>

      {/* Accent color + harmonics */}
      <div className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <SLabel>Accent color</SLabel>
            <div className="text-[9px] text-white/30">Active states, highlights, interactive elements</div>
          </div>
          <Toggle value={cfg.useCustomAccent} onChange={v => set({ useCustomAccent: v })} />
        </div>
        <div className="flex flex-wrap items-center gap-2.5 mb-3">
          {ACCENT_PRESETS.map(c => (
            <Swatch key={c} color={c} selected={cfg.useCustomAccent && cfg.accentColor === c}
              onClick={() => set({ accentColor: c, useCustomAccent: true })} />
          ))}
        </div>
        {cfg.useCustomAccent && (
          <div className="flex items-center gap-2.5 rounded-lg border border-white/8 bg-black/20 px-3 py-2 mb-3">
            <div className="h-3 w-3 rounded-full" style={{ background: cfg.accentColor }} />
            <input type="color" value={cfg.accentColor}
              onChange={e => set({ accentColor: e.target.value, useCustomAccent: true })}
              className="h-5 w-10 cursor-pointer rounded border-0 bg-transparent p-0" />
            <span className="font-mono text-[9px] text-white/40">{cfg.accentColor}</span>
          </div>
        )}
        {harmonics && (
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="text-[8.5px] uppercase tracking-widest text-white/22">Color harmonics</div>
              <div className="h-px flex-1 bg-white/6" />
            </div>
            <div className="flex flex-wrap gap-3">
              {harmonics.map(h => (
                <Swatch key={h.label} color={h.color} label={h.label}
                  selected={cfg.accentColor === h.color && cfg.useCustomAccent}
                  onClick={() => set({ accentColor: h.color, useCustomAccent: true })} />
              ))}
            </div>
            <p className="mt-2 text-[8.5px] text-white/22">Auto-computed from accent via HSL rotation</p>
          </div>
        )}
        {tintScale.length > 0 && (
          <div className="mt-3">
            <div className="mb-2 flex items-center gap-2">
              <div className="text-[8.5px] uppercase tracking-widest text-white/22">Tint scale</div>
              <div className="h-px flex-1 bg-white/6" />
              <span className="text-[7.5px] text-white/18">click to copy hex</span>
            </div>
            <div className="flex gap-0.5 overflow-hidden rounded-lg">
              {tintScale.map(({ lightness, color }) => (
                <button key={lightness} onClick={() => onCopyTint(color)} title={color}
                  className="relative flex-1 transition-all hover:scale-y-110 hover:z-10 group"
                  style={{ height: '32px', background: color }}>
                  {tintCopied === color && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Check className="h-2.5 w-2.5 text-white" />
                    </div>
                  )}
                  <div className="absolute bottom-0.5 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="rounded bg-black/60 px-0.5 font-mono text-[6px] text-white/80">L{lightness}</span>
                  </div>
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-[8px] text-white/18 font-mono">
              {tintScale[0].color} → {tintScale[tintScale.length - 1].color}
            </p>
          </div>
        )}
      </div>

      {/* Typography + font preview */}
      <div className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3">
        <SLabel>Typography</SLabel>
        <div className="divide-y divide-white/5 mb-3">
          <Row label="Font family">
            <Sel value={cfg.fontFamily} onChange={v => set({ fontFamily: v })} options={[
              { value: 'mono',   label: 'Mono (JetBrains)' },
              { value: 'sans',   label: 'Sans (Inter)'     },
              { value: 'system', label: 'System default'   },
            ]} />
          </Row>
          <Row label="Font size">
            <Sel value={cfg.fontSize} onChange={v => set({ fontSize: v })} options={[
              { value: 'xs', label: 'Extra small' },
              { value: 'sm', label: 'Small'       },
              { value: 'md', label: 'Medium'      },
            ]} />
          </Row>
        </div>
        {/* Font preview */}
        <div className="rounded-lg border border-white/8 bg-black/20 px-3.5 py-3"
          style={{
            fontFamily: cfg.fontFamily === 'sans' ? 'var(--font-inter, system-ui, sans-serif)' : cfg.fontFamily === 'system' ? 'system-ui, sans-serif' : 'var(--font-jetbrains-mono, ui-monospace, monospace)',
            fontSize: cfg.fontSize === 'xs' ? '10px' : cfg.fontSize === 'md' ? '13px' : '11.5px',
          }}>
          <div className="text-white/70 leading-relaxed">The quick brown fox jumps over the lazy dog</div>
          <div className="mt-1 text-white/40 leading-relaxed">ABCDEF abcdef 0123456789 !@#$%</div>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-px flex-1 bg-white/8" />
            <span className="font-mono text-[7.5px] text-white/20">
              {cfg.fontFamily} · {cfg.fontSize} · {cfg.fontSize === 'xs' ? '10' : cfg.fontSize === 'md' ? '13' : '11.5'}px
            </span>
          </div>
        </div>
      </div>

      {/* Space & radius */}
      <div className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3">
        <SLabel>Space & radius</SLabel>
        <div className="divide-y divide-white/5">
          <Row label="Border radius">
            <Sel value={cfg.borderRadius} onChange={v => set({ borderRadius: v })} options={[
              { value: 'sharp',   label: 'Sharp (0px)' },
              { value: 'normal',  label: 'Normal (xl)' },
              { value: 'rounded', label: 'Soft (2xl)'  },
            ]} />
          </Row>
        </div>
      </div>

      {/* Effects */}
      <div className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3">
        <SLabel>Effects</SLabel>
        <div className="divide-y divide-white/5">
          <Row label="Ambient glow" hint="Radial glow behind the sidebar using the accent color">
            <Toggle value={cfg.glowEffect} onChange={v => set({ glowEffect: v })} />
          </Row>
          {cfg.glowEffect && (
            <div className="py-2.5">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <div className="text-[10.5px] font-medium text-white/70">Glow opacity</div>
                  <div className="mt-0.5 text-[9px] text-white/28">Intensity of the ambient glow effect</div>
                </div>
                <span className="font-mono text-[10.5px] tabular-nums text-white/50">{cfg.glowOpacity}%</span>
              </div>
              <input type="range" min={10} max={80} step={5} value={cfg.glowOpacity}
                onChange={e => set({ glowOpacity: Number(e.target.value) })}
                className="w-full h-1 rounded-full accent-cyan-400" />
              <div className="mt-1 flex justify-between text-[8px] text-white/18">
                <span>10% subtle</span><span>80% intense</span>
              </div>
            </div>
          )}
          <Row label="Sidebar border accent" hint="Colored right border on the navigation sidebar">
            <Toggle value={cfg.sidebarBorder} onChange={v => set({ sidebarBorder: v })} />
          </Row>
        </div>
      </div>

      {/* Builtin presets grid */}
      <div className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3">
        <SLabel>Visual presets</SLabel>
        <p className="mb-3 text-[9.5px] text-white/30">Appearance-only: background, sidebar style, accent, radius, and glow.</p>
        <div className="grid grid-cols-2 gap-2.5 mb-3">
          {BUILTIN_PRESETS.map(preset => {
            const active   = cfg.activePreset === preset.id
            const presetBg = preset.bg === 'void' ? '#000' : preset.bg === 'slate' ? '#0f172a' : preset.bg === 'dark' ? '#0a0a14' : '#060610'
            return (
              <button key={preset.id} onClick={() => applyBuiltinPreset(preset)}
                className={cn(
                  'relative rounded-xl border p-3 text-left transition-all',
                  active ? 'border-white/25 bg-white/[0.06]' : 'border-white/8 bg-white/[0.025] hover:border-white/15 hover:bg-white/[0.04]'
                )}>
                {active && (
                  <div className="absolute right-2.5 top-2.5 flex h-4 w-4 items-center justify-center rounded-full" style={{ background: preset.accent }}>
                    <Check className="h-2.5 w-2.5 text-black" />
                  </div>
                )}
                <div className="mb-2.5 flex h-10 items-stretch gap-1 overflow-hidden rounded-lg border border-white/8" style={{ background: presetBg }}>
                  <div className="w-4 shrink-0 border-r"
                    style={{
                      borderColor: preset.sidebar === 'border' ? `${preset.accent}40` : 'rgba(255,255,255,0.06)',
                      background:  preset.sidebar === 'glass'  ? `${preset.accent}0a` : preset.sidebar === 'border' ? 'transparent' : 'rgba(255,255,255,0.03)',
                    }}>
                    <div className="mx-auto mt-1 h-0.5 w-2 rounded-full" style={{ background: preset.accent }} />
                    {[0.3, 0.2, 0.15].map((o, i) => (
                      <div key={i} className="mx-auto mt-0.5 h-0.5 w-1.5 rounded-full bg-white" style={{ opacity: o }} />
                    ))}
                  </div>
                  <div className="flex-1 p-1">
                    <div className="h-0.5 w-6 rounded-full" style={{ background: preset.accent, opacity: 0.7 }} />
                    <div className="mt-0.5 h-0.5 w-8 rounded-full bg-white/10" />
                  </div>
                </div>
                <div className="text-[10px] font-semibold" style={{ color: preset.accent }}>{preset.name}</div>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full" style={{ background: preset.accent }} />
                  <span className="font-mono text-[7.5px] text-white/25 capitalize">{preset.bg}</span>
                  <span className="ml-auto font-mono text-[7.5px] text-white/20 capitalize">{preset.sidebar}</span>
                </div>
              </button>
            )
          })}
        </div>
        {cfg.activePreset && (
          <button onClick={() => set({ activePreset: '' })}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/6 py-1.5 text-[9px] uppercase tracking-widest text-white/25 transition-all hover:text-white/45">
            <span className="text-[9px]">×</span> Clear active preset
          </button>
        )}
      </div>

      {/* Live preview */}
      <div className="rounded-xl border border-white/8 bg-white/[0.025] p-4">
        <SLabel>Live preview</SLabel>
        <div className="relative flex h-24 gap-1.5 overflow-hidden rounded-lg border border-white/8" style={{ background: bgColor }}>
          {cfg.glowEffect && (
            <div className="pointer-events-none absolute left-0 top-0 h-full w-24 blur-xl"
              style={{ opacity: (cfg.glowOpacity ?? 25) / 100, background: `radial-gradient(ellipse at 0% 0%, ${accentDisplay}, transparent 70%)` }} />
          )}
          <div className="relative w-16 shrink-0 flex flex-col py-1.5 px-1.5"
            style={{
              borderRight: `1px solid ${cfg.sidebarBorder ? `${accentDisplay}35` : 'rgba(255,255,255,0.06)'}`,
              background: cfg.sidebarStyle === 'glass' ? `${accentDisplay}0a` : cfg.sidebarStyle === 'border' ? 'transparent' : 'rgba(255,255,255,0.025)',
            }}>
            <div className="flex items-center gap-1 mb-2">
              <div className="h-3 w-3 rounded-sm" style={{ background: `${accentDisplay}20`, border: `1px solid ${accentDisplay}40` }}>
                <div className="h-1.5 w-1.5 m-auto rounded-full" style={{ background: accentDisplay }} />
              </div>
              {!cfg.compactHeader && <div className="text-[5px] font-bold uppercase tracking-widest" style={{ color: accentDisplay }}>Studio</div>}
            </div>
            {['Overview', 'Projects', 'GitHub', 'Labs'].map((name, i) => (
              <div key={name} className={cn('flex items-center gap-1 rounded px-0.5 py-0.5 mb-0.5', i === 0 && 'bg-white/5')}>
                <div className="h-1 w-1 shrink-0 rounded-full"
                  style={{ background: i === 0 ? accentDisplay : 'rgba(255,255,255,0.2)', opacity: i === 0 ? 1 : 0.5 }} />
                <div className="truncate text-[5px]" style={{ color: i === 0 ? accentDisplay : 'rgba(255,255,255,0.35)' }}>{name}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-1 flex-col p-2">
            <div className="flex h-4 shrink-0 items-center border-b border-white/6 mb-1.5">
              <div className="text-[5px] uppercase tracking-widest" style={{ color: accentDisplay }}>Active Panel</div>
            </div>
            <div className="space-y-1">
              <div className="h-0.5 w-full rounded-full bg-white/12" />
              <div className="h-0.5 w-3/4 rounded-full bg-white/8" />
              <div className="h-0.5 w-1/2 rounded-full bg-white/6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
