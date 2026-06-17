'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ArrowRight, Cpu, Network, Code2, User, Mail, FlaskConical, Box, Building2, TrendingUp, Workflow } from 'lucide-react'
import { brand } from '@/lib/config/brand'
import { useTranslations } from '@/lib/i18n/context'
import { cn } from '@/lib/utils'

interface CommandItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  action: () => void
  shortcut?: string
  category: string
}

export function CommandPalette() {
  const t = useTranslations('command')
  const ta = useTranslations('accessibility')
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' })
    setOpen(false)
  }

  const items: CommandItem[] = [
    { id: 'systems', label: 'Systems Architecture', icon: Cpu, action: () => scrollTo('#systems'), shortcut: 'G S', category: t('categories.navigation') },
    { id: 'labs', label: 'Interactive Labs', icon: FlaskConical, action: () => scrollTo('#labs'), shortcut: 'G L', category: t('categories.navigation') },
    { id: 'infrastructure', label: 'Infrastructure', icon: Network, action: () => scrollTo('#infrastructure'), shortcut: 'G I', category: t('categories.navigation') },
    { id: 'github', label: 'GitHub Intelligence', icon: Code2, action: () => scrollTo('#github'), shortcut: 'G G', category: t('categories.navigation') },
    { id: 'about', label: 'About', icon: User, action: () => scrollTo('#about'), shortcut: 'G A', category: t('categories.navigation') },
    { id: 'contact', label: 'Contact', icon: Mail, action: () => scrollTo('#contact'), shortcut: 'G C', category: t('categories.navigation') },
    { id: 'trading', label: 'Trading AI Lab', icon: TrendingUp, action: () => { scrollTo('#labs'); setTimeout(() => document.querySelector('[data-lab="trading-ai"]')?.dispatchEvent(new Event('click')), 300); }, category: t('categories.labs') },
    { id: 'stl', label: 'STL AI Lab', icon: Box, action: () => { scrollTo('#labs'); setTimeout(() => document.querySelector('[data-lab="stl-ai"]')?.dispatchEvent(new Event('click')), 300); }, category: t('categories.labs') },
    { id: 'erp', label: 'ERP Lab', icon: Building2, action: () => { scrollTo('#labs'); setTimeout(() => document.querySelector('[data-lab="erp"]')?.dispatchEvent(new Event('click')), 300); }, category: t('categories.labs') },
    { id: 'crm', label: 'CRM Lab', icon: Workflow, action: () => { scrollTo('#labs'); setTimeout(() => document.querySelector('[data-lab="crm"]')?.dispatchEvent(new Event('click')), 300); }, category: t('categories.labs') },
    { id: 'hero', label: 'Back to Top', icon: ArrowRight, action: () => scrollTo('#hero'), category: t('categories.navigation') },
  ]

  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  )

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, CommandItem[]>)

  const flatItems = Object.values(groupedItems).flat()

  useEffect(() => {
    setSelectedIndex(0)
  }, [search])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
    }
  }, [open])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % flatItems.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + flatItems.length) % flatItems.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      flatItems[selectedIndex]?.action()
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-16 z-40 hidden items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-2 backdrop-blur-xl transition hover:border-primary/40 md:flex"
        aria-label={ta('openCommandPalette')}
      >
        <Search className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{t('navigate')}</span>
        <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] flex items-start justify-center bg-background/60 backdrop-blur-sm pt-[20vh]"
            onClick={() => setOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label={ta('openCommandPalette')}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="glass-strong w-full max-w-xl overflow-hidden rounded-2xl border border-border shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={handleKeyDown}
            >
              <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('placeholder')}
                  className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  aria-label={t('placeholder')}
                />
                <kbd className="rounded border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                  ESC
                </kbd>
              </div>

              <div className="max-h-[50vh] overflow-y-auto p-2">
                {Object.entries(groupedItems).map(([category, categoryItems]) => (
                  <div key={category} className="mb-2">
                    <p className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      {category}
                    </p>
                    {categoryItems.map((item) => {
                      const globalIdx = flatItems.indexOf(item)
                      const isSelected = globalIdx === selectedIndex
                      const Icon = item.icon
                      return (
                        <button
                          key={item.id}
                          onClick={item.action}
                          onMouseEnter={() => setSelectedIndex(globalIdx)}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition',
                            isSelected ? 'bg-primary/15 text-foreground' : 'text-muted-foreground hover:text-foreground'
                          )}
                        >
                          <Icon className="h-4 w-4" aria-hidden="true" />
                          <span className="flex-1 text-sm">{item.label}</span>
                          {item.shortcut ? (
                            <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px]">
                              {item.shortcut}
                            </kbd>
                          ) : null}
                        </button>
                      )
                    })}
                  </div>
                ))}

                {flatItems.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    {t('noResults').replace('{search}', search)}
                  </div>
                ) : null}
              </div>

              <div className="flex items-center justify-between border-t border-border px-4 py-2">
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-border px-1 py-0.5 font-mono">↑↓</kbd>
                    {t('navigate')}
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-border px-1 py-0.5 font-mono">↵</kbd>
                    {t('select')}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {brand.signature}
                </span>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
