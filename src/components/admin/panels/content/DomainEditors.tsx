'use client'

import { useState } from 'react'
import { ChevronDown, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdmin } from '@/lib/admin/store'
import type { GithubRepoMeta, IntelligenceFeed } from '@/lib/admin/types'
import { inp, F, Tog, LANG_COL } from './primitives'

// ─── GitHub editor — aligned with /en/github/ page ────────────────────────────

export function GitHubEditor() {
  const { state, dispatch } = useAdmin()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [newRepo, setNewRepo]   = useState('')
  const [ghTab, setGhTab]       = useState<'config' | 'repos' | 'sections'>('sections')
  const c = state.githubConfig
  const p = (d: Partial<typeof c>) => dispatch({ type: 'UPDATE_GITHUB_CONFIG', payload: d })

  const setRepoMeta = (repo: string, meta: Partial<GithubRepoMeta>) =>
    dispatch({ type: 'SET_REPO_META', payload: { repo, meta } })

  const addRepo = () => {
    const r = newRepo.trim()
    if (!r || c.displayRepos.includes(r)) return
    p({ displayRepos: [...c.displayRepos, r] })
    setNewRepo('')
  }
  const removeRepo = (repo: string) => {
    p({ displayRepos: c.displayRepos.filter(r => r !== repo) })
    if (expanded === repo) setExpanded(null)
  }

  const totalStars = c.displayRepos.reduce((s, r) => s + (c.repoMeta[r]?.stars ?? 0), 0)
  const pinned     = c.displayRepos.filter(r => c.repoMeta[r]?.pinned).length

  return (
    <div className="space-y-3">
      {/* Stats summary matching the page */}
      <div className="grid grid-cols-4 gap-1.5">
        {[
          { l: 'Repos',    v: c.displayRepos.length, c: '#f472b6' },
          { l: 'Stars',    v: totalStars,             c: '#f59e0b' },
          { l: 'Pinned',   v: pinned,                 c: '#a78bfa' },
          { l: 'Activity', v: c.activityLimit,        c: '#34d399' },
        ].map(s => (
          <div key={s.l} className="rounded-lg border border-white/8 bg-white/2 py-2 text-center">
            <div className="text-sm font-bold" style={{ color: s.c }}>{s.v}</div>
            <div className="text-[8px] text-white/30">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1">
        {([
          { id: 'sections', label: 'Secciones' },
          { id: 'repos',    label: `Repos (${c.displayRepos.length})` },
          { id: 'config',   label: 'Config' },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setGhTab(t.id)}
            className={cn('rounded-lg border px-2.5 py-1 text-[10px] font-medium transition-all',
              ghTab === t.id ? 'border-pink-400/25 bg-pink-400/10 text-pink-400' : 'border-white/8 text-white/35 hover:text-white/60')}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── SECTIONS TAB — matches the actual page sections ── */}
      {ghTab === 'sections' && (
        <div className="space-y-2">
          <div className="rounded-lg border border-pink-400/10 bg-pink-400/5 px-3 py-2 text-[10px] text-pink-400/70">
            Controla qué secciones aparecen en <code className="font-mono">/en/github/</code>
          </div>

          {/* Page sections matching the actual layout */}
          {([
            { key: 'showStats',         label: 'Stats Row',           desc: 'Repos · Commits(30d) · Stars · Forks', section: 'stats'         },
            { key: 'showContributions', label: 'Heatmap',             desc: 'Contribution activity — Last 26 Weeks', section: 'heatmap'       },
            { key: 'showLanguages',     label: 'Language Breakdown',  desc: 'Distribución de lenguajes de repos',    section: 'langs'         },
            { key: 'showStarred',       label: '⭐ Starred / Curated', desc: 'Repos recomendados por ti (starred)',   section: 'starred'       },
            { key: 'showActivity',      label: 'Repo Cards',          desc: 'Tarjetas de repositorios del showcase', section: 'repos'         },
            { key: 'showTopics',        label: 'Topics',              desc: 'Tags de topics en cada repo',           section: 'topics'        },
            { key: 'showForks',         label: 'Forks count',         desc: 'Contador de forks visible',             section: 'forks'         },
          ] as const).map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between gap-3 rounded-lg border border-white/8 bg-white/[0.01] px-3 py-2">
              <div>
                <div className="text-[11px] font-medium text-white/70">{label}</div>
                <div className="text-[9px] text-white/30">{desc}</div>
              </div>
              <button onClick={() => p({ [key]: !(c[key] as boolean) })}
                className={cn('relative h-5 w-9 shrink-0 rounded-full border transition-colors',
                  (c[key] as boolean) ? 'border-pink-400/40 bg-pink-400/20' : 'border-white/15 bg-white/5')}>
                <span className={cn('absolute top-0.5 h-4 w-4 rounded-full transition-all',
                  (c[key] as boolean) ? 'left-[18px] bg-pink-400' : 'left-0.5 bg-white/30')} />
              </button>
            </div>
          ))}

          {/* Display mode */}
          <div className="pt-1">
            <F l="Modo de vista (repo cards)">
              <select className={cn(inp, 'cursor-pointer')} value={c.displayMode}
                onChange={e => p({ displayMode: e.target.value as typeof c.displayMode })}>
                <option value="grid">Grid</option>
                <option value="list">List</option>
                <option value="compact">Compact</option>
              </select>
            </F>
          </div>
        </div>
      )}

      {/* ── REPOS TAB ── */}
      {ghTab === 'repos' && (
        <div className="space-y-2">
          <div className="space-y-1.5">
            {c.displayRepos.map(repo => {
              const meta    = c.repoMeta[repo] as GithubRepoMeta | undefined
              const isExp   = expanded === repo
              const langCol = LANG_COL[(meta?.language ?? '').toLowerCase()] ?? '#94a3b8'
              return (
                <div key={repo} className={cn('rounded-xl border overflow-hidden transition-all',
                  isExp ? 'border-white/15 bg-white/[0.03]' : 'border-white/8 bg-white/[0.015]')}>
                  <div className="flex items-center gap-2 px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-medium text-white/80 truncate">{repo}</span>
                        {meta?.pinned && (
                          <span className="font-mono text-[7px] rounded px-1.5 py-0.5 border border-amber-400/25 bg-amber-400/8 text-amber-400/70">pinned</span>
                        )}
                        {meta?.language && (
                          <span className="font-mono text-[7px] flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: langCol }} />
                            <span style={{ color: langCol }}>{meta.language}</span>
                          </span>
                        )}
                      </div>
                      <div className="flex gap-3 mt-0.5">
                        {meta?.stars !== undefined && <span className="font-mono text-[8px] text-white/25">★ {meta.stars}</span>}
                        {meta?.forks  !== undefined && <span className="font-mono text-[8px] text-white/25">⑂ {meta.forks}</span>}
                        {meta?.description && <span className="text-[8px] text-white/25 truncate">{meta.description}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => setExpanded(isExp ? null : repo)}
                        className={cn('rounded p-1 transition-colors', isExp ? 'text-cyan-400/70' : 'text-white/30 hover:text-white/60')}>
                        <ChevronDown size={11} className={cn('transition-transform', isExp && 'rotate-180')} />
                      </button>
                      <button onClick={() => removeRepo(repo)} className="rounded p-1 text-white/15 hover:text-red-400 transition-colors">
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                  {isExp && (
                    <div className="border-t border-white/6 px-3 py-3 space-y-2.5">
                      <F l="Descripción">
                        <input className={inp} value={meta?.description ?? ''}
                          onChange={e => setRepoMeta(repo, { description: e.target.value })} />
                      </F>
                      <div className="grid grid-cols-2 gap-2">
                        <F l="Lenguaje">
                          <input className={inp} value={meta?.language ?? ''} placeholder="TypeScript"
                            onChange={e => setRepoMeta(repo, { language: e.target.value })} />
                        </F>
                        <F l="Stars">
                          <input type="number" className={inp} value={meta?.stars ?? 0}
                            onChange={e => setRepoMeta(repo, { stars: parseInt(e.target.value) || 0 })} />
                        </F>
                      </div>
                      <F l="Topics (coma)">
                        <input className={inp} value={(meta?.topics ?? []).join(', ')}
                          onChange={e => setRepoMeta(repo, { topics: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
                      </F>
                      <Tog label="Pinned" on={meta?.pinned ?? false}
                        toggle={() => setRepoMeta(repo, { pinned: !(meta?.pinned ?? false) })} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <div className="flex gap-2">
            <input className={cn(inp, 'flex-1')} value={newRepo} placeholder="nombre-del-repo"
              onChange={e => setNewRepo(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addRepo()} />
            <button onClick={addRepo}
              className="flex items-center gap-1 rounded-lg border border-cyan-400/20 bg-cyan-400/8 px-3 py-1.5 text-[10px] text-cyan-400/70 hover:border-cyan-400/35 hover:text-cyan-400 transition-all">
              <Plus size={10} /> Add
            </button>
          </div>
        </div>
      )}

      {/* ── CONFIG TAB ── */}
      {ghTab === 'config' && (
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <F l="Username GitHub">
              <input className={inp} value={c.username} onChange={e => p({ username: e.target.value })} />
            </F>
            <F l="Actividad máx.">
              <input type="number" className={inp} value={c.activityLimit}
                onChange={e => p({ activityLimit: parseInt(e.target.value) || 10 })} />
            </F>
          </div>

          {/* Stat Slot 4 picker */}
          <div className="rounded-lg border border-white/8 bg-white/[0.02] p-3 space-y-2">
            <p className="font-mono text-[9px] uppercase tracking-widest text-white/35">Stat Slot 4 — 4ª tarjeta de estadística</p>
            <div className="grid grid-cols-2 gap-2">
              {([
                { value: 'starred', label: '⭐ Repos Starred', desc: 'Repos que has marcado con estrella' },
                { value: 'forks',   label: '⑂  Total Forks',   desc: 'Forks totales de tus repos' },
              ] as { value: 'starred' | 'forks'; label: string; desc: string }[]).map(opt => (
                <button
                  key={opt.value}
                  onClick={() => p({ statSlot4: opt.value })}
                  className={cn(
                    'flex flex-col gap-0.5 rounded-lg border px-3 py-2 text-left transition-all',
                    c.statSlot4 === opt.value || (!c.statSlot4 && opt.value === 'starred')
                      ? 'border-cyan-400/35 bg-cyan-400/10 text-cyan-300'
                      : 'border-white/8 bg-white/[0.02] text-white/50 hover:border-white/15'
                  )}
                >
                  <span className="text-[11px] font-medium">{opt.label}</span>
                  <span className="font-mono text-[8px] text-white/35">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Display mode */}
          <div className="rounded-lg border border-white/8 bg-white/[0.02] p-3 space-y-2">
            <p className="font-mono text-[9px] uppercase tracking-widest text-white/35">Modo de vista de repos</p>
            <div className="flex gap-2">
              {(['list', 'grid', 'compact'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => p({ displayMode: mode })}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 font-mono text-[10px] capitalize transition-all',
                    c.displayMode === mode
                      ? 'border-cyan-400/35 bg-cyan-400/10 text-cyan-300'
                      : 'border-white/8 bg-white/[0.02] text-white/40 hover:border-white/15'
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-cyan-400/10 bg-cyan-400/5 px-3 py-2 text-[10px] text-cyan-400/70 leading-relaxed">
            Para Live Sync con la API de GitHub, importar repos starred y configurar el token PAT → usa el panel <strong>GitHub Panel</strong> (botón arriba).
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Playground editor ────────────────────────────────────────────────────────

const PLAYGROUND_FEATURES = [
  { id: '1', title: 'AI Sandbox',       desc: 'Claude API interactivo con system prompts customizables',         status: 'in-progress', eta: 'Q3 2026' },
  { id: '2', title: 'MCP Visualizer',   desc: 'Explorador de servidores MCP con herramientas disponibles',       status: 'planned',     eta: 'Q3 2026' },
  { id: '3', title: 'Agent Builder',    desc: 'Constructor visual de agentes con patrones ReAct/CoT',            status: 'planned',     eta: 'Q4 2026' },
  { id: '4', title: 'Prompt Lab',       desc: 'Editor de prompts con comparación multi-modelo en tiempo real',   status: 'planned',     eta: 'Q4 2026' },
  { id: '5', title: 'Graph Explorer',   desc: 'Visualizador interactivo de arquitecturas GraphRAG',              status: 'roadmap',     eta: '2027'    },
  { id: '6', title: 'Infra Dashboard',  desc: 'Vista en vivo del clúster — nodos, contenedores, logs',           status: 'roadmap',     eta: '2027'    },
]
const PG_STATUS_COL: Record<string, string> = {
  'in-progress': '#fbbf24', planned: '#60a5fa', roadmap: '#94a3b8', done: '#34d399',
}

export function PlaygroundEditor() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-lg border border-amber-400/15 bg-amber-400/5 px-3 py-2.5">
        <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
        <div>
          <span className="text-[11px] text-amber-400/80">Coming soon — roadmap activo</span>
          <span className="block font-mono text-[9px] text-amber-400/40">Lanzamiento estimado: Q3 2026</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2 mb-2">
          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Features planificadas</p>
          <span className="h-px flex-1 bg-white/6" />
          <div className="flex gap-1.5">
            {Object.entries(PG_STATUS_COL).map(([s, col]) => (
              <span key={s} className="font-mono text-[7px] rounded-full border px-1.5 py-0.5"
                style={{ color: col, borderColor: `${col}30`, background: `${col}10` }}>{s}</span>
            ))}
          </div>
        </div>
        {PLAYGROUND_FEATURES.map(f => {
          const sc = PG_STATUS_COL[f.status] ?? '#94a3b8'
          return (
            <div key={f.id} className="rounded-xl border border-white/8 bg-white/[0.015] px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: sc }} />
                    <span className="text-[11px] font-medium text-white/70">{f.title}</span>
                    <span className="font-mono text-[7px] rounded px-1.5 py-0.5 border shrink-0"
                      style={{ color: sc, borderColor: `${sc}30`, background: `${sc}10` }}>{f.status}</span>
                  </div>
                  <div className="mt-0.5 pl-3 text-[9px] text-white/30 truncate">{f.desc}</div>
                </div>
                <span className="font-mono text-[8px] text-white/25 shrink-0">{f.eta}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded-lg border border-white/6 bg-white/[0.015] px-3 py-2.5 text-[9px] text-white/30 leading-relaxed">
        Para modificar el roadmap edita <code className="font-mono text-cyan-400/60">PLAYGROUND_FEATURES</code> en <code className="font-mono text-cyan-400/60">DomainEditors.tsx</code>.
        Cuando el Playground esté activo, mover la config a <code className="font-mono text-cyan-400/60">src/lib/admin/types.ts</code>.
      </div>
    </div>
  )
}

// ─── Intelligence editor ──────────────────────────────────────────────────────

export function IntelligenceEditor() {
  const { state, dispatch } = useAdmin()
  const feeds: IntelligenceFeed[] = state.intelligence?.feeds ?? []
  const enabledFeeds  = feeds.filter(f => f.enabled)
  const publishable   = feeds.filter(f => f.publishable)

  const togglePublishable = (id: string, current: boolean) =>
    dispatch({ type: 'INTELLIGENCE_UPDATE_FEED', payload: { id, data: { publishable: !current } } })

  return (
    <div className="space-y-3">
      {/* Header info */}
      <div className="rounded-lg border border-cyan-400/15 bg-cyan-400/5 px-3 py-2.5 space-y-0.5">
        <p className="text-[11px] text-cyan-400/80 font-medium">Intelligence Feed — /en/intelligence/</p>
        <p className="text-[9px] text-white/35 leading-relaxed">
          Agrega fuentes de datos en vivo. Marca feeds como &quot;publicables&quot; para que aparezcan en la página pública.
          Gestiona las fuentes completas en el panel <strong className="text-white/50">Intelligence Feeds</strong>.
        </p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Total feeds', value: feeds.length, color: '#94a3b8' },
          { label: 'Enabled',     value: enabledFeeds.length, color: '#38bdf8' },
          { label: 'Publishable', value: publishable.length,  color: '#34d399' },
        ].map(s => (
          <div key={s.label} className="rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2 text-center">
            <p className="font-mono text-base font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="font-mono text-[8px] uppercase tracking-wider text-white/30 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Publishable toggle list */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 mb-1.5">
          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Visible en página pública</p>
          <span className="h-px flex-1 bg-white/6" />
        </div>
        {enabledFeeds.length === 0 ? (
          <p className="text-[10px] text-white/25 py-2 text-center">No hay feeds habilitados aún.</p>
        ) : (
          enabledFeeds.map(feed => (
            <div key={feed.id} className="flex items-center gap-2 rounded-lg border border-white/6 bg-white/[0.015] px-3 py-2">
              <span className="text-base flex-shrink-0">{feed.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-white/70 truncate">{feed.name}</p>
                <p className="font-mono text-[8px] text-white/25 uppercase">{feed.category}</p>
              </div>
              <Tog
                label=""
                on={!!feed.publishable}
                toggle={() => togglePublishable(feed.id, !!feed.publishable)}
              />
            </div>
          ))
        )}
      </div>

      <p className="text-[9px] text-white/20 leading-relaxed pt-1">
        Para añadir, editar o configurar feeds ve al panel <span className="text-cyan-400/50">Intelligence Feeds</span>.
        Este editor solo controla visibilidad pública.
      </p>
    </div>
  )
}
