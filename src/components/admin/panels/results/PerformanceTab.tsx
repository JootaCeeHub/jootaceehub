'use client'

import { useAdmin } from '@/lib/admin/store'
import { motion } from 'framer-motion'

export default function PerformanceTab() {
  const { state } = useAdmin()
  const { results } = state

  const items = [
    { label: 'LCP', value: `${results.performance.lcp}s`, threshold: 2.5, good: 1.5 },
    { label: 'CLS', value: `${results.performance.cls}`, threshold: 0.25, good: 0.05 },
    { label: 'INP', value: `${results.performance.inp}ms`, threshold: 500, good: 200 },
    { label: 'FCP', value: `${results.performance.fcp}s`, threshold: 1.8, good: 1.0 },
    { label: 'TTFB', value: `${results.performance.ttfb}s`, threshold: 0.6, good: 0.2 },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          const raw = parseFloat(item.value)
          const pct = Math.max(0, Math.min(100, (1 - (raw - item.good) / (item.threshold - item.good)) * 100))
          const color = raw <= item.good ? 'bg-emerald-500' : raw <= item.threshold ? 'bg-amber-500' : 'bg-red-500'
          return (
            <div key={item.label} className="glass rounded-2xl p-5">
              <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
              <div className="text-xl font-semibold mb-3">{item.value}</div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </div>
      <div className="glass rounded-2xl p-5 flex items-center justify-center gap-4">
        <div className="text-4xl font-bold text-primary">{results.performance.score}</div>
        <div className="text-sm text-muted-foreground">Overall Performance Score</div>
      </div>
    </motion.div>
  )
}
