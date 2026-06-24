'use client'

import { Sparkles, Sliders, Blend, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdmin } from '@/lib/admin/store'
import type { DesignConfig, DesignTokens } from '@/lib/admin/types'
import {
  GLOW_INTENSITY_OPTS, getPaletteColors,
  Section, OptionRow, ColorField, WebsiteColorTokens,
} from './primitives'

export function GlowTab() {
  const { state, dispatch } = useAdmin()
  const { design } = state
  const { tokens } = design
  const { primary } = getPaletteColors(design)

  function updateDesign(data: Partial<DesignConfig>) { dispatch({ type: 'UPDATE_DESIGN', payload: data }) }
  function updateToken(data: Partial<DesignTokens>)  { dispatch({ type: 'UPDATE_TOKENS',  payload: data }) }

  return (
    <div className="space-y-4">

      {/* Glow color overrides */}
      <Section icon={<Sparkles className="h-3.5 w-3.5" />} title="Glow Colors" subtitle="Controls neon halos, borders, and hero radial — overrides palette defaults">
        <div className="grid grid-cols-3 gap-3">
          <ColorField label="Glow (primary)" value={design.customGlow ?? ''}
            onChange={(v) => updateDesign({ customGlow: v })} />
          <ColorField label="Glow Secondary" value={design.customGlowSecondary ?? ''}
            onChange={(v) => updateDesign({ customGlowSecondary: v })} />
          <ColorField label="Ring (focus)" value={design.customRing ?? ''}
            onChange={(v) => updateDesign({ customRing: v })} />
        </div>
        {/* Live glow preview */}
        <div className="rounded-xl bg-black/30 p-4 space-y-3">
          <div className="font-mono text-[8px] uppercase tracking-[0.14em] text-white/25 mb-2">Live Glow Preview</div>
          <div className="flex gap-3 items-center">
            <div className="h-10 w-10 rounded-xl flex-shrink-0"
              style={{
                background: design.customGlow || primary,
                boxShadow: `0 0 0 1px ${design.customGlow || primary}55, 0 4px 16px ${design.customGlow || primary}44, 0 16px 48px ${design.customGlow || primary}22`,
              }} />
            <div className="flex-1 rounded-xl border px-3 py-2 text-[10px] font-mono text-white/60"
              style={{ borderColor: `${design.customGlow || primary}40`, boxShadow: `0 0 0 1px ${design.customGlow || primary}20, 0 0 20px ${design.customGlow || primary}18` }}>
              .border-glow / .glow class preview
            </div>
          </div>
          <div className="text-sm font-semibold"
            style={{ background: `linear-gradient(115deg, ${design.gradientStart || '#c0eaff'} 0%, ${design.customGlow || primary} 35%, ${design.gradientMid || '#6ef7ff'} 60%, ${design.gradientEnd || '#a78bfa'} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            .gradient-text preview — heading style
          </div>
        </div>
        <div className="flex gap-2">
          <button type="button"
            onClick={() => updateDesign({ customGlow: '', customGlowSecondary: '', customRing: '' })}
            className="flex-1 rounded-lg border border-white/8 py-2 text-[9px] font-mono text-white/30 hover:border-white/20 hover:text-white/55 transition-all">
            Reset to palette defaults
          </button>
        </div>
      </Section>

      {/* Glow intensity */}
      <Section icon={<Sliders className="h-3.5 w-3.5" />} title="Glow Intensity" subtitle="Global multiplier — scales .glow, .text-glow, .border-glow effects sitewide">
        <OptionRow value={tokens.glowIntensity ?? 'normal'} options={GLOW_INTENSITY_OPTS} onChange={v => updateToken({ glowIntensity: v })} />
        <div className="flex gap-2 pt-1">
          {GLOW_INTENSITY_OPTS.map(o => {
            const mul = parseFloat(o.mul)
            return (
              <div key={o.value} className="flex-1 rounded-xl overflow-hidden border border-white/8 text-center">
                <div className="py-3 flex items-center justify-center"
                  style={{ boxShadow: mul > 0 ? `inset 0 0 ${20 * mul}px ${primary}${Math.round(30 * mul).toString(16).padStart(2,'0')}` : 'none', background: 'rgb(0 0 0 / 0.3)' }}>
                  <div className="h-4 w-4 rounded-full"
                    style={{
                      background: primary,
                      boxShadow: mul > 0 ? `0 0 ${10 * mul}px ${primary}, 0 0 ${20 * mul}px ${primary}88` : 'none',
                    }} />
                </div>
                <div className={cn('font-mono text-[7px] py-1', tokens.glowIntensity === o.value ? 'text-indigo-300' : 'text-white/25')}>{o.label}</div>
              </div>
            )
          })}
        </div>
      </Section>

      {/* Gradient text color stops */}
      <Section icon={<Blend className="h-3.5 w-3.5" />} title="Gradient Text" subtitle="Color stops for .gradient-text — used in section headings and hero titles">
        <div className="grid grid-cols-3 gap-3">
          <ColorField label="Start color" value={design.gradientStart ?? ''}
            onChange={(v) => updateDesign({ gradientStart: v })} />
          <ColorField label="Mid color" value={design.gradientMid ?? ''}
            onChange={(v) => updateDesign({ gradientMid: v })} />
          <ColorField label="End color" value={design.gradientEnd ?? ''}
            onChange={(v) => updateDesign({ gradientEnd: v })} />
        </div>
        <div className="rounded-xl bg-black/30 p-4">
          <div className="font-mono text-[8px] uppercase tracking-[0.14em] text-white/25 mb-3">Live Preview</div>
          <div className="space-y-1.5">
            <div className="text-2xl font-bold tracking-tight"
              style={{ background: `linear-gradient(115deg, ${design.gradientStart || '#c0eaff'} 0%, ${design.customGlow || primary} 35%, ${design.gradientMid || '#6ef7ff'} 60%, ${design.gradientEnd || '#a78bfa'} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Gradient Heading Text
            </div>
            <div className="text-sm font-semibold"
              style={{ background: `linear-gradient(115deg, ${design.gradientStart || '#c0eaff'} 0%, ${design.customGlow || primary} 35%, ${design.gradientMid || '#6ef7ff'} 60%, ${design.gradientEnd || '#a78bfa'} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Smaller gradient label
            </div>
          </div>
          <div className="mt-3 h-2 w-full rounded-full overflow-hidden"
            style={{ background: `linear-gradient(to right, ${design.gradientStart || '#c0eaff'}, ${design.customGlow || primary}, ${design.gradientMid || '#6ef7ff'}, ${design.gradientEnd || '#a78bfa'})` }} />
        </div>
        <button type="button"
          onClick={() => updateDesign({ gradientStart: '', gradientMid: '', gradientEnd: '' })}
          className="w-full rounded-lg border border-white/8 py-2 text-[9px] font-mono text-white/30 hover:border-white/20 hover:text-white/55 transition-all">
          Reset to defaults
        </button>
      </Section>

      {/* All current glow vars readout */}
      <Section icon={<Globe className="h-3.5 w-3.5" />} title="Live Glow Variables" subtitle="Current values on the website">
        <WebsiteColorTokens compact />
      </Section>

    </div>
  )
}
