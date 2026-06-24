'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useTranslations, useLocale } from '@/lib/i18n/context'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
import type { ArticleMeta } from '@/lib/content/loaders'

const MAX_READ_MINUTES = 10

interface JournalPreviewProps {
  featured: ArticleMeta | undefined
  recent: ArticleMeta[]
}

export function JournalPreview({ featured, recent }: JournalPreviewProps) {
  const t = useTranslations('home.journal')
  const tJournal = useTranslations('journal')
  const locale = useLocale()

  const categories = tJournal('categories') as Record<string, string>

  return (
    <section id="journal" className="relative py-32 border-t border-border/20">
      <div className="container mx-auto px-6">
        <ScrollReveal className="mb-16 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex flex-col gap-4">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.22em] text-violet-400">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-beacon" />
              {t('badge') as string}
            </span>
            <h2 className="text-4xl font-semibold leading-tight md:text-5xl">
              <span className="gradient-text">{t('title') as string}</span>
            </h2>
            <p className="max-w-xl text-base text-muted-foreground md:text-lg leading-relaxed">{t('description') as string}</p>
          </div>
          <Link prefetch={false} href={`/${locale}/research`} className="group inline-flex shrink-0 items-center gap-3 text-sm font-medium text-foreground/80 transition-colors duration-200 hover:text-foreground xl:self-end">
            <span className="h-px w-8 bg-border transition-all duration-300 group-hover:w-16 group-hover:bg-violet-400" />
            <span>{t('cta') as string}</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
          {/* Featured article */}
          {featured && (
            <ScrollReveal direction="left">
              <Link prefetch={false} href={`/${locale}/research/${featured.slug}`}>
                <article
                  className="spotlight-card group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/40 bg-card/20 p-8 transition-all duration-300 hover:border-violet-500/20 hover:bg-card/30 hover:shadow-[0_0_40px_-12px_rgb(139_92_246_/_0.4)] min-h-[320px]"
                  onMouseMove={(e) => {
                    const r = e.currentTarget.getBoundingClientRect()
                    e.currentTarget.style.setProperty('--mouse-x', `${((e.clientX - r.left) / r.width) * 100}%`)
                    e.currentTarget.style.setProperty('--mouse-y', `${((e.clientY - r.top) / r.height) * 100}%`)
                    e.currentTarget.style.setProperty('--spotlight-color', 'rgba(139,92,246,0.06)')
                  }}
                >
                  <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-500/8 blur-3xl transition-all duration-500 group-hover:bg-violet-500/12" />
                  <div>
                    <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
                      <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-[10px] uppercase tracking-widest text-violet-400">
                        {categories[featured.category] ?? featured.category}
                      </span>
                      <span className="h-3 w-px bg-border" />
                      <span>{featured.readTime} {t('minReadLabel') as string}</span>
                      <span className="h-3 w-px bg-border" />
                      <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[9px] uppercase tracking-widest text-violet-400">
                        {t('featuredLabel') as string}
                      </span>
                    </div>

                    {/* Read time visual bar */}
                    <div className="mt-2 h-0.5 w-full rounded-full bg-border/40 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-violet-500/40 transition-all duration-500"
                        style={{ width: `${Math.min((featured.readTime / MAX_READ_MINUTES) * 100, 100)}%` }}
                      />
                    </div>

                    <h3 className="mt-6 text-2xl font-semibold text-foreground leading-snug md:text-3xl">{featured.title}</h3>
                    <p className="mt-4 text-sm text-muted-foreground leading-relaxed line-clamp-3">{featured.excerpt}</p>

                    {/* Tags */}
                    {featured.tags && featured.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {featured.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="rounded-full border border-border/40 bg-card/60 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground/60">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="mt-8 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-violet-400 transition-all duration-200 group-hover:gap-3">
                      {tJournal('readMore') as string}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground/40">
                      {new Date(featured.date).getFullYear()}
                    </span>
                  </div>
                </article>
              </Link>
            </ScrollReveal>
          )}

          {/* Recent articles sidebar */}
          <ScrollReveal direction="right" delay={0.1} className="flex flex-col gap-4">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/60">Recent</p>
            {recent.map((article) => (
              <Link prefetch={false} key={article.slug} href={`/${locale}/research/${article.slug}`}>
                <div className="group relative flex flex-col gap-2 rounded-xl border border-border/30 bg-card/20 p-4 transition-all duration-200 hover:border-border/60 hover:bg-card/30 pl-5 hover:border-l-violet-500/40">
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl bg-violet-500/0 transition-all duration-200 group-hover:bg-violet-500/40" />
                  <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
                    <span className="rounded-full border border-border/40 px-2 py-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">
                      {categories[article.category] ?? article.category}
                    </span>
                    <span>{article.readTime} min</span>
                  </div>
                  <p className="text-sm font-medium text-foreground/80 transition-colors group-hover:text-foreground leading-snug">{article.title}</p>
                </div>
              </Link>
            ))}
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
