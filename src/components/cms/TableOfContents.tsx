'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import type { TocItem } from '@/lib/cms/toc'
import { useTableOfContents } from '@/hooks/useTableOfContents'

export interface TableOfContentsProps {
  items: TocItem[]
  className?: string
  showTitle?: boolean
  floating?: boolean
}

export function TableOfContents({
  items,
  className = '',
  showTitle = true,
  floating = false,
}: TableOfContentsProps) {
  const { activeId, scrollTo } = useTableOfContents(items)

  if (items.length === 0) {
    return showTitle ? (
      <div className={`w-full ${className}`}>
        {showTitle && <p className="mb-2.5 text-[10px] font-medium uppercase tracking-wider text-white/30">Contents</p>}
        <p className="text-[10px] text-white/20 italic">No headings found</p>
      </div>
    ) : null
  }

  const content = (
    <div className={`w-full ${className}`}>
      {showTitle && <p className="mb-2.5 text-[10px] font-medium uppercase tracking-wider text-white/30">Contents</p>}
      <nav aria-label="Table of contents">
        <ol className="space-y-0.5">
          {items.map((item) => {
            const active = activeId === item.id
            const indent = item.level === 2 ? '' : item.level === 3 ? 'pl-3' : 'pl-6'
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={cn(
                    'group flex items-start gap-1.5 rounded-md px-2 py-1 text-xs transition-colors cursor-pointer leading-snug',
                    indent,
                    active
                      ? 'text-rose-400 bg-rose-500/8'
                      : 'text-white/35 hover:text-white/70 hover:bg-white/4'
                  )}
                  onClick={() => scrollTo(item.id)}
                  aria-current={active ? 'location' : undefined}
                >
                  <span
                    className={cn(
                      'mt-1.5 h-1 w-1 flex-none rounded-full transition-colors',
                      active ? 'bg-rose-400' : 'bg-white/15 group-hover:bg-white/40'
                    )}
                    aria-hidden="true"
                  />
                  <span className="line-clamp-2">{item.text}</span>
                </button>
              </li>
            )
          })}
        </ol>
      </nav>
    </div>
  )

  if (floating) {
    return (
      <aside className="sticky top-24 w-56 flex-none">
        <div className="rounded-xl border border-white/6 bg-white/2 p-4 backdrop-blur-sm">{content}</div>
      </aside>
    )
  }

  return content
}
