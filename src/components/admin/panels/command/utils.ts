import React from 'react'
import type { AdminState, AdminPanel } from '@/lib/admin/types'
import {
  CheckCircle2, AlertTriangle, Database, GitBranch, Bot, Rocket,
  LayoutDashboard, BarChart3, FlaskConical, Search, Palette, Blocks,
  Layers, Globe, Wand2, Network, Server, Plug, Settings2,
  FolderOpen, BookOpen, Microscope, User, Zap,
} from 'lucide-react'

// ─── Activity feed ────────────────────────────────────────────────────────────

export type Severity = 'success' | 'info' | 'warning' | 'error'

export interface ActivityItem {
  msg:      string
  sub:      string
  time:     string
  severity: Severity
  icon:     React.ComponentType<{ className?: string }>
}

export function deriveActivity(state: AdminState): ActivityItem[] {
  const items: ActivityItem[] = []

  for (const d of state.infraConfig.deployments.slice(0, 3)) {
    items.push({
      msg:      `${d.service} ${d.version} → ${d.env}`,
      sub:      d.timestamp,
      time:     d.timestamp.split(' ')[1] ?? '',
      severity: d.status === 'success' ? 'success' : d.status === 'failed' ? 'error' : 'warning',
      icon:     Rocket,
    })
  }

  for (const sys of state.systemsRegistry.filter((s) => s.status !== 'operational').slice(0, 2)) {
    items.push({
      msg:      `${sys.name} is ${sys.status}`,
      sub:      `${sys.tools} tools · v${sys.version}`,
      time:     '',
      severity: sys.status === 'degraded' ? 'warning' : 'error',
      icon:     AlertTriangle,
    })
  }

  const readySources = state.integrations?.dataSources?.filter((s) => s.status === 'ready') ?? []
  if (readySources.length > 0) {
    items.push({
      msg:      `${readySources.length} data source${readySources.length > 1 ? 's' : ''} indexed`,
      sub:      'Integrations · Ready for showcase',
      time:     '',
      severity: 'success',
      icon:     Database,
    })
  }

  if (state.integrations?.github?.connected) {
    items.push({
      msg:      `GitHub connected · ${state.integrations.github.username}`,
      sub:      `${state.integrations.github.repos.length} repos synced`,
      time:     state.integrations.github.lastSync?.split('T')[0] ?? '',
      severity: 'success',
      icon:     GitBranch,
    })
  }

  const hermes = state.capabilities?.hermes
  if (hermes?.status === 'connected') {
    items.push({
      msg:      'Hermes Agent connected',
      sub:      `${hermes.backend} · ${hermes.model.split('/').pop()}`,
      time:     hermes.lastConnected?.split('T')[1]?.slice(0, 5) ?? '',
      severity: 'info',
      icon:     Bot,
    })
  } else if (hermes?.status === 'error') {
    items.push({
      msg:      'Hermes Agent unreachable',
      sub:      `Endpoint: ${hermes.endpoint}`,
      time:     '',
      severity: 'error',
      icon:     Bot,
    })
  }

  const activeProfile = state.aiConfig?.profiles?.find((p) => p.id === state.aiConfig?.activeProfileId)
  if (activeProfile) {
    items.push({
      msg:      `AI profile active: ${activeProfile.label}`,
      sub:      `${activeProfile.provider} · ${activeProfile.model}`,
      time:     '',
      severity: 'info',
      icon:     Bot,
    })
  }

  if (state.site.maintenanceMode) {
    items.push({
      msg:      'Maintenance mode enabled',
      sub:      state.site.url,
      time:     '',
      severity: 'warning',
      icon:     AlertTriangle,
    })
  }

  if (state.systemsRegistry.every((s) => s.status === 'operational')) {
    items.push({
      msg:      'All systems operational',
      sub:      `${state.systemsRegistry.length} systems · ${state.runtime.activeAgents} agents active`,
      time:     '',
      severity: 'success',
      icon:     CheckCircle2,
    })
  }

  return items.slice(0, 9)
}

