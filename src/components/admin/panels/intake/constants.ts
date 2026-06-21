import React from 'react'
import { Rocket, BookOpen, Link2, HardDrive, Rss, FlaskConical, GitBranch, Brain } from 'lucide-react'
import type {
  AdminPanel, EntryType,
  ProjectCategory, ProjectStatus, ResearchCategory,
  LinkCategory, DriveResourceType, TrackedSourceType, LabStatus,
  FeedCategory, FeedType, FeedPlan,
} from '@/lib/admin/types'

// ─── Field style tokens ───────────────────────────────────────────────────────

export const inputCls = 'w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 font-mono text-[11px] text-white/75 placeholder-white/20 outline-none transition-all focus:border-white/25 focus:bg-white/[0.06]'
export const textareaCls = 'w-full resize-none rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 font-mono text-[11px] text-white/75 placeholder-white/20 outline-none transition-all focus:border-white/25 focus:bg-white/[0.06]'
export const selectCls = 'w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 font-mono text-[11px] text-white/75 outline-none transition-all focus:border-white/25 appearance-none cursor-pointer'
export const fieldGroupCls = 'space-y-1'
export const fieldLabelCls = 'block font-mono text-[9px] uppercase tracking-[0.16em] text-white/40'
export const twoColCls = 'grid grid-cols-1 gap-3 sm:grid-cols-2'

// ─── Entry type definitions ───────────────────────────────────────────────────

export const ENTRY_TYPES: {
  id:          EntryType
  label:       string
  desc:        string
  icon:        React.ComponentType<{ className?: string }>
  color:       string
  targetPanel: AdminPanel
}[] = [
  { id: 'project',         label: 'Project',           desc: 'Portfolio & case studies',     icon: Rocket,        color: '#a78bfa', targetPanel: 'projects'     },
  { id: 'research',        label: 'Article',           desc: 'Research, essays & news',      icon: BookOpen,      color: '#34d399', targetPanel: 'research'     },
  { id: 'resource',        label: 'Resource Link',     desc: 'Tools, repos & curated links', icon: Link2,         color: '#38bdf8', targetPanel: 'intelligence' },
  { id: 'drive',           label: 'Drive File',        desc: 'Agent files, prompts & MCP',   icon: HardDrive,     color: '#fb923c', targetPanel: 'intelligence' },
  { id: 'source',          label: 'Tracked Source',    desc: 'Newsletters, blogs & feeds',   icon: Rss,           color: '#f472b6', targetPanel: 'intelligence' },
  { id: 'lab',             label: 'Lab Entry',         desc: 'Experiments & demos',          icon: FlaskConical,  color: '#f59e0b', targetPanel: 'labs'         },
  { id: 'github-showcase', label: 'GitHub Showcase',   desc: 'Showcase a repo with AI',      icon: GitBranch,     color: '#6ee7b7', targetPanel: 'showcase'     },
  { id: 'intel-source',    label: 'Intelligence Feed', desc: 'Data feeds & API sources',     icon: Brain,         color: '#c084fc', targetPanel: 'intelligence' },
]

// ─── Form defaults ────────────────────────────────────────────────────────────

export function makeDefaults() {
  return {
    title:            '',
    tagline:          '',
    description:      '',
    tags:             '',
    published:        false,
    featured:         false,
    projectCategory:  'ai'       as ProjectCategory,
    projectStatus:    'wip'      as ProjectStatus,
    techStack:        '',
    repoUrl:          '',
    liveUrl:          '',
    accent:           '#a78bfa',
    researchCategory: 'research' as ResearchCategory,
    excerpt:          '',
    externalUrl:      '',
    readTime:         5,
    body:             '',
    url:              '',
    linkCategory:     'tools'    as LinkCategory,
    driveUrl:         '',
    resourceType:     'prompt'   as DriveResourceType,
    sourceType:       'blog'     as TrackedSourceType,
    active:           true,
    labKey:           '',
    labStatus:        'rd'       as LabStatus,
    stack:            '',
    labAccent:        '#f59e0b',
    labVisible:       true,
    feedCategory:     'tech'     as FeedCategory,
    feedType:         'rss'      as FeedType,
    feedPlan:         'free'     as FeedPlan,
    feedIcon:         '📡',
    feedColor:        '#c084fc',
    feedDocsUrl:      '',
    feedApiKey:       '',
  }
}

export type IntakeForm = ReturnType<typeof makeDefaults>

// ─── Utilities ────────────────────────────────────────────────────────────────

export function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function uid(): string {
  return crypto.randomUUID()
}

export function extractDomain(url: string): string {
  try { return new URL(url).hostname } catch { return url }
}

export function parseTags(raw: string): string[] {
  return raw.split(',').map(t => t.trim()).filter(Boolean)
}
