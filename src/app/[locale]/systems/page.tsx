'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useParams } from 'next/navigation'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { HoverCard3D } from '@/components/shared/HoverCard3D'
import { ScrollReveal, StaggerReveal } from '@/components/shared/ScrollReveal'
import { fadeUp, staggerContainer } from '@/lib/motion/variants'
const systemsData = [
  {
    key: 'mcp',
    badge: 'Protocol Layer',
    title: 'MCP Ecosystem',
    subtitle: 'Protocol-first orchestration layer',
    description:
      'The Model Context Protocol gateway that connects AI models, tools, and operational data streams into a unified orchestration fabric.',
    status: 'Operational',
    href: '/systems/mcp',
  },
  {
    key: 'graphrag',
    badge: 'Memory System',
    title: 'GraphRAG',
    subtitle: 'Graph memory & retrieval system',
    description:
      'A graph-native retrieval-augmented generation system that stores and queries knowledge as interconnected entities rather than flat vectors.',
    status: 'Operational',
    href: '/systems/graphrag',
  },
  {
    key: 'agents',
    badge: 'Agent Network',
    title: 'AI Agents',
    subtitle: 'Multi-agent orchestration fabric',
    description:
      'Coordinated autonomous agents with defined roles, tool access, and inter-agent communication protocols for complex task execution.',
    status: 'Active',
    href: '/systems/agents',
  },
  {
    key: 'automation',
    badge: 'Automation Layer',
    title: 'Automation',
    subtitle: 'Intelligent workflow infrastructure',
    description:
      'Event-driven automation pipelines that reduce operational friction and increase throughput across the entire system surface.',
    status: 'Operational',
    href: '/systems/automation',
  },
]

const architectureNotes = [
  'Protocol-first orchestration through MCP gateway and AURA arbitration.',
  'Graph memory as persistent operational context for multi-agent continuity.',
  'Runtime feedback loops feeding orchestration and reliability policies.',
  'Infrastructure modeled as composable intelligence modules, not isolated apps.',
]

const systemStats = [
  { value: '18', label: 'MCP Tools' },
  { value: '4', label: 'AI Models' },
  { value: '240ms', label: 'Avg Latency' },
  { value: '99.9%', label: 'Uptime' },
]

