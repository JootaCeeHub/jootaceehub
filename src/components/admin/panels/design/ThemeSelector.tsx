'use client'

import { useAdmin } from '@/lib/admin/store'
import { motion } from 'framer-motion'
import { Moon, Sun, Monitor } from 'lucide-react'

export default function ThemeSelector() {
  const { state, dispatch } = useAdmin()
  const { design } = state

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center gap-2">
        {design.darkModeDefault === 'dark' ? <Moon className="h-4 w-4 text-primary" /> : design.darkModeDefault === 'light' ? <Sun className="h-4 w-4 text-primary" /> : <Monitor className="h-4 w-4 text-primary" />}
        <h2 className="text-sm font-semibold">Default Theme</h2>
      </div>
      <div className="flex gap-2">
        {(['dark', 'light', 'system'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => dispatch({ type: 'UPDATE_DESIGN', payload: { darkModeDefault: mode } })}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
              design.darkModeDefault === mode
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-background text-muted-foreground hover:bg-muted'
            }`}
          >
            {mode === 'dark' && <Moon className="h-3.5 w-3.5" />}
            {mode === 'light' && <Sun className="h-3.5 w-3.5" />}
            {mode === 'system' && <Monitor className="h-3.5 w-3.5" />}
            <span className="capitalize">{mode}</span>
          </button>
        ))}
      </div>
    </motion.div>
  )
}
