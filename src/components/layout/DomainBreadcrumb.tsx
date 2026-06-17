'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale, useTranslations } from '@/lib/i18n/context'
import { resolveBreadcrumb } from '@/lib/config/domains'

// Keys that map directly to nav translations
const NAV_KEYS = new Set([
  'home', 'systems', 'labs', 'infrastructure', 'journal',
  'github', 'about', 'contact', 'playground',
  'mcp', 'graphrag', 'agents', 'automation',
  'trading-ai', 'stl-generator', 'crm', 'erp', 'aura',
  'opinion', 'research', 'essays', 'news',
])

export function DomainBreadcrumb() {
  const pathname = usePathname()
  const locale = useLocale()
  const tNav = useTranslations('nav')
  const lp = (path: string) => `/${locale}${path}`

  const localelessPath = pathname.replace(`/${locale}`, '') || '/'
  const crumbs = resolveBreadcrumb(localelessPath)

  if (crumbs.length <= 1) return null

  function getLabel(key: string, fallback: string): string {
    if (NAV_KEYS.has(key)) {
      const translated = tNav(key)
      return typeof translated === 'string' && translated !== key ? translated : fallback
    }
    return fallback
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1
        const label = getLabel(crumb.key, crumb.label)
        return (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {i > 0 && <span className="opacity-40">/</span>}
            {isLast ? (
              <span className="text-foreground/80 font-medium">{label}</span>
            ) : (
              <Link prefetch={false} href={crumb.href === '/' ? lp('/') : lp(crumb.href)} className="hover:text-muted-foreground transition-colors">
                {label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
