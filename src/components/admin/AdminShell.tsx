'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useAdmin } from '@/lib/admin/store'
import { useTranslations } from '@/lib/i18n/context'
import type { AdminPanel } from '@/lib/admin/types'
import {
  LayoutDashboard,
  Settings,
  Layers,
  Menu,
  Palette,
  Sparkles,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Save,
  Download,
  Upload,
  RotateCcw,
} from 'lucide-react'
import { useState, useCallback } from 'react'

const panelIcons: Record<AdminPanel, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  config: Settings,
  blocks: Layers,
  navbar: Menu,
  design: Palette,
  personality: Sparkles,
  results: BarChart3,
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { state, dispatch, exportJSON, importJSON } = useAdmin()
  const t = useTranslations('admin')
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const panelIds: AdminPanel[] = ['dashboard', 'config', 'blocks', 'navbar', 'design', 'personality', 'results']

  const handleExport = useCallback(() => {
    const blob = new Blob([exportJSON()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `jootacee-admin-config-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [exportJSON])

  const handleImport = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      const text = await file.text()
      const ok = importJSON(text)
      if (!ok) alert('Invalid JSON file')
    }
    input.click()
  }, [importJSON])

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen border-r border-border bg-card transition-all duration-300 lg:static ${
          collapsed ? 'w-[4.5rem]' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex h-14 items-center border-b border-border px-4">
          <div className={`flex items-center gap-2 overflow-hidden ${collapsed ? 'justify-center w-full' : ''}`}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-xs font-bold">JC</span>
            </div>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                className="whitespace-nowrap text-sm font-semibold"
              >
                {t('title')}
              </motion.span>
            )}
          </div>
        </div>

        <nav className="space-y-1 p-3">
          {panelIds.map((id) => {
            const active = state.panel === id
            const Icon = panelIcons[id]
            const label = t(`sidebar.${id}`)
            return (
              <button
                key={id}
                onClick={() => {
                  dispatch({ type: 'SET_PANEL', payload: id })
                  setMobileOpen(false)
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? label : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="whitespace-nowrap">{label}</span>}
              </button>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-3">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {!collapsed && <span>{t('header.collapse')}</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>
            <h1 className="text-sm font-semibold capitalize">{state.panel}</h1>
            {state.unsaved && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-500">
                <Save className="h-3 w-3" />
                {t('header.unsaved')}
              </span>
            )}
            {state.lastSaved && !state.unsaved && (
              <span className="text-[10px] text-muted-foreground">
                {t('header.savedAt')} {new Date(state.lastSaved).toLocaleTimeString()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted/80"
              title="Export JSON"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t('header.export')}</span>
            </button>
            <button
              onClick={handleImport}
              className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted/80"
              title="Import JSON"
            >
              <Upload className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t('header.import')}</span>
            </button>
            <button
              onClick={() => {
                if (confirm('Reset all admin settings to defaults?')) {
                  dispatch({ type: 'RESET_STATE' })
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
              title="Reset"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t('header.reset')}</span>
            </button>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.panel}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
