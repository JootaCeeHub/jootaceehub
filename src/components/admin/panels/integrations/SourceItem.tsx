'use client'

import { useState } from 'react'
import { Eye, EyeOff, ExternalLink, Trash2 } from 'lucide-react'
import type { DataSource } from '@/lib/admin/types'
import { TYPE_ICONS, STATUS_ICONS, formatBytes } from './constants'
import { SOURCE_TYPE_META, STATUS_META } from '@/lib/integrations/sources'

interface Props {
  source: DataSource
  onRemove: () => void
}

export function SourceItem({ source, onRemove }: Props) {
  const [expanded, setExpanded] = useState(false)
  const TypeIcon = TYPE_ICONS[source.type] ?? TYPE_ICONS['file']
  const StatusIcon = STATUS_ICONS[source.status]
  const typeMeta = SOURCE_TYPE_META[source.type]
  const statusMeta = STATUS_META[source.status]

  return (
    <div>
      <div className="group flex items-start gap-3 px-4 py-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-white/[0.03]" style={{ borderColor: `${typeMeta.accent}20` }}>
          <TypeIcon className="h-4 w-4" style={{ color: typeMeta.accent }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="truncate font-mono text-[11px] font-semibold text-white/75">{source.name}</div>
          <div className="mt-0.5 truncate font-mono text-[9px] text-white/30">{source.description}</div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span
              className="rounded-full border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider"
              style={{ color: typeMeta.accent, borderColor: `${typeMeta.accent}30`, background: `${typeMeta.accent}10` }}
            >
              {typeMeta.label}
            </span>
            <div className="flex items-center gap-1">
              <StatusIcon className={`h-3 w-3 ${statusMeta.color} ${source.status === 'indexing' ? 'animate-spin' : ''}`} />
              <span className={`font-mono text-[9px] ${statusMeta.color}`}>{statusMeta.label}</span>
            </div>
            {source.byteSize > 0 && <span className="font-mono text-[9px] text-white/25">{formatBytes(source.byteSize)}</span>}
            {source.fileTree.length > 0 && (
              <span className="font-mono text-[9px] text-white/20">{source.fileTree.length} files</span>
            )}
          </div>
          {source.error && <div className="mt-1 font-mono text-[9px] text-red-400/80">{source.error}</div>}
        </div>
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {source.content && (
            <button onClick={() => setExpanded((v) => !v)} className="flex h-6 w-6 items-center justify-center rounded-md text-white/30 transition-colors hover:bg-white/8 hover:text-white/70" title="Preview content">
              {expanded ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          )}
          {source.url && (
            <a href={source.url} target="_blank" rel="noopener noreferrer" className="flex h-6 w-6 items-center justify-center rounded-md text-white/30 transition-colors hover:bg-white/8 hover:text-white/70">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          <button onClick={onRemove} className="flex h-6 w-6 items-center justify-center rounded-md text-white/20 transition-colors hover:bg-red-400/10 hover:text-red-400" title="Remove source">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {expanded && source.content && (
        <div className="border-t border-white/8 bg-black/20 px-4 py-3">
          <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.16em] text-white/30">Content preview</div>
          <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap font-mono text-[10px] leading-relaxed text-white/50">{source.content.slice(0, 3000)}</pre>
          {source.fileTree.length > 0 && (
            <div className="mt-2 max-h-32 overflow-y-auto">
              <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.16em] text-white/30 mt-2">File tree ({source.fileTree.length})</div>
              {source.fileTree.slice(0, 40).map((p) => (
                <div key={p} className="font-mono text-[9px] text-white/30">{p}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
