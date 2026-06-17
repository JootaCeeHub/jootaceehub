'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BrandMark } from '@/components/shared/BrandMark'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import { SearchButton } from '@/components/shared/SearchButton'
import { cn } from '@/lib/utils'
import { useLocale, useTranslations } from '@/lib/i18n/context'
import { navReveal } from '@/lib/motion/variants'
import { domains } from '@/lib/config/domains'
import { MegaNav } from './MegaNav'

const DEFAULT_DOMAIN_ACCENTS: Record<string, string> = {
  projects:     '#a78bfa',
  research:     '#34d399',
  resources:    '#38bdf8',
  intelligence: '#facc15',
  github:       '#f472b6',
  about:        '#94a3b8',
}

function readDomainAccents(): Record<string, string> {
  if (typeof window === 'undefined') return DEFAULT_DOMAIN_ACCENTS
  const style = getComputedStyle(document.documentElement)
  return {
    projects:     style.getPropertyValue('--accent-projects').trim()     || DEFAULT_DOMAIN_ACCENTS.projects,
    research:     style.getPropertyValue('--accent-research').trim()     || DEFAULT_DOMAIN_ACCENTS.research,
    resources:    style.getPropertyValue('--accent-resources').trim()    || DEFAULT_DOMAIN_ACCENTS.resources,
    intelligence: style.getPropertyValue('--accent-intelligence').trim() || DEFAULT_DOMAIN_ACCENTS.intelligence,
    github:       style.getPropertyValue('--accent-github').trim()       || DEFAULT_DOMAIN_ACCENTS.github,
    about:        style.getPropertyValue('--accent-about').trim()        || DEFAULT_DOMAIN_ACCENTS.about,
  }
}

