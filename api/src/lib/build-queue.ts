import { randomUUID } from 'node:crypto'
import { spawn } from 'node:child_process'
import { join } from 'node:path'
import { atomicDeploy } from './atomic-deploy.js'
import { env } from '../env.js'
import type { BuildJob, BuildStatus } from '../types.js'

// ---------------------------------------------------------------------------
// In-memory store
// ---------------------------------------------------------------------------

const jobs = new Map<string, BuildJob>()
let isBuilding = false

// Ordered list of job IDs so we can return history in insertion order
const jobOrder: string[] = []

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function now(): string {
  return new Date().toISOString()
}

function updateJob(id: string, patch: Partial<BuildJob>): void {
  const job = jobs.get(id)
  if (job) jobs.set(id, { ...job, ...patch })
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Creates a new build job and returns it immediately.
 * Does NOT start the build — call `runBuild()` after.
 */
export function enqueue(reason = ''): BuildJob {
  const job: BuildJob = {
    id: randomUUID(),
    ts: now(),
    reason,
    status: 'queued',
    startedAt: null,
    completedAt: null,
    exitCode: null,
    log: [],
  }
  jobs.set(job.id, job)
  jobOrder.push(job.id)

  // Trim history to last 50 jobs
  if (jobOrder.length > 50) {
    const removed = jobOrder.shift()
    if (removed) jobs.delete(removed)
  }

  return job
}

/**
 * Returns a job by ID, or undefined if not found.
 */
export function getJob(jobId: string): BuildJob | undefined {
  return jobs.get(jobId)
}

/**
 * Returns the last N completed jobs (newest first).
 */
export function getHistory(limit = 10): BuildJob[] {
  return [...jobOrder]
    .reverse()
    .slice(0, limit)
    .map((id) => jobs.get(id))
    .filter((j): j is BuildJob => j !== undefined)
}

/**
 * Checks whether a build is currently running.
 */
export function isBuildRunning(): boolean {
  return isBuilding
}

/**
 * Runs `npm run build` in REPO_ROOT, streams output into the job log,
 * then calls atomicDeploy on success.
 *
 * Only one build runs at a time. Returns immediately (fire-and-forget).
 */
export function runBuild(jobId: string, repoRoot: string): void {
  if (isBuilding) {
    updateJob(jobId, {
      status: 'failed' as BuildStatus,
      completedAt: now(),
      exitCode: -1,
      log: ['REJECTED: Another build is already in progress'],
    })
    return
  }

  isBuilding = true
  updateJob(jobId, { status: 'building', startedAt: now() })

  const addLog = (line: string) => {
    const job = jobs.get(jobId)
    if (job) {
      job.log.push(line)
    }
  }

  const distPath = join(repoRoot, 'dist')

  const child = spawn('npm', ['run', 'build'], {
    cwd: repoRoot,
    env: { ...process.env, NODE_ENV: 'production' },
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  child.stdout.setEncoding('utf-8')
  child.stderr.setEncoding('utf-8')

  child.stdout.on('data', (chunk: string) => {
    chunk.split('\n').filter(Boolean).forEach(addLog)
  })

  child.stderr.on('data', (chunk: string) => {
    chunk.split('\n').filter(Boolean).forEach((line) => addLog(`[stderr] ${line}`))
  })

  child.on('close', (code) => {
    isBuilding = false
    const exitCode = code ?? -1

    if (exitCode === 0) {
      atomicDeploy(distPath)
        .then((deployResult) => {
          addLog(`[deploy] Atomic deploy complete: ${deployResult.from ?? 'initial'} → ${deployResult.to}`)
          updateJob(jobId, {
            status: 'done',
            completedAt: now(),
            exitCode: 0,
          })
        })
        .catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : String(err)
          addLog(`[deploy] ERROR: ${msg}`)
          updateJob(jobId, {
            status: 'failed',
            completedAt: now(),
            exitCode: 0,  // build succeeded but deploy failed
          })
        })
    } else {
      addLog(`[build] Process exited with code ${exitCode}`)
      updateJob(jobId, {
        status: 'failed',
        completedAt: now(),
        exitCode,
      })
    }
  })

  child.on('error', (err) => {
    isBuilding = false
    addLog(`[spawn] ERROR: ${err.message}`)
    updateJob(jobId, {
      status: 'failed',
      completedAt: now(),
      exitCode: -1,
    })
  })
}
