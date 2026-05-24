'use client'

import { useAdmin } from '@/lib/admin/store'
import { motion } from 'framer-motion'
import { Eye, Trash2 } from 'lucide-react'
import { useCallback } from 'react'

export default function AlertsTab() {
  const { state, dispatch } = useAdmin()
  const { results } = state

  const acknowledgeAlert = useCallback((id: string) => {
    const next = results.alerts.map((a) => a.id === id ? { ...a, acknowledged: true } : a)
    dispatch({ type: 'UPDATE_RESULTS', payload: { alerts: next } })
  }, [results.alerts, dispatch])

  const removeAlert = useCallback((id: string) => {
    const next = results.alerts.filter((a) => a.id !== id)
    dispatch({ type: 'UPDATE_RESULTS', payload: { alerts: next } })
  }, [results.alerts, dispatch])

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
      {results.alerts.length === 0 && (
        <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">No alerts</div>
      )}
      {results.alerts.map((alert) => (
        <div
          key={alert.id}
          className={`flex items-start gap-3 rounded-xl border p-4 transition-opacity ${
            alert.acknowledged ? 'opacity-50 border-border/50' : 'border-border bg-background'
          }`}
        >
          <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
            alert.severity === 'critical' ? 'bg-red-500' : alert.severity === 'warning' ? 'bg-amber-500' : 'bg-primary'
          }`} />
          <div className="flex-1 min-w-0">
            <div className="text-sm">{alert.message}</div>
            <div className="text-[10px] text-muted-foreground">{new Date(alert.timestamp).toLocaleString()}</div>
          </div>
          <div className="flex items-center gap-1">
            {!alert.acknowledged && (
              <button
                onClick={() => acknowledgeAlert(alert.id)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted"
                title="Acknowledge"
              >
                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}
            <button
              onClick={() => removeAlert(alert.id)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-destructive/10 text-destructive"
              title="Remove"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
    </motion.div>
  )
}
