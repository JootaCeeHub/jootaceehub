'use client'

import { useAdmin } from '@/lib/admin/store'
import { motion } from 'framer-motion'
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

export default function DesignPreview() {
  const { state } = useAdmin()
  const { design } = state

  const activePalette = useMemo(() => {
    if (design.palette === 'custom') {
      return { primary: design.customPrimary, secondary: design.customSecondary, accent: design.customAccent }
    }
    return palettes[design.palette] ?? palettes.ocean
  }, [design])

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass rounded-2xl p-5">
      <h2 className="text-sm font-semibold mb-4">Live Preview</h2>
      <div
        className="rounded-xl border border-border p-6 space-y-4"
        style={{
          background: design.tokens.gradientStyle === 'subtle'
            ? `linear-gradient(135deg, ${activePalette.primary}10, ${activePalette.secondary}10)`
            : design.tokens.gradientStyle === 'vibrant'
            ? `linear-gradient(135deg, ${activePalette.primary}20, ${activePalette.secondary}20)`
            : design.tokens.gradientStyle === 'mesh'
            ? `radial-gradient(circle at 20% 20%, ${activePalette.primary}15, transparent), radial-gradient(circle at 80% 80%, ${activePalette.secondary}10, transparent)`
            : undefined,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="h-8 w-8 rounded-lg"
            style={{ background: activePalette.primary, borderRadius: design.tokens.borderRadius === 'full' ? '9999px' : undefined }}
          />
          <div>
            <div className="text-sm font-semibold" style={{ color: activePalette.primary }}>Brand Primary</div>
            <div className="text-xs text-muted-foreground">Preview of selected tokens</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <span
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white"
            style={{
              background: activePalette.primary,
              borderRadius: design.tokens.buttonStyle === 'pill' ? '9999px' : design.tokens.buttonStyle === 'sharp' ? '0px' : '0.5rem',
              boxShadow: design.tokens.shadowIntensity === 'subtle' ? '0 1px 3px rgba(0,0,0,0.1)' : design.tokens.shadowIntensity === 'normal' ? '0 4px 12px rgba(0,0,0,0.15)' : design.tokens.shadowIntensity === 'dramatic' ? '0 12px 40px rgba(0,0,0,0.25)' : 'none',
            }}
          >
            Primary Action
          </span>
          <span
            className="inline-flex items-center border px-3 py-1.5 text-xs font-medium"
            style={{
              borderColor: activePalette.secondary,
              color: activePalette.secondary,
              borderRadius: design.tokens.buttonStyle === 'pill' ? '9999px' : design.tokens.buttonStyle === 'sharp' ? '0px' : '0.5rem',
            }}
          >
            Secondary
          </span>
          <span
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white"
            style={{
              background: activePalette.accent,
              borderRadius: design.tokens.buttonStyle === 'pill' ? '9999px' : design.tokens.buttonStyle === 'sharp' ? '0px' : '0.5rem',
            }}
          >
            Accent
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full" style={{ width: '75%', background: activePalette.primary }} />
        </div>
      </div>
    </motion.div>
  )
}
