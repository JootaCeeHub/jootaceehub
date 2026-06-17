'use client'

import { cn } from '@/lib/utils'
import { useAdmin } from '@/lib/admin/store'
import type { IntelligenceFeed } from '@/lib/admin/types'
import { relativeTime, CATEGORY_COLORS } from './manage-constants'

interface Props {
  feedId: string
  copiedId: string | null
  onCopyUrl: (url: string, id: string) => void
  onEdit: (feed: IntelligenceFeed) => void
  onClose: () => void
}

export function FeedViewPanel({ feedId, copiedId, onCopyUrl, onEdit, onClose }: Props) {
  const { state } = useAdmin()
  const vf = state.intelligence.feeds.find((f) => f.id === feedId)

  if (!vf) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/20 py-8 text-center gap-2">
        <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/30">Feed not found</div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border/40 bg-card/20 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/30 bg-card/60 text-xl">{vf.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground leading-tight">{vf.name}</div>
          <div className="font-mono text-[9px] text-muted-foreground/40 mt-0.5">#{vf.id}</div>
        </div>
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <button onClick={() => onEdit(vf)} className="rounded-lg border border-amber-400/30 bg-amber-400/8 px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-wider text-amber-300 hover:bg-amber-400/15 transition-colors cursor-pointer">✎ Edit</button>
          <button onClick={onClose} className="rounded-lg border border-border/20 bg-card/30 px-2.5 py-1.5 font-mono text-[9px] text-muted-foreground/50 hover:text-foreground hover:border-border/40 transition-colors cursor-pointer">✕</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className={cn('rounded-full border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-widest', CATEGORY_COLORS[vf.category] ?? 'border-border/30 bg-card/40 text-muted-foreground')}>{vf.category}</span>
        <span className="rounded-full border border-border/30 bg-card/40 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{vf.type}</span>
        <span className={cn('rounded-full border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest', vf.plan === 'free' ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300' : vf.plan === 'freemium' ? 'border-amber-400/40 bg-amber-400/10 text-amber-300' : 'border-rose-400/40 bg-rose-400/10 text-rose-300')}>{vf.plan}</span>
        {vf.language && <span className="rounded-full border border-border/30 bg-card/40 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-widest text-muted-foreground/70">{vf.language}</span>}
        <span className={vf.enabled ? 'rounded-full border border-emerald-400/40 bg-emerald-400/10 px-1.5 py-0.5 font-mono text-[8px] text-emerald-300' : 'rounded-full border border-rose-400/40 bg-rose-400/10 px-1.5 py-0.5 font-mono text-[8px] text-rose-300'}>
          {vf.enabled ? 'enabled' : 'disabled'}
        </span>
        {(vf.publishable ?? false) && (
          <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-1.5 py-0.5 font-mono text-[8px] text-amber-300">★ publishable</span>
        )}
      </div>

      {vf.description && (
        <div className="space-y-1">
          <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/40">Description</div>
          <div className="text-[11px] text-foreground/80 leading-relaxed">{vf.description}</div>
        </div>
      )}

      {vf.website && (
        <div className="space-y-1">
          <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/40">Website</div>
          <a href={vf.website} target="_blank" rel="noopener noreferrer" className="text-[11px] text-primary/70 hover:text-primary transition-colors truncate block">
            {vf.website} ↗
          </a>
        </div>
      )}

      {vf.url && (
        <div className="space-y-1">
          <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/40">Feed URL</div>
          <div className="flex items-center gap-2">
            <span className="flex-1 min-w-0 font-mono text-[9px] text-muted-foreground/70 truncate">{vf.url}</span>
            <button
              onClick={() => onCopyUrl(vf.url, vf.id + '_view_api')}
              className="shrink-0 rounded px-1.5 py-0.5 font-mono text-[8px] border border-border/30 bg-card/40 text-muted-foreground/60 hover:text-foreground hover:border-border/50 transition-colors cursor-pointer"
              title="Copy feed URL"
            >
              {copiedId === vf.id + '_view_api' ? '✓' : '⎘'}
            </button>
          </div>
        </div>
      )}

      {vf.docsUrl && (
        <div className="space-y-1">
          <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/40">Docs</div>
          <a href={vf.docsUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-primary/70 hover:text-primary transition-colors truncate block">
            {vf.docsUrl} ↗
          </a>
        </div>
      )}

      {(vf.tags ?? []).length > 0 && (
        <div className="space-y-1">
          <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/40">Tags</div>
          <div className="flex flex-wrap gap-1">
            {(vf.tags ?? []).map((tag) => (
              <span key={tag} className="rounded-full border border-border/20 bg-card/30 px-1.5 py-0.5 font-mono text-[8px] text-muted-foreground/60">#{tag}</span>
            ))}
          </div>
        </div>
      )}

      {vf.notes && (
        <div className="space-y-1">
          <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/40">Notes</div>
          <div className="text-[11px] italic text-muted-foreground/50 leading-relaxed">{vf.notes}</div>
        </div>
      )}

      {(vf.publishable ?? false) && (vf.publishedPages ?? []).length > 0 && (
        <div className="space-y-1">
          <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/40">Published pages</div>
          <div className="flex flex-wrap gap-1">
            {(vf.publishedPages ?? []).map((pg) => (
              <span key={pg} className="cursor-pointer rounded-full border px-2 py-0.5 font-mono text-[8px] uppercase tracking-wider transition-colors border-cyan-400/40 bg-cyan-400/10 text-cyan-300">{pg}</span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1">
        <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/40">Connection</div>
        <div className="flex items-center gap-2">
          <div className={cn('h-1.5 w-1.5 shrink-0 rounded-full', vf.connected ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]' : 'bg-muted-foreground/30')} />
          <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground truncate">
            {vf.connected ? `connected · ${vf.lastSync ? relativeTime(vf.lastSync) : '—'}` : 'not connected'}
          </span>
          {vf.itemCount > 0 && (
            <span className="rounded-full border border-primary/20 bg-primary/8 px-1.5 py-0.5 font-mono text-[8px] text-primary/70">{vf.itemCount} items</span>
          )}
        </div>
      </div>
    </div>
  )
}
