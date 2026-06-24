'use client'

import { useState, useEffect } from 'react'
import { Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DesignTokens, DesignConfig } from '@/lib/admin/types'

// ─── Palette registry ─────────────────────────────────────────────────────────

export const PALETTES = [
  { id: 'ocean',   name: 'Ocean',   primary: '#0ea5e9', accent: '#7dd3fc', bars: ['#0ea5e9','#38bdf8','#7dd3fc','#e0f2fe'] },
  { id: 'emerald', name: 'Emerald', primary: '#059669', accent: '#6ee7b7', bars: ['#059669','#10b981','#6ee7b7','#d1fae5'] },
  { id: 'amber',   name: 'Amber',   primary: '#d97706', accent: '#fcd34d', bars: ['#d97706','#f59e0b','#fcd34d','#fef3c7'] },
  { id: 'rose',    name: 'Rose',    primary: '#e11d48', accent: '#fb7185', bars: ['#e11d48','#f43f5e','#fb7185','#fecdd3'] },
  { id: 'violet',  name: 'Violet',  primary: '#7c3aed', accent: '#a78bfa', bars: ['#7c3aed','#8b5cf6','#a78bfa','#ede9fe'] },
  { id: 'slate',   name: 'Slate',   primary: '#475569', accent: '#94a3b8', bars: ['#475569','#64748b','#94a3b8','#e2e8f0'] },
  { id: 'custom',  name: 'Custom',  primary: '',        accent: '',        bars: [] },
] as const

// ─── Token option maps ────────────────────────────────────────────────────────

