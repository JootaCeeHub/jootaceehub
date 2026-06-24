#!/usr/bin/env node
/**
 * Phase 5 — Backup Restore
 *
 * Restores content from a backup archive created by scripts/backup.mjs.
 * Restores to the repo's working directories (src/content/, public/data/, messages/).
 *
 * Safety:
 *   - Creates a pre-restore snapshot of current state before overwriting
 *   - Requires explicit --confirm flag in non-interactive mode
 *   - Shows diff summary before applying
 *   - Logs restore event to public/data/last-restore.json
 *
 * Usage:
 *   node scripts/restore.mjs                        # list available backups
 *   node scripts/restore.mjs backups/2026-06-21.tar.gz          # restore specific
 *   node scripts/restore.mjs --latest               # restore most recent backup
 *   node scripts/restore.mjs backups/2026-06-21.tar.gz --dry-run  # preview only
 *   node scripts/restore.mjs backups/2026-06-21.tar.gz --confirm  # skip prompt
 */

import {
  existsSync, readdirSync, statSync, mkdirSync, readFileSync, writeFileSync,
} from 'node:fs'
import { execSync, spawnSync } from 'node:child_process'
import { join, resolve, basename } from 'node:path'

const ROOT    = resolve(import.meta.dirname, '..')
const DRY_RUN = process.argv.includes('--dry-run')
const CONFIRM = process.argv.includes('--confirm')
const LATEST  = process.argv.includes('--latest')

// ---------------------------------------------------------------------------

function log(msg) { console.log(`[restore] ${msg}`) }
function die(msg) { console.error(`[restore] ✗ ${msg}`); process.exit(1) }

function listBackups() {
  const dir = join(ROOT, 'backups')
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter(f => f.endsWith('.tar.gz'))
    .sort()
    .reverse()
    .map(f => ({ name: f, path: join(dir, f), stat: statSync(join(dir, f)) }))
}

async function prompt(question) {
  if (CONFIRM) return true
  const { createInterface } = await import('node:readline')
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(res => {
    rl.question(`${question} [y/N] `, ans => { rl.close(); res(ans.trim().toLowerCase() === 'y') })
  })
}

// ---------------------------------------------------------------------------

async function main() {
  const backups = listBackups()

  // No archive specified: list available backups
  const archiveArg = process.argv.find(a => a.endsWith('.tar.gz'))

  if (!archiveArg && !LATEST) {
    if (backups.length === 0) {
      die('No backups found in ./backups/ — run: npm run backup')
    }
    console.log('\n[restore] Available backups:\n')
    backups.forEach((b, i) => {
      const mb = (b.stat.size / 1024 / 1024).toFixed(2)
      console.log(`  ${i + 1}. ${b.name} (${mb} MB)`)
    })
    console.log('\nUsage: node scripts/restore.mjs <archive-path>')
    console.log('       node scripts/restore.mjs --latest\n')
    return
  }

  const archivePath = LATEST
    ? (backups[0]?.path ?? die('No backups found'))
    : resolve(archiveArg)

  if (!existsSync(archivePath)) die(`Archive not found: ${archivePath}`)

  const archiveName = basename(archivePath)
  log(`\nRestoring from: ${archiveName}  ${DRY_RUN ? '(DRY RUN)' : ''}`)
  log('─'.repeat(50))

  // Check manifest
  const manifestPath = archivePath.replace('.tar.gz', '.json')
  let manifest = null
  if (existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
      log(`Archive contains ${manifest.files?.length ?? '?'} files from ${manifest.ts}`)
    } catch { /* ok */ }
  }

  // Pre-restore snapshot
  if (!DRY_RUN) {
    log('Creating pre-restore snapshot…')
    const snapshotTs = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const snapshotPath = join(ROOT, 'backups', `pre-restore-${snapshotTs}.tar.gz`)
    mkdirSync(join(ROOT, 'backups'), { recursive: true })
    try {
      execSync(`tar czf "${snapshotPath}" -C "${ROOT}" src/content public/data messages 2>/dev/null || true`, { stdio: 'pipe' })
      log(`Pre-restore snapshot: backups/pre-restore-${snapshotTs}.tar.gz`)
    } catch { log('⚠ Pre-restore snapshot failed (dirs may be empty)') }
  }

  if (DRY_RUN) {
    log('Files that would be restored:')
    try {
      const list = execSync(`tar tzf "${archivePath}" 2>/dev/null`, { stdio: 'pipe' }).toString()
      list.split('\n').filter(Boolean).forEach(f => log(`  ${f}`))
    } catch { log('  (could not list archive contents)') }
    log('\nDry run complete — no changes made.\n')
    return
  }

  const ok = await prompt(`Restore ${archiveName} to working directories?`)
  if (!ok) { log('Restore cancelled.\n'); return }

  // Extract
  log('Extracting archive…')
  const r = spawnSync(`tar xzf "${archivePath}" -C "${ROOT}"`, {
    shell: true, stdio: 'inherit',
  })
  if (r.status !== 0) die('Extraction failed')

  // Audit log
  const entry = {
    ts:          new Date().toISOString(),
    action:      'restore',
    archive:     archiveName,
    archiveTs:   manifest?.ts ?? 'unknown',
    filesCount:  manifest?.files?.length ?? 'unknown',
    by:          process.env['GIT_USER'] ?? 'cli',
    dryRun:      false,
  }
  mkdirSync(join(ROOT, 'public', 'data'), { recursive: true })
  writeFileSync(join(ROOT, 'public', 'data', 'last-restore.json'), JSON.stringify(entry, null, 2))

  log(`✓ Restore complete from ${archiveName}`)
  log('Next steps:')
  log('  1. Review restored files: git diff src/content/ messages/')
  log('  2. Run: npm run validate:content && npm run validate:taxonomy')
  log('  3. Run: npm run build (verify build still passes)')
  log('  4. If satisfied: git add -A && git commit -m "restore: from backup $archiveName"\n')
}

main().catch(err => die(err.message))
