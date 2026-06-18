'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  ChevronDown, Check, X, Eye, EyeOff, Pin, PinOff, AlignLeft,
  BookMarked, Layout, Palette, Sidebar, LayoutDashboard, MousePointer, FileJson,
  Zap, FolderOpen, BookOpen, GitBranch, User, Microscope, BarChart3, FlaskConical,
  Globe, Wand2, Layers, Blocks, Network, Server, Plug, Bot, Settings2, Search,
  SlidersHorizontal,
} from 'lucide-react'
import type {
  AdminPanel, StudioPanelConfig, StudioNavGroupConfig, StudioConfig,
} from '@/lib/admin/types'

// reason: icon components need style prop for accent color rendering
export type IconComp = React.ComponentType<{ className?: string; style?: React.CSSProperties }>

// ─── Color harmonics math ─────────────────────────────────────────────────────

export function hexToHsl(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16)
  const r = ((n >> 16) & 255) / 255
  const g = ((n >> 8) & 255) / 255
  const b = (n & 255) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, Math.round(l * 100)]
  const d = max - min
  const s = d / (1 - Math.abs(2 * l - 1))
  let h = 0
  switch (max) {
    case r: h = ((g - b) / d + 6) % 6; break
    case g: h = (b - r) / d + 2; break
    case b: h = (r - g) / d + 4; break
  }
  return [Math.round(h * 60), Math.round(s * 100), Math.round(l * 100)]
}

export function hslToHex(h: number, s: number, l: number): string {
  const sN = s / 100, lN = l / 100
  const a = sN * Math.min(lN, 1 - lN)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const c = lN - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * c).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

export function getHarmonics(hex: string) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return null
  const [h, s, l] = hexToHsl(hex)
  return [
    { label: 'Comp',  color: hslToHex((h + 180) % 360, s, l) },
    { label: '+30°',  color: hslToHex((h + 30)  % 360, s, l) },
    { label: '-30°',  color: hslToHex((h - 30 + 360) % 360, s, l) },
    { label: 'Tri +', color: hslToHex((h + 120) % 360, s, l) },
    { label: 'Tri -', color: hslToHex((h + 240) % 360, s, l) },
  ]
}

