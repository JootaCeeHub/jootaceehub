'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useAdmin } from '@/lib/admin/store'
import { fetchFeed, clearCache } from '@/lib/intelligence/fetcher'
import type { FeedLoadState } from '@/lib/intelligence/types'
import type { FeedCategory, IntelligenceFeed } from '@/lib/admin/types'
import { LiveTab } from './intelligence/LiveTab'
import { ManageTab } from './intelligence/ManageTab'
import { PublishTab } from './intelligence/PublishTab'

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: { id: FeedCategory | 'all'; label: string; icon: string }[] = [
  { id: 'all',          label: 'All',          icon: '◈'  },
  // Intel layers
  { id: 'osint',        label: 'OSINT',        icon: '🕵️' },
  { id: 'conflict',     label: 'Conflict',     icon: '⚔️' },
  { id: 'security',     label: 'Security',     icon: '🔐' },
  { id: 'cyber',        label: 'Cyber',        icon: '💀' },
  { id: 'disaster',     label: 'Disaster',     icon: '🌋' },
  { id: 'aviation',     label: 'Aviation',     icon: '✈️' },
  // Economic
  { id: 'energy',       label: 'Energy',       icon: '⛽' },
  { id: 'markets',      label: 'Markets',      icon: '📊' },
  { id: 'finance',      label: 'Finance',      icon: '💰' },
  // Environmental
  { id: 'climate',      label: 'Climate',      icon: '🌡️' },
  { id: 'humanitarian', label: 'Humanitarian', icon: '🏕️' },
  // Data feeds
  { id: 'news',         label: 'News',         icon: '📰' },
  { id: 'tech',         label: 'Tech',         icon: '⚡' },
  { id: 'research',     label: 'Research',     icon: '🔬' },
  { id: 'ai',           label: 'AI',           icon: '🤖' },
  { id: 'social',       label: 'Social',       icon: '💬' },
  { id: 'opendata',     label: 'Open Data',    icon: '🌍' },
  // Resource categories
  { id: 'tool',         label: 'Tool',         icon: '🔧' },
  { id: 'resource',     label: 'Resource',     icon: '📚' },
  { id: 'reference',    label: 'Reference',    icon: '📖' },
  { id: 'community',    label: 'Community',    icon: '👥' },
  { id: 'newsletter',   label: 'Newsletter',   icon: '📧' },
  { id: 'video',        label: 'Video',        icon: '🎬' },
  { id: 'podcast',      label: 'Podcast',      icon: '🎙️' },
  { id: 'database',     label: 'Database',     icon: '🗄️' },
]

const REFRESH_OPTIONS = [5, 10, 15, 30, 60, 120]
const MAX_ITEMS_OPTIONS = [10, 25, 50, 100, 200]
type PanelTab = 'sources' | 'live' | 'manage' | 'publish'

// ─── Relative time formatter (sources tab only) ───────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 60_000)    return 'just now'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  return `${Math.floor(diff / 86_400_000)}d ago`
}

// ─── URL truncator (sources tab only) ────────────────────────────────────────

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

// ─── Component ────────────────────────────────────────────────────────────────

