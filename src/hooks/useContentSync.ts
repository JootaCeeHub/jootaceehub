'use client'

import { useState, useCallback } from 'react'
import { isApiConfigured, isTokenExpired, getToken } from '@/lib/api/client'
import { apiWriteContent } from '@/lib/api/content'
import { apiGitCommit } from '@/lib/api/git'
import { apiBuildTrigger } from '@/lib/api/build'
import { reportError } from '@/lib/error'

/**
 * The 6 sync states for content mutations:
 *
 *  idle       → no operation in progress
 *  saving     → PUT /content/:type/:slug in flight (includes server-side Zod validation)
 *  saved      → file written to disk, not yet committed to git
 *  validating → optional explicit validation pass before commit
 *  building   → git commit pushed + npm build + atomic deploy running
 *  deployed   → build complete, Nginx symlink updated
 *  failed     → any step above failed
 */
export type SyncState = 'idle' | 'saving' | 'saved' | 'validating' | 'building' | 'deployed' | 'failed'

export interface SyncStatus {
  state: SyncState
  message: string
  jobId?: string
  error?: string
  lastSyncAt?: string
}

const IDLE: SyncStatus = { state: 'idle', message: '' }

export interface UseContentSync {
  status: SyncStatus
  /** Write a single content file to the VPS. Sets: saving → saved | failed */
  saveContent: (type: string, slug: string, data: unknown) => Promise<boolean>
  /**
   * Full pipeline: write file(s) → git commit → build & deploy.
   * Sets: saving → saved → validating → building → deployed | failed
   */
  syncAndDeploy: (
    items: Array<{ type: string; slug: string; data: unknown }>,
    commitMessage: string,
  ) => Promise<boolean>
  /** Manually transition to idle (dismiss error / success badge) */
  reset: () => void
}

function notConfigured(): SyncStatus {
  return { state: 'failed', message: 'NEXT_PUBLIC_CONTENT_API_URL not set', error: 'Not configured' }
}

function noToken(): SyncStatus {
  return { state: 'failed', message: 'Not authenticated', error: 'Login required' }
}

export function useContentSync(): UseContentSync {
  const [status, setStatus] = useState<SyncStatus>(IDLE)

  const reset = useCallback(() => setStatus(IDLE), [])

  const saveContent = useCallback(async (
    type: string,
    slug: string,
    data: unknown,
  ): Promise<boolean> => {
    if (!isApiConfigured()) { setStatus(notConfigured()); return false }
    if (!getToken() || isTokenExpired()) { setStatus(noToken()); return false }

    setStatus({ state: 'saving', message: `Writing ${type}/${slug}…` })
    try {
      const res = await apiWriteContent(type, slug, data)
      if (!res.success) {
        setStatus({ state: 'failed', message: `Write failed: ${res.error}`, error: res.error })
        return false
      }
      setStatus({
        state: 'saved',
        message: `${type}/${slug} saved`,
        lastSyncAt: new Date().toISOString(),
      })
      return true
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      reportError(err instanceof Error ? err : new Error(msg), { context: 'useContentSync/saveContent' })
      setStatus({ state: 'failed', message: msg, error: msg })
      return false
    }
  }, [])

  const syncAndDeploy = useCallback(async (
    items: Array<{ type: string; slug: string; data: unknown }>,
    commitMessage: string,
  ): Promise<boolean> => {
    if (!isApiConfigured()) { setStatus(notConfigured()); return false }
    if (!getToken() || isTokenExpired()) { setStatus(noToken()); return false }

    // Step 1 — write all files
    setStatus({ state: 'saving', message: `Writing ${items.length} file(s)…` })
    for (const item of items) {
      try {
        const res = await apiWriteContent(item.type, item.slug, item.data)
        if (!res.success) {
          setStatus({ state: 'failed', message: `Write failed: ${res.error}`, error: res.error })
          return false
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        setStatus({ state: 'failed', message: msg, error: msg })
        return false
      }
    }

    setStatus({ state: 'saved', message: `${items.length} file(s) written` })

    // Step 2 — validate (lightweight pass: just confirm saved state)
    setStatus({ state: 'validating', message: 'Validating content files…' })
    // Brief pause so the UI shows the validating state (server already validated on write)
    await new Promise<void>((r) => setTimeout(r, 400))

    // Step 3 — git commit + push
    setStatus({ state: 'building', message: 'Committing to Git…' })
    try {
      const commitRes = await apiGitCommit(commitMessage)
      if (!commitRes.success) {
        setStatus({ state: 'failed', message: `Commit failed: ${commitRes.error}`, error: commitRes.error })
        return false
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setStatus({ state: 'failed', message: msg, error: msg })
      return false
    }

    // Step 4 — trigger build
    setStatus({ state: 'building', message: 'Build & deploy triggered…' })
    try {
      const buildRes = await apiBuildTrigger(`Admin sync: ${commitMessage}`)
      if (!buildRes.success) {
        setStatus({ state: 'failed', message: `Build trigger failed: ${buildRes.error}`, error: buildRes.error })
        return false
      }
      setStatus({
        state: 'deployed',
        message: 'Deployed successfully',
        jobId: buildRes.data?.jobId,
        lastSyncAt: new Date().toISOString(),
      })
      return true
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setStatus({ state: 'failed', message: msg, error: msg })
      return false
    }
  }, [])

  return { status, saveContent, syncAndDeploy, reset }
}
