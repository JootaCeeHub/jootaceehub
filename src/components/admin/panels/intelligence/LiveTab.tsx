'use client'

import { useState, useCallback, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useAdmin } from '@/lib/admin/store'
import { fetchAllEnabled } from '@/lib/intelligence/fetcher'
import type { FeedItem, FeedLoadState } from '@/lib/intelligence/types'

type SortMode = 'date' | 'source' | 'score'

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 60_000)    return 'just now'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  return `${Math.floor(diff / 86_400_000)}d ago`
}

function ItemCard({ item }: { item: FeedItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-3 rounded-xl border border-border/30 bg-card/20 p-3 transition-all duration-150 hover:border-border/50 hover:bg-card/30"
    >
      <div
        className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: item.feedColor + '80' }}
      />
      <div className="min-w-0 flex-1">
        <div className="line-clamp-2 text-sm font-medium text-foreground leading-snug group-hover:text-primary transition-colors">{item.title}</div>
        {item.excerpt && (
          <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground/60 leading-snug">
            {item.excerpt}
          </p>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[9px] text-muted-foreground/60">{item.feedIcon} {item.feedName}</span>
          {item.author && <span className="font-mono text-[9px] text-muted-foreground/60">· {item.author}</span>}
          <span className="font-mono text-[9px] text-muted-foreground/40">{relativeTime(item.publishedAt)}</span>
          {item.score !== undefined && (
            <span className="flex items-center gap-1 font-mono text-[9px] text-muted-foreground/60">↑ {item.score.toLocaleString()}</span>
          )}
          {item.comments !== undefined && (
            <span className="flex items-center gap-1 font-mono text-[9px] text-muted-foreground/60">💬 {item.comments}</span>
          )}
        </div>
        {item.tags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {item.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="rounded-full border border-border/20 bg-card/40 px-1.5 py-0.5 font-mono text-[8px] text-muted-foreground/50">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </a>
  )
}

export function LiveTab({ enabledFeeds }: { enabledFeeds: number }) {
  const { state, dispatch } = useAdmin()
  const { intelligence } = state

  const [liveItems, setLiveItems] = useState<FeedItem[]>([])
  const [fetchLoading, setFetchLoading] = useState(false)
  const [feedLoadState, setFeedLoadState] = useState<Record<string, FeedLoadState>>({})
  const [feedLoadError, setFeedLoadError] = useState<Record<string, string>>({})
  const [fetchedCount, setFetchedCount] = useState(0)
  const [totalToFetch, setTotalToFetch] = useState(0)
  const [sortMode, setSortMode] = useState<SortMode>('date')
  const abortRef = useRef(false)

  const fetchAll = useCallback(async () => {
    const enabled = intelligence.feeds.filter((f) => f.enabled)
    if (!enabled.length) return

    abortRef.current = false
    setFetchLoading(true)
    setFetchedCount(0)
    setTotalToFetch(enabled.length)
    setFeedLoadState({})
    setFeedLoadError({})
    setLiveItems([])

    const allItems: FeedItem[] = []

    await fetchAllEnabled(intelligence.feeds, intelligence.maxItemsPerFeed, (feedId, result) => {
      if (abortRef.current) return
      if (result instanceof Error) {
        setFeedLoadState((prev) => ({ ...prev, [feedId]: 'error' }))
        setFeedLoadError((prev) => ({ ...prev, [feedId]: result.message }))
        dispatch({ type: 'INTELLIGENCE_SET_STATUS', payload: { id: feedId, connected: false, lastSync: new Date().toISOString(), itemCount: 0 } })
      } else {
        setFeedLoadState((prev) => ({ ...prev, [feedId]: 'success' }))
        allItems.push(...result.items)
        setLiveItems([...allItems])
        dispatch({ type: 'INTELLIGENCE_SET_STATUS', payload: { id: feedId, connected: true, lastSync: result.fetchedAt, itemCount: result.items.length } })
      }
      setFetchedCount((c) => c + 1)
    })

    setFetchLoading(false)
  }, [intelligence.feeds, intelligence.maxItemsPerFeed, dispatch])

  const sortedItems = [...liveItems].sort((a, b) => {
    if (sortMode === 'date')   return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    if (sortMode === 'score')  return (b.score ?? 0) - (a.score ?? 0)
    if (sortMode === 'source') return a.feedName.localeCompare(b.feedName)
    return 0
  })

  const grouped = sortMode === 'source'
    ? (() => {
        const map = new Map<string, FeedItem[]>()
        for (const item of sortedItems) {
          const existing = map.get(item.feedId) ?? []
          existing.push(item)
          map.set(item.feedId, existing)
        }
        return map
      })()
    : null

  return (
    <div className="space-y-4">
      {/* Fetch controls */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-foreground">Live Intelligence Feed</div>
          <div className="text-xs text-muted-foreground">
            {liveItems.length > 0
              ? `${liveItems.length} items from ${Object.values(feedLoadState).filter((v) => v === 'success').length} sources`
              : `${enabledFeeds} feeds enabled — click Fetch All to load`}
          </div>
        </div>
        <button
          onClick={fetchAll}
          disabled={fetchLoading || enabledFeeds === 0}
          className={cn('flex items-center gap-2 rounded-xl border px-4 py-2 font-mono text-[10px] uppercase tracking-wider transition-all duration-200', fetchLoading ? 'border-amber-400/40 bg-amber-400/10 text-amber-300 cursor-wait' : 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/15 cursor-pointer')}
        >
          {fetchLoading ? `${fetchedCount}/${totalToFetch}…` : '↓ Fetch All'}
        </button>
      </div>

      {/* Progress bar while loading */}
      {fetchLoading && totalToFetch > 0 && (
        <div className="rounded-xl border border-border/30 bg-card/20 px-4 py-2">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="font-mono text-[10px] text-muted-foreground">Loading feeds…</span>
            <span className="font-mono text-[10px] text-muted-foreground">{Math.round((fetchedCount / totalToFetch) * 100)}%</span>
          </div>
          <div className="h-1 rounded-full bg-card/40 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary/50 transition-all duration-300"
              style={{ width: `${Math.round((fetchedCount / totalToFetch) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Per-feed errors */}
      {Object.entries(feedLoadError).length > 0 && (
        <div className="space-y-1.5">
          {Object.entries(feedLoadError).map(([feedId, msg]) => {
            const feed = intelligence.feeds.find((f) => f.id === feedId)
            return (
              <div key={feedId} className="flex items-start gap-3 rounded-xl border border-rose-400/20 bg-rose-400/5 px-4 py-3">
                <span className="text-base">{feed?.icon ?? '⚠'}</span>
                <span className="font-mono text-[10px] text-rose-300/80">
                  <strong className="text-rose-200">{feed?.name ?? feedId}:</strong> {msg}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Sort/filter bar */}
      {sortedItems.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Sort by</span>
          <select value={sortMode} onChange={(e) => setSortMode(e.target.value as SortMode)} className="rounded-lg border border-border/30 bg-card/40 px-2.5 py-1.5 font-mono text-[10px] text-foreground/80 outline-none focus:border-primary/40 transition-colors">
            <option value="date">Date (newest)</option>
            <option value="score">Score / Rank</option>
            <option value="source">Source</option>
          </select>
          <span className="ml-auto font-mono text-[10px] text-muted-foreground/60">{sortedItems.length} items</span>
        </div>
      )}

      {/* Empty state */}
      {liveItems.length === 0 && !fetchLoading && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/30 py-12 text-center">
          <div className="mb-2 text-2xl">📡</div>
          <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground/50">No items loaded yet</div>
          <div className="mt-1 font-mono text-[9px] text-muted-foreground/30">
            Enable feeds and click Fetch All
          </div>
        </div>
      )}

      {/* Grouped by source */}
      {sortMode === 'source' && grouped && (
        <div className="space-y-2">
          {Array.from(grouped.entries()).map(([feedId, items]) => {
            const feed = intelligence.feeds.find((f) => f.id === feedId)
            return (
              <div key={feedId} className="space-y-1.5">
                <div className="flex items-center gap-2 py-1">
                  <span className="text-base">{feed?.icon ?? '•'}</span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{feed?.name ?? feedId}</span>
                  <span className="ml-auto font-mono text-[9px] text-muted-foreground/50">{items.length} items</span>
                </div>
                {items.map((item) => <ItemCard key={item.id} item={item} />)}
              </div>
            )
          })}
        </div>
      )}

      {/* Flat chronological / score list */}
      {sortMode !== 'source' && sortedItems.length > 0 && (
        <div className="space-y-2">
          {sortedItems.map((item) => <ItemCard key={item.id} item={item} />)}
        </div>
      )}
    </div>
  )
}
