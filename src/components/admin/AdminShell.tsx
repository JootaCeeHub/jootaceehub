'use client'

import { startTransition, useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  RotateCcw,
  Menu,
  Circle,
  Zap,
  Check,
  LogOut,
  Bot,
  Plug,
  Server,
  Network,
  Search,
  Palette,
  Wand2,
  BarChart3,
  Microscope,
  Layers,
  HardDrive,
  FolderOpen,
  BookOpen,
  GitBranch,
  User,
  Settings2,
  Blocks,
  Globe,
  LayoutDashboard,
  FlaskConical,
  SlidersHorizontal,
  X,
  Tag,
  Link2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdmin } from '@/lib/admin/store'
import { useAuth } from '@/lib/auth/context'
import { useAdminStateSync } from '@/hooks/useAdminStateSync'
import type { AdminPanel } from '@/lib/admin/types'
import { VPSSyncBar } from './VPSSyncBar'
import { trackEvent } from '@/components/shared/Analytics'

// ─── Panel + Group registry ────────────────────────────────────────────────────

interface PanelDef {
  id: AdminPanel
  label: string
  icon: React.ComponentType<{ className?: string }>
  accent: string
  desc: string
}

interface PanelGroup {
  key: string
  label: string
  collapsible?: boolean
  panels: PanelDef[]
}

const PANEL_GROUPS: PanelGroup[] = [
  {
    key: 'content',
    label: 'Content',
    panels: [
      { id: 'intake',         label: 'New Entry',      icon: Zap,           accent: '#22d3ee', desc: 'Universal content intake'    },
      { id: 'projects',       label: 'Projects',       icon: FolderOpen,    accent: '#a78bfa', desc: 'Portfolio & case studies'    },
      { id: 'research',       label: 'Research',       icon: BookOpen,      accent: '#34d399', desc: 'Articles, essays & news'     },
      { id: 'github',         label: 'GitHub',         icon: GitBranch,     accent: '#6ee7b7', desc: 'Repository intelligence'     },
      { id: 'about',          label: 'About',          icon: User,          accent: '#f472b6', desc: 'Bio, skills & timeline'      },
      { id: 'intelligence',   label: 'Intelligence',   icon: Microscope,    accent: '#c084fc', desc: 'Feeds & data sources'        },
    ],
  },
  {
    key: 'operations',
    label: 'Operations',
    panels: [
      { id: 'command',        label: 'Overview',       icon: LayoutDashboard, accent: '#22d3ee', desc: 'Publishing dashboard'      },
      { id: 'analytics',      label: 'Analytics',      icon: BarChart3,    accent: '#f43f5e', desc: 'Metrics & performance'       },
      { id: 'vps',            label: 'VPS / Deploy',   icon: Server,       accent: '#38bdf8', desc: 'Git-first CMS backend'       },
      { id: 'labs',           label: 'Labs',           icon: FlaskConical,  accent: '#f59e0b', desc: 'Experiments & demos'         },
      { id: 'taxonomy',       label: 'Taxonomy',       icon: Tag,           accent: '#34d399', desc: 'Tags, categories & media'    },
      { id: 'cms-relations',  label: 'CMS Relations',  icon: Link2,         accent: '#a78bfa', desc: 'Locale, content & scheduler' },
    ],
  },
  {
    key: 'site-builder',
    label: 'Site Builder',
    collapsible: true,
    panels: [
      { id: 'seo',            label: 'SEO & Meta',     icon: Search,       accent: '#60a5fa', desc: 'Indexing & social'           },
      { id: 'design-studio',  label: 'Design Studio',  icon: Palette,      accent: '#818cf8', desc: 'Branding, themes & lab'      },
      { id: 'blocks',         label: 'Blocks',         icon: Blocks,       accent: '#f472b6', desc: 'Section layout'              },
      { id: 'navbar-config',  label: 'Navigation',     icon: Layers,       accent: '#60a5fa', desc: 'Nav links & behavior'        },
      { id: 'content',        label: 'Site Content',   icon: Globe,        accent: '#34d399', desc: 'Hero, services, CTA'         },
      { id: 'personality',    label: 'Personality',    icon: Wand2,        accent: '#f472b6', desc: 'Effects & personality'       },
    ],
  },
  {
    key: 'advanced',
    label: 'Advanced',
    collapsible: true,
    panels: [
      { id: 'systems',        label: 'Systems',        icon: Network,      accent: '#38bdf8', desc: 'AI architecture'             },
      { id: 'infrastructure', label: 'Infrastructure', icon: Server,       accent: '#6ee7b7', desc: 'Nodes & deploys'             },
      { id: 'integrations',   label: 'Integrations',   icon: Plug,         accent: '#fb923c', desc: 'Sources, APIs & agents'      },
      { id: 'ai',             label: 'AI Profiles',    icon: Bot,          accent: '#c084fc', desc: 'LLM profiles'                },
      { id: 'showcase',       label: 'Showcase',       icon: Settings2,    accent: '#6ee7b7', desc: 'AI-generated showcases'      },
    ],
  },
  {
    key: 'studio',
    label: 'Studio',
    panels: [
      { id: 'search', label: 'Search',        icon: Search,           accent: '#22d3ee', desc: 'Smart search'               },
      { id: 'studio', label: 'Studio Config', icon: SlidersHorizontal, accent: '#a78bfa', desc: 'Command Center settings'   },
    ],
  },
]

