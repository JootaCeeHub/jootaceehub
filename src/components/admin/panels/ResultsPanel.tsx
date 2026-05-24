'use client'

import { useAdmin } from '@/lib/admin/store'
import { useTranslations } from '@/lib/i18n/context'
import { useState } from 'react'
import {
  ShieldCheck,
  BarChart3,
  Gauge,
  Split,
  Bell,
  FileText,
  MousePointerClick,
} from 'lucide-react'
import QualityTab from './results/QualityTab'
import MetricsTab from './results/MetricsTab'
import PerformanceTab from './results/PerformanceTab'
import AbTestsTab from './results/AbTestsTab'
import AlertsTab from './results/AlertsTab'
import ReportsTab from './results/ReportsTab'
import TrackingTab from './results/TrackingTab'

type ResultTab = 'quality' | 'metrics' | 'performance' | 'ab' | 'alerts' | 'reports' | 'tracking'

const tabs: { id: ResultTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'quality', label: 'Quality', icon: ShieldCheck },
  { id: 'metrics', label: 'Metrics', icon: BarChart3 },
  { id: 'performance', label: 'Performance', icon: Gauge },
  { id: 'ab', label: 'A/B Tests', icon: Split },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'tracking', label: 'Tracking', icon: MousePointerClick },
]

export default function ResultsPanel() {
  const t = useTranslations('admin')
  const { state } = useAdmin()
  const { results } = state
  const [tab, setTab] = useState<ResultTab>('quality')

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{t('results.title')}</h1>
        <p className="text-xs text-muted-foreground mt-1">{t('results.subtitle')}</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 rounded-xl bg-muted p-1">
        {tabs.map((t) => {
          const active = tab === t.id
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                active ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t.label}</span>
              {t.id === 'alerts' && results.alerts.some((a) => !a.acknowledged) && (
                <span className="flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                  {results.alerts.filter((a) => !a.acknowledged).length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {tab === 'quality' && <QualityTab />}
      {tab === 'metrics' && <MetricsTab />}
      {tab === 'performance' && <PerformanceTab />}
      {tab === 'ab' && <AbTestsTab />}
      {tab === 'alerts' && <AlertsTab />}
      {tab === 'reports' && <ReportsTab />}
      {tab === 'tracking' && <TrackingTab />}
    </div>
  )
}