const SPRING = { type: 'spring' as const, stiffness: 500, damping: 42 }

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null)
  const [domainAccents, setDomainAccents] = useState<Record<string, string>>(DEFAULT_DOMAIN_ACCENTS)
  const menuCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setDomainAccents(readDomainAccents())
    const onSave = () => setDomainAccents(readDomainAccents())
    window.addEventListener('admin-state-saved', onSave)
    return () => window.removeEventListener('admin-state-saved', onSave)
  }, [])

  /* Section-to-domain-key map for landing page active state */
  const SECTION_TO_DOMAIN = useMemo<Record<string, string>>(() => ({
    labs:           'projects',
    systems:        'projects',
    infrastructure: 'resources',
    journal:        'research',
    github:         'github',
    collaborate:    'about',
  }), [])

  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations('nav')

  const lp = useCallback((path: string) => `/${locale}${path}`, [locale])
  const isLanding = pathname === `/${locale}` || pathname === `/${locale}/`

  /* IntersectionObserver — track active section on landing */
  useEffect(() => {
    if (!isLanding) { setActiveSectionId(null); return }

    const sectionIds = ['hero', 'systems', 'labs', 'infrastructure', 'journal', 'collaborate', 'github']
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSectionId(entry.target.id)
          }
        }
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: 0 }
    )

    sectionIds.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [isLanding])

  useEffect(() => {
    setIsOpen(false)
    setExpandedMobile(null)
  }, [pathname])

  const handleTriggerEnter = useCallback((key: string) => {
    if (menuCloseTimer.current) clearTimeout(menuCloseTimer.current)
    setActiveMenu(key)
  }, [])

  const handleMenuLeave = useCallback(() => {
    menuCloseTimer.current = setTimeout(() => setActiveMenu(null), 120)
  }, [])

  const handleMenuEnter = useCallback(() => {
    if (menuCloseTimer.current) clearTimeout(menuCloseTimer.current)
  }, [])

  const isActiveDomain = useCallback(
    (href: string) => {
      if (href === '/') return isLanding
      if (isLanding && activeSectionId) {
        const mappedKey = SECTION_TO_DOMAIN[activeSectionId]
        const domainForHref = domains.find((d) => d.href === href)
        if (domainForHref && mappedKey === domainForHref.key) return true
      }
      return pathname.startsWith(lp(href))
    },
    [pathname, lp, isLanding, activeSectionId, SECTION_TO_DOMAIN]
  )

  const handleNavItemClick = useCallback(() => {
    setActiveMenu(null)
  }, [])

  const activeDomainKey = domains.find((d) => isActiveDomain(d.href))?.key
  const activeDomainAccent = activeDomainKey ? domainAccents[activeDomainKey] : undefined

  return (
    <motion.nav
      variants={navReveal}
      initial="hidden"
      animate="visible"
      className="fixed inset-x-0 top-0 z-50 py-3 transition-all duration-300"
      data-pagefind-ignore="all"
    >
      <div className="container mx-auto px-4 lg:px-6">
        <div className="relative rounded-2xl transition-all duration-300 border glass-strong border-border/60 shadow-xl shadow-black/20">
          {/* Domain accent scan line at bottom of pill */}
          <AnimatePresence mode="wait">
            {activeDomainAccent && !isLanding && (
              <motion.div
                key={activeDomainAccent}
                className="absolute bottom-0 left-6 right-6 h-px rounded-full pointer-events-none"
                style={{
                  background: `linear-gradient(90deg, transparent, ${activeDomainAccent}70, transparent)`,
                }}
                initial={{ opacity: 0, scaleX: 0.4 }}
                animate={{ opacity: 1, scaleX: 1 }}
                exit={{ opacity: 0, scaleX: 0.4 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between gap-4 px-4 py-2.5">
            {/* Brand */}
            <Link prefetch={false} href={lp('/')} aria-label="Go to home" className="flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-lg">
              <BrandMark />
            </Link>

            {/* Desktop Nav */}
            <nav aria-label="Main navigation" className="hidden items-center gap-0.5 lg:flex">
              {domains.map((domain) => {
                const hasChildren = Boolean(domain.children?.length)
                const isActive = isActiveDomain(domain.href)
                const accent = domainAccents[domain.key] ?? '#6366f1'
                const href = lp(domain.href)

                return (
                  <div
                    key={domain.key}
                    className="relative"
                    {...(hasChildren
                      ? {
                          onMouseEnter: () => handleTriggerEnter(domain.key),
                          onMouseLeave: handleMenuLeave,
                        }
                      : {})}
                  >
                    {/* Animated active background — slides between items */}
                    {isActive && (
                      <motion.div
                        layoutId="nav-active-bg"
                        className="absolute inset-0 rounded-lg border pointer-events-none"
                        style={{
                          background: `${accent}14`,
                          borderColor: `${accent}28`,
                        }}
                        transition={SPRING}
                      />
                    )}

                    <Link
                      href={href}
                      prefetch={false}
                      onClick={handleNavItemClick}
                      className={cn(
                        'relative z-10 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors duration-200',
                        isActive
                          ? 'text-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-white/4'
                      )}
                      suppressHydrationWarning
                      {...(hasChildren
                        ? {
                            'aria-expanded': activeMenu === domain.key,
                            'aria-haspopup': 'true' as const,
                          }
                        : {})}
                    >
                      {isActive && (
                        <span
                          className="h-1.5 w-1.5 rounded-full flex-shrink-0 animate-pulse"
                          style={{ background: accent }}
                          suppressHydrationWarning
                        />
                      )}
                      <span>{domain.label}</span>
                      {hasChildren && (
                        <ChevronDown
                          className={cn('h-3 w-3 transition-transform duration-200', activeMenu === domain.key ? 'rotate-180' : '')}
                          strokeWidth={2}
                          suppressHydrationWarning
                        />
                      )}
                    </Link>

                    {/* Animated bottom accent line — slides between items */}
                    {isActive && (
                      <motion.div
                        layoutId="nav-active-line"
                        className="absolute bottom-0 left-2 right-2 h-px pointer-events-none rounded-full"
                        style={{
                          background: `linear-gradient(90deg, transparent, ${accent}90, transparent)`,
                        }}
                        transition={SPRING}
                      />
                    )}

                    {/* Dropdown */}
                    {hasChildren && (
                      <AnimatePresence>
                        {activeMenu === domain.key && (
                          <div
                            onMouseEnter={handleMenuEnter}
                            onMouseLeave={handleMenuLeave}
                          >
                            <MegaNav
                              domain={domain}
                              accentColor={accent}
                              onClose={() => setActiveMenu(null)}
                            />
                          </div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                )
              })}
            </nav>

            {/* Right controls */}
            <div className="flex items-center gap-2">
              <SearchButton locale={locale} />
              <Link prefetch={false} href={lp('/contact')}>
                <Button size="sm">{t('collaborate')}</Button>
              </Link>
              <span className="h-4 w-px bg-border/60" aria-hidden />
              <ThemeToggle />
              <LanguageSwitcher />

              {/* Mobile toggle */}
              <button
                className="flex items-center gap-2 lg:hidden"
                onClick={() => setIsOpen((v) => !v)}
                aria-label="Toggle navigation"
                aria-expanded={isOpen}
              >
                <AnimatePresence mode="wait">
                  {isOpen ? (
                    <motion.span
                      key="close"
                      initial={{ opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: 90 }}
                      transition={{ duration: 0.15 }}
                    >
                      <X size={18} suppressHydrationWarning />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="menu"
                      initial={{ opacity: 0, rotate: 90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: -90 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Menu size={18} suppressHydrationWarning />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="mt-3 space-y-1 border-t border-border/40 pt-3 pb-2 lg:hidden"
              >
                {domains.map((domain) => {
                  const hasChildren = Boolean(domain.children?.length)
                  const isActive = isActiveDomain(domain.href)
                  const isExpanded = expandedMobile === domain.key

                  return (
                    <div key={domain.key}>
                      {hasChildren ? (
                        <>
                          <button
                            onClick={() =>
                              setExpandedMobile(isExpanded ? null : domain.key)
                            }
                            className={cn(
                              'flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors',
                              isActive
                                ? 'bg-white/8 text-foreground'
                                : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                            )}
                          >
                            <span>{domain.label}</span>
                            <ChevronDown
                              className={cn('h-3 w-3 transition-transform duration-200', isExpanded ? 'rotate-180' : '')}
                              size={14}
                              suppressHydrationWarning
                            />
                          </button>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.18 }}
                                className="mt-1 ml-3 space-y-1 border-l border-border/40 pl-3"
                              >
                                {domain.children?.map((child) => (
                                  <Link
                                    key={child.key}
                                    href={lp(child.href)}
                                    prefetch={false}
                                    className={cn(
                                      'block rounded-lg px-3 py-2 text-[12px] transition-colors',
                                      pathname.startsWith(lp(child.href)) ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                                    )}
                                    onClick={() => setIsOpen(false)}
                                  >
                                    <span>{child.label}</span>
                                    <span className="mt-0.5 text-[10px] opacity-60">
                                      {child.description}
                                    </span>
                                  </Link>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      ) : (
                        <Link
                          href={lp(domain.href)}
                          prefetch={false}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            'flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors',
                            isActive
                              ? 'bg-white/8 text-foreground'
                              : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                          )}
                        >
                          {domain.label}
                        </Link>
                      )}
                    </div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.nav>
  )
}
