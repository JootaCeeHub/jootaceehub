'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useAdmin } from '@/lib/admin/store'
import { useJobQueue } from '@/hooks/useJobQueue'
import { AuditLogViewer } from '@/components/admin/cms/AuditLogViewer'
import { RevisionLogViewer } from '@/components/admin/cms/RevisionLogViewer'
import { PublishWizard, type PublishTarget } from '@/components/admin/cms/PublishWizard'
import { buildSlugRegistry, findCollisions } from '@/lib/cms/slug-registry'
import type { AuditLogEntry, CmsStatus, RevisionContentType } from '@/lib/admin/types'
import {
  Workflow, GitCommit, History, AlertTriangle, CheckCircle2, XCircle,
  Loader2, Clock, Trash2, RotateCcw, Send, ChevronRight, FileText,
  Tag, Archive, Eye,
} from 'lucide-react'

// ─── Tab type ─────────────────────────────────────────────────────────────────

type Tab = 'publish' | 'jobs' | 'audit' | 'revisions' | 'slugs'

// ─── Job status icon ──────────────────────────────────────────────────────────

function JobIcon({ status }: { status: string }) {
  if (status === 'done')      return <CheckCircle2 size={13} className="text-emerald-400" />
  if (status === 'failed')    return <XCircle size={13} className="text-rose-400" />
  if (status === 'running')   return <Loader2 size={13} className="text-cyan-400 animate-spin" />
  if (status === 'cancelled') return <XCircle size={13} className="text-white/30" />
  return <Clock size={13} className="text-yellow-400" />
}

const JOB_TYPE_COLORS: Record<string, string> = {
  'git-commit': 'text-purple-400', 'git-push': 'text-blue-400',
  'deploy-hook': 'text-orange-400', 'media-upload': 'text-cyan-400',
  'publish': 'text-emerald-400', 'rollback': 'text-rose-400',
}

// ─── Status pill ──────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<CmsStatus, string> = {
  draft:     'bg-yellow-500/12 border-yellow-500/25 text-yellow-400',
  review:    'bg-blue-500/12 border-blue-500/25 text-blue-400',
  published: 'bg-emerald-500/12 border-emerald-500/25 text-emerald-400',
  archived:  'bg-white/5 border-white/15 text-white/35',
}

function StatusPill({ status }: { status: CmsStatus }) {
  return (
    <span className={cn('px-1.5 py-0.5 rounded border text-[10px] font-mono', STATUS_STYLE[status])}>
      {status}
    </span>
  )
}

// ─── Content row with status transitions ──────────────────────────────────────

const TRANSITIONS: Record<CmsStatus, CmsStatus[]> = {
  draft:     ['review', 'published'],
  review:    ['published', 'draft'],
  published: ['archived', 'draft'],
  archived:  ['draft'],
}

interface ContentItemRow {
  contentType: RevisionContentType
  contentId: string
  contentSlug: string
  label: string
  status: CmsStatus
  previewUrl: string
}

