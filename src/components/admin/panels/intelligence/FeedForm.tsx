'use client'

import { cn } from '@/lib/utils'
import type { FeedCategory, FeedType, FeedPlan, IntelligenceFeed } from '@/lib/admin/types'
import { PUBLISHED_PAGES, CATEGORY_LIST } from './manage-constants'

type Draft = Omit<IntelligenceFeed, 'id'>

interface BaseProps {
  draft: Draft
  onChange: (updates: Partial<Draft>) => void
  tagInput: string
  onTagInput: (v: string) => void
  onAddTag: () => void
  onRemoveTag: (tag: string) => void
  onTogglePage: (page: string) => void
}

interface AddProps extends BaseProps {
  mode: 'add'
  feedId: string
  onFeedId: (v: string) => void
  onSubmit: () => void
  error: string
}

interface EditProps extends BaseProps {
  mode: 'edit'
  onSubmit: () => void
  onCancel: () => void
}

type Props = AddProps | EditProps

const fieldCls = 'w-full rounded-lg border border-border/30 bg-card/40 px-2.5 py-1.5 font-mono text-[10px] text-foreground/80 placeholder:text-muted-foreground/30 outline-none focus:border-primary/40 transition-colors'
const labelCls = 'font-mono text-[9px] uppercase tracking-wider text-muted-foreground/60'

