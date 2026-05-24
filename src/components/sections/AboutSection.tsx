'use client'

import { motion } from 'framer-motion'
import { Brain, Network, Zap, Cpu, Target, Rocket } from 'lucide-react'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { ScrollReveal, StaggerReveal } from '@/components/shared/ScrollReveal'
import { HoverCard3D } from '@/components/shared/HoverCard3D'
import { useTranslations } from '@/lib/i18n/context'

const focusIcons = [
  Brain,
  Network,
  Zap,
  Cpu,
  Target,
  Rocket,
]

interface FocusAreaData {
  title: string
  description: string
}

export function AboutSection() {
  const t = useTranslations('about')
  const focusAreas = (t('focusAreas') as unknown as FocusAreaData[]) || []

  return (
    <section id="about" className="relative py-24">
      <div className="container mx-auto px-6">
        <SectionHeader
          badge={t('badge') as string}
          title={t('aboutTitle') as string}
          description={t('aboutDescription') as string}
        />

        <ScrollReveal>
          <div className="glass-strong mb-10 rounded-3xl p-8 md:p-10">
            <p className="text-lg leading-relaxed text-muted-foreground">
              {t('narrative') as string}
            </p>
          </div>
        </ScrollReveal>

        <StaggerReveal className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.isArray(focusAreas) && focusAreas.map((area, i) => {
            const Icon = focusIcons[i]
            if (!Icon) return null
            return (
              <HoverCard3D key={area.title} intensity={6}>
                <article className="glass rounded-2xl p-6 h-full">
                  <div className="mb-4 inline-flex rounded-lg border border-primary/30 bg-primary/10 p-2.5">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{area.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{area.description}</p>
                </article>
              </HoverCard3D>
            )
          })}
        </StaggerReveal>
      </div>
    </section>
  )
}
