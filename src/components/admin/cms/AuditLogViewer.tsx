'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useAdmin } from '@/lib/admin/store'
import type { AuditLogEntry, CmsStatus } from '@/lib/admin/types'
import {
  History,
  Search,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Tag,
} from 'lucide-react'

// ─── Status badge ──────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<CmsStatus, string> = {
  draft:     'bg-yellow-500/15 border-yellow-500/30 text-yellow-400',
  review:    'bg-blue-500/15 border-blue-500/30 text-blue-400',
  published: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
  archived:  'bg-white/10 border-white/20 text-white/40',
}

const ACTION_COLORS: Record<AuditLogEntry['action'], string> = {
  create:    'text-cyan-400',
  update:    'text-blue-400',
  publish:   'text-emerald-400',
  unpublish: 'text-yellow-400',
  archive:   'text-white/40',
  rollback:  'text-rose-400',
  schedule:  'text-purple-400',
  delete:    'text-red-400',
}

function StatusPill({ status }: { status?: CmsStatus }) {
  if (!status) return null
  return (
    <span className={cn('px-1.5 py-0.5 rounded border text-xs font-mono', STATUS_COLORS[status])}>
      {status}
    </span>
  )
}

// ─── Audit entry row ──────────────────────────────────────────────────────────

function AuditRow({
  entry,
  onRollback,
}: {
  entry: AuditLogEntry
  onRollback?: (entry: AuditLogEntry) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const date = new Date(entry.timestamp)
  const hasMetadata = entry.metadata && Object.keys(entry.metadata).length > 0

  return (
    <div className="border border-white/5 rounded-lg overflow-hidden">
      <div
        className="flex items-center gap-3 px-3 py-2 bg-white/5 hover:bg-white/8 cursor-pointer transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {hasMetadata
          ? expanded ? <ChevronDown size={12} className="text-white/40 shrink-0" /> : <ChevronRight size={12} className="text-white/40 shrink-0" />
          : <div className="w-3" />
        }
        <span className={cn('text-xs font-mono font-semibold w-20 shrink-0', ACTION_COLORS[entry.action])}>
          {entry.action}
        </span>
        <span className="text-xs font-mono text-white/50 shrink-0 hidden sm:block">
          [{entry.contentType}]
        </span>
        <span className="text-xs text-white/70 truncate font-mono flex-1">
          {entry.contentSlug}
        </span>
        {entry.previousStatus && entry.newStatus && (
          <div className="flex items-center gap-1 shrink-0">
            <StatusPill status={entry.previousStatus} />
            <span className="text-white/20 text-xs">→</span>
            <StatusPill status={entry.newStatus} />
          </div>
        )}
        <time className="text-xs text-white/30 shrink-0 hidden md:block" title={entry.timestamp}>
          {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {' '}
          {date.toLocaleDateString([], { month: 'short', day: 'numeric' })}
        </time>
        {onRollback && entry.action === 'publish' && (
          <button
            onClick={e => { e.stopPropagation(); onRollback(entry) }}
            className="flex items-center gap-1 px-2 py-1 rounded border border-white/10 text-white/40 hover:text-rose-400 hover:border-rose-500/30 text-xs transition-colors shrink-0"
            title="Rollback this publish"
          >
            <RotateCcw size={10} />
          </button>
        )}
      </div>

      {expanded && hasMetadata && (
        <div className="px-3 py-2 bg-white/3 border-t border-white/5 space-y-1">
          {Object.entries(entry.metadata!).map(([k, v]) => (
            <div key={k} className="flex gap-3 text-xs">
              <span className="text-white/30 font-mono w-28 shrink-0">{k}</span>
              <span className="text-white/60">{v}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  onRollback?: (entry: AuditLogEntry) => void
  maxHeight?: string
}

export function AuditLogViewer({ onRollback, maxHeight = '480px' }: Props) {
  const { state } = useAdmin()
  const log = useMemo(() => state.auditLog ?? [], [state.auditLog])

  const [search, setSearch] = useState('')
  const [filterAction, setFilterAction] = useState<AuditLogEntry['action'] | 'all'>('all')
  const [filterType, setFilterType] = useState<string>('all')

  const contentTypes = useMemo(() => {
    const types = new Set(log.map(e => e.contentType))
    return ['all', ...Array.from(types)]
  }, [log])

  const filtered = useMemo(() => {
    return log.filter(e => {
      if (filterAction !== 'all' && e.action !== filterAction) return false
      if (filterType !== 'all' && e.contentType !== filterType) return false
      if (search) {
        const q = search.toLowerCase()
        return e.contentSlug.includes(q) || e.action.includes(q) || e.contentType.includes(q)
      }
      return true
    })
  }, [log, filterAction, filterType, search])

  const ACTIONS: (AuditLogEntry['action'] | 'all')[] = ['all', 'create', 'update', 'publish', 'unpublish', 'archive', 'rollback', 'delete']

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <History size={14} className="text-white/40" />
        <span className="text-sm font-medium text-white/70">Audit Log</span>
        <span className="ml-auto text-xs text-white/30">{log.length} entries</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[140px]">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search slug…"
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/80 text-xs focus:outline-none focus:border-cyan-500/30"
          />
        </div>
        <select
          value={filterAction}
          onChange={e => setFilterAction(e.target.value as typeof filterAction)}
          className="px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs focus:outline-none"
        >
          {ACTIONS.map(a => <option key={a} value={a}>{a === 'all' ? 'All actions' : a}</option>)}
        </select>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs focus:outline-none"
        >
          {contentTypes.map(t => <option key={t} value={t}>{t === 'all' ? 'All types' : t}</option>)}
        </select>
      </div>

      {/* Log list */}
      <div
        className="space-y-1.5 overflow-y-auto pr-1"
        style={{ maxHeight }}
      >
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-white/20 gap-2">
            <Tag size={24} />
            <p className="text-sm">No audit entries</p>
          </div>
        ) : (
          filtered.map(entry => (
            <AuditRow key={entry.id} entry={entry} onRollback={onRollback} />
          ))
        )}
      </div>
    </div>
  )
}
