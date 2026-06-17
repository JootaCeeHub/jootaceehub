'use client'

import { Brain, Network, Zap, Cpu, Target, Rocket } from 'lucide-react'
import { DomainLayout } from '@/components/layout/DomainLayout'
import { DomainBreadcrumb } from '@/components/layout/DomainBreadcrumb'
import { ScrollReveal, StaggerReveal } from '@/components/shared/ScrollReveal'
import { HoverCard3D } from '@/components/shared/HoverCard3D'
import { useTranslations } from '@/lib/i18n/context'
const FOCUS_ICONS = [Brain, Network, Zap, Cpu, Target, Rocket]

interface FocusArea { title: string; description: string }
interface TimelineItem { year: string; label: string; description: string }

export default function AboutPage() {
  const t = useTranslations('about')

  const focusAreas = Array.isArray(t('focusAreas'))
    ? (t('focusAreas') as unknown as FocusArea[])
    : []
  const timeline = Array.isArray(t('timeline'))
    ? (t('timeline') as unknown as TimelineItem[])
    : []
  const specializations = Array.isArray(t('specializations'))
    ? (t('specializations') as unknown as string[])
    : []

  return (
    <DomainLayout>
      <header className="mb-16">
        <DomainBreadcrumb />
        <span className={`mt-6 block mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.22em] text-primary`}>
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          {t('domainBadge') as string}
        </span>
        <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
          <span className="gradient-text">{t('title') as string}.</span>
        </h1>
        <p className="mt-6 max-w-3xl text-xl text-muted-foreground leading-relaxed">{t('domainDescription') as string}</p>
      </header>

      <div className="grid gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-12">
          <ScrollReveal>
            <section>
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-primary">{t('sectionNarrative') as string}</p>
              <p className="text-base text-muted-foreground leading-loose">{t('narrative') as string}</p>
              <p className={`mt-4 text-base text-muted-foreground leading-loose`}>{t('narrativePart2') as string}</p>
            </section>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <section>
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-primary">{t('sectionFocusAreas') as string}</p>
              <StaggerReveal className="grid gap-4 sm:grid-cols-2">
                {focusAreas.map((area, i) => {
                  const Icon = FOCUS_ICONS[i] ?? Brain
                  return (
                    <HoverCard3D key={area.title} intensity={4}>
                      <article className="rounded-2xl border border-border/60 bg-card/40 p-5">
                        <Icon className="mb-3 h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-foreground">{area.title}</h3>
                        <p className="mt-2 text-sm text-muted-foreground">{area.description}</p>
                      </article>
                    </HoverCard3D>
                  )
                })}
              </StaggerReveal>
            </section>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <section>
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-primary">{t('sectionSelectedWork') as string}</p>
              <div className="relative space-y-6 border-l border-border/60 pl-6">
                {timeline.map((item, i) => (
                  <div key={i} className="">
                    <span className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full border-2 border-background bg-primary" />
                    <div>
                      <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground/60">{item.year}</span>
                      <p className="mt-0.5 font-medium text-foreground">{item.label}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </ScrollReveal>
        </div>

        <div className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-primary">{t('sectionSpecializations') as string}</p>
            <div className="space-y-2">
              {specializations.map((spec) => (
                <div key={spec} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="h-1 w-1 rounded-full bg-primary/60" />
                  {spec}
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-primary">{t('sectionContact') as string}</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{t('contactEmail') as string}</span>
                <span>contact@jootacee.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{t('contactDomain') as string}</span>
                <span>jootacee.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DomainLayout>
  )
}
