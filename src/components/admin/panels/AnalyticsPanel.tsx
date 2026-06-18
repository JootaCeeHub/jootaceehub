'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useMemo, useEffect, useCallback, useRef, useDeferredValue } from 'react'
import {
  BarChart3, Gauge, Zap, Search, Shield, Layers, Code2,
  AlertTriangle, Copy, CheckCircle2, Package, Play, Loader2, Radio, Sparkles, Clock, Construction, Rocket, Hammer, GitBranch,
} from 'lucide-react'
import { useAdmin } from '@/lib/admin/store'


// ─── Analytics sub-modules ────────────────────────────────────────────────────
import type { Tab, ChangeEntry } from './analytics/types'
import { STATIC_LIGHTHOUSE } from './analytics/constants'
import {
  loadPSICache, savePSICache, markPSIAttempt, isPSIOnCooldown,
  loadLastGoodPSI, isPublicUrl, psiLandingUrl, parsePSIAuditMs, staleLabel,
  mark429, get429RetryMs, clear429,
} from './analytics/psi-cache'
import {
  buildSeoAudit, buildA11yAudit, buildProductionReadiness, buildProgramHealth,
  buildTestsAudit, buildDocsAudit, buildArchAudit,
} from './analytics/audit-builders'

// ─── Tab components ───────────────────────────────────────────────────────────
import { OverviewTab }     from './analytics/tabs/OverviewTab'
import { PerformanceTab }  from './analytics/tabs/PerformanceTab'
import { SEOTab }          from './analytics/tabs/SEOTab'
import { AccessibilityTab } from './analytics/tabs/AccessibilityTab'
import { BundleTab }       from './analytics/tabs/BundleTab'
import { TrackingTab }     from './analytics/tabs/TrackingTab'
import { ProgramTab }      from './analytics/tabs/ProgramTab'
import { ErrorsTab }       from './analytics/tabs/ErrorsTab'
import { HistoryTab }      from './analytics/tabs/HistoryTab'
import { InsightsTab }     from './analytics/tabs/InsightsTab'
import { ProjectTab }      from './analytics/tabs/ProjectTab'
import { Phase2Tab }      from './analytics/tabs/Phase2Tab'
import { Phase3Tab }      from './analytics/tabs/Phase3Tab'
import { Phase4Tab }      from './analytics/tabs/Phase4Tab'
import { Phase5Tab }          from './analytics/tabs/Phase5Tab'
import { StabilizationTab }  from './analytics/tabs/StabilizationTab'
import { Phase2CmsTab }      from './analytics/tabs/Phase2CmsTab'

// ─── Analytics lib ────────────────────────────────────────────────────────────
import {
  collectNavigationMetrics, observeWebVitals, observeLongTasks, sampleHeap,
  type NavigationMetrics, type LongTaskSummary,
} from '@/lib/analytics/live-metrics'
import { fetchPageSpeedInsights, type PSIResult } from '@/lib/analytics/pagespeed'
import { runDOMSEOAudit, runDOMA11yAudit, runConfigSEOAudit, runPerformanceHintsAudit, runSecurityAudit, type DOMCheck } from '@/lib/analytics/dom-audit'
import { errorCollector, type RuntimeError } from '@/lib/analytics/error-collector'
import { getResourceSummary, collectNetworkFailures, type ResourceSummary } from '@/lib/analytics/resource-timing'
import { evaluateAlerts, alertsCount, type Alert } from '@/lib/analytics/alerts'
import {
  saveSnapshot, getHistory, computeHistoryStats,
  type AnalysisSnapshot, type HistoryStats,
} from '@/lib/analytics/history'
import { inspectBundles, getBundleSummary, type LiveBundleGroup, type BundleSummary } from '@/lib/analytics/bundle-inspector'
import {
  installSessionMetrics, getSessionMetrics, subscribeSessionMetrics,
  type SessionMetrics,
} from '@/lib/analytics/session-metrics'
import { computeAIAnalysis } from '@/lib/analytics/scoring'
import { runHTMLQualityAudit, runPWAAudit, runSecuritySurfaceAudit, runRuntimeDXAudit, runStructuredDataAudit, runPerformanceDeepAudit, type ProjectCheck } from '@/lib/analytics/project-audit'
import { AnalysisProgress, INITIAL_STEPS, type RunStep } from './analytics/AnalysisProgress'

