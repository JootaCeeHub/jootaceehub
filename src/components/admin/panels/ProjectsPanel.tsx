'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ProjectsListTab } from './projects/ProjectsListTab'
import { AnalyticsTab } from './projects/AnalyticsTab'

const TABS = ['Projects', 'Analytics'] as const
type Tab = (typeof TABS)[number]

export default function ProjectsPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('Projects')

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.24em] text-violet-400/60">Portfolio</div>
        <h1 className="text-xl font-semibold tracking-tight text-white/90">Projects</h1>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white/25">Engineering portfolio &amp; case studies</p>
      </div>

      <div className="flex gap-1 rounded-xl border border-white/8 bg-white/[0.02] p-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 rounded-lg py-1.5 font-mono text-[9px] uppercase tracking-[0.12em] transition-colors',
              activeTab === tab ? 'bg-violet-400/15 text-violet-400 border border-violet-400/20' : 'text-white/30 hover:text-white/55'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Projects'  && <ProjectsListTab />}
      {activeTab === 'Analytics' && <AnalyticsTab />}
    </div>
  )
}
