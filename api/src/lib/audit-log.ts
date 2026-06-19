import { randomUUID } from 'node:crypto'
import { appendFile, readFile, mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { env } from '../env.js'
import type { AuditEntry } from '../types.js'

// ---------------------------------------------------------------------------
// Write queue — ensures concurrent writes are serialised (no interleaving).
// ---------------------------------------------------------------------------

let writeQueue: Promise<void> = Promise.resolve()

function enqueue(fn: () => Promise<void>): Promise<void> {
  writeQueue = writeQueue.then(fn).catch(fn)
  return writeQueue
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

type NewAuditEntry = Omit<AuditEntry, 'id' | 'ts'>

/**
 * Appends a single audit entry to the NDJSON log file.
 *
 * - Generates `id` (UUID v4) and `ts` (ISO-8601 now) automatically.
 * - Creates the log directory and file if they do not exist.
 * - Thread-safe: writes are serialised through an in-memory promise queue.
 */
export async function appendAudit(entry: NewAuditEntry): Promise<void> {
  const full: AuditEntry = {
    id: randomUUID(),
    ts: new Date().toISOString(),
    ...entry,
  }

  const line = JSON.stringify(full) + '\n'

  await enqueue(async () => {
    const logPath = env.AUDIT_LOG_PATH
    await mkdir(dirname(logPath), { recursive: true })
    await appendFile(logPath, line, 'utf-8')
  })
}

// ---------------------------------------------------------------------------
// Read / filter
// ---------------------------------------------------------------------------

export interface ReadAuditOptions {
  limit?: number
  type?: string      // filter by `action` prefix (e.g. "content", "git")
  actor?: string     // exact match on `actor`
  since?: string     // ISO-8601 lower bound for `ts`
}

/**
 * Reads the audit log and returns entries matching the given filters.
 * Entries are returned in reverse-chronological order (newest first).
 */
export async function readAudit(opts: ReadAuditOptions = {}): Promise<AuditEntry[]> {
  const { limit = 50, type, actor, since } = opts
  const logPath = env.AUDIT_LOG_PATH

  let raw: string
  try {
    raw = await readFile(logPath, 'utf-8')
  } catch (err) {
    // File does not exist yet — return empty list
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw err
  }

  const sinceMs = since ? new Date(since).getTime() : 0

  const entries: AuditEntry[] = raw
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line) as AuditEntry
      } catch {
        return null
      }
    })
    .filter((e): e is AuditEntry => e !== null)
    .filter((e) => {
      if (type && !e.action.startsWith(type)) return false
      if (actor && e.actor !== actor) return false
      if (sinceMs && new Date(e.ts).getTime() < sinceMs) return false
      return true
    })
    .reverse()          // newest first
    .slice(0, limit)

  return entries
}
