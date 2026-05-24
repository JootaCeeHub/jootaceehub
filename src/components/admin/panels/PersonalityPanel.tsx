'use client'

import { useAdmin } from '@/lib/admin/store'
import { useTranslations } from '@/lib/i18n/context'
import { motion } from 'framer-motion'
import { Sparkles, Wind, Briefcase, Palette, Rocket, Gamepad2, Crown, Hammer, Eye, EyeOff, SlidersHorizontal, BookOpen } from 'lucide-react'
import { useCallback } from 'react'

const personalities = [
  { id: 'minimalist', label: 'Minimalist', icon: Wind, desc: 'Clean lines, generous whitespace, restrained color.' },
  { id: 'corporate', label: 'Corporate', icon: Briefcase, desc: 'Trustworthy blues, structured grids, conservative.' },
  { id: 'creative', label: 'Creative', icon: Palette, desc: 'Bold colors, asymmetric layouts, expressive type.' },
  { id: 'futuristic', label: 'Futuristic', icon: Rocket, desc: 'Neon accents, glassmorphism, spatial depth.' },
  { id: 'playful', label: 'Playful', icon: Gamepad2, desc: 'Rounded shapes, bright palettes, bouncy motion.' },
  { id: 'elegant', label: 'Elegant', icon: Crown, desc: 'Serif type, muted tones, refined spacing.' },
  { id: 'brutalist', label: 'Brutalist', icon: Hammer, desc: 'Raw borders, system fonts, high contrast.' },
] as const

export default function PersonalityPanel() {
  const t = useTranslations('admin')
  const { state, dispatch } = useAdmin()
  const { personality } = state

  const updatePersonality = useCallback((payload: Partial<typeof personality>) => {
    dispatch({ type: 'UPDATE_PERSONALITY', payload })
  }, [dispatch])

  const toggleEffect = useCallback((id: string) => {
    const next = personality.effects.map((e) =>
      e.id === id ? { ...e, enabled: !e.enabled } : e
    )
    dispatch({ type: 'SET_EFFECTS', payload: next })
  }, [personality.effects, dispatch])

  const updateIntensity = useCallback((id: string, intensity: number) => {
    const next = personality.effects.map((e) =>
      e.id === id ? { ...e, intensity } : e
    )
    dispatch({ type: 'SET_EFFECTS', payload: next })
  }, [personality.effects, dispatch])

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{t('personality.title')}</h1>
        <p className="text-xs text-muted-foreground mt-1">{t('personality.subtitle')}</p>
      </div>

      {/* Personalities */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Design Personality</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {personalities.map((p) => {
            const active = personality.active === p.id
            const Icon = p.icon
            return (
              <button
                key={p.id}
                onClick={() => updatePersonality({ active: p.id })}
                className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                  active
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-background hover:bg-muted'
                }`}
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${active ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <div className={`text-sm font-semibold ${active ? 'text-primary' : ''}`}>{p.label}</div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground leading-snug">{p.desc}</div>
                </div>
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Web Effects */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-5">
        <div className="mb-4 flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Web Effects</h2>
        </div>
        <div className="space-y-3">
          {personality.effects.map((effect) => (
            <div
              key={effect.id}
              className={`flex items-center gap-4 rounded-lg border p-3 transition-colors ${
                effect.enabled ? 'border-border bg-background' : 'border-border/50 bg-muted/30'
              }`}
            >
              <button
                onClick={() => toggleEffect(effect.id)}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors ${
                  effect.enabled ? 'text-emerald-500 hover:bg-emerald-500/10' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {effect.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{effect.name}</div>
                <div className="text-[10px] text-muted-foreground">{effect.enabled ? 'Enabled' : 'Disabled'}</div>
              </div>
              <div className="flex items-center gap-2 w-32">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={effect.intensity}
                  onChange={(e) => updateIntensity(effect.id, parseFloat(e.target.value))}
                  disabled={!effect.enabled}
                  className="flex-1 accent-primary"
                />
                <span className="w-8 text-right font-mono text-[10px] text-muted-foreground">{Math.round(effect.intensity * 100)}%</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Design Guide */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-5">
        <div className="mb-4 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Design Guide</h2>
        </div>
        <textarea
          value={personality.designGuide}
          onChange={(e) => updatePersonality({ designGuide: e.target.value })}
          rows={6}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none"
          placeholder="Enter design principles and guidelines..."
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {['High contrast', 'Generous whitespace', 'Subtle motion', 'Readable hierarchy', 'Glassmorphism sparingly', 'Consistent spacing', 'Accessible colors'].map((tag) => (
            <button
              key={tag}
              onClick={() => updatePersonality({ designGuide: personality.designGuide ? `${personality.designGuide}\n${tag}` : tag })}
              className="rounded-full bg-muted px-2.5 py-1 text-[10px] text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            >
              + {tag}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
