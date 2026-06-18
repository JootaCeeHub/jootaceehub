'use client'

import Link from 'next/link'
import { useLocale } from '@/lib/i18n/context'
import { DomainLayout } from '@/components/layout/DomainLayout'
import { DomainBreadcrumb } from '@/components/layout/DomainBreadcrumb'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { RESOURCE_CATEGORIES as categories } from '@/lib/resources/categories'

export default function ResourcesPage() {
  const locale = useLocale()

  return (
    <DomainLayout>
      <div className="mb-12">
        <DomainBreadcrumb />
        <span className={`mt-6 block mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.22em] text-primary`}>
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Curated Tools, Repos &amp; Links
        </span>
        <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
          <span className="gradient-text">Resources.</span>
        </h1>
        <p className="mt-6 max-w-3xl text-lg text-muted-foreground">
          A handpicked collection of developer tools, open-source repos, automation workflows, and AI prompts.
          Everything that makes building at scale faster and smarter.
        </p>
        <p className="mt-8 font-mono text-xs tracking-[0.18em] text-white/30 uppercase" >120+ tools · 40+ repos · 25+ workflows · 50+ prompts · 30+ MCP servers · 15+ agent templates</p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {categories.map((cat, i) => {
          const Icon = cat.icon
          return (
            <ScrollReveal key={cat.key} delay={i * 0.08}>
              <div className="group relative rounded-xl border border-white/8 bg-white/[0.03] p-6 transition-all hover:bg-white/[0.06] hover:border-white/15" >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-primary">
                  <Icon size={18} />
                </div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{cat.title}</span>
                  <span className="rounded-full border border-primary/20 bg-primary/8 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-primary" >{cat.count}</span>
                </div>
                <p className="text-sm text-muted-foreground">{cat.description}</p>
                <Link prefetch={false} href={`/${locale}/resources/${cat.key}`} className="mt-4 inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-primary/60 transition-colors group-hover:text-primary" >
                  Explore →
                </Link>
              </div>
            </ScrollReveal>
          )
        })}
      </div>
    </DomainLayout>
  )
}
