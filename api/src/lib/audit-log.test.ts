import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtemp, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

describe('audit-log — appendAudit + readAudit', () => {
  let tmp: string

  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), 'jootacee-audit-'))
    const envMod = await import('../env.js')
    ;(envMod.env as Record<string, string>).AUDIT_LOG_PATH = join(tmp, 'logs', 'audit.ndjson')
  })

  afterEach(async () => {
    await rm(tmp, { recursive: true, force: true })
  })

  it('readAudit returns empty array when log does not exist', async () => {
    const { readAudit } = await import('./audit-log.js')
    const entries = await readAudit()
    expect(entries).toEqual([])
  })

  it('appendAudit creates the log file and writes a valid NDJSON entry', async () => {
    const { appendAudit, readAudit } = await import('./audit-log.js')
    await appendAudit({ action: 'content.write', actor: 'admin', detail: 'articles/hello' })
    const entries = await readAudit()
    expect(entries.length).toBe(1)
    expect(entries[0]!.action).toBe('content.write')
    expect(entries[0]!.actor).toBe('admin')
    expect(entries[0]!.detail).toBe('articles/hello')
    expect(entries[0]!.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(entries[0]!.ts).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it('readAudit returns entries newest-first', async () => {
    const { appendAudit, readAudit } = await import('./audit-log.js')
    await appendAudit({ action: 'content.write', actor: 'admin', detail: 'first' })
    // Small delay so timestamps differ
    await new Promise((r) => setTimeout(r, 5))
    await appendAudit({ action: 'content.write', actor: 'admin', detail: 'second' })

    const entries = await readAudit()
    expect(entries[0]!.detail).toBe('second')
    expect(entries[1]!.detail).toBe('first')
  })

  it('readAudit filters by action prefix', async () => {
    const { appendAudit, readAudit } = await import('./audit-log.js')
    await appendAudit({ action: 'content.write', actor: 'admin', detail: 'a' })
    await appendAudit({ action: 'git.commit',    actor: 'admin', detail: 'b' })
    await appendAudit({ action: 'content.delete', actor: 'admin', detail: 'c' })

    const contentEntries = await readAudit({ type: 'content' })
    expect(contentEntries.length).toBe(2)
    expect(contentEntries.every((e) => e.action.startsWith('content'))).toBe(true)
  })

  it('readAudit filters by actor', async () => {
    const { appendAudit, readAudit } = await import('./audit-log.js')
    await appendAudit({ action: 'content.write', actor: 'alice', detail: 'x' })
    await appendAudit({ action: 'content.write', actor: 'bob',   detail: 'y' })

    const aliceEntries = await readAudit({ actor: 'alice' })
    expect(aliceEntries.length).toBe(1)
    expect(aliceEntries[0]!.actor).toBe('alice')
  })

  it('readAudit respects limit', async () => {
    const { appendAudit, readAudit } = await import('./audit-log.js')
    for (let i = 0; i < 5; i++) {
      await appendAudit({ action: `test.${i}`, actor: 'admin', detail: String(i) })
    }
    const entries = await readAudit({ limit: 3 })
    expect(entries.length).toBe(3)
  })

  it('readAudit filters by since timestamp', async () => {
    const { appendAudit, readAudit } = await import('./audit-log.js')
    const before = new Date().toISOString()
    await new Promise((r) => setTimeout(r, 10))
    await appendAudit({ action: 'content.write', actor: 'admin', detail: 'after' })

    const entries = await readAudit({ since: before })
    expect(entries.length).toBe(1)
    expect(entries[0]!.detail).toBe('after')
  })
})

describe('audit-log — rotation', () => {
  let tmp: string

  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), 'jootacee-audit-rot-'))
    const envMod = await import('../env.js')
    ;(envMod.env as Record<string, string>).AUDIT_LOG_PATH = join(tmp, 'audit.ndjson')
  })

  afterEach(async () => {
    await rm(tmp, { recursive: true, force: true })
  })

  it('does not rotate a small log file', async () => {
    const { appendAudit, readAudit } = await import('./audit-log.js')
    await appendAudit({ action: 'test.small', actor: 'admin', detail: 'x' })
    const entries = await readAudit()
    expect(entries.length).toBe(1)
    // No rotation file should exist for a tiny log
    const { readdir } = await import('node:fs/promises')
    const files = await readdir(tmp)
    expect(files.filter((f) => f.endsWith('.ndjson')).length).toBe(1)
  })

  it('rotates the log when it exceeds MAX_LOG_BYTES (5MB)', async () => {
    const { appendFile, mkdir } = await import('node:fs/promises')
    const envMod = await import('../env.js')
    const logPath = (envMod.env as Record<string, string>).AUDIT_LOG_PATH

    // Pre-fill with 5MB+ of data so the NEXT append triggers rotation
    await mkdir(tmp, { recursive: true })
    const bigLine = 'x'.repeat(1024) + '\n'
    const fivePointOneMB = 5.1 * 1024 * 1024
    let written = 0
    while (written < fivePointOneMB) {
      await appendFile(logPath, bigLine, 'utf-8')
      written += bigLine.length
    }

    // Now append one more entry — this should trigger rotation
    const { appendAudit } = await import('./audit-log.js')
    await appendAudit({ action: 'test.rotate', actor: 'admin', detail: 'triggers rotation' })

    // The original log should now be small (just the new entry)
    // and an archive (.1.ndjson) should exist
    const { readdir } = await import('node:fs/promises')
    const files = await readdir(tmp)
    const ndjsonFiles = files.filter((f) => f.includes('.ndjson'))
    expect(ndjsonFiles.length).toBeGreaterThanOrEqual(2)
    expect(ndjsonFiles.some((f) => f.includes('.1'))).toBe(true)
  })
})
