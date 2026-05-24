'use client'

import { motion } from 'framer-motion'

export function GraphMetricsPanel({ metrics }: { metrics: Array<{ label: string; value: string }> }) {
  return (
    <div className="glass rounded-2xl p-5">
      <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-primary">Graph Metrics</p>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.06 }}
            className="rounded-lg border border-border bg-card/55 p-3"
          >
            <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">{metric.label}</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{metric.value}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
