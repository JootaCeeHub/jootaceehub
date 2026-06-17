'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useMediaLibrary } from '@/hooks/useMediaLibrary'
import type { MediaAssetRow, MediaType } from '@/lib/cms/media'

const TYPE_FILTERS: { label: string; value: MediaType | '' }[] = [
  { label: 'All', value: '' },
  { label: 'Images', value: 'image' },
  { label: 'Videos', value: 'video' },
  { label: 'Docs', value: 'document' },
]

export default function MediaLibraryPanel() {
  const [typeFilter, setTypeFilter] = useState<MediaType | ''>('')
  const [search, setSearch] = useState('')
  const [altEdit, setAltEdit] = useState<{ id: string; current: string } | null>(null)
  const [altValue, setAltValue] = useState('')

  const { assets, total, loading, error, updateAlt, remove, refresh } = useMediaLibrary({
    mediaType: typeFilter || undefined,
    search: search || undefined,
  })

  async function handleDelete(asset: MediaAssetRow) {
    if (!confirm(`Delete "${asset.filename}"?`)) return
    await remove(asset.id)
  }

  async function handleAltSave() {
    if (!altEdit) return
    await updateAlt(altEdit.id, altValue)
    setAltEdit(null)
  }

  function openAltEdit(asset: MediaAssetRow) {
    setAltEdit({ id: asset.id, current: asset.alt_text ?? '' })
    setAltValue(asset.alt_text ?? '')
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-semibold text-white">Media Library</h2>
          <p className="text-xs text-white/40">{total} assets</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={refresh} className="rounded px-2 py-1 text-xs text-white/30 hover:text-white hover:bg-white/5 transition-colors" title="Refresh">↻</button>
        </div>
      </div>

      {error && <p className="mx-4 mt-4 rounded-lg border border-red-500/20 bg-red-500/8 px-4 py-2.5 text-xs text-red-400">{error}</p>}

      {/* Filters */}
      <div className="flex items-center gap-2 border-b border-white/5 bg-white/1 px-6 py-3">
        <input
          type="search"
          placeholder="Search files…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 w-56 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white placeholder:text-white/25 outline-none focus:border-rose-500/40 transition-colors"
        />
        <div className="flex items-center gap-1">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              className={cn(
                'rounded-lg border px-3 py-1 text-xs transition-colors',
                typeFilter === f.value
                  ? 'border-rose-500/40 bg-rose-500/10 text-rose-400'
                  : 'border-white/8 text-white/40 hover:border-white/20 hover:text-white/70'
              )}
              onClick={() => setTypeFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="h-5 w-5 animate-spin rounded-full border-2 border-white/10 border-t-rose-400" /></div>
        ) : assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <div className="text-4xl opacity-20">🖼</div>
            <p className="text-sm text-white/40">No media yet — upload something!</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {assets.map((asset) => (
              <div key={asset.id} className="group relative overflow-hidden rounded-xl border border-white/6 bg-white/3 aspect-square cursor-pointer hover:border-rose-500/30 transition-colors" onClick={() => openAltEdit(asset)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && openAltEdit(asset)}>
                {asset.media_type === 'image' && asset.cloudinary_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={asset.cloudinary_url}
                    alt={asset.alt_text ?? asset.filename}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl text-white/20">
                    {asset.media_type === 'video' ? '🎬' : '📄'}
                  </div>
                )}
                <div className="absolute inset-0 flex flex-col items-start justify-end gap-0.5 bg-gradient-to-t from-black/70 via-transparent to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="w-full truncate text-[9px] font-medium text-white leading-tight">{asset.filename}</span>
                  <span className="text-[8px] text-white/50">{asset.mime_type.split('/')[1]?.toUpperCase()}</span>
                </div>
                <button
                  type="button"
                  className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white/50 hover:text-red-400 hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
                  onClick={(e) => { e.stopPropagation(); handleDelete(asset) }}
                  aria-label="Delete"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alt text editor */}
      {altEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setAltEdit(null)}>
          <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-[#0e1520] p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <p className="mb-3 text-xs font-semibold text-white">Edit alt text</p>
            <input
              type="text"
              autoFocus
              value={altValue}
              onChange={(e) => setAltValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAltSave()}
              placeholder="Describe this image…"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-rose-500/40"
            />
            <div className="mt-3 flex justify-end gap-2">
              <button type="button" onClick={() => setAltEdit(null)} className="rounded px-3 py-1.5 text-xs text-white/40 hover:text-white transition-colors">Cancel</button>
              <button type="button" onClick={handleAltSave} className="rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-600">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
