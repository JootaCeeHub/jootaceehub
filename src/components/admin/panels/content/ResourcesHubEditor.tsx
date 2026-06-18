'use client'

import { useState } from 'react'
import { ExternalLink, Pencil, ChevronDown, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdmin } from '@/lib/admin/store'
import {
  RESOURCE_CATEGORIES,
} from '@/lib/resources/registry'
import type { RCatKey } from '@/lib/resources/registry'
import type {
  CuratedLink, TrackedSource, TrackedSourceType,
  ResourceToolItem, ResourceRepoItem, ResourceWorkItem,
  ResourcePromptItem, ResourceMcpItem, ResourceAgentItem, ResourceSkillItem,
} from '@/lib/admin/types'
import {
  inp, area, F, Tog,
  LINK_CAT_COL, SOURCE_TYPE_COL, LANG_COL,
} from './primitives'

// ─── Constants ─────────────────────────────────────────────────────────────────

export const PRICING_COL: Record<string, string> = {
  Free: '#34d399', OSS: '#34d399', Freemium: '#fbbf24', Paid: '#f87171',
}
export const WORKFLOW_COL: Record<string, string> = { cicd: '#60a5fa', n8n: '#a78bfa', ai: '#f472b6' }
export const COMPLEXITY_COL: Record<string, string> = { Low: '#34d399', Medium: '#fbbf24', High: '#f87171' }

// ─── Resources editor — website categories + CMS tools ────────────────────────

