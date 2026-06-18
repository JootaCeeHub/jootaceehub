'use client'

import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { useAdmin } from '@/lib/admin/store'
import type { AdminPanel, AdminState } from '@/lib/admin/types'
import { cn } from '@/lib/utils'
import {
  Search, X, ArrowRight, Zap, FolderOpen, BookOpen, GitBranch, User, Microscope,
  LayoutDashboard, BarChart3, FlaskConical, Globe, Palette, Wand2, Layers, Blocks,
  Network, Server, Plug, Bot, Settings2, Search as SearchIcon, HardDrive, Cpu,
  FileText, Tag, Package, ChevronRight, SlidersHorizontal,
} from 'lucide-react'

// ─── Search Index ─────────────────────────────────────────────────────────────

interface SearchResult {
  id:       string
  title:    string
  subtitle: string
  snippet:  string
  panel:    AdminPanel
  category: string
  accent:   string
  // reason: icon components here must accept style for colored rendering
  icon:     React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  score:    number
}

// reason: icon components need style prop for accent color rendering
type IconComp = React.ComponentType<{ className?: string; style?: React.CSSProperties }>
const PANEL_META: Record<string, { label: string; accent: string; icon: IconComp }> = {
  command:        { label: 'Overview',       accent: '#22d3ee', icon: LayoutDashboard },
  intake:         { label: 'New Entry',      accent: '#22d3ee', icon: Zap            },
  projects:       { label: 'Projects',       accent: '#a78bfa', icon: FolderOpen     },
  research:       { label: 'Research',       accent: '#34d399', icon: BookOpen       },
  github:         { label: 'GitHub',         accent: '#6ee7b7', icon: GitBranch      },
  about:          { label: 'About',          accent: '#f472b6', icon: User           },
  intelligence:   { label: 'Intelligence',   accent: '#c084fc', icon: Microscope     },
  analytics:      { label: 'Analytics',      accent: '#f43f5e', icon: BarChart3      },
  labs:           { label: 'Labs',           accent: '#f59e0b', icon: FlaskConical   },
  seo:            { label: 'SEO & Meta',     accent: '#60a5fa', icon: SearchIcon     },
  'design-studio':{ label: 'Design Studio',  accent: '#818cf8', icon: Palette        },
  blocks:         { label: 'Blocks',         accent: '#f472b6', icon: Blocks         },
  'navbar-config':{ label: 'Navigation',     accent: '#60a5fa', icon: Layers         },
  content:        { label: 'Site Content',   accent: '#34d399', icon: Globe          },
  personality:    { label: 'Personality',    accent: '#f472b6', icon: Wand2          },
  systems:        { label: 'Systems',        accent: '#38bdf8', icon: Network        },
  infrastructure: { label: 'Infrastructure', accent: '#6ee7b7', icon: Server         },
  integrations:   { label: 'Integrations',   accent: '#fb923c', icon: Plug           },
  ai:             { label: 'AI Profiles',    accent: '#c084fc', icon: Bot            },
  showcase:       { label: 'Showcase',       accent: '#6ee7b7', icon: Settings2      },
  studio:         { label: 'Studio Config',  accent: '#a78bfa', icon: SlidersHorizontal },
}

function score(text: string, query: string): number {
  if (!text || !query) return 0
  const t = text.toLowerCase()
  const q = query.toLowerCase()
  if (t === q) return 100
  if (t.startsWith(q)) return 80
  if (t.includes(q)) return 60
  const words = q.split(/\s+/).filter(Boolean)
  const matchCount = words.filter(w => t.includes(w)).length
  return matchCount > 0 ? (matchCount / words.length) * 40 : 0
}

