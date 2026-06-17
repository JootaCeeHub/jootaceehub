'use client'

import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useAdmin } from '@/lib/admin/store'
import type { GithubConfig, GithubRepoMeta } from '@/lib/admin/types'
import { RefreshCw, ExternalLink, Star, GitFork, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'builder' | 'profile' | 'repos' | 'starred' | 'display' | 'export'

const TABS: { id: Tab; label: string }[] = [
  { id: 'builder', label: '🏗 Página' },
  { id: 'profile', label: 'Perfil' },
  { id: 'repos',   label: 'Repos' },
  { id: 'starred', label: '⭐ Starred' },
  { id: 'display', label: 'Display' },
  { id: 'export',  label: 'Export' },
]

interface LiveRepo {
  name:        string
  description: string
  language:    string | null
  stars:       number
  forks:       number
  topics:      string[]
  url:         string
  updatedAt:   string
  isPrivate:   boolean
  isFork:      boolean
}

interface StarredRepo {
  name:        string
  owner:       string
  description: string
  language:    string | null
  stars:       number
  forks:       number
  topics:      string[]
  url:         string
  updatedAt:   string
}

interface LiveProfile {
  login:       string
  name:        string | null
  bio:         string | null
  location:    string | null
  avatarUrl:   string
  followers:   number
  following:   number
  publicRepos: number
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6', Python: '#3572A5', JavaScript: '#f7df1e',
  Rust: '#dea584', Go: '#00ADD8', Shell: '#89e051',
  CSS: '#563d7c', HTML: '#e34c26', MDX: '#f9ac00', Other: '#9e9e9e',
}

// ─── GitHub public API helpers ────────────────────────────────────────────────

async function fetchPublicRepos(username: string): Promise<LiveRepo[]> {
  const res = await fetch(
    `https://api.github.com/users/${username}/repos?sort=updated&per_page=30&type=owner`,
    { headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' } }
  )
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${res.statusText}`)
  const raw = await res.json() as Array<{
    name: string; description: string | null; language: string | null;
    stargazers_count: number; forks_count: number; topics?: string[];
    html_url: string; updated_at: string; private: boolean; fork: boolean;
  }>
  return raw.map(r => ({
    name:        r.name,
    description: r.description ?? '',
    language:    r.language,
    stars:       r.stargazers_count,
    forks:       r.forks_count,
    topics:      r.topics ?? [],
    url:         r.html_url,
    updatedAt:   r.updated_at,
    isPrivate:   r.private,
    isFork:      r.fork,
  }))
}

async function fetchPublicProfile(username: string): Promise<LiveProfile> {
  const res = await fetch(
    `https://api.github.com/users/${username}`,
    { headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' } }
  )
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${res.statusText}`)
  const u = await res.json() as {
    login: string; name: string | null; bio: string | null;
    location: string | null; avatar_url: string; followers: number; following: number; public_repos: number;
  }
  return { login: u.login, name: u.name, bio: u.bio, location: u.location, avatarUrl: u.avatar_url, followers: u.followers, following: u.following, publicRepos: u.public_repos }
}

type RawStarredItem = {
  name: string; owner: { login: string }; description: string | null; language: string | null;
  stargazers_count: number; forks_count: number; topics?: string[];
  html_url: string; updated_at: string;
}

async function fetchStarredRepos(username: string): Promise<StarredRepo[]> {
  const all: StarredRepo[] = []
  let page = 1
  while (page <= 5) { // safety cap at 500 repos
    const res = await fetch(
      `https://api.github.com/users/${username}/starred?per_page=100&sort=updated&page=${page}`,
      { headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' } }
    )
    if (!res.ok) throw new Error(`GitHub API ${res.status}: ${res.statusText}`)
    const raw = await res.json() as RawStarredItem[]
    all.push(...raw.map(r => ({
      name:        r.name,
      owner:       r.owner.login,
      description: r.description ?? '',
      language:    r.language,
      stars:       r.stargazers_count,
      forks:       r.forks_count,
      topics:      r.topics ?? [],
      url:         r.html_url,
      updatedAt:   r.updated_at,
    })))
    if (raw.length < 100) break
    page++
  }
  return all
}

function relTime(iso: string): string {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (d === 0) return 'today'
  if (d < 7)   return `${d}d ago`
  if (d < 30)  return `${Math.floor(d / 7)}w ago`
  return `${Math.floor(d / 30)}mo ago`
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function Toggle({ label, desc, value, onChange }: { label: string; desc?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-medium text-white/70">{label}</div>
        {desc && <div className="text-[9px] text-white/30 mt-0.5">{desc}</div>}
      </div>
      <button onClick={() => onChange(!value)} className={cn(
        'relative h-5 w-9 shrink-0 rounded-full border transition-colors',
        value ? 'border-pink-400/40 bg-pink-400/20' : 'border-white/15 bg-white/5'
      )}>
        <span className={cn(
          'absolute top-0.5 h-4 w-4 rounded-full transition-all',
          value ? 'left-[18px] bg-pink-400' : 'left-0.5 bg-white/30'
        )} />
      </button>
    </div>
  )
}

function RepoMetaEditor({ repo, meta, username }: { repo: string; meta: GithubRepoMeta; username: string }) {
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

function LiveSyncCard({ username }: { username: string }) {
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

// ─── Profile Tab ──────────────────────────────────────────────────────────────

function ProfileTab() {
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

      {/* Page sections — maps 1:1 to what renders on /en/github/ */}
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

// ─── Repos Tab ────────────────────────────────────────────────────────────────

function ReposTab() {
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

// ─── Display Tab ──────────────────────────────────────────────────────────────

function DisplayTab() {
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

      {/* Page sections — what renders on /en/github/ */}
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

// ─── Starred Tab ─────────────────────────────────────────────────────────────

function StarredTab({ username }: { username: string }) {
  const [status,  setStatus]  = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [repos,   setRepos]   = useState<StarredRepo[]>([])
  const [filter,  setFilter]  = useState('')

  const sync = useCallback(async () => {
    setStatus('loading')
    setMessage('')
    try {
      const data = await fetchStarredRepos(username)
      setRepos(data)
      setStatus('done')
      setMessage(`${data.length} repos con ⭐ encontrados`)
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'Error al conectar con GitHub API')
    }
  }, [username])

  const filtered = filter
    ? repos.filter(r =>
        r.name.toLowerCase().includes(filter.toLowerCase()) ||
        r.owner.toLowerCase().includes(filter.toLowerCase()) ||
        r.language?.toLowerCase().includes(filter.toLowerCase()) ||
        r.description.toLowerCase().includes(filter.toLowerCase())
      )
    : repos

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="rounded-xl border border-amber-400/15 bg-amber-400/[0.03] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-amber-400/10">
          <div>
            <div className="flex items-center gap-2">
              <Star className="h-3 w-3 text-amber-400/70 fill-amber-400/40 shrink-0" />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-amber-400/70">Repos Recomendados · Starred por @{username}</span>
            </div>
            <div className="mt-0.5 font-mono text-[9px] text-white/30">Repos a los que le has dado ⭐ — tus recomendaciones públicas</div>
          </div>
          <button
            onClick={sync}
            disabled={status === 'loading'}
            className={cn(
              'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.1em] transition-colors',
              status === 'loading' ? 'border-white/10 text-white/20 cursor-not-allowed' :
              'border-amber-400/25 bg-amber-400/8 text-amber-400/70 hover:bg-amber-400/15 hover:text-amber-400'
            )}
          >
            {status === 'loading'
              ? <><Loader2 className="h-3 w-3 animate-spin" /> Cargando...</>
              : <><RefreshCw className="h-3 w-3" /> Cargar Starred</>}
          </button>
        </div>

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

        {/* Empty / initial state */}
        {status === 'idle' && (
          <div className="px-4 py-6 text-center">
            <Star className="h-8 w-8 text-amber-400/20 mx-auto mb-2 fill-amber-400/10" />
            <div className="font-mono text-[10px] text-white/25">Presiona "Cargar Starred" para ver los repos que recomiendas</div>
          </div>
        )}
      </div>

      {/* Filter */}
      {repos.length > 0 && (
        <input
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Filtrar por nombre, lenguaje o descripción..."
          className="w-full rounded-lg border border-white/10 bg-white/4 px-3 py-2 font-mono text-[11px] text-white/65 placeholder-white/20 focus:border-amber-400/30 focus:outline-none transition-colors"
        />
      )}

      {/* Stats */}
      {repos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Total Starred', value: repos.length, color: '#f59e0b' },
            { label: 'Languages', value: new Set(repos.map(r => r.language).filter(Boolean)).size, color: '#34d399' },
            { label: 'Own Repos', value: repos.filter(r => r.owner.toLowerCase() === username.toLowerCase()).length, color: '#a78bfa' },
          ].map(m => (
            <div key={m.label} className="rounded-xl border border-white/8 bg-white/[0.025] px-3 py-2.5 text-center">
              <div className="text-[18px] font-semibold tabular-nums" style={{ color: m.color }}>{m.value}</div>
              <div className="font-mono text-[8px] uppercase tracking-[0.14em] text-white/25 mt-0.5">{m.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Repo list */}
      {filtered.length > 0 && (
        <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden divide-y divide-white/5">
          {filtered.map(r => (
            <div key={`${r.owner}/${r.name}`} className="flex items-start gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors group">
              <Star className="h-3.5 w-3.5 text-amber-400/50 fill-amber-400/30 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-[11px] font-medium text-white/70 group-hover:text-amber-400/80 transition-colors"
                  >
                    <span className="text-white/35">{r.owner}/</span>{r.name}
                  </a>
                  {r.language && (
                    <span className="font-mono text-[8px]" style={{ color: LANGUAGE_COLORS[r.language] ?? '#9e9e9e' }}>
                      ● {r.language}
                    </span>
                  )}
                  {r.owner.toLowerCase() === username.toLowerCase() && (
                    <span className="rounded border border-pink-400/15 px-1.5 font-mono text-[7px] uppercase text-pink-400/50">tuyo</span>
                  )}
                </div>
                {r.description && (
                  <div className="mt-0.5 font-mono text-[9px] text-white/30 line-clamp-1">{r.description}</div>
                )}
                {r.topics.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {r.topics.slice(0, 4).map(t => (
                      <span key={t} className="rounded-md border border-white/8 px-1.5 py-px font-mono text-[7px] text-white/25">#{t}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <div className="flex items-center gap-2">
                  {r.stars > 0 && (
                    <span className="flex items-center gap-0.5 font-mono text-[9px] text-amber-400/60">
                      <Star className="h-2.5 w-2.5 fill-amber-400/30" />{r.stars.toLocaleString()}
                    </span>
                  )}
                  {r.forks > 0 && (
                    <span className="flex items-center gap-0.5 font-mono text-[9px] text-white/25">
                      <GitFork className="h-2.5 w-2.5" />{r.forks}
                    </span>
                  )}
                </div>
                <span className="font-mono text-[8px] text-white/20">{relTime(r.updatedAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty filtered */}
      {repos.length > 0 && filtered.length === 0 && (
        <div className="py-6 text-center font-mono text-[11px] text-white/20">
          Sin resultados para "{filter}"
        </div>
      )}
    </div>
  )
}

// ─── Export Tab ───────────────────────────────────────────────────────────────

function ExportTab() {
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

// ─── Page Builder Tab ─────────────────────────────────────────────────────────

function PageBuilderTab() {
  const { state, dispatch } = useAdmin()
  const { githubConfig: gc } = state

  function update(data: Partial<GithubConfig>) {
    dispatch({ type: 'UPDATE_GITHUB_CONFIG', payload: data })
  }

  const langStats = gc.displayRepos.reduce<Record<string, number>>((acc, r) => {
    const lang = gc.repoMeta[r]?.language ?? 'Other'
    acc[lang] = (acc[lang] ?? 0) + 1
    return acc
  }, {})
  const maxLangCount = Math.max(...Object.values(langStats), 1)

  return (
    <div className="space-y-4">

      {/* ── Page Hero ───────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-violet-400/15 bg-white/[0.02] overflow-hidden">
        <div className="flex items-center gap-2 border-b border-white/8 px-4 py-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shrink-0" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 flex-1">Hero de la Página</span>
          <span className="font-mono text-[8px] text-white/20">/en/github/ → H1</span>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Badge / Etiqueta</div>
              <input
                value={gc.pageBadge}
                onChange={(e) => update({ pageBadge: e.target.value })}
                placeholder="Open Source"
                className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 text-[11px] text-white/65 placeholder-white/20 outline-none focus:border-violet-400/25 transition-colors"
              />
            </div>
            <div className="space-y-1">
              <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Headline</div>
              <input
                value={gc.pageHeadline}
                onChange={(e) => update({ pageHeadline: e.target.value })}
                placeholder="GitHub"
                className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 text-[11px] text-white/65 placeholder-white/20 outline-none focus:border-violet-400/25 transition-colors"
              />
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Subheadline / Descripción</div>
            <input
              value={gc.pageSubheadline}
              onChange={(e) => update({ pageSubheadline: e.target.value })}
              placeholder="Open source projects, activity..."
              className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 text-[11px] text-white/65 placeholder-white/20 outline-none focus:border-violet-400/25 transition-colors"
            />
          </div>
          {/* Live preview chip */}
          <div className="rounded-lg border border-white/5 bg-black/15 px-3 py-2.5">
            <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/20 mb-2">Preview</div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/20 bg-violet-400/8 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-violet-400/70">
              <span className="h-1 w-1 rounded-full bg-violet-400/60" />
              {gc.pageBadge || 'Open Source'}
            </span>
            <div className="mt-1.5 text-lg font-semibold text-white/60">{gc.pageHeadline || 'GitHub'}.</div>
            <div className="mt-0.5 text-[10px] text-white/30 leading-relaxed">{gc.pageSubheadline || 'Descripción de la página'}</div>
          </div>
        </div>
      </div>

      {/* ── Section Visibility Matrix ────────────────────────────────────────── */}
      <div className="rounded-xl border border-violet-400/15 bg-white/[0.02] overflow-hidden">
        <div className="flex items-center gap-2 border-b border-white/8 px-4 py-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shrink-0" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 flex-1">Secciones Visibles</span>
          <span className="font-mono text-[8px] text-white/20">Qué muestra /en/github/</span>
        </div>
        <div className="divide-y divide-white/5 px-4">
          <Toggle label="Card de perfil"           desc="Avatar, bio, followers — cabecera de la página"    value={gc.showProfileCard}       onChange={(v) => update({ showProfileCard: v })} />
          <Toggle label="Mis Repositorios"         desc="Cuadrícula de repos del showcase"                  value={gc.showOwnRepos ?? true}  onChange={(v) => update({ showOwnRepos: v })} />
          <Toggle label="Heatmap de contribuciones" desc="Gráfico de calor — año completo desde GitHub API" value={gc.showContributions}     onChange={(v) => update({ showContributions: v })} />
          <Toggle label="Starred / Recomendados"   desc="⭐ Repos con estrella — hasta 300 paginados"       value={gc.showStarred}           onChange={(v) => update({ showStarred: v })} />
          <Toggle label="Stats en el perfil card"  desc="4 indicadores: Repos · Contributions · Stars · Slot 4" value={gc.showStats}       onChange={(v) => update({ showStats: v })} />
          <Toggle label="Lenguajes en perfil card" desc="Barras de distribución de lenguajes"               value={gc.showLanguages}         onChange={(v) => update({ showLanguages: v })} />
          <Toggle label="Topics en repo cards"     desc="Tags de topics en cada tarjeta"                    value={gc.showTopics}            onChange={(v) => update({ showTopics: v })} />
          <Toggle label="Forks en repo cards"      desc="Contador de forks en cada tarjeta"                 value={gc.showForks}             onChange={(v) => update({ showForks: v })} />
        </div>
      </div>

      {/* ── Own Repos Section Config ─────────────────────────────────────────── */}
      {(gc.showOwnRepos ?? true) && (
        <div className="rounded-xl border border-violet-400/15 bg-white/[0.02] overflow-hidden">
          <div className="flex items-center gap-2 border-b border-white/8 px-4 py-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shrink-0" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 flex-1">Sección: Mis Repositorios</span>
          </div>
          <div className="p-4 space-y-3">
            <div className="space-y-1">
              <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Título</div>
              <input
                value={gc.ownReposTitle}
                onChange={(e) => update({ ownReposTitle: e.target.value })}
                placeholder="My Repositories"
                className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 text-[11px] text-white/65 placeholder-white/20 outline-none focus:border-violet-400/25 transition-colors"
              />
            </div>
            <div className="space-y-1">
              <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Subtítulo</div>
              <input
                value={gc.ownReposSubtitle}
                onChange={(e) => update({ ownReposSubtitle: e.target.value })}
                placeholder="Open source projects I maintain..."
                className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 text-[11px] text-white/65 placeholder-white/20 outline-none focus:border-violet-400/25 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Límite de repos</div>
                <span className="font-mono text-[11px] text-violet-400">{gc.ownReposLimit > 0 ? gc.ownReposLimit : 'Todos'}</span>
              </div>
              <input
                type="range" min={0} max={12} step={1} value={gc.ownReposLimit}
                onChange={(e) => update({ ownReposLimit: Number(e.target.value) })}
                className="w-full h-1 accent-violet-400 cursor-pointer"
              />
              <div className="font-mono text-[8px] text-white/20">0 = mostrar todos los repos configurados</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Starred Section Config ───────────────────────────────────────────── */}
      {gc.showStarred && (
        <div className="rounded-xl border border-violet-400/15 bg-white/[0.02] overflow-hidden">
          <div className="flex items-center gap-2 border-b border-white/8 px-4 py-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shrink-0" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 flex-1">Sección: Starred / Recomendados</span>
          </div>
          <div className="p-4 space-y-3">
            <div className="space-y-1">
              <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Título</div>
              <input
                value={gc.starredTitle}
                onChange={(e) => update({ starredTitle: e.target.value })}
                placeholder="Repos Recomendados"
                className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 text-[11px] text-white/65 placeholder-white/20 outline-none focus:border-violet-400/25 transition-colors"
              />
            </div>
            <div className="space-y-1">
              <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Subtítulo</div>
              <input
                value={gc.starredSubtitle}
                onChange={(e) => update({ starredSubtitle: e.target.value })}
                placeholder="Proyectos y herramientas que recomiendo..."
                className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 text-[11px] text-white/65 placeholder-white/20 outline-none focus:border-violet-400/25 transition-colors"
              />
            </div>
            <Toggle
              label="Categorías / filtros"
              desc="Tabs: AI/ML, Web/UI, Tools, Infra, Python, Rust, Data, Security"
              value={gc.showStarredCategories}
              onChange={(v) => update({ showStarredCategories: v })}
            />
          </div>
        </div>
      )}

      {/* ── Stats + Language preview ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Stat Slot 4 */}
        <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
          <div className="border-b border-white/8 px-3 py-2">
            <span className="text-[9px] uppercase tracking-[0.18em] text-white/40">Stat Slot 4</span>
          </div>
          <div className="p-2 space-y-1.5">
            {([
              { value: 'starred' as const, label: '⭐ Repos Starred' },
              { value: 'forks'   as const, label: '⑂ Total Forks'   },
            ]).map(opt => (
              <button key={opt.value} onClick={() => update({ statSlot4: opt.value })}
                className={cn(
                  'w-full rounded-lg border px-2.5 py-1.5 text-left font-mono text-[10px] transition-all',
                  (gc.statSlot4 === opt.value || (!gc.statSlot4 && opt.value === 'starred'))
                    ? 'border-violet-400/30 bg-violet-400/8 text-violet-300'
                    : 'border-white/8 text-white/35 hover:border-white/15'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Language distribution */}
        <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
          <div className="border-b border-white/8 px-3 py-2">
            <span className="text-[9px] uppercase tracking-[0.18em] text-white/40">Lenguajes</span>
          </div>
          <div className="p-2.5 space-y-1.5">
            {Object.keys(langStats).length === 0 ? (
              <div className="py-3 text-center font-mono text-[9px] text-white/20">Sin repos</div>
            ) : (
              Object.entries(langStats)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([lang, count]) => (
                  <div key={lang} className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: LANGUAGE_COLORS[lang] ?? '#9e9e9e' }} />
                    <span className="w-16 text-[9px] text-white/50 shrink-0 truncate">{lang}</span>
                    <div className="flex-1 h-1 rounded-full bg-white/8 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(count / maxLangCount) * 100}%`, background: LANGUAGE_COLORS[lang] ?? '#9e9e9e' }} />
                    </div>
                    <span className="font-mono text-[8px] text-white/25 w-3 text-right">{count}</span>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function GitHubLayerPanel() {
  const { state } = useAdmin()
  const { githubConfig: gc } = state
  const [tab, setTab] = useState<Tab>('builder')

  const pinnedCount = gc.displayRepos.filter((r) => gc.repoMeta[r]?.pinned).length
  const totalStars  = gc.displayRepos.reduce((s, r) => s + (gc.repoMeta[r]?.stars ?? 0), 0)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.24em] text-pink-400/60">GitHub Layer</div>
        <h1 className="text-xl font-semibold tracking-tight text-white/90">Code Intelligence</h1>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white/25">
          @{gc.username} · {gc.displayRepos.length} showcase repos
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Showcase Repos', value: gc.displayRepos.length, color: '#f472b6' },
          { label: 'Pinned',         value: pinnedCount,             color: '#a78bfa' },
          { label: 'Total Stars',    value: totalStars,              color: '#f59e0b' },
          { label: 'Activity',       value: gc.showActivity ? 'On' : 'Off', color: '#34d399' },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-white/8 bg-white/[0.025] px-3 py-2.5 text-center">
            <div className="text-[15px] font-semibold tabular-nums" style={{ color: m.color }}>{m.value}</div>
            <div className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.14em] text-white/25">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-white/8 bg-white/[0.02] p-1">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={cn(
            'flex-1 rounded-lg py-1.5 font-mono text-[9px] uppercase tracking-[0.12em] transition-colors',
            tab === t.id ? 'bg-pink-400/15 text-pink-400 border border-pink-400/20' : 'text-white/30 hover:text-white/55'
          )}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'builder' && <PageBuilderTab />}
      {tab === 'profile' && <ProfileTab />}
      {tab === 'repos'   && <ReposTab />}
      {tab === 'starred' && <StarredTab username={gc.username || 'jootaceehub'} />}
      {tab === 'display' && <DisplayTab />}
      {tab === 'export'  && <ExportTab />}
    </div>
  )
}
