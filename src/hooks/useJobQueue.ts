/**
 * React hook wrapping the admin job queue (CmsJob[]).
 * Dispatches JOB_ADD / JOB_UPDATE / JOB_CANCEL / JOB_CLEAR_DONE.
 * Jobs are persisted automatically by the admin store in localStorage.
 */
'use client'

import { useCallback, useMemo } from 'react'
import { useAdmin } from '@/lib/admin/store'
import type { CmsJob, CmsJobType } from '@/lib/admin/types'

export type AddJobPayload = Omit<CmsJob, 'id' | 'createdAt' | 'attempts'>

export interface UseJobQueueReturn {
  jobs: CmsJob[]
  pending: CmsJob[]
  running: CmsJob[]
  done: CmsJob[]
  failed: CmsJob[]
  addJob: (payload: AddJobPayload) => void
  updateJob: (id: string, data: Partial<CmsJob>) => void
  cancelJob: (id: string) => void
  clearDone: () => void
  /** Mark a job as started (running) with the current timestamp. */
  startJob: (id: string) => void
  /** Mark a job done with optional result payload. */
  completeJob: (id: string, result?: Record<string, unknown>) => void
  /** Mark a job failed with an error message. */
  failJob: (id: string, error: string) => void
  /** Count of jobs by type still active (pending | running). */
  activeCountByType: (type: CmsJobType) => number
}

export function useJobQueue(): UseJobQueueReturn {
  const { state, dispatch } = useAdmin()
  const jobs = useMemo(() => state.jobQueue ?? [], [state.jobQueue])

  const addJob = useCallback(
    (payload: AddJobPayload) => dispatch({ type: 'JOB_ADD', payload }),
    [dispatch],
  )

  const updateJob = useCallback(
    (id: string, data: Partial<CmsJob>) => dispatch({ type: 'JOB_UPDATE', payload: { id, data } }),
    [dispatch],
  )

  const cancelJob = useCallback(
    (id: string) => dispatch({ type: 'JOB_CANCEL', payload: id }),
    [dispatch],
  )

  const clearDone = useCallback(
    () => dispatch({ type: 'JOB_CLEAR_DONE' }),
    [dispatch],
  )

  const startJob = useCallback(
    (id: string) =>
      dispatch({
        type: 'JOB_UPDATE',
        payload: { id, data: { status: 'running', startedAt: new Date().toISOString() } },
      }),
    [dispatch],
  )

  const completeJob = useCallback(
    (id: string, result?: Record<string, unknown>) =>
      dispatch({
        type: 'JOB_UPDATE',
        payload: {
          id,
          data: {
            status: 'done',
            completedAt: new Date().toISOString(),
            ...(result ? { result } : {}),
          },
        },
      }),
    [dispatch],
  )

  const failJob = useCallback(
    (id: string, error: string) =>
      dispatch({
        type: 'JOB_UPDATE',
        payload: { id, data: { status: 'failed', completedAt: new Date().toISOString(), error } },
      }),
    [dispatch],
  )

  const activeCountByType = useCallback(
    (type: CmsJobType) =>
      jobs.filter(j => j.type === type && (j.status === 'pending' || j.status === 'running')).length,
    [jobs],
  )

  return {
    jobs,
    pending: jobs.filter(j => j.status === 'pending'),
    running: jobs.filter(j => j.status === 'running'),
    done: jobs.filter(j => j.status === 'done'),
    failed: jobs.filter(j => j.status === 'failed'),
    addJob,
    updateJob,
    cancelJob,
    clearDone,
    startJob,
    completeJob,
    failJob,
    activeCountByType,
  }
}
