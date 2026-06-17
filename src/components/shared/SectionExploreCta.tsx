'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useLocale } from '@/lib/i18n/context'

interface SectionExploreCtaProps {
  domainHref: string
  label: string
  statusLabel?: string
}

export function SectionExploreCta({ domainHref, label, statusLabel }: SectionExploreCtaProps) {
  const locale = useLocale()
  const lp = (path: string) => `/${locale}${path}`

  return (
    <div className="mt-12 flex items-center justify-between border-t border-border/40 pt-8">
      <div className="flex items-center gap-3">
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        {statusLabel && <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/60">{statusLabel}</span>}
      </div>
      <Link prefetch={false} href={lp(domainHref)} className="group flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground">
        <span>Explore {label}</span>
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
      </Link>
    </div>
  )
}
