'use client'

import Link from 'next/link'
import { useLocale } from '@/lib/i18n/context'
import { DomainLayout } from '@/components/layout/DomainLayout'
import { DomainBreadcrumb } from '@/components/layout/DomainBreadcrumb'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { Wrench, GitFork, Workflow, Sparkles, Server, Bot, Cpu } from 'lucide-react'
const categories = [
  {
    key: 'tools',
    icon: Wrench,
    title: 'Developer Tools',
    description: 'AI APIs, CLI utilities, cloud services, and monitoring platforms that accelerate modern development.',
    count: '18 tools',
  },
  {
    key: 'repos',
    icon: GitFork,
    title: 'Open Source Repos',
    description: 'Essential GitHub repositories every TypeScript and full-stack developer should know and bookmark.',
    count: '13 repos',
  },
  {
    key: 'workflows',
    icon: Workflow,
    title: 'Automation Workflows',
    description: 'CI/CD pipelines, n8n templates, and AI automation patterns ready to adapt for your projects.',
    count: '10 workflows',
  },
  {
    key: 'prompts',
    icon: Sparkles,
    title: 'AI Prompts',
    description: 'System prompts, task prompts, and meta-prompts for code review, architecture, and documentation.',
    count: '10 prompts',
  },
  {
    key: 'mcp',
    icon: Server,
    title: 'MCP Servers',
    description: 'Model Context Protocol servers for Claude — filesystem, GitHub, databases, browser automation, and custom integrations.',
    count: '30+ servers',
  },
  {
    key: 'agents',
    icon: Bot,
    title: 'AI Agent Templates',
    description: 'Production-ready agent architectures: ReAct, multi-agent orchestration, RAG, memory, and critic-loop patterns.',
    count: '15 templates',
  },
  {
    key: 'skills',
    icon: Cpu,
    title: 'Skills & Capabilities',
    description: 'Claude Code skills (slash commands), Hermes agent capabilities, and AI tool-use patterns you can deploy today.',
    count: '20+ skills',
  },
]

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
