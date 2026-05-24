'use client'

import { useAdmin } from '@/lib/admin/store'
import { useTranslations } from '@/lib/i18n/context'
import { motion } from 'framer-motion'
import {
  ShieldCheck,
  BarChart3,
  Gauge,
  Split,
  Bell,
  FileText,
  MousePointerClick,
  CheckCircle2,
  XCircle,
} from 'lucide-react'

export default function QualityTab() {
  const { state } = useAdmin()
  const { results } = state

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Quality Audit</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary">{results.quality.score}</span>
          <span className="text-[10px] text-muted-foreground">/100</span>
        </div>
      </div>
      <div className="space-y-2">
        {results.quality.checks.map((check, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
            {check.pass ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
            ) : (
              <XCircle className="h-4 w-4 shrink-0 text-red-500" />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm">{check.name}</div>
              <div className="text-[10px] text-muted-foreground">{check.detail}</div>
            </div>
            <span className={`text-[10px] font-medium shrink-0 ${check.pass ? 'text-emerald-500' : 'text-red-500'}`}>
              {check.pass ? 'Pass' : 'Fail'}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
