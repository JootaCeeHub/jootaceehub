'use client'

import { Type, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdmin } from '@/lib/admin/store'
import type { DesignTokens } from '@/lib/admin/types'
import {
  RADIUS_OPTS, SPACING_OPTS, SHADOW_OPTS, GRADIENT_OPTS, BUTTON_OPTS,
  TYPO_OPTS, FONTSIZE_OPTS, ANIMATION_OPTS, CONTAINER_OPTS, PADDING_OPTS,
  getPaletteColors, radiusClass,
  Section, SubLabel, OptionRow,
} from './primitives'

export function TokensTab() {
  const { state, dispatch } = useAdmin()
  const { design } = state
  const { tokens } = design
  const { primary } = getPaletteColors(design)

  function updateToken(data: Partial<DesignTokens>) { dispatch({ type: 'UPDATE_TOKENS', payload: data }) }

  const shadowVal = (k: string) => ({ none:'0', subtle:'0.6', normal:'1', dramatic:'1.8' }[k] ?? '1')

  return (
    <div className="space-y-4">

      <div className="grid grid-cols-2 gap-3">
        {/* Typography */}
        <Section icon={<Type className="h-3.5 w-3.5" />} title="Tipografía" subtitle="Font family, scale, animations">
          <div>
            <SubLabel>Font family</SubLabel>
            <div className="space-y-1.5">
              {TYPO_OPTS.map((o) => (
                <button key={o.value} type="button" onClick={() => updateToken({ typography: o.value })}
                  className={cn(
                    'w-full flex items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors',
                    tokens.typography === o.value
                      ? 'border-indigo-400/30 bg-indigo-400/8 text-indigo-300'
                      : 'border-white/8 text-white/40 hover:border-white/18 hover:text-white/65'
                  )}>
                  <span className="font-mono text-[9px] uppercase tracking-wider">{o.label}</span>
                  <span className="text-[8px] text-white/25 italic">{o.sample}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <SubLabel>Font size scale</SubLabel>
            <div className="flex gap-1.5 items-end">
              {FONTSIZE_OPTS.map((o) => (
                <button key={o.value} type="button" onClick={() => updateToken({ fontSizeScale: o.value })}
                  className={cn(
                    'flex-1 flex flex-col items-center gap-1 rounded-lg border py-2 transition-all',
                    tokens.fontSizeScale === o.value
                      ? 'border-indigo-400/30 bg-indigo-400/8'
                      : 'border-white/8 hover:border-white/18'
                  )}>
                  <span className={cn('font-semibold', tokens.fontSizeScale === o.value ? 'text-indigo-300' : 'text-white/30')}
                    style={{ fontSize: o.px }}>Aa</span>
                  <span className="font-mono text-[7px] text-white/25">{o.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <SubLabel>Animation speed</SubLabel>
            <OptionRow value={tokens.animationSpeed} options={ANIMATION_OPTS} onChange={v => updateToken({ animationSpeed: v })} />
          </div>

          <div>
            <SubLabel>Spacing scale</SubLabel>
            <OptionRow value={tokens.spacingScale} options={SPACING_OPTS} onChange={v => updateToken({ spacingScale: v })} />
          </div>
        </Section>

        {/* Shapes & Surfaces */}
        <Section icon={<Layers className="h-3.5 w-3.5" />} title="Formas & Superficies" subtitle="Radius, shadow, buttons, gradients">
          <div>
            <SubLabel>Border radius</SubLabel>
            <OptionRow value={tokens.borderRadius} options={RADIUS_OPTS} onChange={v => updateToken({ borderRadius: v })} />
            <div className="flex items-center gap-1.5 pt-2">
              {RADIUS_OPTS.map((o) => (
                <div key={o.value} className={cn(
                  'h-6 w-6 border transition-all flex-shrink-0',
                  tokens.borderRadius === o.value ? 'border-indigo-400/60 bg-indigo-400/15' : 'border-white/15 bg-white/4',
                  radiusClass(o.value)
                )} />
              ))}
            </div>
          </div>

          <div>
            <SubLabel>Shadow intensity</SubLabel>
            <OptionRow value={tokens.shadowIntensity} options={SHADOW_OPTS} onChange={v => updateToken({ shadowIntensity: v })} />
            <div className="mt-2 flex gap-2">
              {(['none','subtle','normal','dramatic'] as const).map((k) => {
                const sv = parseFloat(shadowVal(k))
                return (
                  <div key={k} className="flex-1 rounded-lg bg-white/5 py-2 text-center"
                    style={{ boxShadow: sv > 0 ? `0 ${4*sv}px ${16*sv}px rgb(0 0 0 / ${0.18*sv})` : 'none' }}>
                    <div className={cn('font-mono text-[7px]', tokens.shadowIntensity === k ? 'text-indigo-300' : 'text-white/25')}>{k}</div>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <SubLabel>Button style</SubLabel>
            <OptionRow value={tokens.buttonStyle} options={BUTTON_OPTS} onChange={v => updateToken({ buttonStyle: v })} />
            <div className="flex items-center gap-2 pt-2">
              {BUTTON_OPTS.map((o) => (
                <div key={o.value}
                  className={cn(
                    'px-3 py-1 text-[9px] font-mono text-center transition-all flex-1',
                    tokens.buttonStyle === o.value ? 'bg-indigo-400/20 text-indigo-300' : 'bg-white/5 text-white/30',
                    o.value === 'sharp' ? 'rounded-none' : o.value === 'rounded' ? 'rounded-lg' : 'rounded-full'
                  )}>
                  {o.label}
                </div>
              ))}
            </div>
          </div>

          <div>
            <SubLabel>Gradient style</SubLabel>
            <OptionRow value={tokens.gradientStyle} options={GRADIENT_OPTS} onChange={v => updateToken({ gradientStyle: v })} />
          </div>
        </Section>
      </div>

      {/* Container + Padding (moved here from ColorsTab Layout section) */}
      <div className="grid grid-cols-2 gap-3">
        <Section icon={<Layers className="h-3.5 w-3.5" />} title="Container & Padding" subtitle="Layout constraints">
          <div>
            <SubLabel>Container width</SubLabel>
            <OptionRow value={tokens.containerWidth} options={CONTAINER_OPTS} onChange={v => updateToken({ containerWidth: v })} />
          </div>
          <div>
            <SubLabel>Section padding</SubLabel>
            <OptionRow value={tokens.sectionPadding} options={PADDING_OPTS} onChange={v => updateToken({ sectionPadding: v })} />
          </div>
        </Section>

        {/* Token summary */}
        <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
          <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.18em] text-white/25">Active Token Summary</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: '--radius-base', value: { none:'0px', sm:'4px', md:'8px', lg:'12px', xl:'16px', '2xl':'24px', full:'9999px' }[tokens.borderRadius] ?? '12px' },
              { label: '--radius-btn',  value: { sharp:'0px', rounded:'8px', pill:'9999px' }[tokens.buttonStyle ?? 'pill'] ?? '9999px' },
              { label: '--anim-dur',    value: { instant:'0ms', fast:'150ms', normal:'300ms', slow:'600ms' }[tokens.animationSpeed] ?? '300ms' },
              { label: '--font-base',   value: { xs:'12px', sm:'14px', md:'16px', lg:'18px', xl:'20px' }[tokens.fontSizeScale ?? 'md'] ?? '16px' },
              { label: '--shadow',      value: shadowVal(tokens.shadowIntensity ?? 'normal') },
              { label: '--primary',     value: primary },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg border border-white/6 bg-white/[0.02] px-3 py-2">
                <div className="font-mono text-[8px] text-white/30 mb-0.5">{label}</div>
                <div className="font-mono text-[10px] text-white/70 truncate">{value}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2 items-center">
            <button type="button" className="px-4 py-1.5 text-[10px] font-medium text-white transition-all"
              style={{
                background: primary,
                borderRadius: { sharp:'0px', rounded:'8px', pill:'9999px' }[tokens.buttonStyle ?? 'pill'] ?? '9999px',
              }}>
              Button preview
            </button>
            <div className="flex-1 rounded-lg border border-white/10 px-3 py-1.5 text-[10px] text-white/50"
              style={{
                borderRadius: { none:'0px', sm:'4px', md:'8px', lg:'12px', xl:'16px', '2xl':'24px', full:'9999px' }[tokens.borderRadius] ?? '12px',
                fontSize: { xs:'12px', sm:'14px', md:'16px', lg:'18px', xl:'20px' }[tokens.fontSizeScale ?? 'md'] ?? '16px',
              }}>
              Card / text size
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
