'use client'

import { useState, useCallback, useRef } from 'react'
import { useAdmin } from '@/lib/admin/store'
import { defaultStudioConfig } from '@/lib/admin/state'
import { cn } from '@/lib/utils'
import type {
  AdminPanel, StudioNavGroupConfig, StudioPanelConfig,
  StudioConfig, StudioCustomPreset, StudioWorkspaceProfile,
  StudioScrollbarStyle,
} from '@/lib/admin/types'
import {
  SlidersHorizontal, Palette, Layout, Zap, Eye, EyeOff, RotateCcw,
  MousePointer, Sidebar, AlignLeft, LayoutDashboard,
  FolderOpen, BookOpen, GitBranch, User, Microscope, BarChart3, FlaskConical,
  Globe, Wand2, Layers, Blocks, Network, Server, Plug, Bot, Settings2, Search,
  ChevronDown, ChevronUp, Check, X, Sparkles, Filter, Pin, PinOff,
  Save, Accessibility, AlertTriangle, Download, Copy, FileJson, RefreshCw,
  Clock, Clipboard, User2, BookMarked, ShieldCheck, Activity,
} from 'lucide-react'

// reason: icon components need style prop for accent color rendering
type IconComp = React.ComponentType<{ className?: string; style?: React.CSSProperties }>

// ─── Color harmonics math ─────────────────────────────────────────────────────

