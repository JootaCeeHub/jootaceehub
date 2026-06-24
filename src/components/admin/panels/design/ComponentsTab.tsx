'use client'

import { Layout, Blend, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdmin } from '@/lib/admin/store'
import type { DesignConfig, DesignTokens, DomainAccents } from '@/lib/admin/types'
import {
  BUTTON_OPTS, GLASS_BLUR_OPTS, GLASS_OPACITY_OPTS, GLASS_BORDER_OPTS,
  DEFAULT_DOMAIN_ACCENTS, getPaletteColors,
  Section, SubLabel, OptionRow, ColorField,
} from './primitives'

export function ComponentsTab() {
  const { state, dispatch } = useAdmin()
  const { design } = state
  const { tokens } = design
  const { primary } = getPaletteColors(design)

  function updateDesign(data: Partial<DesignConfig>) { dispatch({ type: 'UPDATE_DESIGN', payload: data }) }
  function updateToken(data: Partial<DesignTokens>)  { dispatch({ type: 'UPDATE_TOKENS',  payload: data }) }

  return (
    <div className="space-y-4">

      {/* Primary Button */}
      <Section icon={<Layout className="h-3.5 w-3.5" />} title="Primary Button" subtitle="Controls the gradient, text, shape of all primary CTAs sitewide">
        <div className="grid grid-cols-2 gap-3">
          <ColorField label="Gradient from" value={design.btnGradientFrom ?? ''}
            onChange={(v) => updateDesign({ btnGradientFrom: v })} />
          <ColorField label="Gradient to" value={design.btnGradientTo ?? ''}
            onChange={(v) => updateDesign({ btnGradientTo: v })} />
        </div>
        <div>
          <SubLabel>Button text color</SubLabel>
          <div className="flex gap-2 items-center">
            <ColorField label="" value={design.btnText ?? ''}
              onChange={(v) => updateDesign({ btnText: v })} />
            <button type="button"
              onClick={() => updateDesign({ btnText: '' })}
              className="rounded-lg border border-white/8 px-3 py-2 text-[9px] font-mono text-white/30 hover:text-white/55 transition-all">
              Auto
            </button>
          </div>
        </div>
        <div>
          <SubLabel>Button shape (→ Tokens tab)</SubLabel>
          <OptionRow value={tokens.buttonStyle} options={BUTTON_OPTS} onChange={v => updateToken({ buttonStyle: v })} />
        </div>
        <div className="rounded-xl bg-black/30 p-4 space-y-3">
          <div className="font-mono text-[8px] uppercase tracking-[0.14em] text-white/25 mb-2">Live Button Preview</div>
          <div className="flex items-center gap-3">
            <button type="button" className="px-5 py-2.5 font-medium text-sm transition-all hover:brightness-110"
              style={{
                background: `linear-gradient(to right, ${design.btnGradientFrom || '#7dd3fc'}, ${design.btnGradientTo || '#a5f3fc'})`,
                borderRadius: tokens.buttonStyle === 'sharp' ? '0px' : tokens.buttonStyle === 'rounded' ? '8px' : '9999px',
                color: design.btnText || '#03111e',
                boxShadow: `0 8px 24px color-mix(in srgb, ${design.btnGradientFrom || primary} 30%, transparent)`,
              }}>
              Collaborate →
            </button>
            <button type="button" className="px-5 py-2.5 font-medium text-sm border transition-all"
              style={{
                borderRadius: tokens.buttonStyle === 'sharp' ? '0px' : tokens.buttonStyle === 'rounded' ? '8px' : '9999px',
                borderColor: `${design.btnGradientFrom || primary}50`,
                color: design.btnGradientFrom || primary,
                background: `${design.btnGradientFrom || primary}12`,
              }}>
              Secondary
            </button>
          </div>
          <div className="flex gap-1.5">
            {[
              { label: 'From', color: design.btnGradientFrom || '#7dd3fc' },
              { label: 'To', color: design.btnGradientTo || '#a5f3fc' },
              { label: 'Text', color: design.btnText || '#03111e' },
            ].map(({ label, color }) => (
              <div key={label} className="flex-1 rounded-lg overflow-hidden border border-white/8">
                <div className="h-6" style={{ background: color }} />
                <div className="px-2 py-0.5 text-[7px] font-mono text-white/35">{label}</div>
              </div>
            ))}
          </div>
        </div>
        <button type="button"
          onClick={() => updateDesign({ btnGradientFrom: '', btnGradientTo: '', btnText: '' })}
          className="w-full rounded-lg border border-white/8 py-2 font-mono text-[9px] text-white/30 hover:border-white/20 hover:text-white/55 transition-all">
          Reset to palette defaults
        </button>
      </Section>

      {/* Glass Panels */}
      <Section icon={<Blend className="h-3.5 w-3.5" />} title="Glass Panels" subtitle="Navigation, hero panel, modals — controls blur, opacity, border strength">
        <div>
          <SubLabel>Backdrop blur</SubLabel>
          <OptionRow value={tokens.glassBlur ?? 'md'} options={GLASS_BLUR_OPTS} onChange={v => updateToken({ glassBlur: v })} />
        </div>
        <div>
          <SubLabel>Background opacity</SubLabel>
          <OptionRow value={tokens.glassOpacity ?? 'normal'} options={GLASS_OPACITY_OPTS} onChange={v => updateToken({ glassOpacity: v })} />
        </div>
        <div>
          <SubLabel>Border visibility</SubLabel>
          <OptionRow value={tokens.glassBorderOpacity ?? 'normal'} options={GLASS_BORDER_OPTS} onChange={v => updateToken({ glassBorderOpacity: v })} />
        </div>
        <div className="rounded-xl overflow-hidden border border-white/8 mt-1"
          style={{ backdropFilter: `blur(${{'none':'0px','sm':'8px','md':'20px','lg':'32px','xl':'48px'}[tokens.glassBlur ?? 'md']}) saturate(160%)` }}>
          <div className="px-4 py-3 flex items-center gap-3"
            style={{
              background: `linear-gradient(160deg, rgb(13 18 29 / calc(70% * ${{'ghost':'0.3','light':'0.6','normal':'1','heavy':'1.2','solid':'1.5'}[tokens.glassOpacity ?? 'normal']})), rgb(6 10 17 / calc(82% * ${{'ghost':'0.3','light':'0.6','normal':'1','heavy':'1.2','solid':'1.5'}[tokens.glassOpacity ?? 'normal']})))`,
              borderBottom: `1px solid rgb(83 128 185 / calc(28% * ${{'none':'0','subtle':'0.5','normal':'1','strong':'1.8'}[tokens.glassBorderOpacity ?? 'normal']}))`,
            }}>
            <div className="h-5 w-5 rounded" style={{ background: primary }} />
            <span className="font-mono text-[10px] text-white/70">Navigation preview</span>
            <div className="ml-auto px-3 py-1 rounded-full font-mono text-[9px] text-white/50 border border-white/15">Menu</div>
          </div>
          <div className="px-4 py-3">
            <div className="h-2 w-32 rounded-full bg-white/10 mb-1.5" />
            <div className="h-2 w-20 rounded-full bg-white/6" />
          </div>
        </div>
      </Section>

      {/* Domain Accent Colors */}
      <Section icon={<Sparkles className="h-3.5 w-3.5" />} title="Domain Accent Colors" subtitle="Navigation scan lines and active section indicators per domain">
        <div className="grid grid-cols-3 gap-3">
          {([
            ['projects',     'Projects / Labs / Systems'],
            ['research',     'Research / Journal'],
            ['resources',    'Infrastructure'],
            ['intelligence', 'Intelligence'],
            ['github',       'GitHub'],
            ['about',        'About / Contact'],
          ] as [keyof DomainAccents, string][]).map(([key, label]) => (
            <ColorField key={key} label={label}
              value={design.domainAccents?.[key] ?? ''}
              onChange={(v) => updateDesign({
                domainAccents: { ...DEFAULT_DOMAIN_ACCENTS, ...design.domainAccents, [key]: v } as DomainAccents,
              })} />
          ))}
        </div>
        <div className="flex gap-1.5 pt-1">
          {(['projects','research','resources','intelligence','github','about'] as const).map(k => (
            <div key={k} className={cn('flex-1 rounded-lg overflow-hidden border border-white/8')}>
              <div className="h-4" style={{ background: design.domainAccents?.[k] || DEFAULT_DOMAIN_ACCENTS[k] }} />
              <div className="px-1 py-0.5 text-[6px] font-mono text-white/30 truncate">{k}</div>
            </div>
          ))}
        </div>
        <div className="rounded-xl bg-black/30 p-3 relative overflow-hidden">
          <div className="font-mono text-[8px] text-white/25 mb-2">Nav scan line preview</div>
          <div className="flex gap-3">
            {(['projects','research','resources','intelligence','github'] as const).map(k => (
              <div key={k} className="relative pb-1">
                <span className="font-mono text-[9px] text-white/50">{k}</span>
                <div className="absolute bottom-0 left-0 right-0 h-px rounded-full"
                  style={{ background: `linear-gradient(90deg, transparent, ${design.domainAccents?.[k] || DEFAULT_DOMAIN_ACCENTS[k]}90, transparent)` }} />
              </div>
            ))}
          </div>
        </div>
        <button type="button"
          onClick={() => updateDesign({
            domainAccents: {
              projects: '#a78bfa', research: '#34d399', resources: '#38bdf8',
              intelligence: '#facc15', github: '#f472b6', about: '#94a3b8',
            }
          })}
          className="w-full rounded-lg border border-white/8 py-2 font-mono text-[9px] text-white/30 hover:border-white/20 hover:text-white/55 transition-all">
          Reset to defaults
        </button>
      </Section>

    </div>
  )
}
