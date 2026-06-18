'use client'

import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Star, GitFork, RefreshCw, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { fetchStarredRepos, LANGUAGE_COLORS, relTime } from './primitives'
import type { StarredRepo } from './primitives'

// ─── Starred Tab ──────────────────────────────────────────────────────────────

export function StarredTab({ username }: { username: string }) {
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
            <div className="font-mono text-[10px] text-white/25">Presiona &quot;Cargar Starred&quot; para ver los repos que recomiendas</div>
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
          Sin resultados para &quot;{filter}&quot;
        </div>
      )}
    </div>
  )
}
