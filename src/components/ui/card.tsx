import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'glass' | 'glow'
  hover?: boolean
}

export function Card({ children, className, variant = 'default', hover = true }: CardProps) {
  const variants = {
    default: 'bg-card border-border',
    glass: 'glass',
    glow: 'glass glow',
  }

  return (
    <motion.article
      className={cn(
        'rounded-2xl border p-6',
        variants[variant],
        hover && 'transition duration-300 hover:-translate-y-1 hover:border-primary/40',
        className
      )}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      whileHover={hover ? { rotateX: 2, rotateY: -2 } : undefined}
      transition={{ duration: 0.35 }}
    >
      {children}
    </motion.article>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mb-4', className)}>{children}</div>
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn('text-xl font-semibold text-foreground', className)}>{children}</h3>
}

export function CardDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn('text-sm text-muted-foreground', className)}>{children}</p>
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('', className)}>{children}</div>
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mt-4 border-t border-border pt-4', className)}>{children}</div>
}
