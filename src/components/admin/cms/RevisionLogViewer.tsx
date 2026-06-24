'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useAdmin } from '@/lib/admin/store'
import type { ContentRevision, RevisionContentType } from '@/lib/admin/types'
import {
  History,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Filter,
  Trash2,
} from 'lucide-react'

// ─── Rollback confirmation dialog ─────────────────────────────────────────────

interface ConfirmRollbackProps {
  revision: ContentRevision
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmRollbackDialog({ revision, onConfirm, onCancel }: ConfirmRollbackProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-xl border border-rose-500/20 bg-[#0d0d1a] p-5 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-rose-500/15 border border-rose-500/25 flex items-center justify-center shrink-0">
            <AlertTriangle size={16} className="text-rose-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Confirm Rollback</p>
            <p className="text-xs text-white/40">This will overwrite the current content</p>
          </div>
        </div>

        <div className="rounded-lg bg-white/5 border border-white/8 p-3 space-y-1 text-xs">
          <div className="flex gap-2">
            <span className="text-white/30 w-20 shrink-0">Type</span>
            <span className="text-white/60 font-mono">{revision.contentType}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-white/30 w-20 shrink-0">Content ID</span>
            <span className="text-white/60 font-mono truncate">{revision.contentId}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-white/30 w-20 shrink-0">Saved at</span>
            <span className="text-white/60">{new Date(revision.savedAt).toLocaleString()}</span>
          </div>
          {revision.note && (
            <div className="flex gap-2">
              <span className="text-white/30 w-20 shrink-0">Note</span>
              <span className="text-white/60 italic">{revision.note}</span>
            </div>
          )}
        </div>

        <p className="text-xs text-white/40">
          The snapshot fields will replace the current item. A new revision is auto-saved before restoring.
        </p>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-2 text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-sm hover:bg-rose-500/30 transition-colors"
          >
            <RotateCcw size={13} />
            Rollback
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Revision row ─────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<RevisionContentType, string> = {
  project:  'text-purple-400',
  research: 'text-emerald-400',
  lab:      'text-yellow-400',
  system:   'text-cyan-400',
}

function RevisionRow({
  revision,
  onRollback,
  onDelete,
}: {
  revision: ContentRevision
  onRollback: (rev: ContentRevision) => void
  onDelete: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const date = new Date(revision.savedAt)
  const snapKeys = Object.keys(revision.snapshot).slice(0, 8)

  return (
    <div className="border border-white/5 rounded-lg overflow-hidden">
      <div
        className="flex items-center gap-3 px-3 py-2.5 bg-white/[0.03] hover:bg-white/[0.06] cursor-pointer transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded
          ? <ChevronDown size={12} className="text-white/30 shrink-0" />
          : <ChevronRight size={12} className="text-white/30 shrink-0" />
        }

        <span className={cn('text-xs font-mono font-semibold w-16 shrink-0', TYPE_COLORS[revision.contentType])}>
          {revision.contentType}
        </span>

        <span className="text-xs text-white/60 truncate font-mono flex-1">
          {revision.contentId}
        </span>

        {revision.note && (
          <span className="text-xs text-white/30 italic truncate hidden sm:block max-w-[140px]">
            {revision.note}
          </span>
        )}

        <time className="text-xs text-white/25 shrink-0 hidden md:block" title={revision.savedAt}>
          {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {' '}
          {date.toLocaleDateString([], { month: 'short', day: 'numeric' })}
        </time>

        <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => onRollback(revision)}
            className="flex items-center gap-1 px-2 py-1 rounded border border-white/8 text-white/35 hover:text-rose-400 hover:border-rose-500/30 text-xs transition-colors"
            title="Rollback to this revision"
          >
            <RotateCcw size={10} />
            Restore
          </button>
          <button
            onClick={() => onDelete(revision.id)}
            className="p-1 text-white/20 hover:text-rose-400 transition-colors"
            title="Delete this revision"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-3 py-2.5 bg-white/[0.015] border-t border-white/5 space-y-1.5">
          <p className="text-xs text-white/25 mb-2">Snapshot fields (first {snapKeys.length}):</p>
          {snapKeys.map(k => {
            const v = revision.snapshot[k]
            const display = typeof v === 'object' ? JSON.stringify(v).slice(0, 60) : String(v ?? '—')
            return (
              <div key={k} className="flex gap-3 text-xs">
                <span className="text-white/25 font-mono w-28 shrink-0">{k}</span>
                <span className="text-white/55 truncate">{display}</span>
              </div>
            )
          })}
          {Object.keys(revision.snapshot).length > 8 && (
            <p className="text-xs text-white/20">… and {Object.keys(revision.snapshot).length - 8} more fields</p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  filterType?: RevisionContentType
  maxHeight?: string
}

export function RevisionLogViewer({ filterType, maxHeight = '480px' }: Props) {
  const { state, dispatch } = useAdmin()
  const revisions = useMemo(() => state.revisionLog ?? [], [state.revisionLog])

  const [pendingRollback, setPendingRollback] = useState<ContentRevision | null>(null)
  const [typeFilter, setTypeFilter] = useState<RevisionContentType | 'all'>(filterType ?? 'all')

  const filtered = useMemo(() => {
    const list = typeFilter === 'all'
      ? revisions
      : revisions.filter(r => r.contentType === typeFilter)
    return [...list].sort((a, b) => b.savedAt.localeCompare(a.savedAt))
  }, [revisions, typeFilter])

  function handleRollback(rev: ContentRevision) {
    setPendingRollback(rev)
  }

  function confirmRollback() {
    if (!pendingRollback) return
    dispatch({ type: 'RESTORE_REVISION', payload: pendingRollback })
    dispatch({
      type: 'LOG_AUDIT',
      payload: {
        action: 'rollback',
        contentType: pendingRollback.contentType,
        contentId: pendingRollback.contentId,
        contentSlug: String(pendingRollback.snapshot['slug'] ?? pendingRollback.contentId),
        metadata: { revisionId: pendingRollback.id, restoredAt: new Date().toISOString() },
      },
    })
    setPendingRollback(null)
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this revision?')) return
    dispatch({
      type: 'CLEAR_REVISIONS',
      payload: (() => {
        const rev = revisions.find(r => r.id === id)
        return { contentId: id, contentType: rev?.contentType ?? 'project' }
      })(),
    })
  }

  const TYPES: (RevisionContentType | 'all')[] = ['all', 'project', 'research', 'lab', 'system']

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <History size={14} className="text-white/40" />
        <span className="text-sm font-medium text-white/70">Revision History</span>
        <span className="ml-auto text-xs text-white/30">{revisions.length}/50 entries</span>
      </div>

      {/* Type filter */}
      <div className="flex items-center gap-1 flex-wrap">
        <Filter size={11} className="text-white/25" />
        {TYPES.map(t => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={cn(
              'px-2 py-1 rounded text-xs border transition-colors',
              typeFilter === t
                ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300'
                : 'bg-white/5 border-white/8 text-white/35 hover:text-white/60',
            )}
          >
            {t === 'all' ? `All (${revisions.length})` : `${t} (${revisions.filter(r => r.contentType === t).length})`}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-1.5 overflow-y-auto pr-1" style={{ maxHeight }}>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-white/20 gap-2">
            <History size={22} />
            <p className="text-sm">No revisions yet</p>
            <p className="text-xs text-white/15">Revisions are auto-saved on status changes</p>
          </div>
        ) : (
          filtered.map(rev => (
            <RevisionRow
              key={rev.id}
              revision={rev}
              onRollback={handleRollback}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Rollback confirmation */}
      {pendingRollback && (
        <ConfirmRollbackDialog
          revision={pendingRollback}
          onConfirm={confirmRollback}
          onCancel={() => setPendingRollback(null)}
        />
      )}
    </div>
  )
}
