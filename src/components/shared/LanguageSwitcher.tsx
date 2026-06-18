'use client'

import { useLocaleRouter } from '@/lib/i18n/router'
import { Globe } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { trackEvent } from '@/components/shared/Analytics'

const labels: Record<string, string> = {
  en: 'EN',
  es: 'ES',
}

export function LanguageSwitcher() {
  const { switchLocale, currentLocale } = useLocaleRouter()
  const [open, setOpen] = useState(false)

  const handleSwitch = (next: string) => {
    if (next === currentLocale) return
    trackEvent('Locale Switch', { from: currentLocale, to: next })
    switchLocale(next)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background/80 text-muted-foreground backdrop-blur-xl transition hover:border-primary/40 hover:text-foreground"
        aria-label="Switch language"
      >
        <Globe className="h-3.5 w-3.5" />
      </button>

      <AnimatePresence>
        {open ? (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full z-50 mt-2 w-24 overflow-hidden rounded-xl border border-border bg-card shadow-xl"
            >
              {(['en', 'es'] as const).map((loc) => (
                <button
                  key={loc}
                  onClick={() => handleSwitch(loc)}
                  className={cn(
                    'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition',
                    currentLocale === loc
                      ? 'bg-primary/15 text-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <span className="font-mono text-xs">{labels[loc]}</span>
                  <span className="capitalize">{loc}</span>
                </button>
              ))}
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
