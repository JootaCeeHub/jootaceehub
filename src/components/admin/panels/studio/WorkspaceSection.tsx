'use client'

import { useCallback } from 'react'
import { Sparkles, User2, Palette, Save, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdmin } from '@/lib/admin/store'
import type { StudioConfig, StudioCustomPreset } from '@/lib/admin/types'
import { SLabel, BUILTIN_WORKSPACE_PROFILES, BUILTIN_PRESETS, PROFILE_ICONS } from './primitives'

interface Props {
  cfg: StudioConfig
  set: (partial: Partial<StudioConfig>) => void
  savingPreset: boolean
  setSavingPreset: (v: boolean) => void
  presetName: string
  setPresetName: (v: string) => void
  savingProfile: boolean
  setSavingProfile: (v: boolean) => void
  profileName: string
  setProfileName: (v: string) => void
  profileIcon: string
  setProfileIcon: (v: string) => void
  onSaveCustomPreset: () => void
  onSaveWorkspaceProfile: () => void
  onApplyWorkspaceProfile: (snapshot: Partial<StudioConfig>) => void
  onApplyCustomPreset: (p: StudioCustomPreset) => void
}

export function WorkspaceSection({
  cfg, set,
  savingPreset, setSavingPreset, presetName, setPresetName,
  savingProfile, setSavingProfile, profileName, setProfileName,
  profileIcon, setProfileIcon,
  onSaveCustomPreset, onSaveWorkspaceProfile,
  onApplyWorkspaceProfile, onApplyCustomPreset,
}: Props) {
  const { dispatch } = useAdmin()

  const applyBuiltinPreset = useCallback((p: typeof BUILTIN_PRESETS[number]) => set({
    backgroundStyle: p.bg, sidebarStyle: p.sidebar,
    accentColor: p.accent, useCustomAccent: true,
    borderRadius: p.borderRadius, glowEffect: p.glowEffect,
    sidebarBorder: p.sidebarBorder, activePreset: p.id,
  }), [set])

  return (
    <div className="space-y-5">
      {/* ─ Built-in workspace profiles ─ */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-white/30" />
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.15em] text-white/55">Workspace profiles</span>
          <div className="h-px flex-1 bg-white/6" />
        </div>
        <p className="mb-3 text-[9.5px] text-white/30">
          Full interface snapshots — apply a profile to instantly reconfigure layout, typography, density, and behavior.
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {BUILTIN_WORKSPACE_PROFILES.map(profile => (
            <button key={profile.id} onClick={() => onApplyWorkspaceProfile(profile.snapshot)}
              className="relative rounded-xl border border-white/8 bg-white/[0.025] p-3.5 text-left transition-all hover:border-white/18 hover:bg-white/[0.04] group">
              <div className="mb-2 flex items-center gap-2.5">
                <span className="text-xl leading-none">{profile.icon}</span>
                <div>
                  <div className="text-[10.5px] font-semibold text-white/70">{profile.name}</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="h-1.5 w-1.5 rounded-full" style={{ background: profile.accentColor }} />
                    <span className="font-mono text-[7.5px] text-white/25">{Object.keys(profile.snapshot).length} settings</span>
                  </div>
                </div>
              </div>
              <p className="text-[8.5px] leading-snug text-white/35">{profile.description}</p>
              <div className="mt-2.5 flex items-center justify-between">
                <div className="flex gap-1">
                  {Object.keys(profile.snapshot).slice(0, 3).map(k => (
                    <span key={k} className="rounded border border-white/8 px-1 py-0.5 font-mono text-[7px] text-white/25">{k.replace(/([A-Z])/g, ' $1').split(' ')[0]}</span>
                  ))}
                </div>
                <span className="text-[8px] uppercase tracking-wider text-white/20 group-hover:text-white/45 transition-colors">Apply →</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ─ User workspace profiles ─ */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <User2 className="h-3.5 w-3.5 text-white/30" />
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.15em] text-white/55">My profiles</span>
          <div className="h-px flex-1 bg-white/6" />
        </div>

        {cfg.workspaceProfiles.length > 0 && (
          <div className="mb-3 space-y-2">
            {cfg.workspaceProfiles.map(profile => (
              <div key={profile.id} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.025] px-3 py-2.5">
                <span className="text-lg leading-none">{profile.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-[10.5px] font-medium text-white/70">{profile.name}</div>
                  <div className="font-mono text-[8px] text-white/28">
                    {Object.keys(profile.snapshot).length} settings · {new Date(profile.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <button onClick={() => onApplyWorkspaceProfile(profile.snapshot as Partial<StudioConfig>)}
                  className="rounded-md border border-white/10 px-2.5 py-1 text-[8.5px] uppercase tracking-wider text-white/35 transition-all hover:border-white/25 hover:text-white/65">
                  Apply
                </button>
                <button onClick={() => dispatch({ type: 'STUDIO_DELETE_WORKSPACE_PROFILE', payload: profile.id })}
                  className="rounded-md p-1.5 text-white/18 hover:text-red-400/60 transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3">
          <SLabel>Save current config as profile</SLabel>
          {!savingProfile ? (
            <button onClick={() => setSavingProfile(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] py-2 text-[10px] uppercase tracking-widest text-white/40 transition-all hover:border-cyan-400/20 hover:text-cyan-400/60">
              <Save className="h-3 w-3" />
              Save workspace snapshot
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input autoFocus value={profileName} onChange={e => setProfileName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') onSaveWorkspaceProfile(); if (e.key === 'Escape') { setSavingProfile(false); setProfileName('') } }}
                  placeholder="Profile name…"
                  className="flex-1 rounded-lg border border-white/10 bg-black/20 px-2.5 py-1.5 font-mono text-[10.5px] text-white/70 placeholder:text-white/20 focus:border-cyan-400/30 focus:outline-none" />
                <button onClick={onSaveWorkspaceProfile}
                  className="rounded-lg border border-cyan-400/25 bg-cyan-400/10 px-3 py-1.5 text-[9.5px] text-cyan-400 transition-all hover:bg-cyan-400/20">
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => { setSavingProfile(false); setProfileName('') }}
                  className="rounded-lg border border-white/8 px-2.5 py-1.5 text-[9.5px] text-white/30 transition-all hover:text-white/55">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              {/* Icon picker */}
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[8.5px] text-white/30 mr-1">Icon:</span>
                {PROFILE_ICONS.map(icon => (
                  <button key={icon} onClick={() => setProfileIcon(icon)}
                    className={cn(
                      'rounded-md p-1 text-base transition-all leading-none',
                      profileIcon === icon ? 'bg-white/10 ring-1 ring-white/20' : 'hover:bg-white/5'
                    )}>
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─ Visual presets ─ */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Palette className="h-3.5 w-3.5 text-white/30" />
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.15em] text-white/55">Visual presets</span>
          <div className="h-px flex-1 bg-white/6" />
        </div>
        <p className="mb-3 text-[9.5px] text-white/30">Appearance-only: background, sidebar style, accent, radius, and glow.</p>

        <div className="grid grid-cols-2 gap-2.5 mb-3">
          {BUILTIN_PRESETS.map(preset => {
            const active   = cfg.activePreset === preset.id
            const presetBg = preset.bg === 'void' ? '#000' : preset.bg === 'slate' ? '#0f172a' : preset.bg === 'dark' ? '#0a0a14' : '#060610'
            return (
              <button key={preset.id} onClick={() => applyBuiltinPreset(preset)}
                className={cn(
                  'relative rounded-xl border p-3 text-left transition-all',
                  active ? 'border-white/25 bg-white/[0.06]' : 'border-white/8 bg-white/[0.025] hover:border-white/15 hover:bg-white/[0.04]'
                )}>
                {active && (
                  <div className="absolute right-2.5 top-2.5 flex h-4 w-4 items-center justify-center rounded-full" style={{ background: preset.accent }}>
                    <Check className="h-2.5 w-2.5 text-black" />
                  </div>
                )}
                <div className="mb-2.5 flex h-10 items-stretch gap-1 overflow-hidden rounded-lg border border-white/8" style={{ background: presetBg }}>
                  <div className="w-4 shrink-0 border-r"
                    style={{
                      borderColor: preset.sidebar === 'border' ? `${preset.accent}40` : 'rgba(255,255,255,0.06)',
                      background:  preset.sidebar === 'glass'  ? `${preset.accent}0a` : preset.sidebar === 'border' ? 'transparent' : 'rgba(255,255,255,0.03)',
                    }}>
                    <div className="mx-auto mt-1 h-0.5 w-2 rounded-full" style={{ background: preset.accent }} />
                    {[0.3, 0.2, 0.15].map((o, i) => (
                      <div key={i} className="mx-auto mt-0.5 h-0.5 w-1.5 rounded-full bg-white" style={{ opacity: o }} />
                    ))}
                  </div>
                  <div className="flex-1 p-1">
                    <div className="h-0.5 w-6 rounded-full" style={{ background: preset.accent, opacity: 0.7 }} />
                    <div className="mt-0.5 h-0.5 w-8 rounded-full bg-white/10" />
                  </div>
                </div>
                <div className="text-[10px] font-semibold" style={{ color: preset.accent }}>{preset.name}</div>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full" style={{ background: preset.accent }} />
                  <span className="font-mono text-[7.5px] text-white/25 capitalize">{preset.bg}</span>
                  <span className="ml-auto font-mono text-[7.5px] text-white/20 capitalize">{preset.sidebar}</span>
                </div>
              </button>
            )
          })}
        </div>

        {cfg.activePreset && (
          <button onClick={() => set({ activePreset: '' })}
            className="mb-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/6 py-1.5 text-[9px] uppercase tracking-widest text-white/25 transition-all hover:text-white/45">
            <X className="h-2.5 w-2.5" /> Clear active preset
          </button>
        )}

        {cfg.customPresets.length > 0 && (
          <div className="space-y-2 mb-3">
            <SLabel>Custom visual presets</SLabel>
            {cfg.customPresets.map(cp => {
              const active = cfg.activePreset === cp.id
              return (
                <div key={cp.id} className={cn(
                  'flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all',
                  active ? 'border-white/20 bg-white/[0.05]' : 'border-white/8 bg-white/[0.025]'
                )}>
                  <div className="h-5 w-5 shrink-0 rounded-full border-2 border-white/20" style={{ background: cp.config.accentColor ?? '#22d3ee' }} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[10.5px] font-medium text-white/70">{cp.name}</div>
                    <div className="font-mono text-[8px] text-white/28 capitalize">{cp.config.backgroundStyle} · {cp.config.sidebarStyle}</div>
                  </div>
                  <button onClick={() => onApplyCustomPreset(cp)}
                    className={cn('rounded-md px-2.5 py-1 text-[8.5px] uppercase tracking-wider transition-colors',
                      active ? 'bg-cyan-400/10 text-cyan-400' : 'border border-white/10 text-white/35 hover:border-white/25 hover:text-white/65'
                    )}>
                    {active ? '✓ Active' : 'Apply'}
                  </button>
                  <button onClick={() => dispatch({ type: 'STUDIO_DELETE_PRESET', payload: cp.id })}
                    className="rounded-md p-1.5 text-white/18 hover:text-red-400/60 transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )
            })}
          </div>
        )}

        <div className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3">
          <SLabel>Save current appearance as preset</SLabel>
          {!savingPreset ? (
            <button onClick={() => setSavingPreset(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] py-2 text-[10px] uppercase tracking-widest text-white/40 transition-all hover:border-cyan-400/20 hover:text-cyan-400/60">
              <Save className="h-3 w-3" />
              Save visual preset
            </button>
          ) : (
            <div className="flex gap-2">
              <input autoFocus value={presetName} onChange={e => setPresetName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') onSaveCustomPreset(); if (e.key === 'Escape') { setSavingPreset(false); setPresetName('') } }}
                placeholder="Preset name…"
                className="flex-1 rounded-lg border border-white/10 bg-black/20 px-2.5 py-1.5 font-mono text-[10.5px] text-white/70 placeholder:text-white/20 focus:border-cyan-400/30 focus:outline-none" />
              <button onClick={onSaveCustomPreset}
                className="rounded-lg border border-cyan-400/25 bg-cyan-400/10 px-3 py-1.5 text-[9.5px] text-cyan-400 transition-all hover:bg-cyan-400/20">
                <Check className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => { setSavingPreset(false); setPresetName('') }}
                className="rounded-lg border border-white/8 px-2.5 py-1.5 text-[9.5px] text-white/30 transition-all hover:text-white/55">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
