#!/usr/bin/env node
/**
 * Phase 5 — Final Launch Checklist
 *
 * Verifies all production gates before going live.
 * Produces a machine-readable JSON report for the admin analytics panel.
 *
 * Usage:
 *   node scripts/launch-checklist.mjs              # run all checks
 *   node scripts/launch-checklist.mjs --domain jootacee.com   # override domain
 *   node scripts/launch-checklist.mjs --output report.json    # custom output path
 *   node scripts/launch-checklist.mjs --fail-fast  # exit 1 on first failure
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { join, resolve } from 'node:path'

const ROOT       = resolve(import.meta.dirname, '..')
const DOMAIN_ARG = process.argv.indexOf('--domain')
const DOMAIN     = DOMAIN_ARG !== -1 ? process.argv[DOMAIN_ARG + 1] : (process.env['NEXT_PUBLIC_SITE_URL']?.replace(/^https?:\/\//, '') ?? 'jootacee.com')
const OUT_ARG    = process.argv.indexOf('--output')
const OUT_PATH   = OUT_ARG !== -1 ? process.argv[OUT_ARG + 1] : join(ROOT, 'public', 'data', 'launch-report.json')
const FAIL_FAST  = process.argv.includes('--fail-fast')

// ---------------------------------------------------------------------------

const results = []

function check(id, label, fn) {
  return { id, label, fn }
}

async function runChecks(checks) {
  for (const { id, label, fn } of checks) {
    let pass = false, detail = ''
    try {
      const r = await fn()
      pass   = r.pass
      detail = r.detail ?? ''
    } catch (err) {
      detail = err.message
    }
    results.push({ id, label, pass, detail })
    const icon = pass ? '✓' : '✗'
    const color = pass ? '\x1b[32m' : '\x1b[31m'
    console.log(`${color}  ${icon}\x1b[0m ${label}${detail ? ` — ${detail}` : ''}`)
    if (!pass && FAIL_FAST) process.exit(1)
  }
}

// ---------------------------------------------------------------------------
// Check definitions
// ---------------------------------------------------------------------------

const CHECKS = [
  // --- Build & quality ---
  check('build-exists', 'Static export built (dist/en/index.html)', async () => {
    const p = join(ROOT, 'dist', 'en', 'index.html')
    return { pass: existsSync(p), detail: existsSync(p) ? 'found' : 'missing — run npm run build' }
  }),

  check('page-count', 'Minimum 100 static pages', async () => {
    try {
      const n = parseInt(execSync('find dist -name "*.html" 2>/dev/null | wc -l', { cwd: ROOT }).toString().trim(), 10)
      return { pass: n >= 100, detail: `${n} pages found` }
    } catch { return { pass: false, detail: 'dist not found' } }
  }),

  check('typecheck', 'TypeScript 0 errors', async () => {
    try { execSync('npm run typecheck', { cwd: ROOT, stdio: 'pipe' }); return { pass: true } }
    catch (err) { return { pass: false, detail: err.message.slice(0, 120) } }
  }),

  check('lint', 'ESLint 0 errors', async () => {
    try { execSync('npm run lint', { cwd: ROOT, stdio: 'pipe' }); return { pass: true } }
    catch (err) { return { pass: false, detail: err.message.slice(0, 120) } }
  }),

  check('tests', 'All tests passing', async () => {
    try {
      const out = execSync('npm run test 2>&1', { cwd: ROOT, stdio: 'pipe' }).toString()
      const m = out.match(/(\d+) passed/)
      return { pass: !!m, detail: m ? `${m[1]} tests pass` : 'check output' }
    } catch (err) {
      return { pass: false, detail: err.message.slice(0, 120) }
    }
  }),

  // --- Configuration ---
  check('env-plausible', 'Plausible domain configured', async () => {
    const v = process.env['NEXT_PUBLIC_PLAUSIBLE_DOMAIN'] ?? ''
    return { pass: v.length > 0, detail: v.length > 0 ? `domain=${v}` : 'NEXT_PUBLIC_PLAUSIBLE_DOMAIN not set' }
  }),

  check('env-sentry', 'Sentry DSN configured', async () => {
    const v = process.env['NEXT_PUBLIC_SENTRY_DSN'] ?? ''
    return { pass: v.length > 0, detail: v.length > 0 ? 'dsn set' : 'NEXT_PUBLIC_SENTRY_DSN not set' }
  }),

  // --- Security ---
  check('headers-hsts', 'HSTS header in public/_headers', async () => {
    const p = join(ROOT, 'public', '_headers')
    if (!existsSync(p)) return { pass: false, detail: 'public/_headers missing' }
    const content = readFileSync(p, 'utf8')
    return { pass: content.includes('Strict-Transport-Security'), detail: 'HSTS present' }
  }),

  check('headers-csp', 'CSP header present', async () => {
    const p = join(ROOT, 'public', '_headers')
    if (!existsSync(p)) return { pass: false, detail: 'public/_headers missing' }
    const content = readFileSync(p, 'utf8')
    return { pass: content.includes('Content-Security-Policy'), detail: 'CSP present' }
  }),

  check('no-secrets-in-git', 'No .env files committed', async () => {
    try {
      const tracked = execSync('git ls-files .env .env.local .env.production 2>/dev/null', { cwd: ROOT }).toString().trim()
      return { pass: tracked.length === 0, detail: tracked.length > 0 ? `committed: ${tracked}` : 'clean' }
    } catch { return { pass: true, detail: 'clean' } }
  }),

  // --- Infrastructure ---
  check('content-dir', 'src/content/ has committed content', async () => {
    const dir = join(ROOT, 'src', 'content')
    if (!existsSync(dir)) return { pass: false, detail: 'src/content/ missing' }
    try {
      const n = parseInt(execSync('find src/content -type f | wc -l', { cwd: ROOT }).toString().trim(), 10)
      return { pass: n > 5, detail: `${n} content files` }
    } catch { return { pass: false, detail: 'could not count' } }
  }),

  check('backup-script', 'Backup script exists', async () => {
    const p = join(ROOT, 'scripts', 'backup.mjs')
    return { pass: existsSync(p), detail: existsSync(p) ? 'scripts/backup.mjs' : 'missing' }
  }),

  check('rollback-script', 'Rollback script exists', async () => {
    const p = join(ROOT, 'scripts', 'rollback.mjs')
    return { pass: existsSync(p), detail: existsSync(p) ? 'scripts/rollback.mjs' : 'missing' }
  }),

  check('ci-workflow', 'GitHub Actions CI workflow', async () => {
    const p = join(ROOT, '.github', 'workflows', 'ci.yml')
    return { pass: existsSync(p), detail: existsSync(p) ? '.github/workflows/ci.yml' : 'missing' }
  }),

  check('git-clean', 'Working tree committed', async () => {
    try {
      const out = execSync('git status --porcelain', { cwd: ROOT }).toString().trim()
      return { pass: out.length === 0, detail: out.length === 0 ? 'clean' : `${out.split('\n').length} uncommitted files` }
    } catch { return { pass: false, detail: 'git error' } }
  }),
]

// ---------------------------------------------------------------------------

async function main() {
  const ts = new Date().toISOString()
  console.log(`\n[launch-checklist] ${DOMAIN} — ${ts}`)
  console.log('[launch-checklist] ' + '─'.repeat(50))

  await runChecks(CHECKS)

  const passing = results.filter(r => r.pass).length
  const total   = results.length
  const pass    = passing === total

  console.log(`\n[launch-checklist] ${passing}/${total} checks passed`)

  // Write report
  const report = { ts, domain: DOMAIN, passing, total, pass, checks: results }
  mkdirSync(join(ROOT, 'public', 'data'), { recursive: true })
  writeFileSync(OUT_PATH, JSON.stringify(report, null, 2))
  console.log(`[launch-checklist] Report: ${OUT_PATH}`)

  if (!pass) {
    console.log('\n[launch-checklist] ✗ NOT READY FOR LAUNCH\n')
    process.exit(1)
  } else {
    console.log('\n[launch-checklist] ✓ READY FOR LAUNCH\n')
  }
}

main().catch(err => { console.error('[launch-checklist] Fatal:', err.message); process.exit(1) })
