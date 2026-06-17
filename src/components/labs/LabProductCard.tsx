'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HoverCard3D } from '@/components/shared/HoverCard3D'

interface LabProductCardProps {
  title: string
  subtitle: string
  description: string
  status: string
  badge: string
  stack: string[]
  href: string
}

export function LabProductCard({
  title,
  subtitle,
  description,
  status,
  badge,
  stack,
  href,
}: LabProductCardProps) {
  return (
    <HoverCard3D intensity={6}>
      <Link prefetch={false} href={href}>
        <div className="group relative flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/40 p-6 transition-all duration-300 hover:border-primary/30 hover:bg-card/70 hover:shadow-lg hover:shadow-primary/5">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/60">{badge}</span>
              <h3 className="text-lg font-semibold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
            <span
              className={cn(
                'rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em]',
                status === 'Active' || status === 'Operational'
                  ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                  : status === 'Beta'
                    ? 'border border-amber-500/30 bg-amber-500/10 text-amber-400'
                    : 'border border-border bg-muted/50 text-muted-foreground'
              )}
            >
              {status}
            </span>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>

          <div className="flex flex-wrap gap-1.5">
            {stack.map((tech) => (
              <span key={tech} className="rounded-md border border-border/60 bg-secondary/60 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                {tech}
              </span>
            ))}
          </div>

          <div className="mt-auto flex items-center justify-between pt-2">
            <span className="flex items-center gap-1.5 text-sm font-medium text-primary transition-transform duration-200 group-hover:translate-x-0.5">
              Open Lab <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </Link>
    </HoverCard3D>
  )
}
