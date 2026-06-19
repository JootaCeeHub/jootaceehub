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
  | 'phase2'
  | 'phase3'
  | 'phase4'
  | 'phase5'
  | 'stabilization'
  | 'phase2cms'
  | 'phase3vps'
  | 'phase4admin'

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
