import type { NavigationMetrics } from './live-metrics'
import type { PSIResult } from './pagespeed'
import type { RuntimeError } from './error-collector'

export type AlertSeverity = 'critical' | 'warning' | 'info'

export interface Alert {
  id:       string
  severity: AlertSeverity
  category: string
  message:  string
  value?:   string
  hint?:    string
}

export interface AlertInput {
  liveVitals?:          Record<string, number>
  navMetrics?:          NavigationMetrics | null
  psiResult?:           PSIResult | null
  errors?:              RuntimeError[]
  longTaskCount?:       number
  longTaskTotalMs?:     number
  sessionTaskCount?:    number   // tasks captured during THIS admin session (not page load)
  sessionTaskMs?:       number
  feedTotal?:           number
  feedConnected?:       number
  prodReadinessScore?:  number
  programScore?:        number
  isAdminContext?:      boolean  // true when panel is loaded in /admin — relaxes thresholds
}

export function evaluateAlerts(input: AlertInput): Alert[] {
  const alerts: Alert[] = []
  const {
    liveVitals = {},
    navMetrics,
    psiResult,
    errors = [],
    longTaskCount     = 0,
    longTaskTotalMs   = 0,
    sessionTaskCount  = 0,
    sessionTaskMs     = 0,
    feedTotal         = 0,
    feedConnected     = 0,
    prodReadinessScore,
    programScore,
    isAdminContext    = false,
  } = input

  // ── Web Vitals ────────────────────────────────────────────────────────────────
  if (liveVitals['LCP'] != null) {
    const lcp = liveVitals['LCP']
    if (lcp > 4000)
      alerts.push({ id: 'lcp-poor',    severity: 'critical', category: 'Performance', message: 'LCP is poor',              value: `${(lcp/1000).toFixed(1)}s`, hint: 'Optimize hero 3D load — dynamic import + ssr:false already applied; check image sizes' })
    else if (lcp > 2500)
      alerts.push({ id: 'lcp-improve', severity: 'warning',  category: 'Performance', message: 'LCP needs improvement',    value: `${(lcp/1000).toFixed(1)}s`, hint: 'Target < 2.5s — consider preloading hero image or deferring R3F canvas' })
  }

  if (liveVitals['INP'] != null) {
    const inp = liveVitals['INP']
    // Admin panel has heavier interactions than public pages — use a relaxed threshold
    const poorThreshold = isAdminContext ? 1000 : 500
    const warnThreshold = isAdminContext  ? 500  : 200
    if (inp > poorThreshold)
      alerts.push({ id: 'inp-poor',    severity: 'critical', category: 'Performance', message: isAdminContext ? 'INP is poor (admin panel)' : 'INP is poor', value: `${inp}ms`, hint: isAdminContext ? 'Heavy admin renders — memoize expensive panels; this does not affect public site INP' : 'Interaction delay > 500ms — profile event handlers in Chrome DevTools' })
    else if (inp > warnThreshold)
      alerts.push({ id: 'inp-warn',    severity: 'warning',  category: 'Performance', message: 'INP needs improvement',    value: `${inp}ms`, hint: 'Target < 200ms — split large event handlers' })
  }

  if (liveVitals['CLS'] != null) {
    const cls = liveVitals['CLS'] / 1000
    if (cls > 0.25)
      alerts.push({ id: 'cls-poor',    severity: 'critical', category: 'Performance', message: 'CLS is poor',              value: cls.toFixed(3), hint: 'Major layout shift — add size attributes to images and iframes' })
    else if (cls > 0.1)
      alerts.push({ id: 'cls-improve', severity: 'warning',  category: 'Performance', message: 'CLS needs improvement',    value: cls.toFixed(3), hint: 'Some layout instability detected — check dynamic content insertion' })
  }

  if (liveVitals['FCP'] != null && liveVitals['FCP'] > 3000)
    alerts.push({ id: 'fcp-poor',      severity: 'warning',  category: 'Performance', message: 'FCP is slow',              value: `${(liveVitals['FCP']/1000).toFixed(1)}s`, hint: 'Target < 1.8s — check render-blocking scripts and font loading' })

  // ── Long tasks — use session tasks only, not buffered page-load history ───────
  // sessionTaskCount: tasks captured AFTER admin panel mounted
  // longTaskCount: includes buffered history from page load (React hydration, R3F init, etc.)
  const reportTaskCount = sessionTaskCount > 0 ? sessionTaskCount : longTaskCount
  const reportTaskMs    = sessionTaskCount > 0 ? sessionTaskMs    : longTaskTotalMs

  // Only surface tasks from the page load buffer if there are many of them AND no session tasks.
  // Label them clearly as page-load context, not a current issue.
  if (sessionTaskCount > 5 && sessionTaskMs > 600) {
    alerts.push({ id: 'longtask-session', severity: 'critical', category: 'Performance',
      message: `${sessionTaskCount} long task${sessionTaskCount > 1 ? 's' : ''} in current session`,
      value: `${sessionTaskMs}ms total`,
      hint: 'Heavy JS blocking UI during admin use — profile in Chrome Performance tab' })
  } else if (sessionTaskCount > 2) {
    alerts.push({ id: 'longtask-session-warn', severity: 'warning', category: 'Performance',
      message: `${sessionTaskCount} long tasks in current session`,
      value: `${sessionTaskMs}ms`,
      hint: 'Some blocking tasks detected during this session' })
  } else if (longTaskCount > 0 && sessionTaskCount === 0) {
    // Page-load buffer only — show as info, not critical
    alerts.push({ id: 'longtask-pageload', severity: 'info', category: 'Performance',
      message: `${longTaskCount} long task${longTaskCount > 1 ? 's' : ''} at page load`,
      value: `${longTaskTotalMs}ms total`,
      hint: 'Captured from page load history (React hydration + 3D init). Not a current session issue.' })
  } else if (reportTaskCount > 0 && reportTaskMs > 600) {
    alerts.push({ id: 'longtask-critical', severity: 'critical', category: 'Performance',
      message: `${reportTaskCount} long task${reportTaskCount > 1 ? 's' : ''} blocking main thread`,
      value: `${reportTaskMs}ms total`,
      hint: 'Heavy JS execution — split work with requestIdleCallback or Web Workers' })
  }

  // ── Memory — only alert if heap is meaningfully large (avoids Chrome initial small-heap FP) ──
  if (navMetrics?.jsHeapUsed != null && navMetrics.jsHeapTotal != null && navMetrics.jsHeapTotal > 0) {
    const totalMB = navMetrics.jsHeapTotal
    const pct     = navMetrics.jsHeapUsed / totalMB
    // Chrome starts with a small heap that grows — only meaningful if total > 64MB
    if (totalMB >= 64 && pct > 0.9)
      alerts.push({ id: 'heap-critical', severity: 'critical', category: 'Memory',
        message: 'JS heap near limit',
        value: `${navMetrics.jsHeapUsed}/${totalMB}MB`,
        hint: 'Risk of OOM — check Three.js geometry disposal, feed subscriptions, and event listeners' })
    else if (totalMB >= 64 && pct > 0.7)
      alerts.push({ id: 'heap-warn', severity: 'warning', category: 'Memory',
        message: 'High JS heap usage',
        value: `${navMetrics.jsHeapUsed}/${totalMB}MB`,
        hint: 'Monitor for leaks — profile with Chrome DevTools Memory panel' })
    else if (totalMB < 64 && pct > 0.9)
      alerts.push({ id: 'heap-growing', severity: 'info', category: 'Memory',
        message: 'Heap filling initial allocation',
        value: `${navMetrics.jsHeapUsed}/${totalMB}MB`,
        hint: 'Chrome will grow the heap automatically — not a memory leak' })
  }

  // ── TTFB — only fire if value is present and below the cap set in collectNavigationMetrics ──
  // Values > 5000ms are silently discarded at collection time (dev server compilation)
  if (navMetrics?.ttfb != null && navMetrics.ttfb > 1800)
    alerts.push({ id: 'ttfb-slow', severity: 'warning', category: 'Network',
      message: 'TTFB is slow',
      value: `${navMetrics.ttfb}ms`,
      hint: 'Server response > 1.8s — check CDN config or enable Brotli compression on host' })

  // ── PSI scores ────────────────────────────────────────────────────────────────
  if (psiResult && !psiResult.error) {
    for (const s of psiResult.scores) {
      if (s.score > 0 && s.score < 50)
        alerts.push({ id: `psi-${s.label.replace(/\s+/g, '-').toLowerCase()}-poor`,
          severity: 'critical', category: 'Lighthouse',
          message: `${s.label} score is poor`,
          value: `${s.score}/100`,
          hint: `Below 50 — run \`npm run build && npm run analyze\` to identify heavy chunks` })
      else if (s.score >= 50 && s.score < 70 && s.label === 'Performance')
        alerts.push({ id: 'psi-perf-needs-work',
          severity: 'warning', category: 'Lighthouse',
          message: 'Performance score needs improvement',
          value: `${s.score}/100`,
          hint: 'Target ≥ 70 — check TBT and LCP in PSI audit details' })
    }
  }

  // ── Runtime errors ────────────────────────────────────────────────────────────
  const jsErrors      = errors.filter((e) => e.type === 'js').length
  const promiseErrors = errors.filter((e) => e.type === 'promise').length
  const reactErrors   = errors.filter((e) => e.type === 'react').length
  const consoleErrors = errors.filter((e) => e.type === 'console').length

  if (jsErrors > 0)
    alerts.push({ id: 'js-errors',       severity: 'critical', category: 'Errors',
      message: `${jsErrors} JS error${jsErrors > 1 ? 's' : ''} detected`,
      value: String(jsErrors),
      hint: 'Check Errors tab for stack traces — may affect core functionality' })
  if (promiseErrors > 0)
    alerts.push({ id: 'promise-errors',  severity: 'warning',  category: 'Errors',
      message: `${promiseErrors} unhandled rejection${promiseErrors > 1 ? 's' : ''}`,
      value: String(promiseErrors),
      hint: 'Add .catch() handlers to async operations; check Errors tab for context' })
  if (reactErrors > 0)
    alerts.push({ id: 'react-errors',    severity: 'critical', category: 'Errors',
      message: `${reactErrors} React error${reactErrors > 1 ? 's' : ''}`,
      value: String(reactErrors),
      hint: 'Component crash caught by error boundary — check Errors tab' })
  if (consoleErrors > 5)
    alerts.push({ id: 'console-noise',   severity: 'info',     category: 'Errors',
      message: `${consoleErrors} console.error calls`,
      value: String(consoleErrors),
      hint: 'High console noise — review installConsoleFilter() suppression list in logger.ts' })

  // ── Intelligence feeds ────────────────────────────────────────────────────────
  if (feedTotal > 0) {
    const ratio = feedConnected / feedTotal
    if (ratio < 0.15)
      alerts.push({ id: 'feeds-low',  severity: 'info',    category: 'Intelligence',
        message: 'Few feeds connected',
        value: `${feedConnected}/${feedTotal}`,
        hint: 'Add API keys in Intelligence Feeds panel to enrich your data streams' })
    else if (ratio < 0.3)
      alerts.push({ id: 'feeds-mid',  severity: 'info',    category: 'Intelligence',
        message: 'Low feed connectivity',
        value: `${feedConnected}/${feedTotal}`,
        hint: 'Consider connecting more data sources for richer intelligence' })
  }

  // ── Platform health ───────────────────────────────────────────────────────────
  if (prodReadinessScore != null && prodReadinessScore < 60)
    alerts.push({ id: 'prod-not-ready',     severity: 'critical', category: 'Platform',
      message: 'Production readiness is low',
      value: `${prodReadinessScore}%`,
      hint: 'Critical items incomplete — check Program tab for details' })
  if (programScore != null && programScore < 50)
    alerts.push({ id: 'program-health-low', severity: 'warning',  category: 'Platform',
      message: 'Program health is low',
      value: `${programScore}/100`,
      hint: 'Multiple domains need attention — see Program tab health domains' })

  const order: Record<AlertSeverity, number> = { critical: 0, warning: 1, info: 2 }
  return alerts.sort((a, b) => order[a.severity] - order[b.severity])
}

export function alertsCount(alerts: Alert[]): { critical: number; warning: number; info: number; total: number } {
  return {
    critical: alerts.filter((a) => a.severity === 'critical').length,
    warning:  alerts.filter((a) => a.severity === 'warning').length,
    info:     alerts.filter((a) => a.severity === 'info').length,
    total:    alerts.length,
  }
}
