'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useAdmin } from '@/lib/admin/store'
import type { NavbarSettings, NavEntry } from '@/lib/admin/types'

// ─── Option maps ───────────────────────────────────────────────────────────────

const VARIANT_OPTS: { value: NavbarSettings['variant']; label: string }[] = [
  { value: 'default',  label: 'Default'  },
  { value: 'centered', label: 'Centered' },
  { value: 'minimal',  label: 'Minimal'  },
  { value: 'side',     label: 'Side'     },
]

const SHAPE_OPTS: { value: NavbarSettings['shape']; label: string }[] = [
  { value: 'square',  label: 'Square'  },
  { value: 'rounded', label: 'Rounded' },
  { value: 'pill',    label: 'Pill'    },
]

const HEIGHT_OPTS: { value: NavbarSettings['height']; label: string }[] = [
  { value: 'compact', label: 'Compact' },
  { value: 'medium',  label: 'Medium'  },
  { value: 'tall',    label: 'Tall'    },
]

const SHADOW_OPTS: { value: NavbarSettings['shadow']; label: string }[] = [
  { value: 'none',     label: 'None'     },
  { value: 'subtle',   label: 'Subtle'   },
  { value: 'normal',   label: 'Normal'   },
  { value: 'dramatic', label: 'Dramatic' },
]

const BACKGROUND_OPTS: { value: NavbarSettings['background']; label: string }[] = [
  { value: 'solid',       label: 'Solid'       },
  { value: 'blur',        label: 'Blur'         },
  { value: 'transparent', label: 'Transparent' },
  { value: 'glass',       label: 'Glass'        },
]

const LOGO_OPTS: { value: NavbarSettings['logoIcon']; label: string }[] = [
  { value: 'sparkles', label: '✨ Sparkles' },
  { value: 'zap',      label: '⚡ Zap'      },
  { value: 'cpu',      label: '💻 CPU'      },
  { value: 'globe',    label: '🌐 Globe'    },
  { value: 'none',     label: 'Sin icono'   },
]

// ─── Toggle row helper ─────────────────────────────────────────────────────────

