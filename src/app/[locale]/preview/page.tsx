'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Eye, AlertTriangle, ArrowLeft, ExternalLink } from 'lucide-react'
import { LocaleLink } from '@/lib/i18n/link'

// Reads AdminState from localStorage — client-side only
function usePreviewItem(type: string | null, id: string | null) {
  if (typeof window === 'undefined' || !type || !id) return null

  try {
    const raw = localStorage.getItem('jootacee-command-v2')
    if (!raw) return null
    const state = JSON.parse(raw)

    if (type === 'project') {
      return (state.projectsRegistry ?? []).find((p: Record<string, unknown>) => p.id === id || p.slug === id) ?? null
    }
    if (type === 'research') {
      return (state.researchRegistry ?? []).find((r: Record<string, unknown>) => r.slug === id) ?? null
    }
    if (type === 'lab') {
      return (state.labsRegistry ?? []).find((l: Record<string, unknown>) => l.key === id) ?? null
    }
    if (type === 'system') {
      return (state.systemsRegistry ?? []).find((s: Record<string, unknown>) => s.key === id) ?? null
    }
    return null
  } catch {
    return null
  }
}

function PreviewContent() {
  const params = useSearchParams()
  const type = params.get('type')
  const id   = params.get('id')

  // reason: preview reads generic JSON from localStorage — typed at call site
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const item: Record<string, any> | null = usePreviewItem(type, id)

  if (!type || !id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <AlertTriangle className="h-10 w-10 text-amber-400/50" />
        <h2 className="font-mono text-sm text-white/50">No preview target</h2>
        <p className="font-mono text-xs text-white/30">
          Open preview from the admin panel using the &ldquo;Preview&rdquo; button on a content item.
        </p>
        <p className="font-mono text-[10px] text-white/20">
          Expected URL: /preview?type=project&amp;id=my-project-slug
        </p>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <AlertTriangle className="h-10 w-10 text-rose-400/50" />
        <h2 className="font-mono text-sm text-white/50">Content not found</h2>
        <p className="font-mono text-xs text-white/30">
          {type} &ldquo;{id}&rdquo; was not found in AdminState.
          Make sure the content is saved in the admin panel.
        </p>
      </div>
    )
  }

  const title       = (item.title ?? item.name ?? id) as string
  const description = (item.description ?? item.excerpt ?? item.tagline ?? '') as string
  const status      = (item.cmsStatus ?? item.status ?? (item.published ? 'published' : 'draft')) as string
  const tags        = (item.tags ?? item.stack ?? []) as string[]

  const statusColor = status === 'published' ? 'text-emerald-400/70' : status === 'review' ? 'text-sky-400/70' : status === 'archived' ? 'text-white/30' : 'text-amber-400/70'

  return (
    <article className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      {/* Type + status badge */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-white/40">
          {type}
        </span>
        <span className={`font-mono text-[9px] uppercase tracking-wider ${statusColor}`}>
          ● {status}
        </span>
      </div>

      {/* Title */}
      <h1 className="font-mono text-2xl font-bold text-white/90 leading-tight">{title}</h1>

      {/* Description */}
      {description && (
        <p className="font-mono text-sm text-white/55 leading-relaxed">{description}</p>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag: string) => (
            <span key={tag} className="rounded border border-white/8 bg-white/[0.03] px-2 py-0.5 font-mono text-[9px] text-white/40">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Body */}
      {item.body && (
        <div className="rounded-xl border border-white/8 bg-white/[0.02] p-6">
          <p className="font-mono text-sm text-white/55 whitespace-pre-wrap leading-relaxed">{item.body}</p>
        </div>
      )}

      {/* Links */}
      {(item.liveUrl || item.repoUrl || item.externalUrl) && (
        <div className="flex items-center gap-3 flex-wrap">
          {item.liveUrl && (
            <a href={item.liveUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-mono text-xs text-sky-400/70 hover:text-sky-400 transition-colors">
              <ExternalLink className="h-3 w-3" /> Live
            </a>
          )}
          {item.repoUrl && (
            <a href={item.repoUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-mono text-xs text-white/40 hover:text-white/65 transition-colors">
              <ExternalLink className="h-3 w-3" /> Repo
            </a>
          )}
          {item.externalUrl && (
            <a href={item.externalUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-mono text-xs text-white/40 hover:text-white/65 transition-colors">
              <ExternalLink className="h-3 w-3" /> Link
            </a>
          )}
        </div>
      )}

      {/* Raw data debug */}
      <details className="rounded-xl border border-white/[0.05] overflow-hidden">
        <summary className="cursor-pointer px-4 py-2.5 font-mono text-[9px] uppercase tracking-wider text-white/20 hover:text-white/40 transition-colors">
          Raw data (debug)
        </summary>
        <pre className="overflow-auto p-4 font-mono text-[8px] text-white/28 leading-relaxed max-h-64">
          {JSON.stringify(item, null, 2)}
        </pre>
      </details>
    </article>
  )
}

export default function PreviewPage() {
  return (
    <div className="min-h-screen bg-[#060610]">
      {/* Draft watermark banner */}
      <div className="sticky top-0 z-50 flex items-center gap-3 border-b border-amber-400/15 bg-amber-400/8 px-4 py-2">
        <Eye className="h-3.5 w-3.5 text-amber-400/70 shrink-0" />
        <span className="flex-1 font-mono text-[9px] uppercase tracking-[0.2em] text-amber-400/70">
          Draft Preview — not published
        </span>
        <LocaleLink href="/admin" className="flex items-center gap-1 font-mono text-[8px] text-amber-400/50 hover:text-amber-400/80 transition-colors">
          <ArrowLeft className="h-3 w-3" /> Back to Admin
        </LocaleLink>
      </div>

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
