'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { BrandMark } from '@/components/shared/BrandMark'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import { navItems as fallbackNavItems } from '@/lib/config/brand'
import { useFoundationIdentity } from '@/hooks/useFoundationIdentity'
import { useTranslations } from '@/lib/i18n/context'
import { navReveal } from '@/lib/motion/variants'
import { cn } from '@/lib/utils'

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('#systems')
  const { identity } = useFoundationIdentity()
  const navItems = identity.navItems.length ? identity.navItems : fallbackNavItems
  const t = useTranslations('nav')

  const translateNav = (href: string, fallbackName: string) => {
    const key = href.replace('#', '')
    const translated = t(key)
    return translated === key ? fallbackName : translated
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const sections = navItems
      .map((item) => document.querySelector(item.href))
      .filter((node): node is Element => Boolean(node))

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting)
        if (visible?.target.id) {
          setActive(`#${visible.target.id}`)
        }
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: 0.05 }
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [navItems])

  const scrollTo = (href: string) => {
    setIsOpen(false)
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <motion.nav
      variants={navReveal}
      initial="hidden"
      animate="visible"
      className={cn('fixed inset-x-0 top-0 z-50 transition-all', scrolled ? 'py-3' : 'py-5')}
    >
      <div className="container mx-auto px-6">
        <div className={cn('rounded-2xl px-4 py-3', scrolled ? 'glass-strong' : 'glass')}>
          <div className="flex items-center justify-between">
            <button onClick={() => scrollTo('#hero')} aria-label="Go to top">
              <BrandMark />
            </button>

            <div className="hidden items-center gap-7 lg:flex">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollTo(item.href)}
                  className={cn(
                    'text-sm transition',
                    active === item.href ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {translateNav(item.href, item.name)}
                </button>
              ))}
              <Button size="sm" onClick={() => scrollTo('#contact')}>
                {t('collaborate')}
              </Button>
              <div className="flex items-center gap-2 border-l border-border/60 pl-2">
                <ThemeToggle />
                <LanguageSwitcher />
              </div>
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              <ThemeToggle />
              <LanguageSwitcher />
              <button onClick={() => setIsOpen((v) => !v)} aria-label="Toggle navigation">
                {isOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-3 border-t border-border pt-4 lg:hidden"
              >
                {navItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => scrollTo(item.href)}
                    className="block w-full text-left text-sm text-muted-foreground"
                  >
                    {translateNav(item.href, item.name)}
                  </button>
                ))}
                <Button size="sm" className="w-full" onClick={() => scrollTo('#contact')}>
                  {t('collaborate')}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.nav>
  )
}