export const RADIUS_OPTS: { value: DesignTokens['borderRadius']; label: string }[] = [
  { value: 'none', label: 'None' }, { value: 'sm', label: 'SM' }, { value: 'md', label: 'MD' },
  { value: 'lg', label: 'LG' }, { value: 'xl', label: 'XL' }, { value: '2xl', label: '2XL' },
  { value: 'full', label: 'Full' },
]
export const SPACING_OPTS: { value: DesignTokens['spacingScale']; label: string }[] = [
  { value: 'compact', label: 'Compact' }, { value: 'normal', label: 'Normal' },
  { value: 'relaxed', label: 'Relaxed' }, { value: 'spacious', label: 'Spacious' },
]
export const SHADOW_OPTS: { value: DesignTokens['shadowIntensity']; label: string }[] = [
  { value: 'none', label: 'None' }, { value: 'subtle', label: 'Subtle' },
  { value: 'normal', label: 'Normal' }, { value: 'dramatic', label: 'Dramatic' },
]
export const GRADIENT_OPTS: { value: DesignTokens['gradientStyle']; label: string }[] = [
  { value: 'none', label: 'None' }, { value: 'subtle', label: 'Subtle' },
  { value: 'vibrant', label: 'Vibrant' }, { value: 'mesh', label: 'Mesh' },
]
export const BUTTON_OPTS: { value: DesignTokens['buttonStyle']; label: string }[] = [
  { value: 'sharp', label: 'Sharp' }, { value: 'rounded', label: 'Rounded' }, { value: 'pill', label: 'Pill' },
]
export const TYPO_OPTS: { value: DesignTokens['typography']; label: string; sample: string }[] = [
  { value: 'system',  label: 'System',  sample: 'system-ui, -apple-system' },
  { value: 'modern',  label: 'Modern',  sample: 'Inter / Avenir Next' },
  { value: 'classic', label: 'Classic', sample: 'Georgia / Serif' },
  { value: 'mono',    label: 'Mono',    sample: 'JetBrains Mono' },
]
export const FONTSIZE_OPTS: { value: DesignTokens['fontSizeScale']; label: string; px: number }[] = [
  { value: 'xs', label: 'XS', px: 12 }, { value: 'sm', label: 'SM', px: 14 },
  { value: 'md', label: 'MD', px: 16 }, { value: 'lg', label: 'LG', px: 18 },
  { value: 'xl', label: 'XL', px: 20 },
]
export const ANIMATION_OPTS: { value: DesignTokens['animationSpeed']; label: string; ms: string }[] = [
  { value: 'instant', label: 'Instant', ms: '0ms' }, { value: 'fast', label: 'Fast', ms: '150ms' },
  { value: 'normal', label: 'Normal', ms: '300ms' }, { value: 'slow', label: 'Slow', ms: '600ms' },
]
export const CONTAINER_OPTS: { value: DesignTokens['containerWidth']; label: string; px: string }[] = [
  { value: 'sm', label: 'SM', px: '640' }, { value: 'md', label: 'MD', px: '768' },
  { value: 'lg', label: 'LG', px: '1024' }, { value: 'xl', label: 'XL', px: '1280' },
  { value: 'full', label: 'Full', px: '∞' },
]
export const PADDING_OPTS: { value: DesignTokens['sectionPadding']; label: string; rem: string }[] = [
  { value: 'compact', label: 'Compact', rem: '3rem' }, { value: 'normal', label: 'Normal', rem: '5rem' },
  { value: 'spacious', label: 'Spacious', rem: '8rem' },
]
export const CARD_OPTS: { value: DesignTokens['cardStyle']; label: string; desc: string }[] = [
  { value: 'flat',     label: 'Flat',     desc: 'No shadow or border' },
  { value: 'elevated', label: 'Elevated', desc: 'Pronounced shadow' },
  { value: 'outlined', label: 'Outlined', desc: 'Visible border' },
  { value: 'ghost',    label: 'Ghost',    desc: 'Transparent background' },
]
export const INPUT_OPTS: { value: DesignTokens['inputStyle']; label: string; desc: string }[] = [
  { value: 'flat',       label: 'Flat',       desc: 'No border, subtle bg' },
  { value: 'outlined',   label: 'Outlined',   desc: 'Full border' },
  { value: 'filled',     label: 'Filled',     desc: 'Filled background' },
  { value: 'underlined', label: 'Underlined', desc: 'Bottom border only' },
]
export const GLASS_BLUR_OPTS: { value: DesignTokens['glassBlur']; label: string; px: string }[] = [
  { value: 'none', label: 'None', px: '0' }, { value: 'sm', label: 'SM', px: '8' },
  { value: 'md', label: 'MD', px: '20' }, { value: 'lg', label: 'LG', px: '32' },
  { value: 'xl', label: 'XL', px: '48' },
]
export const GLASS_OPACITY_OPTS: { value: DesignTokens['glassOpacity']; label: string }[] = [
  { value: 'ghost', label: 'Ghost' }, { value: 'light', label: 'Light' },
  { value: 'normal', label: 'Normal' }, { value: 'heavy', label: 'Heavy' }, { value: 'solid', label: 'Solid' },
]
export const GLASS_BORDER_OPTS: { value: DesignTokens['glassBorderOpacity']; label: string }[] = [
  { value: 'none', label: 'None' }, { value: 'subtle', label: 'Subtle' },
  { value: 'normal', label: 'Normal' }, { value: 'strong', label: 'Strong' },
]
export const GLOW_INTENSITY_OPTS: { value: DesignTokens['glowIntensity']; label: string; mul: string }[] = [
  { value: 'off',    label: 'Off',    mul: '0' },
  { value: 'subtle', label: 'Subtle', mul: '0.5' },
  { value: 'normal', label: 'Normal', mul: '1' },
  { value: 'vivid',  label: 'Vivid',  mul: '1.8' },
]

// ─── Domain accent defaults ───────────────────────────────────────────────────

export const DEFAULT_DOMAIN_ACCENTS = {
  projects:     '#a78bfa',
  research:     '#34d399',
  resources:    '#38bdf8',
  intelligence: '#facc15',
  github:       '#f472b6',
  about:        '#94a3b8',
} as const

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getPaletteColors(design: DesignConfig) {
  if (design.palette === 'custom') {
    return { primary: design.customPrimary, accent: design.customAccent }
  }
  const p = PALETTES.find(p => p.id === design.palette)
  return { primary: p?.primary ?? '#49b7ff', accent: p?.accent ?? '#80d6ff' }
}

export function radiusClass(r: DesignTokens['borderRadius']) {
  const map: Record<string, string> = {
    none: 'rounded-none', sm: 'rounded-sm', md: 'rounded-md',
    lg: 'rounded-lg', xl: 'rounded-xl', '2xl': 'rounded-2xl', full: 'rounded-full',
  }
  return map[r] ?? 'rounded-xl'
}

