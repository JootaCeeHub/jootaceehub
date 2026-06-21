'use client'

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef, useMemo } from 'react'
import type { AdminState, AdminAction } from './types'
import { createInitialState } from './state'
import { AdminStateSchema } from './schema'
import { reportError } from '@/lib/error'
import { saveToIDB, loadFromIDB } from './idb'
import { uiHandler } from './slices/ui'
import { siteHandler } from './slices/site'
import { registriesHandler } from './slices/registries'
import { infrastructureHandler } from './slices/infrastructure'
import { contentHandler } from './slices/content'
import { designHandler } from './slices/design'
import { integrationsHandler } from './slices/integrations'
import { aiHandler } from './slices/ai'
import { capabilitiesHandler } from './slices/capabilities'
import { studioHandler } from './slices/studio'
import { cmsHandler } from './slices/cms'
import { jobsReducer } from './slices/jobs'

const SLICE_HANDLERS = [
  uiHandler,
  siteHandler,
  registriesHandler,
  infrastructureHandler,
  contentHandler,
  designHandler,
  integrationsHandler,
  aiHandler,
  capabilitiesHandler,
  studioHandler,
  cmsHandler,
  jobsReducer,
] as const

const STORAGE_KEY = 'jootacee-command-v2'

function loadState(): AdminState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const validated = AdminStateSchema.partial().safeParse(parsed)
    if (!validated.success) {
      reportError(new Error('Command center state validation failed'), {
        context: 'admin/loadState',
        issues: validated.error.issues,
      })
      return null
    }
    const initial = createInitialState()
    return {
      ...initial,
      ...validated.data,
      integrations: {
        ...initial.integrations,
        ...(validated.data.integrations ?? {}),
        github: {
          ...initial.integrations.github,
          ...(validated.data.integrations?.github ?? {}),
        },
        dataSources: validated.data.integrations?.dataSources ?? [],
        // Merge stored social platforms over defaults (preserving any new default platforms)
        socialPlatforms: initial.integrations.socialPlatforms.map((def) => {
          const stored = validated.data.integrations?.socialPlatforms?.find((p) => p.id === def.id)
          return stored ? { ...def, ...stored } : def
        }),
      },
      // Backward-compat: if stored blocks lack `type`, infer from `id`
      blocks: (validated.data.blocks ?? initial.blocks).map((b) => ({ ...b, type: b.type ?? b.id })),
      pageBlocksMap: validated.data.pageBlocksMap
        ? { ...initial.pageBlocksMap, ...validated.data.pageBlocksMap }
        : initial.pageBlocksMap,
      content: validated.data.content ? {
        ...initial.content,
        ...validated.data.content,
        hero: { ...initial.content.hero, ...(validated.data.content.hero ?? {}) },
        blog: { ...initial.content.blog, ...(validated.data.content.blog ?? {}) },
        cta: { ...initial.content.cta, ...(validated.data.content.cta ?? {}) },
        contact: { ...initial.content.contact, ...(validated.data.content.contact ?? {}) },
        map: { ...initial.content.map, ...(validated.data.content.map ?? {}) },
        newsletter: { ...initial.content.newsletter, ...(validated.data.content.newsletter ?? {}) },
      } : initial.content,
      githubConfig: {
        ...initial.githubConfig,
        ...(validated.data.githubConfig ?? {}),
        repoMeta: { ...initial.githubConfig.repoMeta, ...(validated.data.githubConfig?.repoMeta ?? {}) },
      },
      projectsRegistry: validated.data.projectsRegistry ?? initial.projectsRegistry,
      curatedLinks: validated.data.curatedLinks ?? [],
      driveResources: validated.data.driveResources ?? [],
      trackedSources: validated.data.trackedSources ?? [],
      aboutConfig: validated.data.aboutConfig
        ? { ...initial.aboutConfig, ...validated.data.aboutConfig }
        : initial.aboutConfig,
      navbarSettings: validated.data.navbarSettings ? { ...initial.navbarSettings, ...validated.data.navbarSettings } : initial.navbarSettings,
      footerSettings: validated.data.footerSettings ? { ...initial.footerSettings, ...validated.data.footerSettings } : initial.footerSettings,
      aiConfig: { ...initial.aiConfig, ...(validated.data.aiConfig ?? {}) },
      capabilities: {
        ...initial.capabilities,
        ...(validated.data.capabilities ?? {}),
        mcpServers: validated.data.capabilities?.mcpServers ?? initial.capabilities.mcpServers,
        skills: validated.data.capabilities?.skills ?? initial.capabilities.skills,
        hermes: { ...initial.capabilities.hermes, ...(validated.data.capabilities?.hermes ?? {}) },
        platforms: validated.data.capabilities?.platforms ?? initial.capabilities.platforms,
      },
      visualEffects: validated.data.visualEffects
        ? { ...initial.visualEffects, ...validated.data.visualEffects }
        : initial.visualEffects,
      intelligence: (() => {
        const stored = validated.data.intelligence
        const storedFeeds = stored?.feeds ?? []
        // Merge: keep stored feeds (user API keys + enabled states), append new defaults not yet in storage
        const storedIds = new Set(storedFeeds.map((f: { id: string }) => f.id))
        const newDefaultFeeds = initial.intelligence.feeds.filter((f) => !storedIds.has(f.id))
        return {
          ...initial.intelligence,
          ...(stored ?? {}),
          feeds: [...storedFeeds, ...newDefaultFeeds],
        }
      })(),
      unsaved: false,
    } as unknown as AdminState
  } catch (err) {
    reportError(err, { context: 'admin/loadState' })
    return null
  }
}

