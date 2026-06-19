'use client'

import React, { useRef, useState, useCallback } from 'react'
import { uploadToCloudinary, validateFile } from '@/lib/cloudinary/upload'
import { formatBytes } from '@/lib/cms/media'
import type { UploadProgress } from '@/lib/cloudinary/upload'
import type { MediaAssetInsert } from '@/lib/cms/media'

export interface MediaUploaderProps {
  onUploaded: (asset: Omit<MediaAssetInsert, 'uploaded_by'>) => void
  folder?: string
  multiple?: boolean
}

interface UploadItem {
  id: string
  file: File
  preview: string | null
  progress: number
  status: 'pending' | 'uploading' | 'done' | 'error'
  error: string | null
}

export default function MediaUploader({ onUploaded, folder, multiple = true }: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState<UploadItem[]>([])
  const [dragActive, setDragActive] = useState(false)

  const updateItem = useCallback((id: string, patch: Partial<UploadItem>) => {
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, ...patch } : it))
  }, [])

  const processFiles = useCallback(async (files: File[]) => {
    const newItems: UploadItem[] = files.map((file) => {
      const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : null
      return { id: `${file.name}-${Date.now()}`, file, preview, progress: 0, status: 'pending' as const, error: null }
    })

    // Validate all first
    const validated = newItems.map((item) => {
      const { valid, error } = validateFile(item.file)
      return valid ? item : { ...item, status: 'error' as const, error: error ?? 'Invalid file' }
    })

    setItems((prev) => [...prev, ...validated])

    // Upload valid items
    for (const item of validated) {
      if (item.status === 'error') continue

      updateItem(item.id, { status: 'uploading' })

      const onProgress = ({ percent }: UploadProgress) => {
        updateItem(item.id, { progress: percent })
      }

      const { result, error } = await uploadToCloudinary(item.file, { folder, onProgress })

      if (error || !result) {
        updateItem(item.id, { status: 'error', error: error ?? 'Upload failed' })
        continue
      }

      updateItem(item.id, { status: 'done', progress: 100 })

      onUploaded({
        filename: item.file.name,
        original_url: result.secure_url,
        width: result.width ?? null,
        height: result.height ?? null,
        size_bytes: result.bytes,
        mime_type: item.file.type,
      })
    }
  }, [folder, onUploaded, updateItem])

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return
    processFiles(Array.from(fileList))
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragActive(false)
    handleFiles(e.dataTransfer.files)
  }

  function removeItem(id: string) {
    setItems((prev) => {
      const item = prev.find((it) => it.id === id)
      if (item?.preview) URL.revokeObjectURL(item.preview)
      return prev.filter((it) => it.id !== id)
    })
  }

  const statusLabel = (item: UploadItem) => {
    if (item.status === 'uploading') return `${item.progress}%`
    if (item.status === 'done') return 'Uploaded ✓'
    if (item.status === 'error') return item.error ?? 'Error'
    return 'Pending'
  }

  const statusClass = (status: UploadItem['status']) => {
    if (status === 'uploading') return 'text-amber-400/70'
    if (status === 'done') return 'text-emerald-400/70'
    if (status === 'error') return 'text-red-400/70'
    return ''
  }

  return (
    <div className="space-y-3">
      <div
        className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/10 bg-white/2 px-6 py-10 text-center transition-colors cursor-pointer hover:border-rose-500/30 hover:bg-white/4${dragActive ? ' border-rose-500/50 bg-rose-500/5' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        aria-label="Upload files"
      >
        <input
          ref={inputRef}
          type="file"
          className="absolute inset-0 cursor-pointer opacity-0"
          multiple={multiple}
          accept="image/*,video/mp4,video/webm,application/pdf"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="text-3xl opacity-30">📁</div>
        <p className="text-sm font-medium text-white/50">
          {dragActive ? 'Drop files here' : 'Click or drag files to upload'}
        </p>
        <p className="text-xs text-white/25">Images (10MB), Videos (100MB), PDFs</p>
      </div>

      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-lg border border-white/8 bg-white/3 p-3">
              <div className="h-10 w-10 flex-none overflow-hidden rounded-lg border border-white/8 bg-white/5 flex items-center justify-center text-lg">
                {item.preview
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={item.preview} alt={item.file.name} className="h-full w-full object-cover" />
                  : '📄'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs font-medium text-white/70">{item.file.name}</p>
                <p className="text-[10px] text-white/30">{formatBytes(item.file.size)}</p>
                {item.status === 'uploading' && (
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/8">
                    <div className="h-full bg-rose-400 transition-all duration-200" style={{ width: `${item.progress}%` }} />
                  </div>
                )}
                <span className={`text-[10px] ${statusClass(item.status)}`}>
                  {statusLabel(item)}
                </span>
              </div>
              <button
                type="button"
                className="flex-none text-white/20 hover:text-red-400 transition-colors cursor-pointer"
                onClick={() => removeItem(item.id)}
                aria-label="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
