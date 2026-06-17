'use client'

import { useState, useEffect } from 'react'
import { RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdmin } from '@/lib/admin/store'
import type { VisualEffectsConfig, HeroSceneConfig, BgGridConfig } from '@/lib/admin/types'
import { defaultVisualEffects, defaultHeroSceneConfig, defaultPageEffectsMap } from '@/lib/admin/defaults/effects'
import { EFFECT_ORDER, EFFECT_LABELS, EFFECT_EXTRA_LABELS } from './constants'

// ─── Sub-tab types ────────────────────────────────────────────────────────────

type FxTab = 'webfx' | 'visual' | 'pagemap'
const FX_TABS: { id: FxTab; label: string }[] = [
  { id: 'webfx',   label: 'Web FX' },
  { id: 'visual',  label: 'Visual Engine' },
  { id: 'pagemap', label: 'Page Map' },
]

const PAGE_ROWS = [
  { slug: 'home',           label: 'Home',           icon: '⌂' },
  { slug: 'systems',        label: 'Systems',        icon: '◈' },
  { slug: 'labs',           label: 'Labs',           icon: '⬡' },
  { slug: 'infrastructure', label: 'Infrastructure', icon: '⊟' },
  { slug: 'github',         label: 'GitHub',         icon: '◻' },
  { slug: 'about',          label: 'About',          icon: '◯' },
  { slug: 'contact',        label: 'Contact',        icon: '⊗' },
  { slug: 'playground',     label: 'Playground',     icon: '◆' },
  { slug: 'research',       label: 'Research',       icon: '⬢' },
]

const PAGE_SLOTS: { key: 'scene3d' | 'particles' | 'parallax' | 'grain'; label: string }[] = [
  { key: 'scene3d',   label: '3D' },
  { key: 'particles', label: 'Pts' },
  { key: 'parallax',  label: 'Prlx' },
  { key: 'grain',     label: 'Grain' },
]

// ─── Shared primitives ────────────────────────────────────────────────────────

function Toggle({ on, onToggle, size = 'md' }: { on: boolean; onToggle: () => void; size?: 'sm' | 'md' }) {
  const sm = size === 'sm'
  return (
    <button type="button" onClick={onToggle}
      className={cn(
        'relative rounded-full border transition-all duration-200 cursor-pointer flex-shrink-0',
        sm ? 'h-5 w-9' : 'h-6 w-11',
        on ? 'border-primary/60 bg-primary/20' : 'border-border/40 bg-card/40'
      )}>
      <span className={cn(
        'absolute top-0.5 rounded-full transition-all duration-200',
        sm ? 'h-4 w-4' : 'h-5 w-5',
        on ? (sm ? 'left-[18px] bg-primary' : 'left-[22px] bg-primary') : 'left-0.5 bg-muted-foreground/40'
      )} />
    </button>
  )
}

function Slider({ value, min, max, step, disabled, onChange, label, decimals = 0 }: {
  value: number; min: number; max: number; step: number
  disabled?: boolean; onChange: (v: number) => void; label?: string; decimals?: number
}) {
  return (
    <div className="flex items-center gap-2 mt-1.5">
      {label && <span className="text-[9px] text-muted-foreground/60 w-20 shrink-0">{label}</span>}
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        disabled={disabled}
        className="flex-1 h-1.5 accent-primary cursor-pointer disabled:opacity-30" />
      <span className="w-10 text-right font-mono text-[10px] text-muted-foreground">{value.toFixed(decimals)}</span>
    </div>
  )
}

function ColorSwatch({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div className="flex items-center gap-2 mt-1.5">
      <span className="text-[9px] text-muted-foreground/60 w-20 shrink-0">{label}</span>
      <input type="color" value={value} onChange={e => onChange(e.target.value)}
        className="h-6 w-8 rounded cursor-pointer border border-border/30 bg-transparent p-0.5" />
      <span className="font-mono text-[9px] text-muted-foreground">{value}</span>
    </div>
  )
}

