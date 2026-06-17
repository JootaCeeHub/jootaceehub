'use client'

import { useCallback } from 'react'
import { X, Search } from 'lucide-react'
import { useAdmin } from '@/lib/admin/store'
import { SourceItem } from './SourceItem'

export function SourcesTab() {
  const { state, dispatch } = useAdmin()
  const { dataSources } = state.integrations
  const readySources = dataSources.filter((s) => s.status === 'ready').length

  const removeSource = useCallback((id: string) => {
    dispatch({ type: 'SOURCES_REMOVE', payload: id })
  }, [dispatch])

  return (
    <div className="overflow-hidden rounded-xl border border-white/8 bg-white/[0.02]">
      <div className="flex items-center justify-between border-b border-white/8 px-4 py-2.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">All Data Sources</span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] text-white/20">{readySources}/{dataSources.length} ready</span>
          {dataSources.length > 0 && (
            <button
              onClick={() => { if (confirm('Remove all data sources?')) dispatch({ type: 'SOURCES_CLEAR_ALL' }) }}
              className="flex items-center gap-1.5 rounded-lg border border-red-400/15 px-2.5 py-1 font-mono text-[9px] text-red-400/50 transition-colors hover:bg-red-400/8 hover:text-red-400"
            >
              <X className="h-3 w-3" />
              Clear all
            </button>
          )}
        </div>
      </div>
      {dataSources.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.02]">
            <Search className="h-5 w-5 text-white/20" />
          </div>
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/25">No sources yet</div>
          <div className="mt-1 font-mono text-[10px] text-white/15">Add GitHub repos, files, URLs, or databases from the tabs above</div>
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {dataSources.map((src) => (
            <SourceItem key={src.id} source={src} onRemove={() => removeSource(src.id)} />
          ))}
        </div>
      )}
    </div>
  )
}
