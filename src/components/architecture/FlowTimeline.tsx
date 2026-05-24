'use client'

import { motion } from 'framer-motion'
import type { ArchitectureFlowStep } from '@/lib/architecture/types'

export function FlowTimeline({ steps }: { steps: ArchitectureFlowStep[] }) {
  return (
    <div className="glass rounded-2xl p-5">
      <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-primary">AI Operational Flow</p>
      <div className="space-y-3">
        {steps.map((step, index) => (
          <motion.article
            key={step.id}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.06 }}
            className="rounded-lg border border-border bg-card/55 p-4"
          >
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground">{step.title}</h4>
              <span className="rounded-full border border-primary/35 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
                {step.latency}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{step.summary}</p>
          </motion.article>
        ))}
      </div>
    </div>
  )
}
