'use client'

import { useState, useEffect } from 'react'
import { Check, RefreshCw, Globe, Palette, Layout, Type, Sliders, Layers, Sparkles, Blend } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdmin } from '@/lib/admin/store'
import type { DesignTokens, DesignConfig, DomainAccents } from '@/lib/admin/types'

// ─── Palette registry (mirrors ThemeApplicator + getThemeInitScript) ──────────

const PALETTES = [
  { id: 'ocean',   name: 'Ocean',   primary: '#0ea5e9', accent: '#7dd3fc', bars: ['#0ea5e9','#38bdf8','#7dd3fc','#e0f2fe'] },
  { id: 'emerald', name: 'Emerald', primary: '#059669', accent: '#6ee7b7', bars: ['#059669','#10b981','#6ee7b7','#d1fae5'] },
  { id: 'amber',   name: 'Amber',   primary: '#d97706', accent: '#fcd34d', bars: ['#d97706','#f59e0b','#fcd34d','#fef3c7'] },
  { id: 'rose',    name: 'Rose',    primary: '#e11d48', accent: '#fb7185', bars: ['#e11d48','#f43f5e','#fb7185','#fecdd3'] },
  { id: 'violet',  name: 'Violet',  primary: '#7c3aed', accent: '#a78bfa', bars: ['#7c3aed','#8b5cf6','#a78bfa','#ede9fe'] },
  { id: 'slate',   name: 'Slate',   primary: '#475569', accent: '#94a3b8', bars: ['#475569','#64748b','#94a3b8','#e2e8f0'] },
  { id: 'custom',  name: 'Custom',  primary: '',        accent: '',        bars: [] },
] as const

type PaletteId = typeof PALETTES[number]['id']

function getPaletteColors(design: DesignConfig) {
  if (design.palette === 'custom') {
    return { primary: design.customPrimary, accent: design.customAccent }
  }
  const p = PALETTES.find(p => p.id === design.palette)
  return { primary: p?.primary ?? '#49b7ff', accent: p?.accent ?? '#80d6ff' }
}

// ─── Token option maps ────────────────────────────────────────────────────────

const RADIUS_OPTS: { value: DesignTokens['borderRadius']; label: string }[] = [
  { value: 'none', label: 'None' }, { value: 'sm', label: 'SM' }, { value: 'md', label: 'MD' },
  { value: 'lg', label: 'LG' }, { value: 'xl', label: 'XL' }, { value: '2xl', label: '2XL' },
  { value: 'full', label: 'Full' },
]
const SPACING_OPTS: { value: DesignTokens['spacingScale']; label: string }[] = [
  { value: 'compact', label: 'Compact' }, { value: 'normal', label: 'Normal' },
  { value: 'relaxed', label: 'Relaxed' }, { value: 'spacious', label: 'Spacious' },
]
const SHADOW_OPTS: { value: DesignTokens['shadowIntensity']; label: string }[] = [
  { value: 'none', label: 'None' }, { value: 'subtle', label: 'Subtle' },
  { value: 'normal', label: 'Normal' }, { value: 'dramatic', label: 'Dramatic' },
]
const GRADIENT_OPTS: { value: DesignTokens['gradientStyle']; label: string }[] = [
  { value: 'none', label: 'None' }, { value: 'subtle', label: 'Subtle' },
  { value: 'vibrant', label: 'Vibrant' }, { value: 'mesh', label: 'Mesh' },
]
const BUTTON_OPTS: { value: DesignTokens['buttonStyle']; label: string }[] = [
  { value: 'sharp', label: 'Sharp' }, { value: 'rounded', label: 'Rounded' }, { value: 'pill', label: 'Pill' },
]
const TYPO_OPTS: { value: DesignTokens['typography']; label: string; sample: string }[] = [
  { value: 'system',  label: 'System',  sample: 'system-ui, -apple-system' },
  { value: 'modern',  label: 'Modern',  sample: 'Inter / Avenir Next' },
  { value: 'classic', label: 'Classic', sample: 'Georgia / Serif' },
  { value: 'mono',    label: 'Mono',    sample: 'JetBrains Mono' },
]
const FONTSIZE_OPTS: { value: DesignTokens['fontSizeScale']; label: string; px: number }[] = [
  { value: 'xs', label: 'XS', px: 12 }, { value: 'sm', label: 'SM', px: 14 },
  { value: 'md', label: 'MD', px: 16 }, { value: 'lg', label: 'LG', px: 18 },
  { value: 'xl', label: 'XL', px: 20 },
]
const ANIMATION_OPTS: { value: DesignTokens['animationSpeed']; label: string; ms: string }[] = [
  { value: 'instant', label: 'Instant', ms: '0ms' }, { value: 'fast', label: 'Fast', ms: '150ms' },
  { value: 'normal', label: 'Normal', ms: '300ms' }, { value: 'slow', label: 'Slow', ms: '600ms' },
]
const CONTAINER_OPTS: { value: DesignTokens['containerWidth']; label: string; px: string }[] = [
  { value: 'sm', label: 'SM', px: '640' }, { value: 'md', label: 'MD', px: '768' },
  { value: 'lg', label: 'LG', px: '1024' }, { value: 'xl', label: 'XL', px: '1280' },
  { value: 'full', label: 'Full', px: '∞' },
]
const PADDING_OPTS: { value: DesignTokens['sectionPadding']; label: string; rem: string }[] = [
  { value: 'compact', label: 'Compact', rem: '3rem' }, { value: 'normal', label: 'Normal', rem: '5rem' },
  { value: 'spacious', label: 'Spacious', rem: '8rem' },
]
const CARD_OPTS: { value: DesignTokens['cardStyle']; label: string; desc: string }[] = [
  { value: 'flat',     label: 'Flat',     desc: 'No shadow or border' },
  { value: 'elevated', label: 'Elevated', desc: 'Pronounced shadow' },
  { value: 'outlined', label: 'Outlined', desc: 'Visible border' },
  { value: 'ghost',    label: 'Ghost',    desc: 'Transparent background' },
]
const INPUT_OPTS: { value: DesignTokens['inputStyle']; label: string; desc: string }[] = [
  { value: 'flat',       label: 'Flat',       desc: 'No border, subtle bg' },
  { value: 'outlined',   label: 'Outlined',   desc: 'Full border' },
  { value: 'filled',     label: 'Filled',     desc: 'Filled background' },
  { value: 'underlined', label: 'Underlined', desc: 'Bottom border only' },
]

