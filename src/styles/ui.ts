/**
 * Shared design tokens — use instead of per-component .styles.ts files.
 *
 * Import pattern:
 *   import { panel, stat, field, btn, filterChip, statusDot } from '@/styles/ui'
 *
 * For static strings use inline className.
 * For boolean/enum variants use the CVA helpers exported here.
 */

import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// ─── Re-export cn so callers only need one import ────────────────────────────
export { cn }

// ─── Panel shell ─────────────────────────────────────────────────────────────
export const panel = {
  root:     'space-y-5',
  label:    'font-mono text-[10px] uppercase tracking-[0.22em] text-primary/60',
  title:    'text-2xl font-semibold text-foreground',
  subtitle: 'mt-1 text-sm text-muted-foreground',
} as const

// ─── Stat card row ────────────────────────────────────────────────────────────
export const stat = {
  grid:  'grid grid-cols-4 gap-3',
  card:  'rounded-xl border border-border/40 bg-card/30 p-3 text-center',
  value: 'text-xl font-bold tabular-nums text-foreground',
  label: 'mt-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground/60',
} as const

// ─── Form fields ─────────────────────────────────────────────────────────────
export const field = {
  wrap:     'space-y-1',
  label:    'font-mono text-[9px] uppercase tracking-wider text-muted-foreground/50 mb-1',
  input:    'w-full rounded-xl border border-border/30 bg-background/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-primary/40 transition-colors',
  select:   'w-full rounded-xl border border-border/30 bg-background/60 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/40 transition-colors cursor-pointer',
  textarea: 'w-full rounded-xl border border-border/30 bg-background/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-primary/40 transition-colors resize-none',
} as const

// ─── Buttons ─────────────────────────────────────────────────────────────────
export const btn = {
  primary: 'rounded-xl bg-primary px-5 py-2 font-mono text-[10px] uppercase tracking-wider text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40',
  ghost:   'rounded-xl border border-border/30 bg-transparent px-5 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:border-border/60 transition-colors cursor-pointer',
  add:     'rounded-xl border border-primary/30 bg-primary/10 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-primary hover:bg-primary/20 transition-colors cursor-pointer',
  remove:  'rounded-lg border border-destructive/20 bg-destructive/8 px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-destructive hover:bg-destructive/15 transition-colors cursor-pointer',
  icon:    'rounded-lg border border-border/20 p-1.5 text-muted-foreground hover:border-border/50 hover:text-foreground transition-colors cursor-pointer',
} as const

// ─── Toolbar (search row) ─────────────────────────────────────────────────────
export const toolbar = {
  row:    'flex items-center gap-2',
  search: 'flex-1 rounded-xl border border-border/30 bg-card/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-primary/40 transition-colors',
  sort:   'rounded-xl border border-border/30 bg-card/30 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/30 transition-colors cursor-pointer',
} as const

// ─── Section header (title + action button row) ───────────────────────────────
export const section = {
  header: 'flex items-center justify-between',
  title:  'font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50',
} as const

// ─── Grid helpers ─────────────────────────────────────────────────────────────
export const grid = {
  two:   'grid grid-cols-2 gap-3',
  three: 'grid grid-cols-3 gap-3',
  four:  'grid grid-cols-4 gap-3',
} as const

// ─── Add form block ───────────────────────────────────────────────────────────
export const addForm = {
  wrap:   'rounded-2xl border border-primary/20 bg-card/40 p-4 space-y-3',
  title:  'font-mono text-[10px] uppercase tracking-[0.18em] text-primary/70 mb-2',
  btns:   'flex gap-2 pt-1',
} as const

// ─── Tab bar ─────────────────────────────────────────────────────────────────
export const tabRow = 'flex border-b border-border/30 mb-5'

// ─── Empty state ─────────────────────────────────────────────────────────────
export const empty = {
  wrap: 'rounded-2xl border border-dashed border-border/30 py-12 text-center',
  text: 'text-sm text-muted-foreground/50',
} as const

// ─── Toggle ──────────────────────────────────────────────────────────────────
export const toggle = {
  row:   'flex items-center justify-between gap-4',
  label: 'text-sm font-medium text-foreground',
} as const

// ─── CVA: filter chip ────────────────────────────────────────────────────────
export const filterChip = cva(
  'rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wider cursor-pointer transition-all',
  {
    variants: {
      active: {
        true:  'border-primary/40 bg-primary/15 text-primary',
        false: 'border-border/30 bg-card/20 text-muted-foreground hover:border-border/60',
      },
    },
    defaultVariants: { active: false },
  }
)
export type FilterChipProps = VariantProps<typeof filterChip>

