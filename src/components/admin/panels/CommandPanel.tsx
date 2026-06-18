'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import { AlertTriangle, Layers, TrendingUp, Zap } from 'lucide-react'
import { useAdmin } from '@/lib/admin/store'
import type { AdminPanel } from '@/lib/admin/types'
import PagesDashboard from './PagesDashboard'
import {
  collectNavigationMetrics, observeWebVitals, observeLongTasks, sampleHeap,
  rateVital,
  type NavigationMetrics, type LongTaskSummary,
} from '@/lib/analytics/live-metrics'
import { errorCollector, type RuntimeError } from '@/lib/analytics/error-collector'
import { evaluateAlerts, alertsCount, type Alert } from '@/lib/analytics/alerts'
import { getBundleSummary, type BundleSummary } from '@/lib/analytics/bundle-inspector'
import {
  installSessionMetrics, getSessionMetrics, subscribeSessionMetrics,
  type SessionMetrics,
} from '@/lib/analytics/session-metrics'
import { runDOMSEOAudit, runDOMA11yAudit } from '@/lib/analytics/dom-audit'

// Sub-components
import { LiveAuditSection }     from './command/LiveAuditSection'
import { InfraAiContentCards }  from './command/InfraAiContentCards'
import { DeploymentsSiteRow }   from './command/DeploymentsSiteRow'
import { DesignSeoCards }       from './command/DesignSeoCards'
import { RegistryCards }        from './command/RegistryCards'
import { SkillsStackCards }     from './command/SkillsStackCards'
import { VitalsStrip }          from './command/VitalsStrip'
import { HealthScoreCard }      from './command/HealthScoreCard'
import { FeedsSessionRow }      from './command/FeedsSessionRow'
import { ProductionReadiness }  from './command/ProductionReadiness'
import { SignalBar }            from './command/SignalBar'
import { AlertsSection }        from './command/AlertsSection'
import { PendingBoard }         from './command/PendingBoard'
import { PanelStatusMap }       from './command/PanelStatusMap'

// Pure utils
import {
  NAV_ENTRIES, type NavEntry,
  deriveActivity, type ActivityItem,
  AUDIT_PANEL_MAP,
  buildAudit, buildProductionReadiness,
} from './command/utils'

// ─── Session event log ────────────────────────────────────────────────────────

interface SessionEvent {
  time:     string
  msg:      string
  severity: 'ok' | 'info' | 'warn' | 'error'
}

// ─── Inline style helpers ─────────────────────────────────────────────────────

