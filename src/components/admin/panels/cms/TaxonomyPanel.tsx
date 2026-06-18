'use client'

import { useState } from 'react'
import { Plus, Trash2, Tag as TagIcon, Folder } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdmin } from '@/lib/admin/store'
import type { Tag, Category } from '@/lib/admin/types'

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

  function addMedia() {
    if (!url.trim() || !alt.trim()) return
    dispatch({ type: 'ADD_MEDIA_ITEM', payload: {
      id: nanoid(), url: url.trim(), alt: alt.trim(),
      source: url.includes('github') ? 'github' : 'external', addedAt: now(),
    }})
    setUrl(''); setAlt('')
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 border border-dashed border-white/10 rounded-lg px-3 py-2">
        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="Image URL…"
          className="flex-1 bg-transparent font-mono text-[10px] text-white/70 placeholder:text-white/20 outline-none" />
        <input value={alt} onChange={e => setAlt(e.target.value)} placeholder="Alt text…"
          className="w-32 bg-transparent font-mono text-[10px] text-white/70 placeholder:text-white/20 outline-none" />
        <button onClick={addMedia} disabled={!url.trim() || !alt.trim()} className="font-mono text-[8px] text-emerald-400/60 hover:text-emerald-400 disabled:opacity-30">add</button>
      </div>
      {media.slice(0, 6).map(m => (
        <div key={m.id} className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={m.url} alt={m.alt} className="h-7 w-10 rounded object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
          <span className="flex-1 truncate font-mono text-[10px] text-white/55">{m.alt}</span>
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
  const revisions = [...state.revisionLog].reverse().slice(0, 10)

  return (
    <div className="space-y-1.5">
      {revisions.length === 0 && (
        <p className="font-mono text-[9px] text-white/25 text-center py-4">No revisions yet. Revisions are auto-saved when you edit content items.</p>
      )}
      {revisions.map(r => (
        <div key={r.id} className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
          <span className={cn('rounded border px-1.5 py-0.5 font-mono text-[7px] uppercase', {
            'border-amber-400/15 text-amber-400/60': r.contentType === 'project',
            'border-emerald-400/15 text-emerald-400/60': r.contentType === 'research',
            'border-sky-400/15 text-sky-400/60': r.contentType === 'lab',
            'border-purple-400/15 text-purple-400/60': r.contentType === 'system',
          })}>{r.contentType}</span>
          <span className="flex-1 truncate font-mono text-[9px] text-white/55">{r.contentId}</span>
          <span className="font-mono text-[8px] text-white/25">{new Date(r.savedAt).toLocaleString()}</span>
          <button
            onClick={() => dispatch({ type: 'CLEAR_REVISIONS', payload: { contentId: r.contentId, contentType: r.contentType } })}
            className="font-mono text-[7.5px] text-white/20 hover:text-rose-400/60 transition-colors"
          >clear</button>
        </div>
      ))}
      {state.revisionLog.length > 10 && (
        <p className="font-mono text-[8px] text-white/20 text-center">{state.revisionLog.length} total revisions (50 max kept)</p>
      )}
    </div>
  )
}

// ─── Main panel ────────────────────────────────────────────────────────────────

type Tab = 'tags' | 'categories' | 'media' | 'revisions'

export function TaxonomyPanel() {
  const { state } = useAdmin()
  const [tab, setTab] = useState<Tab>('tags')

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }>; count: number }[] = [
    { id: 'tags',       label: 'Tags',       icon: TagIcon,  count: state.tagRegistry.length },
    { id: 'categories', label: 'Categories', icon: Folder,   count: state.categoryRegistry.length },
    { id: 'media',      label: 'Media',      icon: TagIcon,  count: state.mediaRegistry.length },
    { id: 'revisions',  label: 'Revisions',  icon: TagIcon,  count: state.revisionLog.length },
  ]

  return (
    <div className="space-y-5">
      <div>
        <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/30 mb-0.5">CMS Taxonomy</div>
        <p className="font-mono text-[8px] text-white/20">Global tags, categories, media registry, and content revisions.</p>
      </div>

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
        {tab === 'media' && <MediaSummary />}
        {tab === 'revisions' && <RevisionSummary />}
      </div>
    </div>
  )
}
