'use client'

import { useState } from 'react'
import { Plus, Trash2, Tag as TagIcon, Folder, BookOpen, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdmin } from '@/lib/admin/store'
import type { Tag, Category, Series, RevisionContentType } from '@/lib/admin/types'
import { downloadContentBundle } from '@/lib/cms/content-export'

function nanoid() { return Math.random().toString(36).slice(2, 10) }
function now()    { return new Date().toISOString() }
function toSlug(s: string) { return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }

// ─── Tag editor ────────────────────────────────────────────────────────────────

function TagRow({ tag }: { tag: Tag }) {
  const { dispatch } = useAdmin()
  const [editing, setEditing] = useState(false)
  const [label, setLabel] = useState(tag.label)
  const [color, setColor] = useState(tag.color ?? '#a78bfa')

  function save() {
    dispatch({ type: 'UPDATE_TAG', payload: { id: tag.id, data: { label, slug: toSlug(label), color } } })
    setEditing(false)
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: tag.color ?? '#a78bfa' }} />
      {editing ? (
        <div className="flex flex-1 items-center gap-2">
          <input
            value={label}
            onChange={e => setLabel(e.target.value)}
            className="flex-1 rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-white/80 outline-none focus:border-white/25"
            onKeyDown={e => e.key === 'Enter' && save()}
            autoFocus
          />
          <input type="color" value={color} onChange={e => setColor(e.target.value)} className="h-5 w-7 cursor-pointer rounded border border-white/10 bg-transparent" />
          <button onClick={save} className="font-mono text-[8px] text-emerald-400/70 hover:text-emerald-400">save</button>
          <button onClick={() => setEditing(false)} className="font-mono text-[8px] text-white/25 hover:text-white/50">cancel</button>
        </div>
      ) : (
        <>
          <span className="flex-1 font-mono text-[10px] text-white/65">{tag.label}</span>
          <span className="font-mono text-[8px] text-white/20">{tag.slug}</span>
          <button onClick={() => setEditing(true)} className="font-mono text-[8px] text-white/30 hover:text-white/60 px-1">edit</button>
          <button onClick={() => dispatch({ type: 'REMOVE_TAG', payload: tag.id })} className="text-rose-400/40 hover:text-rose-400/70 transition-colors">
            <Trash2 className="h-3 w-3" />
          </button>
        </>
      )}
    </div>
  )
}

function AddTagForm() {
  const { dispatch } = useAdmin()
  const [label, setLabel] = useState('')
  const [color, setColor] = useState('#a78bfa')

  function add() {
    if (!label.trim()) return
    const slug = toSlug(label)
    dispatch({ type: 'ADD_TAG', payload: { id: nanoid(), slug, label: label.trim(), color, createdAt: now() } })
    setLabel('')
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-dashed border-white/10 px-3 py-2">
      <Plus className="h-3 w-3 text-white/25 shrink-0" />
      <input
        value={label}
        onChange={e => setLabel(e.target.value)}
        placeholder="New tag label…"
        className="flex-1 bg-transparent font-mono text-[10px] text-white/70 placeholder:text-white/20 outline-none"
        onKeyDown={e => e.key === 'Enter' && add()}
      />
      <input type="color" value={color} onChange={e => setColor(e.target.value)} className="h-5 w-7 cursor-pointer rounded border border-white/10 bg-transparent" />
      <button onClick={add} disabled={!label.trim()} className="font-mono text-[8px] text-emerald-400/60 hover:text-emerald-400 disabled:opacity-30">add</button>
    </div>
  )
}

// ─── Category editor ───────────────────────────────────────────────────────────

function CategoryRow({ cat }: { cat: Category }) {
  const { dispatch } = useAdmin()
  const [editing, setEditing] = useState(false)
  const [label, setLabel] = useState(cat.label)

  function save() {
    dispatch({ type: 'UPDATE_CATEGORY', payload: { id: cat.id, data: { label, slug: toSlug(label) } } })
    setEditing(false)
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
      <Folder className="h-3 w-3 text-white/25 shrink-0" />
      {editing ? (
        <div className="flex flex-1 items-center gap-2">
          <input
            value={label}
            onChange={e => setLabel(e.target.value)}
            className="flex-1 rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-white/80 outline-none focus:border-white/25"
            onKeyDown={e => e.key === 'Enter' && save()}
            autoFocus
          />
          <button onClick={save} className="font-mono text-[8px] text-emerald-400/70 hover:text-emerald-400">save</button>
          <button onClick={() => setEditing(false)} className="font-mono text-[8px] text-white/25 hover:text-white/50">cancel</button>
        </div>
      ) : (
        <>
          <span className="flex-1 font-mono text-[10px] text-white/65">{cat.label}</span>
          <span className="font-mono text-[8px] text-white/20">{cat.slug}</span>
          <button onClick={() => setEditing(true)} className="font-mono text-[8px] text-white/30 hover:text-white/60 px-1">edit</button>
          <button onClick={() => dispatch({ type: 'REMOVE_CATEGORY', payload: cat.id })} className="text-rose-400/40 hover:text-rose-400/70 transition-colors">
            <Trash2 className="h-3 w-3" />
          </button>
        </>
      )}
    </div>
  )
}

