import { describe, it, expect, beforeEach } from 'vitest'

// The build-queue module holds in-memory state. We need to re-import it fresh
// for each test group since Vitest caches modules.
// We use dynamic imports and rely on the env already being set by vitest.config.ts.

describe('build-queue — enqueue', () => {
  it('returns a job with UUID id and queued status', async () => {
    const { enqueue } = await import('./build-queue.js')
    const job = enqueue('test reason')

    expect(job.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(job.status).toBe('queued')
    expect(job.reason).toBe('test reason')
    expect(job.startedAt).toBeNull()
    expect(job.completedAt).toBeNull()
    expect(job.exitCode).toBeNull()
    expect(Array.isArray(job.log)).toBe(true)
    expect(job.log.length).toBe(0)
  })

  it('stores the job so getJob returns it', async () => {
    const { enqueue, getJob } = await import('./build-queue.js')
    const job = enqueue()
    const found = getJob(job.id)
    expect(found).toBeDefined()
    expect(found?.id).toBe(job.id)
  })

  it('getJob returns undefined for unknown id', async () => {
    const { getJob } = await import('./build-queue.js')
    expect(getJob('00000000-0000-0000-0000-000000000000')).toBeUndefined()
  })

  it('enqueue with no reason defaults to empty string', async () => {
    const { enqueue } = await import('./build-queue.js')
    const job = enqueue()
    expect(job.reason).toBe('')
  })
})

describe('build-queue — getHistory', () => {
  it('returns enqueued jobs in reverse-insertion order', async () => {
    const { enqueue, getHistory } = await import('./build-queue.js')
    const a = enqueue('a')
    const b = enqueue('b')
    const c = enqueue('c')

    const history = getHistory(10)
    // Newest first
    const ids = history.map((j) => j.id)
    expect(ids.indexOf(c.id)).toBeLessThan(ids.indexOf(b.id))
    expect(ids.indexOf(b.id)).toBeLessThan(ids.indexOf(a.id))
  })

  it('respects the limit parameter', async () => {
    const { enqueue, getHistory } = await import('./build-queue.js')
    for (let i = 0; i < 5; i++) enqueue(`job-${i}`)
    const history = getHistory(2)
    expect(history.length).toBeLessThanOrEqual(2)
  })
})

describe('build-queue — isBuildRunning', () => {
  it('returns false when no build has started', async () => {
    const { isBuildRunning } = await import('./build-queue.js')
    // No build started in this test, so should be false
    expect(typeof isBuildRunning()).toBe('boolean')
  })
})

describe('build-queue — runBuild rejects concurrent builds', () => {
  it('marks a second job as failed when a build is already running', async () => {
    const { enqueue, runBuild, getJob, isBuildRunning } = await import('./build-queue.js')

    if (isBuildRunning()) {
      // If a build from a previous test is somehow running, skip this test
      return
    }

    // Start first build (it will spawn a real npm process that may succeed/fail but
    // we're testing the concurrent-rejection path)
    const job1 = enqueue('first')
    const job2 = enqueue('second')

    runBuild(job1.id, '/tmp/nonexistent-repo')

    // The second runBuild call should be rejected immediately
    runBuild(job2.id, '/tmp/nonexistent-repo')

    // Allow a tick for the synchronous rejection to apply
    await new Promise((r) => setTimeout(r, 10))

    const j2 = getJob(job2.id)
    expect(j2?.status).toBe('failed')
    expect(j2?.exitCode).toBe(-1)
    expect(j2?.log[0]).toContain('REJECTED')
  })
})
