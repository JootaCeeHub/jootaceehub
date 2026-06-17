'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, BookOpen, Layers } from 'lucide-react'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { useLocale, useTranslations } from '@/lib/i18n/context'
import type { ArticleCategory, ArticleMeta } from '@/lib/journal/types'
import { CATEGORY_DISPLAY, DEPTH_DISPLAY } from '@/lib/journal/types'
import { fadeUp, staggerContainer } from '@/lib/motion/variants'

type FilterCategory = ArticleCategory | 'all'

const CATEGORY_FILTERS: FilterCategory[] = ['all', 'research', 'opinion', 'essays', 'news']

const CATEGORY_ACCENT: Record<string, string> = {
  research: 'text-sky-400 border-sky-400/20 bg-sky-400/6',
  opinion: 'text-emerald-400 border-emerald-400/20 bg-emerald-400/6',
  essays: 'text-violet-400 border-violet-400/20 bg-violet-400/6',
  news: 'text-amber-400 border-amber-400/20 bg-amber-400/6',
}

const DEPTH_ACCENT: Record<string, string> = {
  'deep-read': 'text-emerald-400',
  brief: 'text-sky-400',
  signal: 'text-amber-400',
}

interface ResearchPageClientProps {
  allMeta: ArticleMeta[]
  featured: ArticleMeta | null
}

