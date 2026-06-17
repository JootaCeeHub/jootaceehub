'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { useLocale } from '@/lib/i18n/context'
import { ALL_LABS, STATUS_COLORS, STACK_CATEGORY_COLORS } from '@/lib/labs/registry'
import { fadeUp, staggerContainer } from '@/lib/motion/variants'
const STATUS_LABEL: Record<string, string> = {
  live:        'Live',
  beta:        'Beta',
  development: 'In Development',
}

export default function ProjectsPage() {
  const locale = useLocale()

  return (
    <div className="relative min-h-screen bg-[#060610]">
      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="absolute -top-40 left-1/4 h-[600px] w-[600px] rounded-full bg-violet-500/5 blur-[140px]" />
        <div className="absolute right-0 bottom-1/4 h-[500px] w-[500px] rounded-full bg-sky-500/4 blur-[120px]" />
      </div>

      <Navigation />

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-28 lg:px-6">
        <motion.div variants={staggerContainer()} initial="hidden" animate="visible">

          {/* Masthead */}
          <motion.header variants={fadeUp} className="mb-16 border-b border-white/6 pb-12">
            <p className="mb-4 font-mono text-[9px] uppercase tracking-[0.24em] text-violet-400/60" >Engineering Portfolio</p>
            <h1 className="mb-4 text-4xl font-semibold leading-tight tracking-tight text-white/90 lg:text-5xl" >Projects</h1>
            <p className="max-w-lg text-[14px] font-light leading-relaxed text-white/35" >
              A selection of systems, platforms, and tools — each built to solve a real problem. From AI orchestration to enterprise automation.
            </p>
            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-white/20" >{ALL_LABS.length} projects</p>
          </motion.header>

          {/* Project grid */}
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ALL_LABS.map((project, i) => {
              const _statusColor = STATUS_COLORS[project.status]
              return (
                <ScrollReveal key={project.id}>
                  <Link prefetch={false} href={`/${locale}/labs/${project.slug}`}>
                    <article className="[
    'group relative flex flex-col overflow-hidden rounded-2xl',
    'border border-white/7 bg-white/[0.025] transition-all duration-300',
    'hover:border-white/14 hover:bg-white/[0.04] hover:-translate-y-0.5',
    'cursor-pointer',
  ].join(' ')">
                      {/* Accent top line */}
                      <div
                        className="h-[1px] w-full"
                        style={{
                          background: `linear-gradient(90deg, ${project.accent}50, ${project.accent}18, transparent)`,
                        }}
                      />

                      <div className="flex flex-1 flex-col px-6 py-5">
                        {/* Index + status */}
                        <div className="mb-3 flex items-center justify-between">
                          <span className="font-mono text-[10px] text-white/15">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: project.accent }}>
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{
                                background: project.accent,
                                boxShadow: project.status === 'live' ? `0 0 5px ${project.accent}` : 'none',
                              }}
                            />
                            {STATUS_LABEL[project.status] ?? project.status}
                          </span>
                        </div>

                        {/* Name + tagline */}
                        <h2 className="mb-1 text-[15px] font-semibold leading-snug text-white/85">{project.name}</h2>
                        <p className="text-[12px] leading-relaxed text-white/30">{project.tagline}</p>

                        {/* Stack chips */}
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {project.stack.slice(0, 5).map((item) => (
                            <span
                              key={item.name}
                              className={`inline-flex items-center rounded border border-white/8 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.1em] text-white/35 ${STACK_CATEGORY_COLORS[item.category] ?? ''}`}
                            >
                              {item.name}
                            </span>
                          ))}
                          {project.stack.length > 5 && (
                            <span className="font-mono text-[9px] text-white/18">
                              +{project.stack.length - 5}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="[
    'mt-auto flex items-center justify-between border-t border-white/5 px-6 py-3.5',
  ].join(' ')">
                        <span className="font-mono text-[9px] text-white/18">v{project.version}</span>
                        <span className="[
    'flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em]',
    'opacity-50 transition-opacity group-hover:opacity-100',
  ].join(' ')" style={{ color: project.accent }}>
                          View project
                          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
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