function saveState(state: AdminState) {
  if (typeof window === 'undefined') return
  const { unsaved: _u, ...persistable } = state
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable))
    window.dispatchEvent(new CustomEvent('admin-state-saved'))
  } catch { /* quota exceeded */ }
  void saveToIDB(persistable)  // parallel durable write
}

export function adminReducer(state: AdminState, action: AdminAction): AdminState {
  // Meta actions: handled inline because they touch persistence directly
  if (action.type === 'MARK_SAVED') {
    return { ...state, unsaved: false, lastSaved: new Date().toISOString() }
  }
  if (action.type === 'IMPORT_STATE') {
    const next = { ...action.payload, unsaved: false, lastSaved: new Date().toISOString() }
    saveState(next)
    return next
  }
  if (action.type === 'RESET_STATE') {
    const next = createInitialState()
    saveState(next)
    return next
  }

  // Auto-revision: snapshot the item before content mutations are applied
  const preRevisionState = autoSnapshotBeforeMutation(state, action)
  const baseState = preRevisionState ?? state

  // Delegate to domain slice handlers — first match wins
  for (const handler of SLICE_HANDLERS) {
    const result = handler(baseState, action)
    if (result !== null) return result
  }

  return baseState
}

/** Returns a new state with a revision appended before a destructive content mutation, or null if not applicable. */
function autoSnapshotBeforeMutation(state: AdminState, action: AdminAction): AdminState | null {
  const MAX_REVISIONS = 50
  let revision: import('./types').ContentRevision | null = null
  const ts = new Date().toISOString()

  if (action.type === 'UPDATE_PROJECT') {
    const item = state.projectsRegistry.find(p => p.id === action.payload.id)
    if (item) revision = { id: `${ts}-${item.id}`, contentId: item.id, contentType: 'project', savedAt: ts, snapshot: item as unknown as Record<string, unknown> }
  } else if (action.type === 'UPDATE_RESEARCH_ENTRY') {
    const item = state.researchRegistry.find(r => r.slug === action.payload.slug)
    if (item) revision = { id: `${ts}-${item.slug}`, contentId: item.slug, contentType: 'research', savedAt: ts, snapshot: item as unknown as Record<string, unknown> }
  } else if (action.type === 'UPDATE_LAB') {
    const item = state.labsRegistry.find(l => l.key === action.payload.key)
    if (item) revision = { id: `${ts}-${item.key}`, contentId: item.key, contentType: 'lab', savedAt: ts, snapshot: item as unknown as Record<string, unknown> }
  } else if (action.type === 'UPDATE_SYSTEM') {
    const item = state.systemsRegistry.find(s => s.key === action.payload.key)
    if (item) revision = { id: `${ts}-${item.key}`, contentId: item.key, contentType: 'system', savedAt: ts, snapshot: item as unknown as Record<string, unknown> }
  }

  if (!revision) return null
  return { ...state, revisionLog: [...state.revisionLog, revision].slice(-MAX_REVISIONS) }
}

