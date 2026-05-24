'use client'

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import type { AdminState, AdminAction } from './types'
import { createInitialState } from './state'
import { AdminStateSchema } from './schema'
import { reportError } from '@/lib/error'

const STORAGE_KEY = 'jootacee-admin-v1'

function loadState(): AdminState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const validated = AdminStateSchema.partial().safeParse(parsed)
    if (!validated.success) {
      reportError(
        new Error('Admin localStorage validation failed'),
        { context: 'admin/loadState', issues: validated.error.issues }
      )
      return null
    }
    return { ...createInitialState(), ...validated.data, unsaved: false } as AdminState
  } catch (err) {
    reportError(err, { context: 'admin/loadState' })
    return null
  }
}

function saveState(state: AdminState) {
  if (typeof window === 'undefined') return
  try {
    const { unsaved, ...persistable } = state
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable))
  } catch {
    // Ignore quota errors
  }
}

function adminReducer(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    case 'SET_PANEL':
      return { ...state, panel: action.payload }
    case 'UPDATE_SITE':
      return { ...state, site: { ...state.site, ...action.payload }, unsaved: true }
    case 'UPDATE_SEO':
      return { ...state, seo: { ...state.seo, ...action.payload }, unsaved: true }
    case 'SET_BLOCKS':
      return { ...state, blocks: action.payload, unsaved: true }
    case 'UPDATE_NAVBAR':
      return { ...state, navbar: { ...state.navbar, ...action.payload }, unsaved: true }
    case 'UPDATE_DESIGN':
      return { ...state, design: { ...state.design, ...action.payload }, unsaved: true }
    case 'UPDATE_TOKENS':
      return { ...state, design: { ...state.design, tokens: { ...state.design.tokens, ...action.payload } }, unsaved: true }
    case 'UPDATE_PERSONALITY':
      return { ...state, personality: { ...state.personality, ...action.payload }, unsaved: true }
    case 'SET_EFFECTS':
      return { ...state, personality: { ...state.personality, effects: action.payload }, unsaved: true }
    case 'UPDATE_RESULTS':
      return { ...state, results: { ...state.results, ...action.payload } }
    case 'MARK_SAVED':
      return { ...state, unsaved: false, lastSaved: new Date().toISOString() }
    case 'IMPORT_STATE': {
      const next = { ...action.payload, unsaved: false, lastSaved: new Date().toISOString() }
      saveState(next)
      return next
    }
    case 'RESET_STATE': {
      const next = createInitialState()
      saveState(next)
      return next
    }
    default:
      return state
  }
}

interface AdminContextValue {
  state: AdminState
  dispatch: React.Dispatch<AdminAction>
  exportJSON: () => string
  importJSON: (json: string) => boolean
}

const AdminContext = createContext<AdminContextValue | null>(null)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(adminReducer, null, () => loadState() ?? createInitialState())

  useEffect(() => {
    if (state.unsaved) {
      const t = setTimeout(() => {
        dispatch({ type: 'MARK_SAVED' })
        saveState(state)
      }, 800)
      return () => clearTimeout(t)
    }
  }, [state])

  const exportJSON = useCallback(() => {
    const { unsaved, ...rest } = state
    return JSON.stringify(rest, null, 2)
  }, [state])

  const importJSON = useCallback((json: string) => {
    try {
      const parsed = JSON.parse(json)
      const validated = AdminStateSchema.safeParse(parsed)
      if (!validated.success) {
        reportError(
          new Error('Admin import validation failed'),
          { context: 'admin/importJSON', issues: validated.error.issues }
        )
        return false
      }
      dispatch({ type: 'IMPORT_STATE', payload: validated.data as AdminState })
      return true
    } catch (err) {
      reportError(err, { context: 'admin/importJSON' })
      return false
    }
  }, [])

  return (
    <AdminContext.Provider value={{ state, dispatch, exportJSON, importJSON }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider')
  return ctx
}
