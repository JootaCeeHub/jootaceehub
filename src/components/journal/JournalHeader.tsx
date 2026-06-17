'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from '@/lib/i18n/context'
import { DomainBreadcrumb } from '@/components/layout/DomainBreadcrumb'
import type { ArticleCategory } from '@/lib/journal/types'

const CATEGORY_KEYS: ArticleCategory[] = ['opinion', 'research', 'essays', 'news']

interface JournalHeaderProps {
  activeCategory?: ArticleCategory | 'all'
}

export function JournalHeader({ activeCategory = 'all' }: JournalHeaderProps) {
  const locale = useLocale()
  const t = useTranslations('journal')

  return (
    <div className="mb-10">
      <DomainBreadcrumb />
      <span className="mt-6 block inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 font-mono text-xs uppercase tracking-widest text-primary">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
        {t('badge') as string}
      </span>
      <h1 className="mt-4 text-4xl font-black tracking-tight text-foreground md:text-5xl">
        <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">{t('title') as string}.</span>
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">{t('description') as string}</p>
      <nav className="mt-6 flex flex-wrap gap-2">
        <Link
          href={`/${locale}/research`}
          className={`rounded-lg border border-border/40 px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary${activeCategory === 'all' ? ' border-primary/30 bg-primary/5 text-primary' : ''}`}
        >
          {t('allLabel') as string}
        </Link>
        {CATEGORY_KEYS.map((key) => (
          <Link
            key={key}
            href={`/${locale}/research?category=${key}`}
            className={`rounded-lg border border-border/40 px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary${activeCategory === key ? ' border-primary/30 bg-primary/5 text-primary' : ''}`}
          >
            {(t('categories') as Record<string, string>)[key] ?? key}
          </Link>
        ))}
      </nav>
    </div>
  )
}
