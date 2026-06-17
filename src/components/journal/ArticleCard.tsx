'use client'

import Link from 'next/link'
import { Clock, BookOpen } from 'lucide-react'
import { useLocale } from '@/lib/i18n/context'
import type { ArticleMeta } from '@/lib/journal/types'
import { CATEGORY_DISPLAY, DEPTH_DISPLAY } from '@/lib/journal/types'

interface ArticleCardProps {
  article: ArticleMeta
  featured?: boolean
  index?: number
}

const DEPTH_COLORS: Record<string, { text: string; border: string; bg: string }> = {
  'deep-read': { text: 'text-emerald-400', border: 'border-emerald-400/20', bg: 'bg-emerald-400/8' },
  brief: { text: 'text-sky-400', border: 'border-sky-400/20', bg: 'bg-sky-400/8' },
  signal: { text: 'text-amber-400', border: 'border-amber-400/20', bg: 'bg-amber-400/8' },
}

function formatDate(iso: string, locale: string): string {
  const localeCode = locale === 'es' ? 'es-ES' : 'en-US'
  return new Date(iso).toLocaleDateString(localeCode, { year: 'numeric', month: 'short', day: 'numeric' })
}

export function ArticleCard({ article, featured, index }: ArticleCardProps) {
  const locale = useLocale()
  const href = `/${locale}/research/${article.slug}`

  const categoryLabel = CATEGORY_DISPLAY[article.category] ?? article.category
  const depthLabel = article.depth ? DEPTH_DISPLAY[article.depth] : null
  const depthColors = article.depth ? DEPTH_COLORS[article.depth] : null

  return (
    <Link
      href={href}
      className={`group relative flex flex-col gap-4 rounded-xl border border-white/8 bg-white/2 p-5 transition-all duration-300 hover:border-emerald-400/20 hover:bg-white/4 cursor-pointer${featured ? ' col-span-full border-emerald-400/15 bg-emerald-400/3' : ''}`}
    >
      {typeof index === 'number' && (
        <span className="absolute right-5 top-5 font-mono text-[11px] font-semibold text-white/15">{String(index + 1).padStart(2, '0')}</span>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/6 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-emerald-400">{categoryLabel}</span>
        {depthLabel && depthColors && (
          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] ${depthColors.text} ${depthColors.border} ${depthColors.bg}`}>
            <BookOpen className="h-2.5 w-2.5" />
            {depthLabel}
          </span>
        )}
      </div>

      <h3 className="text-[14px] font-semibold leading-snug text-white/75 transition-colors group-hover:text-white/95">{article.title}</h3>
      <p className="text-[12px] leading-relaxed text-white/35 line-clamp-3">{article.excerpt}</p>

      <div className="mt-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-2.5 w-2.5 text-white/20" />
          <span className="font-mono text-[10px] text-white/25">{article.readTime} min</span>
          <span className="h-0.5 w-0.5 rounded-full bg-white/15" />
          <span className="font-mono text-[10px] text-white/25">{formatDate(article.date, locale)}</span>
        </div>
        <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-400/60 opacity-0 transition-opacity group-hover:opacity-100">
          Read
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </span>
      </div>
    </Link>
  )
}
