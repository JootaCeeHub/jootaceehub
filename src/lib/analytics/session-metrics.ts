
export interface SessionMetrics {
  startTime:     number   // Date.now() at install
  durationMs:    number   // elapsed since start
  focusedMs:     number   // time page was visible/focused
  blurredMs:     number   // time page was hidden
  clicks:        number
  keystrokes:    number
  scrollDepthPct: number  // 0–100 max depth reached
  interactions:  number   // clicks + keystrokes
  pageLoads:     number   // number of navigation entries
}

let _session: SessionMetrics | null   = null
let _listeners: (() => void)[]        = []
let _installed = false
let _visibleStart = 0
let _durationInterval: ReturnType<typeof setInterval> | null = null

function snapshot(): SessionMetrics {
  if (!_session) throw new Error('session not installed')
  const now = Date.now()
  const extraFocused = _visibleStart > 0 ? now - _visibleStart : 0
  return {
    ..._session,
    durationMs:  now - _session.startTime,
    focusedMs:   _session.focusedMs + extraFocused,
    blurredMs:   Math.max(0, (now - _session.startTime) - (_session.focusedMs + extraFocused)),
  }
}

function emit() { _listeners.forEach((fn) => fn()) }

export function installSessionMetrics(): () => void {
  if (typeof window === 'undefined' || _installed) return () => {}
  _installed = true

  const navEntries = performance.getEntriesByType('navigation')

  _session = {
    startTime:      Date.now(),
    durationMs:     0,
    focusedMs:      0,
    blurredMs:      0,
    clicks:         0,
    keystrokes:     0,
    scrollDepthPct: 0,
    interactions:   0,
    pageLoads:      navEntries.length,
  }

  _visibleStart = document.visibilityState === 'visible' ? Date.now() : 0

  const onVisibility = () => {
    if (!_session) return
    if (document.visibilityState === 'visible') {
      _visibleStart = Date.now()
    } else {
      if (_visibleStart > 0) {
        _session.focusedMs += Date.now() - _visibleStart
        _visibleStart = 0
      }
    }
    emit()
  }

  const onScroll = () => {
    if (!_session) return
    const el = document.documentElement
    const depth = Math.min(100, Math.round(((el.scrollTop + el.clientHeight) / el.scrollHeight) * 100))
    if (depth > _session.scrollDepthPct) {
      _session.scrollDepthPct = depth
      emit()
    }
  }

  const onClick = () => {
    if (!_session) return
    _session.clicks++
    _session.interactions++
    emit()
  }

  const onKey = (e: KeyboardEvent) => {
    if (!_session) return
    if (!e.metaKey && !e.ctrlKey && !e.altKey) {
      _session.keystrokes++
      _session.interactions++
      emit()
    }
  }

  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener('scroll', onScroll, { passive: true })
  document.addEventListener('click', onClick, { capture: true })
  document.addEventListener('keydown', onKey, { capture: true })

  // Tick every 5s to update duration without busy-waiting
  _durationInterval = setInterval(emit, 5_000)

  return () => {
    document.removeEventListener('visibilitychange', onVisibility)
    window.removeEventListener('scroll', onScroll)
    document.removeEventListener('click', onClick, { capture: true })
    document.removeEventListener('keydown', onKey, { capture: true })
    if (_durationInterval) clearInterval(_durationInterval)
    _installed = false
    _session = null
    _listeners = []
  }
}

export function getSessionMetrics(): SessionMetrics | null {
  if (!_session) return null
  return snapshot()
}

export function subscribeSessionMetrics(fn: () => void): () => void {
  _listeners.push(fn)
  return () => { _listeners = _listeners.filter((l) => l !== fn) }
}

export function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const rem = s % 60
  return `${m}m ${rem}s`
}
