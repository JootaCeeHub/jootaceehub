'use client'

import { useState } from 'react'
import { useAdmin } from '@/lib/admin/store'
import type { ProjectEntry, ProjectStatus, ProjectCategory } from '@/lib/admin/types'
import { cn } from '@/lib/utils'
import { uid, now, STATUS_OPTIONS, CATEGORY_OPTIONS } from './constants'
import { TagInput } from './TagInput'
import { CmsStatusSelector, PreviewLink } from '@/components/admin/panels/cms/CmsStatusBadge'
import { validateProject, fieldError, type ValidationResult } from '@/lib/cms/validation'

interface Props {
  project: ProjectEntry
}

export function ProjectEditor({ project }: Props) {
  const { dispatch } = useAdmin()
  const [validation, setValidation] = useState<ValidationResult | null>(null)

  function update(data: Partial<ProjectEntry>) {
    const updated = { ...project, ...data }
    const result = validateProject(updated)
    setValidation(result)
    dispatch({ type: 'UPDATE_PROJECT', payload: { id: project.id, data } })
  }

  const fe = (field: string) => validation ? fieldError(validation, field) : undefined

  return (
    <div className="border-t border-white/8 p-4 space-y-4">
      {/* CMS Status Row */}
      <div className="flex items-center justify-between gap-3 rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2">
        <CmsStatusSelector contentType="project" contentId={project.id} current={project.cmsStatus ?? (project.published ? 'published' : 'draft')} />
        <div className="flex items-center gap-2">
          {validation && !validation.valid && (
            <span className="font-mono text-[8px] text-rose-400/70">{validation.errors.length} validation error{validation.errors.length > 1 ? 's' : ''}</span>
          )}
          {validation && validation.valid && (
            <span className="font-mono text-[8px] text-emerald-400/60">✓ valid</span>
          )}
          <PreviewLink contentType="project" contentId={project.id} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Title</div>
          <input value={project.title} onChange={(e) => update({ title: e.target.value })} className={cn('w-full rounded-lg border bg-black/20 px-2.5 py-1.5 text-[11px] text-white/65 placeholder-white/20 outline-none focus:border-violet-400/25 transition-colors', fe('title') ? 'border-rose-400/40' : 'border-white/8')} />
          {fe('title') && <p className="font-mono text-[8px] text-rose-400/70">{fe('title')}</p>}
        </div>
        <div className="space-y-1">
          <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Tagline</div>
          <input value={project.tagline} onChange={(e) => update({ tagline: e.target.value })} placeholder="One-line hook…" className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 text-[11px] text-white/65 placeholder-white/20 outline-none focus:border-violet-400/25 transition-colors" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Slug</div>
          <input value={project.slug} onChange={(e) => update({ slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} placeholder="my-project" className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 text-[11px] text-white/65 placeholder-white/20 outline-none focus:border-violet-400/25 transition-colors" />
        </div>
        <div className="space-y-1">
          <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Status</div>
          <select value={project.status} onChange={(e) => update({ status: e.target.value as ProjectStatus })} className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 text-[11px] text-white/65 outline-none focus:border-violet-400/25 transition-colors">
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Category</div>
          <select value={project.category} onChange={(e) => update({ category: e.target.value as ProjectCategory })} className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 text-[11px] text-white/65 outline-none focus:border-violet-400/25 transition-colors">
            {CATEGORY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Description</div>
        <textarea value={project.description} onChange={(e) => update({ description: e.target.value })} rows={3} placeholder="Short paragraph for project cards…" className={cn('w-full rounded-lg border bg-black/20 px-2.5 py-1.5 text-[11px] text-white/65 placeholder-white/20 outline-none focus:border-violet-400/25 transition-colors resize-none leading-relaxed', fe('description') ? 'border-rose-400/40' : 'border-white/8')} />
        {fe('description') && <p className="font-mono text-[8px] text-rose-400/70">{fe('description')}</p>}
      </div>

      <div className="space-y-1">
        <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Body (Markdown)</div>
        <textarea value={project.body ?? ''} onChange={(e) => update({ body: e.target.value })} rows={6} placeholder="Full project write-up in Markdown…" className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 text-[11px] text-white/65 placeholder-white/20 outline-none focus:border-violet-400/25 transition-colors resize-none leading-relaxed" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Repo URL</div>
          <input value={project.repoUrl ?? ''} onChange={(e) => update({ repoUrl: e.target.value })} placeholder="https://github.com/…" className={cn('w-full rounded-lg border bg-black/20 px-2.5 py-1.5 text-[11px] text-white/65 placeholder-white/20 outline-none focus:border-violet-400/25 transition-colors', fe('repoUrl') ? 'border-rose-400/40' : 'border-white/8')} />
          {fe('repoUrl') && <p className="font-mono text-[8px] text-rose-400/70">{fe('repoUrl')}</p>}
        </div>
        <div className="space-y-1">
          <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Live URL</div>
          <input value={project.liveUrl ?? ''} onChange={(e) => update({ liveUrl: e.target.value })} placeholder="https://…" className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 text-[11px] text-white/65 placeholder-white/20 outline-none focus:border-violet-400/25 transition-colors" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Accent Color</div>
          <div className="flex items-center gap-2">
            <input type="color" value={project.accent} onChange={(e) => update({ accent: e.target.value })} className="h-7 w-10 rounded border border-white/10 bg-transparent cursor-pointer" />
            <input value={project.accent} onChange={(e) => update({ accent: e.target.value })} placeholder="#a78bfa" className="flex-1 w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 text-[11px] text-white/65 placeholder-white/20 outline-none focus:border-violet-400/25 transition-colors" />
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Tech Stack</div>
        <TagInput tags={project.techStack} onChange={(techStack) => update({ techStack })} placeholder="Add technology…" />
      </div>

      <div className="space-y-1">
        <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Tags</div>
        <TagInput tags={project.tags} onChange={(tags) => update({ tags })} />
      </div>

      <div className="space-y-1">
        <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Roadmap (Markdown)</div>
        <textarea value={project.roadmap ?? ''} onChange={(e) => update({ roadmap: e.target.value })} rows={4} placeholder={'- [ ] Feature A\n- [x] Feature B\n- [ ] Feature C'} className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 text-[11px] text-white/65 placeholder-white/20 outline-none focus:border-violet-400/25 transition-colors resize-none leading-relaxed" />
      </div>

      <div className="space-y-2.5">
        {(['published', 'featured'] as const).map((field) => (
          <div key={field} className="flex items-center justify-between gap-4">
            <span className="text-[11px] font-medium text-white/70 capitalize">{field}</span>
            <button
              onClick={() => update({ [field]: !project[field] })}
              className={cn('relative h-5 w-9 shrink-0 rounded-full border transition-colors', project[field] ? 'border-violet-400/40 bg-violet-400/20' : 'border-white/15 bg-white/5')}
            >
              <span className={cn('absolute top-0.5 h-4 w-4 rounded-full transition-all', project[field] ? 'left-[18px] bg-violet-400' : 'left-0.5 bg-white/30')} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => dispatch({ type: 'REMOVE_PROJECT', payload: project.id })}
          className="rounded border border-red-400/10 px-2 py-1 font-mono text-[9px] text-red-400/30 hover:border-red-400/30 hover:text-red-400/70 transition-colors"
        >
          Remove project
        </button>
        <button
          onClick={() => {
            const clone: ProjectEntry = {
              ...project, id: uid(), slug: project.slug + '-copy',
              title: project.title + ' (copy)', featured: false, published: false,
              createdAt: now(), updatedAt: now(),
            }
            dispatch({ type: 'ADD_PROJECT', payload: clone })
          }}
          className="rounded border border-violet-400/15 px-2 py-1 font-mono text-[9px] text-violet-400/40 hover:border-violet-400/30 hover:text-violet-400/80 transition-colors"
        >
          Duplicate
        </button>
      </div>
    </div>
  )
}