const s = {
  root:          'space-y-5',
  headerLabel:   'mb-1 font-mono text-[9px] uppercase tracking-[0.24em] text-violet-400/60',
  headerTitle:   'text-xl font-semibold tracking-tight text-white/90',
  headerMeta:    'mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-white/25',
  healthStrip:   'flex items-center gap-2 mt-2.5',
  healthDot:     (ok: boolean) => `h-1.5 w-1.5 rounded-full ${ok ? 'bg-emerald-400' : 'bg-red-400 animate-pulse'}`,
  healthLabel:   'font-mono text-[9px] uppercase tracking-[0.14em] text-white/35',
  healthDiv:     'h-3 w-px bg-white/10',
  unsavedChip:   'ml-auto inline-flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/8 px-2 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-amber-400',
  unsavedDot:    'h-1 w-1 rounded-full bg-amber-400 animate-pulse',
  savedChip:     'ml-auto inline-flex items-center gap-1 rounded-full border border-white/8 px-2 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-white/22',
  quickRow:      'flex flex-wrap gap-1.5',
  quickBtn:      (_a: string) => 'inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.025] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-white/40 transition-all hover:border-white/20 hover:text-white/70 hover:bg-white/[0.04]',
  quickBtnDot:   'h-1.5 w-1.5 shrink-0 rounded-full',
  kpiGrid:       'grid grid-cols-3 gap-3 lg:grid-cols-4',
  kpiCard:       'relative overflow-hidden rounded-xl border border-white/8 bg-white/[0.025] px-4 pt-3 pb-3',
  kpiValue:      'text-[28px] font-semibold tabular-nums leading-none',
  kpiLabel:      'mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/25',
  kpiSub:        'mt-0.5 font-mono text-[8px] text-white/20',
  kpiGlow:       'pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full blur-xl opacity-20',
  kpiTrend:      (up: boolean | null) => `mt-1 inline-flex items-center gap-0.5 font-mono text-[8px] ${up === true ? 'text-emerald-400' : up === false ? 'text-red-400' : 'text-white/20'}`,
  twoCol:        'grid gap-4 lg:grid-cols-[1fr_1fr]',
  card:          'overflow-hidden rounded-xl border border-white/8 bg-white/[0.02]',
  cardHeader:    'flex items-center justify-between border-b border-white/8 px-4 py-2.5',
  cardTitle:     'font-mono text-[10px] uppercase tracking-[0.2em] text-white/35',
  cardBadge:     'font-mono text-[9px] text-white/20',
  activityList:  'divide-y divide-white/5',
  activityItem:  'flex items-start gap-3 px-4 py-2.5',
  activityIcon:  (severity: string) => {
    const m: Record<string, string> = { success: 'bg-emerald-400/10 text-emerald-400', info: 'bg-sky-400/10 text-sky-400', warning: 'bg-amber-400/10 text-amber-400', error: 'bg-red-400/10 text-red-400' }
    return `mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${m[severity] ?? m.info}`
  },
  activityMeta:  'flex-1 min-w-0',
  activityMsg:   'font-mono text-[10.5px] text-white/60 leading-snug',
  activitySub:   'font-mono text-[9px] text-white/25',
  activityTime:  'shrink-0 font-mono text-[8.5px] text-white/20',
  navGrid:       'grid grid-cols-2 gap-1.5 p-3',
  navBtn:        (_a: string) => 'group relative flex flex-col gap-0.5 overflow-hidden rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2.5 text-left transition-all hover:border-white/15 hover:bg-white/[0.04]',
  navBtnAccent:  'font-mono text-[9.5px] uppercase tracking-[0.1em] transition-colors',
  navBtnDesc:    'font-mono text-[8px] text-white/22 leading-snug',
  pagesSection:  'overflow-hidden rounded-xl border border-pink-400/10 bg-white/[0.015]',
  pagesSectionHdr: 'flex items-center gap-2 border-b border-white/6 px-4 py-2.5',
  pagesSectionTitle: 'flex-1 font-mono text-[9.5px] uppercase tracking-[0.18em] text-pink-400/60',
  fourCol:       'grid gap-3 lg:grid-cols-4',
  miniStat:      'flex flex-col items-center justify-center rounded-xl border border-white/8 bg-white/[0.02] py-3 gap-0.5',
  miniStatVal:   'font-mono text-[16px] font-bold text-white/75 tabular-nums',
  miniStatLbl:   'font-mono text-[7.5px] uppercase tracking-widest text-white/22',
  visSec:        'overflow-hidden rounded-xl border border-white/8 bg-white/[0.02]',
  visHdr:        'flex items-center gap-2 border-b border-white/8 px-4 py-2.5',
  visTitle:      'flex-1 font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/30',
  visBadge:      'font-mono text-[9px] text-white/22',
  visGrid:       'grid grid-cols-3 gap-px bg-white/4 sm:grid-cols-5',
  visItem:       (on: boolean) => `flex items-center gap-2 bg-black/30 px-3 py-2.5 transition-all hover:bg-white/[0.03] ${on ? '' : 'opacity-40'}`,
  visDot:        (on: boolean) => `h-1.5 w-1.5 shrink-0 rounded-full ${on ? 'bg-emerald-400' : 'bg-white/20'}`,
  visLabel:      'font-mono text-[9px] text-white/55 truncate',
  editLink:      'font-mono text-[8.5px] text-white/25 hover:text-white/55 transition-colors',
}

