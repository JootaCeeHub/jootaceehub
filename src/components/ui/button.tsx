import React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

const base = 'inline-flex items-center justify-center font-medium transition-all duration-300'
const focus = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
const disabled = 'disabled:cursor-not-allowed disabled:opacity-50'

const variantClass = {
  primary: 'text-[var(--btn-text,var(--primary-foreground,#03111e))] hover:brightness-[var(--btn-hover-brightness,1.1)]',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  ghost: 'text-foreground hover:bg-white/8',
  outline: 'border border-border bg-transparent text-foreground hover:border-primary/40 hover:bg-primary/10',
} as const

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
} as const

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'whileHover' | 'whileTap'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', style, children, ...props }, ref) => {
    const isPrimary = variant === 'primary'
    return (
      <motion.button
        ref={ref}
        className={cn(base, focus, disabled, variantClass[variant], sizes[size], className)}
        style={{
          borderRadius: 'var(--radius-button, 9999px)',
          ...(isPrimary ? {
            background: 'var(--btn-bg, linear-gradient(to right, var(--btn-gradient-from, #7dd3fc), var(--btn-gradient-to, #a5f3fc)))',
            boxShadow: '0 12px 32px color-mix(in srgb, var(--glow) 24%, transparent)',
          } : {}),
          ...style,
        }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        {children}
      </motion.button>
    )
  },
)

Button.displayName = 'Button'
