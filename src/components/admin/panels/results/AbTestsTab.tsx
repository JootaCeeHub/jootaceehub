'use client'

import { useAdmin } from '@/lib/admin/store'
import { motion } from 'framer-motion'
import { Split, Award } from 'lucide-react'

export default function AbTestsTab() {
  const { state } = useAdmin()
  const { results } = state

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      {results.abTests.map((test) => (
        <div key={test.id} className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Split className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">{test.name}</span>
            </div>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
              test.status === 'running' ? 'bg-emerald-500/10 text-emerald-500' :
              test.status === 'completed' ? 'bg-primary/10 text-primary' :
              test.status === 'paused' ? 'bg-amber-500/10 text-amber-500' :
              'bg-muted text-muted-foreground'
            }`}>
              {test.status}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="rounded-lg border border-border bg-background p-3">
              <div className="text-[10px] text-muted-foreground mb-1">Variant A</div>
              <div className="text-sm font-medium">{test.variantA}</div>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <div className="text-[10px] text-muted-foreground mb-1">Variant B</div>
              <div className="text-sm font-medium">{test.variantB}</div>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Traffic split: {test.trafficSplit}% / {100 - test.trafficSplit}%</span>
            <span>{new Date(test.startDate).toLocaleDateString()} {test.endDate ? `→ ${new Date(test.endDate).toLocaleDateString()}` : ''}</span>
          </div>
          {test.winner && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-primary">
              <Award className="h-3.5 w-3.5" />
              Winner: Variant {test.winner}
            </div>
          )}
        </div>
      ))}
    </motion.div>
  )
}
