'use client'

import { useState } from 'react'
import { useAdmin } from '@/lib/admin/store'
import type { TrackedSourceType } from '@/lib/admin/types'
import { LINK_CATEGORIES, SOURCE_TYPES, extractDomain } from './utils'
import type { IntelSubTab } from './utils'
import { CollectionsContent } from './CollectionsContent'

export function IntelligenceTab() {
  const { state, dispatch } = useAdmin()
  const [subTab, setSubTab] = useState<IntelSubTab>('feeds')

  // Feeds state
  const [intelSearch, setIntelSearch] = useState('')
  const [catFilter, setCatFilter] = useState<string>('all')

  // Sources state
  const [filterType, setFilterType] = useState<TrackedSourceType | 'all'>('all')

  const allIntelFeeds = state.intelligence.feeds
  const sources = state.trackedSources
  const links = state.curatedLinks

  const enabledFeeds = allIntelFeeds.filter((f) => f.enabled).length
  const active = sources.filter((src) => src.active).length

  function truncateUrl(url: string, max = 36): string {
    if (!url) return ''
    try {
      const u = new URL(url)
      const short = u.hostname + (u.pathname !== '/' ? u.pathname : '')
      return short.length > max ? short.slice(0, max) + '…' : short
    } catch {
      return url.slice(0, max) + (url.length > max ? '…' : '')
    }
  }

  const intelCategories = Array.from(new Set(allIntelFeeds.map((f) => f.category))).sort()
  const filteredIntelFeeds = allIntelFeeds.filter((f) => {
    const catOk = catFilter === 'all' || f.category === catFilter
    if (!catOk) return false
    if (!intelSearch.trim()) return true
    const q = intelSearch.toLowerCase()
    return (
      f.name.toLowerCase().includes(q) ||
      f.description.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q)
    )
  })

  const filteredSources = filterType === 'all' ? sources : sources.filter((src) => src.sourceType === filterType)

  void LINK_CATEGORIES

  return (
    <div className="space-y-4">
      {/* Sub-tab bar */}
      <div className="flex gap-1 rounded-xl border border-white/8 bg-white/[0.02] p-1">
        <button className={subTab === 'feeds' ? 'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.1em] transition-colors bg-cyan-400/15 text-cyan-400 border border-cyan-400/20' : 'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.1em] transition-colors text-white/30 hover:text-white/55'} onClick={() => setSubTab('feeds')}>
          📡 Feeds
          <span className="rounded-full border border-white/10 bg-white/5 px-1.5 py-0 font-mono text-[8px] text-white/30">{allIntelFeeds.length}</span>
        </button>
        <button className={subTab === 'collections' ? 'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.1em] transition-colors bg-cyan-400/15 text-cyan-400 border border-cyan-400/20' : 'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.1em] transition-colors text-white/30 hover:text-white/55'} onClick={() => setSubTab('collections')}>
          🔗 Collections
          <span className="rounded-full border border-white/10 bg-white/5 px-1.5 py-0 font-mono text-[8px] text-white/30">{links.length}</span>
        </button>
        <button className={subTab === 'sources' ? 'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.1em] transition-colors bg-cyan-400/15 text-cyan-400 border border-cyan-400/20' : 'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.1em] transition-colors text-white/30 hover:text-white/55'} onClick={() => setSubTab('sources')}>
          🔖 Sources
          <span className="rounded-full border border-white/10 bg-white/5 px-1.5 py-0 font-mono text-[8px] text-white/30">{sources.length}</span>
        </button>
      </div>

      {/* ── Feeds sub-tab ────────────────────────────────────────────────────── */}
      {subTab === 'feeds' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-400/70">Intelligence Feeds — {allIntelFeeds.length} sources</div>
              <div className="font-mono text-[9px] text-white/30">{enabledFeeds} enabled · {allIntelFeeds.filter((f) => f.publishable).length} publishable</div>
            </div>
            <button className="rounded-lg border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5 font-mono text-[9px] uppercase tracking-wider text-cyan-400/70 hover:bg-cyan-400/10 hover:text-cyan-400 transition-colors cursor-pointer" onClick={() => dispatch({ type: 'SET_PANEL', payload: 'intelligence' })}>
              Manage →
            </button>
          </div>

          <input
            value={intelSearch}
            onChange={(e) => setIntelSearch(e.target.value)}
            placeholder="Search feeds…"
            className="w-full rounded-lg border border-white/10 bg-white/[0.02] px-3 py-1.5 font-mono text-[10px] text-white/70 placeholder:text-white/20 outline-none focus:border-cyan-400/30 transition-colors"
          />

          <div className="flex flex-wrap gap-1.5 px-3 pb-2">
            <button onClick={() => setCatFilter('all')} className={catFilter === 'all' ? 'rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 font-mono text-[8px] text-cyan-400 transition-colors' : 'rounded-full border border-white/10 bg-white/3 px-2 py-0.5 font-mono text-[8px] text-white/35 hover:text-white/60 transition-colors'}>All</button>
            {intelCategories.map((cat) => (
              <button key={cat} onClick={() => setCatFilter(cat)} className={catFilter === cat ? 'rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 font-mono text-[8px] text-cyan-400 transition-colors' : 'rounded-full border border-white/10 bg-white/3 px-2 py-0.5 font-mono text-[8px] text-white/35 hover:text-white/60 transition-colors'}>
                {cat} ({allIntelFeeds.filter((f) => f.category === cat).length})
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            {filteredIntelFeeds.map((feed) => {
              const displayUrl = feed.website ?? feed.url
              return (
                <div key={feed.id} className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3 hover:border-cyan-400/15 transition-colors">
                  <span className="shrink-0 text-base mt-0.5">{feed.icon}</span>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="text-[12px] font-medium text-white/75">{feed.name}</div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`rounded border ${{ ai: 'border-violet-400/30 text-violet-300', tech: 'border-cyan-400/30 text-cyan-300', research: 'border-blue-400/30 text-blue-300', security: 'border-red-400/30 text-red-300', tool: 'border-cyan-400/30 text-cyan-300', resource: 'border-blue-400/30 text-blue-300' }[feed.category as string] ?? 'border-white/15 text-white/40'} bg-white/3 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-widest`}>{feed.category}</span>
                      <span className={feed.plan === 'free' ? 'rounded border border-emerald-400/30 bg-emerald-400/8 px-1.5 py-0.5 font-mono text-[8px] uppercase text-emerald-400/80' : feed.plan === 'freemium' ? 'rounded border border-amber-400/30 bg-amber-400/8 px-1.5 py-0.5 font-mono text-[8px] uppercase text-amber-400/80' : 'rounded border border-rose-400/30 bg-rose-400/8 px-1.5 py-0.5 font-mono text-[8px] uppercase text-rose-400/80'}>{feed.plan}</span>
                      <span className={feed.enabled ? 'rounded border border-emerald-400/25 bg-emerald-400/8 px-1.5 py-0.5 font-mono text-[7.5px] uppercase text-emerald-400/80' : 'rounded border border-white/10 bg-white/3 px-1.5 py-0.5 font-mono text-[7.5px] uppercase text-white/25'}>
                        {feed.enabled ? 'enabled' : 'off'}
                      </span>
                      {displayUrl && (
                        <a href={displayUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-[8.5px] text-cyan-400/60 hover:text-cyan-400 transition-colors truncate max-w-[200px] underline underline-offset-2" title={displayUrl}>
                          {truncateUrl(displayUrl, 32)}
                        </a>
                      )}
                    </div>
                    {feed.description && <div className="mt-0.5 text-[9.5px] leading-relaxed text-white/30 line-clamp-2">{feed.description}</div>}
                  </div>
                  <button className="shrink-0 rounded border border-white/10 px-2 py-1 font-mono text-[9px] text-white/25 hover:border-cyan-400/25 hover:text-cyan-400/60 transition-colors cursor-pointer" onClick={() => dispatch({ type: 'SET_PANEL', payload: 'intelligence' })}>
                    ↗
                  </button>
                </div>
              )
            })}
            {filteredIntelFeeds.length === 0 && (
              <div className="rounded-xl border border-white/5 bg-white/[0.01] py-8 text-center"><div className="text-[11px] text-white/20 max-w-xs mx-auto leading-relaxed">No feeds match the search.</div></div>
            )}
          </div>
        </div>
      )}

      {/* ── Collections sub-tab ──────────────────────────────────────────────── */}
      {subTab === 'collections' && <CollectionsContent />}

      {/* ── Sources sub-tab ──────────────────────────────────────────────────── */}
      {subTab === 'sources' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] text-white/40">{sources.length} sources</span>
            <span className="font-mono text-[10px] text-emerald-400/60">{active} active</span>
            <div className="flex flex-wrap gap-1 flex-1">
              <button onClick={() => setFilterType('all')} className={filterType === 'all' ? 'rounded-full border border-white/20 bg-white/8 px-2 py-0.5 font-mono text-[8px] text-white/60 transition-colors' : 'rounded-full border border-white/10 px-2 py-0.5 font-mono text-[8px] text-white/30 hover:text-white/55 transition-colors'}>All</button>
              {SOURCE_TYPES.map((t) => {
                const count = sources.filter((src) => src.sourceType === t.id).length
                if (count === 0) return null
                return (
                  <button key={t.id} onClick={() => setFilterType(t.id)} className={filterType === t.id ? 'rounded-full border border-white/20 bg-white/8 px-2 py-0.5 font-mono text-[8px] text-white/60 transition-colors' : 'rounded-full border border-white/10 px-2 py-0.5 font-mono text-[8px] text-white/30 hover:text-white/55 transition-colors'}>
                    {t.icon} {t.label} ({count})
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            {filteredSources.map((source) => {
              const typeInfo = SOURCE_TYPES.find((t) => t.id === source.sourceType)
              return (
                <div key={source.id} className={`rounded-xl border overflow-hidden transition-all ${source.active ? 'border-white/8 bg-white/[0.02]' : 'border-white/5 bg-white/[0.01] opacity-50'}`}>
                  <div className="flex items-start gap-3 px-4 py-3">
                    <span className="mt-0.5 text-[18px] shrink-0" style={{ color: typeInfo?.color }}>{typeInfo?.icon ?? '🌐'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium text-white/75">{source.name}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[8.5px]" style={{ color: typeInfo?.color }}>{typeInfo?.label}</span>
                        {source.url && <span className="font-mono text-[8.5px] text-white/25">{extractDomain(source.url)}</span>}
                      </div>
                      {source.description && <div className="text-[10px] text-white/40 mt-1">{source.description}</div>}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {source.url && <a href={source.url} target="_blank" rel="noreferrer" className="rounded border border-white/10 px-1.5 py-0.5 font-mono text-[9px] text-white/30 hover:border-white/20 hover:text-white/60 transition-colors">↗</a>}
                      <button onClick={() => dispatch({ type: 'UPDATE_TRACKED_SOURCE', payload: { id: source.id, data: { active: !source.active } } })} className={`rounded border px-1.5 py-0.5 font-mono text-[8px] uppercase transition-colors ${source.active ? 'border-emerald-400/20 text-emerald-400/70 bg-emerald-400/5' : 'border-white/10 text-white/25 hover:border-white/20'}`}>
                        {source.active ? 'active' : 'inactive'}
                      </button>
                      <button onClick={() => dispatch({ type: 'REMOVE_TRACKED_SOURCE', payload: source.id })} className="rounded border border-red-400/10 px-1.5 py-0.5 font-mono text-[9px] text-red-400/25 hover:border-red-400/30 hover:text-red-400/70 transition-colors">✕</button>
                    </div>
                  </div>
                </div>
              )
            })}
            {filteredSources.length === 0 && <div className="rounded-xl border border-white/5 bg-white/[0.01] py-8 text-center"><div className="text-[11px] text-white/20 max-w-xs mx-auto leading-relaxed">No tracked sources. Add newsletters, blogs, YouTube channels, GitHub repos, etc.</div></div>}
          </div>
        </div>
      )}
    </div>
  )
}
