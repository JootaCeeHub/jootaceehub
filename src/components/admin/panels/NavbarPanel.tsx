'use client'

import { useAdmin } from '@/lib/admin/store'
import { useTranslations } from '@/lib/i18n/context'
import { motion } from 'framer-motion'
import { Menu, Plus, Trash2, ExternalLink } from 'lucide-react'
import { useCallback } from 'react'

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

export default function NavbarPanel() {
  const t = useTranslations('admin')
  const { state, dispatch } = useAdmin()
  const { navbar } = state

  const update = useCallback((payload: Partial<typeof navbar>) => {
    dispatch({ type: 'UPDATE_NAVBAR', payload })
  }, [dispatch])

  const addLink = useCallback(() => {
    update({ navLinks: [...navbar.navLinks, { label: 'New Link', href: '/', external: false }] })
  }, [navbar.navLinks, update])

  const updateLink = useCallback((index: number, patch: Partial<typeof navbar.navLinks[0]>) => {
    const next = [...navbar.navLinks]
    next[index] = { ...next[index], ...patch }
    update({ navLinks: next })
  }, [navbar.navLinks, update])

  const removeLink = useCallback((index: number) => {
    const next = [...navbar.navLinks]
    next.splice(index, 1)
    update({ navLinks: next })
  }, [navbar.navLinks, update])

  const addAction = useCallback(() => {
    update({ actionButtons: [...navbar.actionButtons, { label: 'Action', href: '/', variant: 'primary' }] })
  }, [navbar.actionButtons, update])

  const updateAction = useCallback((index: number, patch: Partial<typeof navbar.actionButtons[0]>) => {
    const next = [...navbar.actionButtons]
    next[index] = { ...next[index], ...patch }
    update({ actionButtons: next })
  }, [navbar.actionButtons, update])

  const removeAction = useCallback((index: number) => {
    const next = [...navbar.actionButtons]
    next.splice(index, 1)
    update({ actionButtons: next })
  }, [navbar.actionButtons, update])

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{t('navbar.title')}</h1>
        <p className="text-xs text-muted-foreground mt-1">{t('navbar.subtitle')}</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
        <div className="mb-4 flex items-center gap-2">
          <Menu className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Branding</h2>
        </div>
        <div className="space-y-4">
          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Logo Text</label>
            <input
              value={navbar.logoText}
              onChange={(e) => update({ logoText: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          </div>
          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Logo URL (optional)</label>
            <input
              value={navbar.logoUrl}
              onChange={(e) => update({ logoUrl: e.target.value })}
              placeholder="/logo.svg"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass rounded-2xl p-5">
        <div className="mb-4 flex items-center gap-2">
          <Menu className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Behavior</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Layout</label>
            <Select
              value={navbar.layout}
              onChange={(v) => update({ layout: v as typeof navbar.layout })}
              options={[
                { value: 'sticky', label: 'Sticky' },
                { value: 'fixed', label: 'Fixed' },
                { value: 'static', label: 'Static' },
              ]}
            />
          </div>
          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Background</label>
            <Select
              value={navbar.background}
              onChange={(v) => update({ background: v as typeof navbar.background })}
              options={[
                { value: 'solid', label: 'Solid' },
                { value: 'glass', label: 'Glass' },
                { value: 'transparent', label: 'Transparent' },
              ]}
            />
          </div>
          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Scroll Behavior</label>
            <Select
              value={navbar.behavior}
              onChange={(v) => update({ behavior: v as typeof navbar.behavior })}
              options={[
                { value: 'hide-on-scroll', label: 'Hide on Scroll' },
                { value: 'always-visible', label: 'Always Visible' },
                { value: 'compress-on-scroll', label: 'Compress on Scroll' },
              ]}
            />
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Menu className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Navigation Links</h2>
          </div>
          <button
            onClick={addLink}
            className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/20"
          >
            <Plus className="h-3 w-3" />
            Add
          </button>
        </div>
        <div className="space-y-2">
          {navbar.navLinks.map((link, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg border border-border bg-background p-2">
              <input
                value={link.label}
                onChange={(e) => updateLink(i, { label: e.target.value })}
                placeholder="Label"
                className="flex-1 min-w-0 rounded-md border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
              />
              <input
                value={link.href}
                onChange={(e) => updateLink(i, { href: e.target.value })}
                placeholder="/path"
                className="flex-1 min-w-0 rounded-md border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
              />
              <label className="inline-flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                <input
                  type="checkbox"
                  checked={link.external}
                  onChange={(e) => updateLink(i, { external: e.target.checked })}
                  className="rounded border-border"
                />
                <ExternalLink className="h-3 w-3" />
              </label>
              <button
                onClick={() => removeLink(i)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-destructive hover:bg-destructive/10 shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Menu className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Action Buttons</h2>
          </div>
          <button
            onClick={addAction}
            className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/20"
          >
            <Plus className="h-3 w-3" />
            Add
          </button>
        </div>
        <div className="space-y-2">
          {navbar.actionButtons.map((btn, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg border border-border bg-background p-2">
              <input
                value={btn.label}
                onChange={(e) => updateAction(i, { label: e.target.value })}
                placeholder="Label"
                className="flex-1 min-w-0 rounded-md border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
              />
              <input
                value={btn.href}
                onChange={(e) => updateAction(i, { href: e.target.value })}
                placeholder="/path"
                className="flex-1 min-w-0 rounded-md border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
              />
              <Select
                value={btn.variant}
                onChange={(v) => updateAction(i, { variant: v as typeof btn.variant })}
                options={[
                  { value: 'primary', label: 'Primary' },
                  { value: 'secondary', label: 'Secondary' },
                  { value: 'ghost', label: 'Ghost' },
                ]}
              />
              <button
                onClick={() => removeAction(i)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-destructive hover:bg-destructive/10 shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