export default function SystemsPage() {
  const params = useParams<{ locale: string }>()
  const locale = params.locale ?? 'en'
  const lp = (path: string) => `/${locale}${path}`

  return (
    <div className="relative min-h-screen">
      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="absolute -top-40 left-1/4 h-[600px] w-[600px] rounded-full bg-primary/6 blur-[130px]" />
        <div className="absolute right-0 bottom-1/4 h-[400px] w-[400px] rounded-full bg-accent/4 blur-[100px]" />
      </div>

      <Navigation />

      {/* Status strip */}
      <div className="border-b border-border/40 bg-card/20 backdrop-blur-sm sticky top-16 z-30" >
        <div className="container mx-auto flex items-center gap-6 overflow-x-auto px-4 py-2 lg:px-6" >
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            <span className="font-mono text-xs text-emerald-400 uppercase tracking-[0.16em]">All Systems Nominal</span>
          </div>
          <span className="h-3 w-px bg-border/60 flex-shrink-0" />
          <span className="font-mono text-xs text-muted-foreground/60 uppercase tracking-[0.12em] flex-shrink-0">4 Active</span>
          <span className="h-3 w-px bg-border/60 flex-shrink-0" />
          <span className="font-mono text-xs text-muted-foreground/60 uppercase tracking-[0.12em] flex-shrink-0">v2.1.0</span>
          <span className="h-3 w-px bg-border/60 flex-shrink-0" />
          <span className="font-mono text-xs text-muted-foreground/60 uppercase tracking-[0.12em] flex-shrink-0">MCP · GraphRAG · Agents · Automation</span>
        </div>
      </div>

      {/* Split layout */}
      <div className="flex min-h-[calc(100vh-10rem)]">
        {/* Sidebar */}
        <aside className="hidden w-60 flex-shrink-0 border-r border-border/40 bg-card/20 backdrop-blur-sm lg:flex lg:flex-col sticky top-[6.5rem] h-[calc(100vh-6.5rem)] overflow-y-auto" >
          <div className="border-b border-border/40 px-5 py-4">
            <div className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground" >
              SYSTEMS
              <span className="block text-foreground font-semibold text-sm mt-0.5">/ARCH</span>
            </div>
          </div>

          <nav className="flex flex-col gap-0.5 px-3 py-4">
            {systemsData.map((sys) => (
              <Link prefetch={false} key={sys.key} href={lp(sys.href)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:bg-primary/8 hover:text-foreground group" >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 flex-shrink-0 animate-pulse" />
                <span className="font-mono text-xs">{sys.title}</span>
              </Link>
            ))}
          </nav>

          <div className="mx-5 my-3 border-t border-border/40" />

          <div className="px-5 py-4 flex flex-col gap-3">
            {systemStats.map((stat) => (
              <div key={stat.label} className="flex items-baseline justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground/60">{stat.label}</span>
                <span className="font-mono text-sm font-semibold text-foreground">{stat.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-auto border-t border-border/40 px-5 py-4">
            <Link prefetch={false} href={lp('/')} className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/50 hover:text-muted-foreground transition-colors" >
              <ArrowLeft className="h-3 w-3" />
              Ecosystem
            </Link>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">
          <motion.div
            variants={staggerContainer()}
            initial="hidden"
            animate="visible"
            className="px-6 py-10 lg:px-10"
          >
            {/* Header */}
            <motion.header variants={fadeUp} className="mb-10">
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.22em] text-primary" >
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Architecture Intelligence
              </span>
              <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
                <span className="gradient-text">Systems.</span>
              </h1>
              <p className="mt-4 max-w-2xl text-base text-muted-foreground leading-relaxed">
                Core intelligence layers, protocol fabrics, and operational runtimes that power
                autonomous infrastructure. Built for composability, resilience, and operational
                continuity.
              </p>
            </motion.header>

            {/* Cards grid */}
            <StaggerReveal className="grid gap-5 md:grid-cols-2">
              {systemsData.map((sys) => (
                <ScrollReveal key={sys.key}>
                  <HoverCard3D intensity={5}>
                    <Link prefetch={false} href={lp(sys.href)}>
                      <div className="group flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/40 p-6 transition-all duration-300 hover:border-primary/30 hover:bg-card/70 cursor-pointer" >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/60">{sys.badge}</span>
                            <h3 className="mt-1 text-xl font-semibold text-foreground">{sys.title}</h3>
                            <p className="text-sm text-muted-foreground">{sys.subtitle}</p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-xs font-mono text-emerald-400">{sys.status}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{sys.description}</p>
                        <span className="mt-auto flex items-center gap-1.5 text-sm font-medium text-primary group-hover:gap-2.5 transition-all">
                          Explore system <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </Link>
                  </HoverCard3D>
                </ScrollReveal>
              ))}
            </StaggerReveal>

            {/* Architecture notes */}
            <ScrollReveal delay={0.2}>
              <div className="mt-10 rounded-xl border border-border/40 bg-card/30 p-6" >
                <div className="mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <span className="h-px w-8 bg-border" />
                  Architecture Notes
                </div>
                <ul className="grid gap-3 md:grid-cols-2">
                  {architectureNotes.map((note) => (
                    <li key={note} className="data-line pl-6 text-sm text-muted-foreground leading-relaxed">
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>

            {/* Stats row */}
            <ScrollReveal delay={0.3}>
              <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                {systemStats.map((stat) => (
                  <div key={stat.label} className="flex flex-col gap-1 rounded-xl border border-border/40 bg-card/30 px-4 py-3" >
                    <span className="text-xl font-semibold text-foreground">{stat.value}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground/60">{stat.label}</span>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </motion.div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
