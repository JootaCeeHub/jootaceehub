'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useSecureMedia } from '@/hooks/useSecureMedia'
import { validateMediaUrl, ALLOWED_DOMAINS_LIST } from '@/lib/cms/media-security'
import type { MediaItem } from '@/lib/admin/types'
import {
  Image as ImageIcon,
  Trash2,
  Plus,
  Search,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  Edit2,
  FileVideo,
  FileText,
  ExternalLink,
} from 'lucide-react'

// ─── Type helpers ─────────────────────────────────────────────────────────────

type TypeFilter = 'all' | 'image' | 'video' | 'document'

function typeFromMime(mime?: string): TypeFilter {
  if (!mime) return 'document'
  if (mime.startsWith('image/')) return 'image'
  if (mime.startsWith('video/')) return 'video'
  return 'document'
}

// ─── URL validator indicator ──────────────────────────────────────────────────

function UrlValidIndicator({ url }: { url: string }) {
  if (!url) return null
  const result = validateMediaUrl(url)
  if (result.valid) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-emerald-400">
        <CheckCircle2 size={11} />
        <span>{result.mimeType} · {result.domain}</span>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-1.5 text-xs text-rose-400">
      <AlertTriangle size={11} />
      <span>{result.error}</span>
    </div>
  )
}

// ─── Add media form ───────────────────────────────────────────────────────────

interface AddFormProps { onSuccess: () => void; onCancel: () => void }

