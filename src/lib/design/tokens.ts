/**
 * Single source of truth for runtime-configurable design tokens.
 *
 * Imported by:
 *   - src/components/shared/ThemeApplicator.tsx  (applies at runtime via CSS vars)
 *   - src/lib/config/theme-init.ts               (serialized to blocking <script>)
 *
 * RULE: src/styles/ui.ts (static CVA primitives) must NOT import from here.
 * See ADR-005 for the two-layer token architecture.
 */

export type PaletteId = 'ocean' | 'emerald' | 'amber' | 'rose' | 'violet' | 'slate'

export const PALETTE_VAR_NAMES = [
  '--primary',
  '--primary-foreground',
  '--accent',
  '--accent-foreground',
  '--ring',
  '--glow',
  '--glow-secondary',
] as const

export const PALETTE_VARS: Record<PaletteId, Record<string, string>> = {
  ocean: {
    '--primary':            '#0ea5e9',
    '--primary-foreground': '#ffffff',
    '--accent':             '#7dd3fc',
    '--accent-foreground':  '#03111e',
    '--ring':               '#38bdf8',
    '--glow':               '#0ea5e9',
    '--glow-secondary':     '#7dd3fc',
  },
  emerald: {
    '--primary':            '#059669',
    '--primary-foreground': '#ffffff',
    '--accent':             '#6ee7b7',
    '--accent-foreground':  '#03111e',
    '--ring':               '#10b981',
    '--glow':               '#059669',
    '--glow-secondary':     '#6ee7b7',
  },
  amber: {
    '--primary':            '#d97706',
    '--primary-foreground': '#ffffff',
    '--accent':             '#fcd34d',
    '--accent-foreground':  '#03111e',
    '--ring':               '#f59e0b',
    '--glow':               '#d97706',
    '--glow-secondary':     '#fcd34d',
  },
  rose: {
    '--primary':            '#e11d48',
    '--primary-foreground': '#ffffff',
    '--accent':             '#fb7185',
    '--accent-foreground':  '#ffffff',
    '--ring':               '#f43f5e',
    '--glow':               '#e11d48',
    '--glow-secondary':     '#fb7185',
  },
  violet: {
    '--primary':            '#7c3aed',
    '--primary-foreground': '#ffffff',
    '--accent':             '#a78bfa',
    '--accent-foreground':  '#ffffff',
    '--ring':               '#8b5cf6',
    '--glow':               '#7c3aed',
    '--glow-secondary':     '#a78bfa',
  },
  slate: {
    '--primary':            '#475569',
    '--primary-foreground': '#ffffff',
    '--accent':             '#94a3b8',
    '--accent-foreground':  '#0c1526',
    '--ring':               '#64748b',
    '--glow':               '#475569',
    '--glow-secondary':     '#94a3b8',
  },
}

export const SHADER_GRADS: Record<string, [string, string, string, string]> = {
  'cosmic-blue':  ['rgb(59 130 246/22%)',  'rgb(34 197 94/13%)',   'rgb(6 182 212/15%)',  'rgb(139 92 246/5%)'],
  'aurora-night': ['rgb(20 184 166/18%)',  'rgb(5 150 105/12%)',   'rgb(34 197 94/14%)',  'rgb(6 182 212/6%)'],
  'nebula':       ['rgb(139 92 246/22%)',  'rgb(124 58 237/12%)',  'rgb(192 132 252/15%)','rgb(99 102 241/5%)'],
  'cyber-ocean':  ['rgb(6 182 212/22%)',   'rgb(14 165 233/13%)',  'rgb(56 189 248/15%)', 'rgb(34 211 238/5%)'],
  'solar-flare':  ['rgb(234 88 12/22%)',   'rgb(245 158 11/13%)',  'rgb(252 211 77/15%)', 'rgb(239 68 68/5%)'],
  'deep-rose':    ['rgb(225 29 72/22%)',   'rgb(244 63 94/13%)',   'rgb(251 113 133/15%)','rgb(192 38 211/5%)'],
  'void':         ['rgb(30 30 50/15%)',    'rgb(20 20 40/10%)',    'rgb(15 15 35/12%)',   'rgb(10 10 25/4%)'],
  'forest-data':  ['rgb(22 163 74/22%)',   'rgb(5 150 105/13%)',   'rgb(34 197 94/15%)',  'rgb(16 185 129/5%)'],
}

export const CONTAINER_WIDTHS: Record<string, string> = {
  sm: '640px', md: '768px', lg: '1024px', xl: '1280px', full: '100%',
}

export const SECTION_PADDINGS: Record<string, string> = {
  compact: '3rem', normal: '5rem', spacious: '8rem',
}

export const RADIUS_VALUES: Record<string, string> = {
  none: '0px', sm: '4px', md: '8px', lg: '12px', xl: '16px', '2xl': '24px', full: '9999px',
}

export const ANIM_DURATIONS: Record<string, string> = {
  instant: '0ms', fast: '150ms', normal: '300ms', slow: '600ms',
}

export const FONT_FAMILIES: Record<string, string> = {
  system:  'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  modern:  'var(--font-inter), "Avenir Next", "SF Pro Display", sans-serif',
  classic: 'Georgia, "Times New Roman", "Palatino Linotype", serif',
  mono:    'var(--font-jetbrains-mono), "IBM Plex Mono", "SF Mono", monospace',
}

export const FONT_SIZE_SCALES: Record<string, string> = {
  xs: '12px', sm: '14px', md: '16px', lg: '18px', xl: '20px',
}

export const SHADOW_INTENSITIES: Record<string, string> = {
  none: '0', subtle: '0.6', normal: '1', dramatic: '1.8',
}

export const GLOW_INTENSITIES: Record<string, string> = {
  off: '0', subtle: '0.5', normal: '1', vivid: '1.8',
}

export const BUTTON_RADIUS: Record<string, string> = {
  sharp: '0px', rounded: '8px', pill: '9999px',
}

export const GLASS_BLUR: Record<string, string> = {
  none: '0px', sm: '8px', md: '20px', lg: '32px', xl: '48px',
}

export const GLASS_OPACITY: Record<string, string> = {
  ghost: '0.3', light: '0.6', normal: '1', heavy: '1.2', solid: '1.5',
}

export const GLASS_BORDER_OPACITY: Record<string, string> = {
  none: '0', subtle: '0.5', normal: '1', strong: '1.8',
}
