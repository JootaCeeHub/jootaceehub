'use client'

import { useState, useCallback, useRef } from 'react'
import { FileText, FolderOpen } from 'lucide-react'
import { useAdmin } from '@/lib/admin/store'
import type { DataSource } from '@/lib/admin/types'
import { readFileSource, readFolderSource } from '@/lib/integrations/sources'
import { SourceItem } from './SourceItem'

interface Props {
  onNavigateToSources: () => void
}

export function FilesTab({ onNavigateToSources }: Props) {
  const { state, dispatch } = useAdmin()
  const { dataSources } = state.integrations
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)

  const addSource = useCallback((src: DataSource) => {
    dispatch({ type: 'SOURCES_ADD', payload: src })
  }, [dispatch])

  const removeSource = useCallback((id: string) => {
    dispatch({ type: 'SOURCES_REMOVE', payload: id })
  }, [dispatch])

  const processFiles = useCallback(async (files: FileList | File[]) => {
    for (const file of Array.from(files)) {
      const src = await readFileSource(file)
      addSource(src)
    }
    onNavigateToSources()
  }, [addSource, onNavigateToSources])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length) await processFiles(e.dataTransfer.files)
  }, [processFiles])

  const handleFolderInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    const src = await readFolderSource(files)
    addSource(src)
    onNavigateToSources()
    if (folderInputRef.current) folderInputRef.current.value = ''
  }, [addSource, onNavigateToSources])

  const fileSources = dataSources.filter((s) => s.type === 'file' || s.type === 'archive' || s.type === 'folder')

  return (
    <div className="space-y-3">
      <div
        className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-colors ${isDragging ? 'border-cyan-400/50 bg-cyan-400/5' : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
          <FileText className="h-5 w-5 text-white/30" />
        </div>
        <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/40">Arrastra archivos aquí</div>
        <div className="mt-1 font-mono text-[10px] text-white/25">o haz clic para seleccionar</div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".md,.mdx,.txt,.ts,.tsx,.js,.jsx,.json,.yaml,.yml,.csv,.py,.go,.rs,.sql,.html,.css,.toml,.sh,.zip"
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={(e) => e.target.files && processFiles(e.target.files)}
        />
        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {['.md', '.ts', '.py', '.json', '.csv', '.sql', '.zip', '.yaml', '…'].map((ext) => (
            <span key={ext} className="rounded-full border border-white/8 px-2 py-0.5 font-mono text-[8px] uppercase text-white/30">{ext}</span>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/8 bg-white/[0.02]">
        <div className="flex items-center justify-between border-b border-white/8 px-4 py-2.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">Carpeta completa</span>
        </div>
        <div className="p-4">
          <p className="mb-3 font-mono text-[10px] text-white/35 leading-relaxed">
            Sube una carpeta entera. Se indexarán los archivos de texto (excluyendo node_modules / dist / .next).
          </p>
          <button
            onClick={() => folderInputRef.current?.click()}
            className="mt-3 flex items-center gap-2 mx-auto rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 font-mono text-[10px] text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white/65"
          >
            <FolderOpen className="h-4 w-4" />
            Seleccionar carpeta
          </button>
          <input
            ref={folderInputRef}
            type="file"
            // @ts-expect-error – webkitdirectory is non-standard but widely supported
            webkitdirectory=""
            multiple
            className="hidden"
            onChange={handleFolderInput}
          />
        </div>
      </div>

      {fileSources.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-white/8 bg-white/[0.02]">
          <div className="flex items-center justify-between border-b border-white/8 px-4 py-2.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">Added files</span>
            <span className="font-mono text-[9px] text-white/20">{fileSources.length} sources</span>
          </div>
          <div className="divide-y divide-white/5">
            {fileSources.map((src) => (
              <SourceItem key={src.id} source={src} onRemove={() => removeSource(src.id)} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
