'use client'

import { useState } from 'react'
import { useAdmin } from '@/lib/admin/store'
import { PLATFORM_META, PLATFORM_CATEGORIES } from './constants'
import { PlatformCard } from './PlatformCard'
import type { PlatformMeta } from './constants'

export function PlatformsTab() {
  const { state } = useAdmin()
  const { socialPlatforms } = state.integrations
  const connected = socialPlatforms.filter((p) => p.connected).length
  const visible   = socialPlatforms.filter((p) => p.visible && p.connected).length
  const withApi   = PLATFORM_META.filter((m) => m.hasPublicApi).length

  const categories = Object.keys(PLATFORM_CATEGORIES) as PlatformMeta['category'][]
  const [openCat, setOpenCat] = useState<Set<string>>(new Set(['social', 'developer']))

  const toggleCat = (cat: string) => {
    setOpenCat((prev) => {
      const next = new Set(prev)
      next.has(cat) ? next.delete(cat) : next.add(cat)
      return next
    })
  }

  return (
    <div className="space-y-3">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Plataformas', value: socialPlatforms.length, color: '#38bdf8' },
          { label: 'Conectadas',  value: connected,              color: '#34d399' },
          { label: 'Visibles',    value: visible,                color: '#a78bfa' },
          { label: 'Con API',     value: withApi,                color: '#f59e0b' },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3">
            <div className="text-2xl font-semibold tabular-nums" style={{ color: m.color }}>{m.value}</div>
            <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-white/25">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Grouped by category */}
      {categories.map((cat) => {
        const meta    = PLATFORM_CATEGORIES[cat]
        const ids     = PLATFORM_META.filter((m) => m.category === cat).map((m) => m.id)
        const inState = socialPlatforms.filter((p) => ids.includes(p.id))
        const connectedCount = inState.filter((p) => p.connected).length
        const isOpen  = openCat.has(cat)

        return (
          <div key={cat} className="overflow-hidden rounded-xl border border-white/8 bg-white/[0.02]">
            <button
              type="button"
              onClick={() => toggleCat(cat)}
              className="flex w-full items-center justify-between border-b border-white/8 px-4 py-2.5 transition-colors hover:bg-white/[0.02]"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">
                {meta.label}
              </span>
              <div className="flex items-center gap-2">
                {connectedCount > 0 && (
                  <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-1.5 py-0.5 font-mono text-[8px] text-emerald-400">
                    {connectedCount} connected
                  </span>
                )}
                <span
                  className="rounded-full px-1.5 py-0.5 font-mono text-[8px] font-medium"
                  style={{ color: meta.color, backgroundColor: meta.color + '15' }}
                >
                  {ids.length}
                </span>
                <span className="font-mono text-[9px] text-white/20">{isOpen ? '▲' : '▼'}</span>
              </div>
            </button>

            {isOpen && (
              <div className="p-3 space-y-2">
                {inState.map((p) => (
                  <PlatformCard key={p.id} platform={p} />
                ))}
                {inState.length === 0 && (
                  <div className="py-3 text-center font-mono text-[9px] text-white/20">No platforms in this category</div>
                )}
              </div>
            )}
          </div>
        )
      })}

      <div className="rounded-xl border border-white/6 bg-white/[0.015] p-4">
        <div className="text-[11px] font-medium text-white/60 mb-1.5">💡 ¿Para qué sirve esto?</div>
        <div className="font-mono text-[9px] text-white/30 leading-relaxed">
          Las plataformas conectadas enriquecen tu web pública: stats en About/Contact, links en el footer, badges en el perfil. Plataformas con soporte de API pública pueden auto-sincronizar stats. Activa &ldquo;Visible en web&rdquo; para cada plataforma que quieras mostrar.
        </div>
      </div>
    </div>
  )
}