function AddCategoryForm() {
  const { dispatch } = useAdmin()
  const [label, setLabel] = useState('')

  function add() {
    if (!label.trim()) return
    dispatch({ type: 'ADD_CATEGORY', payload: { id: nanoid(), slug: toSlug(label), label: label.trim(), createdAt: now() } })
    setLabel('')
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-dashed border-white/10 px-3 py-2">
      <Plus className="h-3 w-3 text-white/25 shrink-0" />
      <input
        value={label}
        onChange={e => setLabel(e.target.value)}
        placeholder="New category label…"
        className="flex-1 bg-transparent font-mono text-[10px] text-white/70 placeholder:text-white/20 outline-none"
        onKeyDown={e => e.key === 'Enter' && add()}
      />
      <button onClick={add} disabled={!label.trim()} className="font-mono text-[8px] text-emerald-400/60 hover:text-emerald-400 disabled:opacity-30">add</button>
    </div>
  )
}

// ─── MediaRegistry summary ─────────────────────────────────────────────────────

function MediaSummary() {
  const { state, dispatch } = useAdmin()
  const media = state.mediaRegistry
  const [url, setUrl]   = useState('')
  const [alt, setAlt]   = useState('')

  // Compute which media IDs are referenced in content registries
  const referencedIds = new Set<string>()
  const allContent = JSON.stringify([state.projectsRegistry, state.researchRegistry, state.labsRegistry])
  media.forEach(m => { if (allContent.includes(m.id)) referencedIds.add(m.id) })
  const unusedCount = media.filter(m => !referencedIds.has(m.id)).length

  function addMedia() {
    if (!url.trim() || !alt.trim()) return
    dispatch({ type: 'ADD_MEDIA_ITEM', payload: {
      id: nanoid(), url: url.trim(), alt: alt.trim(),
      source: url.includes('github') ? 'github' : 'external', addedAt: now(),
    }})
    setUrl(''); setAlt('')
  }

  function purgeUnused() {
    if (!confirm(`Remove ${unusedCount} unused media items?`)) return
    const unused = media.filter(m => !referencedIds.has(m.id)).map(m => m.id)
    unused.forEach(id => dispatch({ type: 'REMOVE_MEDIA_ITEM', payload: id }))
  }

  return (
    <div className="space-y-2">
      {unusedCount > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-400/15 bg-amber-400/5 px-3 py-2">
          <span className="flex-1 font-mono text-[8.5px] text-amber-400/70">{unusedCount} unused media item{unusedCount > 1 ? 's' : ''} not referenced by any content</span>
          <button onClick={purgeUnused} className="font-mono text-[8px] text-rose-400/60 hover:text-rose-400/90 transition-colors">purge</button>
        </div>
      )}
      <div className="flex items-center gap-2 border border-dashed border-white/10 rounded-lg px-3 py-2">
        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="Image URL…"
          className="flex-1 bg-transparent font-mono text-[10px] text-white/70 placeholder:text-white/20 outline-none" />
        <input value={alt} onChange={e => setAlt(e.target.value)} placeholder="Alt text…"
          className="w-32 bg-transparent font-mono text-[10px] text-white/70 placeholder:text-white/20 outline-none" />
        <button onClick={addMedia} disabled={!url.trim() || !alt.trim()} className="font-mono text-[8px] text-emerald-400/60 hover:text-emerald-400 disabled:opacity-30">add</button>
      </div>
      {media.slice(0, 6).map(m => (
        <div key={m.id} className={cn('flex items-center gap-2 rounded-lg border bg-white/[0.02] px-3 py-2', referencedIds.has(m.id) ? 'border-white/[0.06]' : 'border-amber-400/10')}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={m.url} alt={m.alt} className="h-7 w-10 rounded object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
          <span className="flex-1 truncate font-mono text-[10px] text-white/55">{m.alt}</span>
          {!referencedIds.has(m.id) && <span className="font-mono text-[7px] text-amber-400/50">unused</span>}
          <button onClick={() => dispatch({ type: 'REMOVE_MEDIA_ITEM', payload: m.id })} className="text-rose-400/40 hover:text-rose-400/70 transition-colors">
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      ))}
      {media.length > 6 && (
        <p className="font-mono text-[8px] text-white/25 text-center">+{media.length - 6} more items</p>
      )}
    </div>
  )
}

