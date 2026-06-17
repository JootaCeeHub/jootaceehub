'use client'

import { Code, Bot, Layers, Zap, Globe, MessageSquare } from 'lucide-react'
import { DomainLayout } from '@/components/layout/DomainLayout'
import { DomainBreadcrumb } from '@/components/layout/DomainBreadcrumb'
import { ContactSection } from '@/components/sections/ContactSection'
import { ScrollReveal, StaggerReveal } from '@/components/shared/ScrollReveal'
import { BorderBeam } from '@/components/shared/BorderBeam'
import { useTranslations } from '@/lib/i18n/context'
const PATHS = [
  {
    icon: Code,
    title: 'Technical Consulting',
    desc: 'Architecture reviews, stack selection, system design for AI-native products.',
  },
  {
    icon: Bot,
    title: 'AI Agent Development',
    desc: 'Custom MCP servers, multi-agent pipelines, and autonomous workflow systems.',
  },
  {
    icon: Layers,
    title: 'Full-Stack Engineering',
    desc: 'End-to-end product development from infrastructure to polished UI.',
  },
  {
    icon: Zap,
    title: 'Automation & Workflows',
    desc: 'n8n pipelines, API integrations, and intelligent process automation.',
  },
  {
    icon: Globe,
    title: 'Platform Strategy',
    desc: 'Roadmap planning, technical due diligence, and team scaling advice.',
  },
  {
    icon: MessageSquare,
    title: 'Open Collaboration',
    desc: 'Research partnerships, open-source contributions, and knowledge exchange.',
  },
]

export default function ContactPage() {
  const t = useTranslations('contact')

  return (
    <DomainLayout>
      <div className="mb-12">
        <DomainBreadcrumb />
        <span className={`mt-6 block mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.22em] text-primary`}>
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-beacon" />
          {t('domainBadge') as string}
        </span>
        <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
          <span className="gradient-text">Contact.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">{t('domainDescription') as string}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-8">

          {/* Availability terminal card */}
          <ScrollReveal>
            <div className="glass-strong rounded-2xl overflow-hidden">
              <BorderBeam duration={6} />
              <div className="flex items-center gap-2 border-b border-border/40 bg-card/60 px-4 py-3">
                <span className={`h-2.5 w-2.5 rounded-full bg-red-400/80`} />
                <span className={`h-2.5 w-2.5 rounded-full bg-amber-400/80`} />
                <span className={`h-2.5 w-2.5 rounded-full bg-emerald-400/80`} />
                <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60">jootacee — availability.sh</span>
              </div>
              <div className="p-6 space-y-5">
                <div className="flex items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-beacon" />
                  <span className="text-sm text-emerald-300">
                    Currently available for new projects and collaborations
                  </span>
                  <span className="ml-auto font-mono text-[10px] text-muted-foreground/60">Updated May 2026</span>
                </div>

                <div className="grid grid-cols-3 gap-3 rounded-xl border border-border/30 bg-card/20 p-4">
                  <div className="text-center">
                    <div className="text-xl font-semibold gradient-text">48h</div>
                    <div className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mt-0.5">Avg response</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-semibold gradient-text">100%</div>
                    <div className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mt-0.5">Reply rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-semibold gradient-text">5+</div>
                    <div className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mt-0.5">Years active</div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Collaboration paths */}
          <ScrollReveal delay={0.1}>
            <div>
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-primary">
                Collaboration Pathways
              </p>
              <StaggerReveal className="grid gap-3 sm:grid-cols-2">
                {PATHS.map((path) => {
                  const Icon = path.icon
                  return (
                    <div
                      key={path.title}
                      className="spotlight-card group flex flex-col gap-2 rounded-xl border border-border/40 bg-card/30 p-4 transition-all duration-300 hover:border-primary/30 hover:bg-card/50"
                      onMouseMove={(e) => {
                        const r = e.currentTarget.getBoundingClientRect()
                        e.currentTarget.style.setProperty('--mouse-x', `${((e.clientX - r.left) / r.width) * 100}%`)
                        e.currentTarget.style.setProperty('--mouse-y', `${((e.clientY - r.top) / r.height) * 100}%`)
                      }}
                    >
                      <div className="h-8 w-8 rounded-lg bg-primary/10 p-1.5 text-primary group-hover:bg-primary/20 transition-colors duration-200"><Icon className="h-5 w-5" /></div>
                      <p className="text-sm font-medium text-foreground">{path.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{path.desc}</p>
                    </div>
                  )
                })}
              </StaggerReveal>
            </div>
          </ScrollReveal>

          {/* Contact form */}
          <ScrollReveal delay={0.15}>
            <div className="-mx-4 lg:-mx-6">
              <ContactSection />
            </div>
          </ScrollReveal>
        </div>

        {/* Side column */}
        <div className="space-y-6">
          <ScrollReveal delay={0.2}>
            <div className="glass rounded-2xl p-6">
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-primary">Direct Channels</p>
              <div className="space-y-0">
                <div className="flex items-start gap-3 py-2 border-b border-border/20 last:border-0">
                  <span className="text-xs text-muted-foreground/60 w-20 shrink-0 mt-0.5">Email</span>
                  <span className="text-sm text-foreground">jootac@gmail.com</span>
                </div>
                <div className="flex items-start gap-3 py-2 border-b border-border/20 last:border-0">
                  <span className="text-xs text-muted-foreground/60 w-20 shrink-0 mt-0.5">GitHub</span>
                  <span className="text-sm text-foreground">@jootacee</span>
                </div>
                <div className="flex items-start gap-3 py-2 border-b border-border/20 last:border-0">
                  <span className="text-xs text-muted-foreground/60 w-20 shrink-0 mt-0.5">LinkedIn</span>
                  <span className="text-sm text-foreground">in/jootacee</span>
                </div>
                <div className="flex items-start gap-3 py-2 border-b border-border/20 last:border-0">
                  <span className="text-xs text-muted-foreground/60 w-20 shrink-0 mt-0.5">Twitter</span>
                  <span className="text-sm text-foreground">@jootacee</span>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.25}>
            <div className="glass rounded-2xl p-6">
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-primary">Timezone & Location</p>
              <div className="space-y-0">
                <div className="flex items-start gap-3 py-2 border-b border-border/20 last:border-0">
                  <span className="text-xs text-muted-foreground/60 w-20 shrink-0 mt-0.5">Zone</span>
                  <span className="text-sm text-foreground">UTC−5 / EST</span>
                </div>
                <div className="flex items-start gap-3 py-2 border-b border-border/20 last:border-0">
                  <span className="text-xs text-muted-foreground/60 w-20 shrink-0 mt-0.5">Region</span>
                  <span className="text-sm text-foreground">Americas</span>
                </div>
                <div className="flex items-start gap-3 py-2 border-b border-border/20 last:border-0">
                  <span className="text-xs text-muted-foreground/60 w-20 shrink-0 mt-0.5">Remote</span>
                  <span className="text-sm text-foreground">Available globally</span>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <div className="glass rounded-2xl p-6">
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-primary">Preferred Stack</p>
              <div className="flex flex-wrap gap-1.5">
                {['Next.js', 'React', 'Python', 'FastAPI', 'Docker', 'Claude API', 'MCP', 'Supabase', 'Vercel'].map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-border/50 bg-card/60 px-2 py-0.5 font-mono text-[9px] text-muted-foreground/70"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </DomainLayout>
  )
}
