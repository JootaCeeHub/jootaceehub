'use client'

import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useAdmin } from '@/lib/admin/store'
import type { GithubRepoMeta } from '@/lib/admin/types'
import {
  RefreshCw, ExternalLink, Star, GitFork, Loader2, CheckCircle2, AlertCircle,
} from 'lucide-react'
import { fetchPublicRepos, fetchPublicProfile, LANGUAGE_COLORS, relTime } from './primitives'
import type { LiveRepo, LiveProfile } from './primitives'

// ─── RepoMetaEditor ───────────────────────────────────────────────────────────

export function RepoMetaEditor({ repo, meta, username }: { repo: string; meta: GithubRepoMeta; username: string }) {
  const { dispatch } = useAdmin()
  const [open, setOpen] = useState(false)
  const [topicInput, setTopicInput] = useState('')

  function update(data: Partial<GithubRepoMeta>) {
    dispatch({ type: 'SET_REPO_META', payload: { repo, meta: data } })
  }

  const addTopic = () => {
    const t = topicInput.trim().toLowerCase().replace(/\s+/g, '-')
    if (t && !meta.topics.includes(t)) { update({ topics: [...meta.topics, t] }); setTopicInput('') }
  }

  return (
    <div className={cn(
      'rounded-lg border overflow-hidden transition-colors',
      meta.pinned ? 'border-pink-400/20 bg-pink-400/3' : 'border-white/8 bg-white/[0.01]'
    )}>
      <button className="flex items-center justify-between gap-2 w-full px-3 py-2 text-left" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {meta.pinned && <span className="text-[10px]">📌</span>}
          <span className="font-mono text-[11px] text-white/60 truncate">{username}/<strong className="text-white/80">{repo}</strong></span>
          {meta.language && (
            <span className="font-mono text-[9px]" style={{ color: LANGUAGE_COLORS[meta.language] ?? '#9e9e9e' }}>● {meta.language}</span>
          )}
          {meta.stars > 0 && <span className="font-mono text-[9px] text-white/30 flex items-center gap-0.5"><Star className="h-2.5 w-2.5" />{meta.stars}</span>}
          {meta.forks > 0 && <span className="font-mono text-[9px] text-white/30 flex items-center gap-0.5"><GitFork className="h-2.5 w-2.5" />{meta.forks}</span>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            className={cn(
              'rounded border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider transition-colors',
              meta.pinned ? 'border-pink-400/25 text-pink-400 bg-pink-400/8' : 'border-white/10 text-white/25 hover:border-white/20'
            )}
            onClick={(e) => { e.stopPropagation(); update({ pinned: !meta.pinned }) }}
          >
            {meta.pinned ? 'pinned' : 'pin'}
          </button>
          <span className="text-[9px] text-white/25">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-white/8 p-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1">
              <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Descripción</div>
              <input value={meta.description} onChange={(e) => update({ description: e.target.value })} placeholder="Breve descripción"
                className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 text-[11px] text-white/65 placeholder-white/20 outline-none focus:border-pink-400/25 transition-colors" />
            </div>
            <div className="space-y-1">
              <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Lenguaje</div>
              <select value={meta.language} onChange={(e) => update({ language: e.target.value })} className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 text-[11px] text-white/65 outline-none focus:border-pink-400/25 transition-colors">
                {['TypeScript', 'Python', 'JavaScript', 'Rust', 'Go', 'Shell', 'CSS', 'HTML', 'Other'].map((l) => (
                  <option key={l} value={l} className="bg-[#0a0a14]">{l}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Stars</div>
              <input type="number" min={0} value={meta.stars} onChange={(e) => update({ stars: Number(e.target.value) || 0 })}
                className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 text-[11px] text-white/65 outline-none focus:border-pink-400/25 transition-colors" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Topics</div>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {meta.topics.map((t) => (
                <button key={t} onClick={() => update({ topics: meta.topics.filter((x) => x !== t) })}
                  className="rounded-md border border-pink-400/20 bg-pink-400/5 px-2 py-0.5 font-mono text-[9px] text-pink-400/70 hover:border-red-400/30 hover:text-red-400/70 transition-colors">
                  #{t} ×
                </button>
              ))}
              <div className="flex gap-1">
                <input value={topicInput} onChange={(e) => setTopicInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTopic() } }}
                  placeholder="add-topic"
                  className="rounded-md border border-white/8 bg-black/20 px-2 py-0.5 font-mono text-[9px] text-white/55 placeholder-white/20 outline-none focus:border-pink-400/25 transition-colors" />
                <button onClick={addTopic} className="rounded-md border border-white/10 px-2 py-0.5 font-mono text-[9px] text-white/35 hover:border-pink-400/25 hover:text-pink-400 transition-colors">+</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Live Sync card ───────────────────────────────────────────────────────────

export function LiveSyncCard({ username }: { username: string }) {
  const { dispatch } = useAdmin()
  const [status,   setStatus]   = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [message,  setMessage]  = useState('')
  const [liveRepos, setLiveRepos] = useState<LiveRepo[]>([])
  const [profile,  setProfile]  = useState<LiveProfile | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const sync = useCallback(async () => {
    setStatus('loading')
    setMessage('')
    try {
      const [repos, prof] = await Promise.all([
        fetchPublicRepos(username),
        fetchPublicProfile(username),
      ])
      setLiveRepos(repos)
      setProfile(prof)
      setSelected(new Set(repos.filter(r => !r.isFork && !r.isPrivate).slice(0, 8).map(r => r.name)))
      setStatus('done')
      setMessage(`${repos.length} repositorios encontrados`)
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'Error al conectar con GitHub API')
    }
  }, [username])

  const apply = useCallback(() => {
    const chosen = liveRepos.filter(r => selected.has(r.name))
    const newMeta: Record<string, GithubRepoMeta> = {}
    chosen.forEach(r => {
      newMeta[r.name] = {
        description: r.description,
        language:    r.language ?? 'Other',
        stars:       r.stars,
        forks:       r.forks,
        topics:      r.topics,
        pinned:      false,
      }
    })
    dispatch({
      type: 'UPDATE_GITHUB_CONFIG',
      payload: {
        username,
        displayRepos: chosen.map(r => r.name),
        repoMeta:     newMeta,
      },
    })
    setMessage(`✓ ${chosen.length} repos importados al showcase`)
  }, [dispatch, liveRepos, selected, username])

  const toggleRepo = (name: string) =>
    setSelected(prev => { const s = new Set(prev); s.has(name) ? s.delete(name) : s.add(name); return s })

  return (
    <div className="rounded-xl border border-cyan-400/15 bg-cyan-400/[0.03] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-400/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0" />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-400/70">GitHub Public API · Live Sync</span>
          </div>
          <div className="mt-0.5 font-mono text-[9px] text-white/30">Obtén datos reales de @{username} sin token</div>
        </div>
        <button
          onClick={sync}
          disabled={status === 'loading'}
          className={cn(
            'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.1em] transition-colors',
            status === 'loading' ? 'border-white/10 text-white/20 cursor-not-allowed' :
            'border-cyan-400/25 bg-cyan-400/8 text-cyan-400/70 hover:bg-cyan-400/15 hover:text-cyan-400'
          )}
        >
          {status === 'loading'
            ? <><Loader2 className="h-3 w-3 animate-spin" /> Fetching...</>
            : <><RefreshCw className="h-3 w-3" /> Sync Live</>}
        </button>
      </div>

      {/* Profile preview */}
      {profile && (
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={profile.avatarUrl} alt={profile.login} className="h-10 w-10 rounded-full border border-white/15 shrink-0" referrerPolicy="no-referrer" />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-[12px] text-white/80">{profile.name ?? profile.login}</div>
            <div className="font-mono text-[9px] text-white/35 mt-0.5 truncate">{profile.bio ?? `@${profile.login}`}</div>
          </div>
          <div className="flex gap-4 shrink-0">
            {[
              { label: 'Repos', value: profile.publicRepos },
              { label: 'Followers', value: profile.followers },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="font-mono text-[13px] font-semibold text-cyan-400">{s.value}</div>
                <div className="font-mono text-[8px] uppercase text-white/25">{s.label}</div>
              </div>
            ))}
          </div>
          <a href={`https://github.com/${profile.login}`} target="_blank" rel="noreferrer"
            className="shrink-0 text-white/20 hover:text-cyan-400 transition-colors">
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}

      {/* Status / error */}
      {message && (
        <div className={cn(
          'flex items-center gap-2 px-4 py-2 font-mono text-[9px]',
          status === 'error' ? 'text-red-400/70' : 'text-emerald-400/70'
        )}>
          {status === 'error'
            ? <AlertCircle className="h-3 w-3 shrink-0" />
            : <CheckCircle2 className="h-3 w-3 shrink-0" />}
          {message}
        </div>
      )}

      {/* Repo selection */}
      {liveRepos.length > 0 && (
        <>
          <div className="px-4 py-2 font-mono text-[8px] uppercase tracking-[0.18em] text-white/25 border-b border-white/5">
            Selecciona repos para el showcase ({selected.size} seleccionados)
          </div>
          <div className="max-h-60 overflow-y-auto divide-y divide-white/5">
            {liveRepos.map(r => (
              <label key={r.name} className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-white/[0.02] transition-colors">
                <input type="checkbox" checked={selected.has(r.name)} onChange={() => toggleRepo(r.name)}
                  className="accent-cyan-400 h-3 w-3 shrink-0 cursor-pointer" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-white/70 font-medium">{r.name}</span>
                    {r.language && (
                      <span className="font-mono text-[8px]" style={{ color: LANGUAGE_COLORS[r.language] ?? '#9e9e9e' }}>● {r.language}</span>
                    )}
                    {r.isFork && <span className="rounded border border-white/10 px-1 font-mono text-[7px] text-white/25">fork</span>}
                  </div>
                  {r.description && <div className="font-mono text-[9px] text-white/30 truncate mt-0.5">{r.description}</div>}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {r.stars > 0 && (
                    <span className="flex items-center gap-0.5 font-mono text-[9px] text-amber-400/60">
                      <Star className="h-2.5 w-2.5" />{r.stars}
                    </span>
                  )}
                  <span className="font-mono text-[8px] text-white/20">{relTime(r.updatedAt)}</span>
                </div>
              </label>
            ))}
          </div>
          <div className="border-t border-white/8 p-3 flex items-center justify-between gap-3">
            <div className="flex gap-2">
              <button onClick={() => setSelected(new Set(liveRepos.filter(r => !r.isFork).map(r => r.name)))}
                className="font-mono text-[9px] text-white/30 hover:text-white/55 transition-colors">Todos propios</button>
              <span className="text-white/15">·</span>
              <button onClick={() => setSelected(new Set())}
                className="font-mono text-[9px] text-white/30 hover:text-white/55 transition-colors">Ninguno</button>
            </div>
            <button
              onClick={apply}
              disabled={selected.size === 0}
              className="rounded-lg border border-cyan-400/25 bg-cyan-400/8 px-4 py-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-cyan-400/70 hover:bg-cyan-400/15 hover:text-cyan-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Aplicar al Showcase ({selected.size})
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Repos Tab ────────────────────────────────────────────────────────────────

export function ReposTab() {
  const { state, dispatch } = useAdmin()
  const { githubConfig: gc } = state
  const [newRepo, setNewRepo] = useState('')

  const pinnedFirst = [...gc.displayRepos].sort((a, b) => {
    const am = gc.repoMeta[a]; const bm = gc.repoMeta[b]
    if (am?.pinned && !bm?.pinned) return -1
    if (!am?.pinned && bm?.pinned) return 1
    return 0
  })

  function addRepo(name: string) {
    const trimmed = name.trim()
    if (!trimmed || gc.displayRepos.includes(trimmed)) return
    dispatch({
      type: 'UPDATE_GITHUB_CONFIG',
      payload: {
        displayRepos: [...gc.displayRepos, trimmed],
        repoMeta: { ...gc.repoMeta, [trimmed]: { description: '', language: 'TypeScript', stars: 0, forks: 0, topics: [], pinned: false } },
      },
    })
    setNewRepo('')
  }

  function removeRepo(repo: string) {
    dispatch({ type: 'UPDATE_GITHUB_CONFIG', payload: { displayRepos: gc.displayRepos.filter((r) => r !== repo) } })
  }

  function reorder(repo: string, dir: 'up' | 'down') {
    const repos = [...gc.displayRepos]
    const idx = repos.indexOf(repo)
    if (dir === 'up' && idx > 0) [repos[idx - 1], repos[idx]] = [repos[idx], repos[idx - 1]]
    if (dir === 'down' && idx < repos.length - 1) [repos[idx], repos[idx + 1]] = [repos[idx + 1], repos[idx]]
    dispatch({ type: 'UPDATE_GITHUB_CONFIG', payload: { displayRepos: repos } })
  }

  return (
    <div className="space-y-4">
      {/* Live Sync from GitHub API */}
      <LiveSyncCard username={gc.username || 'jootaceehub'} />

      {/* Manual showcase registry */}
      <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/8 px-4 py-2.5">
          <div className="flex items-center gap-2 flex-1">
            <span className="h-1.5 w-1.5 rounded-full bg-pink-400 shrink-0" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 flex-1">Showcase Registry</span>
          </div>
          <span className="font-mono text-[9px] text-white/25">
            {gc.displayRepos.filter((r) => gc.repoMeta[r]?.pinned).length} pinned · {gc.displayRepos.length} total
          </span>
        </div>

        <div className="divide-y divide-white/5">
          {pinnedFirst.map((repo, idx) => {
            const meta: GithubRepoMeta = gc.repoMeta[repo] ?? { description: '', language: 'TypeScript', stars: 0, forks: 0, topics: [], pinned: false }
            return (
              <div key={repo} className="flex items-start gap-2 px-3 py-2">
                <div className="flex flex-col gap-0.5 shrink-0 pt-3">
                  <button onClick={() => reorder(repo, 'up')} disabled={idx === 0} className="text-white/20 hover:text-white/50 disabled:opacity-20 text-[9px] leading-none">▲</button>
                  <button onClick={() => reorder(repo, 'down')} disabled={idx === gc.displayRepos.length - 1} className="text-white/20 hover:text-white/50 disabled:opacity-20 text-[9px] leading-none">▼</button>
                </div>
                <div className="flex-1 min-w-0">
                  <RepoMetaEditor repo={repo} meta={meta} username={gc.username} />
                </div>
                <button onClick={() => removeRepo(repo)} className="shrink-0 rounded border border-red-400/10 px-1.5 py-1 font-mono text-[9px] text-red-400/25 hover:border-red-400/30 hover:text-red-400/70 transition-colors mt-2">✕</button>
              </div>
            )
          })}
          {gc.displayRepos.length === 0 && (
            <div className="px-4 py-6 text-center font-mono text-[11px] text-white/20">
              Usa Live Sync arriba para importar repos reales, o añade uno manualmente.
            </div>
          )}
        </div>

        <div className="border-t border-white/8 p-3">
          <div className="flex gap-2">
            <input value={newRepo} onChange={(e) => setNewRepo(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addRepo(newRepo) } }}
              placeholder="nombre-del-repositorio"
              className="flex-1 rounded-lg border border-white/10 bg-white/4 px-3 py-1.5 font-mono text-[12px] text-white/65 placeholder-white/20 focus:border-pink-400/30 focus:outline-none" />
            <button onClick={() => addRepo(newRepo)} className="rounded-lg border border-pink-400/25 bg-pink-400/8 px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] text-pink-400/70 hover:bg-pink-400/15 hover:text-pink-400 transition-colors">Añadir</button>
          </div>
        </div>
      </div>
    </div>
  )
}
