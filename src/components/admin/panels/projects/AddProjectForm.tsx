'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useAdmin } from '@/lib/admin/store'
import type { ProjectEntry, ProjectStatus, ProjectCategory } from '@/lib/admin/types'
import { uid, now, CATEGORY_OPTIONS, STATUS_OPTIONS } from './constants'

interface Props {
  onClose: () => void
}

export function AddProjectForm({ onClose }: Props) {
  const { dispatch } = useAdmin()
  const [title, setTitle] = useState('')
  const [tagline, setTagline] = useState('')
  const [category, setCategory] = useState<ProjectCategory>('ai')
  const [status, setStatus] = useState<ProjectStatus>('wip')

  function submit() {
    const t = title.trim()
    if (!t) return
    const entry: ProjectEntry = {
      id: uid(),
      slug: t.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      title: t, tagline: tagline.trim(), category, status,
      featured: false, published: false, description: '',
      techStack: [], tags: [], screenshots: [],
      createdAt: now(), updatedAt: now(),
      relatedResearch: [], relatedResources: [],
      accent: '#a78bfa',
    }
    dispatch({ type: 'ADD_PROJECT', payload: entry })
    onClose()
  }

  return (
    <div className="rounded-xl border border-white/6 bg-white/[0.015] overflow-hidden">
      <div className="flex items-center gap-2 border-b border-white/6 px-4 py-2.5">
        <Plus size={12} className="text-violet-400/60" />
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 flex-1">New Project</span>
        <button onClick={onClose} className="text-white/25 hover:text-white/50 transition-colors">
          <X size={12} />
        </button>
      </div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Project title"
            className="w-full rounded-lg border border-white/10 bg-white/4 px-3 py-1.5 font-mono text-[12px] text-white/65 placeholder-white/20 focus:border-violet-400/30 focus:outline-none"
            autoFocus
          />
          <input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Short tagline"
            className="w-full rounded-lg border border-white/10 bg-white/4 px-3 py-1.5 font-mono text-[12px] text-white/65 placeholder-white/20 focus:border-violet-400/30 focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <select value={category} onChange={(e) => setCategory(e.target.value as ProjectCategory)} className="w-full rounded-lg border border-white/10 bg-white/4 px-3 py-1.5 font-mono text-[12px] text-white/65 focus:border-violet-400/30 focus:outline-none">
            {CATEGORY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)} className="w-full rounded-lg border border-white/10 bg-white/4 px-3 py-1.5 font-mono text-[12px] text-white/65 focus:border-violet-400/30 focus:outline-none">
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <button onClick={submit} className="rounded-lg border border-violet-400/25 bg-violet-400/8 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-violet-400/70 hover:bg-violet-400/15 hover:text-violet-400 transition-colors">
          Create Project
        </button>
      </div>
    </div>
  )
}
