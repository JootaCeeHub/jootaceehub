'use client'

import { useState } from 'react'
import { useAdmin } from '@/lib/admin/store'
import type { SocialPlatform, SocialStat } from '@/lib/admin/types'
import { PLATFORM_META } from './constants'

interface Props {
  platform: SocialPlatform
}

export function PlatformCard({ platform }: Props) {
  const { dispatch } = useAdmin()
  const [expanded, setExpanded] = useState(false)
  const [fetchingStats, setFetchingStats] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [statInput, setStatInput] = useState<SocialStat>({ label: '', value: '' })

  const meta = PLATFORM_META.find((m) => m.id === platform.id)!

  function update(data: Partial<SocialPlatform>) {
    dispatch({ type: 'UPDATE_SOCIAL_PLATFORM', payload: { id: platform.id, data } })
  }

  async function fetchStats() {
    if (!meta.fetchStats) return
    setFetchingStats(true)
    const stats = await meta.fetchStats(platform.handle, platform.apiKey)
    if (stats.length > 0) {
      update({ stats, lastSync: new Date().toISOString(), connected: true })
    }
    setFetchingStats(false)
  }

  function addStat() {
    if (!statInput.label.trim()) return
    update({ stats: [...platform.stats, { ...statInput }] })
    setStatInput({ label: '', value: '' })
  }

  function removeStat(idx: number) {
    update({ stats: platform.stats.filter((_, i) => i !== idx) })
  }

  const profileUrl = platform.profileUrl || (platform.handle ? meta.urlTemplate(platform.handle) : '')

  return (
    <div className={`rounded-xl border overflow-hidden transition-colors ${platform.connected ? 'border-white/12 bg-white/[0.025]' : 'border-white/6 bg-white/[0.01]'}`}>
      <button className="flex items-center justify-between gap-3 w-full px-4 py-3 text-left" onClick={() => setExpanded((v) => !v)}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-[18px] shrink-0">{meta.emoji}</span>
          <div>
            <div className="text-[12px] font-medium text-white/75">{meta.name}</div>
            {platform.handle
              ? <div className="font-mono text-[9px] text-white/35 mt-0.5">{platform.handle}</div>
              : <div className="font-mono text-[9px] text-white/18 mt-0.5 italic">Sin configurar</div>
            }
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {platform.stats.length > 0 && (
            <div className="hidden md:flex gap-1">
              {platform.stats.slice(0, 2).map((st, i) => (
                <span key={i} className="rounded-md border px-1.5 py-0.5 font-mono text-[8px]" style={{ borderColor: `${meta.accent}30`, color: meta.accent }}>
                  {st.label}: {st.value}
                </span>
              ))}
            </div>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); update({ connected: !platform.connected }) }}
            className={`rounded-full border px-3 py-1 font-mono text-[8px] uppercase tracking-wider transition-colors ${platform.connected ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-400' : 'border-white/12 text-white/30 hover:border-white/20 hover:text-white/50'}`}
          >
            {platform.connected ? 'Conectado' : 'Conectar'}
          </button>
          <span className="text-[9px] text-white/25 ml-1">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-white/6 p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Handle / Username</div>
              <input
                value={platform.handle}
                onChange={(e) => {
                  const h = e.target.value
                  update({ handle: h, profileUrl: h ? meta.urlTemplate(h) : '' })
                }}
                placeholder={meta.handlePlaceholder}
                className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 font-mono text-[11px] text-white/65 placeholder-white/20 outline-none focus:border-cyan-400/25 transition-colors"
              />
            </div>
            <div className="space-y-1">
              <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Display Name</div>
              <input
                value={platform.displayName}
                onChange={(e) => update({ displayName: e.target.value })}
                placeholder="Tu nombre en la plataforma"
                className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 font-mono text-[11px] text-white/65 placeholder-white/20 outline-none focus:border-cyan-400/25 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Profile URL</div>
            <div className="flex items-center gap-2">
              <input
                value={platform.profileUrl}
                onChange={(e) => update({ profileUrl: e.target.value })}
                placeholder={profileUrl || 'https://…'}
                className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 font-mono text-[11px] text-white/65 placeholder-white/20 outline-none focus:border-cyan-400/25 transition-colors flex-1"
              />
              {profileUrl && (
                <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 rounded border border-white/10 px-2 py-1.5 font-mono text-[10px] text-white/30 hover:text-cyan-400 transition-colors">↗</a>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Bio / Descripción</div>
            <textarea
              value={platform.bio}
              onChange={(e) => update({ bio: e.target.value })}
              rows={2}
              placeholder="Descripción breve para mostrar en tu web…"
              className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 font-mono text-[11px] text-white/65 placeholder-white/20 outline-none focus:border-cyan-400/25 transition-colors resize-none leading-relaxed"
            />
          </div>

          {meta.apiLabel && (
            <div className="space-y-1">
              <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">{meta.apiLabel}</div>
              <div className="flex gap-2">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={platform.apiKey}
                  onChange={(e) => update({ apiKey: e.target.value })}
                  placeholder={meta.apiPlaceholder}
                  className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 font-mono text-[11px] text-white/65 placeholder-white/20 outline-none focus:border-cyan-400/25 transition-colors flex-1"
                />
                <button onClick={() => setShowApiKey((v) => !v)} className="shrink-0 rounded border border-white/10 px-2 py-1.5 font-mono text-[9px] text-white/30 hover:text-white/55 transition-colors">
                  {showApiKey ? 'ocultar' : 'ver'}
                </button>
              </div>
              <div className="font-mono text-[9px] text-white/20 leading-relaxed">Guardado solo en tu navegador, nunca se envía a servidores.</div>
            </div>
          )}

          <div className="space-y-1">
            <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30 flex items-center justify-between">
              <span>Stats para mostrar</span>
              {meta.hasPublicApi && (
                <button onClick={fetchStats} disabled={fetchingStats} className="rounded border border-cyan-400/25 px-2 py-0.5 font-mono text-[8px] text-cyan-400/70 hover:bg-cyan-400/10 transition-colors">
                  {fetchingStats ? '⟳ Fetching…' : '⟳ Fetch desde API'}
                </button>
              )}
            </div>
            {platform.stats.length > 0 && (
              <div className="flex flex-col gap-1 mb-2">
                {platform.stats.map((st, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-md border border-white/6 bg-white/[0.015] px-2 py-1">
                    <span className="font-mono text-[9px] text-white/40 flex-1">{st.label}</span>
                    <span className="font-mono text-[10px] text-white/65 font-medium">{st.value}</span>
                    <button onClick={() => removeStat(i)} className="font-mono text-[10px] text-white/20 hover:text-red-400/70 transition-colors ml-1">×</button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-1.5">
              <input
                value={statInput.label}
                onChange={(e) => setStatInput((p) => ({ ...p, label: e.target.value }))}
                placeholder="Label (ej: Followers)"
                className="rounded-md border border-white/8 bg-black/20 px-2 py-1 font-mono text-[9px] text-white/55 placeholder-white/20 outline-none focus:border-cyan-400/25 transition-colors flex-1"
              />
              <input
                value={String(statInput.value)}
                onChange={(e) => setStatInput((p) => ({ ...p, value: e.target.value }))}
                placeholder="Value (ej: 2.4k)"
                className="rounded-md border border-white/8 bg-black/20 px-2 py-1 font-mono text-[9px] text-white/55 placeholder-white/20 outline-none focus:border-cyan-400/25 transition-colors flex-1"
                onKeyDown={(e) => e.key === 'Enter' && addStat()}
              />
              <button onClick={addStat} className="shrink-0 rounded border border-white/10 px-2 py-1 font-mono text-[9px] text-white/35 hover:border-cyan-400/25 hover:text-cyan-400 transition-colors">+</button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Visible en web</span>
              <button
                onClick={() => update({ visible: !platform.visible })}
                className={`relative h-4 w-8 shrink-0 rounded-full border transition-colors ${platform.visible ? 'border-cyan-400/40 bg-cyan-400/20' : 'border-white/15 bg-white/5'}`}
              >
                <span className={`absolute top-0.5 h-3 w-3 rounded-full transition-all ${platform.visible ? 'left-[17px] bg-cyan-400' : 'left-0.5 bg-white/30'}`} />
              </button>
            </div>
            {platform.lastSync && (
              <span className="font-mono text-[8px] text-white/20">Sync: {platform.lastSync.slice(0, 10)}</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
