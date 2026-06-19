'use client'

import { useCallback, useState } from 'react'
import { isApiConfigured, isTokenExpired, getToken } from '@/lib/api/client'
import { apiWriteContent } from '@/lib/api/content'
import { apiGitCommit } from '@/lib/api/git'
import { reportError } from '@/lib/error'

/**
 * Content types that map 1:1 to VPS API + src/content/ directories.
 * AdminState registry arrays are serialized as one JSON file per item (by slug).
 */
export type VPSContentType = 'projects' | 'labs' | 'systems' | 'research'

export interface TypeSyncState {
  syncing: boolean
  lastSync: string | null
  error: string | null
  pushed: number
}

export interface UseVPSWrite {
  /**
   * Push all items of a content type to the VPS API.
   * Each item is written as `/<type>/<slug>.json`.
   * If `commitAfter` is true, a git commit is triggered after all writes succeed.
   * Returns true on success, false on any error.
   */
  push: (
    type: VPSContentType,
    items: Array<{ slug: string } & Record<string, unknown>>,
    commitAfter?: boolean,
  ) => Promise<boolean>

  /** Push a single item (e.g. from a panel's Save button). No commit. */
  pushOne: (
    type: VPSContentType,
    item: { slug: string } & Record<string, unknown>,
  ) => Promise<boolean>

  syncState: Record<VPSContentType, TypeSyncState>
  isConfigured: boolean
}

const INITIAL: TypeSyncState = { syncing: false, lastSync: null, error: null, pushed: 0 }

export function useVPSWrite(): UseVPSWrite {
  const [syncState, setSyncState] = useState<Record<VPSContentType, TypeSyncState>>({
    projects: { ...INITIAL },
    labs:     { ...INITIAL },
    systems:  { ...INITIAL },
    research: { ...INITIAL },
  })

  const push = useCallback(async (
    type: VPSContentType,
    items: Array<{ slug: string } & Record<string, unknown>>,
    commitAfter = false,
  ): Promise<boolean> => {
    if (!isApiConfigured() || !getToken() || isTokenExpired()) return false

    setSyncState(prev => ({ ...prev, [type]: { ...prev[type], syncing: true, error: null } }))

    let pushed = 0
    for (const item of items) {
      try {
        const res = await apiWriteContent(type, item.slug, item)
        if (!res.success) {
          setSyncState(prev => ({ ...prev, [type]: { ...prev[type], syncing: false, error: res.error ?? 'Write failed' } }))
          return false
        }
        pushed++
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        reportError(err instanceof Error ? err : new Error(msg), { context: `useVPSWrite/push/${type}` })
        setSyncState(prev => ({ ...prev, [type]: { ...prev[type], syncing: false, error: msg } }))
        return false
      }
    }

    if (commitAfter) {
      try {
        await apiGitCommit(`chore: admin sync ${type} (${pushed} items)`)
      } catch { /* non-fatal — files written, commit can be done separately */ }
    }

    setSyncState(prev => ({
      ...prev,
      [type]: { syncing: false, lastSync: new Date().toISOString(), error: null, pushed },
    }))
    return true
  }, [])

  const pushOne = useCallback(async (
    type: VPSContentType,
    item: { slug: string } & Record<string, unknown>,
  ): Promise<boolean> => {
    return push(type, [item], false)
  }, [push])

  return {
    push,
    pushOne,
    syncState,
    isConfigured: isApiConfigured(),
  }
}
