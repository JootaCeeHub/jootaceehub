'use client'

import { motion } from 'framer-motion'

export function AuraSignalPanel({ signals }: { signals: Array<{ label: string; value: number }> }) {
  return (
    <div className="glass rounded-2xl p-5">
      <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-primary">AURA Signal Matrix</p>
      <div className="space-y-4">
        {signals.map((signal, index) => (
          <div key={signal.label}>
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>{signal.label}</span>
              <span>{signal.value}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary/70">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-cyan-200"
                initial={{ width: 0 }}
                whileInView={{ width: `${signal.value}%` }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.8 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
