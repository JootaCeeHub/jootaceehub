'use client'

import { useState } from 'react'
import { useAdmin } from '@/lib/admin/store'
import { MAIN_TABS } from './research/utils'
import type { MainTab } from './research/utils'
import { ArticlesTab } from './research/ArticlesTab'
import { IntelligenceTab } from './research/IntelligenceTab'
import { DriveTab } from './research/DriveTab'

export default function ResearchManagerPanel() {
  const { state } = useAdmin()
  const [tab, setTab] = useState<MainTab>('publications')

  const articles = state.researchRegistry
  const links = state.curatedLinks
  const resources = state.driveResources
  const intelFeeds = state.intelligence.feeds

  const publishedArticles = articles.filter((a) => a.published).length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.24em] text-emerald-400/60">Research Manager</div>
        <h1 className="text-xl font-semibold tracking-tight text-white/90">Operations Center</h1>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white/25">
          {articles.length} publications · {links.length} collections · {resources.length} resources · {intelFeeds.length} feeds
        </p>
      </div>

      {/* Global stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Publications', value: publishedArticles, total: articles.length, color: '#f472b6' },
          { label: 'Collections', value: links.filter((l) => l.published).length, total: links.length, color: '#60a5fa' },
          { label: 'Resources', value: resources.filter((r) => r.published).length, total: resources.length, color: '#34d399' },
          { label: 'Intel Feeds', value: intelFeeds.filter((f) => f.enabled).length, total: intelFeeds.length, color: '#22d3ee' },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-white/8 bg-white/[0.025] px-3 py-2.5 text-center">
            <div className="text-[16px] font-semibold tabular-nums" style={{ color: m.color }}>{m.value}<span className="text-[11px] text-white/30">/{m.total}</span></div>
            <div className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.14em] text-white/25">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl border border-white/8 bg-white/[0.02] p-1">
        {MAIN_TABS.map((t) => {
          const countMap: Record<MainTab, number> = {
            publications: articles.length,
            intelligence: intelFeeds.length + links.length + state.trackedSources.length,
            resources: resources.length,
          }
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className={tab === t.id ? 'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.1em] transition-colors bg-emerald-400/15 text-emerald-400 border border-emerald-400/20' : 'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.1em] transition-colors text-white/30 hover:text-white/55'}>
              <span>{t.icon}</span>
              <span>{t.label}</span>
              {countMap[t.id] > 0 && <span className="rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[8px] text-white/30">{countMap[t.id]}</span>}
            </button>
          )
        })}
      </div>

      {tab === 'publications' && <ArticlesTab />}
      {tab === 'intelligence' && <IntelligenceTab />}
      {tab === 'resources'    && <DriveTab />}
    </div>
  )
}
