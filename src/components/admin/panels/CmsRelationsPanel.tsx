'use client'

import React, { useState, useMemo } from 'react'
import {
  Globe, Link2, Calendar, Trash2, Plus, CheckCircle2, Clock,
  XCircle, AlertCircle, Search, ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdmin } from '@/lib/admin/store'
import { useTranslations } from '@/lib/i18n/context'
import type { RevisionContentType, ContentRelationType } from '@/lib/admin/types'
import { checkSlugUniqueness } from '@/lib/content/canonical-id'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CONTENT_TYPES: RevisionContentType[] = ['project', 'research', 'lab', 'system']
const RELATION_TYPES: ContentRelationType[] = ['related', 'references', 'part-of', 'supersedes']

const relLabel: Record<ContentRelationType, string> = {
  'related':    'Related',
  'references': 'References',
  'part-of':    'Part of',
  'supersedes': 'Supersedes',
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.025] p-4 space-y-3">
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">{title}</p>
      {children}
    </div>
  )
}

// ─── Locale Relations ─────────────────────────────────────────────────────────

function LocaleRelationsSection() {
  const { state, dispatch } = useAdmin()
  const relations = state.localeRelations ?? []

  const [ctype, setCtype] = useState<RevisionContentType>('project')
  const [enId, setEnId]   = useState('')
  const [esId, setEsId]   = useState('')

  function add() {
    if (!enId.trim() || !esId.trim()) return
    dispatch({ type: 'SET_LOCALE_RELATION', payload: { contentType: ctype, enId: enId.trim(), esId: esId.trim() } })
    setEnId(''); setEsId('')
  }

  return (
    <Section title="Locale Relations — en ↔ es">
      <p className="font-mono text-[8px] text-white/30">
        Link the English and Spanish canonical IDs of the same content item.
      </p>

      {/* Add form */}
      <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
        <div className="space-y-1">
          <label className="font-mono text-[8px] text-white/40">Type</label>
          <select
            value={ctype}
            onChange={(e) => setCtype(e.target.value as RevisionContentType)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 font-mono text-[9px] text-white/70 focus:border-sky-400/40 focus:outline-none"
          >
            {CONTENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="font-mono text-[8px] text-white/40">EN canonical ID</label>
            <input
              value={enId}
              onChange={(e) => setEnId(e.target.value)}
              placeholder="project:my-project"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 font-mono text-[9px] text-white/70 placeholder-white/20 focus:border-sky-400/40 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-mono text-[8px] text-white/40">ES canonical ID</label>
            <input
              value={esId}
              onChange={(e) => setEsId(e.target.value)}
              placeholder="project:my-project-es"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 font-mono text-[9px] text-white/70 placeholder-white/20 focus:border-sky-400/40 focus:outline-none"
            />
          </div>
        </div>
        <button
          onClick={add}
          disabled={!enId.trim() || !esId.trim()}
          className="flex items-center gap-1.5 rounded-lg border border-sky-400/30 bg-sky-400/10 px-3 py-1.5 font-mono text-[9px] text-sky-400 transition-all hover:bg-sky-400/20 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="h-3 w-3" /> Link
        </button>
      </div>

      {/* List */}
      {relations.length === 0
        ? <p className="font-mono text-[8px] text-white/20 text-center py-2">No locale relations yet.</p>
        : <div className="space-y-1">
            {relations.map((r) => (
              <div key={r.id} className="flex items-center gap-2 rounded-lg bg-white/[0.02] px-3 py-2">
                <Globe className="h-3 w-3 text-emerald-400/60 shrink-0" />
                <span className="font-mono text-[7px] uppercase rounded px-1.5 py-0.5 bg-sky-400/10 text-sky-400/70 shrink-0">{r.contentType}</span>
                <span className="font-mono text-[9px] text-white/55 truncate">{r.enId}</span>
                <span className="font-mono text-[9px] text-white/25 shrink-0">↔</span>
                <span className="font-mono text-[9px] text-white/55 truncate">{r.esId}</span>
                <button
                  onClick={() => dispatch({ type: 'REMOVE_LOCALE_RELATION', payload: r.id })}
                  className="ml-auto shrink-0 rounded p-0.5 text-white/20 hover:text-rose-400/70 transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
      }
    </Section>
  )
}

// ─── Content Relations ────────────────────────────────────────────────────────

function ContentRelationsSection() {
  const { state, dispatch } = useAdmin()
  const relations = state.contentRelations ?? []

  const [srcId,  setSrcId]  = useState('')
  const [srcType, setSrcType] = useState<RevisionContentType>('project')
  const [tgtId,  setTgtId]  = useState('')
  const [tgtType, setTgtType] = useState<RevisionContentType>('project')
  const [relType, setRelType] = useState<ContentRelationType>('related')

  function add() {
    if (!srcId.trim() || !tgtId.trim()) return
    dispatch({
      type: 'ADD_CONTENT_RELATION',
      payload: { sourceId: srcId.trim(), sourceType: srcType, targetId: tgtId.trim(), targetType: tgtType, relationType: relType },
    })
    setSrcId(''); setTgtId('')
  }

  return (
    <Section title="Content Relations — cross-references">
      <p className="font-mono text-[8px] text-white/30">
        Link related content items with typed relations (related, references, part-of, supersedes).
      </p>

      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="font-mono text-[8px] text-white/40">Source type</label>
            <select value={srcType} onChange={(e) => setSrcType(e.target.value as RevisionContentType)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 font-mono text-[9px] text-white/70 focus:border-sky-400/40 focus:outline-none">
              {CONTENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="font-mono text-[8px] text-white/40">Source canonical ID</label>
            <input value={srcId} onChange={(e) => setSrcId(e.target.value)} placeholder="project:my-project"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 font-mono text-[9px] text-white/70 placeholder-white/20 focus:border-sky-400/40 focus:outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <label className="font-mono text-[8px] text-white/40">Relation</label>
            <select value={relType} onChange={(e) => setRelType(e.target.value as ContentRelationType)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 font-mono text-[9px] text-white/70 focus:border-sky-400/40 focus:outline-none">
              {RELATION_TYPES.map((t) => <option key={t} value={t}>{relLabel[t]}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="font-mono text-[8px] text-white/40">Target type</label>
            <select value={tgtType} onChange={(e) => setTgtType(e.target.value as RevisionContentType)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 font-mono text-[9px] text-white/70 focus:border-sky-400/40 focus:outline-none">
              {CONTENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="font-mono text-[8px] text-white/40">Target canonical ID</label>
            <input value={tgtId} onChange={(e) => setTgtId(e.target.value)} placeholder="research:my-paper"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 font-mono text-[9px] text-white/70 placeholder-white/20 focus:border-sky-400/40 focus:outline-none" />
          </div>
        </div>

        <button onClick={add} disabled={!srcId.trim() || !tgtId.trim()}
          className="flex items-center gap-1.5 rounded-lg border border-violet-400/30 bg-violet-400/10 px-3 py-1.5 font-mono text-[9px] text-violet-400 transition-all hover:bg-violet-400/20 disabled:opacity-40 disabled:cursor-not-allowed">
          <Plus className="h-3 w-3" /> Add Relation
        </button>
      </div>

      {relations.length === 0
        ? <p className="font-mono text-[8px] text-white/20 text-center py-2">No content relations yet.</p>
        : <div className="space-y-1">
            {relations.map((r) => (
              <div key={r.id} className="flex items-center gap-2 rounded-lg bg-white/[0.02] px-3 py-2 flex-wrap">
                <Link2 className="h-3 w-3 text-violet-400/60 shrink-0" />
                <span className="font-mono text-[8px] text-white/55">{r.sourceType}/{r.sourceId}</span>
                <span className={cn(
                  'font-mono text-[7px] uppercase rounded px-1.5 py-0.5',
                  r.relationType === 'related'    && 'bg-sky-400/10 text-sky-400/70',
                  r.relationType === 'references' && 'bg-violet-400/10 text-violet-400/70',
                  r.relationType === 'part-of'    && 'bg-emerald-400/10 text-emerald-400/70',
                  r.relationType === 'supersedes' && 'bg-amber-400/10 text-amber-400/70',
                )}>{relLabel[r.relationType]}</span>
                <span className="font-mono text-[8px] text-white/55">{r.targetType}/{r.targetId}</span>
                <button onClick={() => dispatch({ type: 'REMOVE_CONTENT_RELATION', payload: r.id })}
                  className="ml-auto shrink-0 rounded p-0.5 text-white/20 hover:text-rose-400/70 transition-colors">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
      }
    </Section>
  )
}

// ─── Publish Scheduler ────────────────────────────────────────────────────────

function PublishSchedulerSection() {
  const { state, dispatch } = useAdmin()
  const schedules = state.publishSchedules ?? []

  const [ctype,    setCtype]    = useState<RevisionContentType>('project')
  const [contentId, setContentId] = useState('')
  const [slug,     setSlug]     = useState('')
  const [dateTime, setDateTime] = useState('')

  function schedule() {
    if (!contentId.trim() || !slug.trim() || !dateTime) return
    dispatch({
      type: 'SCHEDULE_PUBLISH',
      payload: { contentId: contentId.trim(), contentType: ctype, contentSlug: slug.trim(), scheduledAt: new Date(dateTime).toISOString() },
    })
    setContentId(''); setSlug(''); setDateTime('')
  }

  const pending   = schedules.filter((s) => s.status === 'pending')
  const completed = schedules.filter((s) => s.status !== 'pending')

  return (
    <Section title="Publish Scheduler — future publishes">
      <p className="font-mono text-[8px] text-white/30">
        Schedule a content item to be published at a future date. Applied on next admin load.
      </p>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="font-mono text-[8px] text-white/40">Content type</label>
          <select value={ctype} onChange={(e) => setCtype(e.target.value as RevisionContentType)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 font-mono text-[9px] text-white/70 focus:border-sky-400/40 focus:outline-none">
            {CONTENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="font-mono text-[8px] text-white/40">Content ID (slug or key)</label>
          <input value={contentId} onChange={(e) => setContentId(e.target.value)} placeholder="my-project-id"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 font-mono text-[9px] text-white/70 placeholder-white/20 focus:border-sky-400/40 focus:outline-none" />
        </div>
        <div className="space-y-1">
          <label className="font-mono text-[8px] text-white/40">Slug (for audit log)</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="my-project"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 font-mono text-[9px] text-white/70 placeholder-white/20 focus:border-sky-400/40 focus:outline-none" />
        </div>
        <div className="space-y-1">
          <label className="font-mono text-[8px] text-white/40">Publish at (local time)</label>
          <input type="datetime-local" value={dateTime} onChange={(e) => setDateTime(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 font-mono text-[9px] text-white/70 focus:border-sky-400/40 focus:outline-none [color-scheme:dark]" />
        </div>
      </div>

      <button onClick={schedule} disabled={!contentId.trim() || !slug.trim() || !dateTime}
        className="flex items-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 font-mono text-[9px] text-amber-400 transition-all hover:bg-amber-400/20 disabled:opacity-40 disabled:cursor-not-allowed">
        <Calendar className="h-3 w-3" /> Schedule Publish
      </button>

      {pending.length > 0 && (
        <div className="space-y-1">
          <p className="font-mono text-[8px] text-white/30">Pending ({pending.length})</p>
          {pending.map((s) => (
            <div key={s.id} className="flex items-center gap-2 rounded-lg bg-amber-400/[0.03] border border-amber-400/10 px-3 py-2">
              <Clock className="h-3 w-3 text-amber-400/60 shrink-0" />
              <span className="font-mono text-[8px] text-white/60">{s.contentType}/{s.contentSlug}</span>
              <span className="font-mono text-[8px] text-amber-400/60 ml-auto shrink-0">{s.scheduledAt.slice(0, 16).replace('T', ' ')}</span>
              <button onClick={() => dispatch({ type: 'CANCEL_SCHEDULE', payload: s.id })}
                className="rounded p-0.5 text-white/20 hover:text-rose-400/70 transition-colors">
                <XCircle className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {completed.length > 0 && (
        <div className="space-y-1">
          <p className="font-mono text-[8px] text-white/25">History ({completed.length})</p>
          {completed.slice(0, 5).map((s) => (
            <div key={s.id} className="flex items-center gap-2 rounded-lg bg-white/[0.015] px-3 py-1.5 opacity-60">
              {s.status === 'applied'
                ? <CheckCircle2 className="h-3 w-3 text-emerald-400/60 shrink-0" />
                : <XCircle      className="h-3 w-3 text-rose-400/40 shrink-0" />
              }
              <span className="font-mono text-[8px] text-white/40">{s.contentType}/{s.contentSlug}</span>
              <span className={cn('font-mono text-[7px] rounded px-1 py-0.5 ml-auto shrink-0',
                s.status === 'applied' ? 'bg-emerald-400/10 text-emerald-400/60' : 'bg-white/5 text-white/25'
              )}>{s.status}</span>
            </div>
          ))}
        </div>
      )}
    </Section>
  )
}

// ─── Slug Uniqueness Checker ──────────────────────────────────────────────────

function SlugCheckerSection() {
  const { state } = useAdmin()
  const [slug,  setSlug]  = useState('')
  const [ctype, setCtype] = useState<RevisionContentType>('project')

  const existingIds = useMemo(() => {
    const ids: string[] = []
    state.projectsRegistry.forEach((p) => ids.push(`project:${p.slug}`))
    state.researchRegistry.forEach((r) => ids.push(`research:${r.slug}`))
    state.labsRegistry.forEach((l) => ids.push(`lab:${l.key}`))
    state.systemsRegistry.forEach((s) => ids.push(`system:${s.key}`))
    return ids
  }, [state.projectsRegistry, state.researchRegistry, state.labsRegistry, state.systemsRegistry])

  const result = useMemo(() => {
    if (!slug.trim()) return null
    return checkSlugUniqueness(slug.trim(), ctype, existingIds)
  }, [slug, ctype, existingIds])

  return (
    <Section title="Slug Uniqueness Checker">
      <p className="font-mono text-[8px] text-white/30">
        Verify a slug is unique across all registered content before creating a new item.
        Uses canonical IDs (type:slug) to prevent cross-type collisions.
      </p>

      <div className="grid grid-cols-[auto_1fr] gap-2 items-end">
        <div className="space-y-1">
          <label className="font-mono text-[8px] text-white/40">Type</label>
          <select value={ctype} onChange={(e) => setCtype(e.target.value as RevisionContentType)}
            className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 font-mono text-[9px] text-white/70 focus:border-sky-400/40 focus:outline-none">
            {CONTENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="font-mono text-[8px] text-white/40">Slug to check</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-white/20" />
            <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="my-new-project"
              className="w-full rounded-lg border border-white/10 bg-white/5 pl-7 pr-3 py-1.5 font-mono text-[9px] text-white/70 placeholder-white/20 focus:border-sky-400/40 focus:outline-none" />
          </div>
        </div>
      </div>

      {result && (
        <div className={cn(
          'flex items-start gap-2 rounded-lg border px-3 py-2',
          result.unique
            ? 'border-emerald-400/20 bg-emerald-400/5'
            : 'border-rose-400/20 bg-rose-400/5',
        )}>
          {result.unique
            ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
            : <AlertCircle  className="h-3.5 w-3.5 text-rose-400 shrink-0 mt-0.5" />
          }
          <div>
            <p className={cn('font-mono text-[9px] font-medium', result.unique ? 'text-emerald-400' : 'text-rose-400')}>
              {result.unique ? `"${ctype}:${slug}" is unique ✓` : `Collision detected for "${ctype}:${slug}"`}
            </p>
            {!result.unique && result.collisions.length > 0 && (
              <p className="font-mono text-[8px] text-rose-400/60 mt-0.5">
                Conflicts: {result.collisions.join(', ')}
              </p>
            )}
            <p className="font-mono text-[8px] text-white/30 mt-1">
              Checked against {existingIds.length} canonical IDs in AdminState.
            </p>
          </div>
        </div>
      )}
    </Section>
  )
}

// ─── Audit Log Viewer ─────────────────────────────────────────────────────────

function AuditLogSection() {
  const { state, dispatch } = useAdmin()
  const log = state.auditLog ?? []
  const [expanded, setExpanded] = useState(false)

  const visible = expanded ? log : log.slice(0, 8)

  const actionColor: Record<string, string> = {
    publish:   'bg-emerald-400/10 text-emerald-400/80',
    unpublish: 'bg-amber-400/10 text-amber-400/80',
    archive:   'bg-white/8 text-white/40',
    rollback:  'bg-violet-400/10 text-violet-400/80',
    create:    'bg-sky-400/10 text-sky-400/80',
    update:    'bg-blue-400/10 text-blue-400/80',
    schedule:  'bg-orange-400/10 text-orange-400/80',
    delete:    'bg-rose-400/10 text-rose-400/80',
  }

  return (
    <Section title={`Audit Log — ${log.length}/200 entries`}>
      {log.length === 0
        ? <p className="font-mono text-[8px] text-white/20 text-center py-2">
            Audit log is empty. Status changes are recorded automatically.
          </p>
        : <>
            <div className="space-y-1">
              {visible.map((e) => (
                <div key={e.id} className="flex items-center gap-2 rounded-lg bg-white/[0.02] px-3 py-1.5">
                  <span className={cn('font-mono text-[7px] uppercase rounded px-1.5 py-0.5 shrink-0', actionColor[e.action] ?? 'bg-white/8 text-white/40')}>{e.action}</span>
                  <span className="font-mono text-[8px] text-white/50 truncate">{e.contentType}/{e.contentSlug}</span>
                  {e.previousStatus && e.newStatus && (
                    <span className="font-mono text-[8px] text-white/25 shrink-0">{e.previousStatus} → {e.newStatus}</span>
                  )}
                  <span className="font-mono text-[8px] text-white/20 ml-auto shrink-0">{e.timestamp.slice(0, 16).replace('T', ' ')}</span>
                </div>
              ))}
            </div>
            {log.length > 8 && (
              <button onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 font-mono text-[8px] text-white/30 hover:text-white/50 transition-colors">
                <ChevronDown className={cn('h-3 w-3 transition-transform', expanded && 'rotate-180')} />
                {expanded ? 'Show less' : `Show ${log.length - 8} more`}
              </button>
            )}
            <button onClick={() => dispatch({ type: 'CLEAR_AUDIT_LOG' })}
              className="font-mono text-[8px] text-rose-400/40 hover:text-rose-400/70 transition-colors">
              Clear audit log
            </button>
          </>
      }
    </Section>
  )
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export function CmsRelationsPanel() {
  const t = useTranslations('admin')
  void t

  return (
    <div className="space-y-4 p-4">
      <div className="mb-2">
        <p className="font-mono text-xs font-medium text-white/70">CMS Relations</p>
        <p className="font-mono text-[9px] text-white/30">
          Locale relations · Content relations · Publish scheduler · Slug checker · Audit log
        </p>
      </div>

      <LocaleRelationsSection />
      <ContentRelationsSection />
      <PublishSchedulerSection />
      <SlugCheckerSection />
      <AuditLogSection />
    </div>
  )
}
