export type Tab =
  | 'overview'
  | 'performance'
  | 'seo'
  | 'accessibility'
  | 'bundle'
  | 'tracking'
  | 'program'
  | 'project'
  | 'errors'
  | 'history'
  | 'insights'
  | 'global'
  | 'audit'
  // Legacy phase tabs — kept for backward compat but hidden in UI
  | 'phase1'
  | 'phase2'
  | 'phase3'
  | 'phase4'
  | 'phase5'
  | 'stabilization'
  | 'phase2cms'
  | 'phase3cms'
  | 'phase3vps'
  | 'phase4admin'
  | 'phase4perf'
  | 'phase5supabase'
  | 'phase5launch'

export type CWVStatus = 'good' | 'needs-improvement' | 'poor'

export interface CWVMetric {
  abbr: string
  name: string
  value: string
  unit: string
  status: CWVStatus
  threshold: string
  hint: string
  fix: string
}

export type Priority = 'high' | 'medium' | 'low'

export interface Rec {
  priority: Priority
  category: string
  title: string
  desc: string
  code?: string
}

export interface ChangeEntry {
  timestamp: string
  what: string
}