function AddMediaForm({ onSuccess, onCancel }: AddFormProps) {
  const { addItem } = useSecureMedia()
  const [url, setUrl] = useState('')
  const [alt, setAlt] = useState('')
  const [caption, setCaption] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showDomains, setShowDomains] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = addItem({ url, alt, caption: caption || undefined })
    if (result.error) { setError(result.error) } else { onSuccess() }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 rounded-xl border border-white/10 bg-white/[0.03]">
      <div className="flex items-center gap-2">
        <Shield size={14} className="text-emerald-400" />
        <span className="text-sm font-medium text-white/70">Add External Media</span>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-white/50">Image URL <span className="text-rose-400">*</span></label>
        <input
          value={url}
          onChange={e => { setUrl(e.target.value); setError(null) }}
          placeholder="https://images.unsplash.com/…"
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 text-sm font-mono focus:outline-none focus:border-cyan-500/40 placeholder:text-white/20"
        />
        <UrlValidIndicator url={url} />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-white/50">Alt text <span className="text-rose-400">*</span> <span className="text-white/20">(accessibility)</span></label>
        <input
          value={alt}
          onChange={e => setAlt(e.target.value)}
          placeholder="Describe the image for screen readers…"
          maxLength={200}
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 text-sm focus:outline-none focus:border-cyan-500/40"
        />
        <p className="text-xs text-white/20">{alt.length}/200</p>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-white/50">Caption <span className="text-white/20">(optional)</span></label>
        <input
          value={caption}
          onChange={e => setCaption(e.target.value)}
          placeholder="Photo by John Doe on Unsplash"
          maxLength={500}
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 text-sm focus:outline-none focus:border-cyan-500/40"
        />
      </div>

      <button
        type="button"
        onClick={() => setShowDomains(!showDomains)}
        className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/50 transition-colors"
      >
        <Info size={10} />
        {showDomains ? 'Hide' : 'Show'} allowed domains ({ALLOWED_DOMAINS_LIST.length})
      </button>
      {showDomains && (
        <div className="rounded-lg bg-white/3 border border-white/5 p-3 max-h-28 overflow-y-auto">
          <div className="flex flex-wrap gap-1">
            {ALLOWED_DOMAINS_LIST.map(d => (
              <span key={d} className="px-1.5 py-0.5 rounded bg-white/5 text-white/30 font-mono text-[10px]">{d}</span>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
          <AlertTriangle size={13} className="text-rose-400 shrink-0 mt-0.5" />
          <p className="text-xs text-rose-300">{error}</p>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-3 py-2 text-sm text-white/40 hover:text-white/70 transition-colors">Cancel</button>
        <button
          type="submit"
          disabled={!url || !alt}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-sm hover:bg-cyan-500/30 transition-colors disabled:opacity-40"
        >
          <Plus size={13} />
          Add
        </button>
      </div>
    </form>
  )
}

// ─── Edit modal ───────────────────────────────────────────────────────────────

function EditModal({ item, onClose }: { item: MediaItem; onClose: () => void }) {
  const { updateItem } = useSecureMedia()
  const [alt, setAlt] = useState(item.alt)
  const [caption, setCaption] = useState(item.caption ?? '')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-xl border border-white/10 bg-[#0d0d1a] p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white/70">Edit metadata</span>
          <button onClick={onClose} className="text-white/30 hover:text-white/60"><X size={14} /></button>
        </div>
        <p className="text-xs font-mono text-white/25 break-all">{item.url}</p>
        <div className="space-y-1">
          <label className="text-xs text-white/40">Alt text *</label>
          <input
            value={alt}
            onChange={e => setAlt(e.target.value)}
            maxLength={200}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 text-sm focus:outline-none focus:border-cyan-500/40"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-white/40">Caption</label>
          <input
            value={caption}
            onChange={e => setCaption(e.target.value)}
            maxLength={500}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 text-sm focus:outline-none focus:border-cyan-500/40"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 text-sm text-white/40 hover:text-white/70 transition-colors">Cancel</button>
          <button
            onClick={() => { updateItem(item.id, { alt, caption }); onClose() }}
            disabled={!alt.trim()}
            className="px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-sm hover:bg-cyan-500/30 transition-colors disabled:opacity-40"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Media card ───────────────────────────────────────────────────────────────

function MediaCard({ item, onEdit, onRemove }: { item: MediaItem; onEdit: () => void; onRemove: () => void }) {
  const type = typeFromMime(item.mimeType)

  return (
    <div className="group relative flex flex-col rounded-xl border border-white/5 bg-white/[0.03] overflow-hidden hover:border-white/15 transition-colors">
      <div className="relative aspect-video bg-black/20 overflow-hidden">
        {type === 'image' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.url}
            alt={item.alt}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            {type === 'video'
              ? <FileVideo size={28} className="text-white/20" />
              : <FileText size={28} className="text-white/20" />
            }
          </div>
        )}
        <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] bg-black/60 text-white/40 font-mono">{item.source}</span>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/65 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 transition-colors" title="Edit">
            <Edit2 size={13} />
          </button>
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 transition-colors" title="Open">
            <ExternalLink size={13} />
          </a>
          <button onClick={onRemove} className="p-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 transition-colors" title="Remove">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <div className="px-2 py-2 space-y-0.5">
        <p className="text-xs text-white/60 truncate" title={item.alt}>{item.alt}</p>
        {item.caption && <p className="text-[10px] text-white/30 truncate">{item.caption}</p>}
        <p className="text-[9px] text-white/20 font-mono truncate">{item.url.replace('https://', '')}</p>
      </div>
    </div>
  )
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export default function MediaLibraryPanel() {
  const { items, total, removeItem } = useSecureMedia()
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editItem, setEditItem] = useState<MediaItem | null>(null)

  const filtered = useMemo(() => {
    let list = items
    if (typeFilter !== 'all') list = list.filter(m => typeFromMime(m.mimeType) === typeFilter)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(m =>
        m.url.toLowerCase().includes(q) ||
        m.alt.toLowerCase().includes(q) ||
        m.caption?.toLowerCase().includes(q),
      )
    }
    return [...list].sort((a, b) => b.addedAt.localeCompare(a.addedAt))
  }, [items, typeFilter, searchQuery])

  function handleRemove(item: MediaItem) {
    if (!confirm(`Remove "${item.alt}"?`)) return
    removeItem(item.id)
  }

  const TYPE_LABELS: { key: TypeFilter; label: string }[] = [
    { key: 'all', label: `All (${total})` },
    { key: 'image', label: 'Images' },
    { key: 'video', label: 'Video' },
    { key: 'document', label: 'Docs' },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
        <div className="flex items-center gap-2">
          <Shield size={14} className="text-emerald-400" />
          <div>
            <h2 className="text-sm font-semibold text-white">Media Library</h2>
            <p className="text-xs text-white/40">HTTPS-only · domain-validated · {total} assets</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors',
            showAddForm
              ? 'bg-white/8 border-white/15 text-white/50'
              : 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25',
          )}
        >
          {showAddForm ? <X size={12} /> : <Plus size={12} />}
          {showAddForm ? 'Cancel' : 'Add URL'}
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-4 space-y-4">
          {showAddForm && (
            <AddMediaForm onSuccess={() => setShowAddForm(false)} onCancel={() => setShowAddForm(false)} />
          )}

          {/* Security notice */}
          <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/12 text-xs text-emerald-400/60">
            <Shield size={11} className="mt-0.5 shrink-0" />
            <span>Only HTTPS URLs from trusted domains. Alt text required. HTML stripped from all fields.</span>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[140px]">
              <Search size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search url or alt…"
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 text-xs focus:outline-none focus:border-cyan-500/30"
              />
            </div>
            <div className="flex gap-1">
              {TYPE_LABELS.map(t => (
                <button
                  key={t.key}
                  onClick={() => setTypeFilter(t.key)}
                  className={cn(
                    'px-2.5 py-1.5 rounded-lg border text-xs transition-colors',
                    typeFilter === t.key
                      ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300'
                      : 'bg-white/5 border-white/8 text-white/40 hover:text-white/60',
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3 text-white/20">
              <ImageIcon size={32} />
              <p className="text-sm">
                {total === 0 ? 'No media yet' : 'No results for this filter'}
              </p>
              {total === 0 && (
                <button onClick={() => setShowAddForm(true)} className="text-xs text-cyan-400/60 hover:text-cyan-400 transition-colors">
                  + Add first asset
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {filtered.map(item => (
                <MediaCard
                  key={item.id}
                  item={item}
                  onEdit={() => setEditItem(item)}
                  onRemove={() => handleRemove(item)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {editItem && <EditModal item={editItem} onClose={() => setEditItem(null)} />}
    </div>
  )
}