function hexToHsl(hex: string): [number, number, number] {
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

function hslToHex(h: number, s: number, l: number): string {
  const sN = s / 100, lN = l / 100
  const a = sN * Math.min(lN, 1 - lN)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const c = lN - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * c).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

function getHarmonics(hex: string) {
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

function getTintScale(hex: string): Array<{ lightness: number; color: string }> {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return []
  const [h, s] = hexToHsl(hex)
  return [12, 20, 30, 40, 50, 60, 68, 76, 84].map(l => ({
    lightness: l,
    color: hslToHex(h, Math.max(s - Math.max(0, l - 55) * 0.9, 18), l),
  }))
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'profiles',   label: 'Profiles',   icon: BookMarked      },
  { id: 'layout',     label: 'Layout',     icon: Layout          },
  { id: 'appearance', label: 'Appearance', icon: Palette         },
  { id: 'navigation', label: 'Nav',        icon: Sidebar         },
  { id: 'panels',     label: 'Panels',     icon: LayoutDashboard },
  { id: 'behavior',   label: 'Behavior',   icon: MousePointer    },
  { id: 'export',     label: 'Export',     icon: FileJson        },
] as const

type Tab = typeof TABS[number]['id']

// ─── Built-in workspace profiles ──────────────────────────────────────────────

const BUILTIN_WORKSPACE_PROFILES: Array<{
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

interface BuiltinPreset {
  id: string; name: string; description: string; accent: string
  bg: StudioConfig['backgroundStyle']; sidebar: StudioConfig['sidebarStyle']
  borderRadius: StudioConfig['borderRadius']; glowEffect: boolean; sidebarBorder: boolean
}

const BUILTIN_PRESETS: BuiltinPreset[] = [
  { id: 'cyber-ocean', name: 'Cyber Ocean', description: 'Cyan on deep midnight, glass sidebar',    accent: '#22d3ee', bg: 'midnight', sidebar: 'glass',  borderRadius: 'rounded', glowEffect: true,  sidebarBorder: false },
  { id: 'void',        name: 'Void',        description: 'Pure black, high contrast, border lines', accent: '#22d3ee', bg: 'void',     sidebar: 'border', borderRadius: 'sharp',   glowEffect: false, sidebarBorder: true  },
  { id: 'violet-haze', name: 'Violet Haze', description: 'Purple accents on dark, glass sidebar',   accent: '#a78bfa', bg: 'dark',     sidebar: 'glass',  borderRadius: 'normal',  glowEffect: true,  sidebarBorder: false },
  { id: 'ember',       name: 'Ember',       description: 'Warm orange on slate, solid sidebar',     accent: '#fb923c', bg: 'slate',    sidebar: 'solid',  borderRadius: 'normal',  glowEffect: false, sidebarBorder: true  },
  { id: 'matrix',      name: 'Matrix',      description: 'Emerald on void, border-only sidebar',    accent: '#34d399', bg: 'void',     sidebar: 'border', borderRadius: 'sharp',   glowEffect: false, sidebarBorder: true  },
  { id: 'arctic',      name: 'Arctic',      description: 'Cool blue on slate, glass treatment',     accent: '#60a5fa', bg: 'slate',    sidebar: 'glass',  borderRadius: 'rounded', glowEffect: true,  sidebarBorder: false },
]

// ─── Panel metadata ───────────────────────────────────────────────────────────

const ALL_PANELS: { id: AdminPanel; label: string; desc: string; group: string; icon: IconComp; accent: string }[] = [
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

const NAV_GROUPS_META = [
  { key: 'content',      label: 'Content',      color: '#22d3ee' },
  { key: 'operations',   label: 'Operations',   color: '#f59e0b' },
  { key: 'site-builder', label: 'Site Builder', color: '#818cf8' },
  { key: 'advanced',     label: 'Advanced',     color: '#fb923c' },
  { key: 'studio',       label: 'Studio',       color: '#a78bfa' },
]

const GROUP_FILTER_OPTIONS = [
  { value: 'all',          label: 'All'      },
  { value: 'content',      label: 'Content'  },
  { value: 'operations',   label: 'Ops'      },
  { value: 'site-builder', label: 'Site'     },
  { value: 'advanced',     label: 'Advanced' },
  { value: 'studio',       label: 'Studio'   },
]

// ─── Partial reset sections ───────────────────────────────────────────────────

const RESET_SECTIONS: { label: string; color: string; keys: (keyof StudioConfig)[] }[] = [
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

const PROFILE_ICONS = ['⚡', '🎯', '🌑', '📊', '🚀', '🧠', '🛠️', '🌊', '🔥', '🎨', '🔭', '💡', '⚙️', '🌿', '🎭']

// ─── Sub-components ───────────────────────────────────────────────────────────

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
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

function SLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 text-[8.5px] uppercase tracking-[0.2em] text-white/25">{children}</div>
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
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

function Sel<T extends string>({ value, onChange, options }: {
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

function Swatch({ color, label, selected, onClick }: { color: string; label?: string; selected: boolean; onClick: () => void }) {
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

function PanelEditRow({
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

function GroupLabelRow({
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

// ─── Main component ───────────────────────────────────────────────────────────

export default function StudioPanel() {
  const { state, dispatch } = useAdmin()
  const cfg = state.studioConfig
  const [tab, setTab] = useState<Tab>('profiles')
  const [panelSearch, setPanelSearch]   = useState('')
  const [groupFilter, setGroupFilter]   = useState<string>('all')
  const [presetName, setPresetName]     = useState('')
  const [savingPreset, setSavingPreset] = useState(false)
  const [copied, setCopied]             = useState(false)
  const [importMsg, setImportMsg]       = useState('')
  const [presetsCopied, setPresetsCopied] = useState(false)
  // Workspace profile saving
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileName, setProfileName]     = useState('')
  const [profileIcon, setProfileIcon]     = useState('⚡')
  // Appearance — tint scale clipboard
  const [tintCopied, setTintCopied]     = useState<string | null>(null)
  // Export diff viewer
  const [diffInput, setDiffInput]       = useState('')
  const [diffParsed, setDiffParsed]     = useState<Partial<StudioConfig> | null>(null)
  const [diffError, setDiffError]       = useState('')
  // File import
  const fileInputRef = useRef<HTMLInputElement>(null)

  const set = (partial: Partial<typeof cfg>) => dispatch({ type: 'UPDATE_STUDIO', payload: partial })

  const applyBuiltinPreset = (p: BuiltinPreset) => set({
    backgroundStyle: p.bg, sidebarStyle: p.sidebar,
    accentColor: p.accent, useCustomAccent: true,
    borderRadius: p.borderRadius, glowEffect: p.glowEffect,
    sidebarBorder: p.sidebarBorder, activePreset: p.id,
  })

  const applyWorkspaceProfile = useCallback((snapshot: Partial<StudioConfig>) => {
    set(snapshot)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const saveCustomPreset = () => {
    if (!presetName.trim()) return
    const preset: StudioCustomPreset = {
      id: `custom-${Date.now()}`,
      name: presetName.trim(),
      createdAt: new Date().toISOString(),
      config: {
        backgroundStyle: cfg.backgroundStyle, sidebarStyle: cfg.sidebarStyle,
        accentColor: cfg.accentColor, useCustomAccent: cfg.useCustomAccent,
        borderRadius: cfg.borderRadius, glowEffect: cfg.glowEffect,
        sidebarBorder: cfg.sidebarBorder,
      },
    }
    dispatch({ type: 'STUDIO_SAVE_PRESET', payload: preset })
    setPresetName('')
    setSavingPreset(false)
  }

  const saveWorkspaceProfile = () => {
    if (!profileName.trim()) return
    // Snapshot current config, excluding nested complex registries
    const { workspaceProfiles: _wp, customPresets: _cp, panelOverrides: _po, navGroups: _ng, ...snapshot } = cfg
    const profile: StudioWorkspaceProfile = {
      id: `profile-${Date.now()}`,
      name: profileName.trim(),
      icon: profileIcon,
      createdAt: new Date().toISOString(),
      snapshot: snapshot as Partial<Omit<StudioConfig, 'workspaceProfiles' | 'customPresets'>>,
    }
    dispatch({ type: 'STUDIO_SAVE_WORKSPACE_PROFILE', payload: profile })
    setProfileName('')
    setSavingProfile(false)
  }

  const applyCustomPreset = (p: StudioCustomPreset) => set({ ...p.config, activePreset: p.id })

  const getOverride = (id: AdminPanel): StudioPanelConfig | undefined =>
    cfg.panelOverrides.find(p => p.id === id)

  const setPanelOverride = (id: AdminPanel, data: Partial<StudioPanelConfig>) =>
    dispatch({ type: 'STUDIO_SET_PANEL_OVERRIDE', payload: { id, data } })

  const getNavGroup = (key: string): StudioNavGroupConfig | undefined =>
    cfg.navGroups.find(g => g.key === key)

  const setNavGroup = (key: string, data: Partial<StudioNavGroupConfig>) =>
    dispatch({ type: 'STUDIO_SET_NAV_GROUP', payload: { key, data } })

  const reorderGroup = (key: string, direction: 'up' | 'down') =>
    dispatch({ type: 'STUDIO_REORDER_GROUP', payload: { key, direction } })

  const togglePin = (id: AdminPanel) =>
    dispatch({ type: 'STUDIO_TOGGLE_PIN', payload: id })

  // Export / import
  const handleCopyJson = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(cfg, null, 2)).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }, [cfg])

  const handleDownloadJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(cfg, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `studio-config-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [cfg])

  const handlePasteImport = useCallback(async () => {
    try {
      const text   = await navigator.clipboard.readText()
      const parsed = JSON.parse(text) as Partial<StudioConfig>
      set(parsed)
      setImportMsg('✓ Imported')
    } catch {
      setImportMsg('✗ Invalid JSON')
    }
    setTimeout(() => setImportMsg(''), 2500)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string) as Partial<StudioConfig>
        set(parsed)
        setImportMsg(`✓ Imported from ${file.name}`)
      } catch {
        setImportMsg('✗ Invalid JSON file')
      }
      setTimeout(() => setImportMsg(''), 3000)
    }
    reader.readAsText(file)
    e.target.value = ''
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCopyPresets = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(cfg.customPresets, null, 2)).then(() => {
      setPresetsCopied(true)
      setTimeout(() => setPresetsCopied(false), 1500)
    })
  }, [cfg.customPresets])

  const handleSectionReset = useCallback((keys: (keyof StudioConfig)[]) => {
    const partial = Object.fromEntries(
      keys.map(k => [k, defaultStudioConfig[k]])
    ) as Partial<StudioConfig>
    set(partial)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const parseDiff = () => {
    try {
      setDiffParsed(JSON.parse(diffInput) as Partial<StudioConfig>)
      setDiffError('')
    } catch {
      setDiffError('Invalid JSON — check syntax')
      setDiffParsed(null)
    }
  }

  const applyDiff = () => {
    if (!diffParsed) return
    set(diffParsed)
    setDiffInput('')
    setDiffParsed(null)
  }

  const diffChanges = diffParsed ? Object.entries(diffParsed).filter(([k, v]) =>
    JSON.stringify(cfg[k as keyof StudioConfig]) !== JSON.stringify(v)
  ) : []

  const copyTint = useCallback((hex: string) => {
    navigator.clipboard.writeText(hex).then(() => {
      setTintCopied(hex)
      setTimeout(() => setTintCopied(null), 1200)
    })
  }, [])

  const ACCENT_PRESETS = ['#22d3ee', '#a78bfa', '#34d399', '#f43f5e', '#f59e0b', '#818cf8', '#fb923c', '#f472b6']
  const accentDisplay  = cfg.useCustomAccent ? cfg.accentColor : '#22d3ee'
  const harmonics      = getHarmonics(accentDisplay)
  const tintScale      = getTintScale(accentDisplay)

  const sortedGroups = [...NAV_GROUPS_META].sort((a, b) => {
    const oa = getNavGroup(a.key)?.order ?? 99
    const ob = getNavGroup(b.key)?.order ?? 99
    return oa - ob
  })

  const filteredPanels = ALL_PANELS.filter(p => {
    const matchGroup  = groupFilter === 'all' || p.group === groupFilter
    const matchSearch = !panelSearch || p.label.toLowerCase().includes(panelSearch.toLowerCase()) || p.desc.toLowerCase().includes(panelSearch.toLowerCase())
    return matchGroup && matchSearch
  })

  const visibleCount = ALL_PANELS.filter(p => (getOverride(p.id)?.visible ?? true)).length
  const pinnedPanels = cfg.pinnedPanels ?? []

  const BG_MAP: Record<typeof cfg.backgroundStyle, string> = {
    midnight: '#060610', dark: '#0a0a14', slate: '#0f172a', void: '#000000',
  }
  const bgColor = BG_MAP[cfg.backgroundStyle]

  // Categorised diff summary
  const diffGroups = [
    {
      label: 'Layout', color: '#60a5fa',
      items: [
        cfg.sidebarWidth !== 'normal'   && `Sidebar: ${cfg.sidebarWidth}`,
        cfg.headerHeight !== 'md'        && `Header: ${cfg.headerHeight}`,
        cfg.panelPadding !== 'normal'    && `Padding: ${cfg.panelPadding}`,
        cfg.contentMaxWidth !== 'xl'     && `Width: ${cfg.contentMaxWidth}`,
        cfg.density !== 'normal'         && `Density: ${cfg.density}`,
        cfg.compactHeader                && 'Header: compact',
      ].filter(Boolean) as string[],
    },
    {
      label: 'Appearance', color: '#a78bfa',
      items: [
        cfg.backgroundStyle !== 'midnight' && `BG: ${cfg.backgroundStyle}`,
        cfg.sidebarStyle !== 'solid'       && `Sidebar: ${cfg.sidebarStyle}`,
        cfg.useCustomAccent                && `Accent: ${cfg.accentColor}`,
        cfg.borderRadius !== 'normal'      && `Radius: ${cfg.borderRadius}`,
        cfg.glowEffect                     && `Glow: ${cfg.glowOpacity}%`,
        !cfg.sidebarBorder                && 'Border: off',
        cfg.fontFamily !== 'mono'          && `Font: ${cfg.fontFamily}`,
      ].filter(Boolean) as string[],
    },
    {
      label: 'Behavior', color: '#f59e0b',
      items: [
        cfg.reducedMotion                && 'Motion: reduced',
        cfg.highContrast                 && 'Contrast: high',
        cfg.headerShowClock              && 'Clock: on',
        cfg.sidebarCollapsedDefault      && 'Collapsed: default',
        cfg.sidebarHoverExpand           && 'Hover: expand',
        cfg.panelTransition !== 'fade'   && `Transition: ${cfg.panelTransition}`,
        !cfg.showGroupDividers           && 'Dividers: off',
        !cfg.showTooltips                && 'Tooltips: off',
      ].filter(Boolean) as string[],
    },
  ].filter(g => g.items.length > 0)

  const totalDiffs = diffGroups.reduce((n, g) => n + g.items.length, 0)

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.18em] text-white/70">Studio Configuration</h2>
          <p className="mt-0.5 text-[10px] text-white/30">Command Center interface — layout, themes, navigation, accessibility</p>
        </div>
        <button onClick={() => dispatch({ type: 'STUDIO_RESET' })}
          className="flex items-center gap-1.5 rounded-lg border border-white/8 bg-white/[0.03] px-3 py-1.5 text-[9.5px] uppercase tracking-widest text-white/35 transition-all hover:border-red-400/20 hover:text-red-400/70">
          <RotateCcw className="h-3 w-3" />
          Reset all
        </button>
      </div>

      {/* Categorised diff summary */}
      {totalDiffs > 0 && (
        <div className="space-y-1.5 rounded-xl border border-white/6 bg-white/[0.02] p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle className="h-2.5 w-2.5 text-amber-400/50" />
            <span className="text-[8.5px] uppercase tracking-widest text-white/30">{totalDiffs} override{totalDiffs !== 1 ? 's' : ''} from defaults</span>
          </div>
          {diffGroups.map(g => (
            <div key={g.label} className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0 font-mono text-[8px] uppercase tracking-wider" style={{ color: g.color, opacity: 0.7 }}>{g.label}</span>
              <div className="flex flex-wrap gap-1">
                {g.items.map(d => (
                  <span key={d} className="rounded-full border border-white/8 bg-white/5 px-1.5 py-0.5 font-mono text-[7.5px] text-white/40">{d}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-0.5 rounded-xl border border-white/8 bg-white/[0.025] p-1">
        {TABS.map(t => {
          const Icon = t.icon
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn(
                'flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-[8.5px] uppercase tracking-[0.08em] transition-all',
                tab === t.id ? 'bg-white/[0.07] text-white/80' : 'text-white/30 hover:text-white/50'
              )}>
              <Icon className="h-3 w-3 shrink-0" />
              <span className="hidden md:inline">{t.label}</span>
            </button>
          )
        })}
      </div>

      {/* ── PROFILES ── */}
      {tab === 'profiles' && (
        <div className="space-y-5">
          {/* ─ Built-in workspace profiles ─ */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-white/30" />
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.15em] text-white/55">Workspace profiles</span>
              <div className="h-px flex-1 bg-white/6" />
            </div>
            <p className="mb-3 text-[9.5px] text-white/30">
              Full interface snapshots — apply a profile to instantly reconfigure layout, typography, density, and behavior.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {BUILTIN_WORKSPACE_PROFILES.map(profile => (
                <button key={profile.id} onClick={() => applyWorkspaceProfile(profile.snapshot)}
                  className="relative rounded-xl border border-white/8 bg-white/[0.025] p-3.5 text-left transition-all hover:border-white/18 hover:bg-white/[0.04] group">
                  <div className="mb-2 flex items-center gap-2.5">
                    <span className="text-xl leading-none">{profile.icon}</span>
                    <div>
                      <div className="text-[10.5px] font-semibold text-white/70">{profile.name}</div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="h-1.5 w-1.5 rounded-full" style={{ background: profile.accentColor }} />
                        <span className="font-mono text-[7.5px] text-white/25">{Object.keys(profile.snapshot).length} settings</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[8.5px] leading-snug text-white/35">{profile.description}</p>
                  <div className="mt-2.5 flex items-center justify-between">
                    <div className="flex gap-1">
                      {Object.keys(profile.snapshot).slice(0, 3).map(k => (
                        <span key={k} className="rounded border border-white/8 px-1 py-0.5 font-mono text-[7px] text-white/25">{k.replace(/([A-Z])/g, ' $1').split(' ')[0]}</span>
                      ))}
                    </div>
                    <span className="text-[8px] uppercase tracking-wider text-white/20 group-hover:text-white/45 transition-colors">Apply →</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ─ User workspace profiles ─ */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <User2 className="h-3.5 w-3.5 text-white/30" />
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.15em] text-white/55">My profiles</span>
              <div className="h-px flex-1 bg-white/6" />
            </div>

            {cfg.workspaceProfiles.length > 0 && (
              <div className="mb-3 space-y-2">
                {cfg.workspaceProfiles.map(profile => (
                  <div key={profile.id} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.025] px-3 py-2.5">
                    <span className="text-lg leading-none">{profile.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10.5px] font-medium text-white/70">{profile.name}</div>
                      <div className="font-mono text-[8px] text-white/28">
                        {Object.keys(profile.snapshot).length} settings · {new Date(profile.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button onClick={() => applyWorkspaceProfile(profile.snapshot as Partial<StudioConfig>)}
                      className="rounded-md border border-white/10 px-2.5 py-1 text-[8.5px] uppercase tracking-wider text-white/35 transition-all hover:border-white/25 hover:text-white/65">
                      Apply
                    </button>
                    <button onClick={() => dispatch({ type: 'STUDIO_DELETE_WORKSPACE_PROFILE', payload: profile.id })}
                      className="rounded-md p-1.5 text-white/18 hover:text-red-400/60 transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3">
              <SLabel>Save current config as profile</SLabel>
              {!savingProfile ? (
                <button onClick={() => setSavingProfile(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] py-2 text-[10px] uppercase tracking-widest text-white/40 transition-all hover:border-cyan-400/20 hover:text-cyan-400/60">
                  <Save className="h-3 w-3" />
                  Save workspace snapshot
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input autoFocus value={profileName} onChange={e => setProfileName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveWorkspaceProfile(); if (e.key === 'Escape') { setSavingProfile(false); setProfileName('') } }}
                      placeholder="Profile name…"
                      className="flex-1 rounded-lg border border-white/10 bg-black/20 px-2.5 py-1.5 font-mono text-[10.5px] text-white/70 placeholder:text-white/20 focus:border-cyan-400/30 focus:outline-none" />
                    <button onClick={saveWorkspaceProfile}
                      className="rounded-lg border border-cyan-400/25 bg-cyan-400/10 px-3 py-1.5 text-[9.5px] text-cyan-400 transition-all hover:bg-cyan-400/20">
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => { setSavingProfile(false); setProfileName('') }}
                      className="rounded-lg border border-white/8 px-2.5 py-1.5 text-[9.5px] text-white/30 transition-all hover:text-white/55">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {/* Icon picker */}
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[8.5px] text-white/30 mr-1">Icon:</span>
                    {PROFILE_ICONS.map(icon => (
                      <button key={icon} onClick={() => setProfileIcon(icon)}
                        className={cn(
                          'rounded-md p-1 text-base transition-all leading-none',
                          profileIcon === icon ? 'bg-white/10 ring-1 ring-white/20' : 'hover:bg-white/5'
                        )}>
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ─ Visual presets ─ */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Palette className="h-3.5 w-3.5 text-white/30" />
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.15em] text-white/55">Visual presets</span>
              <div className="h-px flex-1 bg-white/6" />
            </div>
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
                className="mb-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/6 py-1.5 text-[9px] uppercase tracking-widest text-white/25 transition-all hover:text-white/45">
                <X className="h-2.5 w-2.5" /> Clear active preset
              </button>
            )}

            {cfg.customPresets.length > 0 && (
              <div className="space-y-2 mb-3">
                <SLabel>Custom visual presets</SLabel>
                {cfg.customPresets.map(cp => {
                  const active = cfg.activePreset === cp.id
                  return (
                    <div key={cp.id} className={cn(
                      'flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all',
                      active ? 'border-white/20 bg-white/[0.05]' : 'border-white/8 bg-white/[0.025]'
                    )}>
                      <div className="h-5 w-5 shrink-0 rounded-full border-2 border-white/20" style={{ background: cp.config.accentColor ?? '#22d3ee' }} />
                      <div className="min-w-0 flex-1">
                        <div className="text-[10.5px] font-medium text-white/70">{cp.name}</div>
                        <div className="font-mono text-[8px] text-white/28 capitalize">{cp.config.backgroundStyle} · {cp.config.sidebarStyle}</div>
                      </div>
                      <button onClick={() => applyCustomPreset(cp)}
                        className={cn('rounded-md px-2.5 py-1 text-[8.5px] uppercase tracking-wider transition-colors',
                          active ? 'bg-cyan-400/10 text-cyan-400' : 'border border-white/10 text-white/35 hover:border-white/25 hover:text-white/65'
                        )}>
                        {active ? '✓ Active' : 'Apply'}
                      </button>
                      <button onClick={() => dispatch({ type: 'STUDIO_DELETE_PRESET', payload: cp.id })}
                        className="rounded-md p-1.5 text-white/18 hover:text-red-400/60 transition-colors">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3">
              <SLabel>Save current appearance as preset</SLabel>
              {!savingPreset ? (
                <button onClick={() => setSavingPreset(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] py-2 text-[10px] uppercase tracking-widest text-white/40 transition-all hover:border-cyan-400/20 hover:text-cyan-400/60">
                  <Save className="h-3 w-3" />
                  Save visual preset
                </button>
              ) : (
                <div className="flex gap-2">
                  <input autoFocus value={presetName} onChange={e => setPresetName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveCustomPreset(); if (e.key === 'Escape') { setSavingPreset(false); setPresetName('') } }}
                    placeholder="Preset name…"
                    className="flex-1 rounded-lg border border-white/10 bg-black/20 px-2.5 py-1.5 font-mono text-[10.5px] text-white/70 placeholder:text-white/20 focus:border-cyan-400/30 focus:outline-none" />
                  <button onClick={saveCustomPreset}
                    className="rounded-lg border border-cyan-400/25 bg-cyan-400/10 px-3 py-1.5 text-[9.5px] text-cyan-400 transition-all hover:bg-cyan-400/20">
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => { setSavingPreset(false); setPresetName('') }}
                    className="rounded-lg border border-white/8 px-2.5 py-1.5 text-[9.5px] text-white/30 transition-all hover:text-white/55">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── LAYOUT ── */}
      {tab === 'layout' && (
        <div className="space-y-3">
          <div className="rounded-xl border border-white/8 bg-white/[0.025] p-4">
            <SLabel>Layout preview</SLabel>
            <div className="flex h-20 gap-1 overflow-hidden rounded-lg border border-white/8" style={{ background: '#06060f' }}>
              <div className="shrink-0 border-r border-white/8 flex flex-col py-1.5 px-1.5"
                style={{ width: cfg.sidebarWidth === 'compact' ? '14%' : cfg.sidebarWidth === 'wide' ? '28%' : '21%' }}>
                <div className="h-1 w-4/5 rounded-full bg-cyan-400/50 mb-1.5" />
                {[0.4, 0.3, 0.25, 0.2, 0.15].map((o, i) => (
                  <div key={i} className="h-0.5 w-3/4 rounded-full bg-white mb-1" style={{ opacity: o }} />
                ))}
              </div>
              <div className="flex flex-1 flex-col"
                style={{ padding: cfg.panelPadding === 'tight' ? '3px' : cfg.panelPadding === 'loose' ? '10px' : '6px' }}>
                <div className="flex shrink-0 items-center border-b border-white/8 mb-1"
                  style={{ height: cfg.headerHeight === 'sm' ? '11px' : cfg.headerHeight === 'lg' ? '17px' : '13px' }}>
                  {cfg.compactHeader
                    ? <div className="h-0.5 w-5 rounded-full bg-cyan-400/50" />
                    : <div className="flex items-center gap-1"><div className="h-0.5 w-6 rounded-full bg-white/15" /><div className="h-0.5 w-1 rounded-full bg-white/8" /><div className="h-0.5 w-4 rounded-full bg-cyan-400/40" /></div>
                  }
                </div>
                <div className="flex-1 space-y-1 pt-1">
                  <div className="h-0.5 w-full rounded-full bg-white/15" />
                  <div className="h-0.5 w-3/4 rounded-full bg-white/10" />
                  <div className="h-0.5 w-1/2 rounded-full bg-white/7" />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-1 divide-y divide-white/5">
            <Row label="Sidebar width" hint="Controls how wide the left navigation panel is">
              <Sel value={cfg.sidebarWidth} onChange={v => set({ sidebarWidth: v })} options={[
                { value: 'compact', label: 'Compact (3.5rem)' },
                { value: 'normal',  label: 'Normal (13.5rem)' },
                { value: 'wide',    label: 'Wide (16rem)'     },
              ]} />
            </Row>
            <Row label="Header height" hint="Height of the top header bar">
              <Sel value={cfg.headerHeight} onChange={v => set({ headerHeight: v })} options={[
                { value: 'sm', label: 'Compact (2.5rem)' },
                { value: 'md', label: 'Normal (3rem)'    },
                { value: 'lg', label: 'Tall (3.5rem)'    },
              ]} />
            </Row>
            <Row label="Compact header" hint="Hide 'JOOTACEE OS /' prefix — show only the active panel name">
              <Toggle value={cfg.compactHeader} onChange={v => set({ compactHeader: v })} />
            </Row>
            <Row label="Content max width" hint="Maximum width of the panel content area">
              <Sel value={cfg.contentMaxWidth} onChange={v => set({ contentMaxWidth: v })} options={[
                { value: 'lg',   label: 'Large (56rem)'   },
                { value: 'xl',   label: 'XL (72rem)'      },
                { value: '2xl',  label: '2XL (96rem)'     },
                { value: 'full', label: 'Full width'      },
              ]} />
            </Row>
            <Row label="Panel padding" hint="Spacing around the main content area">
              <Sel value={cfg.panelPadding} onChange={v => set({ panelPadding: v })} options={[
                { value: 'tight',  label: 'Tight (0.75rem)'  },
                { value: 'normal', label: 'Normal (1.25rem)' },
                { value: 'loose',  label: 'Loose (1.75rem)'  },
              ]} />
            </Row>
            <Row label="Content density" hint="Spacing between elements throughout the interface">
              <Sel value={cfg.density} onChange={v => set({ density: v })} options={[
                { value: 'compact',     label: 'Compact'     },
                { value: 'normal',      label: 'Normal'      },
                { value: 'comfortable', label: 'Comfortable' },
              ]} />
            </Row>
            <Row label="Default panel" hint="Panel that opens when Command Center loads">
              <Sel value={cfg.defaultPanel as string} onChange={v => set({ defaultPanel: v as AdminPanel })}
                options={ALL_PANELS.map(p => ({ value: p.id, label: p.label }))} />
            </Row>
            <Row label="Scrollbar style" hint="Controls the main content area scrollbar appearance">
              <Sel value={cfg.scrollbarStyle} onChange={v => set({ scrollbarStyle: v as StudioScrollbarStyle })} options={[
                { value: 'normal', label: 'Normal'  },
                { value: 'thin',   label: 'Thin'    },
                { value: 'hidden', label: 'Hidden'  },
              ]} />
            </Row>
          </div>
        </div>
      )}

      {/* ── APPEARANCE ── */}
      {tab === 'appearance' && (
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
                    <button key={lightness} onClick={() => copyTint(color)} title={color}
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
      )}

      {/* ── NAVIGATION ── */}
      {tab === 'navigation' && (
        <div className="space-y-3">
          {/* Sidebar mini-map */}
          <div className="rounded-xl border border-white/8 bg-white/[0.025] p-4">
            <SLabel>Sidebar mini-map</SLabel>
            <p className="text-[8.5px] text-white/25 mb-3">Live — reflects group order, visibility, pins, and dividers</p>
            <div className="overflow-hidden rounded-lg border border-white/8 inline-flex" style={{ background: bgColor, minHeight: '160px', width: '140px' }}>
              <div className="flex w-full flex-col pt-2"
                style={{
                  borderRight: `1px solid ${cfg.sidebarBorder ? `${accentDisplay}28` : 'rgba(255,255,255,0.05)'}`,
                  background: cfg.sidebarStyle === 'glass' ? `${accentDisplay}08` : cfg.sidebarStyle === 'border' ? 'transparent' : 'rgba(255,255,255,0.02)',
                }}>
                {pinnedPanels.length > 0 && (
                  <div className="mx-1.5 mb-1.5 border-b border-amber-400/15 pb-1.5">
                    <div className="px-1 mb-0.5 text-[5px] uppercase tracking-widest text-amber-400/50">★ Pinned</div>
                    {pinnedPanels.slice(0, 3).map(id => {
                      const p = ALL_PANELS.find(x => x.id === id)
                      return p ? (
                        <div key={id} className="flex items-center gap-1 px-1 py-0.5">
                          <p.icon className="h-2 w-2 shrink-0" style={{ color: p.accent }} />
                          <span className="text-[5.5px] text-white/45 truncate">{p.label}</span>
                        </div>
                      ) : null
                    })}
                  </div>
                )}
                {sortedGroups.map((grp, idx) => {
                  const navGroup    = getNavGroup(grp.key)
                  const isVisible   = navGroup?.visible   ?? true
                  const isCollapsed = navGroup?.collapsed ?? false
                  const customLabel = navGroup?.label
                  const panelsInGroup = ALL_PANELS.filter(p => p.group === grp.key && (getOverride(p.id)?.visible ?? true))
                  if (!isVisible) return null
                  return (
                    <div key={grp.key} className="mb-1 px-1.5">
                      {idx > 0 && (cfg.showGroupDividers ?? true) && <div className="mb-1 h-px bg-white/6" />}
                      <div className="flex items-center gap-0.5 mb-0.5">
                        <div className="h-1 w-1 shrink-0 rounded-full" style={{ background: grp.color, opacity: 0.7 }} />
                        <span className="text-[5px] uppercase tracking-widest truncate" style={{ color: grp.color, opacity: 0.65 }}>
                          {customLabel ?? grp.label}
                        </span>
                        {isCollapsed && <span className="ml-auto text-[5px] text-white/20">▸</span>}
                      </div>
                      {!isCollapsed && panelsInGroup.slice(0, 3).map(p => {
                        const Icon = p.icon
                        return (
                          <div key={p.id} className="flex items-center gap-1 px-0.5 py-0.5">
                            <Icon className="h-1.5 w-1.5 shrink-0" style={{ color: p.accent }} />
                            <span className="text-[5px] text-white/35 truncate">{p.label}</span>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Group dividers toggle */}
          <div className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-1 divide-y divide-white/5">
            <Row label="Group dividers" hint="Show separator lines between navigation groups in the sidebar">
              <Toggle value={cfg.showGroupDividers} onChange={v => set({ showGroupDividers: v })} />
            </Row>
          </div>

          {/* Group labels rename */}
          <div className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3">
            <SLabel>Rename groups</SLabel>
            <div className="space-y-2">
              {sortedGroups.map(grp => (
                <GroupLabelRow key={grp.key} grp={grp} current={getNavGroup(grp.key)}
                  onSave={(key, label) => setNavGroup(key, { label: label ?? undefined })} />
              ))}
            </div>
          </div>

          {/* Group controls with reorder */}
          <p className="px-1 text-[10px] text-white/30">Control visibility, collapse state, and sidebar order.</p>
          {sortedGroups.map((grp, idx) => {
            const navGroup    = getNavGroup(grp.key)
            const visible     = navGroup?.visible   ?? true
            const collapsed   = navGroup?.collapsed ?? false
            const customLabel = navGroup?.label
            const panelsInGroup  = ALL_PANELS.filter(p => p.group === grp.key)
            const visibleInGroup = panelsInGroup.filter(p => getOverride(p.id)?.visible ?? true).length

            return (
              <div key={grp.key} className="rounded-xl border border-white/8 bg-white/[0.025] overflow-hidden">
                <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-white/5">
                  <div className="h-2 w-2 rounded-full shrink-0" style={{ background: grp.color }} />
                  <span className="text-[10.5px] font-semibold uppercase tracking-[0.15em] text-white/60">{customLabel ?? grp.label}</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 text-[8.5px] text-white/30">{visibleInGroup}/{panelsInGroup.length}</span>
                  <div className="ml-auto flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      <button onClick={() => reorderGroup(grp.key, 'up')} disabled={idx === 0}
                        className="rounded p-0.5 text-white/20 hover:text-white/55 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => reorderGroup(grp.key, 'down')} disabled={idx === sortedGroups.length - 1}
                        className="rounded p-0.5 text-white/20 hover:text-white/55 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => panelsInGroup.forEach(p => setPanelOverride(p.id, { visible: true }))}
                        className="text-[8px] uppercase tracking-wider text-white/25 hover:text-emerald-400/70 transition-colors">Show all</button>
                      <span className="text-white/15">·</span>
                      <button onClick={() => panelsInGroup.forEach(p => setPanelOverride(p.id, { visible: false }))}
                        className="text-[8px] uppercase tracking-wider text-white/25 hover:text-red-400/60 transition-colors">Hide all</button>
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] text-white/30">
                      <span>Collapsed</span>
                      <Toggle value={collapsed} onChange={v => setNavGroup(grp.key, { collapsed: v })} />
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] text-white/30">
                      <span>Visible</span>
                      <Toggle value={visible} onChange={v => setNavGroup(grp.key, { visible: v })} />
                    </div>
                  </div>
                </div>
                {panelsInGroup.map(p => {
                  const Icon      = p.icon
                  const override  = getOverride(p.id)
                  const isVisible = override?.visible ?? true
                  const isPinned  = pinnedPanels.includes(p.id)
                  return (
                    <div key={p.id} className={cn('flex items-center gap-2.5 px-4 py-2 border-b border-white/4 last:border-0 transition-opacity', !visible && 'opacity-30')}>
                      <Icon className="h-3 w-3 shrink-0" style={{ color: p.accent }} />
                      <span className="flex-1 text-[10px] text-white/55">{override?.customLabel ?? p.label}</span>
                      <span className="hidden sm:block text-[9px] text-white/22">{override?.customDesc ?? p.desc}</span>
                      <button onClick={() => togglePin(p.id)}
                        className={cn('shrink-0 transition-colors', isPinned ? 'text-amber-400/60 hover:text-amber-400' : 'text-white/15 hover:text-amber-400/50')}>
                        <Pin className="h-3 w-3" />
                      </button>
                      <button onClick={() => setPanelOverride(p.id, { visible: !isVisible })}
                        className={cn('shrink-0 transition-colors', isVisible ? 'text-white/30 hover:text-white/60' : 'text-white/15 hover:text-white/40')}>
                        {isVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  )
                })}
              </div>
            )
          })}

          {pinnedPanels.length > 0 && (
            <div className="rounded-xl border border-amber-400/15 bg-amber-400/[0.04] px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] font-medium text-amber-400/70">★ Pinned — fixed at sidebar top</div>
                <button onClick={() => pinnedPanels.forEach(id => togglePin(id))}
                  className="text-[8px] uppercase tracking-wider text-white/25 hover:text-red-400/60 transition-colors">Clear all</button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {pinnedPanels.map(id => {
                  const p = ALL_PANELS.find(p => p.id === id)
                  if (!p) return null
                  return (
                    <div key={id} className="flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/8 px-2 py-0.5">
                      <span className="text-[9px] text-amber-400/80">{p.label}</span>
                      <button onClick={() => togglePin(id)} className="text-amber-400/40 hover:text-amber-400/70 transition-colors">
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── PANELS ── */}
      {tab === 'panels' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <p className="text-[10px] text-white/30">{visibleCount}/{ALL_PANELS.length} visible · {pinnedPanels.length} pinned</p>
          </div>

          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-white/25" />
            <input value={panelSearch} onChange={e => setPanelSearch(e.target.value)} placeholder="Filter panels…"
              className="w-full rounded-lg border border-white/8 bg-white/[0.025] pl-8 pr-3 py-2 font-mono text-[10.5px] text-white/60 placeholder:text-white/20 focus:border-cyan-400/30 focus:outline-none" />
          </div>

          <div className="flex gap-1 overflow-x-auto">
            {GROUP_FILTER_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => setGroupFilter(opt.value)}
                className={cn(
                  'shrink-0 rounded-lg border px-2.5 py-1 text-[8.5px] uppercase tracking-wider transition-all',
                  groupFilter === opt.value
                    ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-400'
                    : 'border-white/8 bg-white/[0.025] text-white/30 hover:text-white/55'
                )}>
                {opt.label}
              </button>
            ))}
          </div>

          {filteredPanels.map(p => (
            <PanelEditRow
              key={p.id} p={p}
              override={getOverride(p.id)}
              pinned={pinnedPanels.includes(p.id)}
              onToggle={(id, v) => setPanelOverride(id, { visible: v })}
              onOverride={(id, data) => setPanelOverride(id, data)}
              onPin={togglePin}
            />
          ))}
          {filteredPanels.length === 0 && (
            <div className="py-8 text-center text-[10px] text-white/25">No panels match your filter.</div>
          )}
        </div>
      )}

      {/* ── BEHAVIOR ── */}
      {tab === 'behavior' && (
        <div className="space-y-3">
          {/* General */}
          <div className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-1 divide-y divide-white/5">
            <Row label="Animations" hint="Framer Motion transitions throughout the interface">
              <Toggle value={cfg.animations} onChange={v => set({ animations: v })} />
            </Row>
            <Row label="Show descriptions" hint="Display subtitle text under panel names in the sidebar">
              <Toggle value={cfg.showDescriptions} onChange={v => set({ showDescriptions: v })} />
            </Row>
            <Row label="Show tooltips" hint="Hover tooltips on sidebar buttons when collapsed">
              <Toggle value={cfg.showTooltips} onChange={v => set({ showTooltips: v })} />
            </Row>
            <Row label="Remember last panel" hint="Restore the active panel when Command Center reopens">
              <Toggle value={cfg.rememberLastPanel} onChange={v => set({ rememberLastPanel: v })} />
            </Row>
            <Row label="Keyboard shortcuts" hint="Cmd+K search, Cmd+S save, and other bindings">
              <Toggle value={cfg.keyboardShortcuts} onChange={v => set({ keyboardShortcuts: v })} />
            </Row>
            <Row label="Save indicator" hint="Show 'Saved' confirmation badge in the header">
              <Toggle value={cfg.showSavedIndicator} onChange={v => set({ showSavedIndicator: v })} />
            </Row>
            <Row label="Confirm reset" hint="Show confirmation dialog before resetting to factory defaults">
              <Toggle value={cfg.confirmReset} onChange={v => set({ confirmReset: v })} />
            </Row>
          </div>

          {/* Panel transition */}
          <div className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3">
            <SLabel>Panel transition</SLabel>
            <p className="mb-3 text-[9px] text-white/30">Animation style when switching between panels</p>
            <div className="grid grid-cols-2 gap-2">
              {([
                { value: 'fade',  label: 'Fade',       desc: 'Opacity in from below'     },
                { value: 'slide', label: 'Slide',      desc: 'Horizontal slide-in'        },
                { value: 'scale', label: 'Scale',      desc: 'Subtle zoom-in effect'      },
                { value: 'none',  label: 'Instant',    desc: 'No animation at all'        },
              ] as const).map(opt => (
                <button key={opt.value} onClick={() => set({ panelTransition: opt.value })}
                  className={cn(
                    'rounded-xl border px-3 py-2.5 text-left transition-all',
                    cfg.panelTransition === opt.value
                      ? 'border-cyan-400/30 bg-cyan-400/8'
                      : 'border-white/8 bg-white/[0.025] hover:border-white/18'
                  )}>
                  <div className={cn('text-[10px] font-medium', cfg.panelTransition === opt.value ? 'text-cyan-400' : 'text-white/60')}>
                    {opt.label}
                  </div>
                  <div className="mt-0.5 text-[8.5px] text-white/28">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Animation speed */}
          <div className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3">
            <SLabel>Animation speed</SLabel>
            <p className="mb-3 text-[9px] text-white/30">Global multiplier for all panel transition durations</p>
            <div className="grid grid-cols-3 gap-2">
              {([
                { value: 'slow',   label: 'Slow',   desc: '×2.5 — 300–375ms' },
                { value: 'normal', label: 'Normal', desc: '×1 — 120–150ms'   },
                { value: 'fast',   label: 'Fast',   desc: '×0.4 — 48–60ms'   },
              ] as const).map(opt => (
                <button key={opt.value} onClick={() => set({ animationSpeed: opt.value })}
                  className={cn(
                    'rounded-xl border px-3 py-2.5 text-left transition-all',
                    cfg.animationSpeed === opt.value
                      ? 'border-cyan-400/30 bg-cyan-400/8'
                      : 'border-white/8 bg-white/[0.025] hover:border-white/18'
                  )}>
                  <div className={cn('text-[10px] font-medium', cfg.animationSpeed === opt.value ? 'text-cyan-400' : 'text-white/60')}>
                    {opt.label}
                  </div>
                  <div className="mt-0.5 font-mono text-[8px] text-white/28">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Sidebar extras */}
          <div className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-1">
            <div className="flex items-center gap-2 py-2.5 border-b border-white/5">
              <Sidebar className="h-3 w-3 text-white/25" />
              <span className="text-[9.5px] uppercase tracking-widest text-white/30">Sidebar extras</span>
            </div>
            <div className="divide-y divide-white/5">
              <Row label="Panel count badges" hint="Show total panel count next to each nav group label">
                <Toggle value={cfg.showPanelBadges} onChange={v => set({ showPanelBadges: v })} />
              </Row>
              <Row label="Sidebar footer strip" hint="Show version number and last-saved time below the collapse button">
                <Toggle value={cfg.sidebarFooter} onChange={v => set({ sidebarFooter: v })} />
              </Row>
            </div>
          </div>

          {/* Startup */}
          <div className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-1">
            <div className="flex items-center gap-2 py-2.5 border-b border-white/5">
              <RefreshCw className="h-3 w-3 text-white/25" />
              <span className="text-[9.5px] uppercase tracking-widest text-white/30">Startup & sidebar</span>
            </div>
            <div className="divide-y divide-white/5">
              <Row label="Start sidebar collapsed" hint="Open Command Center with sidebar in icon-only mode">
                <Toggle value={cfg.sidebarCollapsedDefault} onChange={v => set({ sidebarCollapsedDefault: v })} />
              </Row>
              <Row label="Hover to expand" hint="When collapsed, hovering the sidebar temporarily reveals full labels">
                <Toggle value={cfg.sidebarHoverExpand} onChange={v => set({ sidebarHoverExpand: v })} />
              </Row>
              <Row label="Clock in header" hint="Display a live HH:MM:SS clock next to the panel breadcrumb">
                <div className="flex items-center gap-2">
                  {cfg.headerShowClock && (
                    <span className="flex items-center gap-1 font-mono text-[8.5px] text-white/30">
                      <Clock className="h-2.5 w-2.5" /> 12:34
                    </span>
                  )}
                  <Toggle value={cfg.headerShowClock} onChange={v => set({ headerShowClock: v })} />
                </div>
              </Row>
            </div>
          </div>

          {/* Accessibility */}
          <div className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-1">
            <div className="flex items-center gap-2 py-2.5 border-b border-white/5">
              <Accessibility className="h-3.5 w-3.5 text-white/30" />
              <span className="text-[9.5px] uppercase tracking-widest text-white/30">Accessibility</span>
            </div>
            <div className="divide-y divide-white/5">
              <Row label="Reduced motion" hint="Disable all panel transition animations">
                <Toggle value={cfg.reducedMotion} onChange={v => set({ reducedMotion: v })} />
              </Row>
              <Row label="High contrast" hint="Increase sidebar text opacity for improved readability">
                <Toggle value={cfg.highContrast} onChange={v => set({ highContrast: v })} />
              </Row>
            </div>
          </div>

          {/* Auto-save */}
          <div className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[10.5px] font-medium text-white/70">Auto-save delay</div>
                <div className="mt-0.5 text-[9px] text-white/28">Debounce interval before writing to localStorage</div>
              </div>
              <span className="font-mono text-[10.5px] tabular-nums text-white/50">{cfg.autoSaveMs}ms</span>
            </div>
            <input type="range" min={200} max={3000} step={100} value={cfg.autoSaveMs}
              onChange={e => set({ autoSaveMs: Number(e.target.value) })}
              className="w-full h-1 rounded-full accent-cyan-400" />
            <div className="mt-1.5 flex justify-between text-[8.5px] text-white/20">
              <span>200ms — instant</span><span>3000ms — slow</span>
            </div>
          </div>

          {/* Header actions */}
          <div className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3">
            <div className="mb-3 text-[10.5px] font-medium text-white/70">Header quick actions</div>
            <div className="space-y-2">
              {([
                { key: 'showSearch' as const, label: 'Search',  hint: 'Opens smart search (Cmd+K)'  },
                { key: 'showExport' as const, label: 'Export',  hint: 'Export full config as JSON'  },
                { key: 'showImport' as const, label: 'Import',  hint: 'Load config from JSON file'  },
                { key: 'showBackup' as const, label: 'Backup',  hint: 'Save admin-defaults.json'    },
                { key: 'showReset'  as const, label: 'Reset',   hint: 'Reset to factory defaults'   },
              ]).map(({ key, label, hint }) => (
                <div key={key} className="flex items-center justify-between gap-3 py-1.5 border-b border-white/4 last:border-0">
                  <div>
                    <div className="text-[10px] text-white/60">{label}</div>
                    <div className="text-[8.5px] text-white/25">{hint}</div>
                  </div>
                  <Toggle value={cfg.headerActions[key]} onChange={v => set({ headerActions: { ...cfg.headerActions, [key]: v } })} />
                </div>
              ))}
            </div>
          </div>

          {/* Keyboard shortcuts ref */}
          <div className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3">
            <div className="mb-3 text-[10.5px] font-medium text-white/70">Keyboard shortcuts</div>
            <div className="space-y-2">
              {([
                { keys: ['⌘', 'K'],  action: 'Open smart search'         },
                { keys: ['⌘', 'S'],  action: 'Save configuration'        },
                { keys: ['Esc'],     action: 'Close search / overlay'    },
                { keys: ['↑', '↓'],  action: 'Navigate search results'  },
                { keys: ['↵'],       action: 'Select / go to panel'     },
              ]).map(({ keys, action }) => (
                <div key={action} className="flex items-center justify-between py-1 border-b border-white/4 last:border-0">
                  <span className="text-[9.5px] text-white/45">{action}</span>
                  <div className="flex items-center gap-1">
                    {keys.map(k => (
                      <kbd key={k} className="rounded border border-white/12 bg-white/5 px-1.5 py-0.5 font-mono text-[9px] text-white/45">{k}</kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── EXPORT ── */}
      {tab === 'export' && (
        <div className="space-y-3">
          <p className="px-1 text-[10px] text-white/30">
            Export, import, or partially reset your studio configuration. All changes live-sync to localStorage.
          </p>

          {/* JSON viewer */}
          <div className="rounded-xl border border-white/8 bg-white/[0.025] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/6">
              <div className="flex items-center gap-2">
                <FileJson className="h-3.5 w-3.5 text-white/35" />
                <span className="text-[10px] font-medium text-white/55">studio-config.json</span>
                <span className="rounded-full border border-white/8 bg-white/4 px-1.5 py-0.5 font-mono text-[7.5px] text-white/30">
                  {JSON.stringify(cfg).length.toLocaleString()} chars
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={handleCopyJson}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[8.5px] uppercase tracking-wider transition-all',
                    copied ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-400' : 'border-white/10 text-white/35 hover:border-white/25 hover:text-white/60'
                  )}>
                  {copied ? <Check className="h-2.5 w-2.5" /> : <Copy className="h-2.5 w-2.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button onClick={handleDownloadJson}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1 text-[8.5px] uppercase tracking-wider text-white/35 transition-all hover:border-white/25 hover:text-white/60">
                  <Download className="h-2.5 w-2.5" />
                  Download
                </button>
              </div>
            </div>
            <pre className="max-h-48 overflow-y-auto px-4 py-3 font-mono text-[8.5px] leading-relaxed text-white/35 select-all">
              {JSON.stringify(cfg, null, 2)}
            </pre>
          </div>

          {/* Import from clipboard */}
          <div className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3">
            <SLabel>Import</SLabel>
            <div className="flex flex-wrap items-center gap-2.5">
              <button onClick={handlePasteImport}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[9.5px] uppercase tracking-wider text-white/40 transition-all hover:border-cyan-400/20 hover:text-cyan-400/60">
                <Clipboard className="h-3 w-3" />
                Paste from clipboard
              </button>
              <button onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[9.5px] uppercase tracking-wider text-white/40 transition-all hover:border-white/25 hover:text-white/60">
                <FolderOpen className="h-3 w-3" />
                Import from file
              </button>
              <input
                ref={fileInputRef}
                type="file" accept=".json" onChange={handleFileImport}
                className="sr-only" aria-label="Import studio config from JSON file" />
              {importMsg && (
                <span className={cn('font-mono text-[9.5px]', importMsg.startsWith('✓') ? 'text-emerald-400' : 'text-red-400')}>
                  {importMsg}
                </span>
              )}
            </div>
          </div>

          {/* Config diff viewer */}
          <div className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3">
            <SLabel>Config diff viewer</SLabel>
            <p className="mb-3 text-[9px] text-white/30">
              Paste a JSON config snippet, preview what would change, then apply selectively.
            </p>
            <textarea
              value={diffInput}
              onChange={e => { setDiffInput(e.target.value); setDiffParsed(null); setDiffError('') }}
              placeholder={'{ "backgroundStyle": "void", "accentColor": "#a78bfa" }'}
              rows={3}
              className="w-full resize-none rounded-lg border border-white/8 bg-black/20 px-3 py-2 font-mono text-[9.5px] text-white/60 placeholder:text-white/18 focus:border-cyan-400/30 focus:outline-none"
            />
            <div className="mt-2 flex items-center gap-2">
              <button onClick={parseDiff} disabled={!diffInput.trim()}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-[9px] uppercase tracking-wider text-white/40 transition-all hover:border-white/25 hover:text-white/60 disabled:opacity-30">
                <Search className="h-2.5 w-2.5" />
                Preview changes
              </button>
              {diffError && <span className="font-mono text-[9px] text-red-400">{diffError}</span>}
            </div>
            {diffParsed && (
              <div className="mt-3 space-y-1.5">
                {diffChanges.length === 0 ? (
                  <div className="text-[9px] text-white/35">No differences — config already matches.</div>
                ) : (
                  <>
                    <div className="text-[8.5px] uppercase tracking-widest text-white/30 mb-2">
                      {diffChanges.length} field{diffChanges.length !== 1 ? 's' : ''} would change:
                    </div>
                    {diffChanges.map(([k, v]) => (
                      <div key={k} className="flex items-start gap-3 rounded-lg border border-white/6 bg-white/[0.02] px-3 py-1.5">
                        <span className="shrink-0 font-mono text-[8.5px] text-white/45">{k}</span>
                        <span className="font-mono text-[8px] text-white/22 line-through truncate">
                          {JSON.stringify(cfg[k as keyof StudioConfig])}
                        </span>
                        <span className="font-mono text-[8px] text-emerald-400/70 truncate">→ {JSON.stringify(v)}</span>
                      </div>
                    ))}
                    <button onClick={applyDiff}
                      className="mt-2 flex items-center gap-1.5 rounded-lg border border-cyan-400/25 bg-cyan-400/10 px-3 py-1.5 text-[9px] uppercase tracking-wider text-cyan-400 transition-all hover:bg-cyan-400/20">
                      <Check className="h-2.5 w-2.5" />
                      Apply {diffChanges.length} change{diffChanges.length !== 1 ? 's' : ''}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Config health check */}
          {(() => {
            const healthItems: Array<{ label: string; status: 'good' | 'warn' | 'info'; reason: string }> = [
              {
                label: 'Reset protection',
                status: cfg.confirmReset ? 'good' : 'warn',
                reason: cfg.confirmReset ? 'Confirm dialog active — resets are safe' : 'No confirmation — factory reset is immediate',
              },
              {
                label: 'Auto-save delay',
                status: cfg.autoSaveMs <= 1000 ? 'good' : 'warn',
                reason: `${cfg.autoSaveMs}ms — ${cfg.autoSaveMs <= 800 ? 'responsive' : cfg.autoSaveMs <= 1500 ? 'moderate' : 'slow, risk of data loss on close'}`,
              },
              {
                label: 'Reduced motion',
                status: cfg.reducedMotion ? 'good' : 'info',
                reason: cfg.reducedMotion ? 'Enabled — accessible for motion-sensitive users' : 'Disabled — animations active (check OS preference)',
              },
              {
                label: 'Panel coverage',
                status: visibleCount >= Math.floor(ALL_PANELS.length * 0.6) ? 'good' : 'warn',
                reason: `${visibleCount}/${ALL_PANELS.length} panels visible`,
              },
              {
                label: 'Keyboard shortcuts',
                status: cfg.keyboardShortcuts ? 'good' : 'info',
                reason: cfg.keyboardShortcuts ? '⌘K search and ⌘S save are active' : 'Shortcuts disabled — navigation is pointer-only',
              },
              {
                label: 'Workspace profiles',
                status: cfg.workspaceProfiles.length > 0 ? 'good' : 'info',
                reason: cfg.workspaceProfiles.length > 0
                  ? `${cfg.workspaceProfiles.length} custom + 4 built-in profiles saved`
                  : '4 built-in profiles available — save a custom one for quick recovery',
              },
              {
                label: 'Scrollbar UX',
                status: cfg.scrollbarStyle !== 'hidden' ? 'good' : 'warn',
                reason: cfg.scrollbarStyle === 'hidden'
                  ? 'Scrollbar hidden — users may not discover scrollable content'
                  : `Scrollbar is ${cfg.scrollbarStyle} — content is discoverable`,
              },
            ]
            const goodCount  = healthItems.filter(i => i.status === 'good').length
            const score      = Math.round((goodCount / healthItems.length) * 100)
            const scoreColor = score >= 85 ? '#34d399' : score >= 60 ? '#f59e0b' : '#f43f5e'

            return (
              <div className="rounded-xl border border-white/8 bg-white/[0.025] overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/6">
                  <Activity className="h-3.5 w-3.5 text-white/35" />
                  <span className="text-[10px] font-medium text-white/55">Config health check</span>
                  <div className="ml-auto flex items-center gap-2">
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/8">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${score}%`, background: scoreColor }} />
                    </div>
                    <span className="font-mono text-[10px] font-semibold tabular-nums" style={{ color: scoreColor }}>{score}%</span>
                  </div>
                </div>
                <div className="divide-y divide-white/4">
                  {healthItems.map(item => (
                    <div key={item.label} className="flex items-start gap-3 px-4 py-2.5">
                      <div className={cn(
                        'mt-0.5 h-4 w-4 shrink-0 rounded-full flex items-center justify-center text-[7px] font-bold',
                        item.status === 'good' ? 'bg-emerald-400/15 text-emerald-400' :
                        item.status === 'warn' ? 'bg-amber-400/15 text-amber-400' :
                        'bg-white/8 text-white/35'
                      )}>
                        {item.status === 'good' ? '✓' : item.status === 'warn' ? '!' : 'i'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[9.5px] font-medium text-white/60">{item.label}</div>
                        <div className="mt-0.5 text-[8.5px] text-white/30 leading-snug">{item.reason}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 border-t border-white/5 px-4 py-2">
                  <ShieldCheck className="h-3 w-3 text-white/18" />
                  <span className="text-[8.5px] text-white/22">{goodCount}/{healthItems.length} checks passed</span>
                </div>
              </div>
            )
          })()}

          {/* Partial resets */}
          <div className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3">
            <SLabel>Partial reset</SLabel>
            <p className="mb-3 text-[9px] text-white/30">
              Reset individual sections to factory defaults without affecting other settings.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {RESET_SECTIONS.map(({ label, color, keys }) => (
                <button key={label} onClick={() => handleSectionReset(keys)}
                  className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.025] px-3 py-2.5 text-left transition-all hover:border-white/18 hover:bg-white/[0.04]">
                  <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: color }} />
                  <div>
                    <div className="text-[9.5px] font-medium text-white/55">{label}</div>
                    <div className="font-mono text-[7.5px] text-white/22">{keys.length} settings</div>
                  </div>
                  <RotateCcw className="ml-auto h-3 w-3 text-white/18 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Export presets */}
          {cfg.customPresets.length > 0 && (
            <div className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3">
              <SLabel>Export custom presets</SLabel>
              <button onClick={handleCopyPresets}
                className={cn(
                  'flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[9.5px] uppercase tracking-wider transition-all',
                  presetsCopied ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-400' : 'border-white/10 text-white/40 hover:border-white/25 hover:text-white/60'
                )}>
                {presetsCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {presetsCopied ? 'Copied!' : `Copy presets JSON (${cfg.customPresets.length})`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
