'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useRef, useCallback } from 'react'
import { apiBuildStatus } from '@/lib/api/build'
import type { BuildJob } from '@/lib/api/types'

/**
 * Polls /build/status/:jobId every `intervalMs` ms until the job reaches
 * a terminal state (done | failed) or `maxPolls` iterations are exhausted.
 *
 * Returns null while the jobId is absent or the first poll is pending.
 */
export function useBuildStatus(
  jobId: string | null | undefined,
  intervalMs = 3000,
  maxPolls = 120,
): { job: BuildJob | null; polling: boolean } {
  const [job, setJob] = useState<BuildJob | null>(null)
  const [polling, setPolling] = useState(false)
  const pollCount = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const stop = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null
    setPolling(false)
  }, [])

  useEffect(() => {
    if (!jobId) {
      setJob(null)
      stop()
      return
    }

    pollCount.current = 0
    setPolling(true)

    const poll = async () => {
      pollCount.current++
      try {
        const res = await apiBuildStatus(jobId)
        if (res.success && res.data) {
          setJob(res.data)
          const terminal = res.data.status === 'done' || res.data.status === 'failed'
          if (terminal || pollCount.current >= maxPolls) {
            stop()
            return
          }
        }
      } catch {
        // network error — keep polling
      }

      if (pollCount.current < maxPolls) {
        timerRef.current = setTimeout(() => { void poll() }, intervalMs)
      } else {
        stop()
      }
    }

    void poll()

    return stop
  }, [jobId, intervalMs, maxPolls, stop])

  return { job, polling }
}
