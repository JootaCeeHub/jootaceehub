'use client'

import { cn } from '@/lib/utils'
import { useAdmin } from '@/lib/admin/store'
import type { FooterSettings, FooterLinkColumn } from '@/lib/admin/types'

// ─── Toggle row helper ─────────────────────────────────────────────────────────

function ToggleRow({ label, desc, on, onToggle }: { label: string; desc?: string; on: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1">
        <div className="text-[12px] font-medium text-white/80">{label}</div>
        {desc && <div className="text-[10px] text-white/35">{desc}</div>}
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

export default function FooterConfigPanel() {
  const { state, dispatch } = useAdmin()
  const { footerSettings: footer } = state

  function update(data: Partial<FooterSettings>) {
    dispatch({ type: 'UPDATE_FOOTER_SETTINGS', payload: data })
  }

  // ── Columns ──────────────────────────────────────────────────────────────────

  function addColumn() {
    const col: FooterLinkColumn = { id: crypto.randomUUID(), heading: 'Columna', links: [] }
    update({ columns: [...footer.columns, col] })
  }

  function removeColumn(id: string) {
    update({ columns: footer.columns.filter((c) => c.id !== id) })
  }

  function updateColumnHeading(id: string, heading: string) {
    update({ columns: footer.columns.map((c) => (c.id === id ? { ...c, heading } : c)) })
  }

  function addLink(colId: string) {
    update({
      columns: footer.columns.map((c) =>
        c.id === colId ? { ...c, links: [...c.links, { label: 'Enlace', href: '#' }] } : c
      ),
    })
  }

  function removeLink(colId: string, li: number) {
    update({
      columns: footer.columns.map((c) =>
        c.id === colId ? { ...c, links: c.links.filter((_, i) => i !== li) } : c
      ),
    })
  }

  function updateLink(colId: string, li: number, field: 'label' | 'href', val: string) {
    update({
      columns: footer.columns.map((c) =>
        c.id === colId
          ? { ...c, links: c.links.map((l, i) => (i === li ? { ...l, [field]: val } : l)) }
          : c
      ),
    })
  }

  // ── Legal links ───────────────────────────────────────────────────────────────

  function addLegal() {
    update({ legalLinks: [...footer.legalLinks, { label: 'Enlace', href: '#' }] })
  }

  function removeLegal(i: number) {
    update({ legalLinks: footer.legalLinks.filter((_, idx) => idx !== i) })
  }

  function updateLegal(i: number, field: 'label' | 'href', val: string) {
    update({ legalLinks: footer.legalLinks.map((l, idx) => (idx === i ? { ...l, [field]: val } : l)) })
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-400/70">Personalización</p>
        <h2 className="text-xl font-semibold text-white">Footer</h2>
      </div>

      {/* ── Visibility & Layout ── */}
      <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
        <div className="flex items-center gap-2 border-b border-white/6 px-4 py-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/60">General</span>
        </div>
        <div className="p-4 space-y-4">
          <ToggleRow label="Visible" desc="Mostrar el footer en el sitio" on={footer.visible} onToggle={() => update({ visible: !footer.visible })} />
          <ToggleRow label="Mostrar logo" on={footer.showLogo} onToggle={() => update({ showLogo: !footer.showLogo })} />
          <ToggleRow label="Botón scroll al inicio" on={footer.showScrollTop} onToggle={() => update({ showScrollTop: !footer.showScrollTop })} />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/40">Variante</label>
              <select className="w-full rounded-lg border border-white/10 bg-white/4 px-3 py-1.5 text-[11px] text-white/75 focus:outline-none focus:border-cyan-400/40 transition-colors" value={footer.variant} onChange={(e) => update({ variant: e.target.value as FooterSettings['variant'] })}>
                <option value="minimal">Minimal</option>
                <option value="columns">Columns</option>
                <option value="centered">Centered</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/40">Fondo</label>
              <select className="w-full rounded-lg border border-white/10 bg-white/4 px-3 py-1.5 text-[11px] text-white/75 focus:outline-none focus:border-cyan-400/40 transition-colors" value={footer.background} onChange={(e) => update({ background: e.target.value as FooterSettings['background'] })}>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="transparent">Transparent</option>
                <option value="card">Card</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/40">Descripción de marca</label>
            <textarea rows={2} className="w-full rounded-lg border border-white/10 bg-white/4 px-3 py-2 text-[11px] text-white/75 placeholder-white/15 focus:outline-none focus:border-cyan-400/40 transition-colors resize-none leading-relaxed" value={footer.brandDescription}
              onChange={(e) => update({ brandDescription: e.target.value })} />
          </div>

          <div className="space-y-1">
            <label className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/40">Copyright</label>
            <input type="text" className="w-full rounded-lg border border-white/10 bg-white/4 px-3 py-1.5 text-[11px] text-white/75 placeholder-white/15 focus:outline-none focus:border-cyan-400/40 transition-colors" value={footer.copyrightText}
              onChange={(e) => update({ copyrightText: e.target.value })} />
          </div>
        </div>
      </div>

      {/* ── Columns ── */}
      <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
        <div className="flex items-center gap-2 border-b border-white/6 px-4 py-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/60">Columnas de enlaces</span>
        </div>
        <div className="p-4 space-y-4">
          <div className="space-y-3">
            {footer.columns.map((col) => (
              <div key={col.id} className="rounded-lg border border-white/8 bg-white/2 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    className="flex-1 rounded-md border border-white/8 bg-white/4 px-2 py-1 text-[11px] text-white/75 focus:outline-none focus:border-cyan-400/30"
                    value={col.heading}
                    onChange={(e) => updateColumnHeading(col.id, e.target.value)}
                    placeholder="Título de columna"
                  />
                  <button className="rounded border border-red-400/15 px-1.5 py-0.5 text-[9px] text-red-400/60 hover:border-red-400/30 hover:text-red-400 transition-colors" onClick={() => removeColumn(col.id)}>✕</button>
                </div>

                <div className="space-y-1.5">
                  {col.links.map((link, li) => (
                    <div key={li} className="flex items-center gap-1.5">
                      <input
                        type="text"
                        className="flex-1 rounded border border-white/6 bg-white/3 px-2 py-1 text-[10px] text-white/60 focus:outline-none focus:border-white/20"
                        value={link.label}
                        onChange={(e) => updateLink(col.id, li, 'label', e.target.value)}
                        placeholder="Etiqueta"
                      />
                      <input
                        type="text"
                        className="w-28 rounded border border-white/6 bg-white/3 px-2 py-1 font-mono text-[9px] text-white/40 focus:outline-none focus:border-white/20"
                        value={link.href}
                        onChange={(e) => updateLink(col.id, li, 'href', e.target.value)}
                        placeholder="/ruta"
                      />
                      <button className="text-white/20 hover:text-red-400 transition-colors text-[10px]" onClick={() => removeLink(col.id, li)}>✕</button>
                    </div>
                  ))}
                </div>

                <button className="flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-white/10 py-1 text-[9px] uppercase tracking-[0.1em] text-white/25 hover:border-white/20 hover:text-white/50 transition-all" onClick={() => addLink(col.id)}>
                  + enlace
                </button>
              </div>
            ))}
          </div>
          <button className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-cyan-400/15 py-2 text-[9px] uppercase tracking-[0.12em] text-cyan-400/40 hover:border-cyan-400/30 hover:text-cyan-400/70 transition-all" onClick={addColumn}>+ Añadir columna</button>
        </div>
      </div>

      {/* ── Socials ── */}
      <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
        <div className="flex items-center gap-2 border-b border-white/6 px-4 py-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/60">Redes Sociales</span>
        </div>
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            {footer.socials.map((social, i) => (
              <div key={social.platform} className={cn(
                'flex items-center gap-3 rounded-lg border px-3 py-2 transition-all',
                social.visible ? 'border-white/8 bg-white/2' : 'border-white/4 opacity-40'
              )}>
                <span className="flex-1 text-[11px] text-white/70">{social.platform}</span>
                <input
                  type="text"
                  className="w-40 rounded border border-white/8 bg-white/3 px-2 py-0.5 font-mono text-[9px] text-white/40 focus:outline-none focus:border-white/20"
                  value={social.url}
                  onChange={(e) => {
                    const next = footer.socials.map((s, idx) => idx === i ? { ...s, url: e.target.value } : s)
                    update({ socials: next })
                  }}
                  placeholder="URL"
                />
                <button
                  className="text-[9px] text-white/30 hover:text-white/60 transition-colors ml-2"
                  onClick={() => {
                    const next = footer.socials.map((s, idx) => idx === i ? { ...s, visible: !s.visible } : s)
                    update({ socials: next })
                  }}
                >
                  {social.visible ? '👁' : '🚫'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Newsletter ── */}
      <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
        <div className="flex items-center gap-2 border-b border-white/6 px-4 py-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/60">Newsletter</span>
        </div>
        <div className="p-4 space-y-4">
          <ToggleRow label="Mostrar newsletter" on={footer.showNewsletter} onToggle={() => update({ showNewsletter: !footer.showNewsletter })} />
          {footer.showNewsletter && (
            <>
              <div className="space-y-1">
                <label className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/40">Título</label>
                <input type="text" className="w-full rounded-lg border border-white/10 bg-white/4 px-3 py-1.5 text-[11px] text-white/75 placeholder-white/15 focus:outline-none focus:border-cyan-400/40 transition-colors" value={footer.newsletterTitle}
                  onChange={(e) => update({ newsletterTitle: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/40">Placeholder del input</label>
                <input type="text" className="w-full rounded-lg border border-white/10 bg-white/4 px-3 py-1.5 text-[11px] text-white/75 placeholder-white/15 focus:outline-none focus:border-cyan-400/40 transition-colors" value={footer.newsletterPlaceholder}
                  onChange={(e) => update({ newsletterPlaceholder: e.target.value })} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Legal links ── */}
      <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
        <div className="flex items-center gap-2 border-b border-white/6 px-4 py-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/60">Enlaces Legales</span>
        </div>
        <div className="p-4 space-y-4">
          <div className="space-y-1.5">
            {footer.legalLinks.map((link, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <input
                  type="text"
                  className="flex-1 rounded border border-white/6 bg-white/3 px-2 py-1 text-[10px] text-white/60 focus:outline-none focus:border-white/20"
                  value={link.label}
                  onChange={(e) => updateLegal(i, 'label', e.target.value)}
                  placeholder="Etiqueta"
                />
                <input
                  type="text"
                  className="w-28 rounded border border-white/6 bg-white/3 px-2 py-1 font-mono text-[9px] text-white/40 focus:outline-none focus:border-white/20"
                  value={link.href}
                  onChange={(e) => updateLegal(i, 'href', e.target.value)}
                  placeholder="/ruta"
                />
                <button className="text-white/20 hover:text-red-400 transition-colors text-[10px]" onClick={() => removeLegal(i)}>✕</button>
              </div>
            ))}
          </div>
          <button className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-cyan-400/15 py-2 text-[9px] uppercase tracking-[0.12em] text-cyan-400/40 hover:border-cyan-400/30 hover:text-cyan-400/70 transition-all" onClick={addLegal} style={{ marginTop: '8px' }}>
            + Añadir enlace legal
          </button>
        </div>
      </div>
    </div>
  )
}
