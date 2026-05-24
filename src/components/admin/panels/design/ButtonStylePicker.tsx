'use client'

import { useAdmin } from '@/lib/admin/store'
import { motion } from 'framer-motion'
import { MousePointerClick } from 'lucide-react'

export default function ButtonStylePicker() {
  const { state, dispatch } = useAdmin()
  const { design } = state

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center gap-2">
        <MousePointerClick className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold">Buttons</h2>
      </div>
      <div className="flex gap-3">
        {(['sharp', 'rounded', 'pill'] as const).map((b) => (
          <button
            key={b}
            onClick={() => dispatch({ type: 'UPDATE_TOKENS', payload: { buttonStyle: b } })}
            className={`flex-1 border px-4 py-2 text-xs font-medium transition-colors ${
              design.tokens.buttonStyle === b
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-muted-foreground hover:bg-muted'
            } ${b === 'sharp' ? 'rounded-none' : b === 'rounded' ? 'rounded-lg' : 'rounded-full'}`}
          >
            {b.charAt(0).toUpperCase() + b.slice(1)}
          </button>
        ))}
      </div>
    </motion.div>
  )
}
