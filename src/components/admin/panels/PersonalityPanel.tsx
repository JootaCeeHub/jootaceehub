'use client'

import { Check, Sparkles, Zap, Wind, MousePointer2, Layers, Tv2, Waves } from 'lucide-react'
import { useAdmin } from '@/lib/admin/store'
import type { DesignPersonality } from '@/lib/admin/types'
import { cn } from '@/lib/utils'

// ─── Personality registry ─────────────────────────────────────────────────────

interface PersonalityDef {
  id: DesignPersonality
  name: string
  icon: string
  desc: string
  traits: { label: string; value: number }[]
  gradientColors: string
  accentVar: string
}

const PERSONALITIES: PersonalityDef[] = [
  {
    id: 'minimalist',
    name: 'Minimalist',
    icon: '◻',
    desc: 'Clean · white space · precision',
    traits: [
      { label: 'Density', value: 15 },
      { label: 'Motion', value: 10 },
      { label: 'Color', value: 20 },
      { label: 'Depth', value: 15 },
    ],
    gradientColors: 'from-slate-500 to-slate-400',
    accentVar: '#94a3b8',
  },
  {
    id: 'corporate',
    name: 'Corporate',
    icon: '▣',
    desc: 'Structured · professional · trust',
    traits: [
      { label: 'Density', value: 60 },
      { label: 'Motion', value: 30 },
      { label: 'Color', value: 45 },
      { label: 'Depth', value: 35 },
    ],
    gradientColors: 'from-blue-600 to-blue-400',
    accentVar: '#3b82f6',
  },
  {
    id: 'creative',
    name: 'Creative',
    icon: '✦',
    desc: 'Bold · expressive · asymmetric',
    traits: [
      { label: 'Density', value: 70 },
      { label: 'Motion', value: 75 },
      { label: 'Color', value: 90 },
      { label: 'Depth', value: 60 },
    ],
    gradientColors: 'from-orange-500 to-pink-500',
    accentVar: '#f97316',
  },
  {
    id: 'futuristic',
    name: 'Futuristic',
    icon: '⬡',
    desc: 'Neon · glass · dark space',
    traits: [
      { label: 'Density', value: 55 },
      { label: 'Motion', value: 80 },
      { label: 'Color', value: 75 },
      { label: 'Depth', value: 90 },
    ],
    gradientColors: 'from-cyan-500 to-indigo-500',
    accentVar: '#06b6d4',
  },
  {
    id: 'playful',
    name: 'Playful',
    icon: '◎',
    desc: 'Rounded · bouncy · vibrant',
    traits: [
      { label: 'Density', value: 50 },
      { label: 'Motion', value: 90 },
      { label: 'Color', value: 95 },
      { label: 'Depth', value: 50 },
    ],
    gradientColors: 'from-yellow-400 to-pink-400',
    accentVar: '#facc15',
  },
  {
    id: 'elegant',
    name: 'Elegant',
    icon: '◈',
    desc: 'Serif · refined · luxury',
    traits: [
      { label: 'Density', value: 40 },
      { label: 'Motion', value: 25 },
      { label: 'Color', value: 30 },
      { label: 'Depth', value: 55 },
    ],
    gradientColors: 'from-amber-400 to-rose-400',
    accentVar: '#d4a966',
  },
  {
    id: 'brutalist',
    name: 'Brutalist',
    icon: '█',
    desc: 'Raw · thick borders · stark',
    traits: [
      { label: 'Density', value: 80 },
      { label: 'Motion', value: 5 },
      { label: 'Color', value: 10 },
      { label: 'Depth', value: 10 },
    ],
    gradientColors: 'from-zinc-400 to-zinc-600',
    accentVar: '#71717a',
  },
]

// ─── Effect icon map ──────────────────────────────────────────────────────────

const EFFECT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  particles: Sparkles,
  glow: Zap,
  grain: Tv2,
  parallax: Layers,
  cursor: MousePointer2,
  noise: Wind,
}

// ─── Quick-insert guide tags ──────────────────────────────────────────────────

const GUIDE_TAGS = [
  'glassmorphism', 'high contrast', 'generous whitespace', 'subtle motion',
  'neon accents', 'monospace type', 'grid overlay', 'frosted panels',
  'sharp edges', 'fluid curves', 'dark base', 'light base',
]

// ─── Card shell ───────────────────────────────────────────────────────────────