function ToggleRow({ label, desc, on, onToggle }: { label: string; desc?: string; on: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-medium text-white/80">{label}</div>
        {desc && <div className="text-[10px] text-white/35 leading-snug">{desc}</div>}
      </div>
      <button
        className={cn(
          'relative h-5 w-9 shrink-0 rounded-full border transition-colors',
          on ? 'border-cyan-400/40 bg-cyan-400/20' : 'border-white/15 bg-white/5'
        )}
        onClick={onToggle}
      >
        <span className={cn(
          'absolute top-0.5 h-4 w-4 rounded-full transition-all',
          on ? 'left-[18px] bg-cyan-400' : 'left-0.5 bg-white/30'
        )} />
      </button>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function NavbarConfigPanel() {
  const { state, dispatch } = useAdmin()
  const { navbarSettings: nav, navigation } = state

  const [addLabel, setAddLabel] = useState('')
  const [addHref, setAddHref] = useState('')
  const [addError, setAddError] = useState('')
  const [editKey, setEditKey] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [editHref, setEditHref] = useState('')

  function update(data: Partial<NavbarSettings>) {
    dispatch({ type: 'UPDATE_NAVBAR_SETTINGS', payload: data })
  }

  function moveNav(key: string, dir: -1 | 1) {
    const sorted = [...navigation].sort((a, b) => a.order - b.order)
    const idx = sorted.findIndex((n) => n.key === key)
    const swapIdx = idx + dir
    if (swapIdx < 0 || swapIdx >= sorted.length) return
    const next = sorted.map((n, i) => {
      if (i === idx) return { ...n, order: sorted[swapIdx].order }
      if (i === swapIdx) return { ...n, order: sorted[idx].order }
      return n
    })
    dispatch({ type: 'SET_NAVIGATION', payload: next })
  }

  function toggleNavVisibility(key: string) {
    const next = navigation.map((n) => (n.key === key ? { ...n, visible: !n.visible } : n))
    dispatch({ type: 'SET_NAVIGATION', payload: next })
  }

  function removeNav(key: string) {
    dispatch({ type: 'SET_NAVIGATION', payload: navigation.filter((n) => n.key !== key) })
  }

  function addNavLink() {
    const label = addLabel.trim()
    const href = addHref.trim()
    if (!label) { setAddError('El nombre es obligatorio'); return }
    if (!href) { setAddError('El enlace es obligatorio'); return }
    const key = label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now()
    const maxOrder = navigation.reduce((m, n) => Math.max(m, n.order), -1)
    const newEntry: NavEntry = { key, label, href, visible: true, order: maxOrder + 1 }
    dispatch({ type: 'SET_NAVIGATION', payload: [...navigation, newEntry] })
    setAddLabel('')
    setAddHref('')
    setAddError('')
  }

  function beginEdit(item: NavEntry) {
    setEditKey(item.key)
    setEditLabel(item.label)
    setEditHref(item.href)
  }

  function commitEdit() {
    if (!editKey) return
    const next = navigation.map((n) =>
      n.key === editKey ? { ...n, label: editLabel.trim() || n.label, href: editHref.trim() || n.href } : n
    )
    dispatch({ type: 'SET_NAVIGATION', payload: next })
    setEditKey(null)
  }

  const sortedNav = [...navigation].sort((a, b) => a.order - b.order)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-400/70">Personalización</p>
        <h2 className="text-xl font-semibold text-white">Navbar del Sitio</h2>
      </div>

      {/* ── Visibility & Behavior ── */}
      <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
        <div className="flex items-center gap-2 border-b border-white/6 px-4 py-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/60 flex-1">Comportamiento</span>
        </div>
        <div className="p-4 space-y-4">
          <ToggleRow label="Visible" desc="Mostrar la navbar en el sitio" on={nav.visible} onToggle={() => update({ visible: !nav.visible })} />
          <ToggleRow label="Sticky" desc="La navbar permanece fija al hacer scroll" on={nav.sticky} onToggle={() => update({ sticky: !nav.sticky })} />
          <ToggleRow label="Transparente en la parte superior" desc="Fondo transparente cuando el scroll está en top" on={nav.transparentOnTop} onToggle={() => update({ transparentOnTop: !nav.transparentOnTop })} />
          <ToggleRow label="Animación al hacer scroll" desc="Reduce altura al desplazarse hacia abajo" on={nav.animateOnScroll} onToggle={() => update({ animateOnScroll: !nav.animateOnScroll })} />
          <ToggleRow label="Backdrop blur" desc="Desenfoque de fondo cuando hay contenido detrás" on={nav.backdropBlur} onToggle={() => update({ backdropBlur: !nav.backdropBlur })} />
          <ToggleRow label="Borde inferior" on={nav.showBorderBottom} onToggle={() => update({ showBorderBottom: !nav.showBorderBottom })} />
        </div>
      </div>

      {/* ── Visual Style ── */}
      <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
        <div className="flex items-center gap-2 border-b border-white/6 px-4 py-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/60 flex-1">Estilo Visual</span>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/40">Variante</label>
              <select className="w-full rounded-lg border border-white/10 bg-white/4 px-3 py-1.5 text-[11px] text-white/75 focus:outline-none focus:border-cyan-400/40 transition-colors" value={nav.variant} onChange={(e) => update({ variant: e.target.value as NavbarSettings['variant'] })}>
                {VARIANT_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/40">Forma</label>
              <select className="w-full rounded-lg border border-white/10 bg-white/4 px-3 py-1.5 text-[11px] text-white/75 focus:outline-none focus:border-cyan-400/40 transition-colors" value={nav.shape} onChange={(e) => update({ shape: e.target.value as NavbarSettings['shape'] })}>
                {SHAPE_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/40">Altura</label>
              <select className="w-full rounded-lg border border-white/10 bg-white/4 px-3 py-1.5 text-[11px] text-white/75 focus:outline-none focus:border-cyan-400/40 transition-colors" value={nav.height} onChange={(e) => update({ height: e.target.value as NavbarSettings['height'] })}>
                {HEIGHT_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/40">Sombra</label>
              <select className="w-full rounded-lg border border-white/10 bg-white/4 px-3 py-1.5 text-[11px] text-white/75 focus:outline-none focus:border-cyan-400/40 transition-colors" value={nav.shadow} onChange={(e) => update({ shadow: e.target.value as NavbarSettings['shadow'] })}>
                {SHADOW_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/40">Fondo</label>
              <select className="w-full rounded-lg border border-white/10 bg-white/4 px-3 py-1.5 text-[11px] text-white/75 focus:outline-none focus:border-cyan-400/40 transition-colors" value={nav.background} onChange={(e) => update({ background: e.target.value as NavbarSettings['background'] })}>
                {BACKGROUND_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/40">Icono del logo</label>
              <select className="w-full rounded-lg border border-white/10 bg-white/4 px-3 py-1.5 text-[11px] text-white/75 focus:outline-none focus:border-cyan-400/40 transition-colors" value={nav.logoIcon} onChange={(e) => update({ logoIcon: e.target.value as NavbarSettings['logoIcon'] })}>
                {LOGO_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <ToggleRow label="Mostrar icono junto al nombre" on={nav.showIconWithName} onToggle={() => update({ showIconWithName: !nav.showIconWithName })} />
        </div>
      </div>

      {/* ── Nav Links ── */}
      <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
        <div className="flex items-center gap-2 border-b border-white/6 px-4 py-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/60 flex-1">Elementos de Navegación</span>
          <span className="font-mono text-[9px] text-white/30">{navigation.filter((n) => n.visible).length}/{navigation.length} visibles</span>
        </div>
        <div className="p-4 space-y-4">
          <div className="space-y-1 mb-4">
            {sortedNav.map((item: NavEntry, idx: number) => (
              <div key={item.key}>
                {editKey === item.key ? (
                  <div className="flex items-center gap-2 rounded-lg border border-cyan-400/20 bg-cyan-400/4 px-3 py-2">
                    <input
                      className="flex-1 rounded border border-white/10 bg-black/20 px-2 py-1 text-[10px] text-white/75 placeholder-white/20 outline-none focus:border-cyan-400/30 transition-colors min-w-0"
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      placeholder="Nombre"
                    />
                    <input
                      className="flex-1 rounded border border-white/10 bg-black/20 px-2 py-1 text-[10px] text-white/75 placeholder-white/20 outline-none focus:border-cyan-400/30 transition-colors min-w-0"
                      value={editHref}
                      onChange={(e) => setEditHref(e.target.value)}
                      placeholder="#section o /path"
                    />
                    <button className="rounded border border-emerald-400/25 bg-emerald-400/8 px-2 py-1 font-mono text-[9px] text-emerald-400 hover:bg-emerald-400/15 transition-colors" onClick={commitEdit}>✓</button>
                    <button className="rounded border border-white/10 px-2 py-1 font-mono text-[9px] text-white/35 hover:border-white/20 hover:text-white/60 transition-colors" onClick={() => setEditKey(null)}>✕</button>
                  </div>
                ) : (
                  <div className={cn(
                    'flex items-center gap-2 rounded-lg border px-3 py-2 transition-all',
                    item.visible ? 'border-white/8 bg-white/2' : 'border-white/4 opacity-45'
                  )}>
                    <span className="font-mono text-[9px] text-white/20 w-3 shrink-0">{idx + 1}</span>

                    <div className="flex flex-col gap-0.5 shrink-0">
                      <button className="flex h-3.5 w-4 items-center justify-center rounded text-white/20 hover:text-white/60 text-[8px] transition-colors disabled:opacity-15" onClick={() => moveNav(item.key, -1)} disabled={idx === 0}>▲</button>
                      <button className="flex h-3.5 w-4 items-center justify-center rounded text-white/20 hover:text-white/60 text-[8px] transition-colors disabled:opacity-15" onClick={() => moveNav(item.key, 1)} disabled={idx === sortedNav.length - 1}>▼</button>
                    </div>

                    <span className="flex-1 min-w-0 text-[11px] text-white/70 truncate">{item.label}</span>
                    <span className="font-mono text-[9px] text-white/30 max-w-[100px] truncate">{item.href}</span>

                    <button className="rounded border border-white/8 px-1.5 py-0.5 font-mono text-[9px] text-white/30 hover:border-white/20 hover:text-white/60 transition-colors" onClick={() => beginEdit(item)} title="Editar">✎</button>
                    <button
                      className={cn(
                        'rounded border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.1em] transition-colors',
                        item.visible
                          ? 'border-emerald-400/20 text-emerald-400 bg-emerald-400/5'
                          : 'border-white/8 text-white/25'
                      )}
                      onClick={() => toggleNavVisibility(item.key)}
                    >
                      {item.visible ? 'visible' : 'oculto'}
                    </button>
                    <button className="rounded border border-red-400/10 px-1.5 py-0.5 font-mono text-[9px] text-red-400/30 hover:border-red-400/25 hover:text-red-400/70 transition-colors" onClick={() => removeNav(item.key)} title="Eliminar">✕</button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add link form */}
          <div className="border-t border-white/6 pt-4 space-y-2">
            <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-cyan-400/60">＋ Añadir enlace</div>
            <div className="flex gap-2">
              <input
                className="flex-1 min-w-0 rounded-lg border border-white/10 bg-white/3 px-3 py-1.5 text-[11px] text-white/75 placeholder-white/20 outline-none focus:border-cyan-400/30 transition-colors"
                placeholder="Nombre (ej. Portafolio)"
                value={addLabel}
                onChange={(e) => { setAddLabel(e.target.value); setAddError('') }}
                onKeyDown={(e) => e.key === 'Enter' && addNavLink()}
              />
              <input
                className="flex-1 min-w-0 rounded-lg border border-white/10 bg-white/3 px-3 py-1.5 text-[11px] text-white/75 placeholder-white/20 outline-none focus:border-cyan-400/30 transition-colors"
                placeholder="Destino (ej. #portfolio o /labs)"
                value={addHref}
                onChange={(e) => { setAddHref(e.target.value); setAddError('') }}
                onKeyDown={(e) => e.key === 'Enter' && addNavLink()}
              />
              <button className="shrink-0 rounded-lg border border-cyan-400/25 bg-cyan-400/8 px-3 py-1.5 font-mono text-[9px] uppercase tracking-wider text-cyan-400 hover:bg-cyan-400/15 transition-colors" onClick={addNavLink}>Añadir</button>
            </div>
            {addError && <div className="font-mono text-[9px] text-red-400/70">{addError}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