export function getTintScale(hex: string): Array<{ lightness: number; color: string }> {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return []
  const [h, s] = hexToHsl(hex)
  return [12, 20, 30, 40, 50, 60, 68, 76, 84].map(l => ({
    lightness: l,
    color: hslToHex(h, Math.max(s - Math.max(0, l - 55) * 0.9, 18), l),
  }))
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

export const TABS = [
  { id: 'profiles',   label: 'Profiles',   icon: BookMarked      },
  { id: 'layout',     label: 'Layout',     icon: Layout          },
  { id: 'appearance', label: 'Appearance', icon: Palette         },
  { id: 'navigation', label: 'Nav',        icon: Sidebar         },
  { id: 'panels',     label: 'Panels',     icon: LayoutDashboard },
  { id: 'behavior',   label: 'Behavior',   icon: MousePointer    },
  { id: 'export',     label: 'Export',     icon: FileJson        },
] as const

export type Tab = typeof TABS[number]['id']

// ─── Built-in workspace profiles ──────────────────────────────────────────────

export const BUILTIN_WORKSPACE_PROFILES: Array<{
  id: string; name: string; icon: string; description: string
  accentColor: string; snapshot: Partial<StudioConfig>
}> = [
  {
    id: 'focus',
    name: 'Focus Mode',
    icon: '🎯',
    description: 'Compact sidebar, tight layout, no animations — maximum workspace',
    accentColor: '#22d3ee',
    snapshot: {
      sidebarWidth: 'compact', density: 'compact', panelPadding: 'tight',
      animations: false, reducedMotion: true, showDescriptions: false,
      sidebarCollapsedDefault: true, headerHeight: 'sm',
    },
  },
  {
    id: 'presentation',
    name: 'Presentation',
    icon: '📊',
    description: 'Large text, comfortable spacing, high contrast — for screen sharing',
    accentColor: '#818cf8',
    snapshot: {
      contentMaxWidth: '2xl', density: 'comfortable', panelPadding: 'loose',
      fontSize: 'md', fontFamily: 'sans', highContrast: true,
      sidebarWidth: 'normal', headerHeight: 'lg', panelTransition: 'fade',
    },
  },
  {
    id: 'dev-speed',
    name: 'Dev Speed',
    icon: '⚡',
    description: 'Mono font, compact density, keyboard-first, instant transitions',
    accentColor: '#34d399',
    snapshot: {
      fontFamily: 'mono', fontSize: 'sm', density: 'compact',
      sidebarWidth: 'compact', headerHeight: 'sm', panelPadding: 'tight',
      keyboardShortcuts: true, showDescriptions: false, panelTransition: 'none',
      compactHeader: true,
    },
  },
  {
    id: 'dark-zen',
    name: 'Dark Zen',
    icon: '🌑',
    description: 'Void background, border sidebar, no glow — pure minimal dark',
    accentColor: '#a78bfa',
    snapshot: {
      backgroundStyle: 'void', sidebarStyle: 'border', glowEffect: false,
      sidebarBorder: false, borderRadius: 'sharp', showGroupDividers: false,
      animations: true, showDescriptions: false,
    },
  },
]

// ─── Built-in visual presets ──────────────────────────────────────────────────

export interface BuiltinPreset {
  id: string; name: string; description: string; accent: string
  bg: StudioConfig['backgroundStyle']; sidebar: StudioConfig['sidebarStyle']
  borderRadius: StudioConfig['borderRadius']; glowEffect: boolean; sidebarBorder: boolean
}

export const BUILTIN_PRESETS: BuiltinPreset[] = [
  { id: 'cyber-ocean', name: 'Cyber Ocean', description: 'Cyan on deep midnight, glass sidebar',    accent: '#22d3ee', bg: 'midnight', sidebar: 'glass',  borderRadius: 'rounded', glowEffect: true,  sidebarBorder: false },
  { id: 'void',        name: 'Void',        description: 'Pure black, high contrast, border lines', accent: '#22d3ee', bg: 'void',     sidebar: 'border', borderRadius: 'sharp',   glowEffect: false, sidebarBorder: true  },
  { id: 'violet-haze', name: 'Violet Haze', description: 'Purple accents on dark, glass sidebar',   accent: '#a78bfa', bg: 'dark',     sidebar: 'glass',  borderRadius: 'normal',  glowEffect: true,  sidebarBorder: false },
  { id: 'ember',       name: 'Ember',       description: 'Warm orange on slate, solid sidebar',     accent: '#fb923c', bg: 'slate',    sidebar: 'solid',  borderRadius: 'normal',  glowEffect: false, sidebarBorder: true  },
  { id: 'matrix',      name: 'Matrix',      description: 'Emerald on void, border-only sidebar',    accent: '#34d399', bg: 'void',     sidebar: 'border', borderRadius: 'sharp',   glowEffect: false, sidebarBorder: true  },
  { id: 'arctic',      name: 'Arctic',      description: 'Cool blue on slate, glass treatment',     accent: '#60a5fa', bg: 'slate',    sidebar: 'glass',  borderRadius: 'rounded', glowEffect: true,  sidebarBorder: false },
]

// ─── Panel metadata ───────────────────────────────────────────────────────────

export const ALL_PANELS: { id: AdminPanel; label: string; desc: string; group: string; icon: IconComp; accent: string }[] = [
  { id: 'intake',         label: 'New Entry',      desc: 'Universal content intake',   group: 'content',      icon: Zap,               accent: '#22d3ee' },
  { id: 'projects',       label: 'Projects',       desc: 'Portfolio & case studies',   group: 'content',      icon: FolderOpen,        accent: '#a78bfa' },
  { id: 'research',       label: 'Research',       desc: 'Articles, essays & news',    group: 'content',      icon: BookOpen,          accent: '#34d399' },
  { id: 'github',         label: 'GitHub',         desc: 'Repository intelligence',    group: 'content',      icon: GitBranch,         accent: '#6ee7b7' },
  { id: 'about',          label: 'About',          desc: 'Bio, skills & timeline',     group: 'content',      icon: User,              accent: '#f472b6' },
  { id: 'intelligence',   label: 'Intelligence',   desc: 'Feeds & data sources',       group: 'content',      icon: Microscope,        accent: '#c084fc' },
  { id: 'command',        label: 'Overview',       desc: 'Publishing dashboard',       group: 'operations',   icon: LayoutDashboard,   accent: '#22d3ee' },
  { id: 'analytics',      label: 'Analytics',      desc: 'Metrics & performance',      group: 'operations',   icon: BarChart3,         accent: '#f43f5e' },
  { id: 'labs',           label: 'Labs',           desc: 'Experiments & demos',        group: 'operations',   icon: FlaskConical,      accent: '#f59e0b' },
  { id: 'seo',            label: 'SEO & Meta',     desc: 'Indexing & social',          group: 'site-builder', icon: Search,            accent: '#60a5fa' },
  { id: 'design-studio',  label: 'Design Studio',  desc: 'Branding, themes & lab',     group: 'site-builder', icon: Palette,           accent: '#818cf8' },
  { id: 'blocks',         label: 'Blocks',         desc: 'Section layout',             group: 'site-builder', icon: Blocks,            accent: '#f472b6' },
  { id: 'navbar-config',  label: 'Navigation',     desc: 'Nav links & behavior',       group: 'site-builder', icon: Layers,            accent: '#60a5fa' },
  { id: 'content',        label: 'Site Content',   desc: 'Hero, services, CTA',        group: 'site-builder', icon: Globe,             accent: '#34d399' },
  { id: 'personality',    label: 'Personality',    desc: 'Effects & personality',      group: 'site-builder', icon: Wand2,             accent: '#f472b6' },
  { id: 'systems',        label: 'Systems',        desc: 'AI architecture',            group: 'advanced',     icon: Network,           accent: '#38bdf8' },
  { id: 'infrastructure', label: 'Infrastructure', desc: 'Nodes & deploys',            group: 'advanced',     icon: Server,            accent: '#6ee7b7' },
  { id: 'integrations',   label: 'Integrations',   desc: 'Sources, APIs & agents',     group: 'advanced',     icon: Plug,              accent: '#fb923c' },
  { id: 'ai',             label: 'AI Profiles',    desc: 'LLM profiles',               group: 'advanced',     icon: Bot,               accent: '#c084fc' },
  { id: 'showcase',       label: 'Showcase',       desc: 'AI-generated showcases',     group: 'advanced',     icon: Settings2,         accent: '#6ee7b7' },
  { id: 'studio',         label: 'Studio Config',  desc: 'Command Center settings',    group: 'studio',       icon: SlidersHorizontal, accent: '#a78bfa' },
  { id: 'search',         label: 'Search',         desc: 'Smart search',               group: 'studio',       icon: Search,            accent: '#22d3ee' },
]

export const NAV_GROUPS_META = [
  { key: 'content',      label: 'Content',      color: '#22d3ee' },
  { key: 'operations',   label: 'Operations',   color: '#f59e0b' },
  { key: 'site-builder', label: 'Site Builder', color: '#818cf8' },
  { key: 'advanced',     label: 'Advanced',     color: '#fb923c' },
  { key: 'studio',       label: 'Studio',       color: '#a78bfa' },
]

export const GROUP_FILTER_OPTIONS = [
  { value: 'all',          label: 'All'      },
  { value: 'content',      label: 'Content'  },
  { value: 'operations',   label: 'Ops'      },
  { value: 'site-builder', label: 'Site'     },
  { value: 'advanced',     label: 'Advanced' },
  { value: 'studio',       label: 'Studio'   },
]

// ─── Partial reset sections ───────────────────────────────────────────────────

export const RESET_SECTIONS: { label: string; color: string; keys: (keyof StudioConfig)[] }[] = [
  {
    label: 'Layout',
    color: '#60a5fa',
    keys: ['sidebarWidth', 'density', 'headerHeight', 'contentMaxWidth', 'panelPadding', 'defaultPanel', 'compactHeader', 'scrollbarStyle'],
  },
  {
    label: 'Appearance',
    color: '#a78bfa',
    keys: ['backgroundStyle', 'sidebarStyle', 'accentColor', 'useCustomAccent', 'borderRadius', 'glowEffect', 'glowOpacity', 'sidebarBorder', 'fontFamily', 'fontSize', 'activePreset'],
  },
  {
    label: 'Navigation',
    color: '#34d399',
    keys: ['navGroups', 'pinnedPanels', 'panelOverrides', 'showGroupDividers', 'showPanelBadges', 'sidebarFooter'],
  },
  {
    label: 'Behavior',
    color: '#f59e0b',
    keys: ['animations', 'animationSpeed', 'showDescriptions', 'rememberLastPanel', 'keyboardShortcuts', 'showSavedIndicator', 'confirmReset', 'autoSaveMs', 'reducedMotion', 'highContrast', 'showTooltips', 'sidebarCollapsedDefault', 'sidebarHoverExpand', 'headerShowClock', 'panelTransition', 'headerActions'],
  },
]

// ─── Emoji picker options ─────────────────────────────────────────────────────

export const PROFILE_ICONS = ['⚡', '🎯', '🌑', '📊', '🚀', '🧠', '🛠️', '🌊', '🔥', '🎨', '🔭', '💡', '⚙️', '🌿', '🎭']

// ─── Shared UI sub-components ─────────────────────────────────────────────────

export function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-white/5 last:border-0">
      <div className="min-w-0">
        <div className="text-[10.5px] font-medium text-white/70 leading-none">{label}</div>
        {hint && <div className="mt-0.5 text-[9px] text-white/28 leading-tight">{hint}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

export function SLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 text-[8.5px] uppercase tracking-[0.2em] text-white/25">{children}</div>
}

export function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} className={cn(
      'relative h-5 w-9 rounded-full transition-colors duration-200',
      value ? 'bg-cyan-400/70' : 'bg-white/10'
    )}>
      <span className={cn(
        'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-200',
        value ? 'left-[18px]' : 'left-0.5'
      )} />
    </button>
  )
}

