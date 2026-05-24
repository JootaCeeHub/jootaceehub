'use client'

import { useAdmin } from '@/lib/admin/store'
import { useTranslations } from '@/lib/i18n/context'
import { motion } from 'framer-motion'
import { GripVertical, Eye, EyeOff, ArrowUp, ArrowDown, Layers } from 'lucide-react'
import { useCallback } from 'react'

export default function BlocksPanel() {
  const t = useTranslations('admin')
  const { state, dispatch } = useAdmin()
  const blocks = state.blocks

  const move = useCallback((index: number, dir: -1 | 1) => {
    const next = [...blocks]
    const target = index + dir
    if (target < 0 || target >= next.length) return
    const temp = next[index]
    next[index] = next[target]
    next[target] = temp
    next.forEach((b, i) => { b.order = i })
    dispatch({ type: 'SET_BLOCKS', payload: next })
  }, [blocks, dispatch])

  const toggle = useCallback((id: string) => {
    const next = blocks.map((b) => b.id === id ? { ...b, enabled: !b.enabled } : b)
    dispatch({ type: 'SET_BLOCKS', payload: next })
  }, [blocks, dispatch])

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{t('blocks.title')}</h1>
        <p className="text-xs text-muted-foreground mt-1">{t('blocks.subtitle')}</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-5"
      >
        <div className="mb-4 flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Page Sections</h2>
          <span className="ml-auto text-[10px] text-muted-foreground">
            {blocks.filter((b) => b.enabled).length}/{blocks.length} active
          </span>
        </div>

        <div className="space-y-2">
          {blocks.map((block, index) => (
            <div
              key={block.id}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                block.enabled ? 'border-border bg-background' : 'border-border/50 bg-muted/30 opacity-60'
              }`}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="flex-1 text-sm font-medium">{block.label}</span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted disabled:opacity-30 disabled:pointer-events-none"
                  title="Move up"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => move(index, 1)}
                  disabled={index === blocks.length - 1}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted disabled:opacity-30 disabled:pointer-events-none"
                  title="Move down"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>

              <button
                onClick={() => toggle(block.id)}
                className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                  block.enabled ? 'text-emerald-500 hover:bg-emerald-500/10' : 'text-muted-foreground hover:bg-muted'
                }`}
                title={block.enabled ? 'Disable' : 'Enable'}
              >
                {block.enabled ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-5"
      >
        <h2 className="text-sm font-semibold mb-3">Preview Order</h2>
        <div className="flex flex-wrap gap-2">
          {blocks
            .filter((b) => b.enabled)
            .map((block, i) => (
              <span
                key={block.id}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/20 text-[9px]">{i + 1}</span>
                {block.label}
              </span>
            ))}
        </div>
        {blocks.filter((b) => !b.enabled).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {blocks
              .filter((b) => !b.enabled)
              .map((block) => (
                <span
                  key={block.id}
                  className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground line-through"
                >
                  {block.label}
                </span>
              ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
