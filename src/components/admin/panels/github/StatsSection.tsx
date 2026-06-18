'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useAdmin } from '@/lib/admin/store'
import type { GithubConfig } from '@/lib/admin/types'
import { Star, ExternalLink } from 'lucide-react'
import { LANGUAGE_COLORS, Toggle } from './primitives'

// ─── Display Tab ──────────────────────────────────────────────────────────────

export function DisplayTab() {
  const { state, dispatch } = useAdmin()
  const { githubConfig: gc } = state
  const { displayRepos, repoMeta, username } = gc

  function update(data: Partial<GithubConfig>) {
    dispatch({ type: 'UPDATE_GITHUB_CONFIG', payload: data })
  }

  const langStats = displayRepos.reduce<Record<string, number>>((acc, r) => {
    const lang = repoMeta[r]?.language ?? 'Other'
    acc[lang] = (acc[lang] ?? 0) + 1
    return acc
  }, {})

  const totalStars  = displayRepos.reduce((s, r) => s + (repoMeta[r]?.stars ?? 0), 0)
  const pinnedRepos = displayRepos.filter((r) => repoMeta[r]?.pinned)
  const maxLangCount = Math.max(...Object.values(langStats), 1)

  return (
    <div className="space-y-4">

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Repos',       value: displayRepos.length, color: '#f472b6' },
          { label: 'Total Stars', value: totalStars,           color: '#f59e0b' },
          { label: 'Pinned',      value: pinnedRepos.length,   color: '#a78bfa' },
        ].map(m => (
          <div key={m.label} className="rounded-xl border border-white/8 bg-white/[0.025] px-3 py-2.5 text-center">
            <div className="text-[18px] font-semibold tabular-nums" style={{ color: m.color }}>{m.value}</div>
            <div className="font-mono text-[8px] uppercase tracking-[0.14em] text-white/25 mt-0.5">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Page sections */}
      <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
        <div className="flex items-center gap-2 border-b border-white/8 px-4 py-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-pink-400 shrink-0" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 flex-1">Secciones visibles en la web</span>
        </div>
        <div className="divide-y divide-white/5 px-4">
          <Toggle label="Barra de stats en perfil"     desc="4 indicadores en el perfil card"                     value={gc.showStats}         onChange={(v) => update({ showStats: v })} />
          <Toggle label="Lenguajes en perfil"          desc="Barras de lenguajes dentro del perfil card"           value={gc.showLanguages}     onChange={(v) => update({ showLanguages: v })} />
          <Toggle label="Heatmap de contribuciones"    desc="Gráfico de calor — año completo"                     value={gc.showContributions} onChange={(v) => update({ showContributions: v })} />
          <Toggle label="Sección Starred / Curated"    desc="⭐ Repos recomendados que has marcado con estrella"   value={gc.showStarred}       onChange={(v) => update({ showStarred: v })} />
          <Toggle label="Topics en repos"              desc="Tags de topics en las repo cards"                     value={gc.showTopics}        onChange={(v) => update({ showTopics: v })} />
          <Toggle label="Forks en repos"               desc="Contador de forks por repo"                          value={gc.showForks}         onChange={(v) => update({ showForks: v })} />
        </div>
      </div>

      {/* Stat slot 4 */}
      <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
        <div className="flex items-center gap-2 border-b border-white/8 px-4 py-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-pink-400 shrink-0" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 flex-1">Stat Slot 4</span>
          <span className="font-mono text-[8px] text-white/20">4ª tarjeta en perfil card</span>
        </div>
        <div className="grid grid-cols-2 gap-2 p-3">
          {([
            { value: 'starred' as const, label: '⭐  Repos Starred', desc: 'Total repos con ★'  },
            { value: 'forks'   as const, label: '⑂  Total Forks',   desc: 'Forks de tus repos' },
          ]).map(opt => (
            <button key={opt.value} onClick={() => update({ statSlot4: opt.value })}
              className={cn(
                'flex flex-col gap-0.5 rounded-lg border px-3 py-2 text-left transition-all',
                (gc.statSlot4 === opt.value || (!gc.statSlot4 && opt.value === 'starred'))
                  ? 'border-pink-400/30 bg-pink-400/8 text-pink-300'
                  : 'border-white/8 text-white/40 hover:border-white/15'
              )}
            >
              <span className="text-[11px] font-medium">{opt.label}</span>
              <span className="font-mono text-[8px] text-white/30">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Display mode */}
      <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
        <div className="flex items-center gap-2 border-b border-white/8 px-4 py-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-pink-400 shrink-0" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 flex-1">Display Mode — Repo Cards</span>
        </div>
        <div className="p-3">
          <div className="grid grid-cols-3 gap-2">
            {([
              { id: 'grid'    as const, icon: '⊞', desc: 'Cuadrícula'  },
              { id: 'list'    as const, icon: '≡', desc: 'Lista'        },
              { id: 'compact' as const, icon: '⋮', desc: 'Compacto'    },
            ]).map((m) => (
              <button key={m.id} onClick={() => update({ displayMode: m.id })} className={cn(
                'flex flex-col items-center gap-1 rounded-xl border py-3 transition-colors',
                gc.displayMode === m.id ? 'border-pink-400/25 bg-pink-400/8 text-pink-400' : 'border-white/8 text-white/30 hover:border-white/15'
              )}>
                <span className="text-[18px]">{m.icon}</span>
                <span className="font-mono text-[8px] uppercase tracking-wider">{m.desc}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 font-mono text-[8px] text-white/20 text-center">
            Afecta la vista de repos en GitHubSection
          </p>
        </div>
      </div>

      {/* Activity feed limit */}
      <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
        <div className="flex items-center gap-2 border-b border-white/8 px-4 py-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-pink-400 shrink-0" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 flex-1">Activity Feed</span>
        </div>
        <div className="p-4">
          <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30 mb-2">Máximo de eventos mostrados</div>
          <div className="flex items-center gap-3">
            <input type="range" min={5} max={50} step={5} value={gc.activityLimit}
              onChange={(e) => update({ activityLimit: Number(e.target.value) })}
              className="flex-1 h-1 accent-pink-400 cursor-pointer" />
            <span className="font-mono text-[11px] text-pink-400 w-6 text-right">{gc.activityLimit}</span>
          </div>
        </div>
      </div>

      {/* Language distribution */}
      <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
        <div className="flex items-center gap-2 border-b border-white/8 px-4 py-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-pink-400 shrink-0" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 flex-1">Language Distribution</span>
          <span className="font-mono text-[8px] text-white/25">{Object.keys(langStats).length} lenguajes</span>
        </div>
        <div className="p-4 space-y-2">
          {Object.entries(langStats).length === 0 ? (
            <div className="text-[11px] text-white/20 py-2">Sin repos configurados</div>
          ) : (
            Object.entries(langStats)
              .sort(([, a], [, b]) => b - a)
              .map(([lang, count]) => (
                <div key={lang} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: LANGUAGE_COLORS[lang] ?? '#9e9e9e' }} />
                  <span className="w-24 text-[10px] text-white/55 shrink-0">{lang}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${(count / maxLangCount) * 100}%`, background: LANGUAGE_COLORS[lang] ?? '#9e9e9e' }} />
                  </div>
                  <span className="font-mono text-[9px] text-white/30 w-4 text-right">{count}</span>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Pinned repos */}
      {pinnedRepos.length > 0 && (
        <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
          <div className="flex items-center gap-2 border-b border-white/8 px-4 py-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-pink-400 shrink-0" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 flex-1">Pinned Repos</span>
            <span className="font-mono text-[9px] text-white/25">{pinnedRepos.length}</span>
          </div>
          <div className="p-4 space-y-1">
            {pinnedRepos.map((r) => (
              <div key={r} className="flex items-center gap-2">
                <span className="text-[10px]">📌</span>
                <span className="font-mono text-[10px] text-white/60 w-40 truncate">{username}/{r}</span>
                <span className="text-[10px] text-white/30 flex-1 truncate">{repoMeta[r]?.description}</span>
                {(repoMeta[r]?.stars ?? 0) > 0 && (
                  <span className="flex items-center gap-0.5 font-mono text-[9px] text-amber-400/60 shrink-0">
                    <Star className="h-2.5 w-2.5" />{repoMeta[r]?.stars}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Export Tab ───────────────────────────────────────────────────────────────

export function ExportTab() {
  const { state } = useAdmin()
  const [copied, setCopied] = useState(false)

  const exportData = {
    username:    state.githubConfig.username,
    displayRepos: state.githubConfig.displayRepos,
    repoMeta:    state.githubConfig.repoMeta,
    display: {
      mode:              state.githubConfig.displayMode,
      showContributions: state.githubConfig.showContributions,
      showStats:         state.githubConfig.showStats,
      showActivity:      state.githubConfig.showActivity,
      showLanguages:     state.githubConfig.showLanguages,
      showTopics:        state.githubConfig.showTopics,
      showForks:         state.githubConfig.showForks,
      activityLimit:     state.githubConfig.activityLimit,
    },
  }

  function copy() {
    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/6 bg-white/[0.015] overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/6 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-white/20 shrink-0" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/30">Config Export</span>
          </div>
          <button onClick={copy} className="rounded-lg border border-white/10 px-2.5 py-1 font-mono text-[9px] text-white/35 hover:border-white/20 hover:text-white/60 transition-colors">{copied ? '✓ Copiado' : 'Copiar'}</button>
        </div>
        <div className="p-3 max-h-96 overflow-y-auto">
          <pre className="font-mono text-[10px] text-white/30 whitespace-pre-wrap leading-relaxed">{JSON.stringify(exportData, null, 2)}</pre>
        </div>
      </div>
    </div>
  )
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────

export function ProfileTab() {
  const { state, dispatch } = useAdmin()
  const { githubConfig: gc, integrations } = state
  const intGh = integrations.github
  const [synced, setSynced] = useState(false)

  function update(data: Partial<GithubConfig>) {
    dispatch({ type: 'UPDATE_GITHUB_CONFIG', payload: data })
  }

  function syncFromIntegrations() {
    dispatch({ type: 'SYNC_GITHUB_FROM_INTEGRATIONS' })
    setSynced(true)
    setTimeout(() => setSynced(false), 3000)
  }

  return (
    <div className="space-y-4">
      {/* Connection status */}
      <div className={cn(
        'rounded-xl border px-4 py-3.5',
        intGh.connected ? 'border-emerald-400/20 bg-emerald-400/5' : 'border-white/8 bg-white/[0.02]'
      )}>
        {intGh.connected ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {intGh.avatarUrl
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={intGh.avatarUrl} alt={intGh.username} className="h-9 w-9 rounded-full border border-white/15 shrink-0" referrerPolicy="no-referrer" />
                : <span className="h-9 w-9 rounded-full bg-emerald-400/15 flex items-center justify-center font-mono text-[12px] text-emerald-400 shrink-0">{intGh.username.charAt(0).toUpperCase()}</span>
              }
              <div>
                <div className="flex items-center gap-1.5 font-semibold text-[12px] text-white/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  @{intGh.username}
                </div>
                <div className="font-mono text-[9px] text-white/35 mt-0.5">
                  {intGh.repos.length} repos · PAT conectado · {intGh.lastSync ? `sync ${intGh.lastSync.slice(0, 10)}` : 'recién conectado'}
                </div>
              </div>
            </div>
            <button onClick={syncFromIntegrations} className={cn(
              'rounded-lg border px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.1em] transition-colors',
              synced ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-400' : 'border-pink-400/25 bg-pink-400/8 text-pink-400/70 hover:bg-pink-400/15 hover:text-pink-400'
            )}>
              {synced ? '✓ Importado' : '↓ Importar al showcase'}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1">
              <span className="h-1.5 w-1.5 rounded-full bg-white/20 shrink-0" />
              <div className="font-mono text-[10px] text-white/40">Sin PAT · modo público</div>
            </div>
            <div className="font-mono text-[8px] text-white/20">Usa Live Sync abajo · o conecta en Integrations → GitHub</div>
          </div>
        )}
      </div>

      {/* Identity config */}
      <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
        <div className="flex items-center gap-2 border-b border-white/8 px-4 py-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-pink-400 shrink-0" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 flex-1">GitHub Identity</span>
          <a href={`https://github.com/${intGh.connected ? intGh.username : gc.username}`} target="_blank" rel="noreferrer"
            className="flex items-center gap-1 font-mono text-[9px] text-white/25 hover:text-pink-400 transition-colors">
            <ExternalLink className="h-3 w-3" /> Ver perfil
          </a>
        </div>
        <div className="p-4 space-y-3">
          <div className="space-y-1">
            <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Username</div>
            <input
              value={intGh.connected ? intGh.username : gc.username}
              onChange={(e) => update({ username: e.target.value })}
              readOnly={intGh.connected}
              className={cn(
                'w-full rounded-lg border px-3 py-2 font-mono text-[13px] focus:outline-none transition-colors',
                intGh.connected
                  ? 'border-white/5 bg-white/[0.02] text-pink-300/60 cursor-default'
                  : 'border-white/10 bg-white/4 text-pink-300/80 focus:border-pink-400/30'
              )}
              placeholder="github-username"
            />
            {intGh.connected && <div className="font-mono text-[8px] text-white/20">Gestionado via PAT · solo lectura</div>}
          </div>
        </div>
      </div>

      {/* Page sections */}
      <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
        <div className="flex items-center gap-2 border-b border-white/8 px-4 py-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-pink-400 shrink-0" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 flex-1">Secciones de la página pública</span>
          <span className="font-mono text-[8px] text-white/20">/en/github/</span>
        </div>
        <div className="divide-y divide-white/5 px-4">
          <Toggle label="Stats en barra de perfil"    desc="4 indicadores: Repos · Contributions · Stars · Slot 4" value={gc.showStats}         onChange={(v) => update({ showStats: v })} />
          <Toggle label="Lenguajes en barra de perfil" desc="Distribución de lenguajes dentro del perfil card"      value={gc.showLanguages}     onChange={(v) => update({ showLanguages: v })} />
          <Toggle label="Heatmap de contribuciones"   desc="Gráfico de calor — año completo desde GitHub API"       value={gc.showContributions} onChange={(v) => update({ showContributions: v })} />
          <Toggle label="Sección Starred / Curated"   desc="⭐ Repos recomendados — los que has marcado con estrella" value={gc.showStarred}     onChange={(v) => update({ showStarred: v })} />
          <Toggle label="Topics en repo cards"        desc="Tags de topics por repo en la cuadrícula"                value={gc.showTopics}        onChange={(v) => update({ showTopics: v })} />
          <Toggle label="Forks en repo cards"         desc="Contador de forks por repo"                             value={gc.showForks}         onChange={(v) => update({ showForks: v })} />
          <Toggle label="Activity timeline"           desc="Feed de eventos recientes de GitHub"                     value={gc.showActivity}      onChange={(v) => update({ showActivity: v })} />
        </div>
      </div>

      {/* Stat slot 4 */}
      <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
        <div className="flex items-center gap-2 border-b border-white/8 px-4 py-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-pink-400 shrink-0" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 flex-1">Stat Slot 4 — 4ª tarjeta</span>
        </div>
        <div className="grid grid-cols-2 gap-2 p-3">
          {([
            { value: 'starred' as const, label: '⭐  Repos Starred', desc: 'Repos que has marcado' },
            { value: 'forks'   as const, label: '⑂  Total Forks',   desc: 'Forks de tus repos'   },
          ]).map(opt => (
            <button key={opt.value} onClick={() => update({ statSlot4: opt.value })}
              className={cn(
                'flex flex-col gap-0.5 rounded-lg border px-3 py-2 text-left transition-all',
                (gc.statSlot4 === opt.value || (!gc.statSlot4 && opt.value === 'starred'))
                  ? 'border-pink-400/30 bg-pink-400/8 text-pink-300'
                  : 'border-white/8 text-white/40 hover:border-white/15'
              )}
            >
              <span className="text-[11px] font-medium">{opt.label}</span>
              <span className="font-mono text-[8px] text-white/30">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Activity limit */}
      <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
        <div className="flex items-center gap-2 border-b border-white/8 px-4 py-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-pink-400 shrink-0" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/50">Activity Feed</span>
        </div>
        <div className="p-4">
          <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30 mb-2">Máximo de eventos en el feed</div>
          <div className="flex items-center gap-3">
            <input type="range" min={5} max={50} step={5} value={gc.activityLimit}
              onChange={(e) => update({ activityLimit: Number(e.target.value) })}
              className="flex-1 h-1 accent-pink-400 cursor-pointer" />
            <span className="font-mono text-[11px] text-pink-400 w-6 text-right">{gc.activityLimit}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