function ContentRow({
  item,
  onPublishWizard,
  onStatusChange,
}: {
  item: ContentItemRow
  onPublishWizard: (target: PublishTarget) => void
  onStatusChange: (type: RevisionContentType, id: string, slug: string, next: CmsStatus) => void
}) {
  const nexts = TRANSITIONS[item.status]

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-white/5 bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
      <FileText size={13} className="text-white/25 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm text-white/80 truncate">{item.label}</p>
          <StatusPill status={item.status} />
        </div>
        <p className="text-xs text-white/25 font-mono">{item.contentType} · {item.contentSlug}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
        <a
          href={item.previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded border border-white/8 text-white/30 hover:text-white/60 transition-colors"
          title="Preview"
        >
          <Eye size={11} />
        </a>
        {nexts.filter(n => n !== 'published').map(next => (
          <button
            key={next}
            onClick={() => onStatusChange(item.contentType, item.contentId, item.contentSlug, next)}
            className={cn(
              'px-2 py-1 rounded border text-[10px] font-mono transition-colors',
              next === 'archived' ? 'border-white/10 text-white/30 hover:border-rose-500/30 hover:text-rose-400'
              : next === 'draft'  ? 'border-yellow-500/20 text-yellow-400/60 hover:text-yellow-400'
              : next === 'review' ? 'border-blue-500/20 text-blue-400/60 hover:text-blue-400'
              : 'border-white/10 text-white/30',
            )}
            title={`Move to ${next}`}
          >
            {next === 'archived' ? <Archive size={10} /> : `→ ${next}`}
          </button>
        ))}
        {(item.status === 'draft' || item.status === 'review') && (
          <button
            onClick={() => onPublishWizard({ contentType: item.contentType, contentId: item.contentId, contentSlug: item.contentSlug, label: item.label })}
            className="flex items-center gap-1 px-2 py-1 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] hover:bg-emerald-500/20 transition-colors"
          >
            <Send size={10} />
            Publish
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Tab: Publish ─────────────────────────────────────────────────────────────

function PublishTab() {
  const { state, dispatch } = useAdmin()
  const [wizardTarget, setWizardTarget] = useState<PublishTarget | null>(null)
  const [showAll, setShowAll] = useState(false)

  const allItems = useMemo((): ContentItemRow[] => {
    const items: ContentItemRow[] = []
    for (const p of state.projectsRegistry ?? []) {
      items.push({
        contentType: 'project', contentId: p.id, contentSlug: p.slug, label: p.title,
        status: p.cmsStatus ?? (p.published ? 'published' : 'draft'),
        previewUrl: `/en/preview?type=project&id=${p.id}`,
      })
    }
    for (const r of state.researchRegistry ?? []) {
      items.push({
        contentType: 'research', contentId: r.slug, contentSlug: r.slug, label: r.title,
        status: r.cmsStatus ?? (r.published ? 'published' : 'draft'),
        previewUrl: `/en/preview?type=research&id=${r.slug}`,
      })
    }
    for (const l of state.labsRegistry ?? []) {
      items.push({
        contentType: 'lab' as RevisionContentType, contentId: l.key, contentSlug: l.key, label: l.name,
        status: (l.cmsStatus ?? (l.visible ? 'published' : 'draft')) as CmsStatus,
        previewUrl: `/en/preview?type=lab&id=${l.key}`,
      })
    }
    for (const s of state.systemsRegistry ?? []) {
      items.push({
        contentType: 'system' as RevisionContentType, contentId: s.key, contentSlug: s.key, label: s.name,
        status: (s.cmsStatus ?? (s.visible ? 'published' : 'draft')) as CmsStatus,
        previewUrl: `/en/preview?type=system&id=${s.key}`,
      })
    }
    return items
  }, [state.projectsRegistry, state.researchRegistry, state.labsRegistry, state.systemsRegistry])

  const pending   = allItems.filter(i => i.status === 'draft' || i.status === 'review')
  const published = allItems.filter(i => i.status === 'published')
  const archived  = allItems.filter(i => i.status === 'archived')

  function handleStatusChange(type: RevisionContentType, id: string, slug: string, next: CmsStatus) {
    dispatch({ type: 'CONTENT_SET_STATUS', payload: { contentType: type, contentId: id, status: next } })
  }

  function handleRollbackFromAudit(entry: AuditLogEntry) {
    dispatch({ type: 'CONTENT_SET_STATUS', payload: {
      contentType: entry.contentType as RevisionContentType,
      contentId: entry.contentId,
      status: (entry.previousStatus ?? 'draft') as CmsStatus,
    }})
    dispatch({ type: 'LOG_AUDIT', payload: {
      action: 'rollback', contentType: entry.contentType,
      contentId: entry.contentId, contentSlug: entry.contentSlug,
      previousStatus: entry.newStatus, newStatus: entry.previousStatus,
      metadata: { rolledBackFrom: entry.id },
    }})
  }

  const STATUS_COUNTS: { label: string; count: number; color: string }[] = [
    { label: 'Draft',     count: allItems.filter(i => i.status === 'draft').length,     color: 'text-yellow-400'  },
    { label: 'Review',    count: allItems.filter(i => i.status === 'review').length,    color: 'text-blue-400'    },
    { label: 'Published', count: published.length,                                      color: 'text-emerald-400' },
    { label: 'Archived',  count: archived.length,                                       color: 'text-white/30'    },
  ]

  return (
    <div className="space-y-5">
      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-2">
        {STATUS_COUNTS.map(s => (
          <div key={s.label} className="rounded-lg border border-white/5 bg-white/[0.02] px-2 py-2 text-center">
            <p className={cn('font-mono text-lg font-bold', s.color)}>{s.count}</p>
            <p className="text-[9px] text-white/25 uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pending (draft/review) */}
      <div>
        <p className="text-xs text-white/40 mb-2 flex items-center gap-1.5">
          <Send size={10} />Pending publish ({pending.length})
        </p>
        {pending.length === 0 ? (
          <div className="flex items-center justify-center py-5 text-white/15 border border-white/5 rounded-lg gap-2">
            <CheckCircle2 size={13} /><p className="text-xs">Nothing pending</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {pending.map(item => (
              <ContentRow
                key={`${item.contentType}:${item.contentId}`}
                item={item}
                onPublishWizard={setWizardTarget}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>

      {/* Published + archived */}
      {(published.length > 0 || archived.length > 0) && (
        <div>
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/50 transition-colors mb-2"
          >
            <ChevronRight size={11} className={cn('transition-transform', showAll && 'rotate-90')} />
            {showAll ? 'Hide' : 'Show'} published + archived ({published.length + archived.length})
          </button>
          {showAll && (
            <div className="space-y-1.5">
              {[...published, ...archived].map(item => (
                <ContentRow
                  key={`${item.contentType}:${item.contentId}`}
                  item={item}
                  onPublishWizard={setWizardTarget}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick rollback */}
      <div>
        <p className="text-xs text-white/30 mb-2 flex items-center gap-1.5">
          <RotateCcw size={10} />Quick rollback from audit
        </p>
        <AuditLogViewer onRollback={handleRollbackFromAudit} maxHeight="200px" />
      </div>

      {wizardTarget && (
        <PublishWizard target={wizardTarget} onClose={() => setWizardTarget(null)} />
      )}
    </div>
  )
}

// ─── Tab: Job Queue ───────────────────────────────────────────────────────────

function JobsTab() {
  const { jobs, clearDone, cancelJob } = useJobQueue()
  const active   = jobs.filter(j => j.status === 'pending' || j.status === 'running')
  const finished = jobs.filter(j => j.status === 'done' || j.status === 'failed' || j.status === 'cancelled')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-white/40">{jobs.length} total · {active.length} active</p>
        {finished.length > 0 && (
          <button onClick={clearDone} className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60 transition-colors">
            <Trash2 size={11} />Clear done
          </button>
        )}
      </div>
      {jobs.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-white/20 gap-2">
          <GitCommit size={22} /><p className="text-sm">No jobs queued</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {jobs.map(job => (
            <div key={job.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-white/5 bg-white/[0.03]">
              <JobIcon status={job.status} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/80 truncate">{job.label}</p>
                <div className="flex items-center gap-2 text-xs text-white/30">
                  <span className={cn('font-mono', JOB_TYPE_COLORS[job.type] ?? 'text-white/40')}>{job.type}</span>
                  {job.error
                    ? <span className="text-rose-400 truncate">· {job.error}</span>
                    : <span className="text-white/20">· {new Date(job.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  }
                </div>
              </div>
              {job.status === 'pending' && (
                <button onClick={() => cancelJob(job.id)} className="text-white/20 hover:text-rose-400 transition-colors p-1" title="Cancel">
                  <XCircle size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Tab: Audit Log ───────────────────────────────────────────────────────────

function AuditTab() {
  const { dispatch } = useAdmin()

  function handleRollback(entry: AuditLogEntry) {
    const type = entry.contentType as RevisionContentType
    dispatch({ type: 'CONTENT_SET_STATUS', payload: {
      contentType: type, contentId: entry.contentId,
      status: (entry.previousStatus ?? 'draft') as CmsStatus,
    }})
    dispatch({ type: 'LOG_AUDIT', payload: {
      action: 'rollback', contentType: type,
      contentId: entry.contentId, contentSlug: entry.contentSlug,
      previousStatus: entry.newStatus, newStatus: entry.previousStatus,
      metadata: { via: 'audit-tab' },
    }})
  }

  return <AuditLogViewer onRollback={handleRollback} maxHeight="520px" />
}

// ─── Tab: Revision history ────────────────────────────────────────────────────

function RevisionsTab() {
  return <RevisionLogViewer maxHeight="520px" />
}

// ─── Tab: Slug Map ────────────────────────────────────────────────────────────

function SlugsTab() {
  const { state } = useAdmin()
  const registry   = useMemo(() => buildSlugRegistry(state), [state])
  const collisions = useMemo(() => findCollisions(registry), [registry])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/5 flex-1">
          <Tag size={13} className="text-white/30" />
          <span className="text-sm text-white/50">{registry.length} slugs registered</span>
        </div>
        <div className={cn('flex items-center gap-2 px-3 py-2 rounded-lg border flex-1',
          collisions.length > 0 ? 'bg-rose-500/10 border-rose-500/20' : 'bg-emerald-500/10 border-emerald-500/20',
        )}>
          {collisions.length > 0
            ? <AlertTriangle size={13} className="text-rose-400" />
            : <CheckCircle2 size={13} className="text-emerald-400" />
          }
          <span className={cn('text-sm', collisions.length > 0 ? 'text-rose-300' : 'text-emerald-300')}>
            {collisions.length === 0 ? 'No collisions' : `${collisions.length} collision${collisions.length !== 1 ? 's' : ''}`}
          </span>
        </div>
      </div>

      {collisions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-rose-400/70">Collisions:</p>
          {collisions.map(c => (
            <div key={c.slug} className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 space-y-1.5">
              <p className="font-mono text-sm text-rose-300">/{c.slug}</p>
              {c.conflicts.map((e, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-rose-200/60 ml-3">
                  <ChevronRight size={10} />
                  <span className="font-mono text-white/40">[{e.owner}]</span>
                  <span>{e.label}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
        <p className="text-xs text-white/30 mb-2">Full registry</p>
        {registry.map((e, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-1.5 rounded border border-white/5 bg-white/[0.02] text-xs">
            <span className="text-white/30 font-mono w-16 shrink-0">{e.owner}</span>
            <span className="text-white/60 font-mono truncate flex-1">{e.slug}</span>
            <span className="text-white/30 truncate hidden sm:block">{e.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main panel ───────────────────────────────────────────────────────────────

const TABS: { key: Tab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { key: 'publish',   label: 'Publish',    icon: Send      },
  { key: 'jobs',      label: 'Jobs',       icon: GitCommit },
  { key: 'audit',     label: 'Audit',      icon: History   },
  { key: 'revisions', label: 'Revisions',  icon: RotateCcw },
  { key: 'slugs',     label: 'Slugs',      icon: Tag       },
]

export default function CmsWorkflowPanel() {
  const { jobs } = useJobQueue()
  const [tab, setTab] = useState<Tab>('publish')

  const activeJobs = jobs.filter(j => j.status === 'pending' || j.status === 'running').length

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
          <Workflow size={16} className="text-emerald-400" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">CMS Workflow</h2>
          <p className="text-xs text-white/40">Publish · Jobs · Audit · Revisions · Slugs</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 text-xs border-b-2 transition-colors relative whitespace-nowrap',
              tab === t.key
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-white/40 hover:text-white/70',
            )}
          >
            <t.icon size={12} />
            {t.label}
            {t.key === 'jobs' && activeJobs > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-cyan-500 text-white text-[9px] flex items-center justify-center font-bold">
                {activeJobs > 9 ? '9+' : activeJobs}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {tab === 'publish'   && <PublishTab />}
        {tab === 'jobs'      && <JobsTab />}
        {tab === 'audit'     && <AuditTab />}
        {tab === 'revisions' && <RevisionsTab />}
        {tab === 'slugs'     && <SlugsTab />}
      </div>
    </div>
  )
}