// ─── Domain accent defaults (mirrors Navigation.tsx) ─────────────────────────

const DEFAULT_DOMAIN_ACCENTS = {
  projects:     '#a78bfa',
  research:     '#34d399',
  resources:    '#38bdf8',
  intelligence: '#facc15',
  github:       '#f472b6',
  about:        '#94a3b8',
} as const

// ─── Helpers ──────────────────────────────────────────────────────────────────

function radiusClass(r: DesignTokens['borderRadius']) {
  const map: Record<string, string> = {
    none: 'rounded-none', sm: 'rounded-sm', md: 'rounded-md',
    lg: 'rounded-lg', xl: 'rounded-xl', '2xl': 'rounded-2xl', full: 'rounded-full',
  }
  return map[r] ?? 'rounded-xl'
}

// Compute contrast ratio (WCAG) — used for accessibility warnings
function contrastRatio(hex1: string, hex2: string): number {
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

// ─── Sub-section wrappers ─────────────────────────────────────────────────────

function Section({ icon, title, subtitle, children }: { icon: React.ReactNode; title: string; subtitle?: string; children: React.ReactNode }) {
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

function SubLabel({ children }: { children: React.ReactNode }) {
  return <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/30 mb-1.5">{children}</div>
}

function OptionRow<T extends string>({ value, options, onChange }: {
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

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <SubLabel>{label}</SubLabel>
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

function WebsiteColorTokens({ compact = false }: { compact?: boolean }) {
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
          const isLight = /^#[def]/i.test(color)
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
      {/* Numeric tokens */}
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

function WebsitePreview({ primary, accent, siteName, tagline, tokens }: {
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
        {/* Nav bar */}
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

        {/* Hero area */}
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

        {/* Card grid */}
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

// ─── Glass + button option maps ──────────────────────────────────────────────

const GLASS_BLUR_OPTS: { value: DesignTokens['glassBlur']; label: string; px: string }[] = [
  { value: 'none', label: 'None', px: '0' }, { value: 'sm', label: 'SM', px: '8' },
  { value: 'md', label: 'MD', px: '20' }, { value: 'lg', label: 'LG', px: '32' },
  { value: 'xl', label: 'XL', px: '48' },
]
const GLASS_OPACITY_OPTS: { value: DesignTokens['glassOpacity']; label: string }[] = [
  { value: 'ghost', label: 'Ghost' }, { value: 'light', label: 'Light' },
  { value: 'normal', label: 'Normal' }, { value: 'heavy', label: 'Heavy' }, { value: 'solid', label: 'Solid' },
]
const GLASS_BORDER_OPTS: { value: DesignTokens['glassBorderOpacity']; label: string }[] = [
  { value: 'none', label: 'None' }, { value: 'subtle', label: 'Subtle' },
  { value: 'normal', label: 'Normal' }, { value: 'strong', label: 'Strong' },
]

// ─── Glow intensity options ───────────────────────────────────────────────────

const GLOW_INTENSITY_OPTS: { value: DesignTokens['glowIntensity']; label: string; mul: string }[] = [
  { value: 'off',    label: 'Off',    mul: '0' },
  { value: 'subtle', label: 'Subtle', mul: '0.5' },
  { value: 'normal', label: 'Normal', mul: '1' },
  { value: 'vivid',  label: 'Vivid',  mul: '1.8' },
]

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
  const { state, dispatch, forceSave } = useAdmin()
  const { design } = state
  const { tokens } = design
  const [tab, setTab] = useState<DesignTab>('palette')
  const [lastApplied, setLastApplied] = useState<number | null>(null)

  useEffect(() => {
    const onSave = () => setLastApplied(Date.now())
    window.addEventListener('admin-state-saved', onSave)
    return () => window.removeEventListener('admin-state-saved', onSave)
  }, [])

  const { primary, accent } = getPaletteColors(design)
  const palettePreviewBars = (p: typeof PALETTES[number]) =>
    p.id === 'custom'
      ? [design.customPrimary, design.customSecondary, design.customAccent, '#ffffff20']
      : p.bars as unknown as string[]

  function updateDesign(data: Partial<DesignConfig>) { dispatch({ type: 'UPDATE_DESIGN', payload: data }) }
  function updateToken(data: Partial<DesignTokens>)  { dispatch({ type: 'UPDATE_TOKENS',  payload: data }) }

  const secondsSince = lastApplied ? Math.round((Date.now() - lastApplied) / 1000) : null

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
          {/* Applied status */}
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

      {/* ══ COLORS TAB ══════════════════════════════════════════════════════════ */}
      {tab === 'palette' && (
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
              {/* Swatch preview */}
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
      )}

      {/* ══ GLOW TAB ════════════════════════════════════════════════════════════ */}
      {tab === 'glow' && (
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
            {/* Live gradient-text preview */}
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
              {/* Color stop bar */}
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
      )}

      {/* ══ COMPONENTS TAB ══════════════════════════════════════════════════════ */}
      {tab === 'components' && (
        <div className="space-y-4">

          {/* ── Primary Button ──────────────────────────────────────────────── */}
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
            {/* Shape is controlled by Token buttonStyle */}
            <div>
              <SubLabel>Button shape (→ Tokens tab)</SubLabel>
              <OptionRow value={tokens.buttonStyle} options={BUTTON_OPTS} onChange={v => updateToken({ buttonStyle: v })} />
            </div>
            {/* Live preview */}
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

          {/* ── Glass Panels ───────────────────────────────────────────────── */}
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
            {/* Glass preview */}
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

          {/* ── Domain Accent Colors ───────────────────────────────────────── */}
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
            {/* Domain accent preview bar */}
            <div className="flex gap-1.5 pt-1">
              {(['projects','research','resources','intelligence','github','about'] as const).map(k => (
                <div key={k} className="flex-1 rounded-lg overflow-hidden border border-white/8">
                  <div className="h-4" style={{ background: design.domainAccents?.[k] || DEFAULT_DOMAIN_ACCENTS[k] }} />
                  <div className="px-1 py-0.5 text-[6px] font-mono text-white/30 truncate">{k}</div>
                </div>
              ))}
            </div>
            {/* Navigation scan line preview */}
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
      )}

      {/* ══ TOKENS TAB ══════════════════════════════════════════════════════════ */}
      {tab === 'tokens' && (
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
                {(() => {
                  const s = parseFloat({ none:'0', subtle:'0.6', normal:'1', dramatic:'1.8' }[tokens.shadowIntensity ?? 'normal'] ?? '1')
                  return (
                    <div className="mt-2 flex gap-2">
                      {(['none','subtle','normal','dramatic'] as const).map((k) => {
                        const sv = parseFloat({ none:'0', subtle:'0.6', normal:'1', dramatic:'1.8' }[k] ?? '1')
                        return (
                          <div key={k} className="flex-1 rounded-lg bg-white/5 py-2 text-center"
                            style={{ boxShadow: sv > 0 ? `0 ${4*sv}px ${16*sv}px rgb(0 0 0 / ${0.18*sv})` : 'none' }}>
                            <div className={cn('font-mono text-[7px]', tokens.shadowIntensity === k ? 'text-indigo-300' : 'text-white/25')}>{k}</div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })()}
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

          {/* Token summary card */}
          <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.18em] text-white/25">Active Token Summary → CSS variables injected into website</div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '--container-max',  value: { sm:'640px', md:'768px', lg:'1024px', xl:'1280px', full:'100%' }[tokens.containerWidth] ?? '1280px' },
                { label: '--section-py',     value: { compact:'3rem', normal:'5rem', spacious:'8rem' }[tokens.sectionPadding] ?? '5rem' },
                { label: '--radius-base',    value: { none:'0px', sm:'4px', md:'8px', lg:'12px', xl:'16px', '2xl':'24px', full:'9999px' }[tokens.borderRadius] ?? '12px' },
                { label: '--radius-button',  value: { sharp:'0px', rounded:'8px', pill:'9999px' }[tokens.buttonStyle ?? 'pill'] ?? '9999px' },
                { label: '--anim-duration',  value: { instant:'0ms', fast:'150ms', normal:'300ms', slow:'600ms' }[tokens.animationSpeed] ?? '300ms' },
                { label: '--font-size-base', value: { xs:'12px', sm:'14px', md:'16px', lg:'18px', xl:'20px' }[tokens.fontSizeScale ?? 'md'] ?? '16px' },
                { label: '--shadow-intensity', value: { none:'0', subtle:'0.6', normal:'1', dramatic:'1.8' }[tokens.shadowIntensity ?? 'normal'] ?? '1' },
                { label: '--glow-intensity', value: { off:'0', subtle:'0.5', normal:'1', vivid:'1.8' }[tokens.glowIntensity ?? 'normal'] ?? '1' },
                { label: '--font-sans',      value: tokens.typography ?? 'modern' },
                { label: '--primary',        value: primary },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg border border-white/6 bg-white/[0.02] px-3 py-2">
                  <div className="font-mono text-[8px] text-white/30 mb-0.5">{label}</div>
                  <div className="font-mono text-[10px] text-white/70 truncate">{value}</div>
                </div>
              ))}
            </div>

            {/* Live token preview strip */}
            <div className="mt-3 flex gap-2 items-center">
              <button type="button" className="px-4 py-1.5 text-[10px] font-medium text-white transition-all"
                style={{
                  background: primary,
                  borderRadius: { sharp:'0px', rounded:'8px', pill:'9999px' }[tokens.buttonStyle ?? 'pill'] ?? '9999px',
                  boxShadow: `0 ${4 * parseFloat(({ none:'0', subtle:'0.6', normal:'1', dramatic:'1.8' }[tokens.shadowIntensity ?? 'normal'] ?? '1'))}px ${16 * parseFloat(({ none:'0', subtle:'0.6', normal:'1', dramatic:'1.8' }[tokens.shadowIntensity ?? 'normal'] ?? '1'))}px ${primary}55`,
                }}>
                Button preview
              </button>
              <div className="flex-1 rounded-lg border border-white/10 px-3 py-1.5 text-[10px] text-white/50"
                style={{
                  borderRadius: { none:'0px', sm:'4px', md:'8px', lg:'12px', xl:'16px', '2xl':'24px', full:'9999px' }[tokens.borderRadius] ?? '12px',
                  boxShadow: `0 ${8 * parseFloat(({ none:'0', subtle:'0.6', normal:'1', dramatic:'1.8' }[tokens.shadowIntensity ?? 'normal'] ?? '1'))}px ${32 * parseFloat(({ none:'0', subtle:'0.6', normal:'1', dramatic:'1.8' }[tokens.shadowIntensity ?? 'normal'] ?? '1'))}px rgb(0 0 0 / 0.28)`,
                  fontSize: { xs:'12px', sm:'14px', md:'16px', lg:'18px', xl:'20px' }[tokens.fontSizeScale ?? 'md'] ?? '16px',
                }}>
                Card / text size
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ PREVIEW TAB ═════════════════════════════════════════════════════════ */}
      {tab === 'preview' && (
        <div className="space-y-4">
          <WebsitePreview
            primary={primary}
            accent={accent}
            siteName={state.site.name}
            tagline={state.site.businessFocus}
            tokens={tokens}
          />

          {/* Live website CSS vars */}
          <Section icon={<Globe className="h-3.5 w-3.5" />} title="Live CSS variable readout" subtitle="Computed values currently active on the website">
            <WebsiteColorTokens />
          </Section>

          {/* Export tokens */}
          <Section icon={<Sliders className="h-3.5 w-3.5" />} title="Export design tokens" subtitle="Copy as CSS custom properties">
            {(() => {
              const radiusBase = { none:'0px', sm:'4px', md:'8px', lg:'12px', xl:'16px', '2xl':'24px', full:'9999px' }[tokens.borderRadius ?? 'lg'] ?? '12px'
              const radiusBtn  = { sharp:'0px', rounded:'8px', pill:'9999px' }[tokens.buttonStyle ?? 'pill'] ?? '9999px'
              const animDur    = { instant:'0ms', fast:'150ms', normal:'300ms', slow:'600ms' }[tokens.animationSpeed ?? 'normal'] ?? '300ms'
              const container  = { sm:'640px', md:'768px', lg:'1024px', xl:'1280px', full:'100%' }[tokens.containerWidth ?? 'xl'] ?? '1280px'
              const sectionPy  = { compact:'3rem', normal:'5rem', spacious:'8rem' }[tokens.sectionPadding ?? 'normal'] ?? '5rem'
              const fontSize   = { xs:'12px', sm:'14px', md:'16px', lg:'18px', xl:'20px' }[tokens.fontSizeScale ?? 'md'] ?? '16px'
              const shadow     = { none:'0', subtle:'0.6', normal:'1', dramatic:'1.8' }[tokens.shadowIntensity ?? 'normal'] ?? '1'
              const glowInt    = { off:'0', subtle:'0.5', normal:'1', vivid:'1.8' }[tokens.glowIntensity ?? 'normal'] ?? '1'
              const css = [
                ':root {',
                `  --primary: ${primary};`,
                `  --accent: ${accent};`,
                design.customBackground ? `  --background: ${design.customBackground};` : null,
                design.customText       ? `  --foreground: ${design.customText};` : null,
                design.customBorder     ? `  --border: ${design.customBorder};` : null,
                design.customSurface    ? `  --card: ${design.customSurface};` : null,
                `  --radius-base: ${radiusBase};`,
                `  --radius-button: ${radiusBtn};`,
                `  --anim-duration: ${animDur};`,
                `  --container-max: ${container};`,
                `  --section-py: ${sectionPy};`,
                `  --font-size-base: ${fontSize};`,
                `  --shadow-intensity: ${shadow};`,
                `  --glow-intensity: ${glowInt};`,
                design.customGlow          ? `  --glow: ${design.customGlow};` : null,
                design.customGlowSecondary ? `  --glow-secondary: ${design.customGlowSecondary};` : null,
                design.customRing          ? `  --ring: ${design.customRing};` : null,
                design.customMuted         ? `  --muted: ${design.customMuted};` : null,
                design.customMutedFg       ? `  --muted-foreground: ${design.customMutedFg};` : null,
                design.gradientStart       ? `  --gradient-start: ${design.gradientStart};` : null,
                design.gradientMid         ? `  --gradient-mid: ${design.gradientMid};` : null,
                design.gradientEnd         ? `  --gradient-end: ${design.gradientEnd};` : null,
                '}',
              ].filter(Boolean).join('\n')
              return (
                <>
                  <div className="rounded-xl bg-black/40 p-3 font-mono text-[9px] text-white/50 overflow-auto max-h-48">
                    <pre>{css}</pre>
                  </div>
                  <button type="button"
                    onClick={() => navigator.clipboard.writeText(css)}
                    className="w-full rounded-lg border border-white/8 py-2 font-mono text-[9px] text-white/40 hover:border-white/20 hover:text-white/65 transition-all">
                    Copy CSS variables
                  </button>
                </>
              )
            })()}
          </Section>
        </div>
      )}
    </div>
  )
}
