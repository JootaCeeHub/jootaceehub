import { readlink, cp } from 'node:fs/promises'
import { stat } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { resolve } from 'node:path'
import { env } from '../env.js'

const execFileAsync = promisify(execFile)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type Slot = 'blue' | 'green'

/**
 * Reads the current symlink and determines which slot (blue/green) is active.
 * Returns null if the symlink does not exist yet.
 */
export async function getCurrentSlot(): Promise<Slot | null> {
  try {
    const target = await readlink(env.NGINX_ROOT)
    const resolvedTarget = resolve(target)

    if (resolvedTarget === resolve(env.DIST_BLUE)) return 'blue'
    if (resolvedTarget === resolve(env.DIST_GREEN)) return 'green'

    // Symlink exists but points somewhere unexpected
    return null
  } catch {
    // Symlink does not exist
    return null
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface DeployResult {
  from: Slot | null
  to: Slot
  timestamp: string
}

/**
 * Performs a blue-green atomic deploy:
 *
 * 1. Determines the currently active slot.
 * 2. Selects the INACTIVE slot as the new target.
 * 3. Copies `distPath` into the inactive slot directory.
 * 4. Atomically updates the Nginx symlink to point at the new slot.
 *
 * The symlink update is "atomic" in that it uses an intermediate temp symlink
 * and renames it (simulated here via unlink + symlink, which is non-atomic on
 * Linux but safe for our single-writer scenario). For true atomic swaps use
 * `ln -sf` via execa — not done here to avoid an extra dependency.
 */
export async function atomicDeploy(distPath: string): Promise<DeployResult> {
  const currentSlot = await getCurrentSlot()
  const nextSlot: Slot = currentSlot === 'blue' ? 'green' : 'blue'
  const nextSlotPath = nextSlot === 'blue' ? env.DIST_BLUE : env.DIST_GREEN

  // Ensure the source dist directory exists
  const srcStat = await stat(distPath).catch(() => null)
  if (!srcStat || !srcStat.isDirectory()) {
    throw new Error(`distPath "${distPath}" does not exist or is not a directory`)
  }

  // Copy dist/ into the inactive slot
  await cp(distPath, nextSlotPath, { recursive: true, force: true })

  // Update the Nginx symlink atomically via `ln -sfn`.
  // `ln -sfn` calls rename(2) internally — atomic on Linux, safe under concurrent readers.
  await execFileAsync('ln', ['-sfn', nextSlotPath, env.NGINX_ROOT])

  return {
    from: currentSlot,
    to: nextSlot,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Rolls back to the previously active slot by swapping the symlink back.
 * Only valid when the current slot is known (symlink exists and points to blue or green).
 */
export async function rollbackDeploy(): Promise<DeployResult> {
  const currentSlot = await getCurrentSlot()
  if (!currentSlot) {
    throw new Error('Cannot rollback: symlink not found or does not point to a known slot')
  }

  const prevSlot: Slot = currentSlot === 'blue' ? 'green' : 'blue'
  const prevSlotPath = prevSlot === 'blue' ? env.DIST_BLUE : env.DIST_GREEN

  // Verify the previous slot directory exists before swapping
  const prevStat = await stat(prevSlotPath).catch(() => null)
  if (!prevStat || !prevStat.isDirectory()) {
    throw new Error(
      `Rollback target "${prevSlotPath}" does not exist. Was there a previous deploy?`,
    )
  }

  await execFileAsync('ln', ['-sfn', prevSlotPath, env.NGINX_ROOT])

  return {
    from: currentSlot,
    to: prevSlot,
    timestamp: new Date().toISOString(),
  }
}
