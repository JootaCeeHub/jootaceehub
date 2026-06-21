'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Eye, AlertTriangle, ArrowLeft, ExternalLink, Tag, Code2, Globe, GitBranch, Clock, BookOpen } from 'lucide-react'
import { LocaleLink } from '@/lib/i18n/link'
import { CmsStatusBadge } from '@/components/admin/panels/cms/CmsStatusBadge'
import type { CmsStatus } from '@/lib/admin/types'
import { cn } from '@/lib/utils'

// ─── Read from AdminState localStorage ───────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function usePreviewItem(type: string | null, id: string | null): Record<string, any> | null {
  if (typeof window === 'undefined' || !type || !id) return null
  try {
    const raw = localStorage.getItem('jootacee-command-v2')
    if (!raw) return null
    const state = JSON.parse(raw)
    if (type === 'project')  return (state.projectsRegistry ?? []).find((p: Record<string, unknown>) => p.id === id || p.slug === id) ?? null
    if (type === 'research') return (state.researchRegistry ?? []).find((r: Record<string, unknown>) => r.slug === id) ?? null
    if (type === 'lab')      return (state.labsRegistry ?? []).find((l: Record<string, unknown>) => l.key === id) ?? null
    if (type === 'system')   return (state.systemsRegistry ?? []).find((s: Record<string, unknown>) => s.key === id) ?? null
    return null
  } catch { return null }
}

// ─── Tag chip ─────────────────────────────────────────────────────────────────

function TagChip({ label, accent }: { label: string; accent?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-mono"
      style={accent ? { borderColor: `${accent}30`, color: accent, backgroundColor: `${accent}0f` } : undefined}
    >
      <Tag size={8} />
      {label}
    </span>
  )
}

// ─── Tech stack chip ──────────────────────────────────────────────────────────

function TechChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-cyan-500/20 bg-cyan-500/8 text-cyan-300/70 text-[10px] font-mono">
      <Code2 size={8} />
      {label}
    </span>
  )
}

// ─── Metadata row ─────────────────────────────────────────────────────────────

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-1.5 border-b border-white/4 last:border-0">
      <span className="text-white/30 font-mono text-xs w-24 shrink-0 pt-0.5">{label}</span>
      <span className="text-xs text-white/60 flex-1">{children}</span>
    </div>
  )
}

