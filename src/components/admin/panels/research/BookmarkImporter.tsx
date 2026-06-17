'use client'

import { useState, useRef } from 'react'
import type { CuratedLink, LinkCategory } from '@/lib/admin/types'
import { LINK_CATEGORIES, CAT_BADGE, extractDomain, autoCategorize, autoDescribe } from './utils'

interface RawImport {
  id: string
  url: string
  title: string
  category: LinkCategory
  description: string
  tags: string[]
  folder: string
  domain: string
  selected: boolean
  editOpen: boolean
}

function parseBookmarksHtmlRich(html: string): RawImport[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const results: RawImport[] = []

  function walk(dl: Element, path: string[]) {
    let i = 0
    for (const dt of Array.from(dl.children)) {
      if (dt.tagName !== 'DT') continue
      const h3 = dt.querySelector(':scope > h3')
      const a = dt.querySelector(':scope > a')
      const nested = dt.querySelector(':scope > dl')
      if (h3 && nested) {
        walk(nested, [...path, h3.textContent?.trim() ?? ''])
      } else if (a) {
        const href = (a as HTMLAnchorElement).href
        if (!href?.startsWith('http')) continue
        const folderPath = path.join(' > ')
        const domain    = extractDomain(href)
        const linkTitle = a.textContent?.trim() || domain
        const cat       = autoCategorize(href, folderPath, linkTitle)
        results.push({
          id: crypto.randomUUID(),
          url: href,
          title:       linkTitle,
          category:    cat,
          description: autoDescribe(href, cat, linkTitle),
          tags: path.length > 0 ? [path[path.length - 1].toLowerCase().replace(/\s+/g, '-').slice(0, 20)] : [],
          folder: folderPath,
          domain,
          selected: true,
          editOpen: false,
        })
        i++
        if (i > 1000) break
      }
    }
  }

  const topDl = doc.querySelector('dl')
  if (topDl) walk(topDl, [])
  return results.slice(0, 1000)
}

interface Props {
  onImport: (links: Omit<CuratedLink, 'id' | 'addedAt'>[]) => void
}