export function Sel<T extends string>({ value, onChange, options }: {
  value: T; onChange: (v: T) => void; options: { value: T; label: string }[]
}) {
  return (
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value as T)}
        className="appearance-none rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 pr-7 font-mono text-[10.5px] text-white/70 focus:border-cyan-400/40 focus:outline-none">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-white/30" />
    </div>
  )
}

export function Swatch({ color, label, selected, onClick }: { color: string; label?: string; selected: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} title={color}
      className={cn('flex flex-col items-center gap-1', label ? 'w-10' : '')}>
      <div className={cn(
        'h-7 w-7 rounded-lg border-2 transition-all flex items-center justify-center',
        selected ? 'border-white/60 scale-110' : 'border-transparent hover:border-white/30'
      )} style={{ background: color }}>
        {selected && <Check className="h-3 w-3 text-black/70" />}
      </div>
      {label && <span className="font-mono text-[7px] text-white/30">{label}</span>}
    </button>
  )
}

export function PanelEditRow({
  p, override, pinned, onToggle, onOverride, onPin,
}: {
  p: typeof ALL_PANELS[number]
  override: StudioPanelConfig | undefined
  pinned: boolean
  onToggle: (id: AdminPanel, visible: boolean) => void
  onOverride: (id: AdminPanel, data: Partial<StudioPanelConfig>) => void
  onPin: (id: AdminPanel) => void
}) {
  const Icon = p.icon
  const isVisible = override?.visible ?? true
  const [editing, setEditing] = useState(false)
  const [labelVal, setLabelVal] = useState(override?.customLabel ?? p.label)
  const [descVal,  setDescVal]  = useState(override?.customDesc  ?? p.desc)

  return (
    <div className={cn('rounded-xl border border-white/8 bg-white/[0.025] p-3 transition-opacity', !isVisible && 'opacity-40')}>
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md border shrink-0"
          style={{ borderColor: `${p.accent}30`, background: `${p.accent}12` }}>
          <Icon className="h-3.5 w-3.5" style={{ color: p.accent }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10.5px] font-medium text-white/70">{override?.customLabel ?? p.label}</span>
            {override?.customLabel && <span className="rounded-full border border-cyan-400/20 bg-cyan-400/8 px-1.5 py-0.5 text-[8px] text-cyan-400">custom</span>}
            {pinned && <span className="rounded-full border border-amber-400/25 bg-amber-400/8 px-1.5 py-0.5 text-[8px] text-amber-400">pinned</span>}
          </div>
          <p className="text-[9px] text-white/28">{override?.customDesc ?? p.desc}</p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onPin(p.id)} title={pinned ? 'Unpin' : 'Pin'}
            className={cn('rounded-md p-1.5 transition-colors', pinned ? 'text-amber-400/70 hover:text-amber-400' : 'text-white/20 hover:text-amber-400/60')}>
            {pinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
          </button>
          <button onClick={() => setEditing(e => !e)}
            className={cn('rounded-md p-1.5 transition-colors', editing ? 'bg-cyan-400/10 text-cyan-400' : 'text-white/25 hover:text-white/60')}>
            <AlignLeft className="h-3 w-3" />
          </button>
          <button onClick={() => onToggle(p.id, !isVisible)}
            className={cn('rounded-md p-1.5 transition-colors', isVisible ? 'text-white/25 hover:text-white/60' : 'text-white/15 hover:text-emerald-400/70')}>
            {isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          </button>
          {(override?.customLabel || override?.customDesc) && (
            <button onClick={() => { onOverride(p.id, { customLabel: undefined, customDesc: undefined }); setLabelVal(p.label); setDescVal(p.desc) }}
              className="rounded-md p-1.5 text-white/18 hover:text-red-400/60 transition-colors">
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
      {editing && (
        <div className="mt-3 space-y-2 border-t border-white/5 pt-3">
          <div>
            <label className="mb-1 block text-[9px] uppercase tracking-widest text-white/30">Custom label</label>
            <input value={labelVal} onChange={e => setLabelVal(e.target.value)}
              onBlur={() => onOverride(p.id, { customLabel: labelVal !== p.label ? labelVal : undefined })}
              className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 font-mono text-[10.5px] text-white/70 focus:border-cyan-400/30 focus:outline-none"
              placeholder={p.label} />
          </div>
          <div>
            <label className="mb-1 block text-[9px] uppercase tracking-widest text-white/30">Custom description</label>
            <input value={descVal} onChange={e => setDescVal(e.target.value)}
              onBlur={() => onOverride(p.id, { customDesc: descVal !== p.desc ? descVal : undefined })}
              className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 font-mono text-[10.5px] text-white/70 focus:border-cyan-400/30 focus:outline-none"
              placeholder={p.desc} />
          </div>
        </div>
      )}
    </div>
  )
}

export function GroupLabelRow({
  grp, current, onSave,
}: {
  grp: { key: string; label: string; color: string }
  current: StudioNavGroupConfig | undefined
  onSave: (key: string, label: string | undefined) => void
}) {
  const [val, setVal] = useState(current?.label ?? grp.label)
  const hasCustom = current?.label !== undefined && current.label !== grp.label
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: grp.color }} />
      <input value={val} onChange={e => setVal(e.target.value)}
        onBlur={() => onSave(grp.key, val !== grp.label ? val : undefined)}
        className="flex-1 rounded-md border border-white/8 bg-black/20 px-2 py-1 font-mono text-[9.5px] text-white/60 focus:border-cyan-400/30 focus:outline-none"
        placeholder={grp.label} />
      {hasCustom && (
        <button onClick={() => { setVal(grp.label); onSave(grp.key, undefined) }}
          className="text-white/20 hover:text-red-400/60 transition-colors">
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}
