'use client'

import { useAdmin } from '@/lib/admin/store'
import { motion } from 'framer-motion'

export default function TrackingTab() {
  const { state } = useAdmin()
  const { results } = state

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-2">Event</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Label</th>
              <th className="px-4 py-2">Value</th>
              <th className="px-4 py-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {results.tracking.map((t) => (
              <tr key={t.id} className="border-b border-border/50 last:border-0">
                <td className="px-4 py-2 font-mono text-xs">{t.event}</td>
                <td className="px-4 py-2 text-xs">{t.category}</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">{t.label}</td>
                <td className="px-4 py-2 text-xs font-mono">{t.value ?? '-'}</td>
                <td className="px-4 py-2 text-[10px] text-muted-foreground">{new Date(t.timestamp).toLocaleTimeString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
