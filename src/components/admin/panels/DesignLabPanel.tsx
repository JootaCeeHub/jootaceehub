'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { TABS } from './designlab/constants'
import type { Tab } from './designlab/constants'
import { EffectControls } from './designlab/EffectControls'
import { LibraryCatalog } from './designlab/LibraryCatalog'
import { ShaderPresets } from './designlab/ShaderPresets'
import { AnimationLibrary } from './designlab/AnimationLibrary'
import { DesignReferences } from './designlab/DesignReferences'

// ─── Main Panel ───────────────────────────────────────────────────────────────

export default function DesignLabPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('effects')

  return (
    <div className="space-y-6">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/60">Visual Engine</div>
        <h2 className="text-2xl font-semibold text-foreground">Design Lab</h2>
        <p className="text-sm text-muted-foreground mt-1">Effects, libraries, shaders, and design system knowledge center</p>
      </div>

      <div className="flex flex-wrap gap-1 rounded-xl border border-border/40 bg-card/30 p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150',
              activeTab === id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
            )}
          >
            <Icon className="inline-block h-3 w-3 mr-1.5 align-middle" />
            {label}
          </button>
        ))}
      </div>

      <div>
        {activeTab === 'effects'     && <EffectControls />}
        {activeTab === 'library'     && <LibraryCatalog />}
        {activeTab === 'shaders'     && <ShaderPresets />}
        {activeTab === 'animations'  && <AnimationLibrary />}
        {activeTab === 'references'  && <DesignReferences />}
      </div>
    </div>
  )
}