export function FeedForm(props: Props) {
  const { draft, onChange, tagInput, onTagInput, onAddTag, onRemoveTag, onTogglePage } = props

  return (
    <div className="space-y-3">
      {/* Name row */}
      <div className={props.mode === 'add' ? 'grid grid-cols-2 gap-2' : 'space-y-1'}>
        <div className="space-y-1">
          <div className={labelCls}>Name *</div>
          <input
            className={fieldCls}
            value={draft.name}
            onChange={(e) => {
              onChange({ name: e.target.value })
              if (props.mode === 'add' && !props.feedId) props.onFeedId(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40))
            }}
            placeholder="My Custom Feed"
          />
        </div>
        {props.mode === 'add' && (
          <div className="space-y-1">
            <div className={labelCls}>ID (unique) *</div>
            <input
              className={fieldCls}
              value={props.feedId}
              onChange={(e) => props.onFeedId(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
              placeholder="my_custom_feed"
            />
          </div>
        )}
      </div>

      {/* Feed URL */}
      <div className="space-y-1">
        <div className={labelCls}>Feed URL *</div>
        <input className={fieldCls} value={draft.url} onChange={(e) => onChange({ url: e.target.value })} placeholder="https://example.com/rss or https://api.example.com/v1" />
      </div>

      {/* Website URL */}
      <div className="space-y-1">
        <div className={labelCls}>Website URL (homepage)</div>
        <input className={fieldCls} value={draft.website ?? ''} onChange={(e) => onChange({ website: e.target.value })} placeholder="https://example.com" />
      </div>

      {/* Docs URL */}
      <div className="space-y-1">
        <div className={labelCls}>Docs URL</div>
        <input className={fieldCls} value={draft.docsUrl} onChange={(e) => onChange({ docsUrl: e.target.value })} placeholder="https://docs.example.com" />
      </div>

      {/* Category + Type + Plan */}
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <div className={labelCls}>Category</div>
          <select className={fieldCls} value={draft.category} onChange={(e) => onChange({ category: e.target.value as FeedCategory })}>
            {CATEGORY_LIST.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <div className={labelCls}>Type</div>
          <select className={fieldCls} value={draft.type} onChange={(e) => onChange({ type: e.target.value as FeedType })}>
            {(['rss', 'api', 'websocket', 'relay'] as FeedType[]).map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <div className={labelCls}>Plan</div>
          <select className={fieldCls} value={draft.plan} onChange={(e) => onChange({ plan: e.target.value as FeedPlan })}>
            {(['free', 'freemium', 'paid'] as FeedPlan[]).map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Language + Icon + Color */}
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <div className={labelCls}>Language</div>
          <input className={fieldCls} value={draft.language ?? ''} onChange={(e) => onChange({ language: e.target.value })} placeholder="en" />
        </div>
        <div className="space-y-1">
          <div className={labelCls}>Icon (emoji)</div>
          <input className={fieldCls} value={draft.icon} onChange={(e) => onChange({ icon: e.target.value })} placeholder="📡" />
        </div>
        <div className="space-y-1">
          <div className={labelCls}>Accent color</div>
          <div className="flex items-center gap-1">
            <input type="color" value={draft.color} onChange={(e) => onChange({ color: e.target.value })} className="h-7 w-8 cursor-pointer rounded border border-border/30 bg-transparent p-0.5" />
            <input className={fieldCls} value={draft.color} onChange={(e) => onChange({ color: e.target.value })} placeholder="#6366f1" />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1">
        <div className={labelCls}>Description</div>
        <textarea className={cn(fieldCls, 'resize-none')} rows={2} value={draft.description} onChange={(e) => onChange({ description: e.target.value })} placeholder="Brief description of what this feed provides…" />
      </div>

      {/* Notes */}
      <div className="space-y-1">
        <div className={labelCls}>Notes (internal)</div>
        <textarea className={cn(fieldCls, 'resize-none')} rows={2} value={draft.notes ?? ''} onChange={(e) => onChange({ notes: e.target.value })} placeholder="Internal notes about this feed…" />
      </div>

      {/* Tags */}
      <div className="space-y-1">
        <div className={labelCls}>Tags</div>
        <div className="flex gap-1">
          <input
            className={fieldCls}
            value={tagInput}
            onChange={(e) => onTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onAddTag() } }}
            placeholder="Add tag and press Enter…"
          />
          <button onClick={onAddTag} className="shrink-0 rounded-lg border border-border/40 bg-card/60 px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-border/60 transition-colors">+</button>
        </div>
        {(draft.tags ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1">
            {(draft.tags ?? []).map((tag) => (
              <button key={tag} onClick={() => onRemoveTag(tag)} className="rounded-full border border-border/20 bg-card/30 px-1.5 py-0.5 font-mono text-[8px] text-muted-foreground/60">
                #{tag} ×
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Publishable toggle */}
      <div className="flex items-center gap-2">
        <div
          className={cn('relative h-5 w-9 shrink-0 rounded-full border transition-all duration-200 cursor-pointer', (draft.publishable ?? false) ? 'border-primary/60 bg-primary/20' : 'border-border/40 bg-card/40')}
          onClick={() => onChange({ publishable: !(draft.publishable ?? false) })}
          role="switch"
          aria-checked={draft.publishable ?? false}
        >
          <div className={cn('absolute top-0.5 h-4 w-4 rounded-full transition-all duration-200', (draft.publishable ?? false) ? 'left-[18px] bg-primary' : 'left-0.5 bg-muted-foreground/40')} />
        </div>
        <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/60">Publishable (show on public site)</span>
      </div>

      {/* Published pages */}
      {(draft.publishable ?? false) && (
        <div className="space-y-1.5">
          <div className={labelCls}>Published pages</div>
          <div className="flex flex-wrap gap-2">
            {PUBLISHED_PAGES.map((page) => {
              const checked = (draft.publishedPages ?? []).includes(page)
              return (
                <button
                  key={page}
                  type="button"
                  onClick={() => onTogglePage(page)}
                  className={cn('flex items-center gap-1.5 cursor-pointer rounded-lg border px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider transition-colors', checked ? 'border-primary/40 bg-primary/10 text-primary' : 'border-border/30 bg-card/40 text-muted-foreground/60 hover:border-border/50 hover:text-muted-foreground')}
                >
                  {checked ? '✓' : ''} {page}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Error (add mode only) */}
      {props.mode === 'add' && props.error && (
        <p className="font-mono text-[9px] text-rose-300/80">{props.error}</p>
      )}

      {/* Actions */}
      {props.mode === 'edit' ? (
        <div className="flex items-center gap-2">
          <button onClick={props.onSubmit} className="flex-1 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-amber-300 hover:bg-amber-400/15 transition-colors cursor-pointer">
            ✓ Save Changes
          </button>
          <button onClick={props.onCancel} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-white/30 hover:text-white/50 hover:border-white/20 transition-colors cursor-pointer">
            Cancel
          </button>
        </div>
      ) : (
        <button onClick={props.onSubmit} className="w-full rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-primary hover:bg-primary/15 transition-colors cursor-pointer">
          + Add Feed
        </button>
      )}
    </div>
  )
}
