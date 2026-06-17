'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import { useMemo, useEffect, useState } from 'react'
import { Bot, Cpu, Network, Wrench, Activity } from 'lucide-react'
import { useAdmin } from '@/lib/admin/store'
import { getHistory, buildSparklinePath } from '@/lib/analytics/history'
import { PERF_TARGETS, STATIC_PERF, CATEGORY_COLORS } from './utils'

// ─── Inline styles ────────────────────────────────────────────────────────────

const card        = 'overflow-hidden rounded-xl border border-white/8 bg-white/[0.02]'
const cardHeader  = 'flex items-center justify-between border-b border-white/8 px-4 py-2.5'
const cardTitle   = 'font-mono text-[10px] uppercase tracking-[0.2em] text-white/35'
const cardBadge   = 'font-mono text-[9px] text-white/20'
const editLink    = 'font-mono text-[8.5px] text-white/25 hover:text-white/55 transition-colors'

// Infrastructure
const nodeList    = 'divide-y divide-white/5'
const nodeItem    = 'flex items-center gap-2.5 px-4 py-2'
const nodeName    = 'flex-1 min-w-0 font-mono text-[10px] text-white/55 truncate'
const nodeRole    = 'font-mono text-[8.5px] text-white/25 shrink-0'
const nodeBar     = 'mt-0.5 h-0.5 w-12 overflow-hidden rounded-full bg-white/6'
const nodeCpu     = 'ml-1.5 font-mono text-[8px] text-white/20 shrink-0'
const hSummary    = 'grid grid-cols-3 border-t border-white/8'
const hSummaryItem= 'flex flex-col items-center py-2.5'
const hSummaryVal = 'font-mono text-[13px] font-semibold text-white/65'
const hSummaryLbl = 'font-mono text-[7.5px] uppercase tracking-widest text-white/22'

const nodeDot  = (status: string) => {
  const map: Record<string, string> = { running: 'bg-emerald-400', stopped: 'bg-white/20', degraded: 'bg-amber-400 animate-pulse' }
  return `h-1.5 w-1.5 shrink-0 rounded-full ${map[status] ?? 'bg-white/20'}`
}
const nodeBarFill = (pct: number) =>
  `h-full rounded-full transition-all ${pct > 70 ? 'bg-amber-400' : 'bg-emerald-400/70'}`

// AI Ecosystem
const aiRow     = 'flex items-center gap-3 px-4 py-2.5 border-b border-white/5 last:border-0'
const aiRowIcon = 'flex h-6 w-6 shrink-0 items-center justify-center rounded-md'
const aiRowLbl  = 'flex-1 min-w-0 font-mono text-[10px] text-white/50'
const aiRowVal  = 'font-mono text-[10px] font-semibold text-white/70 shrink-0'
const aiStatus  = (ok: boolean) =>
  `inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider ${ok ? 'border-emerald-400/20 text-emerald-400' : 'border-white/10 text-white/25'}`

// Content Index
const contentRow   = 'flex items-center gap-2 px-4 py-2 border-b border-white/5 last:border-0'
const contentDot   = (color: string) => `h-1.5 w-1.5 shrink-0 rounded-full ${color}`
const contentLabel = 'flex-1 font-mono text-[10px] capitalize text-white/45'
const contentCount = 'font-mono text-[10px] tabular-nums text-white/60'
const contentBar   = 'h-0.5 w-12 overflow-hidden rounded-full bg-white/6'
const pipelineRow  = 'flex items-stretch border-t border-white/6'
const pipelineStep = 'flex flex-1 flex-col items-center justify-center gap-0.5 py-3'
const pipelineVal  = 'font-mono text-[15px] font-bold text-white/65 tabular-nums'
const pipelineLbl  = 'font-mono text-[7.5px] uppercase tracking-wider text-white/22'
const pipelineArr  = 'flex items-center font-mono text-[10px] text-white/15'
const pipelineDiv  = 'w-px bg-white/8 self-stretch'