const PANELS: PanelDef[] = PANEL_GROUPS.flatMap((g) => g.panels)

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { state, dispatch, exportJSON, importJSON, forceSave } = useAdmin()
  const { user, signOut } = useAuth()
  useAdminStateSync()
  const studio = state.studioConfig
  const [userCollapsed, setCollapsed] = useState(false)
  const [sidebarHovered, setSidebarHovered] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showSaved, setShowSaved] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [clockTime, setClockTime] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({
    'site-builder': true,
    'advanced': true,
  })
  const toggleGroup = (key: string) => setCollapsedGroups(v => ({ ...v, [key]: !v[key] }))
  // ─ Hydration fix ────────────────────────────────────────────────────────────
  const [mounted, setMounted] = useState(false)
  const [lastBackup, setLastBackup] = useState<string | null>(null)
  const [backupLabel, setBackupLabel] = useState<string>('No backup')
  const [backupColor, setBackupColor] = useState<string>('text-white/20')

  const updateBackupIndicator = useCallback((iso: string) => {
    setLastBackup(iso)
    const days = Math.floor((new Date().getTime() - new Date(iso).getTime()) / 86_400_000)
    setBackupLabel(days === 0 ? 'Backed up today' : `Backup ${days}d ago`)
    setBackupColor(days > 30 ? 'text-rose-400' : days > 7 ? 'text-amber-400' : 'text-emerald-400/70')
  }, [])

  useEffect(() => {
    trackEvent('Admin Opened')
    startTransition(() => {
      setMounted(true)
      if (studio.sidebarCollapsedDefault) setCollapsed(true)
      const stored = localStorage.getItem('jootacee-last-backup')
      if (stored) updateBackupIndicator(stored)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const prevLastSaved = useRef<string | null>(null)
  const activePanel = PANELS.find((p) => p.id === state.panel) ?? PANELS[0]

  // Hover-expand: effectiveCollapsed respects sidebarHoverExpand setting
  const collapsed = userCollapsed && !(mounted && (studio.sidebarHoverExpand ?? false) && sidebarHovered)

  // ─ Studio config derived values ─────────────────────────────────────────────
  const sidebarW = mounted ? (studio.sidebarWidth === 'compact' ? '3.5rem' : studio.sidebarWidth === 'wide' ? '16rem' : '13.5rem') : '13.5rem'
  const bgMain   = mounted ? (studio.backgroundStyle === 'dark' ? '#0a0a14' : studio.backgroundStyle === 'slate' ? '#0f172a' : studio.backgroundStyle === 'void' ? '#000000' : '#060610') : '#060610'
  const bgSide   = mounted ? (studio.backgroundStyle === 'dark' ? '#0d0d1a' : studio.backgroundStyle === 'slate' ? '#0d1424' : studio.backgroundStyle === 'void' ? '#050505' : '#08080f') : '#08080f'
  const accentClr  = mounted && studio.useCustomAccent ? studio.accentColor : undefined
  const headerH    = mounted ? (studio.headerHeight === 'sm' ? '2.5rem' : studio.headerHeight === 'lg' ? '3.5rem' : '3rem') : '3rem'
  const mainPad    = mounted ? (studio.panelPadding === 'tight' ? '0.75rem' : studio.panelPadding === 'loose' ? '1.75rem' : '1.25rem') : '1.25rem'
  const glowClr      = mounted && studio.glowEffect ? (accentClr ?? '#22d3ee') : null
  const glowOpacity  = mounted ? (studio.glowOpacity ?? 25) / 100 : 0.25
  const pinnedPanels = mounted ? (studio.pinnedPanels ?? []) : []
  const textOpacity  = mounted && studio.highContrast ? 'text-white/90' : 'text-white/35'
  const speedMult    = !mounted ? 1 : studio.animationSpeed === 'fast' ? 0.4 : studio.animationSpeed === 'slow' ? 2.5 : 1

  const scrollbarW   = !mounted ? 'thin' : studio.scrollbarStyle === 'hidden' ? 'none' : studio.scrollbarStyle === 'thin' ? 'thin' : 'auto'
  const motionProps = mounted && studio.reducedMotion
    ? { initial: false as const, animate: {}, exit: {}, transition: { duration: 0 } }
    : studio.panelTransition === 'slide'
      ? { initial: { x: 16, opacity: 0 } as const, animate: { x: 0, opacity: 1 }, exit: { x: -8, opacity: 0 }, transition: { duration: 0.15 * speedMult, ease: 'easeOut' as const } }
      : studio.panelTransition === 'scale'
        ? { initial: { scale: 0.97, opacity: 0 } as const, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.98, opacity: 0 }, transition: { duration: 0.12 * speedMult, ease: 'easeOut' as const } }
        : studio.panelTransition === 'none'
          ? { initial: false as const, animate: {}, exit: {}, transition: { duration: 0 } }
          : { initial: { opacity: 0, y: 4 } as const, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 }, transition: { duration: 0.12 * speedMult, ease: 'easeOut' as const } }

  useEffect(() => {
    if (!state.lastSaved) return
    if (prevLastSaved.current === null) {
      prevLastSaved.current = state.lastSaved
      return
    }
    if (state.lastSaved !== prevLastSaved.current) {
      prevLastSaved.current = state.lastSaved
      setShowSaved(true)
      const t = setTimeout(() => setShowSaved(false), 2500)
      return () => clearTimeout(t)
    }
  }, [state.lastSaved])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        if (state.unsaved) forceSave()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(o => !o)
        if (!searchOpen) setTimeout(() => searchRef.current?.focus(), 50)
      }
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false)
        setSearchQuery('')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [state.unsaved, forceSave, searchOpen])

  useEffect(() => {
    if (!studio.headerShowClock) { setClockTime(''); return } // eslint-disable-line react-hooks/set-state-in-effect
    const tick = () => setClockTime(new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [studio.headerShowClock])

  const handleExport = useCallback(() => {
    const blob = new Blob([exportJSON()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `jootacee-ecosystem-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    const now = new Date().toISOString()
    localStorage.setItem('jootacee-last-backup', now)
    updateBackupIndicator(now)
  }, [exportJSON, updateBackupIndicator])

  const handleImport = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      const text = await file.text()
      if (!importJSON(text)) alert('Invalid or incompatible configuration file')
    }
    input.click()
  }, [importJSON])

  // Saves as admin-defaults.json — user places in public/ and commits to git for permanent persistence
  const handleBackup = useCallback(() => {
    const blob = new Blob([exportJSON()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'admin-defaults.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [exportJSON])

  return (
    <div className="flex min-h-screen text-foreground font-mono" style={{ background: bgMain }}>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Global search overlay ── */}
      <AnimatePresence>
        {searchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
              onClick={() => { setSearchOpen(false); setSearchQuery('') }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: -8 }}
              transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="fixed left-1/2 top-[10vh] z-[61] w-full max-w-xl -translate-x-1/2 rounded-2xl border border-white/10 bg-[#0d0d1a] shadow-2xl shadow-black/60"
            >
              {/* Quick search header */}
              <div className="flex items-center gap-3 border-b border-white/8 px-4 py-3">
                <Search className="h-4 w-4 shrink-0 text-white/35" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      dispatch({ type: 'SET_PANEL', payload: 'search' })
                      setSearchOpen(false)
                    }
                  }}
                  placeholder="Search Command Center…"
                  className="flex-1 bg-transparent font-mono text-[12px] text-white placeholder:text-white/25 focus:outline-none"
                />
                <div className="flex items-center gap-2">
                  <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[8px] text-white/30">↵</kbd>
                  <button onClick={() => { setSearchOpen(false); setSearchQuery('') }} className="text-white/25 hover:text-white/55 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {/* Quick links */}
              <div className="p-2">
                <div className="mb-1 px-2 py-1 text-[8.5px] uppercase tracking-[0.2em] text-white/20">Quick access</div>
                {[
                  { id: 'search'        as const, label: 'Open full search',     desc: 'Search all panels, content & registries' },
                  { id: 'command'       as const, label: 'Overview',              desc: 'Publishing dashboard'                    },
                  { id: 'analytics'     as const, label: 'Analytics',             desc: 'Metrics & performance'                   },
                  { id: 'integrations'  as const, label: 'Integrations',          desc: 'Sources, APIs & agents'                  },
                  { id: 'studio'        as const, label: 'Studio Config',         desc: 'Command Center settings'                 },
                ].map(item => {
                  const meta = PANELS.find(p => p.id === item.id)
                  const Icon = meta?.icon ?? Search
                  return (
                    <button key={item.id}
                      onClick={() => { dispatch({ type: 'SET_PANEL', payload: item.id }); setSearchOpen(false); setSearchQuery('') }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-all hover:bg-white/[0.06]">
                      <div className="flex h-6 w-6 items-center justify-center rounded-md border border-white/8 bg-white/5">
                        <Icon className="h-3 w-3" style={{ color: meta?.accent }} />
                      </div>
                      <div>
                        <div className="text-[10.5px] font-medium text-white/70">{item.label}</div>
                        <div className="text-[9px] text-white/30">{item.desc}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
              <div className="flex items-center gap-3 border-t border-white/6 px-4 py-2 text-[8.5px] text-white/20">
                <span className="flex items-center gap-1"><kbd className="rounded border border-white/10 px-1">↵</kbd> Full search</span>
                <span className="flex items-center gap-1"><kbd className="rounded border border-white/10 px-1">Esc</kbd> Close</span>
                <span className="ml-auto">⌘K</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <aside
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
        className={cn(
        'fixed left-0 top-0 z-50 flex h-screen flex-col border-r transition-all duration-300 lg:static',
        studio.sidebarStyle === 'glass' ? 'backdrop-blur-xl' : '',
        studio.sidebarStyle === 'border' ? 'bg-transparent' : '',
        collapsed ? 'w-[3.5rem]' : 'w-[13.5rem]',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}
      style={{
        background: studio.sidebarStyle !== 'border' ? bgSide : 'transparent',
        width: collapsed ? '3.5rem' : sidebarW,
        borderRightColor: mounted && studio.sidebarBorder ? `${accentClr ?? '#22d3ee'}28` : 'rgba(255,255,255,0.05)',
      }}
      >
        {/* Ambient glow overlay */}
        {glowClr && (
          <div className="pointer-events-none absolute inset-0 z-0" style={{ opacity: glowOpacity, background: `radial-gradient(ellipse at 50% 0%, ${glowClr} 0%, transparent 65%)` }} />
        )}

        {/* Brand header */}
        <div className={cn('relative z-10 flex shrink-0 items-center border-b border-white/8 px-3 gap-2.5', collapsed && 'justify-center')} style={{ height: headerH }}>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-cyan-400/10 border border-cyan-400/30">
            <Zap className="h-3.5 w-3.5 text-cyan-400" />
          </div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden">
              <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-cyan-400/80">Studio</div>
              <div className="text-[8px] uppercase tracking-widest text-white/25">JootaCee CMS v2.2</div>
            </motion.div>
          )}
        </div>

        {/* Runtime status strip */}
        {!collapsed && (
          <div className="shrink-0 border-b border-white/8 px-3 py-1.5 flex items-center gap-2">
            <Circle className="h-1.5 w-1.5 fill-emerald-400 text-emerald-400" />
            <span className="text-[9px] uppercase tracking-[0.15em] text-emerald-400/70">{state.runtime.environment}</span>
            <span className="ml-auto text-[8px] text-white/25">{state.runtime.version}</span>
          </div>
        )}

        {/* Grouped panel nav */}
        <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin">
          {/* Pinned panels */}
          {pinnedPanels.length > 0 && (
            <div className={collapsed ? 'px-1.5 py-0.5' : 'px-2 py-0.5'}>
              {!collapsed && (
                <div className="mb-1 mt-1 px-2 font-mono text-[8px] font-semibold uppercase tracking-[0.22em] text-amber-400/50">
                  ★ Pinned
                </div>
              )}
              {collapsed && <div className="my-1.5 mx-2 border-t border-amber-400/20" />}
              {PANELS.filter(p => pinnedPanels.includes(p.id)).map(panel => {
                const Icon = panel.icon
                const active = mounted && state.panel === panel.id
                return (
                  <button key={`pin-${panel.id}`}
                    onClick={() => { dispatch({ type: 'SET_PANEL', payload: panel.id }); setMobileOpen(false) }}
                    title={collapsed ? panel.label : undefined}
                    className={cn(
                      'group relative flex w-full items-center gap-2 rounded-md px-2 py-[5px] text-left transition-all duration-150',
                      active ? 'bg-white/[0.055]' : 'hover:bg-white/[0.035] hover:text-white/65',
                      collapsed && 'justify-center',
                      studio.highContrast ? 'text-white/70' : 'text-white/35'
                    )}>
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-[2.5px] rounded-full"
                      style={{ background: accentClr ?? panel.accent, opacity: active ? 1 : 0, transform: `scaleY(${active ? 1 : 0.4})`, transition: 'opacity 180ms ease, transform 180ms ease' }}
                      suppressHydrationWarning />
                    <span className="shrink-0 transition-colors duration-150" style={{ color: active ? (accentClr ?? panel.accent) : undefined }} suppressHydrationWarning>
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    {!collapsed && (
                      <div className="min-w-0 flex-1">
                        <div className={cn('text-[10.5px] font-medium tracking-[0.08em] transition-colors leading-none', active ? 'text-white' : '')}
                          style={{ color: active ? (accentClr ?? panel.accent) : undefined }}>
                          {panel.label}
                        </div>
                      </div>
                    )}
                    {active && !collapsed && (
                      <div className="h-1.5 w-1.5 rounded-full animate-pulse shrink-0" style={{ background: accentClr ?? panel.accent }} />
                    )}
                  </button>
                )
              })}
              {!collapsed && (studio.showGroupDividers ?? true) && <div className="mx-2 mt-1.5 border-b border-white/5" />}
            </div>
          )}
          {PANEL_GROUPS.map((group) => {
            const isCollapsible = group.collapsible === true
            const isOpen = collapsedGroups[group.key] ?? false
            const groupVisible = !isCollapsible || isOpen || collapsed
            return (
              <div key={group.key} className={collapsed ? 'px-1.5 py-0.5' : 'px-2 py-0.5'}>
                {!collapsed && (
                  isCollapsible ? (
                    <button onClick={() => toggleGroup(group.key)}
                      className="mb-1 mt-2 flex w-full items-center justify-between px-2 font-mono text-[8px] font-semibold uppercase tracking-[0.22em] text-white/20 hover:text-white/40 transition-colors first:mt-1">
                      <span>{group.label}</span>
                      <div className="flex items-center gap-1.5">
                        {mounted && studio.showPanelBadges && (
                          <span className="rounded-full border border-white/8 bg-white/5 px-1.5 text-[7px] text-white/30">{group.panels.length}</span>
                        )}
                        <ChevronRight className={cn('transition-transform duration-200', isOpen ? 'rotate-90' : 'rotate-0')} size={10} />
                      </div>
                    </button>
                  ) : (
                    <div className="mb-1 mt-2 flex items-center justify-between px-2 first:mt-1">
                      <span className="font-mono text-[8px] font-semibold uppercase tracking-[0.22em] text-white/20">{group.label}</span>
                      {mounted && studio.showPanelBadges && (
                        <span className="rounded-full border border-white/8 bg-white/5 px-1.5 text-[7px] text-white/30">{group.panels.length}</span>
                      )}
                    </div>
                  )
                )}
                {collapsed && (studio.showGroupDividers ?? true) && <div className="my-1.5 mx-2 border-t border-white/8" />}

                <AnimatePresence initial={false}>
                  {groupVisible && (
                    <motion.div
                      initial={isCollapsible ? { height: 0, opacity: 0 } : false}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      style={{ overflow: 'hidden' }}
                    >
                      {group.panels.map((panel) => {
                        const Icon = panel.icon
                        const active = mounted && state.panel === panel.id
                        return (
                          <button
                            key={panel.id}
                            onClick={() => { dispatch({ type: 'SET_PANEL', payload: panel.id }); setMobileOpen(false) }}
                            title={collapsed ? panel.label : undefined}
                            className={cn(
                              'group relative flex w-full items-center gap-2 rounded-md px-2 py-[5px] text-left transition-all duration-150',
                              active ? 'bg-white/[0.055]' : cn('hover:bg-white/[0.035] hover:text-white/65', textOpacity),
                              collapsed && 'justify-center'
                            )}
                          >
                            <div
                              className="absolute left-0 top-1.5 bottom-1.5 w-[2.5px] rounded-full"
                              style={{ background: accentClr ?? panel.accent, opacity: active ? 1 : 0, transform: `scaleY(${active ? 1 : 0.4})`, transition: 'opacity 180ms ease, transform 180ms ease' }}
                              suppressHydrationWarning
                            />
                            <span className="shrink-0 transition-colors duration-150" style={{ color: active ? (accentClr ?? panel.accent) : undefined }} suppressHydrationWarning>
                              <Icon className="h-3.5 w-3.5" />
                            </span>
                            {!collapsed && (
                              <div className="min-w-0 flex-1">
                                <div
                                  className={cn('text-[10.5px] font-medium tracking-[0.08em] transition-colors leading-none', active ? 'text-white' : '')}
                                  style={{ color: active ? (accentClr ?? panel.accent) : undefined }}
                                >
                                  {panel.label}
                                </div>
                                {studio.showDescriptions && (
                                  <div className="mt-0.5 text-[8.5px] tracking-[0.08em] text-white/22 leading-none">{panel.desc}</div>
                                )}
                              </div>
                            )}
                            {active && !collapsed && (
                              <div className="h-1.5 w-1.5 rounded-full animate-pulse shrink-0" style={{ background: accentClr ?? panel.accent }} />
                            )}
                          </button>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </nav>

        {/* Portfolio stats */}
        {!collapsed && (
          <div className="shrink-0 border-t border-white/8 px-3 py-2.5 grid grid-cols-3 gap-1">
            {[
              { label: 'Projects', value: mounted ? state.projectsRegistry.filter((p) => p.published).length : 0 },
              { label: 'Articles', value: mounted ? state.researchRegistry.filter((r) => r.published).length : 0 },
              { label: 'Systems',  value: mounted ? state.systemsRegistry.filter((s) => s.status === 'operational').length : 0 },
            ].map((m) => (
              <div key={m.label} className="text-center">
                <div className="text-[13px] font-semibold text-white/75" suppressHydrationWarning>{m.value}</div>
                <div className="text-[7.5px] uppercase tracking-widest text-white/22">{m.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Collapse toggle */}
        <div className="shrink-0 border-t border-white/8 p-1.5">
          <button onClick={() => setCollapsed((c) => !c)}
            className={cn('flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[9px] text-white/25 transition-colors hover:bg-white/[0.04] hover:text-white/55', collapsed && 'justify-center')}>
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
            {!collapsed && <span className="uppercase tracking-widest">Collapse</span>}
          </button>
        </div>

        {/* Sidebar footer — version + last-saved strip */}
        {!collapsed && mounted && studio.sidebarFooter && (
          <div className="shrink-0 border-t border-white/5 px-3 py-2 flex items-center justify-between gap-2">
            <span className="font-mono text-[7.5px] text-white/18 uppercase tracking-widest">{state.runtime.version}</span>
            {state.lastSaved ? (
              <span className="font-mono text-[7.5px] text-white/18 tabular-nums" suppressHydrationWarning>
                {new Date(state.lastSaved).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
              </span>
            ) : (
              <span className="font-mono text-[7.5px] text-white/12">never saved</span>
            )}
          </div>
        )}
      </aside>

      {/* ── Main ── */}
      <div className="flex flex-1 flex-col lg:min-w-0 overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 flex shrink-0 items-center justify-between border-b border-white/8 px-4 backdrop-blur-md" style={{ height: headerH, background: `${bgMain}e6` }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-white/40 hover:bg-white/6 hover:text-white/70 lg:hidden">
              <Menu className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1.5">
              {(!mounted || !studio.compactHeader) && (
                <>
                  <span className="text-[9.5px] uppercase tracking-[0.18em] text-white/25">JOOTACEE OS</span>
                  <span className="text-white/18">/</span>
                </>
              )}
              <span className="text-[9.5px] uppercase tracking-[0.18em] font-semibold"
                style={{ color: mounted ? (accentClr ?? activePanel.accent) : undefined }} suppressHydrationWarning>
                {activePanel.label}
              </span>
            </div>

            {clockTime && (
              <span className="hidden sm:inline font-mono text-[8.5px] tabular-nums text-white/22 tracking-widest" suppressHydrationWarning>
                {clockTime}
              </span>
            )}

            {mounted && studio.showSavedIndicator && (
              state.unsaved ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[8.5px] uppercase tracking-[0.12em] text-amber-400">
                  <span className="h-1 w-1 rounded-full bg-amber-400 animate-pulse" />
                  Unsaved
                </span>
              ) : showSaved ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-0.5 text-[8.5px] uppercase tracking-[0.12em] text-emerald-400">
                  <Check className="h-2.5 w-2.5" />
                  Saved
                </span>
              ) : state.lastSaved ? (
                <span className="text-[8.5px] uppercase tracking-widest text-white/18" suppressHydrationWarning>
                  Saved {new Date(state.lastSaved).toLocaleTimeString()}
                </span>
              ) : null
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Search */}
            {(!mounted || studio.headerActions.showSearch) && (
              <button onClick={() => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 50) }}
                title="Search (⌘K)"
                className="flex items-center gap-1.5 rounded-md border border-white/8 bg-white/[0.035] px-2.5 py-1 text-[9.5px] uppercase tracking-[0.1em] text-white/45 transition-colors hover:bg-white/8 hover:text-white/75">
                <Search className="h-3 w-3" />
                <span className="hidden sm:inline">Search</span>
                <kbd className="hidden rounded border border-white/10 bg-white/5 px-1 py-0.5 text-[7.5px] text-white/25 sm:inline">⌘K</kbd>
              </button>
            )}
            {/* VPS sync status */}
            {mounted && <VPSSyncBar />}
            {/* Last-backup indicator */}
            {mounted && (
              <span
                className={`hidden items-center gap-1 rounded border border-white/6 bg-white/[0.02] px-2 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.12em] sm:inline-flex ${backupColor}`}
                title={lastBackup ? `Last backup: ${new Date(lastBackup).toLocaleString()}` : 'No backup taken yet'}
                suppressHydrationWarning
              >
                {backupLabel}
              </span>
            )}
            {/* Export */}
            {(!mounted || studio.headerActions.showExport) && (
              <button onClick={handleExport} title="Export config (JSON)"
                className="flex items-center gap-1.5 rounded-md border border-white/8 bg-white/[0.035] px-2.5 py-1 text-[9.5px] uppercase tracking-[0.1em] text-white/45 transition-colors hover:bg-white/8 hover:text-white/75">
                <Download className="h-3 w-3" />
                <span className="hidden sm:inline">Export</span>
              </button>
            )}
            {/* Import */}
            {(!mounted || studio.headerActions.showImport) && (
              <button onClick={handleImport} title="Import config (JSON)"
                className="flex items-center gap-1.5 rounded-md border border-white/8 bg-white/[0.035] px-2.5 py-1 text-[9.5px] uppercase tracking-[0.1em] text-white/45 transition-colors hover:bg-white/8 hover:text-white/75">
                <Upload className="h-3 w-3" />
                <span className="hidden sm:inline">Import</span>
              </button>
            )}
            {/* Backup */}
            {(!mounted || studio.headerActions.showBackup) && (
              <button onClick={handleBackup} title="Save admin-defaults.json for permanent persistence"
                className="flex items-center gap-1.5 rounded-md border border-white/8 bg-white/[0.035] px-2.5 py-1 text-[9.5px] uppercase tracking-[0.1em] text-white/45 transition-colors hover:bg-white/8 hover:text-white/75">
                <HardDrive className="h-3 w-3" />
                <span className="hidden sm:inline">Backup</span>
              </button>
            )}
            {/* Reset */}
            {(!mounted || studio.headerActions.showReset) && (
              <button
                onClick={() => { if (!studio.confirmReset || confirm('Reset all ecosystem configuration to factory defaults?')) dispatch({ type: 'RESET_STATE' }) }}
                title="Reset to factory defaults"
                className="flex items-center gap-1.5 rounded-md border border-red-400/15 bg-red-400/[0.04] px-2.5 py-1 text-[9.5px] uppercase tracking-[0.1em] text-red-400/55 transition-colors hover:bg-red-400/10 hover:text-red-400">
                <RotateCcw className="h-3 w-3" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}

            {user && (
              <div className="flex items-center gap-2 border-l border-white/8 pl-3">
                {user.picture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.picture} alt={user.name} className="h-6 w-6 rounded-full ring-1 ring-white/10 object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-400/20 text-[9.5px] font-semibold uppercase text-cyan-400">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden text-[9.5px] uppercase tracking-[0.12em] text-white/38 sm:inline">
                  {user.name.split(' ')[0]}
                </span>
                <button onClick={signOut} title="Sign out"
                  className="flex h-6 w-6 items-center justify-center rounded-md text-white/25 transition-colors hover:bg-red-400/10 hover:text-red-400">
                  <LogOut className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto" style={{ padding: mainPad, scrollbarWidth: scrollbarW as 'none' | 'thin' | 'auto' }}>
          <AnimatePresence mode="sync">
            <motion.div key={state.panel} {...motionProps}>
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
        <footer aria-label="Admin shell" className="sr-only" />
      </div>
    </div>
  )
}