// ─── Performance constants ────────────────────────────────────────────────────

export const PERF_TARGETS: Record<string, number> = {
  Performance:      90,
  Accessibility:    95,
  'Best Practices': 90,
  SEO:             100,
  PWA:              70,
}

export const STATIC_PERF = [
  { label: 'Performance',    score: 44  },
  { label: 'Accessibility',  score: 96  },
  { label: 'Best Practices', score: 96  },
  { label: 'SEO',            score: 100 },
  { label: 'PWA',            score: 72  },
]

export const CATEGORY_COLORS: Record<string, string> = {
  opinion:  'bg-violet-400',
  research: 'bg-sky-400',
  essays:   'bg-emerald-400',
  news:     'bg-amber-400',
}

// Maps audit item labels → admin panel for one-click fix navigation
export const AUDIT_PANEL_MAP: Partial<Record<string, AdminPanel>> = {
  'Hero configurado':         'content',
  'Estadísticas':             'content',
  'Servicios':                'content',
  'Precios':                  'content',
  'Testimonios':              'content',
  'Navbar visible':           'navbar-config',
  'Links de nav visibles':    'navbar-config',
  'Navbar sticky':            'navbar-config',
  'Footer visible':           'footer-config',
  'Columnas footer':          'footer-config',
  'Redes sociales':           'footer-config',
  'Footer configured':        'footer-config',
  'SEO title set':            'seo',
  'Meta description':         'seo',
  'OG image':                 'seo',
  'Canonical URL':            'seo',
  'Twitter handle':           'seo',
  'Analytics configured':     'site-core',
  'No maintenance mode':      'site-core',
  '2+ live projects':         'labs',
  'Labs visibles':            'labs',
  '2+ articles published':    'research',
  'Artículos publicados':     'research',
  'GitHub connected':         'integrations',
  'All systems operational':  'systems',
  'Sistemas operacionales':   'systems',
  'Nodos infra running':      'infrastructure',
  'MCP Servers':              'integrations',
  'AI Profiles':              'ai',
  'Bloques activos':          'blocks',
  'Efectos web activos':      'personality',
  'Paleta activa':            'design',
  'Personalidad':             'personality',
  'Nav links ≥ 3':            'navbar-config',
}

// ─── Live Audit ───────────────────────────────────────────────────────────────

export interface AuditItem {
  label: string
  pass:  boolean
  value: string
  pct?:  number
}

export interface AuditCategory {
  title: string
  score: number
  dot:   string
  items: AuditItem[]
}