export default function IntelligenceFeedsPanel() {
  const { state, dispatch } = useAdmin()
  const { intelligence } = state

  // Panel tabs
  const [activeTab, setActiveTab] = useState<PanelTab>('sources')

  // Sources tab state
  const [activeCategory, setActiveCategory] = useState<FeedCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [keyDraft, setKeyDraft] = useState<Record<string, string>>({})
  const [testState, setTestState] = useState<Record<string, FeedLoadState>>({})
  const [testError, setTestError] = useState<Record<string, string>>({})
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // ─── Derived stats ────────────────────────────────────────────────────────
  const totalFeeds       = intelligence.feeds.length
  const enabledFeeds     = intelligence.feeds.filter((f) => f.enabled).length
  const connectedFeeds   = intelligence.feeds.filter((f) => f.connected).length
  const freeFeeds        = intelligence.feeds.filter((f) => f.plan === 'free').length
  const publishableCount = intelligence.feeds.filter((f) => f.publishable).length

  // ─── Sources: filtered feed list ─────────────────────────────────────────
  const visibleFeeds = intelligence.feeds.filter((f) => {
    const catOk = activeCategory === 'all' || f.category === activeCategory
    if (!catOk) return false
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      f.name.toLowerCase().includes(q) ||
      f.description.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q) ||
      (f.tags ?? []).some((t) => t.toLowerCase().includes(q))
    )
  })

  // ─── Sources: handlers ───────────────────────────────────────────────────
  function toggleFeed(id: string) {
    dispatch({ type: 'INTELLIGENCE_TOGGLE_FEED', payload: id })
  }

  function saveKey(id: string) {
    const key = keyDraft[id] ?? ''
    dispatch({ type: 'INTELLIGENCE_SET_KEY', payload: { id, key } })
    setKeyDraft((prev) => { const next = { ...prev }; delete next[id]; return next })
  }

  function toggleAutoRefresh() {
    dispatch({ type: 'INTELLIGENCE_UPDATE_CONFIG', payload: { autoRefresh: !intelligence.autoRefresh } })
  }

  function togglePublishable(feed: IntelligenceFeed) {
    dispatch({ type: 'INTELLIGENCE_UPDATE_FEED', payload: { id: feed.id, data: { publishable: !(feed.publishable ?? false) } } })
  }

  function copyUrl(url: string, id: string) {
    navigator.clipboard.writeText(url).catch(() => undefined)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  async function testFeed(id: string) {
    const feed = intelligence.feeds.find((f) => f.id === id)
    if (!feed) return
    setTestState((prev) => ({ ...prev, [id]: 'loading' }))
    setTestError((prev) => { const next = { ...prev }; delete next[id]; return next })
    try {
      clearCache(id)
      const result = await fetchFeed(feed, 5)
      dispatch({
        type: 'INTELLIGENCE_SET_STATUS',
        payload: { id, connected: true, lastSync: result.fetchedAt, itemCount: result.items.length },
      })
      setTestState((prev) => ({ ...prev, [id]: 'success' }))
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Connection failed'
      dispatch({
        type: 'INTELLIGENCE_SET_STATUS',
        payload: { id, connected: false, lastSync: new Date().toISOString(), itemCount: 0 },
      })
      setTestState((prev) => ({ ...prev, [id]: 'error' }))
      setTestError((prev) => ({ ...prev, [id]: msg }))
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/60">Ecosystem · Intelligence</div>
        <h1 className="text-2xl font-semibold text-foreground">Intelligence Feeds</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {enabledFeeds} of {totalFeeds} feeds active · {connectedFeeds} connected · {publishableCount} publishable
        </p>
      </div>

      {/* ── Stats row ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-xl border border-border/40 bg-card/30 p-4">
          <div className="text-2xl font-bold text-primary tabular-nums">{totalFeeds}</div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Total feeds</div>
        </div>
        <div className="rounded-xl border border-border/40 bg-card/30 p-4">
          <div className="text-2xl font-bold text-primary tabular-nums">{enabledFeeds}</div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Enabled</div>
        </div>
        <div className="rounded-xl border border-border/40 bg-card/30 p-4">
          <div className="text-2xl font-bold text-primary tabular-nums">{connectedFeeds}</div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Connected</div>
        </div>
        <div className="rounded-xl border border-border/40 bg-card/30 p-4">
          <div className="text-2xl font-bold text-primary tabular-nums">{freeFeeds}</div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Free tier</div>
        </div>
        <div className="rounded-xl border border-border/40 bg-card/30 p-4">
          <div className="text-2xl font-bold text-primary tabular-nums">{publishableCount}</div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Publishable</div>
        </div>
      </div>

      {/* ── Panel tabs ─────────────────────────────────────────────────────── */}
      <div className="flex gap-1 rounded-xl border border-border/30 bg-card/20 p-1">
        <button className={cn('flex-1 rounded-lg px-4 py-2 font-mono text-[10px] uppercase tracking-wider transition-all duration-200', activeTab === 'sources' ? 'bg-primary/15 text-primary border border-primary/30 shadow-sm' : 'text-muted-foreground hover:text-foreground')} onClick={() => setActiveTab('sources')}>
          Sources
        </button>
        <button className={cn('flex-1 rounded-lg px-4 py-2 font-mono text-[10px] uppercase tracking-wider transition-all duration-200', activeTab === 'live' ? 'bg-primary/15 text-primary border border-primary/30 shadow-sm' : 'text-muted-foreground hover:text-foreground')} onClick={() => setActiveTab('live')}>
          Live Feed
        </button>
        <button className={cn('flex-1 rounded-lg px-4 py-2 font-mono text-[10px] uppercase tracking-wider transition-all duration-200', activeTab === 'manage' ? 'bg-primary/15 text-primary border border-primary/30 shadow-sm' : 'text-muted-foreground hover:text-foreground')} onClick={() => setActiveTab('manage')}>
          Manage
        </button>
        <button className={cn('flex-1 rounded-lg px-4 py-2 font-mono text-[10px] uppercase tracking-wider transition-all duration-200', activeTab === 'publish' ? 'bg-primary/15 text-primary border border-primary/30 shadow-sm' : 'text-muted-foreground hover:text-foreground')} onClick={() => setActiveTab('publish')}>
          Publish {publishableCount > 0 && `(${publishableCount})`}
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: SOURCES
         ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'sources' && (
        <>
          {/* Config bar */}
          <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border/40 bg-card/20 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Auto-refresh</span>
              <div
                className={cn('relative h-5 w-9 rounded-full border transition-all duration-200 cursor-pointer flex-shrink-0', intelligence.autoRefresh ? 'border-primary/60 bg-primary/20' : 'border-border/40 bg-card/40')}
                onClick={toggleAutoRefresh}
                role="switch"
                aria-checked={intelligence.autoRefresh}
              >
                <div className={cn('absolute top-0.5 h-4 w-4 rounded-full transition-all duration-200', intelligence.autoRefresh ? 'left-[18px] bg-primary' : 'left-0.5 bg-muted-foreground/40')} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Interval</span>
              <select
                value={intelligence.refreshInterval}
                onChange={(e) => dispatch({ type: 'INTELLIGENCE_UPDATE_CONFIG', payload: { refreshInterval: Number(e.target.value) } })}
                className="rounded-lg border border-border/30 bg-card/40 px-2.5 py-1.5 font-mono text-[10px] text-foreground/80 outline-none focus:border-primary/40 transition-colors"
              >
                {REFRESH_OPTIONS.map((v) => <option key={v} value={v}>{v}m</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Max items</span>
              <select
                value={intelligence.maxItemsPerFeed}
                onChange={(e) => dispatch({ type: 'INTELLIGENCE_UPDATE_CONFIG', payload: { maxItemsPerFeed: Number(e.target.value) } })}
                className="rounded-lg border border-border/30 bg-card/40 px-2.5 py-1.5 font-mono text-[10px] text-foreground/80 outline-none focus:border-primary/40 transition-colors"
              >
                {MAX_ITEMS_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            {/* View toggle */}
            <div className="ml-auto flex items-center gap-1">
              <button className={cn('rounded-lg border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-all duration-200', viewMode === 'grid' ? 'border-primary/40 bg-primary/15 text-primary' : 'border-border/30 bg-card/40 text-muted-foreground hover:text-foreground hover:border-border/50')} onClick={() => setViewMode('grid')} title="Grid view">
                ⊞ Grid
              </button>
              <button className={cn('rounded-lg border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-all duration-200', viewMode === 'list' ? 'border-primary/40 bg-primary/15 text-primary' : 'border-border/30 bg-card/40 text-muted-foreground hover:text-foreground hover:border-border/50')} onClick={() => setViewMode('list')} title="List view">
                ≡ List
              </button>
            </div>
          </div>

          {/* Search + count */}
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search feeds by name, category, description, tags…"
              className="flex-1 rounded-xl border border-border/30 bg-card/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/30 transition-colors"
            />
            {searchQuery && (
              <span className="font-mono text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors cursor-pointer shrink-0" onClick={() => setSearchQuery('')}>✕ Clear</span>
            )}
            <span className="font-mono text-[10px] text-muted-foreground/50 shrink-0">{visibleFeeds.length} feeds</span>
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setSearchQuery('') }}
                className={cn('rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors duration-150', activeCategory === cat.id ? 'border-primary/50 bg-primary/15 text-primary' : 'border-border/40 text-muted-foreground hover:text-foreground hover:border-border/60')}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>

          {/* Feed grid or list */}
          {visibleFeeds.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/30 py-12 text-center">
              <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground/50">No feeds in this category</div>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {visibleFeeds.map((feed) => {
                const draftKey = keyDraft[feed.id]
                const currentKey = draftKey !== undefined ? draftKey : feed.apiKey
                const needsKey = feed.plan !== 'free'
                const tState = testState[feed.id] ?? 'idle'
                const tError = testError[feed.id]
                const tags = feed.tags ?? []
                const publishable = feed.publishable ?? false

                return (
                  <div key={feed.id} className={cn('group relative flex flex-col gap-3 rounded-xl border p-4 transition-all duration-200', feed.enabled ? 'border-border/50 bg-card/30 hover:border-primary/20 hover:bg-card/40' : 'border-border/20 bg-card/10 opacity-60')}>
                    {/* Header */}
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/30 bg-card/60 text-lg">{feed.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-foreground leading-tight">{feed.name}</div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                          <span className={cn('rounded-full border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest', feed.plan === 'free' ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300' : feed.plan === 'freemium' ? 'border-amber-400/40 bg-amber-400/10 text-amber-300' : 'border-rose-400/40 bg-rose-400/10 text-rose-300')}>{feed.plan}</span>
                          {feed.type === 'relay'
                            ? <span className="rounded-full border border-violet-400/30 bg-violet-400/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-violet-300">relay</span>
                            : <span className="rounded-full border border-border/30 bg-card/40 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{feed.type}</span>
                          }
                          <span className={cn('rounded-full border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-widest', { osint: 'border-amber-400/40 bg-amber-400/10 text-amber-300', conflict: 'border-rose-400/40 bg-rose-400/10 text-rose-300', security: 'border-red-400/40 bg-red-400/10 text-red-300', cyber: 'border-pink-400/40 bg-pink-400/10 text-pink-300', disaster: 'border-orange-400/40 bg-orange-400/10 text-orange-300', aviation: 'border-sky-400/40 bg-sky-400/10 text-sky-300', energy: 'border-yellow-400/40 bg-yellow-400/10 text-yellow-300', markets: 'border-green-400/40 bg-green-400/10 text-green-300', finance: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300', climate: 'border-teal-400/40 bg-teal-400/10 text-teal-300', humanitarian: 'border-lime-400/40 bg-lime-400/10 text-lime-300', ai: 'border-violet-400/40 bg-violet-400/10 text-violet-300', tech: 'border-cyan-400/40 bg-cyan-400/10 text-cyan-300', research: 'border-blue-400/40 bg-blue-400/10 text-blue-300', news: 'border-indigo-400/40 bg-indigo-400/10 text-indigo-300', social: 'border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-300', opendata: 'border-purple-400/40 bg-purple-400/10 text-purple-300', tool: 'border-cyan-400/40 bg-cyan-400/10 text-cyan-300', resource: 'border-blue-400/40 bg-blue-400/10 text-blue-300', reference: 'border-indigo-400/40 bg-indigo-400/10 text-indigo-300', community: 'border-pink-400/40 bg-pink-400/10 text-pink-300', newsletter: 'border-amber-400/40 bg-amber-400/10 text-amber-300', video: 'border-orange-400/40 bg-orange-400/10 text-orange-300', podcast: 'border-purple-400/40 bg-purple-400/10 text-purple-300', database: 'border-green-400/40 bg-green-400/10 text-green-300' }[feed.category] ?? 'border-border/30 bg-card/40 text-muted-foreground')}>{feed.category}</span>
                          {feed.language && <span className="rounded-full border border-border/30 bg-card/40 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-widest text-muted-foreground/70">{feed.language}</span>}
                          {feed.itemCount > 0 && <span className="rounded-full border border-primary/20 bg-primary/8 px-1.5 py-0.5 font-mono text-[8px] text-primary/70">{feed.itemCount} items</span>}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{feed.description}</p>

                    {/* Notes */}
                    {feed.notes && <p className="text-[10px] italic text-muted-foreground/50 leading-snug">{feed.notes}</p>}

                    {/* Tags */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {tags.map((tag) => <span key={tag} className="rounded-full border border-border/20 bg-card/30 px-1.5 py-0.5 font-mono text-[8px] text-muted-foreground/60">#{tag}</span>)}
                      </div>
                    )}

                    {/* Primary link — website if available, otherwise API URL */}
                    {(feed.website || feed.url) && (
                      <div className="flex items-center gap-2">
                        <a
                          href={feed.website ?? feed.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 min-w-0 font-mono text-[9px] text-primary/60 hover:text-primary truncate transition-colors"
                          title={feed.website ?? feed.url}
                        >
                          {truncateUrl(feed.website ?? feed.url)}
                        </a>
                        <button
                          className="shrink-0 rounded px-1.5 py-0.5 font-mono text-[8px] border border-border/30 bg-card/40 text-muted-foreground/60 hover:text-foreground hover:border-border/50 transition-colors cursor-pointer"
                          onClick={() => copyUrl(feed.website ?? feed.url, feed.id + '_url')}
                          title="Copy link"
                        >
                          {copiedId === feed.id + '_url' ? '✓' : '⎘'}
                        </button>
                        {/* Show API endpoint separately when website differs */}
                        {feed.website && feed.url && feed.website !== feed.url && (
                          <button
                            className="shrink-0 rounded px-1.5 py-0.5 font-mono text-[8px] border border-border/30 bg-card/40 text-muted-foreground/60 hover:text-foreground hover:border-border/50 transition-colors cursor-pointer"
                            onClick={() => copyUrl(feed.url, feed.id + '_api')}
                            title={`Copy API endpoint: ${feed.url}`}
                            style={{ opacity: 0.5 }}
                          >
                            {copiedId === feed.id + '_api' ? '✓' : 'API'}
                          </button>
                        )}
                      </div>
                    )}

                    {/* API key input */}
                    {needsKey && (
                      <div className="flex items-center gap-2">
                        <input
                          type="password"
                          value={currentKey}
                          onChange={(e) => setKeyDraft((prev) => ({ ...prev, [feed.id]: e.target.value }))}
                          placeholder="API key…"
                          className="flex-1 rounded-lg border border-border/30 bg-card/40 px-2.5 py-1.5 font-mono text-[10px] text-foreground/80 placeholder:text-muted-foreground/40 outline-none focus:border-primary/40 transition-colors"
                        />
                        {draftKey !== undefined && (
                          <button onClick={() => saveKey(feed.id)} className="shrink-0 rounded-lg border border-border/40 bg-card/60 px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-border/60 transition-colors">Save</button>
                        )}
                      </div>
                    )}

                    {/* Error message from test */}
                    {tError && (
                      <p className="font-mono text-[9px] text-rose-300/80 leading-relaxed">{tError}</p>
                    )}

                    {/* Footer: status + docs + test + publish toggle + enable toggle */}
                    <div className="mt-auto flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <div className={cn('h-1.5 w-1.5 shrink-0 rounded-full', feed.connected ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]' : 'bg-muted-foreground/30')} />
                        <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground truncate">
                          {feed.connected
                            ? `ok · ${feed.lastSync ? relativeTime(feed.lastSync) : '—'}`
                            : 'not tested'}
                        </span>
                        {feed.docsUrl && (
                          <a href={feed.docsUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 font-mono text-[9px] text-primary/60 hover:text-primary transition-colors">
                            docs ↗
                          </a>
                        )}
                      </div>

                      <button
                        onClick={() => testFeed(feed.id)}
                        disabled={tState === 'loading'}
                        className={cn('shrink-0 rounded-lg border px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-wider transition-all duration-200', (tState === 'success' ? 'ok' : tState === 'error' ? 'error' : tState === 'loading' ? 'loading' : 'idle') === 'loading' && 'border-amber-400/40 bg-amber-400/10 text-amber-300 cursor-wait', (tState === 'success' ? 'ok' : tState === 'error' ? 'error' : tState === 'loading' ? 'loading' : 'idle') === 'ok' && 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300', (tState === 'success' ? 'ok' : tState === 'error' ? 'error' : tState === 'loading' ? 'loading' : 'idle') === 'error' && 'border-rose-400/40 bg-rose-400/10 text-rose-300', (tState === 'success' ? 'ok' : tState === 'error' ? 'error' : tState === 'loading' ? 'loading' : 'idle') === 'idle' && 'border-border/40 bg-card/40 text-muted-foreground hover:text-foreground hover:border-border/60 cursor-pointer')}
                      >
                        {tState === 'loading' ? '…' : tState === 'success' ? '✓ OK' : tState === 'error' ? '✗ Err' : 'Test'}
                      </button>

                      <button
                        className={cn('shrink-0 rounded-lg border px-2 py-1 font-mono text-[10px] transition-all duration-200 cursor-pointer', publishable ? 'border-amber-400/40 bg-amber-400/10 text-amber-300' : 'border-border/30 bg-card/40 text-muted-foreground/40 hover:text-muted-foreground hover:border-border/50')}
                        onClick={() => togglePublishable(feed)}
                        title={publishable ? 'Unpublish' : 'Mark as publishable'}
                      >
                        {publishable ? '★' : '☆'}
                      </button>

                      <div
                        className={cn('relative h-5 w-9 shrink-0 rounded-full border transition-all duration-200 cursor-pointer', feed.enabled ? 'border-primary/60 bg-primary/20' : 'border-border/40 bg-card/40')}
                        onClick={() => toggleFeed(feed.id)}
                        role="switch"
                        aria-checked={feed.enabled}
                        aria-label={`Toggle ${feed.name}`}
                      >
                        <div className={cn('absolute top-0.5 h-4 w-4 rounded-full transition-all duration-200', feed.enabled ? 'left-[18px] bg-primary' : 'left-0.5 bg-muted-foreground/40')} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            /* List view */
            <div className="divide-y divide-border/20 rounded-xl border border-border/30 bg-card/20 overflow-hidden">
              {visibleFeeds.map((feed) => {
                const publishable = feed.publishable ?? false
                return (
                  <div key={feed.id} className={cn('group flex items-center gap-3 px-4 py-2.5 transition-colors', feed.enabled ? 'hover:bg-card/40' : 'opacity-50')}>
                    <span className="shrink-0 text-base w-5 text-center">{feed.icon}</span>
                    <span className="flex-1 min-w-0 text-[11px] font-medium text-foreground truncate">{feed.name}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={cn('rounded-full border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-widest', { osint: 'border-amber-400/40 bg-amber-400/10 text-amber-300', conflict: 'border-rose-400/40 bg-rose-400/10 text-rose-300', security: 'border-red-400/40 bg-red-400/10 text-red-300', cyber: 'border-pink-400/40 bg-pink-400/10 text-pink-300', disaster: 'border-orange-400/40 bg-orange-400/10 text-orange-300', aviation: 'border-sky-400/40 bg-sky-400/10 text-sky-300', energy: 'border-yellow-400/40 bg-yellow-400/10 text-yellow-300', markets: 'border-green-400/40 bg-green-400/10 text-green-300', finance: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300', climate: 'border-teal-400/40 bg-teal-400/10 text-teal-300', humanitarian: 'border-lime-400/40 bg-lime-400/10 text-lime-300', ai: 'border-violet-400/40 bg-violet-400/10 text-violet-300', tech: 'border-cyan-400/40 bg-cyan-400/10 text-cyan-300', research: 'border-blue-400/40 bg-blue-400/10 text-blue-300', news: 'border-indigo-400/40 bg-indigo-400/10 text-indigo-300', social: 'border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-300', opendata: 'border-purple-400/40 bg-purple-400/10 text-purple-300', tool: 'border-cyan-400/40 bg-cyan-400/10 text-cyan-300', resource: 'border-blue-400/40 bg-blue-400/10 text-blue-300', reference: 'border-indigo-400/40 bg-indigo-400/10 text-indigo-300', community: 'border-pink-400/40 bg-pink-400/10 text-pink-300', newsletter: 'border-amber-400/40 bg-amber-400/10 text-amber-300', video: 'border-orange-400/40 bg-orange-400/10 text-orange-300', podcast: 'border-purple-400/40 bg-purple-400/10 text-purple-300', database: 'border-green-400/40 bg-green-400/10 text-green-300' }[feed.category] ?? 'border-border/30 bg-card/40 text-muted-foreground')}>{feed.category}</span>
                      <a href={feed.website ?? feed.url} target="_blank" rel="noopener noreferrer" className="hidden sm:block max-w-[140px] truncate font-mono text-[8px] text-muted-foreground/50" title={feed.website ?? feed.url}>{truncateUrl(feed.website ?? feed.url, 28)}</a>
                      <span className={cn('rounded-full border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest', feed.plan === 'free' ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300' : feed.plan === 'freemium' ? 'border-amber-400/40 bg-amber-400/10 text-amber-300' : 'border-rose-400/40 bg-rose-400/10 text-rose-300')}>{feed.plan}</span>
                      {feed.language && <span className="rounded-full border border-border/30 bg-card/40 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-widest text-muted-foreground/70">{feed.language}</span>}
                      {feed.docsUrl && (
                        <a href={feed.docsUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 font-mono text-[9px] text-primary/60 hover:text-primary transition-colors">
                          docs ↗
                        </a>
                      )}
                      <button
                        className={cn('shrink-0 rounded-lg border px-2 py-1 font-mono text-[10px] transition-all duration-200 cursor-pointer', publishable ? 'border-amber-400/40 bg-amber-400/10 text-amber-300' : 'border-border/30 bg-card/40 text-muted-foreground/40 hover:text-muted-foreground hover:border-border/50')}
                        onClick={() => togglePublishable(feed)}
                        title={publishable ? 'Unpublish' : 'Mark as publishable'}
                      >
                        {publishable ? '★' : '☆'}
                      </button>
                      <div
                        className={cn('relative h-5 w-9 shrink-0 rounded-full border transition-all duration-200 cursor-pointer', feed.enabled ? 'border-primary/60 bg-primary/20' : 'border-border/40 bg-card/40')}
                        onClick={() => toggleFeed(feed.id)}
                        role="switch"
                        aria-checked={feed.enabled}
                      >
                        <div className={cn('absolute top-0.5 h-4 w-4 rounded-full transition-all duration-200', feed.enabled ? 'left-[18px] bg-primary' : 'left-0.5 bg-muted-foreground/40')} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: LIVE FEED
         ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'live' && (
        <LiveTab enabledFeeds={enabledFeeds} />
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: MANAGE
         ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'manage' && <ManageTab />}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: PUBLISH
         ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'publish' && <PublishTab publishableCount={publishableCount} />}

    </div>
  )
}
