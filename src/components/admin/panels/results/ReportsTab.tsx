'use client'

import { useAdmin } from '@/lib/admin/store'
import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'

export default function ReportsTab() {
  const { state } = useAdmin()
  const { results } = state

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      {results.reports.map((report) => (
        <div key={report.id} className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">{report.title}</span>
            </div>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
              report.type === 'accessibility' ? 'bg-violet-500/10 text-violet-500' :
              report.type === 'performance' ? 'bg-emerald-500/10 text-emerald-500' :
              report.type === 'seo' ? 'bg-sky-500/10 text-sky-500' :
              'bg-muted text-muted-foreground'
            }`}>
              {report.type}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-2">
            <span>{new Date(report.date).toLocaleDateString()}</span>
            <span className="font-mono text-primary">Score: {report.score}</span>
          </div>
          <p className="text-xs text-muted-foreground">{report.summary}</p>
        </div>
      ))}
    </motion.div>
  )
}