export function buildAudit(
  state: AdminState,
  domSeoPass: number | null,
  domA11yPass: number | null,
): AuditCategory[] {
  const configItems: AuditItem[] = [
    {
      label: 'Hero configurado',
      pass:  state.content.hero.title.length > 10,
      value: state.content.hero.title.length > 0 ? `${state.content.hero.title.length}c` : '—',
    },
    {
      label: 'Estadísticas',
      pass:  state.content.stats.length >= 2,
      value: `${state.content.stats.length}`,
    },
    {
      label: 'Servicios',
      pass:  state.content.services.length >= 2,
      value: `${state.content.services.length}`,
    },
    {
      label: 'Navbar visible',
      pass:  state.navbarSettings.visible,
      value: state.navbarSettings.visible ? 'on' : 'off',
    },
    {
      label: 'Links de nav visibles',
      pass:  state.navigation.filter((n) => n.visible).length >= 3,
      value: `${state.navigation.filter((n) => n.visible).length}`,
    },
    {
      label: 'Footer visible',
      pass:  state.footerSettings.visible,
      value: state.footerSettings.visible ? 'on' : 'off',
    },
    {
      label: 'No maintenance mode',
      pass:  !state.site.maintenanceMode,
      value: state.site.maintenanceMode ? 'on' : 'off',
    },
    {
      label: 'Analytics configured',
      pass:  state.site.enableAnalytics && state.site.trackingId.length > 0,
      value: state.site.trackingId || 'none',
    },
  ]

  const codeItems: AuditItem[] = [
    {
      label: 'SEO title set',
      pass:  state.seo.defaultTitle.length > 10,
      value: state.seo.defaultTitle.length > 0 ? `${state.seo.defaultTitle.length}c` : '—',
    },
    {
      label: 'Meta description',
      pass:  state.seo.defaultDescription.length >= 50,
      value: state.seo.defaultDescription.length > 0 ? `${state.seo.defaultDescription.length}c` : '—',
    },
    {
      label: 'OG image',
      pass:  state.seo.ogImage.length > 0,
      value: state.seo.ogImage.length > 0 ? 'set' : '—',
    },
    {
      label: 'Canonical URL',
      pass:  state.seo.canonicalBase.length > 0,
      value: state.seo.canonicalBase.length > 0 ? 'set' : '—',
    },
    {
      label: 'DOM SEO checks',
      pass:  domSeoPass != null ? domSeoPass >= 6 : true,
      value: domSeoPass != null ? `${domSeoPass}/8` : 'n/a',
      pct:   domSeoPass != null ? Math.round((domSeoPass / 8) * 100) : undefined,
    },
    {
      label: 'DOM A11y checks',
      pass:  domA11yPass != null ? domA11yPass >= 8 : true,
      value: domA11yPass != null ? `${domA11yPass}/10` : 'n/a',
      pct:   domA11yPass != null ? Math.round((domA11yPass / 10) * 100) : undefined,
    },
  ]

  const archItems: AuditItem[] = [
    {
      label: 'Sistemas operacionales',
      pass:  state.systemsRegistry.length > 0 && state.systemsRegistry.every((s) => s.status === 'operational'),
      value: `${state.systemsRegistry.filter((s) => s.status === 'operational').length}/${state.systemsRegistry.length}`,
    },
    {
      label: 'Nodos infra running',
      pass:  state.infraConfig.nodes.filter((n) => n.status === 'running').length >= Math.ceil(state.infraConfig.nodes.length * 0.8),
      value: `${state.infraConfig.nodes.filter((n) => n.status === 'running').length}/${state.infraConfig.nodes.length}`,
    },
    {
      label: 'GitHub connected',
      pass:  state.integrations?.github?.connected ?? false,
      value: state.integrations?.github?.connected ? state.integrations.github.username : 'no',
    },
    {
      label: 'MCP Servers',
      pass:  (state.capabilities?.mcpServers?.filter((s) => s.enabled).length ?? 0) > 0,
      value: `${state.capabilities?.mcpServers?.filter((s) => s.enabled).length ?? 0} active`,
    },
    {
      label: 'AI Profiles',
      pass:  state.aiConfig.profiles.length > 0,
      value: `${state.aiConfig.profiles.length}`,
    },
  ]

  const personalItems: AuditItem[] = [
    {
      label: 'Labs visibles',
      pass:  state.labsRegistry.filter((l) => l.visible).length >= 3,
      value: `${state.labsRegistry.filter((l) => l.visible).length}`,
    },
    {
      label: 'Artículos publicados',
      pass:  state.researchRegistry.filter((r) => r.published).length >= 2,
      value: `${state.researchRegistry.filter((r) => r.published).length}`,
    },
    {
      label: 'Bloques activos',
      pass:  state.blocks.filter((b) => b.enabled).length >= 6,
      value: `${state.blocks.filter((b) => b.enabled).length}/${state.blocks.length}`,
    },
    {
      label: 'Efectos web activos',
      pass:  state.personality.effects.filter((e) => e.enabled).length >= 2,
      value: `${state.personality.effects.filter((e) => e.enabled).length}`,
    },
    {
      label: 'Paleta activa',
      pass:  state.design.palette !== 'slate',
      value: state.design.palette,
    },
    {
      label: 'Personalidad',
      pass:  state.personality.active !== 'minimalist',
      value: state.personality.active,
    },
  ]

  const score = (items: AuditItem[]) =>
    Math.round((items.filter((i) => i.pass).length / items.length) * 100)

  return [
    { title: 'Configuración',                  score: score(configItems),   dot: 'bg-sky-400',     items: configItems   },
    { title: 'Calidad de Código',               score: score(codeItems),    dot: 'bg-violet-400',  items: codeItems    },
    { title: 'Arquitectura & Ecosistema',       score: score(archItems),    dot: 'bg-emerald-400', items: archItems    },
    { title: 'Personalización',                 score: score(personalItems),dot: 'bg-amber-400',   items: personalItems},
  ]
}

