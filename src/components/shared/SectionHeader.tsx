import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  badge?: string
  title: string
  description: string
  className?: string
}

export function SectionHeader({ badge, title, description, className }: SectionHeaderProps) {
  return (
    <div className={cn('mx-auto mb-14 max-w-3xl text-center', className)}>
      {badge ? (
        <span className="mb-4 inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-primary">
          {badge}
        </span>
      ) : null}
      <h2 className="text-balance text-4xl font-semibold leading-tight md:text-5xl gradient-text">{title}</h2>
      <p className="mt-4 text-pretty text-lg text-muted-foreground md:text-xl">{description}</p>
    </div>
  )
}
