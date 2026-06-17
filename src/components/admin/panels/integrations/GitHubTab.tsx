'use client'

import { useState, useCallback, useDeferredValue } from 'react'
import { GitBranch, RefreshCw, Plug, Plus, Star, Lock, ExternalLink, CheckCircle2, Loader2, Search } from 'lucide-react'
import { useAdmin } from '@/lib/admin/store'
import type { DataSource } from '@/lib/admin/types'
import { fetchGitHubRepoSource } from '@/lib/integrations/sources'

interface Props {
  onNavigateToSources: () => void
}

export function GitHubTab({ onNavigateToSources }: Props) {
  const { state, dispatch } = useAdmin()
  const { github, dataSources } = state.integrations

  const [pat, setPat] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [ghError, setGhError] = useState<string | null>(null)
  const [repoFilter, setRepoFilter] = useState('')
  const [busyRepos, setBusyRepos] = useState<Set<string>>(new Set())
  const deferredFilter = useDeferredValue(repoFilter)

  const addSource = useCallback((src: DataSource) => {
    dispatch({ type: 'SOURCES_ADD', payload: src })
  }, [dispatch])

  const updateSource = useCallback((id: string, data: Partial<DataSource>) => {
    dispatch({ type: 'SOURCES_UPDATE', payload: { id, data } })
  }, [dispatch])

  const handleConnect = useCallback(async () => {
    if (!pat.trim()) return
    setIsConnecting(true)
    setGhError(null)
    try {
      const [userRes, reposRes] = await Promise.all([
        fetch('https://api.github.com/user', { headers: { Authorization: `Bearer ${pat.trim()}`, Accept: 'application/vnd.github+json' } }),
        fetch('https://api.github.com/user/repos?per_page=100&sort=updated', { headers: { Authorization: `Bearer ${pat.trim()}`, Accept: 'application/vnd.github+json' } }),
      ])
      if (!userRes.ok) throw new Error('Invalid token')
      const user = await userRes.json() as { login: string; avatar_url: string }
      const rawRepos = await reposRes.json() as Array<{ name: string; full_name: string; description: string | null; stargazers_count: number; forks_count: number; language: string | null; html_url: string; private: boolean; updated_at: string; topics?: string[] }>
      const repos = rawRepos.map((r) => ({
        name: r.name, fullName: r.full_name, description: r.description ?? '', stars: r.stargazers_count,
        forks: r.forks_count, language: r.language ?? '', url: r.html_url, isPrivate: r.private,
        updatedAt: r.updated_at, topics: r.topics ?? [],
      }))
      dispatch({ type: 'INTEGRATIONS_SET_GITHUB', payload: { connected: true, accessToken: pat.trim(), username: user.login, avatarUrl: user.avatar_url, repos, lastSync: new Date().toISOString() } })
      setPat('')
    } catch (err) {
      setGhError(err instanceof Error ? err.message : 'Connection failed')
    } finally {
      setIsConnecting(false)
    }
  }, [dispatch, pat])

  const handleSync = useCallback(async () => {
    if (!github.accessToken) return
    setIsSyncing(true)
    try {
      const res = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', { headers: { Authorization: `Bearer ${github.accessToken}`, Accept: 'application/vnd.github+json' } })
      if (res.ok) {
        const raw = await res.json() as Array<{ name: string; full_name: string; description: string | null; stargazers_count: number; forks_count: number; language: string | null; html_url: string; private: boolean; updated_at: string; topics?: string[] }>
        const repos = raw.map((r) => ({ name: r.name, fullName: r.full_name, description: r.description ?? '', stars: r.stargazers_count, forks: r.forks_count, language: r.language ?? '', url: r.html_url, isPrivate: r.private, updatedAt: r.updated_at, topics: r.topics ?? [] }))
        dispatch({ type: 'INTEGRATIONS_SET_GITHUB', payload: { repos, lastSync: new Date().toISOString() } })
      }
    } finally {
      setIsSyncing(false)
    }
  }, [dispatch, github.accessToken])

  const handleAddRepoSource = useCallback(async (repo: typeof github.repos[0]) => {
    setBusyRepos((prev) => new Set(prev).add(repo.name))
    const pending: DataSource = {
      id: `gh-${repo.fullName.replace('/', '-')}-${Date.now()}`,
      type: 'github-repo', name: repo.name, description: repo.description || repo.fullName,
      url: repo.url, content: '', fileTree: [], metadata: { fullName: repo.fullName, language: repo.language, stars: repo.stars },
      status: 'indexing', addedAt: new Date().toISOString(), byteSize: 0,
    }
    addSource(pending)
    const result = await fetchGitHubRepoSource(repo, github.accessToken)
    updateSource(pending.id, { ...result, id: pending.id })
    setBusyRepos((prev) => { const n = new Set(prev); n.delete(repo.name); return n })
    onNavigateToSources()
  }, [addSource, github, updateSource, onNavigateToSources])

  const filteredRepos = github.repos.filter((r) =>
    !deferredFilter || r.name.toLowerCase().includes(deferredFilter.toLowerCase()) || r.description.toLowerCase().includes(deferredFilter.toLowerCase())
  )
  const alreadyAdded = new Set(dataSources.filter((s) => s.type === 'github-repo').map((s) => (s.metadata.fullName as string) ?? s.name))
  const repoSources = dataSources.filter((s) => s.type === 'github-repo').length

  return (
    <div className="overflow-hidden rounded-xl border border-white/8 bg-white/[0.02]">
      <div className="flex items-center justify-between border-b border-white/8 px-4 py-2.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">GitHub Connection</span>
        {github.lastSync && <span className="font-mono text-[9px] text-white/20">Synced {github.lastSync.slice(0, 10)}</span>}
      </div>

      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]"><GitBranch className="h-5 w-5 text-white/60" /></div>
          <div className="flex-1 min-w-0">
            <div className="font-mono text-[12px] font-semibold text-white/80">GitHub</div>
            <div className="mt-0.5 font-mono text-[10px] text-white/35">Conecta con token personal para acceder a todos tus repos</div>
          </div>
          <div className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${github.connected ? 'border border-emerald-400/20 bg-emerald-400/10 text-emerald-400' : 'border border-white/10 bg-white/5 text-white/30'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${github.connected ? 'bg-emerald-400' : 'bg-white/25'}`} />
            {github.connected ? 'Connected' : 'Not connected'}
          </div>
        </div>

        {github.connected ? (
          <>
            <div className="mt-3 flex items-center gap-3 pl-1">
              {github.avatarUrl
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={github.avatarUrl} alt={github.username} className="h-8 w-8 rounded-full ring-1 ring-white/10 object-cover" referrerPolicy="no-referrer" />
                : <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-400/15 font-mono text-[11px] font-semibold text-cyan-400">{github.username.charAt(0).toUpperCase()}</div>
              }
              <div>
                <div className="font-mono text-[12px] font-semibold text-white/75">@{github.username}</div>
                <div className="font-mono text-[10px] text-white/35">{github.repos.length} repos · {repoSources} added as sources</div>
              </div>
              <button onClick={handleSync} disabled={isSyncing} className="ml-auto flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[10px] text-white/50 transition-colors hover:bg-white/10 hover:text-white/75">
                <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing…' : 'Sync'}
              </button>
              <button onClick={() => dispatch({ type: 'INTEGRATIONS_DISCONNECT_GITHUB' })} className="rounded-lg border border-red-400/15 px-3 py-1.5 font-mono text-[10px] text-red-400/60 transition-colors hover:bg-red-400/10 hover:text-red-400">
                Disconnect
              </button>
            </div>

            <div className="mt-4 mb-2 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">Repositories ({filteredRepos.length})</span>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-white/25" />
                <input
                  type="text"
                  placeholder="Filter repos…"
                  className="w-48 rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 font-mono text-[10px] text-white/50 placeholder-white/20 outline-none focus:border-white/20 pl-7"
                  value={repoFilter}
                  onChange={(e) => setRepoFilter(e.target.value)}
                />
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-1.5 pr-1">
              {filteredRepos.map((repo) => {
                const added = alreadyAdded.has(repo.fullName)
                const busy = busyRepos.has(repo.name)
                return (
                  <div key={repo.name} className="flex items-start gap-3 rounded-xl border border-white/6 bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.04]">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-semibold text-white/75">{repo.name}</span>
                        {repo.isPrivate && (
                          <span className="rounded-full border border-amber-400/20 px-1.5 py-0.5 font-mono text-[8px] uppercase text-amber-400/60">
                            <Lock className="h-2 w-2 inline" /> Private
                          </span>
                        )}
                        <a href={repo.url} target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-white/50" onClick={(e) => e.stopPropagation()}>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      {repo.description && <div className="mt-0.5 font-mono text-[9px] text-white/30 line-clamp-1">{repo.description}</div>}
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        {repo.language && <span className="font-mono text-[9px] text-white/35">{repo.language}</span>}
                        {repo.stars > 0 && <span className="font-mono text-[9px] text-white/30"><Star className="h-2.5 w-2.5 inline mr-0.5" />{repo.stars}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => !added && !busy && handleAddRepoSource(repo)}
                      disabled={added || busy}
                      className="ml-auto flex shrink-0 items-center gap-1.5 rounded-lg border border-violet-400/20 bg-violet-400/8 px-2.5 py-1 font-mono text-[9px] text-violet-400 transition-colors hover:bg-violet-400/15 disabled:opacity-40 disabled:cursor-not-allowed"
                      title={added ? 'Already added as source' : 'Add as data source'}
                    >
                      {busy
                        ? <><Loader2 className="h-3 w-3 animate-spin" />Indexing…</>
                        : added
                          ? <><CheckCircle2 className="h-3 w-3" />Added</>
                          : <><Plus className="h-3 w-3" />Add source</>
                      }
                    </button>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <div className="mt-3 space-y-2">
            <div className="font-mono text-[10px] text-white/40">Personal Access Token (PAT)</div>
            <input
              type="password"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 font-mono text-[11px] text-white/70 placeholder-white/20 outline-none transition-colors focus:border-cyan-400/30"
              value={pat}
              onChange={(e) => setPat(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
            />
            <div className="font-mono text-[9px] text-white/25 leading-relaxed">
              github.com/settings/tokens → New token → scope: <strong>repo</strong> (read).
              Se guarda localmente en el navegador.
            </div>
            {ghError && <div className="font-mono text-[10px] text-red-400">{ghError}</div>}
            <button onClick={handleConnect} disabled={!pat.trim() || isConnecting} className="flex items-center gap-2 rounded-xl border border-cyan-400/25 bg-cyan-400/8 px-4 py-2 font-mono text-[11px] text-cyan-400 transition-colors hover:bg-cyan-400/15">
              <Plug className="h-3.5 w-3.5" />
              {isConnecting ? 'Connecting…' : 'Connect GitHub'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
