'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useEffect, useRef, useCallback, useState, useId } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useSearch } from '@/hooks/useSearch'
import { useFocusTrap } from '@/hooks/useFocusTrap'

export interface SearchModalProps {
  open: boolean
  onClose: () => void
  locale?: string
}

export function SearchModal({ open, onClose, locale: _locale = 'en' }: SearchModalProps) {
  const { query, results, loading, ready, search, clear } = useSearch()
  const inputRef = useRef<HTMLInputElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const router = useRouter()
  const titleId = useId()
  const trapRef = useFocusTrap<HTMLDivElement>(open)

  // Auto-focus input when opening
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setActiveIndex(0)
    } else {
      clear()
    }
  }, [open, clear])

  // Reset active index when results change
  useEffect(() => setActiveIndex(0), [results])

  const handleSelect = useCallback((url: string) => {
    onClose()
    // Pagefind URLs are relative to the site root (e.g. /en/journal/slug/)
    router.push(url)
  }, [onClose, router])

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { onClose(); return }
    if (results.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const result = results[activeIndex]
      if (result) handleSelect(result.url)
    }
  }, [results, activeIndex, onClose, handleSelect])

  // Scroll active item into view
  useEffect(() => {
    const container = document.getElementById('search-results')
    const item = document.getElementById(`search-result-${activeIndex}`)
    if (!container || !item) return
    const { top, bottom } = item.getBoundingClientRect()
    const { top: cTop, bottom: cBottom } = container.getBoundingClientRect()
    if (bottom > cBottom) container.scrollTop += bottom - cBottom + 8
    else if (top < cTop) container.scrollTop -= cTop - top + 8
  }, [activeIndex])

  if (!open) return null

  const isDevMode = !ready && query.length > 0 && !loading

  const content = (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[12vh] px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onKeyDown={handleKeyDown}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#0c1220]/95 shadow-2xl backdrop-blur-xl" ref={trapRef}>
        <span id={titleId} className="sr-only">Search</span>

        <div className="flex items-center gap-3 border-b border-white/8 px-4 py-3.5">
          <span className="flex-none text-white/30 text-base" aria-hidden="true">🔍</span>
          <input
            ref={inputRef}
            type="search"
            autoComplete="off"
            spellCheck="false"
            value={query}
            onChange={(e) => search(e.target.value)}
            placeholder="Search posts, projects, sections…"
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
            aria-label="Search"
            aria-autocomplete="list"
            aria-controls="search-results"
            aria-activedescendant={results[activeIndex] ? `search-result-${activeIndex}` : undefined}
          />
          {query && (
            <button type="button" onClick={clear} className="flex-none rounded-lg p-1 text-xs text-white/30 hover:text-white/70 hover:bg-white/6 transition-colors" aria-label="Clear">✕</button>
          )}
          <kbd className="flex-none rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-white/30">Esc</kbd>
        </div>

        {query && (
          <div className="flex items-center justify-between border-b border-white/5 px-4 py-1.5">
            <span className="text-[10px] text-white/30">
              {loading ? 'Searching…' : `${results.length} result${results.length !== 1 ? 's' : ''}`}
            </span>
            <span className="text-[10px] text-white/20">Powered by Pagefind</span>
          </div>
        )}

        <div id="search-results" className="max-h-[min(65vh,520px)] overflow-y-auto overscroll-contain" role="listbox" aria-label="Search results">
          {loading && <div className="mx-auto my-6 h-5 w-5 animate-spin rounded-full border-2 border-white/10 border-t-rose-400" role="status" aria-label="Loading" />}

          {!loading && results.length > 0 && results.map((result, i) => {
            const active = i === activeIndex
            return (
              <div
                key={result.id}
                id={`search-result-${i}`}
                className={active
                  ? 'bg-rose-500/8 border-b border-white/4 group flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors last:border-0'
                  : 'group flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-white/4 hover:bg-rose-500/5 transition-colors last:border-0'}
                onClick={() => handleSelect(result.url)}
                role="option"
                aria-selected={active}
                tabIndex={-1}
              >
                <span className="mt-0.5 flex-none text-sm text-white/20 group-hover:text-rose-400 transition-colors" aria-hidden="true">
                  {result.meta?.category ? '📄' : '🔗'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/80 group-hover:text-white transition-colors truncate">{result.title}</p>
                  {result.excerpt && (
                    <p
                      className="mt-0.5 text-xs text-white/35 line-clamp-2 [&_mark]:bg-rose-500/25 [&_mark]:text-rose-300 [&_mark]:rounded-sm [&_mark]:px-0.5"
                      dangerouslySetInnerHTML={{ __html: result.excerpt }}
                    />
                  )}
                  <p className="mt-1 text-[10px] font-mono text-white/20 truncate">{result.url}</p>
                  {result.meta?.category && (
                    <div className="mt-0.5 flex items-center gap-1">
                      <span className="rounded-full border border-white/8 px-1.5 py-0.5 text-[9px] text-white/25">{result.meta.category}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {!loading && query && results.length === 0 && !isDevMode && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="text-3xl opacity-20">🔎</div>
              <p className="text-sm font-medium text-white/40">No results for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-white/20">Try different keywords</p>
            </div>
          )}

          {isDevMode && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="text-3xl opacity-20">🏗</div>
              <p className="text-sm font-medium text-white/40">Search index not built</p>
              <p className="text-xs text-white/20">Run `npm run build` to generate the search index</p>
            </div>
          )}

          {!query && !loading && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="text-3xl opacity-20">⌨️</div>
              <p className="text-sm font-medium text-white/40">Type to search</p>
              <p className="text-xs text-white/20">Articles, projects, sections, and more</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-white/6 bg-white/1 px-4 py-2.5" aria-hidden="true">
          <span className="flex items-center gap-1.5 text-[10px] text-white/25">
            <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[9px] text-white/35">↑↓</kbd> Navigate
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-white/25">
            <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[9px] text-white/35">↵</kbd> Open
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-white/25">
            <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[9px] text-white/35">Esc</kbd> Close
          </span>
        </div>
      </div>
    </div>
  )

  if (typeof document === 'undefined') return null
  return createPortal(content, document.body)
}