export function contrastRatio(hex1: string, hex2: string): number {
  function lum(hex: string) {
    const rgb = parseInt(hex.replace('#', ''), 16)
    const r = ((rgb >> 16) & 0xff) / 255
    const g = ((rgb >> 8) & 0xff) / 255
    const b = (rgb & 0xff) / 255
    const linearize = (v: number) => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b)
  }
  try {
    const l1 = lum(hex1)
    const l2 = lum(hex2)
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
  } catch {
    return 0
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

export function Section({ icon, title, subtitle, children }: {
  icon: React.ReactNode; title: string; subtitle?: string; children: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.02]">
      <div className="flex items-center gap-3 border-b border-white/6 px-5 py-3">
        <span className="text-white/40">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/55 font-medium">{title}</div>
          {subtitle && <div className="text-[9px] text-white/25 mt-0.5">{subtitle}</div>}
        </div>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  )
}

export function SubLabel({ children }: { children: React.ReactNode }) {
  return <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/30 mb-1.5">{children}</div>
}

export function OptionRow<T extends string>({ value, options, onChange }: {
  value: T
  options: { value: T; label: string; desc?: string; px?: string; rem?: string; ms?: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)}
          className={cn(
            'rounded-lg border px-2.5 py-1.5 text-left font-mono text-[9px] uppercase tracking-wider transition-colors',
            value === o.value
              ? 'border-indigo-400/40 bg-indigo-400/10 text-indigo-300'
              : 'border-white/8 text-white/30 hover:border-white/18 hover:text-white/55'
          )}>
          <span>{o.label}</span>
          {(o.px || o.rem || o.ms) && (
            <span className="ml-1 text-[7px] opacity-50">{o.px ?? o.rem ?? o.ms}</span>
          )}
        </button>
      ))}
    </div>
  )
}

export function ColorField({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void
}) {
  return (
    <div>
      {label && <SubLabel>{label}</SubLabel>}
      <div className="flex items-center gap-2.5">
        <div className="relative">
          <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
            className="h-8 w-8 shrink-0 rounded-lg border border-white/10 cursor-pointer bg-transparent p-0.5 opacity-0 absolute inset-0" />
          <div className="h-8 w-8 rounded-lg border border-white/15 pointer-events-none" style={{ background: value }} />
        </div>
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 font-mono text-[10px] text-white/65 outline-none focus:border-white/25 transition-colors"
          placeholder="#000000" maxLength={9} />
      </div>
    </div>
  )
}

// ─── Live Website Color Tokens ────────────────────────────────────────────────

