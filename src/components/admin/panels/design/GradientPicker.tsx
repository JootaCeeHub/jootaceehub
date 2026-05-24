'use client'

import { useAdmin } from '@/lib/admin/store'
import { motion } from 'framer-motion'
import { Paintbrush } from 'lucide-react'
import { useMemo } from 'react'

const palettes: Record<string, { primary: string; secondary: string; accent: string; label: string }> = {
  ocean: { primary: '#4ba8ff', secondary: '#7ed8ff', accent: '#ffd166', label: 'Ocean' },
  emerald: { primary: '#10b981', secondary: '#34d399', accent: '#f59e0b', label: 'Emerald' },
  amber: { primary: '#f59e0b', secondary: '#fbbf24', accent: '#ef4444', label: 'Amber' },
  rose: { primary: '#f43f5e', secondary: '#fb7185', accent: '#8b5cf6', label: 'Rose' },
  violet: { primary: '#8b5cf6', secondary: '#a78bfa', accent: '#10b981', label: 'Violet' },
  slate: { primary: '#64748b', secondary: '#94a3b8', accent: '#0ea5e9', label: 'Slate' },
  custom: { primary: '', secondary: '', accent: '', label: 'Custom' },
}

export default function GradientPicker() {
  const { state, dispatch } = useAdmin()
  const { design } = state

  const activePalette = useMemo(() => {
    if (design.palette === 'custom') {
      return { primary: design.customPrimary, secondary: design.customSecondary, accent: design.customAccent }
    }
    return palettes[design.palette] ?? palettes.ocean
  }, [design])

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center gap-2">
        <Paintbrush className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold">Gradients</h2>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {(['none', 'subtle', 'vibrant', 'mesh'] as const).map((g) => (
          <button
            key={g}
            onClick={() => dispatch({ type: 'UPDATE_TOKENS', payload: { gradientStyle: g } })}
            className={`relative h-16 rounded-lg border text-[10px] font-medium capitalize transition-colors ${
              design.tokens.gradientStyle === g
                ? 'border-primary'
                : 'border-border hover:border-primary/50'
            }`}
            style={{
              background: g === 'subtle'
                ? `linear-gradient(135deg, ${activePalette.primary}15, ${activePalette.secondary}15)`
                : g === 'vibrant'
                ? `linear-gradient(135deg, ${activePalette.primary}, ${activePalette.secondary})`
                : g === 'mesh'
                ? `radial-gradient(circle at 20% 20%, ${activePalette.primary}40, transparent), radial-gradient(circle at 80% 80%, ${activePalette.secondary}30, transparent)`
                : 'transparent',
            }}
          >
            <span className="absolute inset-0 flex items-center justify-center">{g}</span>
          </button>
        ))}
      </div>
    </motion.div>
  )
}
