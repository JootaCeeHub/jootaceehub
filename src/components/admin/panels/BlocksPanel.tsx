'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useAdmin } from '@/lib/admin/store'
import type { BlockSection } from '@/lib/admin/types'
import { defaultPageBlocksMap } from '@/lib/admin/state'
import { cn } from '@/lib/utils'

// ─── Block template library ───────────────────────────────────────────────────

const BLOCK_TEMPLATES: { type: string; label: string; description: string; icon: string }[] = [
  { type: 'hero',         label: 'Hero',            description: 'Sección principal con título y CTA', icon: '🎯' },
  { type: 'logos',        label: 'Logos / Partners', description: 'Logotipos de clientes o partners',   icon: '📋' },
  { type: 'stats',        label: 'Estadísticas',     description: 'Métricas y números clave',           icon: '📊' },
  { type: 'services',     label: 'Servicios',        description: 'Servicios o características',        icon: '🔧' },
  { type: 'gallery',      label: 'Galería',          description: 'Galería de imágenes con lightbox',   icon: '🖼️' },
  { type: 'team',         label: 'Equipo',           description: 'Presenta tu equipo',                 icon: '👥' },
  { type: 'pricing',      label: 'Precios',          description: 'Planes y precios de servicios',      icon: '💰' },
  { type: 'testimonials', label: 'Testimonios',      description: 'Opiniones de clientes',             icon: '💬' },
  { type: 'faq',          label: 'FAQ',              description: 'Preguntas frecuentes',               icon: '❓' },
  { type: 'blog',         label: 'Blog',             description: 'Últimas publicaciones',              icon: '📝' },
  { type: 'portfolio',    label: 'Portfolio',        description: 'Trabajos y proyectos destacados',    icon: '🗂️' },
  { type: 'cta',          label: 'CTA Final',        description: 'Llamada a la acción final',          icon: '🚀' },
  { type: 'contact',      label: 'Contacto',         description: 'Formulario o info de contacto',     icon: '📬' },
  { type: 'map',          label: 'Mapa',             description: 'Mapa de ubicación del negocio',      icon: '📍' },
  { type: 'newsletter',   label: 'Newsletter',       description: 'Captación de suscriptores',         icon: '📧' },
  { type: 'social-proof', label: 'Social Proof',     description: 'Premios, certificaciones y logros',  icon: '🏆' },
  { type: 'timeline',     label: 'Timeline',         description: 'Línea de tiempo de eventos',         icon: '⏱️' },
  { type: 'narrative',    label: 'Narrativa',        description: 'Bloque de texto narrativo',          icon: '📖' },
  { type: 'roadmap',      label: 'Roadmap',          description: 'Hoja de ruta del producto',         icon: '🗓️' },
  { type: 'metrics',      label: 'Métricas',         description: 'Panel de métricas y KPIs',          icon: '📈' },
]

// ─── Page registry ────────────────────────────────────────────────────────────

interface PageDef {
  id: string
  label: string
  path: string
  icon: string
}

interface PageGroup {
  label: string
  pages: PageDef[]
}

const PAGE_GROUPS: PageGroup[] = [
  {
    label: 'Core',
    pages: [
      { id: 'home',          label: 'Home',          path: '/',                   icon: '🏠' },
      { id: 'about',         label: 'About',         path: '/about',              icon: '👤' },
      { id: 'contact',       label: 'Contact',       path: '/contact',            icon: '📬' },
    ],
  },
  {
    label: 'Systems',
    pages: [
      { id: 'systems',       label: 'Systems',       path: '/systems',            icon: '⚡' },
      { id: 'systems/mcp',   label: 'MCP',           path: '/systems/mcp',        icon: '🔗' },
      { id: 'systems/graphrag','label': 'GraphRAG',  path: '/systems/graphrag',   icon: '🧠' } as PageDef,
      { id: 'systems/agents','label': 'Agents',      path: '/systems/agents',     icon: '🤖' } as PageDef,
      { id: 'systems/automation','label': 'Automation', path: '/systems/automation', icon: '⚙️' } as PageDef,
    ],
  },
  {
    label: 'Labs',
    pages: [
      { id: 'labs',          label: 'Labs',          path: '/labs',               icon: '🧪' },
      { id: 'labs/trading-ai','label': 'Trading AI', path: '/labs/trading-ai',   icon: '📈' } as PageDef,
      { id: 'labs/stl-generator','label': 'STL Generator', path: '/labs/stl-generator', icon: '🔷' } as PageDef,
      { id: 'labs/crm',      'label': 'CRM',         path: '/labs/crm',           icon: '👥' } as PageDef,
      { id: 'labs/erp',      'label': 'ERP',         path: '/labs/erp',           icon: '📦' } as PageDef,
      { id: 'labs/aura',     'label': 'AURA',        path: '/labs/aura',          icon: '💜' } as PageDef,
    ],
  },
  {
    label: 'Content',
    pages: [
      { id: 'journal',       label: 'Journal',       path: '/journal',            icon: '📖' },
      { id: 'projects',      label: 'Projects',      path: '/projects',           icon: '🗂️' },
      { id: 'research',      label: 'Research',      path: '/research',           icon: '🔬' },
      { id: 'resources',     label: 'Resources',     path: '/resources',          icon: '📚' },
    ],
  },
  {
    label: 'Platform',
    pages: [
      { id: 'infrastructure',label: 'Infrastructure',path: '/infrastructure',     icon: '🏗️' },
      { id: 'github',        label: 'GitHub',        path: '/github',             icon: '💻' },
      { id: 'playground',    label: 'Playground',    path: '/playground',         icon: '🎮' },
    ],
  },
]

