'use client'

import { useState } from 'react'
import { Globe, Palette, Microscope } from 'lucide-react'
import { cn } from '@/lib/utils'
import SiteCorePanel from './SiteCorePanel'
import DesignPanel from './DesignPanel'
import DesignLabPanel from './DesignLabPanel'

type StudioTab = 'branding' | 'themes' | 'lab'

const TABS: { id: StudioTab; label: string; icon: React.ComponentType<{ className?: string }>; accent: string }[] = [
  { id: 'branding', label: 'Branding',    icon: Globe,       accent: '#94a3b8' },
  { id: 'themes',   label: 'Themes',      icon: Palette,     accent: '#818cf8' },
  { id: 'lab',      label: 'Design Lab',  icon: Microscope,  accent: '#22d3ee' },
]

export default function DesignStudioPanel() {
  const [activeTab, setActiveTab] = useState<StudioTab>('branding')

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center gap-1 px-4 pt-4 pb-0 border-b border-white/5 overflow-x-auto shrink-0">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-t text-xs font-medium whitespace-nowrap transition-all duration-150 cursor-pointer border-b-2 -mb-px',
                active
                  ? 'text-white border-current'
                  : 'text-white/35 border-transparent hover:text-white/60 hover:bg-white/4'
              )}
              style={active ? { color: tab.accent, borderColor: tab.accent } : undefined}
            >
              <Icon className="h-3 w-3" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Active panel */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'branding' && <SiteCorePanel />}
        {activeTab === 'themes'   && <DesignPanel />}
        {activeTab === 'lab'      && <DesignLabPanel />}
      </div>
    </div>
  )
}
