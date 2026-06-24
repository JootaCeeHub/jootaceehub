'use client'

import { useState, useCallback } from 'react'
import { useAdmin } from '@/lib/admin/store'
import { cn } from '@/lib/utils'
import { AppearanceSection } from './studio/AppearanceSection'
import { BehaviorSection } from './studio/BehaviorSection'
import { LayoutSection } from './studio/LayoutSection'
import { WorkspaceSection } from './studio/WorkspaceSection'
import { NavigationSection } from './studio/NavigationSection'
import { ExportSection } from './studio/ExportSection'
import { PanelDesignSection } from './studio/PanelDesignSection'
import type {
  AdminPanel, StudioPanelConfig,
  StudioConfig, StudioCustomPreset, StudioWorkspaceProfile,
} from '@/lib/admin/types'
import {
  SlidersHorizontal, Palette, Layout, Zap, Eye, EyeOff, RotateCcw,
  MousePointer, Sidebar, AlignLeft, LayoutDashboard,
  FolderOpen, BookOpen, GitBranch, User, Microscope, BarChart3, FlaskConical,
  Globe, Wand2, Layers, Blocks, Network, Server, Plug, Bot, Settings2, Search,
  X, Filter, Pin, PinOff,
  AlertTriangle, FileJson,
  BookMarked,
} from 'lucide-react'

// reason: icon components need style prop for accent color rendering
type IconComp = React.ComponentType<{ className?: string; style?: React.CSSProperties }>

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'profiles',    label: 'Profiles',    icon: BookMarked      },
  { id: 'layout',      label: 'Layout',      icon: Layout          },
  { id: 'appearance',  label: 'Appearance',  icon: Palette         },
  { id: 'navigation',  label: 'Nav',         icon: Sidebar         },
  { id: 'panels',      label: 'Panels',      icon: LayoutDashboard },
  { id: 'panel-design', label: 'Design',     icon: SlidersHorizontal },
  { id: 'behavior',    label: 'Behavior',    icon: MousePointer    },
  { id: 'export',      label: 'Export',      icon: FileJson        },
] as const

type Tab = typeof TABS[number]['id']

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

const GROUP_FILTER_OPTIONS = [
  { value: 'all',          label: 'All'      },
  { value: 'content',      label: 'Content'  },
  { value: 'operations',   label: 'Ops'      },
  { value: 'site-builder', label: 'Site'     },
  { value: 'advanced',     label: 'Advanced' },
  { value: 'studio',       label: 'Studio'   },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

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

// ─── Main component ───────────────────────────────────────────────────────────

export default function StudioPanel() {
  const { state, dispatch } = useAdmin()
  const cfg = state.studioConfig
  const [tab, setTab] = useState<Tab>('profiles')
  const [panelSearch, setPanelSearch] = useState('')
  const [groupFilter, setGroupFilter] = useState<string>('all')
  const [presetName, setPresetName]   = useState('')
  const [savingPreset, setSavingPreset] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileName, setProfileName]   = useState('')
  const [profileIcon, setProfileIcon]   = useState('⚡')
  const [tintCopied, setTintCopied]   = useState<string | null>(null)

  const set = (partial: Partial<typeof cfg>) => dispatch({ type: 'UPDATE_STUDIO', payload: partial })

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

  const getOverride = (id: AdminPanel): StudioPanelConfig | undefined =>
    cfg.panelOverrides.find(p => p.id === id)

  const setPanelOverride = (id: AdminPanel, data: Partial<StudioPanelConfig>) =>
    dispatch({ type: 'STUDIO_SET_PANEL_OVERRIDE', payload: { id, data } })

  const togglePin = (id: AdminPanel) =>
    dispatch({ type: 'STUDIO_TOGGLE_PIN', payload: id })

  const copyTint = useCallback((hex: string) => {
    navigator.clipboard.writeText(hex).then(() => {
      setTintCopied(hex)
      setTimeout(() => setTintCopied(null), 1200)
    })
  }, [])

  const filteredPanels = ALL_PANELS.filter(p => {
    const matchGroup  = groupFilter === 'all' || p.group === groupFilter
    const matchSearch = !panelSearch || p.label.toLowerCase().includes(panelSearch.toLowerCase()) || p.desc.toLowerCase().includes(panelSearch.toLowerCase())
    return matchGroup && matchSearch
  })

  const visibleCount = ALL_PANELS.filter(p => (getOverride(p.id)?.visible ?? true)).length
  const pinnedPanels = cfg.pinnedPanels ?? []

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
        <WorkspaceSection
          cfg={cfg} set={set}
          savingPreset={savingPreset} setSavingPreset={setSavingPreset}
          presetName={presetName} setPresetName={setPresetName}
          savingProfile={savingProfile} setSavingProfile={setSavingProfile}
          profileName={profileName} setProfileName={setProfileName}
          profileIcon={profileIcon} setProfileIcon={setProfileIcon}
          onSaveCustomPreset={saveCustomPreset}
          onSaveWorkspaceProfile={saveWorkspaceProfile}
          onApplyWorkspaceProfile={applyWorkspaceProfile}
          onApplyCustomPreset={(p) => set({ activePreset: p.id, ...p.config })}
        />
      )}


      {/* ── LAYOUT ── */}
      {tab === 'layout' && (
        <LayoutSection cfg={cfg} set={set} />
      )}

      {/* ── APPEARANCE ── */}
      {tab === 'appearance' && (
        <AppearanceSection
          cfg={cfg} set={set}
          tintCopied={tintCopied}
          onCopyTint={copyTint}
        />
      )}


      {/* ── NAVIGATION ── */}
      {tab === 'navigation' && <NavigationSection />}

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

      {/* ── PANEL DESIGN ── */}
      {tab === 'panel-design' && <PanelDesignSection />}

      {/* ── BEHAVIOR ── */}
      {tab === 'behavior' && (
        <BehaviorSection cfg={cfg} set={set} />
      )}


      {/* ── EXPORT ── */}
      {tab === 'export' && <ExportSection />}
    </div>
  )
}