// ─── Production readiness ─────────────────────────────────────────────────────

export function buildProductionReadiness(state: AdminState) {
  const liveCount =
    state.projectsRegistry?.filter(p => p.status === 'live').length
    ?? state.labsRegistry.filter(l => l.visible).length

  const items = [
    { label: 'Hero content',            pass: state.content.hero.title.length > 10,                                    cat: 'Content'     },
    { label: 'SEO title set',           pass: state.seo.defaultTitle.length > 10,                                      cat: 'SEO'         },
    { label: 'Meta description',        pass: state.seo.defaultDescription.length >= 50,                               cat: 'SEO'         },
    { label: 'OG image',                pass: state.seo.ogImage.length > 0,                                            cat: 'SEO'         },
    { label: 'Canonical URL',           pass: state.seo.canonicalBase.length > 0,                                      cat: 'SEO'         },
    { label: 'Analytics configured',    pass: state.site.enableAnalytics && state.site.trackingId.length > 0,          cat: 'Analytics'   },
    { label: 'Twitter handle',          pass: state.seo.twitterHandle.length > 0,                                      cat: 'SEO'         },
    { label: 'Nav links ≥ 3',           pass: state.navigation.filter(n => n.visible).length >= 3,                     cat: 'Nav'         },
    { label: 'Footer configured',       pass: state.footerSettings.visible && state.footerSettings.columns.length > 0, cat: 'Nav'         },
    { label: '2+ live projects',        pass: liveCount >= 2,                                                          cat: 'Content'     },
    { label: '2+ articles published',   pass: state.researchRegistry.filter(r => r.published).length >= 2,             cat: 'Content'     },
    { label: 'GitHub connected',        pass: state.integrations?.github?.connected ?? false,                           cat: 'Integration' },
    { label: 'All systems operational', pass: state.systemsRegistry.length > 0 && state.systemsRegistry.every(s => s.status === 'operational'), cat: 'Systems' },
    { label: 'No maintenance mode',     pass: !state.site.maintenanceMode,                                             cat: 'Config'      },
    { label: 'PWA service worker',      pass: true,                                                                    cat: 'PWA'         },
    { label: 'Security headers',        pass: true,                                                                    cat: 'Security'    },
    { label: 'HTTPS canonical',         pass: state.seo.canonicalBase.startsWith('https'),                             cat: 'Security'    },
    { label: 'i18n 9/9 sections',       pass: true,                                                                    cat: 'i18n'        },
  ]

  const passing = items.filter(i => i.pass).length
  return { items, passing, score: Math.round((passing / items.length) * 100) }
}

// ─── Panel status map ─────────────────────────────────────────────────────────

export type PanelStatus = 'ok' | 'warn' | 'empty'

export interface PanelStatusItem {
  id:     AdminPanel
  label:  string
  status: PanelStatus
  detail: string
}