// ─── CVA: status badge dot ───────────────────────────────────────────────────
export const statusDot = cva('rounded-full flex-shrink-0', {
  variants: {
    status: {
      operational: 'bg-emerald-400 ring-2 ring-emerald-400/30 ring-offset-1 ring-offset-background',
      running:     'bg-emerald-400 ring-2 ring-emerald-400/30 ring-offset-1 ring-offset-background',
      degraded:    'bg-amber-400   ring-2 ring-amber-400/30   ring-offset-1 ring-offset-background',
      maintenance: 'bg-sky-400     ring-2 ring-sky-400/30     ring-offset-1 ring-offset-background',
      offline:     'bg-red-400     ring-2 ring-red-400/30     ring-offset-1 ring-offset-background',
      stopped:     'bg-red-400     ring-2 ring-red-400/30     ring-offset-1 ring-offset-background',
      live:        'bg-emerald-400 ring-2 ring-emerald-400/30 ring-offset-1 ring-offset-background',
      beta:        'bg-amber-400   ring-2 ring-amber-400/30   ring-offset-1 ring-offset-background',
      rd:          'bg-sky-400     ring-2 ring-sky-400/30     ring-offset-1 ring-offset-background',
      roadmap:     'bg-muted-foreground/40 ring-2 ring-muted-foreground/10 ring-offset-1 ring-offset-background',
    },
    size: {
      sm: 'h-2   w-2',
      md: 'h-2.5 w-2.5',
      lg: 'h-3   w-3',
    },
  },
  defaultVariants: { size: 'md' },
})
export type StatusDotProps = VariantProps<typeof statusDot>

// ─── CVA: status select (inline <select> with colored border) ────────────────
export const statusSelectCva = cva(
  'rounded-lg border px-2 py-1 text-[10px] uppercase tracking-wider font-mono bg-transparent cursor-pointer outline-none transition-colors shrink-0',
  {
    variants: {
      status: {
        operational: 'border-emerald-400/25 text-emerald-400 bg-emerald-400/8',
        running:     'border-emerald-400/25 text-emerald-400 bg-emerald-400/8',
        degraded:    'border-amber-400/25   text-amber-400   bg-amber-400/8',
        maintenance: 'border-sky-400/25     text-sky-400     bg-sky-400/8',
        offline:     'border-red-400/25     text-red-400     bg-red-400/8',
        stopped:     'border-red-400/25     text-red-400     bg-red-400/8',
        live:        'border-emerald-400/25 text-emerald-400 bg-emerald-400/8',
        beta:        'border-amber-400/25   text-amber-400   bg-amber-400/8',
        rd:          'border-sky-400/25     text-sky-400     bg-sky-400/8',
        roadmap:     'border-border/25      text-muted-foreground bg-card/20',
        wip:         'border-amber-400/25   text-amber-400   bg-amber-400/8',
        archived:    'border-border/25      text-muted-foreground bg-card/20',
      },
    },
  }
)
export type StatusSelectProps = VariantProps<typeof statusSelectCva>

// ─── CVA: visibility button ───────────────────────────────────────────────────
export const visibilityBtn = cva(
  'rounded-lg border px-2 py-1 font-mono text-[9px] uppercase tracking-wider transition-colors cursor-pointer shrink-0',
  {
    variants: {
      visible: {
        true:  'border-primary/20 bg-primary/8 text-primary',
        false: 'border-border/20 bg-card/20 text-muted-foreground',
      },
    },
  }
)

// ─── CVA: card (with visible/hidden muted variant) ───────────────────────────
export const cardCva = cva(
  'rounded-2xl border bg-card/30 overflow-hidden transition-all',
  {
    variants: {
      muted: {
        true:  'border-border/20 opacity-60',
        false: 'border-border/40',
      },
    },
    defaultVariants: { muted: false },
  }
)

// ─── CVA: tab button ─────────────────────────────────────────────────────────
export const tabBtn = cva(
  'px-4 py-2 font-mono text-[10px] uppercase tracking-wider transition-colors cursor-pointer border-b-2',
  {
    variants: {
      active: {
        true:  'border-primary text-primary',
        false: 'border-transparent text-muted-foreground hover:text-foreground',
      },
    },
    defaultVariants: { active: false },
  }
)

// ─── Inline name/badge inputs (shared across manager panels) ──────────────────
export const inlineInput = {
  name:  'flex-1 rounded-lg border border-border/20 bg-background/40 px-2 py-1 text-sm font-semibold text-foreground focus:border-primary/40 focus:outline-none transition-colors',
  badge: 'w-24 rounded-lg border border-border/20 bg-background/40 px-2 py-1 font-mono text-[10px] uppercase text-muted-foreground focus:border-primary/30 focus:outline-none transition-colors',
  cell:  'w-full rounded-lg border border-border/20 bg-background/40 px-2 py-1 font-mono text-xs text-foreground focus:border-primary/30 focus:outline-none transition-colors',
} as const

// ─── Tag chips (tech stack, skills, etc.) ─────────────────────────────────────
export const tag = {
  list:   'flex flex-wrap gap-1.5',
  chip:   'group flex items-center gap-1 rounded-md border border-border/20 bg-card/20 px-2 py-0.5 font-mono text-[10px] text-foreground/60 hover:border-destructive/30 hover:text-destructive transition-colors cursor-pointer',
  chipX:  'opacity-0 group-hover:opacity-100 text-[8px] transition-opacity',
  addRow: 'flex gap-1 mt-1.5',
  input:  'flex-1 rounded-lg border border-border/20 bg-background/40 px-2 py-1 font-mono text-xs text-foreground placeholder:text-muted-foreground/30 focus:border-primary/30 focus:outline-none transition-colors',
  addBtn: 'rounded-lg border border-border/20 px-2 py-1 font-mono text-[10px] text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors cursor-pointer',
} as const

// ─── Deploy / timeline dot ────────────────────────────────────────────────────
export const deployDot = cva('rounded-full h-1.5 w-1.5 shrink-0', {
  variants: {
    status: {
      success: 'bg-emerald-400',
      pending: 'bg-amber-400',
      failed:  'bg-red-400',
    },
  },
})
