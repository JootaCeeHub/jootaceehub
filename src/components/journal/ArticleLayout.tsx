'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Clock, BookOpen, Layers } from 'lucide-react'
import { useLocale } from '@/lib/i18n/context'
import type { Article, ArticleMeta } from '@/lib/journal/types'
import { CATEGORY_DISPLAY, DEPTH_DISPLAY } from '@/lib/journal/types'
import { ArticleCard } from './ArticleCard'

interface ArticleLayoutProps {
  article: Article
  backHref?: 'research' | 'journal'
  related?: ArticleMeta[]
}

const DEPTH_COLORS = {
  'deep-read': { text: 'text-emerald-400', border: 'border-emerald-400/20', bg: 'bg-emerald-400/8' },
  brief: { text: 'text-sky-400', border: 'border-sky-400/20', bg: 'bg-sky-400/8' },
  signal: { text: 'text-amber-400', border: 'border-amber-400/20', bg: 'bg-amber-400/8' },
}

function formatDate(iso: string, locale: string): string {
  const localeCode = locale === 'es' ? 'es-ES' : 'en-US'
  return new Date(iso).toLocaleDateString(localeCode, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function ArticleLayout({ article, backHref = 'research', related = [] }: ArticleLayoutProps) {
  const locale = useLocale()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const categoryLabel = CATEGORY_DISPLAY[article.category] ?? article.category
  const depthColors = article.depth ? DEPTH_COLORS[article.depth] : DEPTH_COLORS['brief']
  const depthLabel = article.depth ? DEPTH_DISPLAY[article.depth] : null

  return (
    <>
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 z-[60] h-0.5 w-full bg-white/5" aria-hidden data-pagefind-ignore="all">
        <div className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 transition-none" style={{ width: `${progress}%` }} />
      </div>

      <article className="mx-auto max-w-2xl">
        {/* Back nav */}
        <Link prefetch={false} href={`/${locale}/${backHref}`} className="mb-10 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-white/30 transition-colors hover:text-white/70">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Research</span>
        </Link>

        {/* Article header */}
        <header className="mb-10">
          {/* Top metadata strip */}
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/8 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {categoryLabel}
            </span>

            {depthLabel && (
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] ${depthColors.text} ${depthColors.border} ${depthColors.bg}`}>
                <BookOpen className="h-3 w-3" />
                {depthLabel}
              </span>
            )}

            {article.series && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/4 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">
                <Layers className="h-3 w-3" />
                {article.series}
              </span>
            )}
          </div>

          <h1 className="mb-5 text-3xl font-semibold leading-tight tracking-tight text-white/90 lg:text-4xl">{article.title}</h1>

          <p className="mb-8 text-lg leading-[1.75] text-white/45 font-light">{article.excerpt}</p>

          {/* Abstract block */}
          {article.abstract && (
            <div className="mb-8 rounded-xl border border-emerald-400/10 bg-emerald-400/4 px-6 py-5">
              <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.22em] text-emerald-400/60">Abstract</div>
              <p className="text-[13px] leading-[1.8] text-white/55 italic">{article.abstract}</p>
            </div>
          )}

          {/* Bottom metadata strip */}
          <div className="flex items-center gap-6 mb-8">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/30">{formatDate(article.date, locale)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-white/30" />
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/30">{article.readTime} min read</span>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </header>

        {/* Article body */}
        <div
          className="mt-10 text-[15px] leading-[1.85] text-white/65 [&_h2]:mt-12 [&_h2]:mb-5 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-white/85 [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-white/75 [&_p]:mb-6 [&_a]:text-emerald-400 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-emerald-300 [&_ul]:mb-6 [&_ul]:ml-0 [&_ul]:list-none [&_ul]:space-y-2 [&_ul_li]:relative [&_ul_li]:pl-5 [&_ul_li]:before:absolute [&_ul_li]:before:left-0 [&_ul_li]:before:top-[0.6em] [&_ul_li]:before:h-1 [&_ul_li]:before:w-1 [&_ul_li]:before:rounded-full [&_ul_li]:before:bg-emerald-400/50 [&_ol]:mb-6 [&_ol]:ml-0 [&_ol]:list-none [&_ol]:space-y-2 [&_ol]:counter-reset-[item] [&_strong]:text-white/85 [&_strong]:font-semibold [&_em]:text-white/60 [&_em]:italic [&_blockquote]:my-8 [&_blockquote]:border-l-2 [&_blockquote]:border-emerald-400/40 [&_blockquote]:pl-6 [&_blockquote]:text-white/45 [&_blockquote]:italic [&_code]:rounded [&_code]:border [&_code]:border-white/8 [&_code]:bg-white/5 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[13px] [&_code]:text-sky-300/80 [&_pre]:my-8 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-white/8 [&_pre]:bg-white/3 [&_pre]:p-6 [&_pre_code]:border-0 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_hr]:my-10 [&_hr]:border-0 [&_hr]:h-px [&_hr]:bg-gradient-to-r [&_hr]:from-transparent [&_hr]:via-white/10 [&_hr]:to-transparent"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Footer */}
        <footer className="mt-16 pt-10 border-t border-white/8 space-y-8">
          {article.tags.length > 0 && (
            <div className="space-y-3">
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/25">Topics</span>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span key={tag} className="rounded-md border border-white/8 bg-white/3 px-3 py-1 font-mono text-[10px] text-white/35 transition-colors hover:border-white/20 hover:text-white/60">{tag}</span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4">
            <Link prefetch={false} href={`/${locale}/${backHref}`} className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-white/25 transition-colors hover:text-white/60">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Research
            </Link>
          </div>
        </footer>
      </article>

      {/* Related articles — excluded from Pagefind index (navigation, not content) */}
      {related.length > 0 && (
        <section className="mx-auto max-w-4xl mt-20 border-t border-white/8 pt-16" data-pagefind-ignore="all">
          <div className="mb-10 flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/8" />
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/25 shrink-0">Continue Reading</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/8" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}