export function ResourcesEditor() {
  const { state, dispatch } = useAdmin()
  const [mainTab, setMainTab] = useState<'website' | 'links' | 'drive' | 'sources'>('website')
  const [catKey,  setCatKey]  = useState<RCatKey>('tools')
  const [subFilter, setSubFilter] = useState<string>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [copiedInstall, setCopiedInstall] = useState<string | null>(null)
  const links   = state.curatedLinks ?? []
  const drive   = state.driveResources ?? []
  const sources = state.trackedSources ?? []

  const activeCat = RESOURCE_CATEGORIES.find(c => c.key === catKey)!

  const setLinks = (payload: CuratedLink[]) => dispatch({ type: 'SET_CURATED_LINKS', payload })
  const updLink  = (id: string, data: Partial<CuratedLink>) =>
    setLinks(links.map(l => l.id === id ? { ...l, ...data } : l))
  const remLink  = (id: string) => setLinks(links.filter(l => l.id !== id))
  const addLink  = () => setLinks([...links, {
    id: crypto.randomUUID(), url: 'https://', title: 'Nuevo recurso',
    description: '', category: 'tools', tags: [], domain: '',
    published: false, featured: false, addedAt: new Date().toISOString(),
  }])

  const updSource = (id: string, data: Partial<TrackedSource>) =>
    dispatch({ type: 'UPDATE_TRACKED_SOURCE', payload: { id, data } })
  const remSource = (id: string) =>
    dispatch({ type: 'SET_TRACKED_SOURCES', payload: sources.filter(s => s.id !== id) })
  const addSource = () => dispatch({
    type: 'ADD_TRACKED_SOURCE',
    payload: {
      id: crypto.randomUUID(), name: 'Nueva fuente', url: 'https://',
      sourceType: 'blog', description: '', active: true, addedAt: new Date().toISOString(),
    },
  })

  const copyInstall = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedInstall(text)
      setTimeout(() => setCopiedInstall(null), 1500)
    })
  }

  return (
    <div className="space-y-3">
      {/* Main tabs */}
      <div className="flex flex-wrap gap-1">
        {([
          { id: 'website', label: 'Website Resources' },
          { id: 'links',   label: `Links (${links.length})` },
          { id: 'drive',   label: `Drive (${drive.length})` },
          { id: 'sources', label: `Fuentes (${sources.length})` },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setMainTab(t.id)}
            className={cn('rounded-lg border px-2.5 py-1 text-[10px] font-medium transition-all',
              mainTab === t.id ? 'border-white/15 bg-white/8 text-white/70' : 'border-white/6 text-white/30 hover:text-white/60')}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Website Resources — full CRUD ── */}
      {mainTab === 'website' && (() => {
        const tools     = state.toolRegistry     ?? []
        const repos     = state.repoRegistry     ?? []
        const workflows = state.workflowRegistry ?? []
        const prompts   = state.promptRegistry   ?? []
        const mcps      = state.mcpRegistry      ?? []
        const agents    = state.agentRegistry    ?? []
        const skills    = state.skillRegistry    ?? []

        const countMap: Record<RCatKey, number> = {
          tools: tools.length, repos: repos.length, workflows: workflows.length,
          prompts: prompts.length, mcp: mcps.length, agents: agents.length, skills: skills.length,
        }

        // Per-category setters (replace whole array — simplest, sufficient)
        const setTools     = (p: ResourceToolItem[])   => dispatch({ type: 'SET_TOOL_REGISTRY',     payload: p })
        const setRepos     = (p: ResourceRepoItem[])   => dispatch({ type: 'SET_REPO_REGISTRY',     payload: p })
        const setWorkflows = (p: ResourceWorkItem[])   => dispatch({ type: 'SET_WORKFLOW_REGISTRY', payload: p })
        const setPrompts   = (p: ResourcePromptItem[]) => dispatch({ type: 'SET_PROMPT_REGISTRY',   payload: p })
        const setMcps      = (p: ResourceMcpItem[])    => dispatch({ type: 'SET_MCP_REGISTRY',      payload: p })
        const setAgents    = (p: ResourceAgentItem[])  => dispatch({ type: 'SET_AGENT_REGISTRY',    payload: p })
        const setSkills    = (p: ResourceSkillItem[])  => dispatch({ type: 'SET_SKILL_REGISTRY',    payload: p })

        // Item-level helpers
        const updTool  = (id: string, d: Partial<ResourceToolItem>)   => setTools(tools.map(i => i.id === id ? { ...i, ...d } : i))
        const updRepo  = (id: string, d: Partial<ResourceRepoItem>)   => setRepos(repos.map(i => i.id === id ? { ...i, ...d } : i))
        const updWork  = (id: string, d: Partial<ResourceWorkItem>)   => setWorkflows(workflows.map(i => i.id === id ? { ...i, ...d } : i))
        const updPr    = (id: string, d: Partial<ResourcePromptItem>) => setPrompts(prompts.map(i => i.id === id ? { ...i, ...d } : i))
        const updMcp   = (id: string, d: Partial<ResourceMcpItem>)    => setMcps(mcps.map(i => i.id === id ? { ...i, ...d } : i))
        const updAgent = (id: string, d: Partial<ResourceAgentItem>)  => setAgents(agents.map(i => i.id === id ? { ...i, ...d } : i))
        const updSkill = (id: string, d: Partial<ResourceSkillItem>)  => setSkills(skills.map(i => i.id === id ? { ...i, ...d } : i))

        const addTool  = () => setTools([...tools, { id: `tool-${Date.now()}`, name: 'New Tool', subCat: 'AI & LLM', url: 'https://', pricing: 'Free' }])
        const addRepo  = () => setRepos([...repos, { id: `repo-${Date.now()}`, org: 'owner', name: 'repo', lang: 'TypeScript', stars: '0', url: 'https://github.com/', cat: 'TypeScript' }])
        const addWork  = () => setWorkflows([...workflows, { id: `wf-${Date.now()}`, title: 'New Workflow', type: 'cicd', complexity: 'Low' }])
        const addPr    = () => setPrompts([...prompts, { id: `pr-${Date.now()}`, title: 'New Prompt', cat: 'System', models: [] }])
        const addMcp   = () => setMcps([...mcps, { id: `mcp-${Date.now()}`, name: 'new-server', cat: 'official', install: 'npx ', toolCount: 0 }])
        const addAgent = () => setAgents([...agents, { id: `agent-${Date.now()}`, title: 'New Agent Pattern', stack: [] }])
        const addSkill = () => setSkills([...skills, { id: `skill-${Date.now()}`, command: '/new-skill', title: 'New Skill', builtin: false }])

        // Item row component (inline)
        const ItemRow = ({ id, children, url, onRemove }: { id: string; children: React.ReactNode; url?: string; onRemove: () => void }) => (
          <div className={cn('rounded-xl border overflow-hidden transition-all',
            expanded === id ? 'border-white/15 bg-white/[0.03]' : 'border-white/8 bg-white/[0.015]')}>
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="flex-1 min-w-0">{children}</div>
              <div className="flex items-center gap-1 shrink-0">
                {url && (
                  <a href={url} target="_blank" rel="noopener noreferrer"
                    className="rounded p-1 text-white/20 hover:text-cyan-400/70 transition-colors">
                    <ExternalLink size={10} />
                  </a>
                )}
                <button onClick={() => setExpanded(expanded === id ? null : id)}
                  className={cn('rounded p-1 transition-colors', expanded === id ? 'text-cyan-400/70' : 'text-white/30 hover:text-white/60')}>
                  <Pencil size={10} />
                </button>
                <button onClick={onRemove} className="rounded p-1 text-white/15 hover:text-red-400 transition-colors">
                  <Trash2 size={10} />
                </button>
              </div>
            </div>
          </div>
        )

        type Filterable = { subCat?: string; cat?: string; type?: string; builtin?: boolean }
        const subCatFilter = <T extends Filterable>(items: T[]) =>
          subFilter === 'all' ? items : items.filter(i =>
            i.subCat === subFilter || i.cat === subFilter || i.type === subFilter.toLowerCase() ||
            (subFilter === 'Built-in Skills' && i.builtin) || (subFilter === 'Custom Skills' && !i.builtin)
          )
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subCatFilterAny = (items: any[]) => subCatFilter(items as Filterable[]) as typeof items

        return (
          <div className="space-y-3">
            {/* Category selector */}
            <div className="grid grid-cols-2 gap-1.5">
              {RESOURCE_CATEGORIES.map(cat => (
                <button key={cat.key} onClick={() => { setCatKey(cat.key); setSubFilter('all'); setExpanded(null) }}
                  className={cn('rounded-xl border px-3 py-2 text-left transition-all',
                    catKey === cat.key ? 'border-white/20 bg-white/[0.05]' : 'border-white/8 bg-white/[0.015] hover:border-white/15')}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium text-white/75">{cat.label}</span>
                    <span className="font-mono text-[8px] rounded-full px-1.5 py-0.5 border"
                      style={{ color: cat.accent, borderColor: `${cat.accent}30`, background: `${cat.accent}15` }}>
                      {countMap[cat.key]}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[9px] text-white/30 truncate">{cat.description.slice(0, 52)}…</div>
                </button>
              ))}
            </div>

            {/* Active category */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/8 px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ background: activeCat.accent }} />
                  <span className="text-[11px] font-medium text-white/75">{activeCat.label}</span>
                  <span className="font-mono text-[8px] text-white/30">{countMap[catKey]} items</span>
                </div>
                <a href={activeCat.path} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded border border-white/10 px-2 py-0.5 text-[9px] text-white/35 hover:text-white/65 hover:border-white/20 transition-all">
                  <ExternalLink size={8} /> Ver en web
                </a>
              </div>

              {/* Sub-category filter */}
              <div className="flex flex-wrap gap-1 border-b border-white/6 px-3 py-2">
                {['all', ...activeCat.subCategories].map(sc => (
                  <button key={sc} onClick={() => setSubFilter(sc)}
                    className={cn('rounded px-2 py-0.5 text-[9px] transition-all font-medium',
                      subFilter === sc ? 'bg-white/10 text-white/70' : 'text-white/25 hover:text-white/50')}>
                    {sc}
                  </button>
                ))}
              </div>

              {/* Item list */}
              <div className="max-h-96 overflow-y-auto divide-y divide-white/5">

                {/* ── Tools ── */}
                {catKey === 'tools' && subCatFilter(tools).map((i) => {
                  const t = i as ResourceToolItem
                  const pc = PRICING_COL[t.pricing] ?? '#94a3b8'
                  return (
                    <div key={t.id} className="overflow-hidden">
                      <ItemRow id={t.id} url={t.url} onRemove={() => setTools(tools.filter(x => x.id !== t.id))}>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-white/75 truncate">{t.name}</span>
                          <span className="font-mono text-[8px] text-white/30">{t.subCat}</span>
                          <span className="font-mono text-[7px] rounded px-1.5 py-0.5 border shrink-0"
                            style={{ color: pc, borderColor: `${pc}30`, background: `${pc}10` }}>{t.pricing}</span>
                        </div>
                        <div className="font-mono text-[9px] text-white/25 truncate mt-0.5">{t.url}</div>
                      </ItemRow>
                      {expanded === t.id && (
                        <div className="border-t border-white/6 px-3 py-3 space-y-2 bg-white/[0.015]">
                          <div className="grid grid-cols-2 gap-2">
                            <F l="Nombre"><input className={inp} value={t.name} onChange={e => updTool(t.id, { name: e.target.value })} /></F>
                            <F l="Sub-categoría">
                              <select className={cn(inp, 'cursor-pointer')} value={t.subCat}
                                onChange={e => updTool(t.id, { subCat: e.target.value })}>
                                {activeCat.subCategories.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </F>
                          </div>
                          <F l="URL"><input className={inp} value={t.url} onChange={e => updTool(t.id, { url: e.target.value })} /></F>
                          <F l="Pricing">
                            <select className={cn(inp, 'cursor-pointer')} value={t.pricing}
                              onChange={e => updTool(t.id, { pricing: e.target.value })}>
                              {['Free', 'OSS', 'Freemium', 'Paid'].map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                          </F>
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* ── Repos ── */}
                {catKey === 'repos' && subCatFilter(repos).map((i) => {
                  const r = i as ResourceRepoItem
                  const lc = LANG_COL[r.lang.toLowerCase()] ?? '#94a3b8'
                  return (
                    <div key={r.id} className="overflow-hidden">
                      <ItemRow id={r.id} url={r.url} onRemove={() => setRepos(repos.filter(x => x.id !== r.id))}>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[9px] text-white/35">{r.org}/</span>
                          <span className="text-[11px] text-white/75">{r.name}</span>
                          <span className="font-mono text-[7px] rounded px-1.5 py-0.5 border shrink-0"
                            style={{ color: lc, borderColor: `${lc}30`, background: `${lc}10` }}>{r.lang}</span>
                          <span className="font-mono text-[8px] text-white/30 shrink-0">★ {r.stars}</span>
                        </div>
                      </ItemRow>
                      {expanded === r.id && (
                        <div className="border-t border-white/6 px-3 py-3 space-y-2 bg-white/[0.015]">
                          <div className="grid grid-cols-2 gap-2">
                            <F l="Organización"><input className={inp} value={r.org} onChange={e => updRepo(r.id, { org: e.target.value })} /></F>
                            <F l="Nombre del repo"><input className={inp} value={r.name} onChange={e => updRepo(r.id, { name: e.target.value })} /></F>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <F l="Lenguaje"><input className={inp} value={r.lang} onChange={e => updRepo(r.id, { lang: e.target.value })} /></F>
                            <F l="Stars"><input className={inp} value={r.stars} placeholder="10k" onChange={e => updRepo(r.id, { stars: e.target.value })} /></F>
                          </div>
                          <F l="URL"><input className={inp} value={r.url} onChange={e => updRepo(r.id, { url: e.target.value })} /></F>
                          <F l="Categoría">
                            <select className={cn(inp, 'cursor-pointer')} value={r.cat}
                              onChange={e => updRepo(r.id, { cat: e.target.value })}>
                              {activeCat.subCategories.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </F>
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* ── Workflows ── */}
                {catKey === 'workflows' && subCatFilter(workflows).map((i) => {
                  const w = i as ResourceWorkItem
                  const tc = WORKFLOW_COL[w.type] ?? '#94a3b8'
                  const cc = COMPLEXITY_COL[w.complexity] ?? '#94a3b8'
                  return (
                    <div key={w.id} className="overflow-hidden">
                      <ItemRow id={w.id} onRemove={() => setWorkflows(workflows.filter(x => x.id !== w.id))}>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-white/70 truncate">{w.title}</span>
                          <span className="font-mono text-[7px] rounded px-1.5 py-0.5 border shrink-0"
                            style={{ color: tc, borderColor: `${tc}30`, background: `${tc}10` }}>{w.type}</span>
                          <span className="font-mono text-[7px] rounded px-1.5 py-0.5 border shrink-0"
                            style={{ color: cc, borderColor: `${cc}30`, background: `${cc}10` }}>{w.complexity}</span>
                        </div>
                      </ItemRow>
                      {expanded === w.id && (
                        <div className="border-t border-white/6 px-3 py-3 space-y-2 bg-white/[0.015]">
                          <F l="Título"><input className={inp} value={w.title} onChange={e => updWork(w.id, { title: e.target.value })} /></F>
                          <div className="grid grid-cols-2 gap-2">
                            <F l="Tipo">
                              <select className={cn(inp, 'cursor-pointer')} value={w.type}
                                onChange={e => updWork(w.id, { type: e.target.value as ResourceWorkItem['type'] })}>
                                <option value="cicd">CI/CD</option><option value="n8n">n8n</option><option value="ai">AI</option>
                              </select>
                            </F>
                            <F l="Complejidad">
                              <select className={cn(inp, 'cursor-pointer')} value={w.complexity}
                                onChange={e => updWork(w.id, { complexity: e.target.value as ResourceWorkItem['complexity'] })}>
                                <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option>
                              </select>
                            </F>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* ── Prompts ── */}
                {catKey === 'prompts' && subCatFilter(prompts).map((i) => {
                  const p = i as ResourcePromptItem
                  return (
                    <div key={p.id} className="overflow-hidden">
                      <ItemRow id={p.id} onRemove={() => setPrompts(prompts.filter(x => x.id !== p.id))}>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-white/70 truncate">{p.title}</span>
                          <span className="font-mono text-[7px] rounded px-1.5 py-0.5 border border-amber-400/25 bg-amber-400/10 text-amber-400/70 shrink-0">{p.cat}</span>
                          <span className="font-mono text-[8px] text-white/30 shrink-0">{p.models.length} models</span>
                        </div>
                      </ItemRow>
                      {expanded === p.id && (
                        <div className="border-t border-white/6 px-3 py-3 space-y-2 bg-white/[0.015]">
                          <F l="Título"><input className={inp} value={p.title} onChange={e => updPr(p.id, { title: e.target.value })} /></F>
                          <F l="Categoría">
                            <select className={cn(inp, 'cursor-pointer')} value={p.cat}
                              onChange={e => updPr(p.id, { cat: e.target.value })}>
                              {activeCat.subCategories.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </F>
                          <F l="Modelos compatibles (coma)">
                            <input className={inp} value={p.models.join(', ')}
                              onChange={e => updPr(p.id, { models: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
                          </F>
                          {p.models.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {p.models.map(m => (
                                <span key={m} className="font-mono text-[7px] rounded px-1.5 py-0.5 border border-amber-400/20 bg-amber-400/8 text-amber-400/60">{m}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* ── MCP ── */}
                {catKey === 'mcp' && subCatFilter(mcps).map((i) => {
                  const m = i as ResourceMcpItem
                  return (
                    <div key={m.id} className="overflow-hidden">
                      <ItemRow id={m.id} onRemove={() => setMcps(mcps.filter(x => x.id !== m.id))}>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] text-cyan-400/75">{m.name}</span>
                          <span className="font-mono text-[8px] text-white/30">{m.cat}</span>
                          <span className="font-mono text-[8px] text-white/25 shrink-0">{m.toolCount} tools</span>
                        </div>
                        <div className="font-mono text-[8px] text-white/20 truncate mt-0.5">{m.install}</div>
                      </ItemRow>
                      {expanded === m.id && (
                        <div className="border-t border-white/6 px-3 py-3 space-y-2 bg-white/[0.015]">
                          <div className="grid grid-cols-2 gap-2">
                            <F l="Nombre"><input className={inp} value={m.name} onChange={e => updMcp(m.id, { name: e.target.value })} /></F>
                            <F l="Categoría">
                              <select className={cn(inp, 'cursor-pointer')} value={m.cat}
                                onChange={e => updMcp(m.id, { cat: e.target.value })}>
                                {activeCat.subCategories.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </F>
                          </div>
                          <F l="Comando de instalación">
                            <div className="flex gap-2">
                              <input className={cn(inp, 'font-mono flex-1')} value={m.install} onChange={e => updMcp(m.id, { install: e.target.value })} />
                              <button onClick={() => copyInstall(m.install)}
                                className="rounded border border-cyan-400/20 bg-cyan-400/8 px-2 py-1 font-mono text-[8px] text-cyan-400/70 hover:text-cyan-400 transition-all shrink-0">
                                {copiedInstall === m.install ? '✓' : 'copy'}
                              </button>
                            </div>
                          </F>
                          <F l="Número de tools">
                            <input type="number" className={inp} value={m.toolCount} min={0}
                              onChange={e => updMcp(m.id, { toolCount: parseInt(e.target.value) || 0 })} />
                          </F>
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* ── Agents ── */}
                {catKey === 'agents' && subCatFilterAny(agents).map((i) => {
                  const a = i as ResourceAgentItem
                  return (
                    <div key={a.id} className="overflow-hidden">
                      <ItemRow id={a.id} onRemove={() => setAgents(agents.filter(x => x.id !== a.id))}>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] text-white/70">{a.title}</span>
                          {a.stack.slice(0, 2).map(s => (
                            <span key={s} className="font-mono text-[7px] rounded px-1 py-0.5 border border-pink-400/20 bg-pink-400/8 text-pink-400/60 truncate max-w-[80px]">{s}</span>
                          ))}
                          {a.stack.length > 2 && <span className="font-mono text-[7px] text-white/25">+{a.stack.length - 2}</span>}
                        </div>
                      </ItemRow>
                      {expanded === a.id && (
                        <div className="border-t border-white/6 px-3 py-3 space-y-2 bg-white/[0.015]">
                          <F l="Título"><input className={inp} value={a.title} onChange={e => updAgent(a.id, { title: e.target.value })} /></F>
                          <F l="Stack (coma)">
                            <input className={inp} value={a.stack.join(', ')}
                              onChange={e => updAgent(a.id, { stack: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
                          </F>
                          {a.stack.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {a.stack.map(s => (
                                <span key={s} className="font-mono text-[7px] rounded px-1.5 py-0.5 border border-pink-400/20 bg-pink-400/8 text-pink-400/60">{s}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* ── Skills ── */}
                {catKey === 'skills' && subCatFilter(skills).map((i) => {
                  const s = i as ResourceSkillItem
                  return (
                    <div key={s.id} className="overflow-hidden">
                      <ItemRow id={s.id} onRemove={() => setSkills(skills.filter(x => x.id !== s.id))}>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] text-orange-400/75">{s.command}</span>
                          <span className="text-[9px] text-white/40">{s.title}</span>
                          <span className={cn('font-mono text-[7px] rounded px-1.5 py-0.5 border shrink-0',
                            s.builtin ? 'border-emerald-400/25 bg-emerald-400/8 text-emerald-400/60' : 'border-white/10 text-white/30')}>
                            {s.builtin ? 'builtin' : 'custom'}
                          </span>
                        </div>
                      </ItemRow>
                      {expanded === s.id && (
                        <div className="border-t border-white/6 px-3 py-3 space-y-2 bg-white/[0.015]">
                          <div className="grid grid-cols-2 gap-2">
                            <F l="Comando"><input className={cn(inp, 'font-mono')} value={s.command} onChange={e => updSkill(s.id, { command: e.target.value })} /></F>
                            <F l="Título"><input className={inp} value={s.title} onChange={e => updSkill(s.id, { title: e.target.value })} /></F>
                          </div>
                          <Tog label="Builtin" on={s.builtin} toggle={() => updSkill(s.id, { builtin: !s.builtin })} />
                        </div>
                      )}
                    </div>
                  )
                })}

              </div>

              {/* Add button */}
              <div className="border-t border-white/6 px-3 py-2">
                <button onClick={catKey === 'tools' ? addTool : catKey === 'repos' ? addRepo : catKey === 'workflows' ? addWork : catKey === 'prompts' ? addPr : catKey === 'mcp' ? addMcp : catKey === 'agents' ? addAgent : addSkill}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/10 py-1.5 text-[10px] text-white/30 hover:text-white/60 hover:border-white/20 transition-all">
                  <Plus size={10} /> Añadir item
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── CMS Links ── */}
      {mainTab === 'links' && (
        <div className="space-y-1.5">
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(LINK_CAT_COL).map(([cat, cc]) => (
              <span key={cat} className="font-mono text-[7px] rounded-full border px-2 py-0.5"
                style={{ color: cc, borderColor: `${cc}30`, background: `${cc}10` }}>{cat}</span>
            ))}
          </div>

          {links.length === 0 && (
            <div className="rounded-lg border border-white/6 px-3 py-5 text-center text-[10px] text-white/25">
              Sin links curados — añade herramientas, artículos, repos y referencias
            </div>
          )}

          {links.map(l => {
            const isExp = expanded === l.id
            const cc    = LINK_CAT_COL[l.category] ?? '#94a3b8'
            return (
              <div key={l.id} className={cn('rounded-xl border overflow-hidden transition-all',
                isExp ? 'border-white/15 bg-white/[0.03]' : 'border-white/8 bg-white/[0.015]')}>
                <div className="flex items-center gap-2 px-3 py-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-medium text-white/75 truncate">{l.title}</span>
                      <span className="font-mono text-[7px] rounded px-1.5 py-0.5 border shrink-0"
                        style={{ color: cc, borderColor: `${cc}30`, background: `${cc}10` }}>{l.category}</span>
                    </div>
                    <div className="text-[9px] text-white/30 truncate">{l.url}</div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => updLink(l.id, { published: !l.published })}
                      className={cn('rounded border px-1.5 py-0.5 font-mono text-[8px] transition-all',
                        l.published
                          ? 'border-emerald-400/25 bg-emerald-400/8 text-emerald-400/70'
                          : 'border-white/10 text-white/25 hover:border-white/20')}>
                      {l.published ? 'PUB' : 'DRAFT'}
                    </button>
                    <button onClick={() => setExpanded(isExp ? null : l.id)}
                      className={cn('rounded p-1 transition-colors', isExp ? 'text-cyan-400/70' : 'text-white/30 hover:text-white/60')}>
                      <ChevronDown size={11} className={cn('transition-transform', isExp && 'rotate-180')} />
                    </button>
                    <button onClick={() => remLink(l.id)} className="rounded p-1 text-white/15 hover:text-red-400 transition-colors">
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
                {isExp && (
                  <div className="border-t border-white/6 px-3 py-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <F l="Título">
                        <input className={inp} value={l.title} onChange={e => updLink(l.id, { title: e.target.value })} />
                      </F>
                      <F l="Categoría">
                        <select className={cn(inp, 'cursor-pointer')} value={l.category}
                          onChange={e => updLink(l.id, { category: e.target.value as CuratedLink['category'] })}>
                          {Object.keys(LINK_CAT_COL).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </F>
                    </div>
                    <F l="URL">
                      <input className={inp} value={l.url} onChange={e => updLink(l.id, { url: e.target.value })} />
                    </F>
                    <F l="Descripción">
                      <textarea rows={2} className={area} value={l.description} onChange={e => updLink(l.id, { description: e.target.value })} />
                    </F>
                    <F l="Tags (coma)">
                      <input className={inp} value={l.tags.join(', ')}
                        onChange={e => updLink(l.id, { tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
                    </F>
                    <div className="grid grid-cols-2 gap-2">
                      <Tog label="Publicado" on={l.published} toggle={() => updLink(l.id, { published: !l.published })} />
                      <Tog label="Destacado"  on={l.featured}  toggle={() => updLink(l.id, { featured: !l.featured })}  />
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          <button onClick={addLink}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-cyan-400/15 py-2 text-[10px] text-cyan-400/40 hover:text-cyan-400/70 hover:border-cyan-400/30 transition-all">
            <Plus size={11} /> Añadir link curado
          </button>
        </div>
      )}

      {/* ── Drive ── */}
      {mainTab === 'drive' && (
        <div className="space-y-1.5">
          {drive.length === 0 ? (
            <div className="rounded-lg border border-white/6 px-3 py-5 text-center text-[10px] text-white/25 space-y-1">
              <p>Sin recursos de Drive registrados.</p>
              <p className="text-[9px] text-white/15">Añade agent-md, skills, automatizaciones, MCP configs, prompts y datasets.</p>
            </div>
          ) : (
            drive.map(d => (
              <div key={d.id} className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.015] px-3 py-2">
                <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', d.published ? 'bg-emerald-400' : 'bg-white/20')} />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-white/65 truncate">{d.title}</div>
                  <div className="font-mono text-[8px] text-white/25">{d.resourceType}</div>
                </div>
                <a href={d.driveUrl} target="_blank" rel="noopener noreferrer"
                  className="rounded p-1 text-white/20 hover:text-white/60 transition-colors">
                  <ExternalLink size={10} />
                </a>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Tracked Sources ── */}
      {mainTab === 'sources' && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {(Object.entries(SOURCE_TYPE_COL) as [TrackedSourceType, string][]).map(([type, col]) => (
              <span key={type} className="font-mono text-[7px] rounded-full border px-2 py-0.5"
                style={{ color: col, borderColor: `${col}30`, background: `${col}10` }}>{type}</span>
            ))}
          </div>

          {sources.length === 0 && (
            <div className="rounded-lg border border-white/6 px-3 py-5 text-center text-[10px] text-white/25">
              Sin fuentes registradas — añade newsletters, blogs, repos y canales de referencia
            </div>
          )}

          {sources.map(s => {
            const isExp = expanded === s.id
            const tc    = SOURCE_TYPE_COL[s.sourceType] ?? '#94a3b8'
            return (
              <div key={s.id} className={cn('rounded-xl border overflow-hidden transition-all',
                isExp ? 'border-white/15 bg-white/[0.03]' : 'border-white/8 bg-white/[0.015]')}>
                <div className="flex items-center gap-2 px-3 py-2">
                  <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', s.active ? 'bg-emerald-400' : 'bg-white/20')} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-medium text-white/75 truncate">{s.name}</span>
                      <span className="font-mono text-[7px] rounded px-1.5 py-0.5 border shrink-0"
                        style={{ color: tc, borderColor: `${tc}30`, background: `${tc}10` }}>{s.sourceType}</span>
                    </div>
                    <div className="text-[9px] text-white/30 truncate">{s.url}</div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => updSource(s.id, { active: !s.active })}
                      className={cn('rounded border px-1.5 py-0.5 font-mono text-[8px] transition-all',
                        s.active
                          ? 'border-emerald-400/25 bg-emerald-400/8 text-emerald-400/70'
                          : 'border-white/10 text-white/25 hover:border-white/20')}>
                      {s.active ? 'ON' : 'OFF'}
                    </button>
                    <button onClick={() => setExpanded(isExp ? null : s.id)}
                      className={cn('rounded p-1 transition-colors', isExp ? 'text-cyan-400/70' : 'text-white/30 hover:text-white/60')}>
                      <ChevronDown size={11} className={cn('transition-transform', isExp && 'rotate-180')} />
                    </button>
                    <button onClick={() => remSource(s.id)}
                      className="rounded p-1 text-white/15 hover:text-red-400 transition-colors">
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
                {isExp && (
                  <div className="border-t border-white/6 px-3 py-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <F l="Nombre">
                        <input className={inp} value={s.name} onChange={e => updSource(s.id, { name: e.target.value })} />
                      </F>
                      <F l="Tipo">
                        <select className={cn(inp, 'cursor-pointer')} value={s.sourceType}
                          onChange={e => updSource(s.id, { sourceType: e.target.value as TrackedSourceType })}>
                          {(Object.keys(SOURCE_TYPE_COL) as TrackedSourceType[]).map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </F>
                    </div>
                    <F l="URL">
                      <input className={inp} value={s.url} onChange={e => updSource(s.id, { url: e.target.value })} />
                    </F>
                    <F l="Descripción">
                      <textarea rows={2} className={area} value={s.description}
                        onChange={e => updSource(s.id, { description: e.target.value })} />
                    </F>
                    <Tog label="Activa" on={s.active} toggle={() => updSource(s.id, { active: !s.active })} />
                  </div>
                )}
              </div>
            )
          })}

          <button onClick={addSource}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-cyan-400/15 py-2 text-[10px] text-cyan-400/40 hover:text-cyan-400/70 hover:border-cyan-400/30 transition-all">
            <Plus size={11} /> Añadir fuente
          </button>
        </div>
      )}
    </div>
  )
}

export default ResourcesEditor
