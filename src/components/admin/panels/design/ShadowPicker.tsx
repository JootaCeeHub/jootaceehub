'use client'

import { useAdmin } from '@/lib/admin/store'
import { motion } from 'framer-motion'
import { Box } from 'lucide-react'

export default function ShadowPicker() {
  const { state, dispatch } = useAdmin()
  const { design } = state

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center gap-2">
        <Box className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold">Shadows</h2>
      </div>
      <div className="flex gap-2">
        {(['none', 'subtle', 'normal', 'dramatic'] as const).map((s) => (
          <button
            key={s}
            onClick={() => dispatch({ type: 'UPDATE_TOKENS', payload: { shadowIntensity: s } })}
            className={`flex-1 rounded-lg border p-3 text-[10px] font-medium capitalize transition-colors ${
              design.tokens.shadowIntensity === s
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-background text-muted-foreground hover:bg-muted'
            }`}
            style={{
              boxShadow: s === 'subtle' ? '0 1px 3px rgba(0,0,0,0.1)' : s === 'normal' ? '0 4px 12px rgba(0,0,0,0.15)' : s === 'dramatic' ? '0 12px 40px rgba(0,0,0,0.25)' : 'none',
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </motion.div>
  )
}