const ALL_PAGES: PageDef[] = PAGE_GROUPS.flatMap((g) => g.pages)

// ─── Block picker modal ───────────────────────────────────────────────────────

function BlockPicker({ onAdd, onClose }: { onAdd: (tpl: typeof BLOCK_TEMPLATES[0]) => void; onClose: () => void }) {
  const [selected, setSelected] = useState<string | null>(null)
  const tpl = BLOCK_TEMPLATES.find((t) => t.type === selected)

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0d0d1a] p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-400/70">Biblioteca de bloques</p>
        <h3 className="mb-4 text-sm font-semibold text-white/80">Elige un tipo de bloque para añadir</h3>
        <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
          {BLOCK_TEMPLATES.map((t) => (
            <div
              key={t.type}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all',
                selected === t.type
                  ? 'border-cyan-400/30 bg-cyan-400/8'
                  : 'border-white/8 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]'
              )}
              onClick={() => setSelected(t.type)}
            >
              <span className="text-[18px] shrink-0">{t.icon}</span>
              <div>
                <div className="text-[11px] font-medium text-white/75">{t.label}</div>
                <div className="text-[9px] text-white/35 leading-snug">{t.description}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <button className="rounded-lg border border-white/10 px-3 py-1.5 font-mono text-[9px] uppercase tracking-wider text-white/40 hover:border-white/20 hover:text-white/60 transition-colors" onClick={onClose}>Cancelar</button>
          <button
            className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 font-mono text-[9px] uppercase tracking-wider text-cyan-400 hover:bg-cyan-400/15 transition-colors disabled:opacity-30"
            disabled={!tpl}
            onClick={() => { if (tpl) { onAdd(tpl); onClose() } }}
          >
            Añadir bloque{tpl ? ` · ${tpl.label}` : ''}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BlocksPanel() {
  const { state, dispatch } = useAdmin()
  const [selectedPage, setSelectedPage] = useState<string>('home')
  const [showPicker, setShowPicker] = useState(false)

  const pageDef = ALL_PAGES.find((p) => p.id === selectedPage) ?? ALL_PAGES[0]

  // Use stored blocks if present, else fall back to defaults
  const rawBlocks: BlockSection[] = state.pageBlocksMap[selectedPage] ?? defaultPageBlocksMap[selectedPage] ?? []
  const blocks = [...rawBlocks].sort((a, b) => a.order - b.order)
  const activeCount = blocks.filter((b) => b.enabled).length

  function updateBlock(id: string, data: Partial<BlockSection>) {
    dispatch({ type: 'UPDATE_PAGE_BLOCK', payload: { page: selectedPage, id, data } })
  }

  function move(id: string, dir: -1 | 1) {
    const sorted = [...rawBlocks].sort((a, b) => a.order - b.order)
    const idx = sorted.findIndex((b) => b.id === id)
    const swapIdx = idx + dir
    if (swapIdx < 0 || swapIdx >= sorted.length) return
    const next = sorted.map((b, i) => {
      if (i === idx) return { ...b, order: sorted[swapIdx].order }
      if (i === swapIdx) return { ...b, order: sorted[idx].order }
      return b
    })
    dispatch({ type: 'SET_PAGE_BLOCKS', payload: { page: selectedPage, blocks: next } })
  }

  function removeBlock(id: string) {
    const next = rawBlocks.filter((b) => b.id !== id)
    dispatch({ type: 'SET_PAGE_BLOCKS', payload: { page: selectedPage, blocks: next } })
  }

  function addBlock(tpl: typeof BLOCK_TEMPLATES[0]) {
    const current = state.pageBlocksMap[selectedPage] ?? defaultPageBlocksMap[selectedPage] ?? []
    const maxOrder = current.reduce((m, b) => Math.max(m, b.order), -1)
    const newBlock: BlockSection = {
      id: `${tpl.type}-${Date.now()}`,
      type: tpl.type,
      label: tpl.label,
      description: tpl.description,
      icon: tpl.icon,
      enabled: true,
      order: maxOrder + 1,
      effects3D: false,
      effects3DIntensity: 0.3,
    }
    dispatch({ type: 'SET_PAGE_BLOCKS', payload: { page: selectedPage, blocks: [...current, newBlock] } })
  }

  const isDefaultBlock = (block: BlockSection) =>
    (defaultPageBlocksMap[selectedPage] ?? []).some((d) => d.id === block.id)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        {/* ── Page sidebar ── */}
        <aside className="w-44 shrink-0 flex flex-col gap-0 overflow-y-auto border-r border-white/5 py-2">
          {PAGE_GROUPS.map((group) => (
            <div key={group.label} className="mb-1">
              <div className="px-3 pt-2 pb-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/25">{group.label}</div>
              {group.pages.map((page) => {
                const pageBlocks = state.pageBlocksMap[page.id] ?? defaultPageBlocksMap[page.id] ?? []
                const active = page.id === selectedPage
                return (
                  <button
                    key={page.id}
                    onClick={() => setSelectedPage(page.id)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 w-full text-left transition-colors cursor-pointer',
                      active ? 'bg-cyan-400/8 text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/3'
                    )}
                  >
                    <span className="text-[12px] shrink-0">{page.icon}</span>
                    <div className="flex-1 min-w-0 flex items-baseline justify-between gap-1">
                      <span className="text-[10px] font-medium truncate">{page.label}</span>
                      <span className="text-[8px] text-white/25 shrink-0 font-mono">{pageBlocks.filter((b) => b.enabled).length}/{pageBlocks.length}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          ))}
        </aside>

        {/* ── Block editor ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 shrink-0">
            <span className="text-lg shrink-0">{pageDef.icon}</span>
            <div>
              <div className="text-[13px] font-semibold text-white/90">{pageDef.label}</div>
              <div className="text-[9px] text-white/30 font-mono">{pageDef.path}</div>
            </div>
            <span className="ml-auto font-mono text-[9px] text-white/30">{activeCount}/{blocks.length} activos</span>
          </div>

          {/* Block list */}
          <div className="flex-1 overflow-y-auto space-y-1.5 p-3">
            {blocks.map((block, idx) => (
              <div
                key={block.id}
                className={cn(
                  'rounded-xl border bg-white/[0.02] overflow-hidden transition-all duration-200',
                  block.enabled ? 'border-white/10' : 'border-white/5 opacity-50'
                )}
              >
                <div className="flex items-center gap-3 px-3 py-2.5">
                  {/* Reorder */}
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button className="flex h-4 w-5 items-center justify-center rounded text-white/25 hover:text-white/60 hover:bg-white/5 transition-colors text-[9px] disabled:opacity-20" onClick={() => move(block.id, -1)} disabled={idx === 0}>▲</button>
                    <button className="flex h-4 w-5 items-center justify-center rounded text-white/25 hover:text-white/60 hover:bg-white/5 transition-colors text-[9px] disabled:opacity-20" onClick={() => move(block.id, 1)} disabled={idx === blocks.length - 1}>▼</button>
                  </div>

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-white/4 text-[16px]">{block.icon}</div>

                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-medium text-white/80">{block.label}</div>
                    <div className="text-[9px] text-white/30 leading-snug truncate">{block.description}</div>
                  </div>

                  <span className="font-mono text-[9px] text-white/20 shrink-0">#{block.order + 1}</span>

                  {/* Toggle */}
                  <button
                    className={cn(
                      'relative h-5 w-9 shrink-0 rounded-full border transition-colors',
                      block.enabled ? 'border-cyan-400/40 bg-cyan-400/20' : 'border-white/15 bg-white/5'
                    )}
                    onClick={() => updateBlock(block.id, { enabled: !block.enabled })}
                    title={block.enabled ? 'Desactivar' : 'Activar'}
                  >
                    <span className={cn(
                      'absolute top-0.5 h-4 w-4 rounded-full transition-all',
                      block.enabled ? 'left-[18px] bg-cyan-400' : 'left-0.5 bg-white/30'
                    )} />
                  </button>

                  {/* Remove custom blocks */}
                  {!isDefaultBlock(block) && (
                    <button
                      className="ml-1 rounded border border-red-400/15 px-1.5 py-0.5 font-mono text-[8px] text-red-400/50 hover:border-red-400/30 hover:text-red-400 transition-colors"
                      onClick={() => removeBlock(block.id)}
                      title="Eliminar bloque"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add block */}
          <button className="mx-3 mb-3 mt-1 flex w-[calc(100%-1.5rem)] items-center justify-center gap-2 rounded-xl border border-dashed border-cyan-400/20 py-2.5 text-[10px] uppercase tracking-[0.14em] text-cyan-400/50 hover:border-cyan-400/35 hover:text-cyan-400/80 transition-all" onClick={() => setShowPicker(true)}>
            ＋ Añadir bloque
          </button>
        </div>
      </div>

      {showPicker && <BlockPicker onAdd={addBlock} onClose={() => setShowPicker(false)} />}
    </div>
  )
}
