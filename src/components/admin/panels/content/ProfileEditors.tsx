'use client'

import { useState } from 'react'
import { ExternalLink, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdmin } from '@/lib/admin/store'
import { profile } from '@/lib/config/brand'
import type { ContactContent, NewsletterContent, MapContent } from '@/lib/admin/types'
import { inp, area, F, Tog, I18nRow } from './primitives'

// ─── About editor (full — CMS state + brand.ts profile reference) ─────────────

export function AboutEditor() {
  const { state, dispatch } = useAdmin()
  const [sec, setSec] = useState<'cms' | 'expertise' | 'services' | 'philosophy' | 'social'>('cms')
  const a = state.aboutConfig
  const p = (d: Partial<typeof a>) => dispatch({ type: 'UPDATE_ABOUT', payload: d })

  const tabs = [
    { id: 'cms',       label: 'CMS'       },
    { id: 'expertise', label: 'Expertise' },
    { id: 'services',  label: 'Services'  },
    { id: 'philosophy',label: 'Filosofía' },
    { id: 'social',    label: 'Social'    },
  ] as const

  return (
    <div className="space-y-3">
      {/* Sub-tabs */}
      <div className="flex flex-wrap gap-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setSec(t.id)}
            className={cn('rounded-lg border px-2.5 py-1 text-[10px] font-medium transition-all',
              sec === t.id ? 'border-white/15 bg-white/8 text-white/70' : 'border-white/6 text-white/30 hover:text-white/60')}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── CMS state ── */}
      {sec === 'cms' && (
        <div className="space-y-2.5">
          <div className="rounded-lg border border-white/6 bg-white/[0.015] px-3 py-2.5 space-y-1.5">
            <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/25">Perfil base — brand.ts (referencia)</p>
            <I18nRow label="role"  value={profile.role}            />
            <I18nRow label="email" value={profile.email}           />
            <I18nRow label="loc."  value={`${profile.location} / ${profile.timezone}`} />
          </div>
          <F l="Headline CMS">
            <input className={inp} value={a.headline} onChange={e => p({ headline: e.target.value })} />
          </F>
          <F l="Bio CMS">
            <textarea rows={4} className={area} value={a.bio} onChange={e => p({ bio: e.target.value })} />
          </F>
          <div className="grid grid-cols-2 gap-2">
            <F l="Ubicación">
              <input className={inp} value={a.location} onChange={e => p({ location: e.target.value })} />
            </F>
            <F l="Disponibilidad">
              <select className={cn(inp, 'cursor-pointer')} value={a.availability}
                onChange={e => p({ availability: e.target.value as typeof a.availability })}>
                <option value="available">Disponible</option>
                <option value="limited">Limitado</option>
                <option value="unavailable">No disponible</option>
              </select>
            </F>
          </div>
          <F l="Skills (coma)">
            <input className={inp} value={a.skills.join(', ')}
              onChange={e => p({ skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
          </F>
          <F l="Tools (coma)">
            <input className={inp} value={(a.tools ?? []).join(', ')}
              onChange={e => p({ tools: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
          </F>
          <F l="Tipos colaboración (coma)">
            <input className={inp} value={(a.collaborationTypes ?? []).join(', ')}
              onChange={e => p({ collaborationTypes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
          </F>
          {(a.timeline ?? []).length > 0 && (
            <div className="space-y-1.5 border-t border-white/6 pt-2">
              <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Timeline ({a.timeline.length} entradas)</p>
              {a.timeline.map(tl => (
                <div key={tl.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-white/6 bg-white/[0.015]">
                  <span className="font-mono text-[8px] text-white/30 shrink-0">{tl.year}</span>
                  <span className="flex-1 text-[10px] text-white/60 truncate">{tl.title}</span>
                  <span className="font-mono text-[7px] text-white/25 shrink-0">{tl.org}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Expertise (brand.ts, read-only reference) ── */}
      {sec === 'expertise' && (
        <div className="space-y-2">
          <div className="rounded-lg border border-cyan-400/10 bg-cyan-400/5 px-3 py-2 text-[10px] text-cyan-400/70">
            Definido en <code className="font-mono">brand.ts → profile.expertise</code> · Edita el archivo para cambiar.
          </div>
          {profile.expertise.map((ex, i) => (
            <div key={i} className="rounded-xl border border-white/8 bg-white/[0.015] p-3 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-semibold text-white/80">{ex.title}</span>
                <span className="font-mono text-[8px] text-white/20 shrink-0">#{i + 1}</span>
              </div>
              <p className="text-[10px] text-white/45 leading-relaxed">{ex.description}</p>
              <div className="flex flex-wrap gap-1 pt-0.5">
                {ex.tags.map(t => (
                  <span key={t} className="font-mono text-[7px] rounded-full border border-violet-400/20 bg-violet-400/8 px-2 py-0.5 text-violet-400/60">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Services (brand.ts, read-only reference) ── */}
      {sec === 'services' && (
        <div className="space-y-2">
          <div className="rounded-lg border border-cyan-400/10 bg-cyan-400/5 px-3 py-2 text-[10px] text-cyan-400/70">
            Definido en <code className="font-mono">brand.ts → profile.services</code> · Edita el archivo para cambiar.
          </div>
          {profile.services.map((sv, i) => (
            <div key={i} className="rounded-xl border border-white/8 bg-white/[0.015] p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-white/80">{sv.title}</span>
                <span className="font-mono text-[7px] rounded border border-white/10 px-1.5 py-0.5 text-white/30">{sv.engagement}</span>
              </div>
              <p className="text-[10px] text-white/45 leading-relaxed">{sv.description}</p>
              <div className="space-y-1">
                <p className="font-mono text-[8px] uppercase tracking-[0.1em] text-white/25">Entregables</p>
                {sv.deliverables.map((d, di) => (
                  <div key={di} className="flex items-start gap-1.5">
                    <span className="text-white/20 text-[8px] shrink-0 mt-0.5">▸</span>
                    <span className="text-[10px] text-white/45">{d}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Philosophy (brand.ts, read-only reference) ── */}
      {sec === 'philosophy' && (
        <div className="space-y-2">
          <div className="rounded-lg border border-cyan-400/10 bg-cyan-400/5 px-3 py-2 text-[10px] text-cyan-400/70">
            Definido en <code className="font-mono">brand.ts → profile.philosophy</code> · Edita el archivo para cambiar.
          </div>
          {profile.philosophy.map((ph, i) => (
            <div key={i} className="rounded-xl border border-white/8 bg-white/[0.015] px-3 py-2.5 flex gap-3">
              <span className="font-mono text-[9px] text-white/20 shrink-0 mt-0.5">0{i + 1}</span>
              <p className="text-[11px] text-white/60 leading-relaxed italic">{ph}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Social links (brand.ts, read-only reference) ── */}
      {sec === 'social' && (
        <div className="space-y-2">
          <div className="rounded-lg border border-cyan-400/10 bg-cyan-400/5 px-3 py-2 text-[10px] text-cyan-400/70">
            Definido en <code className="font-mono">brand.ts → profile.social</code> · Edita el archivo para cambiar.
          </div>
          {profile.social.map(s => (
            <div key={s.platform} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.015] px-3 py-2.5">
              <span className="font-mono text-[10px] text-white/40 w-16 shrink-0">{s.platform}</span>
              <span className="flex-1 text-[11px] text-white/65">{s.label}</span>
              <a href={s.href} target="_blank" rel="noopener noreferrer"
                className="rounded p-1 text-white/20 hover:text-white/60 transition-colors">
                <ExternalLink size={10} />
              </a>
            </div>
          ))}
          <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.015] px-3 py-2.5">
            <span className="font-mono text-[10px] text-white/40 w-16 shrink-0">email</span>
            <span className="flex-1 text-[11px] text-white/65">{profile.email}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Contact editor ────────────────────────────────────────────────────────────

export function ContactEditor() {
  const { state, dispatch } = useAdmin()
  const [tab,     setTab]     = useState<'info' | 'availability' | 'newsletter' | 'map'>('info')
  const [newType, setNewType] = useState('')

  const c  = state.content.contact  ?? { email: '', phone: '', address: '', mapEmbedUrl: '', showForm: true, showMap: false, whatsapp: '' } as ContactContent
  const nl = state.content.newsletter ?? { title: '', description: '', placeholder: '', successMessage: '', showNameField: true } as NewsletterContent
  const mp = state.content.map ?? { embedUrl: '', markerLabel: '', zoom: 14 } as MapContent
  const ab = state.aboutConfig

  const pc  = (d: Partial<ContactContent>)    => dispatch({ type: 'UPDATE_CONTACT_CONTENT',    payload: d })
  const pnl = (d: Partial<NewsletterContent>) => dispatch({ type: 'UPDATE_NEWSLETTER_CONTENT', payload: d })
  const pmp = (d: Partial<MapContent>)        => dispatch({ type: 'UPDATE_MAP_CONTENT',        payload: d })

  const collabTypes    = ab?.collaborationTypes ?? []
  const setCollabTypes = (types: string[]) => dispatch({ type: 'UPDATE_ABOUT', payload: { collaborationTypes: types } })

  const AVAIL_COL = { available: '#34d399', limited: '#fbbf24', unavailable: '#f87171' } as const

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1">
        {([
          { id: 'info',         label: 'Contacto'       },
          { id: 'availability', label: 'Disponibilidad' },
          { id: 'newsletter',   label: 'Newsletter'     },
          { id: 'map',          label: 'Mapa & Form'    },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn('rounded-lg border px-2.5 py-1 text-[10px] font-medium transition-all',
              tab === t.id ? 'border-white/15 bg-white/8 text-white/70' : 'border-white/6 text-white/30 hover:text-white/60')}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <F l="Email">
              <input type="email" className={inp} value={c.email} onChange={e => pc({ email: e.target.value })} />
            </F>
            <F l="Teléfono">
              <input className={inp} value={c.phone} placeholder="+34 600 000 000" onChange={e => pc({ phone: e.target.value })} />
            </F>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <F l="WhatsApp">
              <input className={inp} value={c.whatsapp} placeholder="+34600000000" onChange={e => pc({ whatsapp: e.target.value })} />
            </F>
            <F l="Dirección">
              <input className={inp} value={c.address} onChange={e => pc({ address: e.target.value })} />
            </F>
          </div>
        </div>
      )}

      {tab === 'availability' && (
        <div className="space-y-3">
          <F l="Estado de disponibilidad">
            <div className="flex gap-2 mt-1">
              {(['available', 'limited', 'unavailable'] as const).map(s => {
                const col     = AVAIL_COL[s]
                const isActive = ab?.availability === s
                return (
                  <button key={s} onClick={() => dispatch({ type: 'UPDATE_ABOUT', payload: { availability: s } })}
                    className={cn('flex-1 rounded-lg border py-1.5 font-mono text-[9px] capitalize transition-all',
                      isActive ? 'border-current' : 'border-white/10 text-white/30 hover:text-white/55')}
                    style={isActive ? { color: col, borderColor: `${col}40`, background: `${col}10` } : {}}>
                    {s}
                  </button>
                )
              })}
            </div>
          </F>

          <div className="border-t border-white/6 pt-2 space-y-1.5">
            <div className="flex items-center gap-2 mb-1.5">
              <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Tipos de colaboración ({collabTypes.length})</p>
            </div>
            {collabTypes.map((type, i) => (
              <div key={i} className="flex items-center gap-2">
                <input className={cn(inp, 'flex-1')} value={type}
                  onChange={e => setCollabTypes(collabTypes.map((ct, j) => j === i ? e.target.value : ct))} />
                <button onClick={() => setCollabTypes(collabTypes.filter((_, j) => j !== i))}
                  className="rounded p-1.5 text-white/20 hover:text-red-400 transition-colors">
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input className={cn(inp, 'flex-1')} value={newType} placeholder="ej. Consulting, Freelance…"
                onChange={e => setNewType(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && newType.trim()) { setCollabTypes([...collabTypes, newType.trim()]); setNewType('') } }} />
              <button onClick={() => { if (newType.trim()) { setCollabTypes([...collabTypes, newType.trim()]); setNewType('') } }}
                className="flex items-center gap-1 rounded-lg border border-cyan-400/20 bg-cyan-400/8 px-2.5 py-1.5 text-[10px] text-cyan-400/70 hover:border-cyan-400/35 transition-all">
                <Plus size={10} />
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'newsletter' && (
        <div className="space-y-2">
          <F l="Título">
            <input className={inp} value={nl.title} onChange={e => pnl({ title: e.target.value })} />
          </F>
          <F l="Descripción">
            <textarea rows={2} className={area} value={nl.description} onChange={e => pnl({ description: e.target.value })} />
          </F>
          <F l="Placeholder">
            <input className={inp} value={nl.placeholder} onChange={e => pnl({ placeholder: e.target.value })} />
          </F>
          <F l="Mensaje de éxito">
            <input className={inp} value={nl.successMessage} onChange={e => pnl({ successMessage: e.target.value })} />
          </F>
          <Tog label="Mostrar campo nombre" on={nl.showNameField} toggle={() => pnl({ showNameField: !nl.showNameField })} />
        </div>
      )}

      {tab === 'map' && (
        <div className="space-y-2.5">
          <Tog label="Mostrar formulario de contacto" on={c.showForm} toggle={() => pc({ showForm: !c.showForm })} />
          <Tog label="Mostrar mapa"                   on={c.showMap}  toggle={() => pc({ showMap: !c.showMap })}   />
          {c.showMap && (
            <div className="border-t border-white/6 pt-2 space-y-2">
              <F l="URL embed del mapa">
                <input className={inp} value={mp.embedUrl} onChange={e => pmp({ embedUrl: e.target.value })} />
              </F>
              <div className="grid grid-cols-2 gap-2">
                <F l="Etiqueta marcador">
                  <input className={inp} value={mp.markerLabel} onChange={e => pmp({ markerLabel: e.target.value })} />
                </F>
                <F l="Zoom (1-20)">
                  <input type="number" className={inp} min={1} max={20} value={mp.zoom}
                    onChange={e => pmp({ zoom: parseInt(e.target.value) || 14 })} />
                </F>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
