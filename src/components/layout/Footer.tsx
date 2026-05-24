'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUp, Command } from 'lucide-react'
import { brand } from '@/lib/config/brand'
import { useTranslations } from '@/lib/i18n/context'

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

export function Footer() {
  const t = useTranslations('footer')
  const ta = useTranslations('accessibility')
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [konami, setKonami] = useState<string[]>([])
  const [showEaster, setShowEaster] = useState(false)
  const easterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 600)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'a', 'b'].includes(key)) {
        setKonami((prev) => {
          const next = [...prev, key].slice(-10)
          const code = 'arrowup,arrowup,arrowdown,arrowdown,arrowleft,arrowright,arrowleft,arrowright,b,a'
          if (next.join(',') === code) {
            setShowEaster(true)
            setTimeout(() => setShowEaster(false), 5000)
            return []
          }
          return next
        })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const links = [
    { name: 'Systems', href: '#systems' },
    { name: 'Labs', href: '#labs' },
    { name: 'Infrastructure', href: '#infrastructure' },
    { name: 'GitHub', href: '#github' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ]

  const socials = [
    { icon: GitHubIcon, href: 'https://github.com/jootacee', label: 'GitHub' },
    { icon: XIcon, href: 'https://twitter.com/jootacee', label: 'Twitter' },
    { icon: LinkedInIcon, href: 'https://linkedin.com/in/jootacee', label: 'LinkedIn' },
  ]

  return (
    <>
      <footer className="relative border-t border-border/60 bg-background/50 pt-16 pb-8">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="relative inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg border border-primary/40 bg-primary/12">
                  <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(147,220,255,0.7),transparent_60%)]" />
                  <span className="relative text-xs font-semibold text-primary">JC</span>
                </span>
                <span className="text-sm font-semibold tracking-[0.18em] text-primary/95">{brand.signature}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('tagline')}
              </p>
              <div className="flex items-center gap-3">
                {socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-border bg-card/50 p-2 text-muted-foreground transition hover:border-primary/40 hover:text-primary"
                    aria-label={social.label}
                  >
                    <social.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h3 className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-primary">{t('navigation')}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground transition hover:text-foreground"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Systems */}
            <div>
              <h3 className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-primary">{t('systems')}</h3>
              <ul className="space-y-2">
                <li className="text-sm text-muted-foreground">AURA Orchestration</li>
                <li className="text-sm text-muted-foreground">MCP Ecosystem</li>
                <li className="text-sm text-muted-foreground">Graph Memory</li>
                <li className="text-sm text-muted-foreground">AI Agents</li>
                <li className="text-sm text-muted-foreground">Docker Infrastructure</li>
                <li className="text-sm text-muted-foreground">Industrial Intelligence</li>
              </ul>
            </div>

            {/* Status */}
            <div>
              <h3 className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-primary">{t('status')}</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Platform</span>
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {t('statusOperational')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">API</span>
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {t('statusHealthy')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">3D Engine</span>
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {t('statusActive')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">MCP Nodes</span>
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {t('statusNodes').replace('{count}', '8')}
                  </span>
                </div>
              </div>

              <div className="mt-6 rounded-lg border border-border bg-card/50 p-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {t('konamiHint')}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 md:flex-row">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} {brand.name}. {t('copyright')}
            </p>
            <div className="flex items-center gap-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/60">
                {t('techStack')}
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to top */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: showScrollTop ? 1 : 0, scale: showScrollTop ? 1 : 0.8 }}
        transition={{ duration: 0.2 }}
        onClick={scrollToTop}
        className="fixed bottom-4 right-4 z-40 rounded-full border border-border bg-background/80 p-3 backdrop-blur-xl transition hover:border-primary/40 hover:text-primary"
        aria-label={ta('scrollToTop')}
      >
        <ArrowUp className="h-4 w-4" />
      </motion.button>

      {/* Easter egg */}
      {showEaster ? (
        <motion.div
          ref={easterRef}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] flex items-center justify-center bg-background/90 backdrop-blur-sm"
        >
          <div className="glass-strong rounded-3xl p-10 text-center max-w-md">
            <Command className="mx-auto mb-4 h-10 w-10 text-primary" />
            <h3 className="text-2xl font-semibold gradient-text">{t('easterTitle')}</h3>
            <p className="mt-3 text-muted-foreground">
              {t('easterMessage')}
            </p>
            <p className="mt-2 font-mono text-xs text-primary">
              {t('easterSub')}
            </p>
          </div>
        </motion.div>
      ) : null}
    </>
  )
}
