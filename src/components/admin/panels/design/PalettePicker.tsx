'use client'

import { useAdmin } from '@/lib/admin/store'
import { motion } from 'framer-motion'
import { Palette } from 'lucide-react'
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

export default function PalettePicker() {
  const { state, dispatch } = useAdmin()
  const { design } = state

  const activePalette = useMemo(() => {
    if (design.palette === 'custom') {
      return { primary: design.customPrimary, secondary: design.customSecondary, accent: design.customAccent }
    }
    return palettes[design.palette] ?? palettes.ocean
  }, [design])

  const updateDesign = (payload: Partial<typeof design>) => dispatch({ type: 'UPDATE_DESIGN', payload })

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center gap-2">
        <Palette className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold">Color Palette</h2>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {Object.entries(palettes).map(([key, p]) => (
          <button
            key={key}
            onClick={() => updateDesign({ palette: key as typeof design.palette })}
            className={`flex flex-col items-center gap-1.5 rounded-lg border p-2.5 transition-colors ${
              design.palette === key
                ? 'border-primary bg-primary/10'
                : 'border-border bg-background hover:bg-muted'
            }`}
          >
            <div className="flex gap-1">
              <span className="h-4 w-4 rounded-full" style={{ background: p.primary || design.customPrimary }} />
              <span className="h-4 w-4 rounded-full" style={{ background: p.secondary || design.customSecondary }} />
              <span className="h-4 w-4 rounded-full" style={{ background: p.accent || design.customAccent }} />
            </div>
            <span className="text-[10px] font-medium">{p.label}</span>
          </button>
        ))}
      </div>
      {design.palette === 'custom' && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {(['Primary', 'Secondary', 'Accent'] as const).map((colorKey) => {
            const value = design[`custom${colorKey}` as 'customPrimary' | 'customSecondary' | 'customAccent']
            return (
              <div key={colorKey} className="grid gap-1">
                <label className="text-[10px] text-muted-foreground">{colorKey}</label>
                <div className="flex items-center gap-1">
                  <input
                    type="color"
                    value={value}
                    onChange={(e) => updateDesign({ [`custom${colorKey}`]: e.target.value } as Partial<typeof design>)}
                    className="h-8 w-8 rounded border border-border p-0.5"
                  />
                  <input
                    value={value}
                    onChange={(e) => updateDesign({ [`custom${colorKey}`]: e.target.value } as Partial<typeof design>)}
                    className="flex-1 rounded-md border border-border bg-background px-2 py-1 text-[10px] outline-none"
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