// ─── Revision log summary ──────────────────────────────────────────────────────

function RevisionSummary() {
  const { state, dispatch } = useAdmin()
  const revisions = [...state.revisionLog].reverse().slice(0, 15)

  function rollback(r: (typeof revisions)[0]) {
    if (!confirm(`Restore "${r.contentId}" to version from ${new Date(r.savedAt).toLocaleString()}?`)) return
    dispatch({ type: 'RESTORE_REVISION', payload: r })
  }

  return (
    <div className="space-y-1.5">
      {revisions.length === 0 && (
        <p className="font-mono text-[9px] text-white/25 text-center py-4">No revisions yet. Revisions are auto-saved when you edit or publish content.</p>
      )}
      {revisions.map(r => (
        <div key={r.id} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 space-y-1">
          <div className="flex items-center gap-2">
            <span className={cn('rounded border px-1.5 py-0.5 font-mono text-[7px] uppercase shrink-0', {
              'border-amber-400/15 text-amber-400/60': r.contentType === 'project',
              'border-emerald-400/15 text-emerald-400/60': r.contentType === 'research',
              'border-sky-400/15 text-sky-400/60': r.contentType === 'lab',
              'border-purple-400/15 text-purple-400/60': r.contentType === 'system',
            })}>{r.contentType}</span>
            <span className="flex-1 truncate font-mono text-[9px] text-white/55">{r.contentId}</span>
            <span className="font-mono text-[7.5px] text-white/22 shrink-0">{new Date(r.savedAt).toLocaleString()}</span>
            {(r.contentType === 'project' || r.contentType === 'research') && (
              <button
                onClick={() => rollback(r)}
                className="font-mono text-[7.5px] text-sky-400/40 hover:text-sky-400/80 transition-colors shrink-0"
              >restore</button>
            )}
            <button
              onClick={() => dispatch({ type: 'CLEAR_REVISIONS', payload: { contentId: r.contentId, contentType: r.contentType } })}
              className="font-mono text-[7.5px] text-white/20 hover:text-rose-400/60 transition-colors shrink-0"
            >clear</button>
          </div>
          {r.note && (
            <p className="font-mono text-[7.5px] text-white/30 leading-snug pl-1">{r.note}</p>
          )}
        </div>
      ))}
      {state.revisionLog.length > 15 && (
        <p className="font-mono text-[8px] text-white/20 text-center">{state.revisionLog.length} total revisions (50 max kept)</p>
      )}
    </div>
  )
}

// ─── Series editor ────────────────────────────────────────────────────────────

function SeriesRow({ series }: { series: Series }) {
  const { dispatch } = useAdmin()
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(series.title)

  function save() {
    dispatch({ type: 'UPDATE_SERIES', payload: { id: series.id, data: { title, slug: toSlug(title) } } })
    setEditing(false)
  }

  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 space-y-1">
      <div className="flex items-center gap-2">
        <BookOpen className="h-3 w-3 shrink-0 text-sky-400/50" />
        {editing ? (
          <input
            autoFocus value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={save} onKeyDown={e => e.key === 'Enter' && save()}
            className="flex-1 rounded border border-white/10 bg-black/20 px-2 py-0.5 font-mono text-[9px] text-white/70 outline-none focus:border-white/25"
          />
        ) : (
          <button onClick={() => setEditing(true)} className="flex-1 text-left font-mono text-[9px] text-white/60 hover:text-white/80 transition-colors">{series.title}</button>
        )}
        <span className="font-mono text-[7.5px] text-white/25 shrink-0">{series.contentType} · {series.order.length} items</span>
        <button onClick={() => dispatch({ type: 'REMOVE_SERIES', payload: series.id })} className="text-white/15 hover:text-rose-400/70 transition-colors shrink-0">
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
      <p className="font-mono text-[7.5px] text-white/25 pl-5">{series.description || 'No description'}</p>
    </div>
  )
}