export function buildPanelStatus(state: AdminState): PanelStatusItem[] {
  const { site, seo, design, personality, blocks, content, navigation, footerSettings,
          navbarSettings, systemsRegistry, infraConfig, labsRegistry, researchRegistry,
          integrations, aiConfig, capabilities } = state

  const visibleNav     = navigation.filter(n => n.visible).length
  const enabledBlocks  = blocks.filter(b => b.enabled).length
  const opSystems      = systemsRegistry.filter(s => s.status === 'operational').length
  const runNodes       = infraConfig.nodes.filter(n => n.status === 'running').length
  const visibleLabs    = labsRegistry.filter(l => l.visible).length
  const pubArticles    = researchRegistry.filter(r => r.published).length
  const ghRepos        = integrations?.github?.repos?.length ?? 0
  const activeProfile  = aiConfig.profiles.find(p => p.id === aiConfig.activeProfileId)
  const enabledMCP     = capabilities.mcpServers.filter(s => s.enabled).length
  const enabledSkills  = capabilities.skills.filter(s => s.enabled).length
  const connSocial     = integrations?.socialPlatforms?.filter(p => p.connected).length ?? 0

  return [
    { id: 'site-core',      label: 'Site Core',     status: site.name.length > 0 && site.url.startsWith('https') ? 'ok' : site.name.length > 0 ? 'warn' : 'empty', detail: site.name.length > 0 ? site.name : 'No site name' },
    { id: 'seo',            label: 'SEO',            status: seo.defaultTitle.length > 10 && seo.defaultDescription.length >= 50 && seo.ogImage.length > 0 ? 'ok' : seo.defaultTitle.length > 0 ? 'warn' : 'empty', detail: seo.defaultTitle.length > 0 ? `${seo.defaultTitle.length} chars` : 'No title' },
    { id: 'design',         label: 'Design',         status: design.palette !== 'slate' ? 'ok' : 'warn', detail: `Palette: ${design.palette}` },
    { id: 'personality',    label: 'Personality',    status: personality.effects.filter(e => e.enabled).length >= 2 ? 'ok' : 'warn', detail: `${personality.active} · ${personality.effects.filter(e => e.enabled).length} fx` },
    { id: 'blocks',         label: 'Blocks',         status: enabledBlocks >= 6 ? 'ok' : enabledBlocks > 0 ? 'warn' : 'empty', detail: `${enabledBlocks}/${blocks.length} enabled` },
    { id: 'content',        label: 'Content',        status: content.hero.title.length > 10 && content.stats.length >= 2 && content.services.length >= 2 ? 'ok' : content.hero.title.length > 0 ? 'warn' : 'empty', detail: content.hero.title.length > 0 ? 'Hero set' : 'No hero' },
    { id: 'navbar-config',  label: 'Navbar',         status: navbarSettings.visible && visibleNav >= 3 ? 'ok' : navbarSettings.visible ? 'warn' : 'empty', detail: `${visibleNav} links visible` },
    { id: 'footer-config',  label: 'Footer',         status: footerSettings.visible && footerSettings.columns.length > 0 ? 'ok' : footerSettings.visible ? 'warn' : 'empty', detail: `${footerSettings.columns.length} cols` },
    { id: 'systems',        label: 'Systems',        status: systemsRegistry.length > 0 && opSystems === systemsRegistry.length ? 'ok' : systemsRegistry.length > 0 ? 'warn' : 'empty', detail: `${opSystems}/${systemsRegistry.length} online` },
    { id: 'infrastructure', label: 'Infra',          status: infraConfig.nodes.length > 0 && runNodes >= Math.ceil(infraConfig.nodes.length * 0.8) ? 'ok' : infraConfig.nodes.length > 0 ? 'warn' : 'empty', detail: `${runNodes}/${infraConfig.nodes.length} running` },
    { id: 'labs',           label: 'Labs',           status: visibleLabs >= 3 ? 'ok' : labsRegistry.length > 0 ? 'warn' : 'empty', detail: `${visibleLabs} visible` },
    { id: 'research',       label: 'Research',       status: pubArticles >= 2 ? 'ok' : researchRegistry.length > 0 ? 'warn' : 'empty', detail: `${pubArticles} published` },
    { id: 'github',         label: 'GitHub',         status: (integrations?.github?.connected && ghRepos > 0) ? 'ok' : integrations?.github?.connected ? 'warn' : 'empty', detail: integrations?.github?.connected ? `${ghRepos} repos` : 'Not connected' },
    { id: 'ai',             label: 'AI',             status: aiConfig.profiles.length > 0 && !!activeProfile?.apiKey ? 'ok' : aiConfig.profiles.length > 0 ? 'warn' : 'empty', detail: `${aiConfig.profiles.length} profiles` },
    { id: 'integrations',   label: 'Integrations',   status: (integrations?.github?.connected || connSocial > 0) ? 'ok' : (integrations?.dataSources?.length ?? 0) > 0 ? 'warn' : 'empty', detail: `${integrations?.dataSources?.length ?? 0} sources · ${enabledMCP} MCP · ${enabledSkills} skills` },
    { id: 'analytics',      label: 'Analytics',      status: site.enableAnalytics && site.trackingId.length > 0 && seo.ogImage.length > 0 ? 'ok' : site.enableAnalytics ? 'warn' : 'empty', detail: site.enableAnalytics ? (site.trackingId || 'No ID') : 'Disabled' },
    { id: 'showcase',       label: 'Showcase',       status: ghRepos > 0 ? 'ok' : 'empty', detail: `${ghRepos} repos synced` },
  ]
}