interface AdminContextValue {
  state: AdminState
  dispatch: React.Dispatch<AdminAction>
  exportJSON: () => string
  importJSON: (json: string) => boolean
  forceSave: () => void
}

const AdminContext = createContext<AdminContextValue | null>(null)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(
    adminReducer,
    null,
    () => loadState() ?? createInitialState()
  )

  const stateRef = useRef(state)
  useEffect(() => { stateRef.current = state }, [state])

  // Apply any overdue scheduled publishes on mount
  useEffect(() => { dispatch({ type: 'APPLY_SCHEDULED_PUBLISHES' }) }, [])

  // ── Multi-device / cross-tab sync via BroadcastChannel ───────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return
    const channel = new BroadcastChannel('jootacee-admin-sync')

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'STATE_SYNC') {
        const validated = AdminStateSchema.safeParse(event.data.state)
        if (validated.success) {
          dispatch({ type: 'IMPORT_STATE', payload: validated.data as unknown as AdminState })
        }
      }
    }
    channel.addEventListener('message', handleMessage)
    return () => {
      channel.removeEventListener('message', handleMessage)
      channel.close()
    }
  }, [])

  // Broadcast state to other tabs after each debounced save
  const broadcastRef = useRef<BroadcastChannel | null>(null)
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return
    broadcastRef.current = new BroadcastChannel('jootacee-admin-sync')
    return () => { broadcastRef.current?.close() }
  }, [])

  // Async fallback hydration: if localStorage was empty on startup, try IDB → /admin-defaults.json
  useEffect(() => {
    if (typeof window === 'undefined') return
    const hasLocal = !!localStorage.getItem(STORAGE_KEY)
    if (hasLocal) {
      // Backfill IDB from localStorage so it stays current across upgrades
      const persisted = stateRef.current
      void saveToIDB(persisted)
      return
    }
    ;(async () => {
      let raw: unknown = await loadFromIDB()
      if (!raw) {
        try {
          const res = await fetch('/admin-defaults.json')
          if (res.ok) raw = await res.json()
        } catch { /* no fallback file — skip */ }
      }
      if (!raw) return
      // Stash in localStorage so loadState() merge logic applies
      localStorage.setItem(STORAGE_KEY, JSON.stringify(raw))
      const merged = loadState()
      if (!merged) return
      dispatch({ type: 'IMPORT_STATE', payload: merged })
    })().catch(() => {})
  }, [])

  useEffect(() => {
    if (state.unsaved) {
      const t = setTimeout(() => {
        dispatch({ type: 'MARK_SAVED' })
        saveState(stateRef.current)
        broadcastRef.current?.postMessage({ type: 'STATE_SYNC', state: stateRef.current })
      }, 800)
      return () => clearTimeout(t)
    }
  }, [state.unsaved, state])

  const exportJSON = useCallback(() => {
    const { unsaved: _unsaved, ...rest } = stateRef.current
    return JSON.stringify(rest, null, 2)
  }, [])

  const importJSON = useCallback((json: string) => {
    try {
      const parsed = JSON.parse(json)
      const validated = AdminStateSchema.safeParse(parsed)
      if (!validated.success) {
        reportError(new Error('Command center import validation failed'), {
          context: 'admin/importJSON',
          issues: validated.error.issues,
        })
        return false
      }
      // Snapshot current state to sessionStorage before overwriting.
      // On bad import: reload tab to recover. Survives until tab close.
      try {
        sessionStorage.setItem('jootacee-pre-import-backup', JSON.stringify(stateRef.current))
      } catch { /* storage quota exceeded — skip backup */ }
      dispatch({ type: 'IMPORT_STATE', payload: validated.data as unknown as AdminState })
      return true
    } catch (err) {
      reportError(err, { context: 'admin/importJSON' })
      return false
    }
  }, [])

  const forceSave = useCallback(() => {
    dispatch({ type: 'MARK_SAVED' })
    saveState(stateRef.current)
  }, [])

  const contextValue = useMemo(
    () => ({ state, dispatch, exportJSON, importJSON, forceSave }),
    [state, dispatch, exportJSON, importJSON, forceSave]
  )

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider')
  return ctx
}