const VITAL_NAMES = ['LCP', 'FCP', 'CLS', 'INP', 'TTFB'] as const

// ─── Component ────────────────────────────────────────────────────────────────

export default function CommandPanel() {
  const { state, dispatch } = useAdmin()

  const [liveVitals,    setLiveVitals]    = useState<Record<string, number>>({})
  const [navMetrics,    setNavMetrics]    = useState<NavigationMetrics | null>(null)
  const [runtimeErrors, setRuntimeErrors] = useState<RuntimeError[]>([])
  const [longTasks,     setLongTasks]     = useState<LongTaskSummary>({ tasks: [], sessionTasks: [], pageLoadTasks: [], totalMs: 0, sessionMs: 0, count: 0, sessionCount: 0, longestMs: 0 })
  const [heapSamples,   setHeapSamples]   = useState<number[]>([])
  const [activeAlerts,  setActiveAlerts]  = useState<Alert[]>([])
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null)
  const [mounted,       setMounted]       = useState(false)
  const [sessionEvents, setSessionEvents] = useState<SessionEvent[]>([])
  const [sessionMetrics,setSessionMetrics]= useState<SessionMetrics | null>(null)
  const [bundleSummary, setBundleSummary] = useState<BundleSummary | null>(null)
  const [domSeoPass,    setDomSeoPass]    = useState<number | null>(null)
  const [domA11yPass,   setDomA11yPass]   = useState<number | null>(null)

  const heapPollRef       = useRef<ReturnType<typeof setInterval> | null>(null)
  const refreshRef        = useRef<ReturnType<typeof setInterval> | null>(null)
  const sessionEventsRef  = useRef<SessionEvent[]>([])
  const prevErrorCountRef = useRef(0)

  useEffect(() => {
    setMounted(true)
    setNavMetrics(collectNavigationMetrics())

    const seoChecks  = runDOMSEOAudit()
    const a11yChecks = runDOMA11yAudit()
    if (seoChecks.length  > 0) setDomSeoPass(seoChecks.filter(c => c.pass).length)
    if (a11yChecks.length > 0) setDomA11yPass(a11yChecks.filter(c => c.pass).length)

    const bundleTimer = setTimeout(() => setBundleSummary(getBundleSummary()), 1_500)

    const uninstallSession = installSessionMetrics()
    setSessionMetrics(getSessionMetrics())
    const unsubSession = subscribeSessionMetrics(() => setSessionMetrics(getSessionMetrics()))

    const unobserveVitals = observeWebVitals((vitals) => {
      setLiveVitals(prev => ({ ...prev, ...vitals }))
    })

    const unobserveLT = observeLongTasks((summary) => {
      setLongTasks(summary)
      if (summary.count > 0 && summary.longestMs >= 200) {
        const evt: SessionEvent = {
          time:     new Date().toLocaleTimeString(),
          msg:      `Long task spike · ${summary.longestMs}ms · ${summary.count} tasks / ${summary.totalMs}ms total`,
          severity: summary.longestMs >= 500 ? 'error' : 'warn',
        }
        sessionEventsRef.current = [evt, ...sessionEventsRef.current].slice(0, 25)
        setSessionEvents([...sessionEventsRef.current])
      }
    })

    errorCollector.install()
    errorCollector.installConsoleCapture()
    const initial = errorCollector.get()
    setRuntimeErrors(initial)
    prevErrorCountRef.current = initial.length
    const unsub = errorCollector.subscribe((errors) => {
      if (errors.length > prevErrorCountRef.current) {
        const added  = errors.length - prevErrorCountRef.current
        const latest = errors[0]
        const evt: SessionEvent = {
          time:     new Date().toLocaleTimeString(),
          msg:      `${added} new error${added > 1 ? 's' : ''}: ${latest?.message.slice(0, 65) ?? 'unknown'}`,
          severity: 'error',
        }
        sessionEventsRef.current = [evt, ...sessionEventsRef.current].slice(0, 25)
        setSessionEvents([...sessionEventsRef.current])
      }
      prevErrorCountRef.current = errors.length
      setRuntimeErrors(errors)
    })

    const heapSample = () => {
      const snap = sampleHeap()
      if (snap != null) setHeapSamples(prev => [...prev.slice(-19), snap.used])
    }
    heapSample()
    heapPollRef.current = setInterval(heapSample, 15_000)

    refreshRef.current = setInterval(() => {
      setNavMetrics(collectNavigationMetrics())
      setLastRefreshed(new Date().toLocaleTimeString())
    }, 30_000)
    setLastRefreshed(new Date().toLocaleTimeString())

    const initEvt: SessionEvent = {
      time:     new Date().toLocaleTimeString(),
      msg:      'Command Center mounted · Web Vitals + long task observers active',
      severity: 'ok',
    }
    sessionEventsRef.current = [initEvt]
    setSessionEvents([initEvt])

    return () => {
      clearTimeout(bundleTimer)
      uninstallSession()
      unsubSession()
      unobserveVitals()
      unobserveLT()
      unsub()
      if (heapPollRef.current) clearInterval(heapPollRef.current)
      if (refreshRef.current)  clearInterval(refreshRef.current)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    const feeds      = state.intelligence?.feeds ?? []
    const connFeeds  = feeds.filter((f: { connected?: boolean }) => f.connected).length
    setActiveAlerts(evaluateAlerts({
      liveVitals,
      navMetrics,
      errors:          runtimeErrors,
      longTaskCount:   longTasks.count,
      longTaskTotalMs: longTasks.totalMs,
      feedTotal:       feeds.length,
      feedConnected:   connFeeds,
    }))
  }, [liveVitals, navMetrics, runtimeErrors, longTasks, state.intelligence, mounted])

  const alertCounts  = alertsCount(activeAlerts)
  const errorCount   = runtimeErrors.length
  const currentHeap  = heapSamples[heapSamples.length - 1] ?? null

  const manualRefresh = useCallback(() => {
    setNavMetrics(collectNavigationMetrics())
    const fresh = errorCollector.get()
    setRuntimeErrors(fresh)
    prevErrorCountRef.current = fresh.length
    const time = new Date().toLocaleTimeString()
    setLastRefreshed(time)
    const evt: SessionEvent = { time, msg: 'Manual refresh — nav metrics + errors reloaded', severity: 'info' }
    sessionEventsRef.current = [evt, ...sessionEventsRef.current].slice(0, 25)
    setSessionEvents([...sessionEventsRef.current])
  }, [])

  const activity = useMemo(() => {
    const stateActivity = deriveActivity(state)
    const liveEvents: ActivityItem[] = []

    const jsErrors = runtimeErrors.filter(e => e.type === 'js')
    if (jsErrors.length > 0) liveEvents.push({
      msg:      `${jsErrors.length} JS error${jsErrors.length > 1 ? 's' : ''} in session`,
      sub:      jsErrors[0].message.slice(0, 80),
      time:     jsErrors[0].timestamp.split('T')[1]?.slice(0, 5) ?? '',
      severity: 'error',
      icon:     AlertTriangle,
    })

    const promiseErrors = runtimeErrors.filter(e => e.type === 'promise')
    if (promiseErrors.length > 0) liveEvents.push({
      msg:      `${promiseErrors.length} unhandled rejection${promiseErrors.length > 1 ? 's' : ''}`,
      sub:      promiseErrors[0].message.slice(0, 80),
      time:     promiseErrors[0].timestamp.split('T')[1]?.slice(0, 5) ?? '',
      severity: 'warning',
      icon:     AlertTriangle,
    })

    const poorVitals = VITAL_NAMES.filter(n => liveVitals[n] != null && rateVital(n, liveVitals[n]) === 'poor')
    if (poorVitals.length > 0) liveEvents.push({
      msg:      `Poor vitals detected: ${poorVitals.join(', ')}`,
      sub:      'PerformanceObserver · live session data',
      time:     '',
      severity: 'warning',
      icon:     Zap,
    })

    if (longTasks.count > 3 || longTasks.totalMs > 500) liveEvents.push({
      msg:      `${longTasks.count} long tasks · ${longTasks.totalMs}ms blocking`,
      sub:      `Longest: ${longTasks.longestMs}ms · main thread jank`,
      time:     '',
      severity: longTasks.totalMs > 600 ? 'error' : 'warning',
      icon:     AlertTriangle,
    })

    return [...liveEvents, ...stateActivity].slice(0, 10)
  }, [state, runtimeErrors, liveVitals, longTasks])

  const auditCategories  = useMemo(() => buildAudit(state, domSeoPass, domA11yPass), [state, domSeoPass, domA11yPass])
  const prodReadiness    = useMemo(() => buildProductionReadiness(state), [state])
  const auditGlobalScore = Math.round(auditCategories.reduce((acc, c) => acc + c.score, 0) / auditCategories.length)
  const auditFailingItems= auditCategories.flatMap(cat =>
    cat.items.filter(item => !item.pass).map(item => ({ ...item, cat: cat.title }))
  )

  const pendingActions = useMemo(() => {
    const prodFails  = prodReadiness.items
      .filter(i => !i.pass)
      .map(i => ({ label: i.label, cat: i.cat, value: '—', panel: (AUDIT_PANEL_MAP[i.label] ?? null) as AdminPanel | null }))
    const auditFails = auditCategories.flatMap(cat =>
      cat.items.filter(item => !item.pass).map(item => ({
        label: item.label,
        cat:   cat.title.split(' ')[0],
        value: item.value,
        panel: (AUDIT_PANEL_MAP[item.label] ?? null) as AdminPanel | null,
      }))
    )
    const seen = new Set<string>()
    return [...prodFails, ...auditFails].filter(item => {
      if (seen.has(item.label)) return false
      seen.add(item.label)
      return true
    })
  }, [prodReadiness, auditCategories])

  const onlineSystems = state.systemsRegistry.filter(s => s.status === 'operational').length
  const runningNodes  = state.infraConfig.nodes.filter(n => n.status === 'running').length
  const _dataSources   = state.integrations?.dataSources?.length ?? 0
  const _indexedSources= state.integrations?.dataSources?.filter(s => s.status === 'ready').length ?? 0

  const publishedProjects = state.projectsRegistry?.filter(p => p.published).length ?? state.labsRegistry.filter(l => l.visible).length
  const liveProjects      = state.projectsRegistry?.filter(p => p.status === 'live').length ?? state.labsRegistry.filter(l => l.status === 'live').length
  const betaProjects      = state.projectsRegistry?.filter(p => p.status === 'beta').length ?? 0
  const featuredProjects  = state.projectsRegistry?.filter(p => p.featured).length ?? 0
  const publishedArticles = state.researchRegistry.filter(r => r.published).length
  const featuredArticles  = state.researchRegistry.filter(r => r.featured).length
  const totalMCPTools     = state.runtime.mcpTools
  const mcpServers        = state.capabilities?.mcpServers?.filter(s => s.enabled).length ?? 0
  const aiProfiles        = state.aiConfig?.profiles?.length ?? 0
  const conversations     = state.aiConfig?.conversations?.length ?? 0
  const skills            = state.capabilities?.skills?.filter(s => s.enabled).length ?? 0

  // Toolkit registry counts
  const toolCount     = state.toolRegistry?.length     ?? 0
  const workflowCount = state.workflowRegistry?.length ?? 0
  const promptCount   = state.promptRegistry?.length   ?? 0
  const agentCount    = state.agentRegistry?.length    ?? 0
  const mcpRegCount   = state.mcpRegistry?.length      ?? 0

  return (
    <div className={s.root}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <div className={s.headerLabel}>JootaCee · Portfolio OS</div>
        <h1 className={s.headerTitle}>Command Center</h1>
        <p className={s.headerMeta}>{state.runtime.environment} · {state.runtime.version} · {state.site.url}</p>
        <div className={s.healthStrip}>
          <span className={s.healthDot(!state.site.maintenanceMode)} />
          <span className={s.healthLabel}>{state.site.maintenanceMode ? 'Maintenance' : 'Online'}</span>
          <span className={s.healthDiv} />
          <span className={s.healthDot(onlineSystems === state.systemsRegistry.length)} />
          <span className={s.healthLabel}>{onlineSystems}/{state.systemsRegistry.length} Systems</span>
          <span className={s.healthDiv} />
          <span className={s.healthDot(runningNodes === state.infraConfig.nodes.length)} />
          <span className={s.healthLabel}>{runningNodes}/{state.infraConfig.nodes.length} Nodes</span>
          <span className={s.healthDiv} />
          <span className={s.healthDot(errorCount === 0)} />
          <span className={s.healthLabel}>{errorCount === 0 ? '0 Errors' : `${errorCount} Errors`}</span>
          {alertCounts.critical > 0 && (
            <>
              <span className={s.healthDiv} />
              <span className="font-mono text-[8.5px] text-red-400/80 animate-pulse">
                {alertCounts.critical} critical alert{alertCounts.critical > 1 ? 's' : ''}
              </span>
            </>
          )}
          {state.unsaved
            ? <span className={s.unsavedChip}><span className={s.unsavedDot} />Unsaved</span>
            : <span className={s.savedChip}>Saved {state.lastSaved?.split('T')[1]?.slice(0, 5) ?? '--'}</span>
          }
        </div>

        <div className={s.quickRow} style={{ marginTop: '10px' }}>
          {([
            { label: 'Projects',     panel: 'projects'     as const, color: '#a78bfa' },
            { label: 'Research',     panel: 'research'     as const, color: '#34d399' },
            { label: 'GitHub',       panel: 'github'       as const, color: '#e2e8f0' },
            { label: 'SEO',          panel: 'seo'          as const, color: '#60a5fa' },
            { label: 'Design',       panel: 'design'       as const, color: '#818cf8' },
            { label: 'Integrations', panel: 'integrations' as const, color: '#fb923c' },
            { label: 'Analytics',    panel: 'analytics'    as const, color: '#f43f5e' },
            { label: 'AI',           panel: 'ai'           as const, color: '#c084fc' },
          ]).map(({ label, panel, color }) => (
            <button key={label} onClick={() => dispatch({ type: 'SET_PANEL', payload: panel })} className={s.quickBtn(color)}>
              <span className={s.quickBtnDot} style={{ background: color }} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Pages Overview ─────────────────────────────────────────────────── */}
      <div className={s.pagesSection}>
        <div className={s.pagesSectionHdr}>
          <Layers className="h-3 w-3 text-pink-400/60" />
          <span className={s.pagesSectionTitle}>Pages Overview</span>
          <button onClick={() => dispatch({ type: 'SET_PANEL', payload: 'pages' })} className={s.editLink}>
            Open Pages →
          </button>
        </div>
        <PagesDashboard onNavigate={(tab) => {
          dispatch({ type: 'SET_PAGES_TAB', payload: tab })
          dispatch({ type: 'SET_PANEL', payload: 'pages' })
        }} />
      </div>

      {/* ── Live Signal Bar (extracted) ────────────────────────────────────── */}
      <SignalBar
        liveVitals={liveVitals}
        longTasks={longTasks}
        errorCount={errorCount}
        lastRefreshed={lastRefreshed}
        currentHeap={currentHeap}
        activeAlerts={activeAlerts}
        alertCounts={alertCounts}
        sessionMetrics={sessionMetrics}
        bundleSummary={bundleSummary}
        onRefresh={manualRefresh}
      />

      {/* ── Active Alerts (extracted) ───────────────────────────────────────── */}
      <AlertsSection activeAlerts={activeAlerts} alertCounts={alertCounts} />

      {/* ── Pending Actions Board (extracted) ─────────────────────────────── */}
      <PendingBoard pendingActions={pendingActions} />

      {/* ── Panel Status Map (extracted) ──────────────────────────────────── */}
      <PanelStatusMap />

      {/* ── KPI Grid ───────────────────────────────────────────────────────── */}
      <div className={s.kpiGrid}>
        {[
          { value: publishedProjects,                    label: 'Projects',    sub: `${liveProjects} live · ${betaProjects} beta · ${featuredProjects} featured`,                                                              color: '#a78bfa', trend: null },
          { value: publishedArticles,                    label: 'Articles',    sub: `${featuredArticles} featured`,                                                                                                            color: '#34d399', trend: null },
          { value: onlineSystems,                        label: 'Systems',     sub: `${state.systemsRegistry.length} total · ${runningNodes} nodes up`,                                                                       color: '#38bdf8', trend: onlineSystems === state.systemsRegistry.length },
          { value: totalMCPTools,                        label: 'MCP Tools',   sub: `${mcpServers} servers · ${mcpRegCount} registered`,                                                                                      color: '#a78bfa', trend: null },
          { value: aiProfiles,                           label: 'AI Profiles', sub: `${conversations} conversations · ${skills} skills`,                                                                                      color: '#06b6d4', trend: null },
          { value: toolCount + workflowCount + promptCount + agentCount, label: 'Toolkit',  sub: `${toolCount} tools · ${workflowCount} flows · ${promptCount} prompts · ${agentCount} agents`,                             color: '#818cf8', trend: null },
          { value: errorCount,                           label: 'Live Errors', sub: errorCount === 0 ? 'session clean' : `${runtimeErrors.filter(e => e.type === 'js').length} JS · ${runtimeErrors.filter(e => e.type === 'promise').length} promise`, color: errorCount === 0 ? '#34d399' : '#f87171', trend: errorCount === 0 },
          { value: activeAlerts.length,                  label: 'Alerts',      sub: activeAlerts.length === 0 ? 'all thresholds clear' : `${alertCounts.critical} critical · ${alertCounts.warning} warn`,                  color: activeAlerts.length === 0 ? '#34d399' : alertCounts.critical > 0 ? '#f87171' : '#fbbf24', trend: activeAlerts.length === 0 },
        ].map(kpi => (
          <div key={kpi.label} className={s.kpiCard}>
            <div className={s.kpiGlow} style={{ background: kpi.color }} />
            <div className={s.kpiValue} style={{ color: kpi.color }}>{kpi.value}</div>
            <div className={s.kpiLabel}>{kpi.label}</div>
            <div className={s.kpiSub}>{kpi.sub}</div>
            {kpi.trend !== null && (
              <div className={s.kpiTrend(kpi.trend)}>
                <TrendingUp className="h-2.5 w-2.5" />
                {kpi.trend ? 'All healthy' : 'Degraded'}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Live Web Vitals (extracted) ────────────────────────────────────── */}
      <VitalsStrip
        liveVitals={liveVitals}
        navMetrics={navMetrics}
        longTasks={longTasks}
        errorCount={errorCount}
      />

      {/* ── Activity Feed + Quick Nav ──────────────────────────────────────── */}
      <div className={s.twoCol}>
        <div className={s.card}>
          <div className={s.cardHeader}>
            <span className={s.cardTitle}>Activity Feed</span>
            <span className={s.cardBadge}>{activity.length} events</span>
          </div>
          <div className={s.activityList}>
            {activity.map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className={s.activityItem}>
                  <div className={s.activityIcon(item.severity)}><Icon className="h-3 w-3" /></div>
                  <div className={s.activityMeta}>
                    <div className={s.activityMsg}>{item.msg}</div>
                    {item.sub && <div className={s.activitySub}>{item.sub}</div>}
                  </div>
                  {item.time && <span className={s.activityTime}>{item.time}</span>}
                </div>
              )
            })}
          </div>
        </div>

        <div className={s.card}>
          <div className={s.cardHeader}>
            <span className={s.cardTitle}>Gestionar paneles</span>
            <span className={s.cardBadge}>{NAV_ENTRIES.length} módulos</span>
          </div>
          <div className={s.navGrid}>
            {NAV_ENTRIES.map((entry: NavEntry) => {
              const Icon = entry.icon
              return (
                <button key={entry.id} onClick={() => dispatch({ type: 'SET_PANEL', payload: entry.id })} className={s.navBtn(entry.accent)}>
                  <span className={s.navBtnAccent} style={{ color: entry.accent }}>
                    <Icon className="mb-0.5 inline-block h-3 w-3 mr-1 opacity-80" />
                    {entry.label}
                  </span>
                  <span className={s.navBtnDesc}>{entry.desc}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Infrastructure + AI + Content (extracted) ─────────────────────── */}
      <InfraAiContentCards />

      {/* ── Intelligence Feeds + Session Timeline (extracted) ────────────── */}
      <FeedsSessionRow
        sessionEvents={sessionEvents}
        onClearSession={() => { sessionEventsRef.current = []; setSessionEvents([]) }}
      />

      {/* ── Deployments + Site Config + Integrations (extracted) ──────────── */}
      <DeploymentsSiteRow />

      {/* ── Projects + Systems Registry (extracted) ───────────────────────── */}
      <RegistryCards />

      {/* ── Design & Brand + SEO Health (extracted) ───────────────────────── */}
      <DesignSeoCards />

      {/* ── Production Readiness (extracted) ─────────────────────────────── */}
      <ProductionReadiness readiness={prodReadiness} />

      {/* ── Skills Matrix + Tech Stack (extracted) ─────────────────────────── */}
      <SkillsStackCards />

      {/* ── Mini Stats Row ────────────────────────────────────────────────── */}
      <div className="grid gap-3 grid-cols-4 lg:grid-cols-8">
        {[
          { value: state.runtime.activeAgents,                              label: 'Agents',    color: '#06b6d4' },
          { value: state.runtime.mcpTools,                                  label: 'MCP Tools', color: '#a78bfa' },
          { value: state.runtime.systemsOnline,                             label: 'Online',    color: '#34d399' },
          { value: state.personality.effects.filter(e => e.enabled).length, label: 'Effects',   color: '#f472b6' },
          { value: toolCount,                                               label: 'Tools',     color: '#38bdf8' },
          { value: workflowCount,                                           label: 'Workflows', color: '#818cf8' },
          { value: promptCount,                                             label: 'Prompts',   color: '#f59e0b' },
          { value: agentCount + mcpRegCount,                               label: 'Registry',  color: '#c084fc' },
        ].map(m => (
          <div key={m.label} className={s.miniStat}>
            <div className={s.miniStatVal} style={{ color: m.color }}>{m.value}</div>
            <div className={s.miniStatLbl}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* ── Section Visibility Matrix ─────────────────────────────────────── */}
      <div className={s.visSec}>
        <div className={s.visHdr}>
          <Layers className="h-2.5 w-2.5 text-white/30" />
          <span className={s.visTitle}>Section Visibility Matrix</span>
          <span className={s.visBadge}>{state.blocks.filter(b => b.enabled).length}/{state.blocks.length} active</span>
        </div>
        <div className={s.visGrid}>
          {state.blocks.map(block => (
            <button key={block.id} onClick={() => dispatch({ type: 'SET_PANEL', payload: 'blocks' })} className={s.visItem(block.enabled)}>
              <span className={s.visDot(block.enabled)} />
              <span className={s.visLabel}>{block.label}</span>
            </button>
          ))}
          {state.blocks.length === 0 && (
            <div className="col-span-5 px-4 py-4 font-mono text-[9px] text-white/20">
              No blocks configured — open Blocks panel
            </div>
          )}
        </div>
      </div>

      {/* ── Program Health Card (extracted) ───────────────────────────────── */}
      <HealthScoreCard
        categories={auditCategories}
        globalScore={auditGlobalScore}
        failingItems={auditFailingItems}
      />

      {/* ── Live Audit (extracted) ─────────────────────────────────────────── */}
      <LiveAuditSection categories={auditCategories} />

    </div>
  )
}