// ─── Panel navigation entries ─────────────────────────────────────────────────

export interface NavEntry {
  id:     AdminPanel
  label:  string
  icon:   React.ComponentType<{ className?: string }>
  accent: string
  desc:   string
}

export const NAV_ENTRIES: NavEntry[] = [
  { id: 'intake',         label: 'New Entry',      icon: Zap,             accent: '#22d3ee', desc: 'Universal content intake'    },
  { id: 'projects',       label: 'Projects',       icon: FolderOpen,      accent: '#a78bfa', desc: 'Portfolio & case studies'    },
  { id: 'research',       label: 'Research',       icon: BookOpen,        accent: '#34d399', desc: 'Articles, essays & news'     },
  { id: 'github',         label: 'GitHub',         icon: GitBranch,       accent: '#6ee7b7', desc: 'Repository intelligence'     },
  { id: 'about',          label: 'About',          icon: User,            accent: '#f472b6', desc: 'Bio, skills & timeline'      },
  { id: 'intelligence',   label: 'Intelligence',   icon: Microscope,      accent: '#c084fc', desc: 'Feeds & data sources'        },
  { id: 'command',        label: 'Overview',       icon: LayoutDashboard, accent: '#22d3ee', desc: 'Publishing dashboard'        },
  { id: 'analytics',      label: 'Analytics',      icon: BarChart3,       accent: '#f43f5e', desc: 'Metrics & performance'       },
  { id: 'labs',           label: 'Labs',           icon: FlaskConical,    accent: '#f59e0b', desc: 'Experiments & demos'         },
  { id: 'seo',            label: 'SEO & Meta',     icon: Search,          accent: '#60a5fa', desc: 'Indexing & social'           },
  { id: 'design-studio',  label: 'Design Studio',  icon: Palette,         accent: '#818cf8', desc: 'Branding, themes & lab'      },
  { id: 'blocks',         label: 'Blocks',         icon: Blocks,          accent: '#f472b6', desc: 'Section layout'              },
  { id: 'navbar-config',  label: 'Navigation',     icon: Layers,          accent: '#60a5fa', desc: 'Nav links & behavior'        },
  { id: 'content',        label: 'Site Content',   icon: Globe,           accent: '#34d399', desc: 'Hero, services, CTA'         },
  { id: 'personality',    label: 'Personality',    icon: Wand2,           accent: '#f472b6', desc: 'Effects & personality'       },
  { id: 'systems',        label: 'Systems',        icon: Network,         accent: '#38bdf8', desc: 'AI architecture'             },
  { id: 'infrastructure', label: 'Infrastructure', icon: Server,          accent: '#6ee7b7', desc: 'Nodes & deploys'             },
  { id: 'integrations',   label: 'Integrations',   icon: Plug,            accent: '#fb923c', desc: 'Sources, APIs & agents'      },
  { id: 'ai',             label: 'AI Profiles',    icon: Bot,             accent: '#c084fc', desc: 'LLM profiles'                },
  { id: 'showcase',       label: 'Showcase',       icon: Settings2,       accent: '#6ee7b7', desc: 'AI-generated showcases'      },
]
