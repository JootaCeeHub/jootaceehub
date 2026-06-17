'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useLocale } from '@/lib/i18n/context'
import type { DomainItem } from '@/lib/config/domains'

interface MegaNavProps {
  domain: DomainItem
  accentColor?: string
  onClose: () => void
}

export function MegaNav({ domain, accentColor = '#6366f1', onClose }: MegaNavProps) {
  const locale = useLocale()
  const pathname = usePathname()
  const lp = (path: string) => `/${locale}${path}`

  if (!domain.children?.length) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -6, scale: 0.97, filter: 'blur(4px)' }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="absolute left-1/2 top-full mt-3 -translate-x-1/2 z-50 glass-strong rounded-2xl border border-border/60 shadow-2xl shadow-black/40 overflow-hidden min-w-[480px]"
      style={{ borderTopColor: `${accentColor}40` }}
      onMouseLeave={onClose}
    >
      {/* Domain accent top line */}
      <div
        className="h-px w-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${accentColor}70, transparent)`,
        }}
      />

      <div className="px-5 pt-4 pb-3 border-b border-border/40">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">{domain.description}</p>
        <p className="mt-0.5 text-sm font-medium text-foreground">{domain.label}</p>
      </div>

      <div className={cn('grid gap-1 p-3', domain.children.length <= 4 ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-3')}>
        {domain.children.map((child) => {
          const isActive = pathname.startsWith(lp(child.href))
          return (
            <Link
              key={child.key}
              href={lp(child.href)}
              prefetch={false}
              onClick={onClose}
              className={cn(
                'spotlight-card group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 border cursor-pointer',
                isActive
                  ? 'text-foreground border-transparent bg-white/5'
                  : 'text-muted-foreground border-transparent hover:bg-white/5 hover:text-foreground'
              )}
              style={
                isActive
                  ? {
                      background: `${accentColor}12`,
                      borderColor: `${accentColor}28`,
                    }
                  : undefined
              }
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect()
                e.currentTarget.style.setProperty('--mouse-x', `${((e.clientX - r.left) / r.width) * 100}%`)
                e.currentTarget.style.setProperty('--mouse-y', `${((e.clientY - r.top) / r.height) * 100}%`)
                e.currentTarget.style.setProperty('--spotlight-color', `${accentColor}0a`)
              }}
            >
              <span
                className={cn(
                  'mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full transition-colors duration-200',
                  isActive ? '' : 'bg-border group-hover:bg-primary/60'
                )}
                style={isActive ? { background: accentColor } : undefined}
              />
              <span className="min-w-0">
                <span className="text-[13px] font-medium leading-tight">{child.label}</span>
                <span className="block mt-0.5 text-[11px] leading-snug opacity-60">{child.description}</span>
              </span>
            </Link>
          )
        })}
      </div>

      <div className="border-t border-border/40 px-5 py-2.5 flex items-center justify-between">
        <Link prefetch={false} href={lp(domain.href)} onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-150">
          View all {domain.label.toLowerCase()}
        </Link>
        <span className="text-xs opacity-60" style={{ color: accentColor }}>
          →
        </span>
      </div>
    </motion.div>
  )
}
