'use client'

import { useState, useCallback } from 'react'
import { Plus, Loader2, Globe, Database } from 'lucide-react'
import { useAdmin } from '@/lib/admin/store'
import type { DataSource } from '@/lib/admin/types'
import { fetchUrlSource, createDatabaseSource } from '@/lib/integrations/sources'
import { SourceItem } from './SourceItem'

interface Props {
  onNavigateToSources: () => void
}

export function LinksTab({ onNavigateToSources }: Props) {
  const { state, dispatch } = useAdmin()
  const { dataSources } = state.integrations

  const [linkUrl, setLinkUrl] = useState('')
  const [linkName, setLinkName] = useState('')
  const [linkType, setLinkType] = useState<'url' | 'database'>('url')
  const [isAddingLink, setIsAddingLink] = useState(false)
  const [linkError, setLinkError] = useState<string | null>(null)

  const addSource = useCallback((src: DataSource) => {
    dispatch({ type: 'SOURCES_ADD', payload: src })
  }, [dispatch])

  const removeSource = useCallback((id: string) => {
    dispatch({ type: 'SOURCES_REMOVE', payload: id })
  }, [dispatch])

  const handleAddLink = useCallback(async () => {
    if (!linkUrl.trim()) return
    setIsAddingLink(true)
    setLinkError(null)
    try {
      let src: DataSource
      if (linkType === 'database') {
        src = createDatabaseSource(linkName.trim(), linkUrl.trim())
      } else {
        new URL(linkUrl.trim()) // validate
        src = await fetchUrlSource(linkUrl.trim())
        if (linkName.trim()) src = { ...src, name: linkName.trim() }
      }
      addSource(src)
      setLinkUrl('')
      setLinkName('')
      onNavigateToSources()
    } catch (err) {
      setLinkError(err instanceof Error ? err.message : 'Invalid URL')
    } finally {
      setIsAddingLink(false)
    }
  }, [addSource, linkName, linkType, linkUrl, onNavigateToSources])

  const linkSources = dataSources.filter((s) => s.type === 'url' || s.type === 'database')

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-white/8 bg-white/[0.02]">
        <div className="flex items-center justify-between border-b border-white/8 px-4 py-2.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">Add Link or Database</span>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <div className="font-mono text-[10px] text-white/40">Tipo</div>
            <div className="flex gap-2">
              {([['url', 'URL / Web', Globe], ['database', 'Database', Database]] as const).map(([t, label, Icon]) => (
                <button
                  key={t}
                  onClick={() => setLinkType(t)}
                  className={`rounded-full border px-3 py-1 font-mono text-[9px] uppercase tracking-wider transition-colors ${linkType === t ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-400' : 'border-white/10 text-white/35 hover:border-white/20'}`}
                >
                  <Icon className="h-3 w-3 inline mr-1" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="font-mono text-[10px] text-white/40">Nombre (opcional)</div>
            <input
              type="text"
              placeholder={linkType === 'database' ? 'Nombre de la base de datos' : 'Alias legible…'}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 font-mono text-[11px] text-white/70 placeholder-white/20 outline-none focus:border-white/20"
              value={linkName}
              onChange={(e) => setLinkName(e.target.value)}
            />
          </div>

          <div>
            <div className="font-mono text-[10px] text-white/40">
              {linkType === 'database' ? 'Connection String' : 'URL'}
            </div>
            <input
              type={linkType === 'database' ? 'password' : 'text'}
              placeholder={linkType === 'database' ? 'postgresql://user:pass@host:5432/db' : 'https://docs.example.com/api-reference'}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 font-mono text-[11px] text-white/70 placeholder-white/20 outline-none transition-colors focus:border-white/20"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
            />
          </div>

          {linkType === 'url' && (
            <div className="font-mono text-[9px] text-white/20 leading-relaxed">
              Se intentará hacer fetch del contenido. Si hay CORS, se guardará como referencia de URL para el asistente IA.
            </div>
          )}
          {linkType === 'database' && (
            <div className="font-mono text-[9px] text-white/20 leading-relaxed">
              La connection string se guarda localmente (cifrado de navegador). Úsala en el Asistente IA para generar consultas SQL.
            </div>
          )}

          {linkError && <div className="font-mono text-[10px] text-red-400">{linkError}</div>}

          <button
            onClick={handleAddLink}
            disabled={!linkUrl.trim() || isAddingLink}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/25 bg-cyan-400/8 py-2 font-mono text-[11px] text-cyan-400 transition-colors hover:bg-cyan-400/15 disabled:opacity-40"
          >
            {isAddingLink
              ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Procesando…</>
              : <><Plus className="h-3.5 w-3.5" />Añadir {linkType === 'database' ? 'base de datos' : 'enlace'}</>
            }
          </button>
        </div>
      </div>

      {linkSources.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-white/8 bg-white/[0.02]">
          <div className="flex items-center justify-between border-b border-white/8 px-4 py-2.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">Links &amp; Databases</span>
            <span className="font-mono text-[9px] text-white/20">{linkSources.length}</span>
          </div>
          <div className="divide-y divide-white/5">
            {linkSources.map((src) => (
              <SourceItem key={src.id} source={src} onRemove={() => removeSource(src.id)} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
