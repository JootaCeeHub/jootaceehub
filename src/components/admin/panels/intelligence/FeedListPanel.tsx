'use client'

import { useAdmin } from '@/lib/admin/store'
import type { IntelligenceFeed } from '@/lib/admin/types'

interface Props {
  editingFeedId: string | null
  viewingFeedId: string | null
  search: string
  onSearchChange: (v: string) => void
  onView: (feed: IntelligenceFeed) => void
  onEdit: (feed: IntelligenceFeed) => void
  onRemove: (id: string) => void
}

export function FeedListPanel({ editingFeedId, viewingFeedId, search, onSearchChange, onView, onEdit, onRemove }: Props) {
  const { state } = useAdmin()
  const feeds = state.intelligence.feeds

  const filtered = feeds.filter((f) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return f.name.toLowerCase().includes(q) || f.id.includes(q) || f.category.includes(q)
  })

  return (
    <div className="space-y-3">
      <div className="font-mono text-[10px] uppercase tracking-widest text-primary/60">All Feeds ({feeds.length})</div>

      <input
        className="w-full rounded-lg border border-border/30 bg-card/30 px-2.5 py-1.5 text-[10px] text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/30 transition-colors"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Filter feeds…"
      />

      <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
        {filtered.map((feed) => (
          <div
            key={feed.id}
            onClick={() => onView(feed)}
            style={{ cursor: 'pointer' }}
            className={
              feed.id === editingFeedId
                ? 'flex items-start gap-2 rounded-lg border border-rose-400/25 bg-rose-400/8 px-3 py-2.5 transition-colors'
                : feed.id === viewingFeedId
                ? 'flex items-start gap-2 rounded-lg border border-sky-400/20 bg-sky-400/6 px-3 py-2.5 transition-colors'
                : 'flex items-start gap-2 rounded-lg border border-white/5 bg-white/[0.015] px-3 py-2.5 hover:border-white/10 transition-colors'
            }
          >
            <span className="shrink-0 text-sm w-5 text-center">{feed.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="flex-1 min-w-0 text-[11px] font-medium text-foreground truncate">{feed.name}</span>
                <span className="shrink-0 font-mono text-[10px]">{(feed.publishable ?? false) ? '★' : ''}</span>
              </div>
              {(feed.tags ?? []).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {(feed.tags ?? []).slice(0, 4).map((tag) => (
                    <span key={tag} className="rounded-full border border-border/20 bg-card/30 px-1.5 py-0 font-mono text-[7px] text-muted-foreground/40">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
            <span className="shrink-0 font-mono text-[9px] text-muted-foreground/50 uppercase tracking-wide">{feed.category}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(feed) }}
              className="shrink-0 rounded px-1.5 py-0.5 font-mono text-[9px] text-amber-400/50 hover:text-amber-300 hover:bg-amber-400/10 border border-transparent hover:border-amber-400/20 transition-all cursor-pointer"
              title={`Edit ${feed.name}`}
            >✎</button>
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(feed.id) }}
              className="shrink-0 rounded px-1.5 py-0.5 font-mono text-[9px] text-rose-400/60 hover:text-rose-300 hover:bg-rose-400/10 border border-transparent hover:border-rose-400/20 transition-all cursor-pointer"
              title={`Remove ${feed.name}`}
            >✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}