export default function AnalyticsPanel() {
  const { state, dispatch } = useAdmin()

  const [activeTab,       setActiveTab]       = useState<Tab>('overview')
  const [running,         setRunning]         = useState(false)
  const [copied,          setCopied]          = useState(false)
  const [liveVitals,      setLiveVitals]      = useState<Record<string, number>>({})
  const [navMetrics,      setNavMetrics]      = useState<NavigationMetrics | null>(null)
  const [domSeoChecks,    setDomSeoChecks]    = useState<ReturnType<typeof runDOMSEOAudit>>([])
  const [domA11yChecks,   setDomA11yChecks]   = useState<ReturnType<typeof runDOMA11yAudit>>([])
  const [runtimeErrors,   setRuntimeErrors]   = useState<RuntimeError[]>([])
  const [lastRefreshed,   setLastRefreshed]   = useState<string | null>(null)
  const [psiResult,       setPsiResult]       = useState<PSIResult | null>(null)
  const [psiLoading,      setPsiLoading]      = useState(false)
  const [psiUrl,          setPsiUrl]          = useState('')
  const [psiStrategy,     setPsiStrategy]     = useState<'mobile' | 'desktop'>('mobile')
  const [psiExpanded,     setPsiExpanded]     = useState(false)
  const [psiCachedAt,     setPsiCachedAt]     = useState<string | null>(null)
  const [autoRefresh,     setAutoRefresh]     = useState(false)
  const [refreshInterval, setRefreshInterval] = useState(60)
  const [changeLog,       setChangeLog]       = useState<ChangeEntry[]>([])
  const [longTasks,       setLongTasks]       = useState<LongTaskSummary>({ tasks: [], sessionTasks: [], pageLoadTasks: [], totalMs: 0, sessionMs: 0, count: 0, sessionCount: 0, longestMs: 0 })
  const [resourceSummary,   setResourceSummary]   = useState<ResourceSummary | null>(null)
  const [perfHints,         setPerfHints]         = useState<DOMCheck[]>([])
  const [securityChecks,    setSecurityChecks]    = useState<DOMCheck[]>([])
  const [activeAlerts,    setActiveAlerts]    = useState<Alert[]>([])
  const [historyEntries,  setHistoryEntries]  = useState<AnalysisSnapshot[]>([])
  const [historyStats,    setHistoryStats]    = useState<HistoryStats | null>(null)
  const [heapSamples,     setHeapSamples]     = useState<number[]>([])
  const [networkFails,    setNetworkFails]    = useState<{ url: string; status: number; ts: string }[]>([])
  const [liveBundles,     setLiveBundles]     = useState<LiveBundleGroup[]>([])
  const [bundleSummary,   setBundleSummary]   = useState<BundleSummary | null>(null)
  const [sessionMetrics,  setSessionMetrics]  = useState<SessionMetrics | null>(null)
  const [htmlChecks,      setHtmlChecks]      = useState<ProjectCheck[]>([])
  const [pwaChecks,       setPwaChecks]       = useState<ProjectCheck[]>([])
  const [secChecks,       setSecChecks]       = useState<ProjectCheck[]>([])
  const [dxChecks,        setDxChecks]        = useState<ProjectCheck[]>([])
  const [schemaChecks,    setSchemaChecks]    = useState<ProjectCheck[]>([])
  const [perfDeepChecks,  setPerfDeepChecks]  = useState<ProjectCheck[]>([])

  const psiAutoFetchedRef  = useRef(false)
  const prevSnapshotRef    = useRef<string>('')
  const heapPollRef        = useRef<ReturnType<typeof setInterval> | null>(null)
  const stepsRef           = useRef<RunStep[]>(INITIAL_STEPS.map((s) => ({ ...s })))
  const elapsedTimerRef    = useRef<ReturnType<typeof setInterval> | null>(null)
  const analysisStartRef   = useRef(0)

  const [runSteps,     setRunSteps]     = useState<RunStep[]>(INITIAL_STEPS)
  const [showProgress, setShowProgress] = useState(false)
  const [elapsed,      setElapsed]      = useState(0)
  const [psiRetryAt,   setPsiRetryAt]   = useState(() => get429RetryMs() > 0 ? Date.now() + get429RetryMs() : 0)
  const [psiCountdown, setPsiCountdown] = useState(0)

  const gaId = state.site.trackingId ?? ''

  useEffect(() => {
    setNavMetrics(collectNavigationMetrics())
    const initialSeo  = runDOMSEOAudit()
    const initialA11y = runDOMA11yAudit()
    if (initialSeo.length  > 0) setDomSeoChecks(initialSeo)
    if (initialA11y.length > 0) setDomA11yChecks(initialA11y)
    setPerfHints(runPerformanceHintsAudit())
    setSecurityChecks(runSecurityAudit())
    setHtmlChecks(runHTMLQualityAudit())
    setPwaChecks(runPWAAudit())
    setSecChecks(runSecuritySurfaceAudit())
    setDxChecks(runRuntimeDXAudit())
    setSchemaChecks(runStructuredDataAudit())
    setPerfDeepChecks(runPerformanceDeepAudit())
    setLastRefreshed(new Date().toLocaleTimeString())

    const canonicalUrl = state.seo.canonicalBase
    if (canonicalUrl) {
      const landingUrl = psiLandingUrl(canonicalUrl)
      setPsiUrl(landingUrl)

      // ── Tier 1: fresh cache (< 6h) ──────────────────────────────────────
      const cached = loadPSICache()
      if (cached) {
        setPsiResult({ ...cached.result, _source: 'cache' })
        setPsiCachedAt(`cached · ${staleLabel(cached.savedAt)}`)
      } else {
        // ── Tier 2: build-time lighthouse.json ──────────────────────────
        fetch('/data/lighthouse.json', { cache: 'no-store' })
          .then((r) => (r.ok ? r.json() : null))
          .then((json: { mobile?: PSIResult; generatedAt?: string } | null) => {
            if (json?.mobile?.scores?.length) {
              const age = json.generatedAt ? staleLabel(new Date(json.generatedAt).getTime()) : ''
              setPsiResult({ ...json.mobile, _source: 'build' })
              setPsiCachedAt(`build · ${age}`)
            } else {
              // ── Tier 3: last-known-good (any age, real data) ───────────
              const lastGood = loadLastGoodPSI()
              if (lastGood) {
                setPsiResult({ ...lastGood.result, _source: 'stale' })
                setPsiCachedAt(`stale · ${staleLabel(lastGood.savedAt)}`)
              }
            }
          })
          .catch(() => {
            const lastGood = loadLastGoodPSI()
            if (lastGood) {
              setPsiResult({ ...lastGood.result, _source: 'stale' })
              setPsiCachedAt(`stale · ${staleLabel(lastGood.savedAt)}`)
            }
          })

        // ── Auto-fetch live if public URL and not on cooldown ────────────
        if (isPublicUrl(landingUrl) && !psiAutoFetchedRef.current && !isPSIOnCooldown()) {
          psiAutoFetchedRef.current = true
          markPSIAttempt()
          setPsiLoading(true)
          fetchPageSpeedInsights(landingUrl, 'mobile').then((result) => {
            setPsiLoading(false)
            if (!result.error) {
              const liveResult = { ...result, _source: 'live' as const }
              setPsiResult(liveResult)
              savePSICache(liveResult)
              setPsiCachedAt(`live · just now`)
            } else {
              // live fetch failed — keep whatever tier 2/3 already set
              setPsiResult((prev) => prev ?? { ...result, _source: 'stale' as const })
            }
          })
        }
      }
    }

    const bundleTimer = setTimeout(() => {
      setLiveBundles(inspectBundles())
      setBundleSummary(getBundleSummary())
    }, 1_500)

    const uninstallSession = installSessionMetrics()
    setSessionMetrics(getSessionMetrics())
    const unsubSession = subscribeSessionMetrics(() => setSessionMetrics(getSessionMetrics()))
    const unobserve    = observeWebVitals((vitals) => setLiveVitals((prev) => ({ ...prev, ...vitals })))
    const unobserveLT  = observeLongTasks((summary) => setLongTasks(summary))

    errorCollector.install()
    errorCollector.installConsoleCapture()
    setRuntimeErrors(errorCollector.get())
    const unsub = errorCollector.subscribe(setRuntimeErrors)

    setHistoryEntries(getHistory())
    setHistoryStats(computeHistoryStats())

    const heapSample = () => {
      const sample = sampleHeap()
      if (sample != null) setHeapSamples((prev) => [...prev.slice(-29), sample.used])
    }
    heapSample()
    heapPollRef.current = setInterval(heapSample, 10_000)

    return () => {
      clearTimeout(bundleTimer)
      uninstallSession()
      unsubSession()
      unobserve()
      unobserveLT()
      unsub()
      if (heapPollRef.current) clearInterval(heapPollRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!autoRefresh) return
    const id = setInterval(() => {
      setNavMetrics(collectNavigationMetrics())
      setDomSeoChecks(runDOMSEOAudit())
      setDomA11yChecks(runDOMA11yAudit())
      setLastRefreshed(new Date().toLocaleTimeString())
    }, refreshInterval * 1000)
    return () => clearInterval(id)
  }, [autoRefresh, refreshInterval])

  useEffect(() => {
    if (running) {
      analysisStartRef.current = Date.now()
      setElapsed(0)
      elapsedTimerRef.current = setInterval(() => {
        setElapsed(Date.now() - analysisStartRef.current)
      }, 100)
    } else {
      if (elapsedTimerRef.current) { clearInterval(elapsedTimerRef.current); elapsedTimerRef.current = null }
    }
  }, [running])

  // 429 countdown + auto-retry
  useEffect(() => {
    if (psiRetryAt <= 0) { setPsiCountdown(0); return }
    const tick = () => {
      const ms = psiRetryAt - Date.now()
      if (ms <= 0) {
        setPsiRetryAt(0)
        setPsiCountdown(0)
        clear429()
        if (psiUrl.trim() && isPublicUrl(psiUrl.trim())) {
          markPSIAttempt()
          setPsiLoading(true)
          fetchPageSpeedInsights(psiUrl.trim(), psiStrategy).then((raw) => {
            const res = { ...raw, _source: raw.error ? ('stale' as const) : ('live' as const) }
            setPsiResult(res)
            setPsiLoading(false)
            if (!res.error) { savePSICache(res); setPsiCachedAt('live · auto-retry ✓') }
            else if (res.error?.includes('429')) {
              const wait = (res.retryAfterSec ?? 65) * 1000
              mark429(res.retryAfterSec ?? 65)
              setPsiRetryAt(Date.now() + wait)
            }
          })
        }
        return
      }
      setPsiCountdown(Math.ceil(ms / 1000))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [psiRetryAt, psiUrl, psiStrategy])

  const detectChanges = useCallback(() => {
    const snapshot = JSON.stringify({
      feedCount:   state.intelligence.feeds.length,
      seoTitle:    state.seo.defaultTitle,
      navCount:    state.navigation.length,
      systemCount: state.systemsRegistry.length,
      labCount:    state.labsRegistry.length,
      siteMaint:   state.site.maintenanceMode,
      analytics:   state.site.enableAnalytics,
    })
    if (prevSnapshotRef.current && prevSnapshotRef.current !== snapshot) {
      const prev = JSON.parse(prevSnapshotRef.current) as Record<string, unknown>
      const curr = JSON.parse(snapshot) as Record<string, unknown>
      const changes: ChangeEntry[] = []
      const t = new Date().toLocaleTimeString()
      if (prev.feedCount   !== curr.feedCount)   changes.push({ timestamp: t, what: `Intelligence feeds: ${prev.feedCount} → ${curr.feedCount}` })
      if (prev.seoTitle    !== curr.seoTitle)    changes.push({ timestamp: t, what: 'SEO title updated' })
      if (prev.navCount    !== curr.navCount)    changes.push({ timestamp: t, what: `Nav items: ${prev.navCount} → ${curr.navCount}` })
      if (prev.systemCount !== curr.systemCount) changes.push({ timestamp: t, what: `Systems registry: ${prev.systemCount} → ${curr.systemCount}` })
      if (prev.labCount    !== curr.labCount)    changes.push({ timestamp: t, what: `Labs registry: ${prev.labCount} → ${curr.labCount}` })
      if (prev.siteMaint   !== curr.siteMaint)   changes.push({ timestamp: t, what: `Maintenance mode: ${curr.siteMaint ? 'ON' : 'OFF'}` })
      if (prev.analytics   !== curr.analytics)   changes.push({ timestamp: t, what: `Analytics: ${curr.analytics ? 'enabled' : 'disabled'}` })
      if (changes.length > 0) setChangeLog((log) => [...changes, ...log].slice(0, 20))
    }
    prevSnapshotRef.current = snapshot
  }, [state])

  const fetchPSI = useCallback(async () => {
    if (!psiUrl.trim()) return
    clear429()
    setPsiRetryAt(0)
    setPsiCountdown(0)
    markPSIAttempt()
    setPsiLoading(true)
    setPsiExpanded(true)
    const raw = await fetchPageSpeedInsights(psiUrl.trim(), psiStrategy)
    const result = { ...raw, _source: raw.error ? ('stale' as const) : ('live' as const) }
    setPsiResult(result)
    setPsiLoading(false)
    if (!result.error) {
      savePSICache(result)
      setPsiCachedAt('live · just now')
    } else if (result.error?.includes('429')) {
      const secs = result.retryAfterSec ?? 65
      mark429(secs)
      setPsiRetryAt(Date.now() + secs * 1000)
    }
  }, [psiUrl, psiStrategy])

  const runAnalysis = useCallback(async () => {
    // ── Reset + show progress ───────────────────────────────────────────────
    const fresh = INITIAL_STEPS.map((s) => ({ ...s }))
    stepsRef.current = fresh
    setRunSteps([...fresh])
    setShowProgress(true)
    setRunning(true)
    detectChanges()

    // Step helpers — mutate stepsRef and flush to React state
    function go(id: string) {
      const t = performance.now()
      stepsRef.current = stepsRef.current.map((s) => s.id === id ? { ...s, status: 'running' as const } : s)
      setRunSteps([...stepsRef.current])
      return t
    }
    function ok(id: string, t: number, detail?: string) {
      const ms = Math.round(performance.now() - t)
      stepsRef.current = stepsRef.current.map((s) => s.id === id ? { ...s, status: 'done' as const, ms, detail } : s)
      setRunSteps([...stepsRef.current])
    }
    function fail(id: string, detail: string) {
      stepsRef.current = stepsRef.current.map((s) => s.id === id ? { ...s, status: 'error' as const, detail } : s)
      setRunSteps([...stepsRef.current])
    }
    function skip(id: string, detail: string) {
      stepsRef.current = stepsRef.current.map((s) => s.id === id ? { ...s, status: 'skipped' as const, detail } : s)
      setRunSteps([...stepsRef.current])
    }

    // ── 1 · Navigation timing ───────────────────────────────────────────────
    let t = go('nav')
    const freshNav = collectNavigationMetrics()
    setNavMetrics(freshNav)
    ok('nav', t, freshNav.ttfb != null ? `TTFB ${freshNav.ttfb}ms` : 'collected')

    // ── 2 · DOM SEO ─────────────────────────────────────────────────────────
    t = go('dom-seo')
    const freshDomSeo = runDOMSEOAudit()
    setDomSeoChecks(freshDomSeo)
    ok('dom-seo', t, `${freshDomSeo.filter((c) => c.pass).length}/${freshDomSeo.length} passing`)

    // ── 3 · DOM A11y ────────────────────────────────────────────────────────
    t = go('dom-a11y')
    const freshDomA11y = runDOMA11yAudit()
    setDomA11yChecks(freshDomA11y)
    ok('dom-a11y', t, `${freshDomA11y.filter((c) => c.pass).length}/${freshDomA11y.length} passing`)

    // ── 4 · Performance hints ───────────────────────────────────────────────
    t = go('perf-hints')
    const freshPerfHints = runPerformanceHintsAudit()
    setPerfHints(freshPerfHints)
    ok('perf-hints', t, `${freshPerfHints.length} hints detected`)

    // ── 5 · Security surface (DOM) ──────────────────────────────────────────
    t = go('security-dom')
    const freshSecAudit = runSecurityAudit()
    setSecurityChecks(freshSecAudit)
    ok('security-dom', t, `${freshSecAudit.filter((c) => c.pass).length}/${freshSecAudit.length} passing`)

    // ── 6 · Project audits (HTML / PWA / Security / DX / Schema / Perf deep) ─
    t = go('project')
    const freshHtml     = runHTMLQualityAudit()
    const freshPwa      = runPWAAudit()
    const freshSec      = runSecuritySurfaceAudit()
    const freshDx       = runRuntimeDXAudit()
    const freshSchema   = runStructuredDataAudit()
    const freshPerfDeep = runPerformanceDeepAudit()
    setHtmlChecks(freshHtml)
    setPwaChecks(freshPwa)
    setSecChecks(freshSec)
    setDxChecks(freshDx)
    setSchemaChecks(freshSchema)
    setPerfDeepChecks(freshPerfDeep)
    const projAll = [...freshHtml, ...freshPwa, ...freshSec, ...freshDx, ...freshSchema, ...freshPerfDeep]
    ok('project', t, `${projAll.filter((c) => c.pass).length}/${projAll.length} passing`)

    // ── 7 · Resource timing ─────────────────────────────────────────────────
    t = go('resources')
    const freshResources = getResourceSummary()
    const freshNetFails  = collectNetworkFailures()
    setResourceSummary(freshResources)
    setNetworkFails(freshNetFails)
    ok('resources', t, `${freshResources.entries.length} resources · ${freshNetFails.length} failures`)

    // ── 8 · Bundle inspection ───────────────────────────────────────────────
    t = go('bundle')
    const freshBundles       = inspectBundles()
    const freshBundleSummary = getBundleSummary()
    setLiveBundles(freshBundles)
    setBundleSummary(freshBundleSummary)
    ok('bundle', t, freshBundleSummary
      ? `${freshBundleSummary.totalDecodedKB.toFixed(0)}KB decoded · ${freshBundleSummary.scriptCount} scripts`
      : `${freshBundles.length} chunks`)

    // ── 9 · PageSpeed Insights — always fetch on manual run (bypass cooldown)
    // IMPORTANT: on failure, restore the previous good result (build/cache) to avoid
    // showing "NO DATA" when we already have valid scores from lighthouse.json
    const goodPsiBeforeRun = psiResult && !psiResult.error ? psiResult : null
    let freshPsi: PSIResult | null = goodPsiBeforeRun

    if (psiUrl.trim() && isPublicUrl(psiUrl.trim())) {
      const psiT = go('psi')
      markPSIAttempt()
      setPsiLoading(true)
      try {
        const rawPsi = await fetchPageSpeedInsights(psiUrl.trim(), psiStrategy)
        const liveRes = { ...rawPsi, _source: rawPsi.error ? ('stale' as const) : ('live' as const) }
        setPsiLoading(false)
        if (!liveRes.error) {
          // ✅ Live PSI success — use live data
          freshPsi = liveRes
          setPsiResult(freshPsi)
          savePSICache(freshPsi)
          clear429()
          setPsiRetryAt(0)
          setPsiCachedAt('live · just now')
          const perf = freshPsi.scores.find((s) => s.label === 'Performance')?.score
          const a11y = freshPsi.scores.find((s) => s.label === 'Accessibility')?.score
          const seo  = freshPsi.scores.find((s) => s.label === 'SEO')?.score
          ok('psi', psiT, `Perf ${perf ?? '?'} · A11y ${a11y ?? '?'} · SEO ${seo ?? '?'}`)
        } else if (liveRes.error?.includes('429')) {
          // ⚠ Rate limited — preserve previously loaded good data, log error in step
          const retryAfterSec = liveRes.retryAfterSec ?? 65
          mark429(retryAfterSec)
          setPsiRetryAt(Date.now() + retryAfterSec * 1000)
          // Keep the good result visible — don't call setPsiResult with error
          if (!goodPsiBeforeRun) setPsiResult(liveRes)
          fail('psi', `Rate limited — auto-retry in ${retryAfterSec}s · add NEXT_PUBLIC_PSI_API_KEY`)
        } else {
          // ⚠ Other error — same: preserve good data
          if (!goodPsiBeforeRun) setPsiResult(liveRes)
          fail('psi', (liveRes.error ?? 'fetch failed').slice(0, 72))
        }
      } catch (e) {
        setPsiLoading(false)
        if (!goodPsiBeforeRun) setPsiResult({ url: psiUrl.trim(), strategy: psiStrategy, fetchedAt: new Date().toISOString(), scores: [], audits: {}, error: e instanceof Error ? e.message : String(e) })
        fail('psi', (e instanceof Error ? e.message : String(e)).slice(0, 72))
      }
    } else if (!psiUrl.trim()) {
      skip('psi', 'no canonical URL — set in Config → SEO')
    } else {
      // Try to load build baseline from lighthouse.json even when PSI not applicable
      const buildT = go('psi')
      const buildData = await fetch('/data/lighthouse.json', { cache: 'no-store' })
        .then(r => r.ok ? r.json() : null)
        .catch(() => null)
      if (buildData?.mobile?.scores?.length) {
        const age = buildData.generatedAt ? staleLabel(new Date(buildData.generatedAt).getTime()) : ''
        const buildResult = { ...buildData.mobile as PSIResult, _source: 'build' as const }
        freshPsi = buildResult
        setPsiResult(buildResult)
        setPsiCachedAt(`build · ${age}`)
        ok('psi', buildT, `build baseline · Perf ${buildResult.scores.find(s => s.label === 'Performance')?.score ?? '?'}`)
      } else {
        skip('psi', 'localhost — PSI requires public URL · run npm run fetch:lighthouse')
      }
    }

    // ── 10 · Error collection ───────────────────────────────────────────────
    t = go('errors')
    const freshErrors = errorCollector.get()
    ok('errors', t, `${freshErrors.length} caught`)

    // ── 11 · Alerts evaluation ──────────────────────────────────────────────
    t = go('alerts')
    const feeds          = state.intelligence?.feeds ?? []
    const connectedFeeds = feeds.filter((f: { connected?: boolean }) => f.connected).length
    const freshAlerts    = evaluateAlerts({
      liveVitals, navMetrics: freshNav, psiResult: freshPsi,
      errors: freshErrors,
      longTaskCount: longTasks.count, longTaskTotalMs: longTasks.totalMs,
      sessionTaskCount: longTasks.sessionCount, sessionTaskMs: longTasks.sessionMs,
      feedTotal: feeds.length, feedConnected: connectedFeeds,
      prodReadinessScore: undefined, programScore: undefined,
      isAdminContext: true,
    })
    setActiveAlerts(freshAlerts)
    ok('alerts', t, `${freshAlerts.length} active · ${freshAlerts.filter((a) => a.severity === 'critical').length} critical`)

    // ── 12 · Snapshot save ──────────────────────────────────────────────────
    t = go('snapshot')
    const snap = saveSnapshot({
      timestamp:        new Date().toISOString(),
      lighthouseScores: freshPsi && !freshPsi.error ? freshPsi.scores : undefined,
      vitals:           { ...liveVitals },
      domSeoPass:       freshDomSeo.filter((c) => c.pass).length,
      domSeoTotal:      freshDomSeo.length,
      errorCount:       freshErrors.length,
      feedConnected:    connectedFeeds,
      feedTotal:        feeds.length,
      navTTFB:          freshNav.ttfb,
      heapUsed:         freshNav.jsHeapUsed,
      resourceCount:    freshResources.entries.length,
      url:              psiUrl.trim() || undefined,
      strategy:         psiStrategy,
      type:             psiUrl.trim() ? 'psi' : 'manual',
    })
    setHistoryEntries((prev) => [snap, ...prev].slice(0, 30))
    setHistoryStats(computeHistoryStats())
    ok('snapshot', t, 'saved to history')

    setLastRefreshed(new Date().toLocaleTimeString())
    setRunning(false)

    // Auto-dismiss progress after 6s if no errors
    if (!stepsRef.current.some((s) => s.status === 'error')) {
      setTimeout(() => setShowProgress(false), 6000)
    }
  }, [psiUrl, psiStrategy, detectChanges, psiResult, liveVitals, longTasks, state.intelligence])

  function exportReport() {
    const report = {
      timestamp: new Date().toISOString(),
      lighthouse: psiResult?.scores.length ? psiResult.scores : STATIC_LIGHTHOUSE,
      navMetrics, liveVitals, domSeoChecks, domA11yChecks,
      errors: runtimeErrors.slice(0, 10),
    }
    navigator.clipboard.writeText(JSON.stringify(report, null, 2)).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // ─── Derived values ─────────────────────────────────────────────────────────
  const providerConnected: Record<string, boolean> = {
    ga4: !!gaId && state.site.enableAnalytics,
    posthog: false, sentry: false, plausible: false,
  }
  const connectedCount   = Object.values(providerConnected).filter(Boolean).length
  const lighthouseScores   = psiResult?.scores?.length ? psiResult.scores : null
  const globalScore        = lighthouseScores ? Math.round(lighthouseScores.reduce((a, b) => a + b.score, 0) / lighthouseScores.length) : 0
  const isLighthouseLive   = !!(psiResult?.scores?.length && !psiResult.error && psiResult._source === 'live')
  const isLighthouseReal   = !!(psiResult?.scores?.length && !psiResult.error)   // live OR cache OR build

  const cwvLive = useMemo<Record<string, number>>(() => {
    const base: Record<string, number> = { ...liveVitals }
    if (psiResult && !psiResult.error) {
      const map: Array<[string, string]> = [
        ['LCP', 'largest-contentful-paint'], ['FCP', 'first-contentful-paint'],
        ['TBT', 'total-blocking-time'], ['CLS', 'cumulative-layout-shift'],
        ['TTFB', 'server-response-time'],
      ]
      for (const [abbr, id] of map) {
        const v = parsePSIAuditMs(id, psiResult.audits[id]?.displayValue)
        if (v != null) base[abbr] = v
      }
    }
    return base
  }, [liveVitals, psiResult])

  const configSeoChecks  = useMemo(() => runConfigSEOAudit({
    defaultTitle: state.seo.defaultTitle, defaultDescription: state.seo.defaultDescription,
    ogImage: state.seo.ogImage, twitterHandle: state.seo.twitterHandle,
    canonicalBase: state.seo.canonicalBase, robots: state.seo.robots,
  }), [state.seo])

  const psiA11yScore     = psiResult?.scores.find(s => s.label === 'Accessibility')?.score
  const activeA11yChecks = domA11yChecks.length > 0 ? domA11yChecks : buildA11yAudit(state, psiA11yScore)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const seoChecks     = useMemo(() => buildSeoAudit(state),               [state.seo, state.site])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const a11yChecks    = useMemo(() => buildA11yAudit(state, psiA11yScore), [state.navigation, state.content, psiA11yScore])
  const healthDomains = useMemo(() => buildProgramHealth(state),           [state])
  const prodChecks    = useMemo(() => buildProductionReadiness(state),     [state])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const testsChecks   = useMemo(() => buildTestsAudit(state),              [])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const docsChecks    = useMemo(() => buildDocsAudit(state),               [state.site.description])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const archChecks    = useMemo(() => buildArchAudit(state),               [])
  const prodScore     = Math.round(prodChecks.filter(c => c.pass).length / prodChecks.length * 100)

  const a11yPassing  = activeA11yChecks.filter((c) => c.pass).length
  const issueCount   = 0  // RECOMMENDATIONS filtered to 'high' — currently all are 'low'/'medium'
  const warnCount    = 3
  const programScore = Math.round(healthDomains.reduce((a, d) => a + d.score, 0) / healthDomains.length)
  const totalHealthPasses = healthDomains.reduce((a, d) => a + d.items.filter((i) => i.pass).length, 0)
  const totalHealthItems  = healthDomains.reduce((a, d) => a + d.items.length, 0)
  const errorCount   = runtimeErrors.length
  const alertCounts  = alertsCount(activeAlerts)
  const hasLiveData  = domSeoChecks.length > 0 || navMetrics != null

  // Deferred so heavy AI scoring doesn't block interactions in the panel
  const deferredState = useDeferredValue(state)
  const aiAnalysis = useMemo(
    () => computeAIAnalysis(deferredState, prodChecks, healthDomains, seoChecks, a11yChecks, errorCount, longTasks.sessionCount, globalScore),
    [deferredState, prodChecks, healthDomains, seoChecks, a11yChecks, errorCount, longTasks.sessionCount, globalScore],
  )

  const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'overview',      label: 'Overview',    icon: Gauge        },
    { id: 'performance',   label: 'Performance', icon: Zap          },
    { id: 'seo',           label: 'SEO',         icon: Search       },
    { id: 'accessibility', label: 'A11y',        icon: Shield       },
    { id: 'bundle',        label: 'Bundle',      icon: Package      },
    { id: 'tracking',      label: 'Tracking',    icon: BarChart3    },
    { id: 'program',       label: 'Program',     icon: Layers       },
    { id: 'project',       label: 'Project',     icon: Code2        },
    { id: 'errors',        label: 'Errors',      icon: AlertTriangle, badge: errorCount },
    { id: 'history',       label: 'History',     icon: Clock,         badge: historyEntries.length > 0 ? historyEntries.length : undefined },
    { id: 'insights',      label: 'AI Insights', icon: Sparkles     },
    { id: 'phase2',        label: 'Phase 2',     icon: Radio        },
    { id: 'phase3',        label: 'Phase 3',     icon: Construction },
    { id: 'phase4',        label: 'Phase 4',     icon: Zap          },
    { id: 'phase5',        label: 'Phase 5',     icon: Rocket       },
    { id: 'stabilization', label: 'Stab P1',    icon: Hammer       },
    { id: 'phase2cms',     label: 'CMS P2',     icon: GitBranch    },
  ]

  const exportBtnCls = (done: boolean) =>
    `inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.1em] transition-all ${done ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-400' : 'border-white/10 bg-white/4 text-white/40 hover:border-white/20 hover:text-white/65'}`
  const runBtnCls = (running: boolean) =>
    `inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.1em] transition-all ${running ? 'border-rose-400/20 bg-rose-400/8 text-rose-400/60 cursor-not-allowed' : 'border-rose-400/30 bg-rose-400/10 text-rose-400 hover:bg-rose-400/18'}`
  const statusDotCls = (active: boolean) =>
    `h-1.5 w-1.5 shrink-0 rounded-full ${active ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'}`
  const alertRowCls = (sev: string) => {
    const m: Record<string, string> = { critical: 'border-l-2 border-l-red-400/60', warning: 'border-l-2 border-l-amber-400/60', info: 'border-l-2 border-l-sky-400/40' }
    return `flex items-start gap-3 px-4 py-2.5 ${m[sev] ?? ''}`
  }
  const alertDotCls = (sev: string) => {
    const m: Record<string, string> = { critical: 'bg-red-400', warning: 'bg-amber-400', info: 'bg-sky-400' }
    return `mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${m[sev] ?? 'bg-white/20'}`
  }
  const summaryChipCls = (variant: string) => {
    const m: Record<string, string> = {
      error: 'border-red-400/20 bg-red-400/6 text-red-400', warning: 'border-amber-400/20 bg-amber-400/6 text-amber-400',
      success: 'border-emerald-400/20 bg-emerald-400/6 text-emerald-400', info: 'border-sky-400/20 bg-sky-400/6 text-sky-400',
      neutral: 'border-white/10 bg-white/4 text-white/50',
    }
    return `flex flex-col items-center rounded-xl border px-4 py-2 ${m[variant] ?? m.neutral}`
  }
  const tabCls = (active: boolean) =>
    `inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.1em] transition-colors ${active ? 'bg-rose-400/15 text-rose-400 border border-rose-400/20' : 'text-white/30 hover:text-white/55'}`
  const tabBadgeCls = (active: boolean) =>
    `ml-0.5 rounded-full px-1 py-0 font-mono text-[8px] ${active ? 'bg-rose-400/25 text-rose-300' : 'bg-white/10 text-white/40'}`

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.24em] text-rose-400/60">Platform · Analytics</div>
          <h1 className="text-xl font-semibold tracking-tight text-white/90">Analytics &amp; Performance</h1>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white/25">
            {connectedCount}/4 providers
            {lighthouseScores ? ` · Lighthouse avg ${globalScore}` : ' · Lighthouse pending'}
            {' '}· {isLighthouseLive ? 'PSI live' : isLighthouseReal ? `PSI ${psiResult?._source ?? 'cached'}` : 'PSI not run'}
            {' '}· {configSeoChecks.filter(c => c.pass).length}/{configSeoChecks.length} SEO · {a11yPassing}/{activeA11yChecks.length} A11y
            {errorCount > 0 ? ` · ${errorCount} errors` : ''}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button onClick={exportReport} className={exportBtnCls(copied)}>
            {copied ? <CheckCircle2 className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? 'Copied' : 'Export'}
          </button>
          <button onClick={runAnalysis} disabled={running} className={runBtnCls(running)}>
            {running ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
            {running ? 'Analyzing…' : 'Run Analysis'}
          </button>
        </div>
      </div>

      {/* Analysis progress — visible during run and 6s after */}
      {showProgress && (
        <AnalysisProgress
          steps={runSteps}
          elapsed={elapsed}
          running={running}
          onDismiss={() => setShowProgress(false)}
        />
      )}

      {/* Live status bar */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-white/6 bg-white/[0.015] px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className={statusDotCls(Object.keys(liveVitals).length > 0)} />
          <span className="font-mono text-[9px] uppercase tracking-wider text-white/35">Web Vitals</span>
          <span className="font-mono text-[9px] text-white/55">{Object.keys(liveVitals).length > 0 ? `${Object.keys(liveVitals).length}/5 live` : 'observing…'}</span>
        </div>
        <span className="h-3 w-px bg-white/10" />
        <div className="flex items-center gap-1.5">
          <span className={statusDotCls(hasLiveData)} />
          <span className="font-mono text-[9px] uppercase tracking-wider text-white/35">DOM Audit</span>
          <span className="font-mono text-[9px] text-white/55">{domSeoChecks.length > 0 ? 'live' : 'run analysis'}</span>
        </div>
        <span className="h-3 w-px bg-white/10" />
        <div className="flex items-center gap-1.5">
          <span className={statusDotCls(psiResult != null && !psiResult.error)} />
          <span className="font-mono text-[9px] uppercase tracking-wider text-white/35">PageSpeed</span>
          <span className="font-mono text-[9px] text-white/55">{psiLoading ? 'fetching…' : psiResult ? (psiResult.error ? 'error' : 'live') : 'not run'}</span>
        </div>
        <span className="h-3 w-px bg-white/10" />
        <div className="flex items-center gap-1.5">
          <span className={statusDotCls(errorCount === 0)} />
          <span className="font-mono text-[9px] uppercase tracking-wider text-white/35">Errors</span>
          <span className="font-mono text-[9px] text-white/55">{errorCount === 0 ? 'clean' : `${errorCount} caught`}</span>
        </div>
        {lastRefreshed && (
          <>
            <span className="h-3 w-px bg-white/10" />
            <div className="flex items-center gap-1.5">
              <Radio className="h-2.5 w-2.5 text-emerald-400/60" />
              <span className="font-mono text-[9px] text-white/55">{lastRefreshed}</span>
            </div>
          </>
        )}
        <div className="ml-auto flex items-center gap-2">
          <span className="font-mono text-[9px] uppercase tracking-wider text-white/30">Auto</span>
          <button
            className={`relative h-5 w-9 shrink-0 cursor-pointer rounded-full border transition-all ${autoRefresh ? 'border-emerald-400/40 bg-emerald-400/15' : 'border-white/12 bg-white/5'}`}
            onClick={() => setAutoRefresh((v) => !v)}
            aria-label="Toggle auto-refresh"
          >
            <span className={`absolute top-0.5 h-4 w-4 rounded-full transition-all duration-200 ${autoRefresh ? 'left-[18px] bg-emerald-400' : 'left-0.5 bg-white/30'}`} />
          </button>
          {autoRefresh && (
            <select value={refreshInterval} onChange={(e) => setRefreshInterval(Number(e.target.value))} className="rounded-lg border border-white/10 bg-white/4 px-2.5 py-1.5 font-mono text-[9px] text-white/50 outline-none focus:border-white/20 transition-colors">
              <option value={30}>30s</option>
              <option value={60}>1m</option>
              <option value={300}>5m</option>
            </select>
          )}
        </div>
      </div>

      {/* Alerts bar */}
      {activeAlerts.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-rose-400/20 bg-rose-400/4">
          <div className="flex items-center gap-2.5 border-b border-rose-400/12 px-4 py-2.5">
            <AlertTriangle className="h-3 w-3 text-amber-400/80" />
            <span className="flex-1 font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400/80">
              {alertCounts.critical > 0
                ? `${alertCounts.critical} critical · ${alertCounts.warning} warning`
                : `${alertCounts.warning} warning · ${alertCounts.info} info`}
            </span>
            <span className="font-mono text-[9px] text-white/30">run analysis to update</span>
          </div>
          <div className="divide-y divide-white/5">
            {activeAlerts.slice(0, 5).map((a) => (
              <div key={a.id} className={alertRowCls(a.severity)}>
                <span className={alertDotCls(a.severity)} />
                <span className="flex-1 font-mono text-[9px] text-white/70">{a.message}</span>
                {a.value && <span className="shrink-0 font-mono text-[9px] font-bold">{a.value}</span>}
              </div>
            ))}
            {activeAlerts.length > 5 && (
              <div className="px-3 py-1 font-mono text-[8px] text-white/25">
                +{activeAlerts.length - 5} more — click Errors or Program tab
              </div>
            )}
          </div>
        </div>
      )}

      {activeAlerts.length === 0 && lastRefreshed != null && (
        <div className="flex items-center gap-2 px-4 py-3 font-mono text-[9px] text-emerald-400/70">
          <CheckCircle2 className="h-3 w-3 text-emerald-400/70" />
          <span className="font-mono text-[9px] text-emerald-400/60">All thresholds clear — no active alerts</span>
        </div>
      )}

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: 'Issues',     value: issueCount,  variant: issueCount > 0 ? 'error' : 'success' },
          { label: 'Warnings',   value: warnCount,   variant: warnCount > 0 ? 'warning' : 'success' },
          { label: 'SEO checks', value: `${configSeoChecks.filter(c => c.pass).length}/${configSeoChecks.length}`, variant: configSeoChecks.filter(c => c.pass).length === configSeoChecks.length ? 'success' : 'warning' },
          { label: 'A11y',       value: `${a11yPassing}/${activeA11yChecks.length}`, variant: a11yPassing >= activeA11yChecks.length - 1 ? 'success' : 'warning' },
          { label: 'Lighthouse', value: lighthouseScores ? globalScore : '—', variant: !lighthouseScores ? 'neutral' : globalScore >= 80 ? 'success' : 'warning' },
          { label: 'Providers',  value: `${connectedCount}/4`, variant: connectedCount > 0 ? 'info' : 'neutral' },
          { label: 'Program',    value: `${totalHealthPasses}/${totalHealthItems}`, variant: programScore >= 80 ? 'success' : programScore >= 60 ? 'warning' : 'error' },
          { label: 'Errors',     value: errorCount,  variant: errorCount === 0 ? 'success' : 'error' },
        ].map(({ label, value, variant }) => (
          <div key={label} className={summaryChipCls(variant)}>
            <div className="font-mono text-[16px] font-bold tabular-nums leading-none">{value}</div>
            <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.14em] opacity-70">{label}</div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-white/8 bg-white/[0.02] p-1">
        {TABS.map(({ id, label, icon: Icon, badge }) => (
          <button key={id} onClick={() => setActiveTab(id)} className={tabCls(activeTab === id)}>
            <Icon className="h-3 w-3" />
            {label}
            {badge != null && badge > 0 && <span className={tabBadgeCls(activeTab === id)}>{badge}</span>}
          </button>
        ))}
      </div>

      {/* Tab content — each tab is an isolated component */}
      {activeTab === 'overview' && (
        <OverviewTab
          psiLoading={psiLoading} psiUrl={psiUrl} psiResult={psiResult}
          psiCachedAt={psiCachedAt} psiExpanded={psiExpanded} psiStrategy={psiStrategy}
          isLighthouseLive={isLighthouseLive} isLighthouseReal={isLighthouseReal}
          lighthouseScores={lighthouseScores ?? []}
          canonicalBase={state.seo.canonicalBase}
          configSeoChecks={configSeoChecks} activeA11yChecks={activeA11yChecks}
          a11yPassing={a11yPassing} domA11yChecks={domA11yChecks}
          healthDomains={healthDomains} globalScore={globalScore} prodScore={prodScore}
          programScore={programScore} totalHealthPasses={totalHealthPasses} totalHealthItems={totalHealthItems}
          setPsiExpanded={setPsiExpanded} setPsiUrl={setPsiUrl} setPsiStrategy={setPsiStrategy}
          fetchPSI={fetchPSI} setActiveTab={setActiveTab}
          psiCountdown={psiCountdown}
          onBuildDataLoaded={(result, cachedAt) => {
            setPsiResult(result)
            setPsiCachedAt(cachedAt)
          }}
        />
      )}
      {activeTab === 'performance' && (
        <PerformanceTab
          liveVitals={liveVitals} cwvLive={cwvLive} navMetrics={navMetrics}
          longTasks={longTasks} resourceSummary={resourceSummary} networkFails={networkFails}
          bundleSummary={bundleSummary} psiResult={psiResult}
          psiCachedAt={psiCachedAt} isLighthouseLive={isLighthouseLive}
          performanceHints={perfHints}
        />
      )}
      {activeTab === 'seo'           && <SEOTab configSeoChecks={configSeoChecks} domSeoChecks={domSeoChecks} securityChecks={securityChecks} dispatch={dispatch} />}
      {activeTab === 'accessibility' && <AccessibilityTab domA11yChecks={domA11yChecks} a11yChecks={a11yChecks} activeA11yChecks={activeA11yChecks} />}
      {activeTab === 'bundle'        && <BundleTab bundleSummary={bundleSummary} liveBundles={liveBundles} lastRefreshed={lastRefreshed} />}
      {activeTab === 'tracking'      && (
        <TrackingTab
          gaId={gaId} providerConnected={providerConnected}
          sessionMetrics={sessionMetrics}
          setSiteField={(key, value) => dispatch({ type: 'UPDATE_SITE', payload: { [key]: value } })}
        />
      )}
      {activeTab === 'program'       && (
        <ProgramTab
          healthDomains={healthDomains} prodChecks={prodChecks} prodScore={prodScore}
          programScore={programScore} totalHealthPasses={totalHealthPasses} totalHealthItems={totalHealthItems}
          lighthouseScores={lighthouseScores ?? []} changeLog={changeLog} psiResult={psiResult}
        />
      )}
      {activeTab === 'project'  && (
        <ProjectTab
          testsChecks={testsChecks} docsChecks={docsChecks} archChecks={archChecks}
          htmlChecks={htmlChecks}   pwaChecks={pwaChecks}   secChecks={secChecks}   dxChecks={dxChecks}
          schemaChecks={schemaChecks} perfDeepChecks={perfDeepChecks}
        />
      )}
      {activeTab === 'errors'   && <ErrorsTab runtimeErrors={runtimeErrors} errorCount={errorCount} intelligenceFeeds={state.intelligence?.feeds} />}
      {activeTab === 'history'  && (
        <HistoryTab
          historyEntries={historyEntries} historyStats={historyStats} heapSamples={heapSamples}
          setHistoryEntries={setHistoryEntries} setHistoryStats={setHistoryStats}
        />
      )}
      {activeTab === 'insights' && <InsightsTab aiAnalysis={aiAnalysis} prodChecks={prodChecks} healthDomains={healthDomains} />}
      {activeTab === 'phase2'   && <Phase2Tab />}
      {activeTab === 'phase3'   && <Phase3Tab />}
      {activeTab === 'phase4'   && <Phase4Tab />}
      {activeTab === 'phase5'        && <Phase5Tab />}
      {activeTab === 'stabilization' && <StabilizationTab />}
      {activeTab === 'phase2cms'     && <Phase2CmsTab />}
    </div>
  )
}
