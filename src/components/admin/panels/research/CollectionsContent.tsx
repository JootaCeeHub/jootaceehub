'use client'

import { useState } from 'react'
import { useAdmin } from '@/lib/admin/store'
import type { CuratedLink, LinkCategory } from '@/lib/admin/types'
import { LINK_CATEGORIES, CAT_BADGE, autoCategorize, autoDescribe, uid, now } from './utils'
import { TagChips } from './TagChips'
import { BookmarkImporter } from './BookmarkImporter'

export function CollectionsContent() {
  const { state, dispatch } = useAdmin()
  const [filterCat, setFilterCat]   = useState<LinkCategory | 'all'>('all')
  const [showImport, setShowImport] = useState(false)
  const [search, setSearch]         = useState('')

  const links = state.curatedLinks
  const filtered = links.filter((l) => {
    const matchCat    = filterCat === 'all' || l.category === filterCat
    const matchSearch = !search || l.title.toLowerCase().includes(search.toLowerCase()) || l.url.toLowerCase().includes(search.toLowerCase()) || l.description.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  function handleBulkImport(items: Omit<CuratedLink, 'id' | 'addedAt'>[]) {
    const newLinks = items.map((item) => ({ ...item, id: uid(), addedAt: now() } as CuratedLink))
    dispatch({ type: 'SET_CURATED_LINKS', payload: [...links, ...newLinks] })
    setShowImport(false)
  }

  function recategorizeOthers() {
    const patched = links.map((l) => {
      if (l.category !== 'other') return l
      const newCat  = autoCategorize(l.url, '', l.title)
      const newDesc = !l.description ? autoDescribe(l.url, newCat, l.title) : l.description
      return newCat !== 'other' || newDesc !== l.description ? { ...l, category: newCat, description: newDesc || l.description } : l
    })
    dispatch({ type: 'SET_CURATED_LINKS', payload: patched })
  }

  const otherCount = links.filter((l) => l.category === 'other').length

  return (
    <div className="space-y-4">
      {/* Category breakdown chips */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setFilterCat('all')}
          className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 font-mono text-[9px] transition-colors ${filterCat === 'all' ? 'border-white/20 bg-white/8 text-white/70' : 'border-white/8 bg-white/[0.02] text-white/35 hover:text-white/55'}`}
        >
          All <span className="tabular-nums" style={{ color: '#94a3b8' }}>{links.length}</span>
        </button>
        {LINK_CATEGORIES.map((cat) => {
          const count = links.filter((l) => l.category === cat.id).length
          if (count === 0) return null
          const badge = CAT_BADGE[cat.id]
          return (
            <button
              key={cat.id}
              onClick={() => setFilterCat(filterCat === cat.id ? 'all' : cat.id)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 font-mono text-[9px] transition-colors ${filterCat === cat.id ? `${badge.border} ${badge.bg} ${badge.text}` : 'border-white/8 bg-white/[0.02] text-white/35 hover:text-white/55'}`}
            >
              <span>{cat.icon}</span>
              <span className={filterCat === cat.id ? badge.text : ''} style={filterCat !== cat.id ? { color: cat.color } : undefined}>{count}</span>
              <span>{cat.label}</span>
            </button>
          )
        })}
      </div>

      {/* Search + actions */}
      <div className="flex items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search collections…"
          className="flex-1 rounded-lg border border-white/10 bg-white/3 px-3 py-2 text-[11px] text-white/65 placeholder-white/25 outline-none focus:border-emerald-400/25 transition-colors"
        />
        {otherCount > 0 && (
          <button
            onClick={recategorizeOthers}
            className="shrink-0 rounded-lg border border-amber-400/20 bg-amber-400/5 px-3 py-2 font-mono text-[9px] uppercase tracking-wider text-amber-400/70 hover:bg-amber-400/10 hover:text-amber-400 transition-colors"
            title={`Re-run auto-categorize on ${otherCount} uncategorized links`}
          >
            ✦ Re-categorize {otherCount}
          </button>
        )}
        <button
          onClick={() => setShowImport(!showImport)}
          className="shrink-0 rounded-lg border border-white/10 bg-white/3 px-3 py-2 font-mono text-[9px] uppercase tracking-wider text-white/35 hover:border-white/20 hover:text-white/60 transition-colors"
        >
          📥 Import Bookmarks
        </button>
      </div>

      {showImport && <BookmarkImporter onImport={handleBulkImport} />}

      {/* Feed-style cards */}
      <div className="space-y-1.5">
        {filtered.map((link) => {
          const cat   = LINK_CATEGORIES.find((c) => c.id === link.category)
          const badge = CAT_BADGE[link.category]
          return (
            <div
              key={link.id}
              className={`flex items-start gap-3 rounded-xl border px-4 py-3 transition-all hover:border-white/15 ${link.published ? 'border-white/8 bg-white/[0.02]' : 'border-white/5 bg-white/[0.01] opacity-60'}`}
            >
              <span className="shrink-0 mt-0.5 text-base">{cat?.icon ?? '🔗'}</span>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="text-[12px] font-medium text-white/75 leading-snug">{link.title}</div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`rounded border ${badge.border} ${badge.bg} ${badge.text} px-1.5 py-0.5 font-mono text-[7.5px] uppercase tracking-widest`}>
                    {cat?.label ?? link.category}
                  </span>
                  <span className="font-mono text-[8.5px] text-white/30">{link.domain}</span>
                  {link.featured && (
                    <span className="rounded border border-amber-400/25 bg-amber-400/8 px-1.5 py-0.5 font-mono text-[7.5px] uppercase text-amber-400/80">Featured</span>
                  )}
                  <select
                    value={link.category}
                    onChange={(e) => dispatch({ type: 'UPDATE_CURATED_LINK', payload: { id: link.id, data: { category: e.target.value as LinkCategory } } })}
                    className="rounded border border-white/10 bg-white/[0.02] px-1.5 py-0.5 font-mono text-[7.5px] text-white/30 outline-none focus:border-white/20 cursor-pointer"
                  >
                    {LINK_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#0a0a14]">{c.icon} {c.label}</option>
                    ))}
                  </select>
                </div>

                {link.description && (
                  <div className="text-[9.5px] leading-relaxed text-white/35 line-clamp-2">{link.description}</div>
                )}

                {link.tags.length > 0 && <TagChips tags={link.tags} />}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded border border-white/10 px-1.5 py-0.5 font-mono text-[9px] text-white/30 hover:border-white/20 hover:text-white/60 transition-colors"
                >
                  ↗
                </a>
                <button
                  onClick={() => dispatch({ type: 'UPDATE_CURATED_LINK', payload: { id: link.id, data: { published: !link.published } } })}
                  className={`rounded border px-1.5 py-0.5 font-mono text-[8px] uppercase transition-colors ${link.published ? 'border-emerald-400/20 text-emerald-400/70 bg-emerald-400/5' : 'border-white/10 text-white/25 hover:border-white/20'}`}
                >
                  {link.published ? 'pub' : 'draft'}
                </button>
                <button
                  onClick={() => dispatch({ type: 'REMOVE_CURATED_LINK', payload: link.id })}
                  className="rounded border border-red-400/10 px-1.5 py-0.5 font-mono text-[9px] text-red-400/25 hover:border-red-400/30 hover:text-red-400/70 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="rounded-xl border border-white/5 bg-white/[0.01] py-8 text-center">
            <div className="text-[11px] text-white/20 max-w-xs mx-auto leading-relaxed">
              {search ? `No results for "${search}"` : 'No curated collections. Add or import bookmarks.'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
