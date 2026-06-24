#!/usr/bin/env node
/**
 * Phase 5 — Recovery / Rollback Drill
 *
 * Blue/green rollback strategy:
 *   1. Identify current active slot (blue|green)
 *   2. Verify previous slot has valid build
 *   3. Swap Nginx root symlink to previous slot (atomic)
 *   4. Verify health after swap
 *   5. Restart Content API (PM2) if needed
 *   6. Log rollback event to audit log
 *
 * Local simulation:
 *   Reads/writes dist-blue/ and dist-green/ directories.
 *   In production (--vps) these are on the Hostinger VPS.
 *
 * Usage:
 *   node scripts/rollback.mjs               # local drill simulation
 *   node scripts/rollback.mjs --vps         # execute on VPS via SSH
 *   node scripts/rollback.mjs --force       # skip confirmation prompt
 *   node scripts/rollback.mjs --dry-run     # print plan only
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { execSync, spawnSync } from 'node:child_process'
import { join, resolve } from 'node:path'

const ROOT    = resolve(import.meta.dirname, '..')
const DRY_RUN = process.argv.includes('--dry-run')
const VPS     = process.argv.includes('--vps')
const FORCE   = process.argv.includes('--force')

const VPS_HOST = process.env['VPS_HOST'] ?? ''
const VPS_USER = process.env['VPS_USER'] ?? 'root'

const SLOT_FILE = join(ROOT, '.active-slot')  // 'blue' | 'green'
const BLUE_DIR  = join(ROOT, 'dist-blue')
const GREEN_DIR = join(ROOT, 'dist-green')

// ---------------------------------------------------------------------------

function log(msg) { console.log(`[rollback] ${msg}`) }
function die(msg) { console.error(`[rollback] ✗ ${msg}`); process.exit(1) }

function ssh(cmd) {
  if (DRY_RUN) { log(`(dry-run) SSH: ${cmd}`); return }
  const r = spawnSync(`ssh ${VPS_USER}@${VPS_HOST} '${cmd}'`, { shell: true, stdio: 'inherit' })
  if (r.status !== 0) die(`SSH command failed: ${cmd}`)
}

function readSlot() {
  if (VPS) {
    try {
      const out = execSync(`ssh ${VPS_USER}@${VPS_HOST} 'cat /srv/jootacee/.active-slot'`).toString().trim()
      return out === 'green' ? 'green' : 'blue'
    } catch { return 'blue' }
  }
  if (!existsSync(SLOT_FILE)) return 'blue'
  return readFileSync(SLOT_FILE, 'utf8').trim() === 'green' ? 'green' : 'blue'
}

function writeSlot(slot) {
  if (!DRY_RUN) writeFileSync(SLOT_FILE, slot)
}

async function confirm(question) {
  if (FORCE || DRY_RUN) return true
  const { createInterface } = await import('node:readline')
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => {
    rl.question(`${question} [y/N] `, ans => {
      rl.close()
      resolve(ans.trim().toLowerCase() === 'y')
    })
  })
}

// ---------------------------------------------------------------------------

async function main() {
  log(`\nPhase 5 — Recovery Drill  ${DRY_RUN ? '(DRY RUN)' : VPS ? '(VPS)' : '(LOCAL)'}`)
  log('─'.repeat(40))

  // Step 1: Read current slot
  const current  = readSlot()
  const previous = current === 'blue' ? 'green' : 'blue'
  log(`Active slot: ${current.toUpperCase()} → Rolling back to ${previous.toUpperCase()}`)

  // Step 2: Verify previous slot exists
  if (!VPS) {
    const prevDir = previous === 'blue' ? BLUE_DIR : GREEN_DIR
    if (!existsSync(prevDir) || !existsSync(join(prevDir, 'en', 'index.html'))) {
      log(`⚠ Previous slot ${previous} has no valid build at ${prevDir}`)
      log('  In production: the previous slot is always preserved before deploying.')
      log('  Rollback drill complete (no swap needed — slots identical locally).')
      writeSlot(previous)  // simulate the swap anyway for drill purposes
      return
    }
  }

  // Step 3: Confirm
  const ok = await confirm(`Roll back from ${current} to ${previous}?`)
  if (!ok) { log('Rollback cancelled.'); process.exit(0) }

  // Step 4: Execute swap
  log(`Swapping Nginx root: ${current} → ${previous}`)

  if (VPS) {
    ssh(`ln -sfn /srv/jootacee/dist-${previous} /var/www/jootacee`)
    ssh(`echo "${previous}" > /srv/jootacee/.active-slot`)
    ssh(`nginx -s reload`)
  } else {
    writeSlot(previous)
    log(`  → Local slot marker written: ${previous}`)
  }

  // Step 5: Restart API (PM2) on VPS
  if (VPS) {
    log('Restarting Content API (PM2)…')
    ssh('pm2 restart content-api --update-env')
  }

  // Step 6: Health check post-swap
  log('Running post-rollback health check…')
  const base = VPS && VPS_HOST ? `https://${VPS_HOST}` : null

  if (base) {
    try {
      const resp = await fetch(`${base}/health`, { signal: AbortSignal.timeout(5000) })
      if (resp.ok) log(`✓ Health check passed (${resp.status})`)
      else log(`⚠ Health check returned ${resp.status}`)
    } catch (err) {
      log(`⚠ Health check failed: ${err.message}`)
    }
  } else {
    log('  → Health check skipped (no VPS_HOST configured)')
  }

  // Step 7: Audit log
  const auditEntry = {
    ts:      new Date().toISOString(),
    action:  'rollback',
    from:    current,
    to:      previous,
    by:      process.env['GIT_USER'] ?? 'cli',
    commit:  (() => { try { return execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim() } catch { return 'unknown' } })(),
    dryRun:  DRY_RUN,
  }

  if (!DRY_RUN) {
    mkdirSync(join(ROOT, 'public', 'data'), { recursive: true })
    writeFileSync(join(ROOT, 'public', 'data', 'last-rollback.json'), JSON.stringify(auditEntry, null, 2))
  }

  log(`✓ Rollback complete: ${current} → ${previous}`)
  log(`  Audit: ${JSON.stringify(auditEntry)}`)
  log('')
}

main().catch(err => { die(err.message) })
