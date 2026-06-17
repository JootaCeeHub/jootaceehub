'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { LIBRARIES, LIBRARY_CATEGORIES } from './constants'

export function LibraryCatalog() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null)

  const filtered = activeCategory === 'All'
    ? LIBRARIES
    : LIBRARIES.filter((l) => l.category === activeCategory)

  function copyCmd(cmd: string) {
    navigator.clipboard.writeText(cmd).then(() => {
      setCopiedCmd(cmd)
      setTimeout(() => setCopiedCmd(null), 1800)
    }).catch(() => {})
  }

  return (
    <div>
      <p className="mb-4 text-xs text-muted-foreground leading-relaxed">
        All libraries referenced in this project&apos;s visual stack. Installed packages are ready to use; others have copy-paste install commands.
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        {LIBRARY_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors duration-150',
              activeCategory === cat
                ? 'border-primary/50 bg-primary/15 text-primary'
                : 'border-border/40 text-muted-foreground hover:text-foreground hover:border-border/60'
            )}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((lib) => (
          <div key={lib.name} className="relative flex flex-col gap-3 rounded-xl border border-border/40 bg-card/20 p-4 transition-all duration-200 hover:border-primary/20 hover:bg-card/30">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div>
                  <span className="text-sm font-semibold text-foreground">{lib.name}</span>
                  {lib.version && <span className="ml-2 font-mono text-[9px] text-muted-foreground/60">{lib.version}</span>}
                </div>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{lib.desc}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className={lib.installed
                    ? 'rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 font-mono text-[9px] text-emerald-300'
                    : 'rounded-full border border-border/40 px-2 py-0.5 font-mono text-[9px] text-muted-foreground'
                  }>
                    {lib.installed ? '✓ installed' : '+ available'}
                  </span>
                  <span className="rounded-full border border-violet-400/30 bg-violet-400/8 px-2 py-0.5 font-mono text-[9px] text-violet-300">{lib.category}</span>
                </div>
              </div>
            </div>
            <div className="mt-2 rounded-lg bg-card/60 border border-border/30 px-3 py-1.5 font-mono text-[10px] text-muted-foreground/80 flex items-center justify-between gap-2">
              <span className="truncate">{lib.installCmd}</span>
              <button
                type="button"
                onClick={() => copyCmd(lib.installCmd)}
                className="shrink-0 rounded px-1.5 py-0.5 text-[9px] border border-border/40 text-muted-foreground hover:text-foreground hover:border-border/60 transition-colors duration-150"
              >
                {copiedCmd === lib.installCmd ? '✓' : 'copy'}
              </button>
            </div>
            <div className="mt-2 space-y-1">
              {lib.useCases.map((uc) => (
                <div key={uc} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                  <span className="mt-1 h-1 w-1 rounded-full bg-primary/50 shrink-0" />
                  {uc}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href={lib.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-primary/70 hover:text-primary transition-colors duration-150 underline-offset-2 hover:underline"
              >
                Docs ↗
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