export default function ResearchPageClient({ allMeta, featured }: ResearchPageClientProps) {
  const locale = useLocale()
  const t = useTranslations('research')
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all')

  const lp = (path: string) => `/${locale}${path}`

  const displayArticles: ArticleMeta[] =
    activeFilter === 'all'
      ? allMeta.filter((a) => !a.featured)
      : allMeta.filter((a) => a.category === activeFilter)

  const totalCount = allMeta.length
  const currentYear = 2026

  return (
    <div className="relative min-h-screen bg-[#08080f] text-white">
      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-40 left-1/3 h-[600px] w-[600px] rounded-full bg-sky-500/4 blur-[160px]" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-violet-500/4 blur-[140px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <Navigation />

      <main className="mx-auto max-w-5xl px-4 py-24">
        <motion.div variants={staggerContainer()} initial="hidden" animate="visible">

          {/* Publication masthead */}
          <motion.header variants={fadeUp} className="mb-16 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-sky-400/70">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
                <span>{t('activeBadge') as string}</span>
              </div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-white/25">
                {t('vol') as string} {currentYear} — {totalCount} {t('entries') as string}
              </div>
            </div>

            <h1 className="text-5xl font-bold tracking-tight text-white/90">
              {t('titlePrimary') as string}{' '}
              <span className="text-sky-400">{t('titleAccent') as string}</span>
            </h1>
            <p className="max-w-2xl text-base text-white/40 leading-relaxed">{t('mastheadDesc') as string}</p>

            <div className="flex flex-wrap gap-6 border-t border-white/[0.06] pt-4">
              {(['research', 'opinion', 'essays', 'news'] as ArticleCategory[]).map((cat) => {
                const count = allMeta.filter((a) => a.category === cat).length
                return (
                  <div key={cat} className="flex items-center gap-2">
                    <span className={`rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${CATEGORY_ACCENT[cat] ?? ''}`}>
                      {CATEGORY_DISPLAY[cat]}
                    </span>
                    <span className="font-mono text-xs text-white/30">{count}</span>
                  </div>
                )
              })}
            </div>
          </motion.header>

          {/* Lead publication (featured) */}
          {featured && activeFilter === 'all' && (
            <ScrollReveal>
              <section className="mb-12">
                <div className="mb-4 flex items-center gap-3">
                  <span className="h-px flex-1 bg-white/[0.06]" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">
                    {t('leadSection') as string}
                  </span>
                </div>

                <Link prefetch={false} href={lp(`/research/${featured.slug}`)}>
                  <div className="group grid grid-cols-1 gap-6 overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all hover:border-white/[0.1] hover:bg-white/[0.04] md:grid-cols-5">
                    <div className="space-y-4 md:col-span-3">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${CATEGORY_ACCENT[featured.category] ?? ''}`}>
                          {CATEGORY_DISPLAY[featured.category]}
                        </span>
                        {featured.depth && (
                          <span className={`flex items-center gap-1 font-mono text-[10px] ${DEPTH_ACCENT[featured.depth] ?? ''}`}>
                            <BookOpen className="h-3 w-3" />
                            {DEPTH_DISPLAY[featured.depth]}
                          </span>
                        )}
                      </div>

                      <h2 className="text-2xl font-semibold tracking-tight text-white/90 leading-snug">{featured.title}</h2>

                      {featured.abstract ? (
                        <p className="text-sm text-white/40 leading-relaxed line-clamp-3">{featured.abstract}</p>
                      ) : (
                        <p className="text-sm text-white/40 leading-relaxed line-clamp-3">{featured.excerpt}</p>
                      )}

                      <div className="flex items-center gap-2 font-mono text-[10px] text-white/25">
                        <span>{featured.date.slice(0, 10)}</span>
                        <span className="h-0.5 w-0.5 rounded-full bg-white/20" />
                        <span>{featured.readTime} min read</span>
                      </div>

                      <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-sky-400">
                        {t('readPublication') as string}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>

                    <div className="relative hidden overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] md:col-span-2 md:flex" aria-hidden>
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:24px_24px]" />
                      <div className="relative p-4 font-mono text-[10px] leading-6 text-white/30 space-y-0">
                        <div className="text-white/15">{'// Analysis thread'}</div>
                        <div className="text-sky-400/50">{'const insight = await'}</div>
                        <div>{'  research.traverse({'}</div>
                        <div>{'    depth: "structural",'}</div>
                        <div>{'    mode: "synthesis"'}</div>
                        <div>{'  })'}</div>
                        <div className="mt-3 inline-block rounded border border-sky-400/20 bg-sky-400/8 px-2 py-0.5 text-sky-400">
                          {featured.tags[0] ?? 'AI Systems'}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </section>
            </ScrollReveal>
          )}

          {/* Filter bar */}
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-wider text-white/30">
              {t('filterLabel') as string}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_FILTERS.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveFilter(cat)}
                  className={activeFilter === cat
                    ? 'rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-sky-400 transition-all'
                    : 'rounded-full border border-white/10 bg-white/[0.02] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-white/30 transition-all hover:border-white/20 hover:text-white/50'
                  }
                >
                  {cat === 'all' ? (t('allLabel') as string) : CATEGORY_DISPLAY[cat as ArticleCategory]}
                </button>
              ))}
            </div>
          </div>

          {/* Publication index */}
          <section className="space-y-0">
            {displayArticles.length === 0 ? (
              <ScrollReveal>
                <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-white/[0.06] py-16">
                  <BookOpen className="h-8 w-8 text-white/10" />
                  <p className="font-mono text-sm text-white/25">{t('emptyState') as string}</p>
                </div>
              </ScrollReveal>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {displayArticles.map((article, i) => (
                  <ScrollReveal key={article.slug}>
                    <Link prefetch={false} href={lp(`/research/${article.slug}`)}>
                      <article className="group flex items-start gap-5 py-6 transition-colors hover:bg-white/[0.02] rounded-xl px-3 -mx-3">
                        <span className="shrink-0 font-mono text-[11px] text-white/15 tabular-nums">{String(i + 1).padStart(2, '0')}</span>

                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${CATEGORY_ACCENT[article.category] ?? ''}`}>
                              {CATEGORY_DISPLAY[article.category]}
                            </span>
                            {article.depth && (
                              <span className={`font-mono text-[10px] ${DEPTH_ACCENT[article.depth] ?? ''}`}>
                                {DEPTH_DISPLAY[article.depth]}
                              </span>
                            )}
                            {article.series && (
                              <span className="flex items-center gap-1 font-mono text-[10px] text-white/25">
                                <Layers className="h-2.5 w-2.5" />
                                {article.series}
                              </span>
                            )}
                          </div>

                          <h3 className="text-base font-medium tracking-tight text-white/80 group-hover:text-white/95 transition-colors">{article.title}</h3>
                          <p className="text-sm text-white/35 leading-relaxed line-clamp-2">{article.excerpt}</p>

                          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-white/20">
                            <span>{article.date.slice(0, 10)}</span>
                            <span className="h-0.5 w-0.5 rounded-full bg-white/15" />
                            <span>{article.readTime} min</span>
                            {article.tags.slice(0, 2).map((tag) => (
                              <span key={tag} className="rounded border border-white/8 px-1.5 py-0.5 text-white/20">{tag}</span>
                            ))}
                          </div>
                        </div>

                        <div className="shrink-0 text-white/15 transition-all group-hover:text-white/40 group-hover:translate-x-0.5">
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </article>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            )}
          </section>

        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