function buildIndex(state: AdminState, query: string): SearchResult[] {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []
  const results: SearchResult[] = []

  const push = (
    id: string,
    title: string,
    subtitle: string,
    snippet: string,
    panel: AdminPanel,
    category: string,
    extraScore = 0
  ) => {
    const s = Math.max(score(title, q), score(subtitle, q), score(snippet, q) * 0.6) + extraScore
    if (s > 0) {
      const meta = PANEL_META[panel] ?? PANEL_META['command']
      results.push({ id, title, subtitle, snippet, panel, category, accent: meta.accent, icon: meta.icon, score: s })
    }
  }

  // ── Panels themselves ──
  Object.entries(PANEL_META).forEach(([id, m]) => {
    push(`panel:${id}`, m.label, 'Panel', `Navigate to ${m.label}`, id as AdminPanel, 'Panels', 10)
  })

  // ── Systems ──
  state.systemsRegistry.forEach(s => {
    push(`sys:${s.key}`, s.name, `System · ${s.status}`, s.description, 'systems', 'Systems')
  })

  // ── Labs ──
  state.labsRegistry.forEach(l => {
    push(`lab:${l.key}`, l.name, `Lab · ${l.status}`, l.tagline, 'labs', 'Labs')
  })

  // ── Projects ──
  state.projectsRegistry.forEach(p => {
    push(`proj:${p.id}`, p.title, `Project · ${p.category}`, p.tagline || p.description, 'projects', 'Projects')
  })

  // ── Research ──
  state.researchRegistry.forEach(r => {
    push(`res:${r.slug}`, r.title, `Research · ${r.category}`, r.excerpt, 'research', 'Research')
  })

  // ── MCP Registry ──
  ;(state.mcpRegistry ?? []).forEach((m: { name: string; cat: string; install?: string }) => {
    push(`mcp:${m.name}`, m.name, `MCP · ${m.cat}`, m.install ?? '', 'integrations', 'MCP Tools')
  })

  // ── Agent Registry ──
  ;(state.agentRegistry ?? []).forEach(a => {
    push(`agent:${a.id}`, a.title, `Agent · ${a.stack.join(', ')}`, a.stack.join(' '), 'integrations', 'Agents')
  })

  // ── Tool Registry ──
  ;(state.toolRegistry ?? []).forEach(t => {
    push(`tool:${t.id}`, t.name, `Tool · ${t.subCat}`, `${t.subCat} ${t.pricing}`, 'integrations', 'Tools')
  })

  // ── Capabilities ──
  ;(state.capabilities?.skills ?? []).forEach(sk => {
    push(`skill:${sk.id}`, sk.name, `${sk.type} · ${sk.source}`, sk.description, 'integrations', 'Skills')
  })

  // ── Infrastructure nodes ──
  ;(state.infraConfig?.nodes ?? []).forEach(n => {
    push(`node:${n.name}`, n.name, `Node · ${n.role}`, `${n.status} · ${n.image}`, 'infrastructure', 'Infrastructure')
  })

  // ── Repo registry ──
  ;(state.repoRegistry ?? []).forEach(r => {
    push(`repo:${r.id}`, r.name, `Repo · ${r.lang}`, `${r.org} · ${r.cat}`, 'github', 'Repos')
  })

  // ── Site content ──
  push('content:hero-title',    state.content.hero.title,    'Hero · title',    state.content.hero.subtitle,         'content',  'Site Content')
  push('content:hero-eyebrow',  state.content.hero.eyebrow,  'Hero · eyebrow',  state.content.hero.title,            'content',  'Site Content')
  state.content.services.forEach((s, i) => {
    push(`content:service:${i}`, s.title, 'Service', s.description, 'content', 'Site Content')
  })
  state.content.stats.forEach((s, i) => {
    push(`content:stat:${i}`, s.label, `Stat · ${s.value}`, s.value, 'content', 'Site Content')
  })

  // ── SEO ──
  push('seo:title',       state.seo.defaultTitle,       'SEO · title',       state.seo.defaultDescription, 'seo', 'SEO')
  push('seo:description', state.seo.defaultDescription, 'SEO · description', state.seo.defaultTitle,       'seo', 'SEO')
  push('seo:canonical',   state.seo.canonicalBase,       'SEO · canonical',   '',                           'seo', 'SEO')
  push('seo:twitter',     state.seo.twitterHandle,       'SEO · twitter',     '',                           'seo', 'SEO')

  // ── About ──
  push('about:headline', state.aboutConfig.headline, 'About · headline', state.aboutConfig.bio, 'about', 'About')
  push('about:bio',      state.aboutConfig.bio,      'About · bio',      state.aboutConfig.headline, 'about', 'About')
  state.aboutConfig.skills.forEach(sk => {
    push(`about:skill:${sk}`, sk, 'About · skill', 'Technical skill', 'about', 'About')
  })

  // ── Site ──
  push('site:name',  state.site.name,  'Site · name',  state.site.description, 'command', 'Site')
  push('site:url',   state.site.url,   'Site · URL',   state.site.url,         'command', 'Site')
  push('site:focus', state.site.businessFocus, 'Site · focus', state.site.description, 'command', 'Site')

  // ── Workflows ──
  ;(state.workflowRegistry ?? []).forEach(w => {
    push(`wf:${w.id}`, w.title, `Workflow · ${w.type}`, `${w.type} · ${w.complexity}`, 'integrations', 'Workflows')
  })

  // ── Prompts ──
  ;(state.promptRegistry ?? []).forEach(p => {
    push(`prompt:${p.id}`, p.title, `Prompt · ${p.cat}`, p.models.join(' '), 'ai', 'Prompts')
  })

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, 60)
}

