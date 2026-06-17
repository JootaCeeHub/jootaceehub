'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { ScrollReveal, StaggerReveal } from '@/components/shared/ScrollReveal'
import { useTranslations } from '@/lib/i18n/context'
import { fadeUp, staggerContainer } from '@/lib/motion/variants'
interface PlaygroundTool {
  number: string
  name: string
  status: string
  description: string
  bullets: string[]
  stack: string[]
  eta: string
}

const tools: PlaygroundTool[] = [
  {
    number: '01',
    name: 'AI Chat Interface',
    status: 'Roadmap',
    description:
      'A fully interactive LLM playground with custom system prompts, temperature controls, and token budgeting. Supports multi-turn conversations with context visualization.',
    bullets: [
      'Swap between Claude, GPT-4 and local models',
      'Visual context window usage meter',
      'Export conversation as structured JSON or Markdown',
    ],
    stack: ['React', 'Anthropic API', 'OpenAI API'],
    eta: 'Q3 2026',
  },
  {
    number: '02',
    name: 'Automation Builder',
    status: 'Roadmap',
    description:
      'Visual workflow construction and testing environment with a node-based canvas. Build and run automation sequences without writing code, then export to n8n or Python.',
    bullets: [
      'Drag-and-drop node editor with AI action blocks',
      'Live execution trace with per-step output',
      'One-click export to runnable n8n workflows',
    ],
    stack: ['React Flow', 'n8n API', 'FastAPI'],
    eta: 'Q3 2026',
  },
  {
    number: '03',
    name: 'GraphRAG Explorer',
    status: 'Roadmap',
    description:
      'Query and visualize graph memory in real-time. Browse entity relationships, inspect knowledge nodes, and run natural language queries against the live graph.',
    bullets: [
      'Force-directed graph visualization with Three.js',
      'Natural language query interface over graph data',
      'Entity timeline view for temporal knowledge tracking',
    ],
    stack: ['Three.js', 'GraphQL', 'Neo4j'],
    eta: 'Q4 2026',
  },
  {
    number: '04',
    name: 'Agent Simulator',
    status: 'Roadmap',
    description:
      'Deploy and test multi-agent coordination scenarios in a sandboxed runtime. Define agent roles, assign tools, observe inter-agent communication in real-time.',
    bullets: [
      'Visual agent topology map with live message flow',
      'Configurable role definitions and tool manifests',
      'Replay mode for debugging coordination failures',
    ],
    stack: ['Python', 'LangGraph', 'WebSockets', 'React'],
    eta: 'Q4 2026',
  },
]

const roadmapPhases = [
  { period: 'Q1 2026', label: 'Foundation', active: false },
  { period: 'Q2 2026', label: 'Alpha', active: false },
  { period: 'Q3 2026', label: 'Beta', active: true },
  { period: 'Q4 2026', label: 'Launch', active: false },
]

export default function PlaygroundPage() {
  const [email, setEmail] = useState('')
  const [notified, setNotified] = useState(false)
  const t = useTranslations('playground')

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) setNotified(true)
  }

  return (
    <div className="relative min-h-screen">
      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-primary/4 blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-violet-500/4 blur-[100px]" />
      </div>

      <Navigation />

      {/* Domain header */}
      <div className="border-b border-border/40 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4 lg:px-6" >
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground" >
            <span>JOOTACEE</span>
            <span className="text-border">/</span>
            <span className="text-foreground">PLAYGROUND</span>
            <span className="text-border">/</span>
            <span className="text-foreground">INTERACTIVE SANDBOX</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/20 px-3 py-1 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground" >
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
            In Development · Q3 2026
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12 lg:px-6">
        <motion.div variants={staggerContainer()} initial="hidden" animate="visible">
          {/* Header */}
          <motion.header variants={fadeUp} className="mb-12">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.22em] text-primary" >
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              {t('badge') as string}
            </span>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
              <span className="gradient-text">Playground.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base text-muted-foreground leading-relaxed">
              Interactive experimentation environment for AI models, automation workflows, graph
              exploration, and multi-agent scenarios. Currently in active development.
            </p>
          </motion.header>

          {/* Tool catalog */}
          <ScrollReveal>
            <div className="mb-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground" >
              <span className="h-px w-8 bg-border" />
              Upcoming Tools
            </div>
            <StaggerReveal className="mb-14 grid gap-5 md:grid-cols-2">
              {tools.map((tool) => (
                <div key={tool.number} className="group flex flex-col gap-5 rounded-2xl border border-border/50 bg-card/40 p-7 transition-all duration-300 hover:border-primary/20 hover:bg-card/60" >
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-3xl font-semibold text-muted-foreground/20">{tool.number}</span>
                    <span className="flex-shrink-0 rounded-full border border-border/50 bg-muted/20 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground" >{tool.status}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">{tool.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{tool.description}</p>
                  </div>
                  <ul className="flex flex-col gap-1.5">
                    {tool.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-primary/60" />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-2">
                    {tool.stack.map((tech) => (
                      <span key={tech} className="rounded-md border border-border/40 bg-muted/20 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground/60" >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/40">ETA: {tool.eta}</div>
                </div>
              ))}
            </StaggerReveal>
          </ScrollReveal>

          {/* Roadmap timeline */}
          <ScrollReveal delay={0.15}>
            <div className="mb-14">
              <div className="mb-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground" >
                <span className="h-px w-8 bg-border" />
                Development Roadmap
              </div>
              <div className="relative">
                <div className="absolute top-5 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" aria-hidden />
                <div className="relative grid grid-cols-2 gap-6 md:grid-cols-4">
                  {roadmapPhases.map((phase) => (
                    <div key={phase.period} className="flex flex-col items-center gap-3 text-center">
                      <div className="relative flex items-center justify-center">
                        <div className={phase.active ? "h-10 w-10 rounded-full border-2 border-primary/60 bg-primary/10 flex items-center justify-center" : "h-10 w-10 rounded-full border-2 border-border/60 bg-card/60 flex items-center justify-center"}>
                          <span
                            className={
                              phase.active
                                ? "h-2.5 w-2.5 rounded-full bg-primary animate-pulse"
                                : "h-2.5 w-2.5 rounded-full bg-border/80"
                            }
                          />
                        </div>
                      </div>
                      <div className="font-mono text-xs font-semibold text-foreground">{phase.period}</div>
                      <div className="text-xs text-muted-foreground">{phase.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Early access form */}
          <ScrollReveal delay={0.2}>
            <div className="glass rounded-2xl p-8 md:p-10 max-w-xl">
              <div className="mb-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground" >
                <span className="h-px w-8 bg-border" />
                {t('earlyAccess') as string}
              </div>
              {notified ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-4"
                >
                  <p className="text-lg font-semibold text-foreground">{t('onListTitle') as string}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{t('onListSubtitle') as string}</p>
                </motion.div>
              ) : (
                <>
                  <h2 className="mb-2 text-2xl font-semibold text-foreground">Get early access.</h2>
                  <p className="mb-6 text-sm text-muted-foreground leading-relaxed">{t('notifyDesc') as string}</p>
                  <form onSubmit={handleNotify} className="flex gap-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('notifyPlaceholder') as string}
                      className="flex-1 rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30" required
                    />
                    <button type="submit" className="flex-shrink-0 rounded-xl border border-primary/50 bg-primary/10 px-5 py-2.5 text-sm font-medium text-primary transition-all hover:bg-primary/20" >
                      {t('notifySubmit') as string}
                    </button>
                  </form>
                </>
              )}
            </div>
          </ScrollReveal>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