export function BookmarkImporter({ onImport }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState<RawImport[]>([])
  const [catFilter, setCatFilter] = useState<LinkCategory | 'all'>('all')
  const [search, setSearch] = useState('')
  const [tagInput, setTagInput] = useState<Record<string, string>>({})

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const html = ev.target?.result as string
      setItems(parseBookmarksHtmlRich(html))
      setCatFilter('all')
      setSearch('')
    }
    reader.readAsText(file)
    // reset input so same file can be re-picked
    e.target.value = ''
  }

  function commitImport() {
    const selected = items.filter((item) => item.selected)
    onImport(selected.map((item) => ({
      url: item.url,
      title: item.title,
      description: item.description,
      category: item.category,
      tags: item.tags,
      domain: item.domain,
      published: false,
      featured: false,
    })))
    setItems([])
    setCatFilter('all')
    setSearch('')
  }

  function updateItem(id: string, patch: Partial<RawImport>) {
    setItems((prev) => prev.map((x) => x.id === id ? { ...x, ...patch } : x))
  }

  function removeTag(id: string, tag: string) {
    setItems((prev) => prev.map((x) => x.id === id ? { ...x, tags: x.tags.filter((t) => t !== tag) } : x))
  }

  function addTag(id: string) {
    const val = (tagInput[id] ?? '').trim().toLowerCase().replace(/\s+/g, '-').slice(0, 20)
    if (!val) return
    setItems((prev) => prev.map((x) => x.id === id ? { ...x, tags: x.tags.includes(val) ? x.tags : [...x.tags, val] } : x))
    setTagInput((prev) => ({ ...prev, [id]: '' }))
  }

  const selectedCount = items.filter((x) => x.selected).length
  const folderCount = new Set(items.map((x) => x.folder).filter(Boolean)).size

  // Category breakdown counts
  const catCounts = LINK_CATEGORIES.map((cat) => ({
    ...cat,
    count: items.filter((x) => x.category === cat.id).length,
  })).filter((c) => c.count > 0)

  // Filtered view
  const visible = items.filter((item) => {
    const catOk = catFilter === 'all' || item.category === catFilter
    if (!catOk) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      item.title.toLowerCase().includes(q) ||
      item.url.toLowerCase().includes(q) ||
      item.folder.toLowerCase().includes(q)
    )
  })

  return (
    <div className="rounded-xl border border-blue-400/15 bg-blue-400/3 p-4 space-y-3">
      <div className="space-y-0.5">
        <div className="text-[12px] font-medium text-white/70">📥 Import Bookmarks</div>
        <div className="text-[10px] text-white/35">Export your Chrome/Firefox favourites as HTML and upload here</div>
      </div>

      <input ref={fileRef} type="file" accept=".html,.htm" onChange={handleFile} className="hidden" />
      <button onClick={() => fileRef.current?.click()} className="rounded-lg border border-blue-400/25 bg-blue-400/8 px-4 py-2 font-mono text-[9px] uppercase tracking-wider text-blue-400/80 hover:bg-blue-400/15 transition-colors">
        Select HTML file
      </button>

      {items.length > 0 && (
        <div className="space-y-3">
          {/* Header stats + bulk actions */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] text-white/40">
              {items.length} links from {folderCount} folders · {selectedCount} selected
            </span>
            <button
              onClick={() => setItems((prev) => prev.map((x) => ({ ...x, selected: true })))}
              className="rounded border border-white/10 bg-white/3 px-2 py-0.5 font-mono text-[8.5px] uppercase tracking-wide text-white/40 hover:text-white/65 hover:border-white/20 transition-colors cursor-pointer"
            >
              Select All
            </button>
            <button
              onClick={() => setItems((prev) => prev.map((x) => ({ ...x, selected: false })))}
              className="rounded border border-white/10 bg-white/3 px-2 py-0.5 font-mono text-[8.5px] uppercase tracking-wide text-white/40 hover:text-white/65 hover:border-white/20 transition-colors cursor-pointer"
            >
              Deselect All
            </button>
          </div>

          {/* Category breakdown chips */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setCatFilter('all')}
              className={catFilter === 'all' ? 'inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/8 px-2 py-0.5 font-mono text-[8.5px] text-white/70 transition-colors' : 'inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/3 px-2 py-0.5 font-mono text-[8.5px] text-white/35 hover:text-white/60 transition-colors'}
            >
              All <span>{items.length}</span>
            </button>
            {catCounts.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCatFilter(catFilter === cat.id ? 'all' : cat.id)}
                className={catFilter === cat.id ? 'inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/8 px-2 py-0.5 font-mono text-[8.5px] text-white/70 transition-colors' : 'inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/3 px-2 py-0.5 font-mono text-[8.5px] text-white/35 hover:text-white/60 transition-colors'}
              >
                {cat.icon} {cat.label} <span>{cat.count}</span>
              </button>
            ))}
          </div>

          {/* Search */}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by title, URL, or folder…"
            className="w-full rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-1.5 font-mono text-[10px] text-white/70 placeholder:text-white/20 outline-none focus:border-emerald-400/30 transition-colors"
          />

          {/* Review list */}
          <div className="max-h-[380px] overflow-y-auto space-y-0.5 pr-1">
            {visible.map((item) => {
              const catInfo = LINK_CATEGORIES.find((c) => c.id === item.category)
              const folderShort = item.folder.length > 30 ? '…' + item.folder.slice(-27) : item.folder
              const badge = CAT_BADGE[item.category]
              return (
                <div key={item.id} className="group rounded-lg border border-white/6 bg-white/[0.015] px-2.5 py-1.5">
                  {/* Compact row */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={(e) => updateItem(item.id, { selected: e.target.checked })}
                      className="accent-emerald-400 shrink-0 w-3.5 h-3.5"
                    />
                    <span className="shrink-0 text-sm w-5 text-center">{catInfo?.icon ?? '📌'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10.5px] font-medium text-white/80 truncate">{item.title}</div>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="font-mono text-[7.5px] text-cyan-400/50 hover:text-cyan-400/80 truncate block max-w-full transition-colors"
                        title={item.url}
                      >
                        {item.url.length > 70 ? item.url.slice(0, 67) + '…' : item.url}
                      </a>
                    </div>
                    {item.description && (
                      <span className="shrink-0 font-mono text-[7.5px] text-white/22 max-w-[120px] truncate hidden lg:block" title={item.description}>
                        {item.description}
                      </span>
                    )}
                    {folderShort && (
                      <span className="shrink-0 font-mono text-[7.5px] text-white/20 max-w-[80px] truncate hidden xl:block" title={item.folder}>{folderShort}</span>
                    )}
                    <span className={`shrink-0 rounded border ${badge.border} ${badge.bg} ${badge.text} px-1 py-0.5 font-mono text-[7px] uppercase tracking-wider`}>
                      {catInfo?.label ?? item.category}
                    </span>
                    <select
                      value={item.category}
                      onChange={(e) => updateItem(item.id, { category: e.target.value as LinkCategory })}
                      className="shrink-0 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[8px] text-white/50 outline-none focus:border-emerald-400/30 cursor-pointer"
                    >
                      {LINK_CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id} className="bg-[#0a0a14]">{c.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => updateItem(item.id, { editOpen: !item.editOpen })}
                      className="shrink-0 opacity-0 group-hover:opacity-100 font-mono text-[9px] text-white/30 hover:text-white/60 transition-all cursor-pointer px-1"
                    >
                      ✎
                    </button>
                  </div>

                  {/* Expanded edit form */}
                  {item.editOpen && (
                    <div className="mt-2 border-t border-white/6 pt-2 space-y-1.5">
                      <div className="space-y-0.5">
                        <div className="font-mono text-[8px] uppercase tracking-wider text-white/25">Title</div>
                        <input
                          value={item.title}
                          onChange={(e) => updateItem(item.id, { title: e.target.value })}
                          className="w-full rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-1 font-mono text-[9.5px] text-white/70 placeholder:text-white/20 outline-none focus:border-emerald-400/30 transition-colors"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <div className="font-mono text-[8px] uppercase tracking-wider text-white/25">Description</div>
                        <textarea
                          value={item.description}
                          onChange={(e) => updateItem(item.id, { description: e.target.value })}
                          rows={2}
                          placeholder="Brief description of this resource…"
                          className="w-full rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-1 font-mono text-[9.5px] text-white/70 placeholder:text-white/20 outline-none focus:border-emerald-400/30 transition-colors resize-none"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <div className="font-mono text-[8px] uppercase tracking-wider text-white/25">Tags</div>
                        <div className="flex flex-wrap gap-1 mb-1">
                          {item.tags.map((tag) => (
                            <span
                              key={tag}
                              onClick={() => removeTag(item.id, tag)}
                              className="rounded-full border border-white/10 bg-white/3 px-1.5 py-0 font-mono text-[7.5px] text-white/40 hover:border-rose-400/20 hover:text-rose-300/60 cursor-pointer transition-colors"
                            >
                              #{tag} ×
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-1">
                          <input
                            value={tagInput[item.id] ?? ''}
                            onChange={(e) => setTagInput((prev) => ({ ...prev, [item.id]: e.target.value }))}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(item.id) } }}
                            placeholder="add tag…"
                            className="rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-1.5 font-mono text-[10px] text-white/70 placeholder:text-white/20 outline-none focus:border-white/25 transition-colors flex-1"
                          />
                          <button
                            onClick={() => addTag(item.id)}
                            className="rounded border border-white/10 bg-white/3 px-2 py-0.5 font-mono text-[8.5px] uppercase tracking-wide text-white/40 hover:text-white/65 hover:border-white/20 transition-colors cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <div className="font-mono text-[8px] uppercase tracking-wider text-white/25">Category</div>
                        <select
                          value={item.category}
                          onChange={(e) => updateItem(item.id, { category: e.target.value as LinkCategory })}
                          className="rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-1.5 font-mono text-[10px] text-white/60 outline-none focus:border-white/25 transition-colors w-full"
                        >
                          {LINK_CATEGORIES.map((c) => (
                            <option key={c.id} value={c.id} className="bg-[#0a0a14]">{c.icon} {c.label}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={() => updateItem(item.id, { editOpen: false })}
                        className="font-mono text-[8px] text-white/25 hover:text-white/50 cursor-pointer transition-colors"
                      >
                        Close ↑
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
            {visible.length === 0 && (
              <div className="rounded-xl border border-white/5 bg-white/[0.01] py-8 text-center"><div className="text-[11px] text-white/20 max-w-xs mx-auto leading-relaxed">No items match the current filter.</div></div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-2 pt-1">
            <button onClick={commitImport} disabled={selectedCount === 0} className="w-full rounded-lg border border-emerald-400/30 bg-emerald-400/10 py-2 font-mono text-[9px] uppercase tracking-wider text-emerald-400 hover:bg-emerald-400/15 transition-colors disabled:opacity-30">
              Import {selectedCount} selected
            </button>
            <button onClick={() => { setItems([]); setCatFilter('all'); setSearch('') }} className="rounded-lg border border-white/10 px-3 py-1.5 font-mono text-[9px] uppercase text-white/30 hover:text-white/50 hover:border-white/20 transition-colors cursor-pointer">
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
