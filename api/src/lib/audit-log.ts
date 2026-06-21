import { randomUUID } from 'node:crypto'
import { appendFile, readFile, rename, stat, mkdir } from 'node:fs/promises'
import { dirname, extname, basename } from 'node:path'
import { env } from '../env.js'
import type { AuditEntry } from '../types.js'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

// Rotate the log file once it exceeds 5 MB. Keeps up to 3 rotated archives.
const MAX_LOG_BYTES = 5 * 1024 * 1024
const MAX_ARCHIVES  = 3

// ---------------------------------------------------------------------------
// Write queue — ensures concurrent writes are serialised (no interleaving).
// ---------------------------------------------------------------------------

let writeQueue: Promise<void> = Promise.resolve()

function enqueue(fn: () => Promise<void>): Promise<void> {
  writeQueue = writeQueue.then(fn).catch(fn)
  return writeQueue
}

// ---------------------------------------------------------------------------
// Rotation helper
// ---------------------------------------------------------------------------

/**
 * Rotates `logPath` when it exceeds MAX_LOG_BYTES.
 * Existing archives are shifted: .1 → .2 → .3; oldest (.MAX_ARCHIVES) is dropped.
 * Called inside the write queue — never runs concurrently.
 */
async function maybeRotate(logPath: string): Promise<void> {
  let info
  try {
    info = await stat(logPath)
  } catch {
    return  // File doesn't exist yet — nothing to rotate
  }

  if (info.size < MAX_LOG_BYTES) return

  const dir  = dirname(logPath)
  const base = basename(logPath, extname(logPath))
  const ext  = extname(logPath)

  // Shift archives: .3 dropped, .2→.3, .1→.2, current→.1
  for (let i = MAX_ARCHIVES; i >= 1; i--) {
    const src  = i === 1 ? logPath : `${dir}/${base}.${i - 1}${ext}`
    const dest = `${dir}/${base}.${i}${ext}`
    try {
      await rename(src, dest)
    } catch {
      // Archive may not exist yet — skip
    }
  }
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
 * - Rotates the log when it exceeds MAX_LOG_BYTES (size-based, not time-based).
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
    await maybeRotate(logPath)
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