// ─── Content type renderers ───────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ProjectPreview({ item }: { item: Record<string, any> }) {
  const tags: string[]      = Array.isArray(item.tags) ? item.tags : []
  const stack: string[]     = Array.isArray(item.techStack) ? item.techStack : []
  const shots: Record<string, unknown>[] = Array.isArray(item.screenshots) ? item.screenshots : []
  const status              = (item.cmsStatus ?? (item.published ? 'published' : 'draft')) as CmsStatus

  return (
    <article className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      {/* Hero */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded border border-purple-500/25 bg-purple-500/8 px-2 py-0.5 font-mono text-[9px] text-purple-400 uppercase tracking-widest">Project</span>
          <CmsStatusBadge status={status} />
          {item.category && <span className="rounded border border-white/10 bg-white/4 px-2 py-0.5 font-mono text-[9px] text-white/35 uppercase">{item.category}</span>}
          {item.status && <span className="rounded border border-white/10 bg-white/4 px-2 py-0.5 font-mono text-[9px] text-white/35">{item.status}</span>}
        </div>
        <h1 className="text-3xl font-bold text-white/90 leading-tight">{item.title}</h1>
        {item.tagline && <p className="text-lg text-white/55 font-light">{item.tagline}</p>}
      </div>

      {/* Description */}
      {item.description && (
        <p className="text-sm text-white/60 leading-relaxed border-l-2 border-cyan-500/30 pl-4">{item.description}</p>
      )}

      {/* Body */}
      {item.body && (
        <div className="rounded-xl border border-white/8 bg-white/[0.02] p-6">
          <p className="text-sm text-white/55 whitespace-pre-wrap leading-relaxed">{item.body}</p>
        </div>
      )}

      {/* Tech stack */}
      {stack.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-white/30 font-mono uppercase tracking-widest">Tech Stack</p>
          <div className="flex flex-wrap gap-1.5">
            {stack.map((t: string) => <TechChip key={t} label={t} />)}
          </div>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t: string) => <TagChip key={t} label={t} accent="#a78bfa" />)}
        </div>
      )}

      {/* Screenshots */}
      {shots.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-white/30 font-mono uppercase tracking-widest">Screenshots</p>
          <div className="grid grid-cols-2 gap-3">
            {shots.map((s: Record<string, unknown>, i: number) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={s.url as string}
                alt={(s.alt as string) ?? ''}
                className="rounded-lg border border-white/8 w-full object-cover"
                loading="lazy"
              />
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4 space-y-0">
        {item.slug && <MetaRow label="slug"><span className="font-mono">{item.slug}</span></MetaRow>}
        {item.createdAt && <MetaRow label="created"><span className="font-mono">{new Date(item.createdAt as string).toLocaleDateString()}</span></MetaRow>}
        {item.publishedAt && <MetaRow label="published"><span className="font-mono">{new Date(item.publishedAt as string).toLocaleDateString()}</span></MetaRow>}
        {item.featured && <MetaRow label="featured">Yes</MetaRow>}
      </div>

      {/* Links */}
      <div className="flex flex-wrap gap-3">
        {item.liveUrl && (
          <a href={item.liveUrl as string} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-cyan-500/30 bg-cyan-500/8 text-cyan-400 text-sm hover:bg-cyan-500/15 transition-colors">
            <Globe size={14} />Live
          </a>
        )}
        {item.repoUrl && (
          <a href={item.repoUrl as string} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-white/4 text-white/50 text-sm hover:bg-white/8 transition-colors">
            <GitBranch size={14} />Repository
          </a>
        )}
      </div>
    </article>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ResearchPreview({ item }: { item: Record<string, any> }) {
  const tags: string[] = Array.isArray(item.tags) ? item.tags : []
  const status = (item.cmsStatus ?? (item.published ? 'published' : 'draft')) as CmsStatus

  return (
    <article className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded border border-emerald-500/25 bg-emerald-500/8 px-2 py-0.5 font-mono text-[9px] text-emerald-400 uppercase tracking-widest">Research</span>
          <CmsStatusBadge status={status} />
          {item.category && <span className="rounded border border-white/10 bg-white/4 px-2 py-0.5 font-mono text-[9px] text-white/35 uppercase">{item.category}</span>}
        </div>
        <h1 className="text-3xl font-bold text-white/90 leading-tight">{item.title}</h1>
        {item.readTime && (
          <div className="flex items-center gap-1.5 text-xs text-white/30">
            <Clock size={11} />{item.readTime} min read
          </div>
        )}
      </div>

      {item.excerpt && (
        <p className="text-base text-white/60 leading-relaxed border-l-2 border-emerald-500/30 pl-4 italic">{item.excerpt}</p>
      )}

      {item.body && (
        <div className="prose prose-invert prose-sm max-w-none rounded-xl border border-white/8 bg-white/[0.02] p-6">
          <p className="text-sm text-white/60 whitespace-pre-wrap leading-relaxed">{item.body}</p>
        </div>
      )}

      {item.externalUrl && (
        <a href={item.externalUrl as string} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-500/30 bg-emerald-500/8 text-emerald-400 text-sm hover:bg-emerald-500/15 transition-colors w-fit">
          <ExternalLink size={14} />Read full article
        </a>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t: string) => <TagChip key={t} label={t} accent="#34d399" />)}
        </div>
      )}

      <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4 space-y-0">
        {item.slug && <MetaRow label="slug"><span className="font-mono">{item.slug}</span></MetaRow>}
        {item.publishedAt && <MetaRow label="published"><span className="font-mono">{new Date(item.publishedAt as string).toLocaleDateString()}</span></MetaRow>}
        {item.featured && <MetaRow label="featured">Yes</MetaRow>}
      </div>
    </article>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function LabPreview({ item }: { item: Record<string, any> }) {
  const stack: string[]     = Array.isArray(item.stack) ? item.stack : []
  const metrics: { label: string; value: string }[] = Array.isArray(item.metrics) ? item.metrics : []
  const status              = (item.cmsStatus ?? (item.visible ? 'published' : 'draft')) as CmsStatus
  const accent: string      = (item.accent as string) || '#22d3ee'

  return (
    <article className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="rounded border px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest"
            style={{ borderColor: `${accent}40`, color: accent, backgroundColor: `${accent}12` }}
          >Lab</span>
          <CmsStatusBadge status={status} />
          {item.status && <span className="rounded border border-white/10 bg-white/4 px-2 py-0.5 font-mono text-[9px] text-white/35 uppercase">{item.status}</span>}
        </div>
        <h1 className="text-3xl font-bold text-white/90 leading-tight">{item.name ?? item.key}</h1>
        {item.tagline && <p className="text-lg font-light" style={{ color: `${accent}99` }}>{item.tagline}</p>}
      </div>

      {item.description && (
        <p className="text-sm text-white/60 leading-relaxed border-l-2 pl-4" style={{ borderColor: `${accent}40` }}>
          {item.description}
        </p>
      )}

      {stack.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-white/30 font-mono uppercase tracking-widest">Tech Stack</p>
          <div className="flex flex-wrap gap-1.5">
            {stack.map((t: string) => <TechChip key={t} label={t} />)}
          </div>
        </div>
      )}

      {metrics.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-white/30 font-mono uppercase tracking-widest">Metrics</p>
          <div className="grid grid-cols-3 gap-2">
            {metrics.map((m) => (
              <div key={m.label} className="rounded-lg border border-white/6 bg-white/[0.02] px-3 py-3 text-center">
                <p className="font-mono text-base font-bold" style={{ color: accent }}>{m.value}</p>
                <p className="text-[9px] text-white/30 uppercase tracking-widest mt-0.5">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4 space-y-0">
        {item.key && <MetaRow label="key"><span className="font-mono">{item.key}</span></MetaRow>}
        {item.visible !== undefined && <MetaRow label="visible">{item.visible ? 'Yes' : 'No'}</MetaRow>}
      </div>
    </article>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SystemPreview({ item }: { item: Record<string, any> }) {
  const status = (item.cmsStatus ?? (item.visible ? 'published' : 'draft')) as CmsStatus

  const SYSTEM_STATUS_COLORS: Record<string, string> = {
    operational: '#34d399',
    degraded:    '#f59e0b',
    maintenance: '#60a5fa',
    offline:     '#f87171',
  }
  const sysColor = SYSTEM_STATUS_COLORS[item.status as string] ?? '#94a3b8'

  return (
    <article className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded border border-sky-500/25 bg-sky-500/8 px-2 py-0.5 font-mono text-[9px] text-sky-400 uppercase tracking-widest">System</span>
          <CmsStatusBadge status={status} />
          {item.badge && <span className="rounded border border-white/10 bg-white/4 px-2 py-0.5 font-mono text-[9px] text-white/35 uppercase">{item.badge}</span>}
          {item.status && (
            <span
              className="rounded border px-2 py-0.5 font-mono text-[9px] uppercase"
              style={{ borderColor: `${sysColor}30`, color: sysColor, backgroundColor: `${sysColor}10` }}
            >{item.status}</span>
          )}
        </div>
        <h1 className="text-3xl font-bold text-white/90 leading-tight">{item.name ?? item.key}</h1>
      </div>

      {item.description && (
        <p className="text-sm text-white/60 leading-relaxed border-l-2 border-sky-500/30 pl-4">{item.description}</p>
      )}

      <div className="grid grid-cols-3 gap-3">
        {item.version && (
          <div className="rounded-lg border border-white/6 bg-white/[0.02] px-3 py-3 text-center">
            <p className="font-mono text-sm font-bold text-white/70">{item.version}</p>
            <p className="text-[9px] text-white/30 uppercase tracking-widest mt-0.5">Version</p>
          </div>
        )}
        {item.uptime && (
          <div className="rounded-lg border border-white/6 bg-white/[0.02] px-3 py-3 text-center">
            <p className="font-mono text-sm font-bold text-emerald-400">{item.uptime}</p>
            <p className="text-[9px] text-white/30 uppercase tracking-widest mt-0.5">Uptime</p>
          </div>
        )}
        {item.tools !== undefined && (
          <div className="rounded-lg border border-white/6 bg-white/[0.02] px-3 py-3 text-center">
            <p className="font-mono text-sm font-bold text-cyan-400">{item.tools}</p>
            <p className="text-[9px] text-white/30 uppercase tracking-widest mt-0.5">Tools</p>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4 space-y-0">
        {item.key && <MetaRow label="key"><span className="font-mono">{item.key}</span></MetaRow>}
        {item.visible !== undefined && <MetaRow label="visible">{item.visible ? 'Yes' : 'No'}</MetaRow>}
      </div>
    </article>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function GenericPreview({ item, type }: { item: Record<string, any>; type: string }) {
  const title       = (item.title ?? item.name ?? item.key ?? type) as string
  const description = (item.description ?? item.excerpt ?? item.tagline ?? '') as string
  const tags        = (item.tags ?? item.stack ?? []) as string[]
  const status      = (item.cmsStatus ?? (item.published ? 'published' : 'draft')) as CmsStatus

  return (
    <article className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded border border-white/10 bg-white/4 px-2 py-0.5 font-mono text-[9px] text-white/40 uppercase">{type}</span>
          <CmsStatusBadge status={status} />
        </div>
        <h1 className="text-3xl font-bold text-white/90 leading-tight">{title}</h1>
      </div>
      {description && <p className="text-sm text-white/60 leading-relaxed">{description}</p>}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t: string) => <TagChip key={t} label={t} />)}
        </div>
      )}
      <details className="rounded-xl border border-white/6 overflow-hidden">
        <summary className="cursor-pointer px-4 py-2.5 font-mono text-[9px] uppercase tracking-wider text-white/20 hover:text-white/40 transition-colors flex items-center gap-2">
          <BookOpen size={11} />Raw data
        </summary>
        <pre className="overflow-auto p-4 font-mono text-[8px] text-white/28 leading-relaxed max-h-64">
          {JSON.stringify(item, null, 2)}
        </pre>
      </details>
    </article>
  )
}

// ─── Preview router ───────────────────────────────────────────────────────────

function PreviewContent() {
  const params = useSearchParams()
  const type   = params.get('type')
  const id     = params.get('id')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const item: Record<string, any> | null = usePreviewItem(type, id)

  if (!type || !id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <AlertTriangle className="h-10 w-10 text-amber-400/50" />
        <h2 className="font-mono text-sm text-white/50">No preview target</h2>
        <p className="font-mono text-xs text-white/30">Open preview from the admin panel using the Preview button on a content item.</p>
        <code className="font-mono text-[10px] text-white/20 px-3 py-1.5 rounded border border-white/8 bg-white/3">
          /preview?type=project&amp;id=slug
        </code>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <AlertTriangle className="h-10 w-10 text-rose-400/50" />
        <h2 className="font-mono text-sm text-white/50">Not found in AdminState</h2>
        <p className="font-mono text-xs text-white/30">
          {type} &ldquo;{id}&rdquo; was not found. Make sure the content is saved in the admin panel.
        </p>
      </div>
    )
  }

  return (
    <>
      {type === 'project'  && <ProjectPreview item={item} />}
      {type === 'research' && <ResearchPreview item={item} />}
      {type === 'lab'      && <LabPreview item={item} />}
      {type === 'system'   && <SystemPreview item={item} />}
      {!['project', 'research', 'lab', 'system'].includes(type) && <GenericPreview item={item} type={type} />}
    </>
  )
}

// ─── Page wrapper ─────────────────────────────────────────────────────────────

const WATERMARK_STYLES: Record<string, string> = {
  draft:     'bg-amber-400/8 border-amber-400/15 text-amber-400/70',
  review:    'bg-blue-400/8 border-blue-400/15 text-blue-400/70',
  published: 'bg-emerald-400/8 border-emerald-400/15 text-emerald-400/70',
  archived:  'bg-white/4 border-white/10 text-white/30',
}

function WatermarkBanner() {
  // Can't read params here (client hook), so show generic draft banner
  return (
    <div className={cn('sticky top-0 z-50 flex items-center gap-3 border-b px-4 py-2', WATERMARK_STYLES['draft'])}>
      <Eye className="h-3.5 w-3.5 shrink-0" />
      <span className="flex-1 font-mono text-[9px] uppercase tracking-[0.2em]">
        Draft Preview — not live on site
      </span>
      <LocaleLink
        href="/admin"
        className="flex items-center gap-1 font-mono text-[8px] hover:opacity-80 transition-opacity"
      >
        <ArrowLeft className="h-3 w-3" /> Back to Admin
      </LocaleLink>
    </div>
  )
}

export default function PreviewPage() {
  return (
    <div className="min-h-screen bg-[#060610]">
      <WatermarkBanner />
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <span className="font-mono text-xs text-white/25 animate-pulse">Loading preview…</span>
        </div>
      }>
        <PreviewContent />
      </Suspense>
    </div>
  )
}