// Performance
const perfRow     = 'flex items-center gap-3 px-4 py-2 border-b border-white/5 last:border-0'
const perfLbl     = 'w-28 font-mono text-[9.5px] text-white/40'
const perfBarWrap = 'flex-1 h-1.5 overflow-hidden rounded-full bg-white/6'
const perfTarget  = 'shrink-0 font-mono text-[8px] text-white/18'
const perfHistLbl = 'w-24 font-mono text-[9px] text-white/38 shrink-0'
const perfHistRow = 'flex items-center gap-3 px-4 py-1'
const perfHistSvg = 'w-full overflow-visible'
const perfEmpty   = 'px-4 py-2.5 font-mono text-[8.5px] text-white/20'

const perfBarFill = (pct: number) =>
  `h-full rounded-full transition-all ${pct >= 90 ? 'bg-emerald-400' : pct >= 60 ? 'bg-amber-400' : 'bg-red-400'}`
const perfScore   = (pct: number) =>
  `ml-2 w-9 shrink-0 font-mono text-[9px] text-right tabular-nums ${pct >= 90 ? 'text-emerald-400' : pct >= 60 ? 'text-amber-400' : 'text-red-400'}`
const perfHistPath = (good: boolean) =>
  `fill-none ${good ? 'stroke-emerald-400/60' : 'stroke-amber-400/60'}`
const perfHistVal  = (good: boolean) =>
  `shrink-0 font-mono text-[9px] w-8 text-right tabular-nums ${good ? 'text-emerald-400' : 'text-amber-400'}`

// ─── Infrastructure card ──────────────────────────────────────────────────────

function InfrastructureCard() {
  const { state } = useAdmin()
  const runningNodes = state.infraConfig.nodes.filter(n => n.status === 'running').length
  const degraded     = state.infraConfig.nodes.filter(n => n.status === 'degraded').length
  const stopped      = state.infraConfig.nodes.filter(n => n.status === 'stopped').length

  return (
    <div className={card}>
      <div className={cardHeader}>
        <span className={cardTitle}>Infrastructure</span>
        <span className={cardBadge}>{state.infraConfig.region}</span>
      </div>
      <div className={nodeList}>
        {state.infraConfig.nodes.filter(n => n.visible).slice(0, 5).map((node) => {
          const cpu = parseInt(node.cpu, 10) || 0
          return (
            <div key={node.name} className={nodeItem}>
              <span className={nodeDot(node.status)} />
              <span className={nodeName}>{node.name}</span>
              <span className={nodeRole}>{node.role}</span>
              <div className="flex items-center gap-1">
                <div className={nodeBar}>
                  <div className={nodeBarFill(cpu)} style={{ width: `${cpu}%` }} />
                </div>
                <span className={nodeCpu}>{node.cpu}</span>
              </div>
            </div>
          )
        })}
      </div>
      <div className={hSummary}>
        <div className={hSummaryItem}>
          <div className={hSummaryVal} style={{ color: '#34d399' }}>{runningNodes}</div>
          <div className={hSummaryLbl}>Running</div>
        </div>
        <div className={hSummaryItem}>
          <div className={hSummaryVal} style={{ color: '#f59e0b' }}>{degraded}</div>
          <div className={hSummaryLbl}>Degraded</div>
        </div>
        <div className={hSummaryItem}>
          <div className={hSummaryVal} style={{ color: '#ffffff30' }}>{stopped}</div>
          <div className={hSummaryLbl}>Stopped</div>
        </div>
      </div>
    </div>
  )
}

// ─── AI Ecosystem card ────────────────────────────────────────────────────────

