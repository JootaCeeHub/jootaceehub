'use client'

import { useAdmin } from '@/lib/admin/store'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function MetricsTab() {
  const { state } = useAdmin()
  const { results } = state

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.metrics.map((m) => {
          const Trend = m.trend === 'up' ? TrendingUp : m.trend === 'down' ? TrendingDown : Minus
          const trendColor = m.trend === 'up' ? 'text-emerald-500' : m.trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
          return (
            <div key={m.name} className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground">{m.name}</span>
                <Trend className={`h-3.5 w-3.5 ${trendColor}`} />
              </div>
              <div className="text-2xl font-semibold">
                {m.value.toLocaleString()}
                <span className="ml-1 text-xs font-normal text-muted-foreground">{m.unit}</span>
              </div>
              <div className="mt-3 flex items-end gap-1 h-10">
                {m.history.map((h, i) => {
                  const max = Math.max(...m.history)
                  return (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-primary/30"
                      style={{ height: `${(h / max) * 100}%` }}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
