'use client'

import { motion } from 'framer-motion'
import { useAdmin } from '@/lib/admin/store'
import { useTranslations } from '@/lib/i18n/context'
import {
  Shield,
  Activity,
  Users,
  Zap,
  Clock,
  Globe,
  Server,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Info,
} from 'lucide-react'

function StatCard({ label, value, icon: Icon, trend, trendUp }: {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  trend?: string
  trendUp?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        {trend ? (
          <span className={`font-mono text-[10px] ${trendUp ? 'text-emerald-400' : 'text-amber-400'}`}>
            {trend}
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </motion.div>
  )
}

function ActivityItem({ time, event, status }: {
  time: string
  event: string
  status: 'success' | 'warning' | 'info' | 'critical'
}) {
  const colors = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    info: 'bg-primary',
    critical: 'bg-red-500',
  }
  const icons = {
    success: CheckCircle2,
    warning: AlertTriangle,
    info: Info,
    critical: AlertTriangle,
  }
  const Icon = icons[status]

  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${colors[status]}/15`}>
        <Icon className={`h-3 w-3 ${colors[status].replace('bg-', 'text-')}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{event}</p>
        <p className="font-mono text-[10px] text-muted-foreground" suppressHydrationWarning>{time}</p>
      </div>
    </div>
  )
}

export default function DashboardPanel() {
  const t = useTranslations('admin')
  const { state } = useAdmin()
  const { results } = state

  const perf = results.performance
  const perfItems = [
    { label: 'LCP', value: `${perf.lcp}s`, pct: Math.round((1 - perf.lcp / 2.5) * 100), color: perf.lcp < 1.5 ? 'bg-emerald-500' : perf.lcp < 2.5 ? 'bg-amber-500' : 'bg-red-500' },
    { label: 'CLS', value: `${perf.cls}`, pct: Math.round((1 - perf.cls / 0.25) * 100), color: perf.cls < 0.05 ? 'bg-emerald-500' : perf.cls < 0.25 ? 'bg-amber-500' : 'bg-red-500' },
    { label: 'INP', value: `${perf.inp}ms`, pct: Math.round((1 - perf.inp / 500) * 100), color: perf.inp < 200 ? 'bg-emerald-500' : perf.inp < 500 ? 'bg-amber-500' : 'bg-red-500' },
    { label: 'FCP', value: `${perf.fcp}s`, pct: Math.round((1 - perf.fcp / 1.8) * 100), color: perf.fcp < 1.0 ? 'bg-emerald-500' : perf.fcp < 1.8 ? 'bg-amber-500' : 'bg-red-500' },
  ]

  const traffic = [40, 55, 45, 70, 60, 80, 75, 90, 85, 95, 88, 100]
  const maxTraffic = Math.max(...traffic)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-xs text-muted-foreground">{t('dashboard.subtitle')}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Visitors" value="12.4K" icon={Users} trend="+8.2%" trendUp />
        <StatCard label="Active Systems" value="8/8" icon={Server} trend="100%" trendUp />
        <StatCard label="Uptime" value="99.98%" icon={Clock} trend="-0.01%" trendUp={false} />
        <StatCard label="Requests" value="842K" icon={Zap} trend="+12.5%" trendUp />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-5 lg:col-span-2"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium">System Activity</h2>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-1 max-h-80 overflow-auto pr-1">
            {results.alerts.map((alert) => (
              <ActivityItem
                key={alert.id}
                time={new Date(alert.timestamp).toLocaleString()}
                event={alert.message}
                status={alert.severity === 'critical' ? 'critical' : alert.severity === 'warning' ? 'warning' : 'info'}
              />
            ))}
            <ActivityItem time="2026-05-18 11:34:21 UTC" event="Route table refreshed with 24 tool endpoints." status="success" />
            <ActivityItem time="2026-05-18 11:33:12 UTC" event="Memory compaction delay detected (32s)." status="warning" />
            <ActivityItem time="2026-05-18 11:31:57 UTC" event="Signal pipeline processed 128 events in current cycle." status="success" />
            <ActivityItem time="2026-05-18 11:30:03 UTC" event="Retry triggered for webhook batch #8841." status="critical" />
            <ActivityItem time="2026-05-18 11:25:00 UTC" event="Deployment trading-ai-engine v2.4.1 successful." status="success" />
            <ActivityItem time="2026-05-18 10:12:00 UTC" event="MCP gateway handshake completed on staging." status="success" />
          </div>
        </motion.div>

        {/* Performance */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass rounded-2xl p-5"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium">Performance</h2>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            {perfItems.map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-mono">{item.value}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(0, Math.min(100, item.pct))}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full ${item.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-primary/5 p-3">
            <div className="text-2xl font-bold text-primary">{perf.score}</div>
            <div className="text-[10px] text-muted-foreground leading-tight">
              Overall<br />Performance Score
            </div>
          </div>
        </motion.div>
      </div>

      {/* Traffic */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-5"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium">Traffic Overview</h2>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex items-end gap-1.5 h-32">
          {traffic.map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${(h / maxTraffic) * 100}%` }}
              transition={{ duration: 0.5, delay: i * 0.03 }}
              className="flex-1 rounded-t bg-primary/30 transition hover:bg-primary/60 relative group"
            >
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block rounded bg-popover px-1.5 py-0.5 text-[10px] text-popover-foreground shadow">
                {h}%
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-2 flex justify-between font-mono text-[10px] text-muted-foreground">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>23:59</span>
        </div>
      </motion.div>
    </div>
  )
}
