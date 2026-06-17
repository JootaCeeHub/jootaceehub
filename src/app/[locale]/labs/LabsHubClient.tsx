'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { useLocale } from '@/lib/i18n/context'
import { ALL_LABS, STATUS_COLORS, STACK_CATEGORY_COLORS } from '@/lib/labs/registry'
import { fadeUp, staggerContainer } from '@/lib/motion/variants'
export default function LabsHubClient() {
  const locale = useLocale()

  const liveCount = ALL_LABS.filter((l) => l.status === 'live').length
  const betaCount = ALL_LABS.filter((l) => l.status === 'beta').length
  const devCount = ALL_LABS.filter((l) => l.status === 'development').length

  return (
    <div className="relative min-h-screen bg-[#08080f] text-white">
      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-60 left-1/4 h-[700px] w-[700px] rounded-full bg-violet-500/4 blur-[180px]" />
        <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-cyan-500/4 blur-[160px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <Navigation />

      <main className="mx-auto max-w-6xl px-4 py-24">
        <motion.div variants={staggerContainer()} initial="hidden" animate="visible">

          {/* Masthead */}
          <motion.header variants={fadeUp} className="mb-16 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-400/70">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Module Registry Online</span>
              </div>
              <div className="flex items-center gap-3">
                {liveCount > 0 && (
                  <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-emerald-400/60">
                    <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                    {liveCount} Live
                  </span>
                )}
                {betaCount > 0 && (
                  <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-sky-400/60">
                    <span className="h-1 w-1 rounded-full bg-sky-400" />
                    {betaCount} Beta
                  </span>
                )}
                {devCount > 0 && (
                  <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-amber-400/60">
                    <span className="h-1 w-1 rounded-full bg-amber-400" />
                    {devCount} Dev
                  </span>
                )}
              </div>
            </div>

            <h1 className="text-5xl font-bold tracking-tight text-white/90">
              Lab{' '}
              <span className="text-violet-400">Ecosystem</span>
            </h1>
            <p className="max-w-2xl text-base text-white/40 leading-relaxed">
              Operational product modules — each a standalone system with live runtime, architecture documentation, and active development roadmap.
            </p>
          </motion.header>

          {/* Module grid */}
          <section className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {ALL_LABS.map((lab, i) => {
              const _status = STATUS_COLORS[lab.status]
              return (
                <ScrollReveal key={lab.id}>
                  <Link prefetch={false} href={`/${locale}/labs/${lab.slug}`}>
                    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.025] transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04] hover:-translate-y-0.5">
                      {/* Accent top border */}
                      <div
                        className="absolute inset-x-0 top-0 h-[1px]"
                        style={{ background: `linear-gradient(90deg, ${lab.accent}60, ${lab.accent}20, transparent)` }}
                      />

                      {/* Card header */}
                      <div className="flex items-center justify-between px-5 pt-5">
                        <div className="font-mono text-[10px] text-white/20">{String(i + 1).padStart(2, '0')}</div>
                        <span
                          className="flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider"
                          style={{ borderColor: `${lab.accent}25`, background: `${lab.accent}08`, color: lab.accent }}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{
                              background: lab.accent,
                              boxShadow: lab.status === 'live' ? `0 0 6px ${lab.accent}` : 'none',
                            }}
                          />
                          {lab.status}
                        </span>
                      </div>

                      {/* Identity */}
                      <div className="flex-1 space-y-1.5 px-5 pt-4">
                        <h2 className="text-lg font-semibold tracking-tight text-white/90">{lab.name}</h2>
                        <p className="text-sm text-white/40 leading-relaxed line-clamp-2">{lab.tagline}</p>
                      </div>

                      {/* Live metrics */}
                      <div className="mt-4 flex gap-4 px-5">
                        {lab.metrics.slice(0, 2).map((m) => (
                          <div key={m.label} className="space-y-0.5">
                            <div className="font-mono text-sm font-semibold" style={{ color: lab.accent }}>
                              {m.value}{m.unit}
                            </div>
                            <div className="font-mono text-[9px] uppercase tracking-wider text-white/25">{m.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Stack preview */}
                      <div className="mt-4 flex flex-wrap gap-1.5 px-5">
                        {lab.stack.slice(0, 4).map((item) => (
                          <span
                            key={item.name}
                            className={`rounded-md border px-1.5 py-0.5 font-mono text-[9px] ${STACK_CATEGORY_COLORS[item.category] ?? 'border-white/10 text-white/30'}`}
                          >
                            {item.name}
                          </span>
                        ))}
                        {lab.stack.length > 4 && (
                          <span className="rounded-md border border-white/8 px-1.5 py-0.5 font-mono text-[9px] text-white/20">+{lab.stack.length - 4}</span>
                        )}
                      </div>

                      {/* Footer CTA */}
                      <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] px-5 py-3">
                        <span className="font-mono text-[10px] text-white/20">v{lab.version}</span>
                        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors" style={{ color: lab.accent }}>
                          Open Module
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </article>
                  </Link>
                </ScrollReveal>
              )
            })}
          </section>

        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
