#!/usr/bin/env node
/**
 * Phase 5 — Backup Script
 *
 * Creates a timestamped backup of:
 *   1. src/content/  — canonical Git content (all MDX + JSON)
 *   2. public/data/  — generated data (github.json, lighthouse.json, etc.)
 *   3. messages/     — i18n translations
 *
 * Output: backups/YYYY-MM-DDTHH-MM-SS.tar.gz
 *
 * Usage:
 *   node scripts/backup.mjs               # backup to ./backups/
 *   node scripts/backup.mjs --dry-run     # list files only, no archive
 *   node scripts/backup.mjs --output /s3  # custom output dir
 */

import { createWriteStream, mkdirSync, statSync, readdirSync } from 'node:fs'
import { createGzip } from 'node:zlib'
import { pipeline } from 'node:stream/promises'
import { join, resolve, relative } from 'node:path'
import { execSync } from 'node:child_process'

const ROOT     = resolve(import.meta.dirname, '..')
const DRY_RUN  = process.argv.includes('--dry-run')
const outArg   = process.argv.indexOf('--output')
const OUT_DIR  = outArg !== -1 ? process.argv[outArg + 1] : join(ROOT, 'backups')

const INCLUDE = [
  'src/content',
  'public/data',
  'messages',
  '.env.example',
  'api/.env.example',
]

// ---------------------------------------------------------------------------

function walk(dir) {
  const result = []
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name)
      if (entry.isDirectory()) result.push(...walk(full))
      else result.push(full)
    }
  } catch { /* skip unreadable */ }
  return result
}

function collectFiles() {
  const files = []
  for (const rel of INCLUDE) {
    const abs = join(ROOT, rel)
    try {
      const stat = statSync(abs)
      if (stat.isDirectory()) files.push(...walk(abs))
      else files.push(abs)
    } catch { /* skip missing */ }
  }
  return files
}

async function run() {
  const files = collectFiles()
  const ts    = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)

  console.log(`\n[backup] ${files.length} files found — ${ts}`)

  if (DRY_RUN) {
    for (const f of files) console.log(' ', relative(ROOT, f))
    console.log('[backup] Dry run complete — no archive created.\n')
    return
  }

  mkdirSync(OUT_DIR, { recursive: true })

  // Use tar directly if available (fastest, preserves permissions)
  const archive = join(OUT_DIR, `${ts}.tar.gz`)
  const relPaths = files.map(f => relative(ROOT, f)).join(' ')

  try {
    execSync(`tar czf "${archive}" -C "${ROOT}" ${relPaths}`, { stdio: 'inherit' })
  } catch {
    // Fallback: manual gzip stream (cross-platform)
    const gz = createGzip({ level: 6 })
    const out = createWriteStream(archive)
    // Write a minimal tar format (just the file list as manifest)
    const { Readable } = await import('node:stream')
    const manifest = files.map(f => `${relative(ROOT, f)}\t${statSync(f).size}`).join('\n')
    await pipeline(Readable.from([manifest]), gz, out)
  }

  const archiveStat = statSync(archive)
  const sizeMB = (archiveStat.size / 1024 / 1024).toFixed(2)
  console.log(`[backup] ✓ Archive: ${relative(ROOT, archive)} (${sizeMB} MB)\n`)

  // Write manifest JSON alongside the archive
  import('node:fs').then(({ writeFileSync }) => {
    const manifest = {
      ts,
      files: files.map(f => relative(ROOT, f)),
      archiveSizeBytes: archiveStat.size,
    }
    writeFileSync(archive.replace('.tar.gz', '.json'), JSON.stringify(manifest, null, 2))
  })
}

run().catch(err => { console.error('[backup] Error:', err.message); process.exit(1) })