// ─── Component ────────────────────────────────────────────────────────────────

const CATEGORY_ORDER = ['Panels', 'Systems', 'Labs', 'Projects', 'Research', 'Site Content', 'SEO', 'About', 'Agents', 'MCP Tools', 'Tools', 'Skills', 'Infrastructure', 'Repos', 'Workflows', 'Prompts', 'Site']

export default function SearchPanel() {
  const { state, dispatch } = useAdmin()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const [selected, setSelected] = useState(0)

  useEffect(() => { inputRef.current?.focus() }, [])

  const results = useMemo(() => buildIndex(state, query), [state, query])

  const grouped = useMemo(() => {
    const map: Record<string, SearchResult[]> = {}
    results.forEach(r => {
      if (!map[r.category]) map[r.category] = []
      map[r.category].push(r)
    })
    return CATEGORY_ORDER.filter(c => map[c]).map(c => ({ label: c, items: map[c] }))
  }, [results])

  const flat = useMemo(() => grouped.flatMap(g => g.items), [grouped])

  const navigate = useCallback((panel: AdminPanel) => {
    dispatch({ type: 'SET_PANEL', payload: panel })
  }, [dispatch])

  useEffect(() => { setSelected(0) }, [query]) // eslint-disable-line react-hooks/set-state-in-effect

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, flat.length - 1)) }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)) }
      if (e.key === 'Enter' && flat[selected]) navigate(flat[selected].panel)
      if (e.key === 'Escape') { setQuery(''); inputRef.current?.focus() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [flat, selected, navigate])

  let globalIdx = 0

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.18em] text-white/70">Command Search</h2>
        <p className="mt-0.5 text-[10px] text-white/30">Search across all panels, content, registries, settings and more</p>
      </div>

      {/* Search input */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Type to search anything in Command Center…"
          className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-10 pr-10 font-mono text-sm text-white placeholder:text-white/20 focus:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/20 transition-all"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Keyboard hint */}
      <div className="flex items-center gap-3 text-[9px] uppercase tracking-widest text-white/20">
        <span className="flex items-center gap-1"><kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-white/30">↑↓</kbd> Navigate</span>
        <span className="flex items-center gap-1"><kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-white/30">↵</kbd> Open panel</span>
        <span className="flex items-center gap-1"><kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-white/30">Esc</kbd> Clear</span>
        <span className="ml-auto">{results.length > 0 ? `${results.length} result${results.length !== 1 ? 's' : ''}` : query.length >= 2 ? 'No results' : 'Start typing…'}</span>
      </div>

      {/* Results */}
      {query.length >= 2 && grouped.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <SearchIcon className="h-8 w-8 text-white/10" />
          <p className="text-[11px] text-white/30">No results for <span className="text-white/50">&quot;{query}&quot;</span></p>
          <p className="text-[10px] text-white/18">Try different keywords or browse panels from the sidebar</p>
        </div>
      )}

      {grouped.map(group => (
        <div key={group.label}>
          <div className="mb-1.5 flex items-center gap-2 px-1">
            <span className="text-[8.5px] font-semibold uppercase tracking-[0.2em] text-white/22">{group.label}</span>
            <div className="flex-1 border-t border-white/6" />
            <span className="text-[8.5px] text-white/18">{group.items.length}</span>
          </div>
          <div className="space-y-0.5">
            {group.items.map(item => {
              const idx = globalIdx++
              const isSelected = idx === selected
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.panel)}
                  onMouseEnter={() => setSelected(idx)}
                  className={cn(
                    'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all',
                    isSelected ? 'bg-white/[0.07] ring-1 ring-inset ring-white/8' : 'hover:bg-white/[0.04]'
                  )}
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border"
                    style={{ borderColor: `${item.accent}30`, backgroundColor: `${item.accent}12` }}>
                    <Icon className="h-3.5 w-3.5" style={{ color: item.accent }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[11px] font-medium text-white/80 leading-none">{item.title}</span>
                      <span className="text-[9px] text-white/25">{item.subtitle}</span>
                    </div>
                    {item.snippet && (
                      <p className="mt-0.5 truncate text-[9.5px] text-white/30 leading-none">{item.snippet}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                    style={{ color: item.accent }}>
                    <span className="text-[9px] uppercase tracking-widest opacity-60">
                      {PANEL_META[item.panel]?.label ?? item.panel}
                    </span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* Empty state (no query) */}
      {!query && (
        <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-3">
          {[
            { label: 'Systems',   count: state.systemsRegistry.length,       panel: 'systems'   as AdminPanel, accent: '#38bdf8', icon: Network    },
            { label: 'Labs',      count: state.labsRegistry.length,           panel: 'labs'      as AdminPanel, accent: '#f59e0b', icon: FlaskConical },
            { label: 'Projects',  count: state.projectsRegistry.length,       panel: 'projects'  as AdminPanel, accent: '#a78bfa', icon: FolderOpen  },
            { label: 'Research',  count: state.researchRegistry.length,       panel: 'research'  as AdminPanel, accent: '#34d399', icon: BookOpen    },
            { label: 'MCP Tools', count: (state.mcpRegistry ?? []).length,    panel: 'integrations' as AdminPanel, accent: '#fb923c', icon: Package  },
            { label: 'Agents',    count: (state.agentRegistry ?? []).length,  panel: 'integrations' as AdminPanel, accent: '#c084fc', icon: Cpu      },
          ].map(({ label, count, panel, accent, icon: Icon }) => (
            <button key={label} onClick={() => navigate(panel)}
              className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/[0.025] px-4 py-3 text-left transition-all hover:bg-white/[0.05] hover:border-white/12">
              <Icon className="h-4 w-4 shrink-0" style={{ color: accent }} />
              <div>
                <div className="text-[11px] font-medium text-white/70">{label}</div>
                <div className="text-[9.5px] text-white/30">{count} items</div>
              </div>
              <ChevronRight className="ml-auto h-3.5 w-3.5 text-white/20" />
            </button>
          ))}
        </div>
      )}

      {/* Tags cloud for empty state */}
      {!query && (
        <div className="pt-1">
          <p className="mb-2 text-[8.5px] uppercase tracking-[0.2em] text-white/18">Recent categories</p>
          <div className="flex flex-wrap gap-1.5">
            {['AI systems', 'MCP', 'GraphRAG', 'Agents', 'Automation', 'Labs', 'Trading AI', 'AURA', 'Infrastructure', 'GitHub', 'SEO', 'Design', 'Analytics', 'Studio'].map(tag => (
              <button key={tag} onClick={() => setQuery(tag)}
                className="inline-flex items-center gap-1 rounded-full border border-white/8 bg-white/[0.025] px-2.5 py-1 text-[9.5px] text-white/35 transition-all hover:border-white/15 hover:text-white/55">
                <Tag className="h-2.5 w-2.5" />
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
