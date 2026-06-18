'use client'

import { cn } from '@/lib/utils'
import type { CmsStatus, RevisionContentType } from '@/lib/admin/types'
import { useAdmin } from '@/lib/admin/store'

// ─── Status styling ───────────────────────────────────────────────────────────

const STATUS_CFG: Record<CmsStatus, { label: string; cls: string }> = {
  draft:     { label: 'Draft',     cls: 'border-amber-400/20 bg-amber-400/8 text-amber-400/75' },
  review:    { label: 'Review',    cls: 'border-sky-400/25 bg-sky-400/8 text-sky-400/75' },
  published: { label: 'Published', cls: 'border-emerald-400/25 bg-emerald-400/8 text-emerald-400/70' },
  archived:  { label: 'Archived',  cls: 'border-white/8 bg-white/[0.02] text-white/30' },
}

const TRANSITIONS: Record<CmsStatus, CmsStatus[]> = {
  draft:     ['review', 'published'],
  review:    ['published', 'draft'],
  published: ['archived', 'draft'],
  archived:  ['draft'],
}

// ─── Badge (display only) ─────────────────────────────────────────────────────

interface BadgeProps { status: CmsStatus; className?: string }

export function CmsStatusBadge({ status, className }: BadgeProps) {
  const { label, cls } = STATUS_CFG[status]
  return (
    <span className={cn('inline-block rounded-full border px-2 py-0.5 font-mono text-[7.5px] uppercase tracking-wider', cls, className)}>
      {label}
    </span>
  )
}

// ─── Selector (interactive) ───────────────────────────────────────────────────

interface SelectorProps {
  contentType: RevisionContentType
  contentId: string
  current: CmsStatus
}

export function CmsStatusSelector({ contentType, contentId, current }: SelectorProps) {
  const { dispatch } = useAdmin()

  const transitions = TRANSITIONS[current]

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <CmsStatusBadge status={current} />
      {transitions.map(next => (
        <button
          key={next}
          onClick={() => dispatch({ type: 'CONTENT_SET_STATUS', payload: { contentType, contentId, status: next } })}
          className={cn(
            'rounded border px-2 py-0.5 font-mono text-[7.5px] uppercase tracking-wider transition-colors hover:opacity-80',
            STATUS_CFG[next].cls,
          )}
        >
          → {STATUS_CFG[next].label}
        </button>
      ))}
    </div>
  )
}

// ─── Preview link ─────────────────────────────────────────────────────────────

interface PreviewLinkProps {
  contentType: RevisionContentType
  contentId: string
  locale?: string
}

export function PreviewLink({ contentType, contentId, locale = 'en' }: PreviewLinkProps) {
  const href = `/${locale}/preview?type=${contentType}&id=${contentId}`
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded border border-white/8 bg-white/[0.03] px-2 py-0.5 font-mono text-[7.5px] text-white/40 transition-colors hover:text-white/65 hover:border-white/18"
    >
      Preview ↗
    </a>
  )
}