function Card({ dot, title, children }: { dot: string; title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/8 bg-white/[0.02]">
      <div className="flex items-center gap-2.5 border-b border-white/8 px-4 py-2.5">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: dot }} />
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/50">{title}</span>
      </div>
      <div className="p-4 space-y-4">{children}</div>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PersonalityPanel() {
  const { state, dispatch } = useAdmin()
  const { personality } = state

  const activeDef = PERSONALITIES.find((p) => p.id === personality.active) ?? PERSONALITIES[3]

  function setPersonality(id: DesignPersonality) {
    dispatch({ type: 'UPDATE_PERSONALITY', payload: { active: id } })
  }

  function toggleEffect(id: string) {
    const updated = personality.effects.map((e) =>
      e.id === id ? { ...e, enabled: !e.enabled } : e
    )
    dispatch({ type: 'UPDATE_PERSONALITY', payload: { effects: updated } })
  }

  function setIntensity(id: string, intensity: number) {
    const updated = personality.effects.map((e) =>
      e.id === id ? { ...e, intensity } : e
    )
    dispatch({ type: 'UPDATE_PERSONALITY', payload: { effects: updated } })
  }

  function appendGuideTag(tag: string) {
    const current = personality.designGuide.trim()
    const sep = current && !current.endsWith('.') && !current.endsWith(',') ? '. ' : ' '
    dispatch({
      type: 'UPDATE_PERSONALITY',
      payload: { designGuide: current ? `${current}${sep}${tag}` : tag },
    })
  }

  const enabledEffects = personality.effects.filter((e) => e.enabled)

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.24em] text-fuchsia-400/60">Visual Engine · Personality</div>
        <h1 className="text-xl font-semibold tracking-tight text-white/90">Design Personality</h1>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-white/25">{activeDef.name} mode · {enabledEffects.length} effects active</p>
      </div>

      {/* Personality selection */}
      <Card dot="#e879f9" title="Modo de personalidad">
        <div className="grid grid-cols-4 gap-2">
          {PERSONALITIES.map((p) => {
            const active = personality.active === p.id
            return (
              <div
                key={p.id}
                onClick={() => setPersonality(p.id)}
                className={cn(
                  'relative cursor-pointer overflow-hidden rounded-xl border p-3 transition-all',
                  active
                    ? 'border-fuchsia-400/40 bg-fuchsia-400/6 ring-1 ring-fuchsia-400/20'
                    : 'border-white/8 hover:border-white/15 hover:bg-white/[0.02]'
                )}
              >
                <div className="mb-2 text-xl leading-none">{p.icon}</div>
                <div className={cn(
                  'font-mono text-[9px] uppercase tracking-wider transition-colors',
                  active ? 'text-fuchsia-400' : 'text-white/40'
                )}>{p.name}</div>
                <div className="mt-0.5 text-[9px] text-white/25 leading-relaxed">{p.desc}</div>
                {active && (
                  <div className="absolute right-2 top-2 h-4 w-4 rounded-full bg-fuchsia-400/90 flex items-center justify-center">
                    <Check className="h-2.5 w-2.5 text-black" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Active personality traits */}
      <Card dot={activeDef.accentVar} title={`${activeDef.name} · características`}>
        <div className="grid grid-cols-2 gap-x-5 gap-y-3">
          {activeDef.traits.map((t) => (
            <div key={t.label} className="space-y-1">
              <div className="flex justify-between">
                <span className="font-mono text-[9px] uppercase tracking-wider text-white/40">{t.label}</span>
                <span className="font-mono text-[9px] text-white/30">{t.value}%</span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-white/8">
                <div
                  className={cn('h-full rounded-full transition-all duration-500 bg-gradient-to-r', activeDef.gradientColors)}
                  style={{ width: `${t.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Web effects */}
      <Card dot="#c084fc" title="Efectos web">
        <div className="space-y-2">
          {personality.effects.map((effect) => {
            const Icon = EFFECT_ICONS[effect.id] ?? Waves
            return (
              <div key={effect.id} className="rounded-lg border border-white/8 bg-black/20 px-3.5 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5">
                    <Icon className="h-3.5 w-3.5 text-white/50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-medium text-white/70">{effect.name}</div>
                    <div className="font-mono text-[8.5px] text-white/25">
                      {effect.enabled ? `Intensity ${Math.round(effect.intensity * 100)}%` : 'Disabled'}
                    </div>
                  </div>
                  <div
                    className={cn(
                      'relative h-5 w-9 shrink-0 cursor-pointer rounded-full border transition-all',
                      effect.enabled
                        ? 'border-fuchsia-400/40 bg-fuchsia-400/20'
                        : 'border-white/12 bg-white/5'
                    )}
                    onClick={() => toggleEffect(effect.id)}
                    role="switch"
                    aria-checked={effect.enabled}
                  >
                    <div className={cn(
                      'absolute top-0.5 h-4 w-4 rounded-full transition-all duration-200',
                      effect.enabled
                        ? 'left-[18px] bg-fuchsia-400 shadow-[0_0_6px_rgba(216,64,255,0.6)]'
                        : 'left-0.5 bg-white/30'
                    )} />
                  </div>
                </div>

                {effect.enabled && (
                  <div className="mt-2.5 space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[8.5px] text-white/25 w-16">Intensity</span>
                      <div className="flex-1 h-1.5 rounded-full bg-white/8 relative cursor-pointer">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-fuchsia-600 to-fuchsia-400 transition-all"
                          style={{ width: `${effect.intensity * 100}%` }}
                        />
                      </div>
                      <span className="font-mono text-[8.5px] text-white/40 w-8 text-right">{Math.round(effect.intensity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={Math.round(effect.intensity * 100)}
                      onChange={(e) => setIntensity(effect.id, Number(e.target.value) / 100)}
                      className="w-full h-1.5 cursor-pointer accent-fuchsia-500 bg-transparent"
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Design guide */}
      <Card dot="#a78bfa" title="Guía de diseño">
        <div className="space-y-2">
          <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/30">Instrucciones para el AI visual</div>
          <textarea
            value={personality.designGuide}
            onChange={(e) => dispatch({ type: 'UPDATE_PERSONALITY', payload: { designGuide: e.target.value } })}
            rows={4}
            placeholder="Describe el estilo visual: contraste, tipografía, motion, efectos preferidos..."
            className="w-full resize-none rounded-xl border border-white/10 bg-white/4 px-3.5 py-3 text-[11px] text-white/75 placeholder-white/15 transition-colors focus:border-fuchsia-400/30 focus:outline-none focus:bg-white/6 leading-relaxed"
          />
          <div className="font-mono text-[8px] text-white/20">{personality.designGuide.length} chars · usado por el AI para generar estilos coherentes</div>
          <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/30" style={{ marginTop: '0.5rem' }}>Insertar tags</div>
          <div className="flex flex-wrap gap-1.5">
            {GUIDE_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => appendGuideTag(tag)}
                className="cursor-pointer rounded-full border border-white/10 bg-white/4 px-2.5 py-0.5 font-mono text-[8px] text-white/30 hover:border-white/20 hover:text-white/50 transition-colors"
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Live preview strip */}
      <div className="rounded-xl border border-white/8 bg-black/30 p-4">
        <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.18em] text-white/25">Live Preview · {activeDef.name}</div>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-white/8 bg-white/[0.02] p-3">
            <div className="font-mono text-[8.5px] uppercase tracking-wider text-white/30 mb-2">Typography</div>
            <div className="text-[13px] font-medium text-white/70 leading-snug" style={{ color: activeDef.accentVar }}>
              Aa — {activeDef.name}
            </div>
            <div className="mt-1 font-mono text-[9px] text-white/25">{activeDef.desc}</div>
          </div>

          <div className="rounded-lg border border-white/8 bg-white/[0.02] p-3">
            <div className="font-mono text-[8.5px] uppercase tracking-wider text-white/30 mb-2">Accent palette</div>
            <div className="flex gap-1 mt-1">
              {[activeDef.accentVar, '#ffffff20', '#ffffff10', '#ffffff08'].map((c, i) => (
                <div
                  key={i}
                  className="h-3 w-3 rounded-full"
                  style={{ background: c, border: '1px solid rgba(255,255,255,0.1)' }}
                />
              ))}
            </div>
            <div className="mt-2">
              <div
                className="inline-flex items-center rounded-full px-3 py-1 font-mono text-[9px]"
                style={{ background: `${activeDef.accentVar}20`, color: activeDef.accentVar, border: `1px solid ${activeDef.accentVar}30` }}
              >
                Sample badge
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-white/8 bg-white/[0.02] p-3">
            <div className="font-mono text-[8.5px] uppercase tracking-wider text-white/30 mb-2">Active effects</div>
            <div className="flex flex-wrap gap-1">
              {personality.effects.map((e) => (
                <span
                  key={e.id}
                  className={cn(
                    'rounded-full px-2 py-0.5 font-mono text-[7.5px]',
                    e.enabled ? 'bg-fuchsia-400/15 text-fuchsia-400/80' : 'bg-white/5 text-white/20'
                  )}
                >
                  {e.name.split(' ')[0]}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
