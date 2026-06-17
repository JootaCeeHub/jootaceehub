'use client'

import { useState, useMemo } from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import { useAdmin } from '@/lib/admin/store'
import type { ProjectEntry, ProjectStatus, ProjectCategory } from '@/lib/admin/types'
import { cn } from '@/lib/utils'
import { uid, now, QUICK_CATEGORIES } from './constants'
import { ProjectEditor } from './ProjectEditor'
import { AddProjectForm } from './AddProjectForm'

type SortBy = 'newest' | 'oldest' | 'title' | 'status'

export function ProjectsListTab() {
  const { state, dispatch } = useAdmin()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<ProjectCategory | 'all'>('all')
  const [sortBy, setSortBy] = useState<SortBy>('newest')
  const allProjects = state.projectsRegistry

  const projects = useMemo(() => {
    let list = allProjects
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((p) =>
        p.title.toLowerCase().includes(q) || p.tagline.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) || p.techStack.some((t) => t.toLowerCase().includes(q)) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      )
    }
    if (statusFilter !== 'all') list = list.filter((p) => p.status === statusFilter)
    if (categoryFilter !== 'all') list = list.filter((p) => p.category === categoryFilter)
    return [...list].sort((a, b) => {
      if (sortBy === 'title')  return a.title.localeCompare(b.title)
      if (sortBy === 'status') return a.status.localeCompare(b.status)
      if (sortBy === 'oldest') return a.createdAt.localeCompare(b.createdAt)
      return b.createdAt.localeCompare(a.createdAt)
    })
  }, [allProjects, search, statusFilter, categoryFilter, sortBy])

  const live      = allProjects.filter((p) => p.status === 'live').length
  const published = allProjects.filter((p) => p.published).length
  const featured  = allProjects.filter((p) => p.featured).length

  const statusColorMap: Record<string, string> = {
    live:     'border-emerald-400/25 text-emerald-400 bg-emerald-400/8',
    beta:     'border-blue-400/25 text-blue-400 bg-blue-400/8',
    wip:      'border-amber-400/25 text-amber-400 bg-amber-400/8',
    archived: 'border-white/15 text-white/30 bg-white/4',
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Total',     value: allProjects.length, color: '#a78bfa' },
          { label: 'Published', value: published,          color: '#34d399' },
          { label: 'Live',      value: live,               color: '#22d3ee' },
          { label: 'Featured',  value: featured,           color: '#f472b6' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-white/8 bg-white/[0.025] px-3 py-2.5 text-center">
            <div className="text-[15px] font-semibold tabular-nums" style={{ color: stat.color }}>{stat.value}</div>
            <div className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.14em] text-white/25">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Search + sort */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Search projects…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white/70 placeholder:text-white/20 outline-none focus:border-violet-400/30 transition-colors"
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)} className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-[11px] text-white/50 outline-none focus:border-violet-400/25 transition-colors cursor-pointer">
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="title">Title A–Z</option>
          <option value="status">Status</option>
        </select>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-1.5">
        {(['all', 'live', 'beta', 'wip', 'archived'] as const).map((v) => (
          <button key={v} onClick={() => setStatusFilter(v)} className={cn(
            'rounded-full border px-3 py-1 font-mono text-[9px] uppercase tracking-wider cursor-pointer transition-all',
            statusFilter === v ? 'border-violet-400/40 bg-violet-400/15 text-violet-400' : 'border-white/10 bg-white/[0.02] text-white/30 hover:border-white/20'
          )}>
            {v === 'all' ? 'All Status' : v}
          </button>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-1.5">
        {(['all', 'ai', 'web', 'automation', 'infrastructure', 'tool', 'research', 'other'] as const).map((v) => (
          <button key={v} onClick={() => setCategoryFilter(v)} className={cn(
            'rounded-full border px-3 py-1 font-mono text-[9px] uppercase tracking-wider cursor-pointer transition-all',
            categoryFilter === v ? 'border-violet-400/40 bg-violet-400/15 text-violet-400' : 'border-white/10 bg-white/[0.02] text-white/30 hover:border-white/20'
          )}>
            {v === 'all' ? 'All Categories' : v}
          </button>
        ))}
      </div>

      {/* Project list */}
      <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/8 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-violet-400 shrink-0" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 flex-1">Portfolio</span>
            <span className="font-mono text-[9px] text-white/25">
              {projects.length}{projects.length !== allProjects.length ? ` / ${allProjects.length}` : ''} projects
            </span>
          </div>
          <button
            onClick={() => setShowAdd((v) => !v)}
            className="flex items-center gap-1 rounded-lg border border-violet-400/25 bg-violet-400/8 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-violet-400/70 hover:bg-violet-400/15 transition-colors"
          >
            <Plus size={10} />
            Add
          </button>
        </div>

        <div className="p-3 space-y-1.5">
          {showAdd && <AddProjectForm onClose={() => setShowAdd(false)} />}

          {projects.length === 0 && !showAdd && (
            <div className="px-4 py-8 text-center space-y-2">
              <div className="text-3xl mx-auto opacity-20">🚀</div>
              <div className="font-mono text-[11px] text-white/20">
                {search || statusFilter !== 'all' || categoryFilter !== 'all'
                  ? 'No projects match the current filters.'
                  : 'No projects yet. Add your first one.'}
              </div>
            </div>
          )}

          {projects.map((project) => {
            const isExpanded = expanded === project.id
            return (
              <div key={project.id} className={cn(
                'rounded-lg border overflow-hidden transition-colors',
                project.featured ? 'border-violet-400/20 bg-violet-400/[0.03]' : 'border-white/8 bg-white/[0.01]'
              )}>
                <button className="flex items-center justify-between gap-2 w-full px-3 py-2.5 text-left" onClick={() => setExpanded(isExpanded ? null : project.id)}>
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ background: project.accent }} />
                    <div className="min-w-0">
                      <div className="font-medium text-[12px] text-white/75 truncate">{project.title}</div>
                      <div className="font-mono text-[9px] text-white/30 truncate">{project.tagline}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {project.featured && <span className="font-mono text-[9px] text-violet-400/70">★</span>}
                    <span className="font-mono text-[9px] text-white/30">{project.category}</span>
                    <span className={cn('rounded border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider', statusColorMap[project.status] ?? statusColorMap.archived)}>{project.status}</span>
                    <ChevronDown size={12} className={`text-white/25 transition-transform duration-150 ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                {isExpanded && <ProjectEditor project={project} />}
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick category templates */}
      <div className="rounded-xl border border-white/6 bg-white/[0.015] p-4">
        <div className="mb-2.5 font-mono text-[9px] uppercase tracking-[0.18em] text-white/25">Quick Add by Category</div>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_CATEGORIES.map((cat) => (
            <button
              key={cat.category}
              className="rounded-md border border-white/10 bg-white/4 px-2.5 py-1 font-mono text-[10px] text-white/40 hover:border-violet-400/25 hover:text-violet-400/70 transition-colors cursor-pointer"
              onClick={() => {
                const entry: ProjectEntry = {
                  id: uid(), slug: 'new-' + cat.category + '-project',
                  title: 'New ' + cat.label + ' Project', tagline: '',
                  category: cat.category, status: 'wip', featured: false, published: false,
                  description: '', techStack: [], tags: [], screenshots: [],
                  createdAt: now(), updatedAt: now(),
                  relatedResearch: [], relatedResources: [], accent: cat.accent,
                }
                dispatch({ type: 'ADD_PROJECT', payload: entry })
                setExpanded(entry.id)
              }}
            >
              + {cat.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
