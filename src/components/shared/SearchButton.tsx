'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { SearchModal } from './SearchModal'

const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform)

export function SearchButton({ locale = 'en' }: { locale?: string }) {
  const [open, setOpen] = useState(false)

  const handleOpen = useCallback(() => setOpen(true), [])
  const handleClose = useCallback(() => setOpen(false), [])

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const modKey = IS_MAC ? '⌘' : 'Ctrl'

  return (
    <>
      {/* Desktop pill */}
      <button
        type="button"
        className="hidden md:flex items-center gap-2 rounded-xl border border-white/10 bg-white/4 px-3 py-1.5 text-xs text-white/40 hover:border-white/20 hover:text-white/70 transition-colors cursor-pointer select-none"
        onClick={handleOpen}
        aria-label="Search (Cmd+K)"
      >
        <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
          <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10.5 10.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span className="min-w-[80px]">Search…</span>
        <span className="flex items-center gap-0.5" aria-hidden="true">
          <kbd className="rounded border border-white/10 bg-white/5 px-1 py-0.5 font-mono text-[10px] text-white/30">{modKey}</kbd>
          <kbd className="rounded border border-white/10 bg-white/5 px-1 py-0.5 font-mono text-[10px] text-white/30">K</kbd>
        </span>
      </button>

      {/* Mobile icon-only */}
      <button
        type="button"
        className="flex md:hidden items-center justify-center h-8 w-8 rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-colors cursor-pointer"
        onClick={handleOpen}
        aria-label="Search"
      >
        <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
          <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10.5 10.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      <SearchModal open={open} onClose={handleClose} locale={locale} />
    </>
  )
}
