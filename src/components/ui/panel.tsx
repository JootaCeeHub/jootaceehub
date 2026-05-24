import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface PanelProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'glass' | 'glass-strong'
}

export function Panel({ children, className, variant = 'default' }: PanelProps) {
  const variants = {
    default: 'bg-card border-border',
    glass: 'glass',
    'glass-strong': 'glass-strong',
  }

  return (
    <motion.div
      className={cn(
        'rounded-2xl border p-8',
        variants[variant],
        className
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  )
}

interface PanelHeaderProps {
  children: React.ReactNode
  className?: string
}

export function PanelHeader({ children, className }: PanelHeaderProps) {
  return <div className={cn('mb-6', className)}>{children}</div>
}

interface PanelTitleProps {
  children: React.ReactNode
  className?: string
}

export function PanelTitle({ children, className }: PanelTitleProps) {
  return (
    <h2 className={cn('text-3xl font-bold text-foreground gradient-text', className)}>
      {children}
    </h2>
  )
}

interface PanelSubtitleProps {
  children: React.ReactNode
  className?: string
}

export function PanelSubtitle({ children, className }: PanelSubtitleProps) {
  return (
    <p className={cn('text-lg text-muted-foreground mt-2', className)}>
      {children}
    </p>
  )
}

interface PanelContentProps {
  children: React.ReactNode
  className?: string
}

export function PanelContent({ children, className }: PanelContentProps) {
  return <div className={cn('', className)}>{children}</div>
}
