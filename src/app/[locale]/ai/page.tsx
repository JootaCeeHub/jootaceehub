'use client'

import { DomainLayout } from '@/components/layout/DomainLayout'
import { DomainBreadcrumb } from '@/components/layout/DomainBreadcrumb'
import { LocaleLink } from '@/lib/i18n/link'
import { useTranslations } from '@/lib/i18n/context'
import { Brain, Zap, GitBranch, Cpu, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const HUB_SECTIONS = [
  {
    key: 'labs',
    href: '/labs',
    icon: Zap,
    color: '#a78bfa',
    border: 'border-violet-500/20',
    bg: 'bg-violet-500/5 hover:bg-violet-500/10',
  },
  {
    key: 'intelligence',
    href: '/intelligence',
    icon: Brain,
    color: '#34d399',
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/5 hover:bg-emerald-500/10',
  },
  {
    key: 'agents',
    href: '/resources/agents',
    icon: GitBranch,
    color: '#f472b6',
    border: 'border-pink-500/20',
    bg: 'bg-pink-500/5 hover:bg-pink-500/10',
  },
  {
    key: 'systems',
    href: '/systems',
    icon: Cpu,
    color: '#38bdf8',
    border: 'border-sky-500/20',
    bg: 'bg-sky-500/5 hover:bg-sky-500/10',
  },
]

export default function AIHubPage() {
  const t = useTranslations('ai')

  return (
    <DomainLayout>
      <div className="mx-auto max-w-4xl space-y-10 px-4 py-12">
        <DomainBreadcrumb />

        {/* Header */}
        <div className="space-y-3">
          <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-cyan-400/60">
            {t('badge') as string}
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white/90">
            {t('title') as string}
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-white/45">
            {t('description') as string}
          </p>
        </div>

        {/* Hub grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {HUB_SECTIONS.map((section) => {
            const Icon = section.icon
            const label  = t(`sections.${section.key}.label`) as string
            const desc   = t(`sections.${section.key}.description`) as string
            return (
              <LocaleLink
                key={section.key}
                href={section.href}
                className={cn(
                  'group flex flex-col gap-3 rounded-2xl border p-6 transition-all',
                  section.border, section.bg
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/8 bg-black/20">
                    <Icon className="h-4 w-4" style={{ color: section.color }} />
                  </div>
                  <ArrowRight className="h-4 w-4 text-white/20 transition-colors group-hover:text-white/50" />
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-white/80">{label}</div>
                  <p className="mt-1 text-[11px] leading-relaxed text-white/40">{desc}</p>
                </div>
              </LocaleLink>
            )
          })}
        </div>
      </div>
    </DomainLayout>
  )
}
