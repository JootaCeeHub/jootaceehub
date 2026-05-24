'use client'

import { useAdmin } from '@/lib/admin/store'
import { motion } from 'framer-motion'
import { Type } from 'lucide-react'

export default function TypographyPicker() {
  const { state, dispatch } = useAdmin()
  const { design } = state

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center gap-2">
        <Type className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold">Typography</h2>
      </div>
      <div className="space-y-3">
        <div className="grid gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Font Family</label>
          <select
            value={design.tokens.typography}
            onChange={(e) => dispatch({ type: 'UPDATE_TOKENS', payload: { typography: e.target.value as typeof design.tokens.typography } })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="system">System</option>
            <option value="modern">Modern</option>
            <option value="classic">Classic</option>
            <option value="mono">Mono</option>
          </select>
        </div>
      </div>
    </motion.div>
  )
}
