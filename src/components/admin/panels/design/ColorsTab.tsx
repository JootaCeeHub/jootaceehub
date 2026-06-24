'use client'

import { Check } from 'lucide-react'
import { Palette, Layout, Layers, Globe, Blend } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdmin } from '@/lib/admin/store'
import type { DesignConfig, DesignTokens } from '@/lib/admin/types'
import {
  PALETTES, CONTAINER_OPTS, PADDING_OPTS, CARD_OPTS, INPUT_OPTS,
  getPaletteColors, contrastRatio,
  Section, SubLabel, OptionRow, ColorField, WebsiteColorTokens,
} from './primitives'

export function ColorsTab() {
  const { state, dispatch } = useAdmin()
  const { design } = state
  const { tokens } = design
  const { primary } = getPaletteColors(design)

  function updateDesign(data: Partial<DesignConfig>) { dispatch({ type: 'UPDATE_DESIGN', payload: data }) }
  function updateToken(data: Partial<DesignTokens>)  { dispatch({ type: 'UPDATE_TOKENS',  payload: data }) }

  const palettePreviewBars = (p: typeof PALETTES[number]) =>
    p.id === 'custom'
      ? [design.customPrimary, design.customSecondary, design.customAccent, '#ffffff20']
      : p.bars as unknown as string[]

  return (
    <div className="space-y-4">

      {/* Theme mode + Layout */}
      <div className="grid grid-cols-2 gap-3">
        <Section icon={<Layers className="h-3.5 w-3.5" />} title="Modo por defecto" subtitle="Tema inicial al cargar">
          <div className="grid grid-cols-3 gap-1.5">
            {(['dark', 'light', 'system'] as const).map((m) => (
              <button key={m} type="button" onClick={() => updateDesign({ darkModeDefault: m })}
                className={cn(
                  'rounded-lg border py-2.5 text-center font-mono text-[9px] uppercase tracking-wider transition-colors',
                  design.darkModeDefault === m
                    ? 'border-indigo-400/35 bg-indigo-400/10 text-indigo-300'
                    : 'border-white/8 text-white/30 hover:border-white/18'
                )}>
                {m === 'dark' ? '🌙 Dark' : m === 'light' ? '☀️ Light' : '⚙️ System'}
              </button>
            ))}
          </div>
        </Section>

        <Section icon={<Layout className="h-3.5 w-3.5" />} title="Layout" subtitle="Container & section spacing">
          <div>
            <SubLabel>Container width</SubLabel>
            <OptionRow value={tokens.containerWidth} options={CONTAINER_OPTS} onChange={v => updateToken({ containerWidth: v })} />
          </div>
          <div>
            <SubLabel>Section padding</SubLabel>
            <OptionRow value={tokens.sectionPadding} options={PADDING_OPTS} onChange={v => updateToken({ sectionPadding: v })} />
          </div>
        </Section>
      </div>

      {/* Palette grid */}
      <Section icon={<Palette className="h-3.5 w-3.5" />} title="Paleta de colores" subtitle="Selecciona o personaliza el esquema cromático">
        <div className="grid grid-cols-4 gap-2 mb-1">
          {PALETTES.map((p) => {
            const active = design.palette === p.id
            const bars = palettePreviewBars(p)
            const paletteContrast = p.id !== 'custom' && p.primary
              ? contrastRatio(p.primary, '#ffffff')
              : null
            return (
              <div key={p.id} onClick={() => updateDesign({ palette: p.id })}
                className={cn(
                  'relative cursor-pointer overflow-hidden rounded-xl border p-3 transition-all',
                  active ? 'border-white/30 ring-1 ring-white/20 shadow-md' : 'border-white/8 hover:border-white/18'
                )}>
                <div className="mb-2 flex h-6 gap-0.5 overflow-hidden rounded-md">
                  {bars.map((color, i) => (
                    <div key={i} className="flex-1" style={{ background: color }} />
                  ))}
                </div>
                <div className="font-mono text-[9px] uppercase tracking-wider text-white/50">{p.name}</div>
                {paletteContrast && (
                  <div className={cn('font-mono text-[7px] mt-0.5', paletteContrast >= 4.5 ? 'text-emerald-400/60' : 'text-amber-400/60')}>
                    {paletteContrast.toFixed(1)}:1 {paletteContrast >= 4.5 ? '✓' : '△'}
                  </div>
                )}
                {active && (
                  <div className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-white/90">
                    <Check className="h-2.5 w-2.5 text-black" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Custom brand colors */}
        <div className="border-t border-white/6 pt-4">
          <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/25 mb-3">Colores de marca personalizados</div>
          <div className="grid grid-cols-3 gap-3">
            <ColorField label="Primary" value={design.customPrimary}
              onChange={(v) => updateDesign({ customPrimary: v, palette: 'custom' })} />
            <ColorField label="Secondary" value={design.customSecondary}
              onChange={(v) => updateDesign({ customSecondary: v, palette: 'custom' })} />
            <ColorField label="Accent" value={design.customAccent}
              onChange={(v) => updateDesign({ customAccent: v, palette: 'custom' })} />
          </div>
        </div>
      </Section>

      {/* Advanced colors */}
      <div className="grid grid-cols-2 gap-3">
        <Section icon={<Palette className="h-3.5 w-3.5" />} title="Colores avanzados" subtitle="Background, surface, text, borders">
          <div className="grid grid-cols-2 gap-3">
            <ColorField label="Background" value={design.customBackground}
              onChange={(v) => updateDesign({ customBackground: v })} />
            <ColorField label="Surface / Card" value={design.customSurface}
              onChange={(v) => updateDesign({ customSurface: v })} />
            <ColorField label="Text" value={design.customText}
              onChange={(v) => updateDesign({ customText: v })} />
            <ColorField label="Border" value={design.customBorder}
              onChange={(v) => updateDesign({ customBorder: v })} />
          </div>
          <div className="flex gap-1.5 pt-1">
            <div className="flex h-8 flex-1 items-center justify-center rounded-lg text-[9px]"
              style={{ background: design.customBackground, border: `1px solid ${design.customBorder}`, color: design.customText, fontFamily: 'monospace' }}>
              Bg/Text
            </div>
            <div className="flex h-8 flex-1 items-center justify-center rounded-lg text-[9px]"
              style={{ background: design.customSurface, border: `1px solid ${design.customBorder}`, color: design.customText, fontFamily: 'monospace' }}>
              Surface
            </div>
            <div className="flex h-8 flex-1 items-center justify-center rounded-lg text-[9px]"
              style={{ background: primary, color: '#ffffff', fontFamily: 'monospace' }}>
              Primary
            </div>
          </div>
        </Section>

        <Section icon={<Layers className="h-3.5 w-3.5" />} title="Componentes" subtitle="Cards & inputs">
          <div>
            <SubLabel>Card style</SubLabel>
            <div className="grid grid-cols-2 gap-1.5">
              {CARD_OPTS.map((o) => (
                <button key={o.value} type="button" onClick={() => updateToken({ cardStyle: o.value })}
                  className={cn(
                    'cursor-pointer rounded-xl border p-2.5 text-left transition-all',
                    tokens.cardStyle === o.value ? 'border-indigo-400/30 bg-indigo-400/5' : 'border-white/8 hover:border-white/18'
                  )}>
                  <div className={cn(
                    'mb-1.5 h-4 w-full rounded',
                    o.value === 'flat' ? 'bg-white/8 border-transparent border' :
                    o.value === 'elevated' ? 'bg-white/6 border border-white/10 shadow-lg' :
                    o.value === 'outlined' ? 'bg-transparent border border-white/25' :
                    'bg-transparent border-transparent border'
                  )} />
                  <div className="text-[9px] font-medium text-white/65">{o.label}</div>
                  <div className="text-[8px] text-white/30">{o.desc}</div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <SubLabel>Input style</SubLabel>
            <div className="grid grid-cols-2 gap-1.5">
              {INPUT_OPTS.map((o) => (
                <button key={o.value} type="button" onClick={() => updateToken({ inputStyle: o.value })}
                  className={cn(
                    'cursor-pointer rounded-xl border p-2.5 text-left transition-all',
                    tokens.inputStyle === o.value ? 'border-indigo-400/30 bg-indigo-400/5' : 'border-white/8 hover:border-white/18'
                  )}>
                  <div className={cn(
                    'mb-1.5 h-3.5 w-full',
                    o.value === 'flat' ? 'rounded bg-white/5' :
                    o.value === 'outlined' ? 'rounded border border-white/20' :
                    o.value === 'filled' ? 'rounded bg-white/10' :
                    'border-b border-white/20'
                  )} />
                  <div className="text-[9px] font-medium text-white/65">{o.label}</div>
                  <div className="text-[8px] text-white/30">{o.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </Section>
      </div>

      {/* Muted tones */}
      <Section icon={<Blend className="h-3.5 w-3.5" />} title="Muted Tones" subtitle="Secondary surfaces and text — affects backgrounds, labels, placeholders">
        <div className="grid grid-cols-2 gap-3">
          <ColorField label="Muted background" value={design.customMuted ?? ''}
            onChange={(v) => updateDesign({ customMuted: v })} />
          <ColorField label="Muted foreground" value={design.customMutedFg ?? ''}
            onChange={(v) => updateDesign({ customMutedFg: v })} />
        </div>
        <div className="flex gap-2 pt-1">
          <div className="flex h-9 flex-1 items-center justify-center rounded-lg text-[9px] font-mono"
            style={{ background: design.customMuted || 'var(--muted)', color: design.customMutedFg || 'var(--muted-foreground)', border: `1px solid ${design.customBorder || 'var(--border)'}` }}>
            Muted surface / text
          </div>
          <button type="button"
            onClick={() => updateDesign({ customMuted: '', customMutedFg: '' })}
            className="rounded-lg border border-white/8 px-3 text-[9px] font-mono text-white/30 hover:border-white/20 hover:text-white/55 transition-all">
            Reset
          </button>
        </div>
      </Section>

      {/* Live website CSS vars */}
      <Section icon={<Globe className="h-3.5 w-3.5" />} title="Website color tokens" subtitle="Current CSS variable values applied to the site">
        <WebsiteColorTokens />
      </Section>

    </div>
  )
}