function AiEcosystemCard() {
  const { state } = useAdmin()
  const hermes        = state.capabilities?.hermes
  const mcpServers    = state.capabilities?.mcpServers?.filter(s => s.enabled).length ?? 0
  const skills        = state.capabilities?.skills?.filter(s => s.enabled).length ?? 0
  const conversations = state.aiConfig?.conversations?.length ?? 0

  return (
    <div className={card}>
      <div className={cardHeader}>
        <span className={cardTitle}>AI Ecosystem</span>
        <span className={cardBadge}>{state.runtime.activeAgents} agents</span>
      </div>
      <div>
        <div className={aiRow}>
          <div className={aiRowIcon} style={{ background: '#06b6d415' }}>
            <Bot className="h-3.5 w-3.5" style={{ color: '#06b6d4' }} />
          </div>
          <span className={aiRowLbl}>Hermes Agent</span>
          <span className={aiStatus(hermes?.status === 'connected')}>
            {hermes?.status ?? 'disconnected'}
          </span>
        </div>

        {state.aiConfig?.profiles?.map(p =>
          p.id === state.aiConfig?.activeProfileId ? p : null
        ).filter(Boolean).map(p => p && (
          <div key={p.id} className={aiRow}>
            <div className={aiRowIcon} style={{ background: '#a78bfa15' }}>
              <Cpu className="h-3.5 w-3.5" style={{ color: '#a78bfa' }} />
            </div>
            <span className={aiRowLbl}>{p.label}</span>
            <span className={aiStatus(!!p.apiKey)}>{p.apiKey ? 'ready' : 'no key'}</span>
          </div>
        ))}

        <div className={aiRow}>
          <div className={aiRowIcon} style={{ background: '#34d39915' }}>
            <Network className="h-3.5 w-3.5" style={{ color: '#34d399' }} />
          </div>
          <span className={aiRowLbl}>MCP Servers</span>
          <span className={aiRowVal}>{mcpServers} active</span>
        </div>

        <div className={aiRow}>
          <div className={aiRowIcon} style={{ background: '#f59e0b15' }}>
            <Wrench className="h-3.5 w-3.5" style={{ color: '#f59e0b' }} />
          </div>
          <span className={aiRowLbl}>Skills & Agents</span>
          <span className={aiRowVal}>{skills} enabled</span>
        </div>

        <div className={aiRow}>
          <div className={aiRowIcon} style={{ background: '#38bdf815' }}>
            <Activity className="h-3.5 w-3.5" style={{ color: '#38bdf8' }} />
          </div>
          <span className={aiRowLbl}>Conversations</span>
          <span className={aiRowVal}>{conversations}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Content Index card ───────────────────────────────────────────────────────

function ContentIndexCard() {
  const { state, dispatch } = useAdmin()
  const [historyEntries, setHistoryEntries] = useState(() => getHistory())

  useEffect(() => {
    setHistoryEntries(getHistory())
  }, [])

  const publishedArticles = state.researchRegistry.filter(r => r.published).length
  const featuredArticles  = state.researchRegistry.filter(r => r.featured).length
  const draftArticles     = state.researchRegistry.filter(r => !r.published).length
  const wipLabs           = state.labsRegistry.filter(l => l.status === 'rd').length
  const betaLabs          = state.labsRegistry.filter(l => l.status === 'beta').length
  const liveLabs          = state.labsRegistry.filter(l => l.status === 'live').length

  const categories = (['opinion', 'research', 'essays', 'news'] as const).map(cat => ({
    cat,
    count: state.researchRegistry.filter(r => r.category === cat && r.published).length,
    total: state.researchRegistry.filter(r => r.category === cat).length,
  }))
  const maxCat = Math.max(...categories.map(c => c.count), 1)

  const livePerf = useMemo(() => {
    const lastPsi = historyEntries.find(e => e.type === 'psi' && e.lighthouseScores != null)
    const scores  = lastPsi?.lighthouseScores ?? STATIC_PERF
    return scores.map(s => ({ label: s.label, score: s.score, target: PERF_TARGETS[s.label] ?? 90 }))
  }, [historyEntries])

  const lastPsiEntry = historyEntries.find(e => e.type === 'psi' && e.lighthouseScores != null)

  const perfSparklines = useMemo(() => {
    return ['Performance', 'Accessibility', 'SEO', 'PWA'].map(label => {
      const trend = historyEntries
        .filter(e => e.lighthouseScores != null)
        .map(e => e.lighthouseScores!.find(s => s.label === label)?.score ?? -1)
        .filter(s => s >= 0)
        .slice(0, 8)
        .reverse()
      const last = trend.length > 0 ? trend[trend.length - 1] : null
      const path = trend.length >= 2 ? buildSparklinePath(trend, 80, 18) : ''
      return { label, trend, last, path }
    })
  }, [historyEntries])

  return (
    <div className={card}>
      <div className={cardHeader}>
        <span className={cardTitle}>Content Index</span>
        <span className={cardBadge}>{publishedArticles} published</span>
      </div>

      {/* Pipeline */}
      <div className={pipelineRow}>
        {[
          { val: draftArticles,     lbl: 'Draft'       },
          null,
          { val: publishedArticles, lbl: 'Published'   },
          null,
          { val: featuredArticles,  lbl: 'Featured'    },
          'divider' as const,
          { val: wipLabs,           lbl: 'Labs R&D'    },
          null,
          { val: betaLabs,          lbl: 'Beta'        },
          null,
          { val: liveLabs,          lbl: 'Live'        },
        ].map((item, i) =>
          item === 'divider' ? (
            <div key={i} className={pipelineDiv} />
          ) : item === null ? (
            <span key={i} className={pipelineArr}>›</span>
          ) : (
            <div key={i} className={pipelineStep}>
              <div className={pipelineVal}>{item.val}</div>
              <div className={pipelineLbl}>{item.lbl}</div>
            </div>
          )
        )}
      </div>

      {/* Category breakdown */}
      <div>
        {categories.map(({ cat, count, total }) => (
          <div key={cat} className={contentRow}>
            <span className={contentDot(CATEGORY_COLORS[cat] ?? 'bg-white/20')} />
            <span className={contentLabel}>{cat}</span>
            <div className={contentBar}>
              <div className="h-full rounded-full bg-white/20" style={{ width: `${(count / maxCat) * 100}%` }} />
            </div>
            <span className={contentCount}>{count}/{total}</span>
          </div>
        ))}
        <div className={contentRow}>
          <span className={contentDot('bg-violet-400')} />
          <span className={contentLabel}>Featured</span>
          <div className={contentBar}>
            <div className="h-full rounded-full bg-white/20" style={{ width: `${(featuredArticles / Math.max(publishedArticles, 1)) * 100}%` }} />
          </div>
          <span className={contentCount}>{featuredArticles}</span>
        </div>
      </div>

      {/* Lighthouse */}
      <div className="mt-2 border-t border-white/8">
        <div className="px-4 pt-2 pb-1 font-mono text-[8px] uppercase tracking-[0.18em] text-white/22">
          Lighthouse · Last build
        </div>
        {livePerf.map(m => (
          <div key={m.label} className={perfRow}>
            <span className={perfLbl}>{m.label}</span>
            <div className={perfBarWrap}>
              <div className={perfBarFill(m.score)} style={{ width: `${m.score}%` }} />
            </div>
            <span className={perfScore(m.score)}>{m.score}</span>
            <span className={perfTarget}>/{m.target}</span>
          </div>
        ))}
        {lastPsiEntry && (
          <div className={perfEmpty} style={{ paddingTop: 4, paddingBottom: 2 }}>
            PSI · {lastPsiEntry.strategy ?? 'mobile'} · {lastPsiEntry.url ?? 'no URL'} · {lastPsiEntry.timestamp.split('T')[0]}
          </div>
        )}
      </div>

      {/* Sparklines */}
      <div className="mt-2 border-t border-white/8">
        <div className="px-4 pt-2 pb-0.5 font-mono text-[8px] uppercase tracking-[0.18em] text-white/22">
          Score History · {historyEntries.length > 0 ? `${historyEntries.length} run${historyEntries.length !== 1 ? 's' : ''}` : 'run Analytics panel to populate'}
        </div>
        {perfSparklines.some(p => p.trend.length >= 2) ? (
          perfSparklines.filter(p => p.trend.length >= 2).map(({ label, last, path }) => (
            <div key={label} className={perfHistRow}>
              <span className={perfHistLbl}>{label}</span>
              <div className="flex-1">
                <svg viewBox="0 0 80 18" className={perfHistSvg} preserveAspectRatio="none" style={{ height: 18 }}>
                  <path d={path} className={perfHistPath(last != null && last >= 85)} strokeWidth={1.5} />
                </svg>
              </div>
              {last != null && <span className={perfHistVal(last >= 85)}>{last}</span>}
            </div>
          ))
        ) : (
          <div className={perfEmpty}>No history yet — run an audit in Analytics</div>
        )}
      </div>

      <div className="flex items-center justify-end border-t border-white/6 px-4 py-1.5">
        <button onClick={() => dispatch({ type: 'SET_PANEL', payload: 'analytics' })} className={editLink}>
          Full audit →
        </button>
      </div>
    </div>
  )
}

// ─── Combined 3-column export ─────────────────────────────────────────────────

export function InfraAiContentCards() {
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      <InfrastructureCard />
      <AiEcosystemCard />
      <ContentIndexCard />
    </div>
  )
}
