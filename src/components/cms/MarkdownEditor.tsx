'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'

// Dynamic import to avoid SSR issues with the DOM-dependent editor
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })
// MDEditor.Markdown is the standalone preview renderer bundled with the package
const MDPreview = dynamic(
  () => import('@uiw/react-md-editor').then((m) => m.default.Markdown as unknown as React.ComponentType<{ source: string }>),
  { ssr: false }
)

type EditorMode = 'edit' | 'preview' | 'split'

export interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  onAutosave?: (value: string) => void
  autosaveMs?: number
  minHeight?: number
  readOnly?: boolean
  placeholder?: string
}

export default function MarkdownEditor({
  value,
  onChange,
  onAutosave,
  autosaveMs = 2000,
  minHeight = 400,
  readOnly = false,
  placeholder = 'Start writing...',
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<EditorMode>('edit')
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestValueRef = useRef(value)
  useEffect(() => { latestValueRef.current = value })

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0
  const charCount = value.length
  const readTime = Math.max(1, Math.round(wordCount / 200))

  const handleChange = useCallback((val?: string) => {
    const next = val ?? ''
    onChange(next)

    if (!onAutosave) return
    setSaveState('saving')
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current)
    autosaveTimerRef.current = setTimeout(() => {
      onAutosave(latestValueRef.current)
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 2500)
    }, autosaveMs)
  }, [onChange, onAutosave, autosaveMs])

  // Clear timer on unmount
  useEffect(() => () => {
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current)
  }, [])

  const autosaveClass = saveState === 'saving'
    ? 'text-amber-400/60'
    : saveState === 'saved'
      ? 'text-emerald-400/60'
      : ''
  const autosaveText = saveState === 'saving' ? 'Saving…'
    : saveState === 'saved' ? 'Saved ✓'
    : 'Autosave'

  return (
    <div className="flex flex-col gap-0 rounded-xl border border-white/8 overflow-hidden" data-color-mode="dark">
      {/* Toolbar */}
      <div className="flex items-center gap-1 border-b border-white/8 bg-white/2 px-3 py-2 flex-wrap">
        <div className="flex rounded-lg border border-white/10 overflow-hidden">
          {(['edit', 'split', 'preview'] as EditorMode[]).map((m) => (
            <button
              key={m}
              type="button"
              className={`px-3 py-1 text-xs font-medium transition-colors ${mode === m ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}
              onClick={() => setMode(m)}
            >
              {m === 'edit' ? 'Edit' : m === 'split' ? 'Split' : 'Preview'}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {onAutosave && (
            <span className={`text-[10px] text-white/25 font-mono ${autosaveClass}`}>
              {autosaveText}
            </span>
          )}
        </div>
      </div>

      {/* Editor area */}
      <div className="relative min-h-[320px] bg-[#080c14]" style={{ minHeight }}>
        {mode === 'preview' ? (
          <div className="prose prose-invert prose-sm max-w-none p-6 min-h-[320px] bg-[#080c14] text-white/80 text-sm leading-relaxed">
            <MDPreview source={value} />
          </div>
        ) : (
          <MDEditor
            value={value}
            onChange={handleChange}
            preview={mode === 'split' ? 'live' : 'edit'}
            hideToolbar={false}
            height={minHeight}
            data-color-mode="dark"
            textareaProps={{ placeholder, readOnly }}
          />
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-4 border-t border-white/5 bg-white/1 px-4 py-2 text-[10px] font-mono text-white/25">
        <span suppressHydrationWarning>{wordCount.toLocaleString('en-US')} words</span>
        <span suppressHydrationWarning>{charCount.toLocaleString('en-US')} chars</span>
        <span>~{readTime} min read</span>
      </div>
    </div>
  )
}