function AddSeriesForm() {
  const { dispatch } = useAdmin()
  const [title, setTitle] = useState('')
  const [contentType, setContentType] = useState<RevisionContentType>('research')

  function add() {
    const t = title.trim()
    if (!t) return
    dispatch({ type: 'ADD_SERIES', payload: { id: nanoid(), slug: toSlug(t), title: t, order: [], contentType, createdAt: now() } })
    setTitle('')
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-dashed border-white/10 px-3 py-2">
      <input
        value={title} onChange={e => setTitle(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && add()}
        placeholder="New series title…"
        className="flex-1 bg-transparent font-mono text-[9px] text-white/55 placeholder:text-white/20 outline-none"
      />
      <select value={contentType} onChange={e => setContentType(e.target.value as RevisionContentType)}
        className="rounded border border-white/8 bg-black/20 px-1.5 py-1 font-mono text-[8px] text-white/40 outline-none">
        {(['research', 'project', 'lab', 'system'] as const).map(t => <option key={t} value={t}>{t}</option>)}
      </select>
      <button onClick={add} className="text-white/25 hover:text-white/70 transition-colors">
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

// ─── Main panel ────────────────────────────────────────────────────────────────

type Tab = 'tags' | 'categories' | 'series' | 'media' | 'revisions'

export function TaxonomyPanel() {
  const { state } = useAdmin()
  const [tab, setTab] = useState<Tab>('tags')
  const [exportMsg, setExportMsg] = useState<string | null>(null)

  const draftCount    = state.projectsRegistry.filter(p => !p.published).length + state.researchRegistry.filter(r => !r.published).length
  const reviewCount   = state.projectsRegistry.filter(p => p.cmsStatus === 'review').length + state.researchRegistry.filter(r => r.cmsStatus === 'review').length
  const publishedCount= state.projectsRegistry.filter(p => p.published).length + state.researchRegistry.filter(r => r.published).length

  function handleExport() {
    const result = downloadContentBundle(state)
    setExportMsg(result.validationWarnings > 0 ? `Exported with ${result.validationWarnings} validation warning(s)` : 'Export complete')
    setTimeout(() => setExportMsg(null), 4000)
  }

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }>; count: number }[] = [
    { id: 'tags',       label: 'Tags',       icon: TagIcon,   count: state.tagRegistry.length },
    { id: 'categories', label: 'Categories', icon: Folder,    count: state.categoryRegistry.length },
    { id: 'series',     label: 'Series',     icon: BookOpen,  count: state.seriesRegistry.length },
    { id: 'media',      label: 'Media',      icon: TagIcon,   count: state.mediaRegistry.length },
    { id: 'revisions',  label: 'Revisions',  icon: TagIcon,   count: state.revisionLog.length },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/30 mb-0.5">CMS Taxonomy</div>
          <p className="font-mono text-[8px] text-white/20">Global tags, categories, media registry, and content revisions.</p>
        </div>
        <button onClick={handleExport} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 font-mono text-[8.5px] text-white/45 hover:border-emerald-400/25 hover:text-emerald-400/70 transition-colors shrink-0">
          <Download className="h-3 w-3" /> Export
        </button>
      </div>

      {/* Content status summary */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Draft',     count: draftCount,     color: '#f59e0b' },
          { label: 'In Review', count: reviewCount,    color: '#38bdf8' },
          { label: 'Published', count: publishedCount, color: '#34d399' },
        ].map(({ label, count, color }) => (
          <div key={label} className="flex flex-col items-center rounded-xl border border-white/[0.06] bg-white/[0.02] py-2">
            <span className="font-mono text-[20px] font-bold tabular-nums" style={{ color }}>{count}</span>
            <span className="font-mono text-[7.5px] uppercase tracking-[0.12em] text-white/30">{label}</span>
          </div>
        ))}
      </div>

      {exportMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-400/15 bg-emerald-400/5 px-3 py-2">
          <span className="font-mono text-[8.5px] text-emerald-400/70">{exportMsg}</span>
        </div>
      )}

      {/* Tab bar */}
      <div className="flex items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.025] p-1">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 font-mono text-[9px] transition-all',
              tab === t.id
                ? 'bg-white/8 text-white/80'
                : 'text-white/30 hover:text-white/55',
            )}
          >
            {t.label}
            {t.count > 0 && (
              <span className="rounded-full bg-white/10 px-1.5 font-mono text-[7px] text-white/40">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="space-y-2">
        {tab === 'tags' && (
          <>
            {state.tagRegistry.map(tag => <TagRow key={tag.id} tag={tag} />)}
            <AddTagForm />
          </>
        )}
        {tab === 'categories' && (
          <>
            {state.categoryRegistry.map(cat => <CategoryRow key={cat.id} cat={cat} />)}
            <AddCategoryForm />
          </>
        )}
        {tab === 'series' && (
          <>
            {state.seriesRegistry.map(s => <SeriesRow key={s.id} series={s} />)}
            <AddSeriesForm />
          </>
        )}
        {tab === 'media' && <MediaSummary />}
        {tab === 'revisions' && <RevisionSummary />}
      </div>
    </div>
  )
}
