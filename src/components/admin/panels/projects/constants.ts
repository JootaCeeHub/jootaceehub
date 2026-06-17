import type { ProjectStatus, ProjectCategory } from '@/lib/admin/types'

export function uid() { return 'proj-' + Math.random().toString(36).slice(2, 10) }
export function now() { return new Date().toISOString() }

export const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'live',     label: 'Live'     },
  { value: 'beta',     label: 'Beta'     },
  { value: 'wip',      label: 'WIP'      },
  { value: 'archived', label: 'Archived' },
]

export const CATEGORY_OPTIONS: { value: ProjectCategory; label: string }[] = [
  { value: 'ai',             label: 'AI / ML'        },
  { value: 'web',            label: 'Web App'         },
  { value: 'automation',     label: 'Automation'      },
  { value: 'infrastructure', label: 'Infrastructure'  },
  { value: 'tool',           label: 'Tool'            },
  { value: 'research',       label: 'Research'        },
  { value: 'other',          label: 'Other'           },
]

export const QUICK_CATEGORIES: { label: string; category: ProjectCategory; accent: string }[] = [
  { label: 'AI / ML',        category: 'ai',             accent: '#a78bfa' },
  { label: 'Web App',        category: 'web',            accent: '#34d399' },
  { label: 'Automation',     category: 'automation',     accent: '#fb923c' },
  { label: 'Infrastructure', category: 'infrastructure', accent: '#6ee7b7' },
  { label: 'Tool',           category: 'tool',           accent: '#38bdf8' },
  { label: 'Research',       category: 'research',       accent: '#f472b6' },
]