export function WebsiteColorTokens({ compact = false }: { compact?: boolean }) {
  const [liveTokens, setLiveTokens] = useState<Record<string, string>>({})

  useEffect(() => {
    function read() {
      const root = document.documentElement
      const style = getComputedStyle(root)
      const vars = [
        '--primary', '--accent', '--secondary',
        '--background', '--foreground', '--card',
        '--border', '--ring',
        '--glow', '--glow-secondary',
        '--muted', '--muted-foreground',
        '--gradient-start', '--gradient-mid', '--gradient-end',
        '--shadow-intensity', '--glow-intensity',
      ]
      const result: Record<string, string> = {}
      for (const v of vars) result[v] = style.getPropertyValue(v).trim()
      setLiveTokens(result)
    }
    read()
    const onSave = () => setTimeout(read, 50)
    window.addEventListener('admin-state-saved', onSave)
    return () => window.removeEventListener('admin-state-saved', onSave)
  }, [])

  const COLOR_GROUPS = [
    { label: 'Primary',     cssVar: '--primary' },
    { label: 'Accent',      cssVar: '--accent' },
    { label: 'Secondary',   cssVar: '--secondary' },
    { label: 'Background',  cssVar: '--background' },
    { label: 'Card',        cssVar: '--card' },
    { label: 'Foreground',  cssVar: '--foreground' },
    { label: 'Border',      cssVar: '--border' },
    { label: 'Ring',        cssVar: '--ring' },
    { label: 'Glow',        cssVar: '--glow' },
    { label: 'Glow 2',      cssVar: '--glow-secondary' },
    { label: 'Muted',       cssVar: '--muted' },
    { label: 'Muted FG',    cssVar: '--muted-foreground' },
    { label: 'Grad Start',  cssVar: '--gradient-start' },
    { label: 'Grad Mid',    cssVar: '--gradient-mid' },
    { label: 'Grad End',    cssVar: '--gradient-end' },
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-emerald-400/60">Live CSS Variables — Current Site</div>
        <div className="flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[8px] text-emerald-300">LIVE</span>
        </div>
      </div>
      <div className={cn('grid gap-1.5', compact ? 'grid-cols-5' : 'grid-cols-5')}>
        {COLOR_GROUPS.map(({ label, cssVar }) => {
          const color = liveTokens[cssVar] || 'transparent'
          return (
            <div key={cssVar} className="rounded-lg overflow-hidden border border-white/8 group cursor-default"
              title={`${cssVar}: ${color}`}>
              <div className="h-8 relative" style={{ background: color }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center bg-black/30">
                  <span className="font-mono text-[6px] text-white/80 px-1 text-center leading-tight">{color}</span>
                </div>
              </div>
              <div className="px-1.5 py-1 bg-black/30 text-[7px] font-mono text-white/35 truncate">{label}</div>
            </div>
          )
        })}
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {[
          { label: '--shadow-intensity', val: liveTokens['--shadow-intensity'] },
          { label: '--glow-intensity',   val: liveTokens['--glow-intensity'] },
        ].map(({ label, val }) => (
          <div key={label} className="flex items-center gap-2 rounded-lg border border-white/6 bg-white/[0.02] px-3 py-2">
            <div className="flex-1 font-mono text-[8px] text-white/30 truncate">{label}</div>
            <div className="font-mono text-[10px] text-white/70">{val || '—'}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Website Live Preview ─────────────────────────────────────────────────────

export function WebsitePreview({ primary, accent, siteName, tagline, tokens }: {
  primary: string; accent: string; siteName: string; tagline: string; tokens: DesignTokens
}) {
  const btnRadius = tokens.buttonStyle === 'sharp' ? '2px' : tokens.buttonStyle === 'pill' ? '99px' : '8px'
  const contrast = contrastRatio(primary, '#ffffff')
  const contrastOk = contrast >= 4.5

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">Website Component Preview</div>
        <div className={cn('flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[8px]',
          contrastOk
            ? 'border-emerald-400/25 bg-emerald-400/8 text-emerald-300'
            : 'border-amber-400/25 bg-amber-400/8 text-amber-300'
        )}>
          <Globe className="h-2.5 w-2.5" />
          {contrastOk ? `WCAG AA ✓ (${contrast.toFixed(1)}:1)` : `Low contrast (${contrast.toFixed(1)}:1)`}
        </div>
      </div>

      <div className="rounded-2xl border border-white/8 bg-[#05060a] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/6 bg-black/30">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded" style={{ background: primary }} />
            <span className="font-mono text-[10px] font-semibold text-white/80">{siteName || 'JootaCee'}</span>
          </div>
          <div className="flex items-center gap-3">
            {['Systems', 'Labs', 'Journal'].map(item => (
              <span key={item} className="font-mono text-[9px] text-white/35 hover:text-white/65 cursor-pointer">{item}</span>
            ))}
            <div className="rounded px-2.5 py-1 font-mono text-[9px] font-semibold text-white"
              style={{ background: primary, borderRadius: btnRadius }}>
              Collaborate
            </div>
          </div>
        </div>
        <div className="px-6 py-8 relative">
          <div className="absolute inset-0 opacity-10" style={{
            background: `radial-gradient(ellipse 60% 50% at 30% 50%, ${primary}, transparent)`
          }} />
          <div className="relative">
            <div className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 mb-3 font-mono text-[9px]"
              style={{ borderColor: `${primary}40`, color: primary }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: primary }} />
              AI Systems Architect
            </div>
            <div className="text-2xl font-semibold text-white/90 mb-1.5 leading-tight">
              {siteName || 'JootaCee'}
            </div>
            <div className="text-[11px] text-white/40 mb-4 max-w-xs leading-relaxed">
              {tagline || 'Building the future of autonomous AI systems'}
            </div>
            <div className="flex items-center gap-2">
              <div className="px-4 py-2 font-mono text-[10px] font-semibold text-white"
                style={{ background: primary, borderRadius: btnRadius }}>
                Enter Systems
              </div>
              <div className="px-4 py-2 font-mono text-[10px] border text-white/60"
                style={{ borderColor: `${primary}35`, color: primary, borderRadius: btnRadius }}>
                Open Labs
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 px-4 pb-4">
          {['Systems', 'Labs', 'Infrastructure'].map((label, i) => (
            <div key={label} className="rounded-xl border border-white/8 bg-white/[0.025] p-3">
              <div className="h-1 w-8 rounded-full mb-2 opacity-80" style={{ background: [primary, accent, '#8b5cf6'][i] }} />
              <div className="text-[10px] font-medium text-white/70 mb-0.5">{label}</div>
              <div className="text-[8px] text-white/30">Click to explore →</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