// ─── Web FX sub-panel ─────────────────────────────────────────────────────────

function WebFXPanel() {
  const { state, dispatch } = useAdmin()
  const ve = state.visualEffects

  type EffectKey = keyof Omit<VisualEffectsConfig, 'activeShaderPreset' | 'shaderPresets' | 'bgGrid' | 'bgGradientOpacity'>
  function setEnabled(key: EffectKey, enabled: boolean) {
    dispatch({ type: 'UPDATE_VISUAL_EFFECTS', payload: { [key]: { ...(ve[key] as object), enabled } } })
  }
  function setIntensity(key: EffectKey, intensity: number) {
    dispatch({ type: 'UPDATE_VISUAL_EFFECTS', payload: { [key]: { ...(ve[key] as object), intensity } } })
  }
  function setExtra<K extends keyof VisualEffectsConfig>(key: K, field: string, value: number) {
    dispatch({ type: 'UPDATE_VISUAL_EFFECTS', payload: { [key]: { ...(ve[key] as object), [field]: value } } })
  }

  const activeCount = EFFECT_ORDER.filter(k => (ve[k] as { enabled: boolean }).enabled).length

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-primary/60">Web Effects</span>
          <span className="rounded-full border border-primary/30 bg-primary/10 px-1.5 py-0.5 font-mono text-[8px] text-primary">
            {activeCount}/{EFFECT_ORDER.length} active
          </span>
        </div>
        <button type="button" onClick={() => dispatch({ type: 'UPDATE_VISUAL_EFFECTS', payload: defaultVisualEffects })}
          className="flex items-center gap-1 rounded-lg border border-border/30 px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground hover:border-border/60 transition-all">
          <RotateCcw className="h-2.5 w-2.5" />
          Reset defaults
        </button>
      </div>

      <div className="space-y-2">
        {EFFECT_ORDER.map((key) => {
          const effect = ve[key] as { enabled: boolean; intensity: number } & Record<string, number>
          const meta = EFFECT_LABELS[key]
          const extras = EFFECT_EXTRA_LABELS[key]
          return (
            <div key={key} className={cn(
              'rounded-xl border p-3 transition-all duration-200',
              effect.enabled ? 'border-primary/25 bg-primary/[0.04]' : 'border-border/20 bg-card/15 opacity-60'
            )}>
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-sm font-medium text-foreground">{meta.name}</span>
                    <span className={cn(
                      'rounded-full border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-widest',
                      effect.enabled
                        ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300'
                        : 'border-border/40 text-muted-foreground/50'
                    )}>{effect.enabled ? 'ON' : 'OFF'}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{meta.desc}</p>
                  <Slider value={effect.intensity} min={0} max={1} step={0.01}
                    disabled={!effect.enabled} onChange={v => setIntensity(key, v)} label="Intensity" decimals={2} />
                  {extras?.map(ex => (
                    <Slider key={ex.field}
                      value={effect[ex.field] ?? ex.default}
                      min={ex.min} max={ex.max} step={ex.step}
                      disabled={!effect.enabled}
                      onChange={v => setExtra(key, ex.field, v)}
                      label={ex.label} decimals={ex.decimals ?? 0} />
                  ))}
                </div>
                <Toggle on={effect.enabled} onToggle={() => setEnabled(key, !effect.enabled)} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Personality effects */}
      <div className="mt-5">
        <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.18em] text-violet-400/60">Personality Layer</p>
        <div className="space-y-2">
          {state.personality.effects.map((e) => (
            <div key={e.id} className={cn(
              'flex items-start gap-3 rounded-xl border p-3 transition-all duration-200',
              e.enabled ? 'border-violet-400/20 bg-violet-400/[0.04]' : 'border-border/20 bg-card/15 opacity-60'
            )}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-sm font-medium text-foreground">{e.name}</span>
                  <span className={cn(
                    'rounded-full border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-widest',
                    e.enabled ? 'border-violet-400/40 bg-violet-400/10 text-violet-300' : 'border-border/40 text-muted-foreground/50'
                  )}>{e.enabled ? 'ON' : 'OFF'}</span>
                </div>
                <Slider value={e.intensity} min={0} max={1} step={0.05} disabled={!e.enabled} label="Intensity" decimals={2}
                  onChange={v => dispatch({ type: 'SET_EFFECTS', payload: state.personality.effects.map(x => x.id === e.id ? { ...x, intensity: v } : x) })} />
              </div>
              <Toggle on={e.enabled}
                onToggle={() => dispatch({ type: 'SET_EFFECTS', payload: state.personality.effects.map(x => x.id === e.id ? { ...x, enabled: !x.enabled } : x) })} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Visual Engine sub-panel ──────────────────────────────────────────────────

const SHADER_PRESETS = [
  { id: 'cosmic-blue',  name: 'Cosmic Blue',  color: '#0d1a2e' },
  { id: 'aurora-night', name: 'Aurora Night', color: '#071220' },
  { id: 'nebula',       name: 'Nebula',       color: '#110820' },
  { id: 'cyber-ocean',  name: 'Cyber Ocean',  color: '#051820' },
  { id: 'solar-flare',  name: 'Solar Flare',  color: '#201400' },
  { id: 'deep-rose',    name: 'Deep Rose',    color: '#200818' },
  { id: 'void',         name: 'Void',         color: '#0a0a0e' },
  { id: 'forest-data',  name: 'Forest Data',  color: '#061506' },
]

const GRAD_PREVIEWS: Record<string, string> = {
  'cosmic-blue':  'linear-gradient(135deg,#0d1a2e,#0a1628,#050a0e)',
  'aurora-night': 'linear-gradient(135deg,#071220,#041514,#030a0e)',
  'nebula':       'linear-gradient(135deg,#110820,#060318,#06030e)',
  'cyber-ocean':  'linear-gradient(135deg,#051820,#040e18,#030c12)',
  'solar-flare':  'linear-gradient(135deg,#201400,#150a00,#0e0800)',
  'deep-rose':    'linear-gradient(135deg,#200818,#150510,#0e030a)',
  'void':         'linear-gradient(135deg,#0a0a0e,#07070b,#050507)',
  'forest-data':  'linear-gradient(135deg,#061506,#041004,#030a03)',
}

// ─── Live CSS token readout ───────────────────────────────────────────────────

function useLiveTokens() {
  const [tokens, setTokens] = useState<Record<string, string>>({})
  useEffect(() => {
    function read() {
      const s = getComputedStyle(document.documentElement)
      setTokens({
        '--grid-opacity':    s.getPropertyValue('--grid-opacity').trim() || '0.12',
        '--grid-line-color': s.getPropertyValue('--grid-line-color').trim() || '#557ca2',
        '--grid-size':       s.getPropertyValue('--grid-size').trim() || '64px',
        '--body-grad-1':     s.getPropertyValue('--body-grad-1').trim().slice(0, 28) + '…',
        '--primary':         s.getPropertyValue('--primary').trim(),
      })
    }
    read()
    window.addEventListener('admin-state-saved', read)
    return () => window.removeEventListener('admin-state-saved', read)
  }, [])
  return tokens
}

function VisualEnginePanel() {
  const { state, dispatch } = useAdmin()
  const sc = state.heroSceneConfig
  const ve = state.visualEffects
  const activeShader = ve.activeShaderPreset
  const liveTokens = useLiveTokens()

  const grid = ve.bgGrid ?? { enabled: true, color: '#557ca2', opacity: 0.12, size: 64, mask: true }
  const gradOpacity = ve.bgGradientOpacity ?? 1

  function set(partial: Partial<HeroSceneConfig>) {
    dispatch({ type: 'SET_HERO_SCENE_CONFIG', payload: partial })
  }
  function setShader(id: string) {
    dispatch({ type: 'UPDATE_VISUAL_EFFECTS', payload: { activeShaderPreset: id } })
  }
  function setGrid(partial: Partial<BgGridConfig>) {
    dispatch({ type: 'UPDATE_VISUAL_EFFECTS', payload: { bgGrid: { ...grid, ...partial } } })
  }
  function setGradOpacity(v: number) {
    dispatch({ type: 'UPDATE_VISUAL_EFFECTS', payload: { bgGradientOpacity: v } })
  }

  const TIER_OPTIONS: HeroSceneConfig['tierOverride'][] = ['auto', 'low', 'balanced', 'high']
  const TIER_LABELS: Record<string, string> = {
    auto: 'Auto (detect)', low: 'Low — 900 pts', balanced: 'Balanced — 1500 pts', high: 'High — 2200 pts',
  }
  const POSTFX_ROWS: { key: keyof HeroSceneConfig; label: string; desc: string }[] = [
    { key: 'postFxBloom',    label: 'Bloom glow',  desc: 'Luminous halo on sphere edges' },
    { key: 'postFxVignette', label: 'Vignette',    desc: 'Dark edge fade around canvas' },
    { key: 'animated',       label: 'Auto-rotate', desc: 'Continuous sphere rotation' },
  ]

  return (
    <div className="space-y-4">

      {/* ── Background Layer ──────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-400/70">Background Layer</p>
            <p className="text-[9px] text-muted-foreground mt-0.5">Grid lines, base color, gradient blobs</p>
          </div>
        </div>

        {/* Grid control */}
        <div className={cn(
          'rounded-xl border p-3 mb-2 transition-all duration-200',
          grid.enabled ? 'border-emerald-400/25 bg-emerald-400/[0.04]' : 'border-border/20 bg-card/15'
        )}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[11px] font-medium text-foreground">Tech Grid</p>
              <p className="text-[9px] text-muted-foreground">The square mesh overlay behind content</p>
            </div>
            <Toggle on={grid.enabled} onToggle={() => setGrid({ enabled: !grid.enabled })} />
          </div>

          <div className={cn('space-y-1', !grid.enabled && 'opacity-30 pointer-events-none')}>
            {/* Color + preview */}
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[9px] text-muted-foreground/60 w-20 shrink-0">Line color</span>
              <input type="color" value={grid.color} onChange={e => setGrid({ color: e.target.value })}
                className="h-6 w-8 rounded cursor-pointer border border-border/30 bg-transparent p-0.5" />
              <span className="font-mono text-[9px] text-muted-foreground flex-1">{grid.color}</span>
              {/* Mini preview */}
              <div className="h-6 w-16 rounded border border-border/30 overflow-hidden flex-shrink-0"
                style={{
                  background: `linear-gradient(${grid.color} 1px, transparent 1px), linear-gradient(90deg, ${grid.color} 1px, transparent 1px)`,
                  backgroundSize: `${Math.min(grid.size / 2, 16)}px ${Math.min(grid.size / 2, 16)}px`,
                  opacity: grid.opacity * 3,
                  backgroundColor: '#0d1a2e'
                }} />
            </div>

            <Slider value={grid.opacity} min={0} max={1} step={0.01}
              onChange={v => setGrid({ opacity: v })} label="Opacity" decimals={2} />
            <Slider value={grid.size} min={20} max={200} step={4}
              onChange={v => setGrid({ size: v })} label="Cell size" />

            {/* Mask toggle */}
            <div className="flex items-center justify-between mt-2">
              <div>
                <p className="text-[10px] text-foreground">Radial mask</p>
                <p className="text-[9px] text-muted-foreground">Fades grid toward edges</p>
              </div>
              <Toggle on={grid.mask} size="sm" onToggle={() => setGrid({ mask: !grid.mask })} />
            </div>
          </div>
        </div>

        {/* Gradient blob opacity */}
        <div className="rounded-xl border border-border/20 bg-card/15 p-3">
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-[11px] font-medium text-foreground">Gradient Blobs</p>
              <p className="text-[9px] text-muted-foreground">Radial color clouds behind the page (preset below)</p>
            </div>
            <span className={cn(
              'rounded-full border px-1.5 py-0.5 font-mono text-[8px]',
              gradOpacity > 0
                ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300'
                : 'border-border/40 text-muted-foreground/50'
            )}>{gradOpacity > 0 ? 'ON' : 'OFF'}</span>
          </div>
          <Slider value={gradOpacity} min={0} max={1} step={0.05}
            onChange={setGradOpacity} label="Intensity" decimals={2} />
        </div>

        {/* Live token readout */}
        <div className="mt-2 rounded-xl border border-border/15 bg-card/10 p-2.5">
          <p className="font-mono text-[8px] text-muted-foreground/40 uppercase tracking-wider mb-1.5">Live CSS vars</p>
          <div className="space-y-0.5">
            {Object.entries(liveTokens).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between gap-2">
                <span className="font-mono text-[8px] text-primary/50">{key}</span>
                <span className="font-mono text-[8px] text-muted-foreground truncate max-w-[120px]">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Background Shader ──────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-violet-400/70">Background Shader</p>
          <span className="rounded-full border border-violet-400/30 bg-violet-400/10 px-2 py-0.5 font-mono text-[8px] text-violet-300">
            {SHADER_PRESETS.find(p => p.id === activeShader)?.name ?? 'Cosmic Blue'}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {SHADER_PRESETS.map(p => (
            <button key={p.id} type="button" onClick={() => setShader(p.id)}
              className={cn(
                'relative h-12 rounded-lg border transition-all duration-150 overflow-hidden',
                activeShader === p.id
                  ? 'border-primary/50 ring-1 ring-primary/30'
                  : 'border-border/20 hover:border-border/40'
              )}
              style={{ background: GRAD_PREVIEWS[p.id] }}>
              <span className="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5 text-center font-mono text-[7px] text-white/70 truncate">
                {p.name}
              </span>
              {activeShader === p.id && (
                <span className="absolute right-1 top-1 flex h-3 w-3 items-center justify-center rounded-full bg-primary">
                  <svg viewBox="0 0 8 8" className="h-2 w-2" fill="none">
                    <path d="M1 4l2 2 4-3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </span>
              )}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-[9px] text-muted-foreground/40">Controls body radial gradient blobs. Applied instantly site-wide.</p>
      </div>

      {/* ── Hero 3D Scene ──────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-cyan-400/70">Hero 3D Scene</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">NeuralNetworkScene · React Three Fiber · Three.js</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => dispatch({ type: 'SET_HERO_SCENE_CONFIG', payload: defaultHeroSceneConfig })}
              className="flex items-center gap-1 rounded-lg border border-border/30 px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground hover:border-border/60 transition-all">
              <RotateCcw className="h-2.5 w-2.5" />
              Reset
            </button>
            <Toggle on={sc.enabled} onToggle={() => set({ enabled: !sc.enabled })} />
          </div>
        </div>

        {/* Status */}
        <div className={cn(
          'mb-3 rounded-xl border p-2.5 text-[10px] font-mono',
          sc.enabled
            ? 'border-cyan-400/20 bg-cyan-400/[0.04] text-cyan-300/70'
            : 'border-border/20 bg-card/15 text-muted-foreground/40'
        )}>
          {sc.enabled
            ? `ACTIVE · ${sc.particleCount.toLocaleString()} pts · ${sc.lineCount} lines · ∅${sc.sphereRadius.toFixed(1)} · tier:${sc.tierOverride}`
            : 'DISABLED — 3D scene hidden site-wide'}
        </div>

        <div className={cn('space-y-2', !sc.enabled && 'opacity-40 pointer-events-none')}>

          {/* Tier */}
          <div className="rounded-xl border border-border/20 bg-card/15 p-3">
            <p className="text-[10px] font-medium text-foreground mb-2">Performance Tier</p>
            <div className="grid grid-cols-2 gap-1">
              {TIER_OPTIONS.map(t => (
                <button key={t} type="button" onClick={() => set({ tierOverride: t })}
                  className={cn(
                    'rounded-lg border px-2 py-1.5 text-left text-[10px] transition-all',
                    sc.tierOverride === t
                      ? 'border-primary/40 bg-primary/10 text-primary'
                      : 'border-border/20 bg-card/10 text-muted-foreground hover:border-border/40'
                  )}>
                  {TIER_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Geometry */}
          <div className="rounded-xl border border-border/20 bg-card/15 p-3">
            <p className="text-[10px] font-medium text-foreground mb-1">Geometry</p>
            <Slider value={sc.particleCount} min={100} max={2500} step={50} onChange={v => set({ particleCount: v })} label="Particles" />
            <Slider value={sc.lineCount} min={5} max={80} step={1} onChange={v => set({ lineCount: v })} label="Lines" />
            <Slider value={sc.sphereRadius} min={0.8} max={3.0} step={0.05} onChange={v => set({ sphereRadius: v })} label="Sphere ∅" decimals={2} />
          </div>

          {/* Atmosphere */}
          <div className="rounded-xl border border-border/20 bg-card/15 p-3">
            <p className="text-[10px] font-medium text-foreground mb-1">Atmosphere</p>
            <Slider value={sc.backgroundOpacity} min={0} max={0.6} step={0.01} onChange={v => set({ backgroundOpacity: v })} label="BG opacity" decimals={2} />
            <Slider value={sc.parallaxStrength} min={0} max={0.5} step={0.01} onChange={v => set({ parallaxStrength: v })} label="Parallax" decimals={2} />
            <Slider value={sc.rotationSpeed} min={0} max={0.2} step={0.005} onChange={v => set({ rotationSpeed: v })} label="Rotation" decimals={3} />
          </div>

          {/* Holo Colors */}
          <div className="rounded-xl border border-border/20 bg-card/15 p-3">
            <p className="text-[10px] font-medium text-foreground mb-1">Holo Colors</p>
            <ColorSwatch value={sc.colorA} onChange={v => set({ colorA: v })} label="Primary (A)" />
            <ColorSwatch value={sc.colorB} onChange={v => set({ colorB: v })} label="Secondary (B)" />
            <div className="mt-2.5 h-3 rounded-md" style={{ background: `linear-gradient(90deg, ${sc.colorA}, ${sc.colorB})` }} />
          </div>

          {/* PostFX & Motion */}
          <div className="rounded-xl border border-border/20 bg-card/15 p-3">
            <p className="text-[10px] font-medium text-foreground mb-2">Post FX & Motion</p>
            <div className="space-y-2.5">
              {POSTFX_ROWS.map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-medium text-foreground">{label}</p>
                    <p className="text-[9px] text-muted-foreground">{desc}</p>
                  </div>
                  <Toggle on={sc[key] as boolean} size="sm" onToggle={() => set({ [key]: !sc[key] })} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Ambient Color Preview ──────────────────────────────────────────────── */}
      <div>
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-orange-400/70 mb-2">Ambient Color Engine</p>
        <div className="rounded-xl border border-border/20 bg-card/15 p-3 space-y-2">
          <p className="text-[9px] text-muted-foreground">Active palette colors applied site-wide via CSS variables.</p>
          <div className="flex gap-2">
            <div className="flex-1 h-8 rounded-md flex items-center justify-center text-[8px] font-mono text-white/70"
              style={{ background: 'var(--primary)' }}>--primary</div>
            <div className="flex-1 h-8 rounded-md flex items-center justify-center text-[8px] font-mono text-white/70"
              style={{ background: 'var(--accent)' }}>--accent</div>
            <div className="flex-1 h-8 rounded-md flex items-center justify-center text-[8px] font-mono text-white/70"
              style={{ background: 'var(--glow)', boxShadow: '0 0 12px var(--glow)' }}>--glow</div>
          </div>
          <p className="text-[8px] text-muted-foreground/40">Change color palette in Themes → Paleta de colores</p>
        </div>
      </div>

    </div>
  )
}

// ─── Page Map sub-panel ───────────────────────────────────────────────────────

function PageMapPanel() {
  const { state, dispatch } = useAdmin()
  const map = state.pageEffectsMap

  function toggle(slug: string, key: 'scene3d' | 'particles' | 'parallax' | 'grain') {
    const cur = map[slug] ?? { scene3d: false, particles: false, parallax: false, grain: false }
    dispatch({ type: 'SET_PAGE_EFFECT', payload: { page: slug, slot: { [key]: !cur[key] } } })
  }

  function resetAll() {
    for (const row of PAGE_ROWS) {
      const defaults = defaultPageEffectsMap[row.slug] ?? { scene3d: false, particles: false, parallax: false, grain: false }
      dispatch({ type: 'SET_PAGE_EFFECT', payload: { page: row.slug, slot: defaults } })
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-orange-400/70">Per-Page Effects</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Enable/disable effect groups per domain page</p>
        </div>
        <button type="button" onClick={resetAll}
          className="flex items-center gap-1 rounded-lg border border-border/30 px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground hover:border-border/60 transition-all">
          <RotateCcw className="h-2.5 w-2.5" />
          Reset
        </button>
      </div>

      <div className="rounded-xl border border-border/20 overflow-hidden">
        <div className="grid grid-cols-[1fr_repeat(4,44px)] border-b border-border/20 bg-card/30 px-3 py-2">
          <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50">Page</span>
          {PAGE_SLOTS.map(s => (
            <span key={s.key} className="text-center text-[8px] font-mono uppercase tracking-widest text-muted-foreground/50">{s.label}</span>
          ))}
        </div>
        {PAGE_ROWS.map((row, i) => {
          const slot = map[row.slug] ?? { scene3d: false, particles: false, parallax: false, grain: false }
          const activeCt = PAGE_SLOTS.filter(s => slot[s.key]).length
          return (
            <div key={row.slug} className={cn(
              'grid grid-cols-[1fr_repeat(4,44px)] px-3 py-2 items-center transition-colors',
              i % 2 === 0 ? 'bg-card/10' : 'bg-transparent',
              'hover:bg-white/[0.02]'
            )}>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground/40">{row.icon}</span>
                <span className="text-[11px] font-medium text-foreground">{row.label}</span>
                {activeCt > 0 && (
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-1 font-mono text-[7px] text-primary/70">{activeCt}</span>
                )}
              </div>
              {PAGE_SLOTS.map(s => (
                <div key={s.key} className="flex justify-center">
                  <button type="button" onClick={() => toggle(row.slug, s.key)}
                    className={cn(
                      'h-5 w-5 rounded border transition-all duration-150 cursor-pointer flex items-center justify-center',
                      slot[s.key]
                        ? 'border-primary/50 bg-primary/25 text-primary'
                        : 'border-border/30 bg-card/20 text-transparent hover:border-border/50'
                    )}>
                    <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )
        })}
      </div>

      <p className="mt-3 text-[9px] text-muted-foreground/40 text-center">
        This map drives which effect systems initialize per domain page
      </p>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function EffectControls() {
  const [tab, setTab] = useState<FxTab>('webfx')
  return (
    <div>
      <div className="flex gap-1 mb-5 rounded-lg border border-border/30 bg-card/20 p-0.5">
        {FX_TABS.map(t => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)}
            className={cn(
              'flex-1 rounded-md px-3 py-1.5 text-[11px] font-medium transition-all duration-150',
              tab === t.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
            )}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'webfx'   && <WebFXPanel />}
      {tab === 'visual'  && <VisualEnginePanel />}
      {tab === 'pagemap' && <PageMapPanel />}
    </div>
  )
}
