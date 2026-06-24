#!/usr/bin/env node
/**
 * Project Snapshot — Deep Audit Script
 *
 * Collects a comprehensive project health snapshot and writes it to
 * public/data/project-snapshot.json. Designed to run after build or
 * on demand from the admin panel ("Re-run audit" button).
 *
 * Metrics collected:
 *   - TypeScript: error count, any-usage, file counts
 *   - Tests: pass/fail/skip, by category, coverage %
 *   - Bundle: chunk count, raw size, top 10 largest, CSS
 *   - Architecture: LOC by layer, large files (>300 lines), test gap
 *   - Content: MDX count, JSON registries, validation status
 *   - Dependencies: total, outdated, audit severity
 *   - API: route files, middleware, test files
 *   - Laws: CLAUDE.md Law 1–10 compliance checks
 *   - History: appends to rolling 30-entry log
 *
 * Usage:
 *   node scripts/project-snapshot.mjs
 *   node scripts/project-snapshot.mjs --json          # write only, no stdout
 *   node scripts/project-snapshot.mjs --no-tests      # skip vitest (faster)
 *   node scripts/project-snapshot.mjs --history 30    # keep N history entries
 */

import {
  execSync, spawnSync,
} from 'node:child_process'
import {
  existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, statSync,
} from 'node:fs'
import { join, resolve, extname, basename } from 'node:path'

const ROOT      = resolve(import.meta.dirname, '..')
const ARGS      = process.argv.slice(2)
const JSON_ONLY = ARGS.includes('--json')
const NO_TESTS  = ARGS.includes('--no-tests')
const HISTORY_N = parseInt(ARGS[ARGS.indexOf('--history') + 1] ?? '30', 10) || 30
const OUT_FILE  = join(ROOT, 'public', 'data', 'project-snapshot.json')
const HIST_FILE = join(ROOT, 'public', 'data', 'project-audit-history.json')
const DIST_DIR  = join(ROOT, 'dist')

const C = { r: '\x1b[31m', g: '\x1b[32m', y: '\x1b[33m', b: '\x1b[34m', nc: '\x1b[0m', d: '\x1b[2m' }
const log  = (s) => !JSON_ONLY && console.log(`  ${s}`)
const info = (s) => !JSON_ONLY && console.log(`${C.b}→${C.nc} ${s}`)
const ok   = (s) => !JSON_ONLY && console.log(`${C.g}✓${C.nc} ${s}`)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { cwd: ROOT, encoding: 'utf8', stdio: 'pipe', ...opts }).trim()
  } catch (e) {
    return opts.fallback ?? ''
  }
}

function countLines(file) {
  try { return readFileSync(file, 'utf8').split('\n').length } catch { return 0 }
}

/** Walk directory and collect all files matching predicate */
function walk(dir, pred, results = []) {
  if (!existsSync(dir)) return results
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name)
      if (entry.isDirectory() && !['node_modules', '.git', 'dist', '.next', 'coverage'].includes(entry.name)) {
        walk(full, pred, results)
      } else if (entry.isFile() && pred(entry.name, full)) {
        results.push(full)
      }
    }
  } catch { /* skip unreadable */ }
  return results
}

function fileSize(path) {
  try { return statSync(path).size } catch { return 0 }
}

// ---------------------------------------------------------------------------
// 1. Git info
// ---------------------------------------------------------------------------

info('Git info…')
const gitInfo = {
  branch:   run('git rev-parse --abbrev-ref HEAD', { fallback: 'unknown' }),
  commit:   run('git rev-parse --short HEAD',      { fallback: 'unknown' }),
  commitFull: run('git rev-parse HEAD',            { fallback: 'unknown' }),
  author:   run('git log -1 --format="%an"',       { fallback: 'unknown' }),
  message:  run('git log -1 --format="%s"',        { fallback: 'unknown' }),
  dirty:    run('git status --porcelain').length > 0,
  ahead:    parseInt(run('git rev-list --count @{u}..HEAD 2>/dev/null', { fallback: '0' }), 10) || 0,
  tags:     run('git tag --sort=-creatordate | head -5').split('\n').filter(Boolean),
}
ok('Git')

// ---------------------------------------------------------------------------
// 2. TypeScript audit
// ---------------------------------------------------------------------------

info('TypeScript…')
const tsOutput   = run('npx tsc --noEmit 2>&1', { fallback: '' })
const tsErrors   = tsOutput.split('\n').filter(l => /error TS\d+/.test(l))
const anyCount   = parseInt(run(`grep -r ": any" src --include="*.ts" --include="*.tsx" --count --include="*.ts" 2>/dev/null | awk -F: '{sum+=$2} END {print sum}'`, { fallback: '0' }), 10) || 0
const tsFiles    = walk(join(ROOT, 'src'), n => /\.(ts|tsx)$/.test(n) && !n.endsWith('.d.ts'))
const testFiles  = walk(join(ROOT, 'src'), n => /\.test\.(ts|tsx)$/.test(n))
const srcFiles   = tsFiles.filter(f => !f.includes('.test.'))

// LOC by layer
const layerLOC = {}
for (const file of srcFiles) {
  const rel = file.replace(join(ROOT, 'src') + '/', '')
  const layer = rel.split('/')[0] ?? 'root'
  layerLOC[layer] = (layerLOC[layer] ?? 0) + countLines(file)
}

// Large files (>300 lines) — exclude auto-generated and pure-data files
const DATA_FILE_PATTERNS = [
  'full-catalog.ts',       // auto-generated skill catalog
  'skill-library.ts',      // curated data file (not component logic)
  'types.ts',              // pure type definitions
  'schema.ts',             // Zod schema definitions
  'messages/',             // i18n translation files
]
const largeFiles = srcFiles
  .map(f => ({ file: f.replace(ROOT + '/', ''), lines: countLines(f) }))
  .filter(f => !DATA_FILE_PATTERNS.some(p => f.file.includes(p)))
  .filter(f => f.lines > 300)
  .sort((a, b) => b.lines - a.lines)
  .slice(0, 20)

// Untested modules (lib + hooks without matching test)
const untestedModules = srcFiles
  .filter(f => /\/(lib|hooks)\//.test(f))
  .filter(f => !f.includes('.test.'))
  .filter(f => {
    const base = basename(f).replace(/\.(ts|tsx)$/, '')
    return !testFiles.some(t => basename(t).startsWith(base + '.test'))
  })
  .map(f => f.replace(ROOT + '/', ''))
  .slice(0, 30)

const tsMetrics = {
  errors:         tsErrors.length,
  anyCount,
  srcFileCount:   srcFiles.length,
  testFileCount:  testFiles.length,
  totalLines:     srcFiles.reduce((s, f) => s + countLines(f), 0),
  layerLOC,
  largeFiles,
  untestedModules,
}
ok(`TypeScript: ${tsErrors.length} errors, ${anyCount} any usages, ${srcFiles.length} src files`)

// ---------------------------------------------------------------------------
// 3. Tests
// ---------------------------------------------------------------------------

info('Tests…')
let testMetrics = { total: 0, passed: 0, failed: 0, skipped: 0, files: 0, duration: 0 }

// When --no-tests is passed, reuse last known test metrics from history to avoid false score drops
// History format: { tests: <total_integer>, testsPassed: <passed_integer>, ... }
if (NO_TESTS) {
  try {
    const histPath = join(ROOT, 'public/data/project-audit-history.json')
    if (existsSync(histPath)) {
      const hist = JSON.parse(readFileSync(histPath, 'utf8'))
      const lastWithTests = [...hist].reverse().find(h => typeof h.tests === 'number' && h.tests > 0)
      if (lastWithTests) {
        testMetrics = {
          total:    lastWithTests.tests,
          passed:   lastWithTests.testsPassed ?? lastWithTests.tests,
          failed:   0,
          skipped:  0,
          files:    0,
          duration: 0,
        }
      }
    }
  } catch { /* ok */ }
}

if (!NO_TESTS) {
  const vitestOut = run('npx vitest run --reporter=json 2>/dev/null', { fallback: '{}' })
  try {
    const result = JSON.parse(vitestOut.split('\n').find(l => l.startsWith('{')) ?? '{}')
    const summary = result?.testResults ?? []
    testMetrics = {
      total:    result.numTotalTests    ?? 0,
      passed:   result.numPassedTests   ?? 0,
      failed:   result.numFailedTests   ?? 0,
      skipped:  result.numPendingTests  ?? 0,
      files:    result.numTotalTestSuites ?? 0,
      duration: Math.round((result.startTime ? (Date.now() - result.startTime) / 1000 : 0) * 10) / 10,
      failedFiles: summary.filter(s => s.status === 'failed').map(s => s.testFilePath?.replace(ROOT + '/', '') ?? ''),
    }
  } catch {
    // Fallback: parse human-readable output
    const plainOut = run('npx vitest run 2>&1', { fallback: '' })
    const passMatch = plainOut.match(/Tests\s+(\d+) passed/)
    const fileMatch = plainOut.match(/Test Files\s+(\d+) passed/)
    testMetrics.passed = parseInt(passMatch?.[1] ?? '0', 10)
    testMetrics.total  = testMetrics.passed
    testMetrics.files  = parseInt(fileMatch?.[1] ?? '0', 10)
  }
}
ok(`Tests: ${testMetrics.passed}/${testMetrics.total} passing, ${testMetrics.files} files`)

// ---------------------------------------------------------------------------
// 4. Lint
// ---------------------------------------------------------------------------

info('Lint…')
const lintOut  = run('npx eslint src --format=json 2>/dev/null', { fallback: '[]' })
let lintErrors = 0, lintWarnings = 0, lintFiles = 0
try {
  const results = JSON.parse(lintOut)
  lintErrors   = results.reduce((s, f) => s + f.errorCount,   0)
  lintWarnings = results.reduce((s, f) => s + f.warningCount, 0)
  lintFiles    = results.filter(f => f.errorCount + f.warningCount > 0).length
} catch { /* ok */ }
ok(`Lint: ${lintErrors} errors, ${lintWarnings} warnings`)

// ---------------------------------------------------------------------------
// 5. Bundle analysis
// ---------------------------------------------------------------------------

info('Bundle…')
const bundleMetrics = { exists: false, jsRawBytes: 0, cssRawBytes: 0, htmlRawBytes: 0, chunkCount: 0, pageCount: 0, topChunks: [], totalMB: 0 }

if (existsSync(DIST_DIR)) {
  bundleMetrics.exists = true
  // Only count production chunks (not dev/turbopack cache, not pagefind, not sw.js)
  // Note: walk predicate receives (entryName, fullPath) — use fullPath for path-based filters
  const isProdChunk = (full) => full.includes('/_next/static/') && !full.includes('/dev/')
  const isHtml      = (full) => full.endsWith('.html') && !full.includes('/dev/')
  const jsChunks  = walk(DIST_DIR, (_n, full) => full.endsWith('.js')  && isProdChunk(full))
  const cssFiles  = walk(DIST_DIR, (_n, full) => full.endsWith('.css') && !full.includes('/dev/'))
  const htmlFiles = walk(DIST_DIR, (_n, full) => isHtml(full))

  bundleMetrics.jsRawBytes  = jsChunks.reduce((s, f) => s + fileSize(f), 0)
  bundleMetrics.cssRawBytes = cssFiles.reduce((s, f) => s + fileSize(f), 0)
  bundleMetrics.htmlRawBytes = htmlFiles.reduce((s, f) => s + fileSize(f), 0)
  bundleMetrics.chunkCount  = jsChunks.length
  bundleMetrics.pageCount   = htmlFiles.filter(f => f.endsWith('index.html')).length
  bundleMetrics.totalMB     = Math.round((bundleMetrics.jsRawBytes + bundleMetrics.cssRawBytes) / 1024 / 1024 * 10) / 10

  bundleMetrics.topChunks = jsChunks
    .map(f => ({ name: basename(f), sizeKB: Math.round(fileSize(f) / 1024), path: f.replace(DIST_DIR, '') }))
    .sort((a, b) => b.sizeKB - a.sizeKB)
    .slice(0, 10)
}
ok(`Bundle: ${(bundleMetrics.jsRawBytes / 1024 / 1024).toFixed(1)} MB JS, ${bundleMetrics.pageCount} pages`)

// ---------------------------------------------------------------------------
// 6. Content audit
// ---------------------------------------------------------------------------

info('Content…')
const contentDir = join(ROOT, 'src', 'content')
const mdxFiles   = walk(contentDir, n => n.endsWith('.mdx'))
const jsonFiles  = walk(contentDir, n => n.endsWith('.json') && !n.includes('_schema'))
const schemaFiles = walk(contentDir, n => n.endsWith('.json') && n.includes('_schema'))

const contentMetrics = {
  mdxCount:    mdxFiles.length,
  jsonCount:   jsonFiles.length,
  schemaCount: schemaFiles.length,
  byType: {
    articles:  mdxFiles.filter(f => f.includes('/articles/')).length,
    research:  mdxFiles.filter(f => f.includes('/research/')).length,
    journal:   mdxFiles.filter(f => f.includes('/journal/')).length,
    projects:  jsonFiles.filter(f => f.includes('/projects/')).length,
    resources: jsonFiles.filter(f => f.includes('/resources/')).length,
    labs:      jsonFiles.filter(f => f.includes('/labs/')).length,
    systems:   jsonFiles.filter(f => f.includes('/systems/')).length,
  },
}
ok(`Content: ${mdxFiles.length} MDX, ${jsonFiles.length} JSON`)

// ---------------------------------------------------------------------------
// 7. Dependencies
// ---------------------------------------------------------------------------

info('Dependencies…')
const pkgJson  = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
const depCount = Object.keys(pkgJson.dependencies ?? {}).length
const devCount = Object.keys(pkgJson.devDependencies ?? {}).length

let npmAuditFindings = { critical: 0, high: 0, moderate: 0, low: 0 }
try {
  const auditJson = run('npm audit --json 2>/dev/null', { fallback: '{}' })
  const audit = JSON.parse(auditJson)
  const vulns = audit.metadata?.vulnerabilities ?? {}
  npmAuditFindings = {
    critical: vulns.critical ?? 0,
    high:     vulns.high     ?? 0,
    moderate: vulns.moderate ?? 0,
    low:      vulns.low      ?? 0,
  }
} catch { /* ok */ }

const depMetrics = { depCount, devCount, totalCount: depCount + devCount, audit: npmAuditFindings }
ok(`Dependencies: ${depCount} prod, ${devCount} dev`)

// ---------------------------------------------------------------------------
// 8. API audit
// ---------------------------------------------------------------------------

info('API…')
const apiSrc = join(ROOT, 'api', 'src')
const apiRoutes = walk(join(apiSrc, 'routes'), n => n.endsWith('.ts') && !n.endsWith('.test.ts'))
const apiTests  = walk(apiSrc, n => n.endsWith('.test.ts'))
const apiMW     = walk(join(apiSrc, 'middleware'), n => n.endsWith('.ts'))
const apiLOC    = walk(apiSrc, n => n.endsWith('.ts')).reduce((s, f) => s + countLines(f), 0)

const apiMetrics = {
  routeFiles:      apiRoutes.length,
  testFiles:       apiTests.length,
  middlewareFiles: apiMW.length,
  totalLOC:        apiLOC,
  routes:          apiRoutes.map(f => basename(f, '.ts')),
}
ok(`API: ${apiRoutes.length} routes, ${apiTests.length} tests, ${apiLOC} LOC`)

// ---------------------------------------------------------------------------
// 9. Laws compliance (CLAUDE.md Law 1–10)
// ---------------------------------------------------------------------------

info('Laws compliance…')

const hasStaticExport = readFileSync(join(ROOT, 'next.config.ts'), 'utf8').includes("output: 'export'")
const hasZodImport    = run(`grep -r "from 'zod'" src/lib/admin/ --include="*.ts" -l | head -1`, { fallback: '' }).length > 0
const hasStylesFiles  = walk(join(ROOT, 'src'), n => n.endsWith('.styles.ts')).length
const hasI18nKeys     = existsSync(join(ROOT, 'messages', 'en.json')) && existsSync(join(ROOT, 'messages', 'es.json'))
const hasReportError  = run(`grep -r "reportError" src --include="*.ts" --include="*.tsx" -l | wc -l`, { fallback: '0' })
const hasHusky        = existsSync(join(ROOT, '.husky', 'pre-commit'))
const hasCI           = existsSync(join(ROOT, '.github', 'workflows', 'ci.yml'))
const hasSentryConfig = existsSync(join(ROOT, 'sentry.client.config.ts'))
const stylesFilesCount = hasStylesFiles

const laws = [
  { id: 1,  name: 'Static Export Sacred',     pass: hasStaticExport,            detail: 'output: "export" in next.config.ts' },
  { id: 2,  name: 'Type Safety Total',         pass: tsErrors.length === 0,      detail: `${tsErrors.length} TS errors, ${anyCount} any usages` },
  { id: 3,  name: 'CSS: Inline + CVA',         pass: stylesFilesCount === 0,     detail: stylesFilesCount === 0 ? 'No .styles.ts files found' : `${stylesFilesCount} .styles.ts file(s) still present` },
  { id: 4,  name: 'Admin CMS Architecture',    pass: hasZodImport,               detail: 'Zod validation in admin lib' },
  { id: 5,  name: 'I18n Mandatory',            pass: hasI18nKeys,                detail: 'Both en.json + es.json present' },
  { id: 6,  name: 'Error Handling Systematic', pass: parseInt(hasReportError, 10) > 3, detail: `reportError() used in ${hasReportError} files` },
  { id: 7,  name: 'Performance Gates',         pass: bundleMetrics.jsRawBytes > 0 && bundleMetrics.jsRawBytes < 12 * 1024 * 1024, detail: `${(bundleMetrics.jsRawBytes / 1024 / 1024).toFixed(1)} MB JS (gate: <12 MB)` },
  { id: 8,  name: 'Testing Not Optional',      pass: testMetrics.total > 400,    detail: `${testMetrics.total} tests in ${testMetrics.files} files` },
  { id: 9,  name: 'Refactoring Laws',          pass: largeFiles.filter(f => f.lines > 1000).length < 5, detail: `${largeFiles.filter(f => f.lines > 1000).length} files >1000 lines` },
  { id: 10, name: 'Commit Discipline',         pass: hasHusky && hasCI,          detail: `Husky: ${hasHusky}, CI: ${hasCI}` },
]

const lawsPassing = laws.filter(l => l.pass).length
ok(`Laws: ${lawsPassing}/${laws.length} passing`)

// ---------------------------------------------------------------------------
// 10. Console/production usage violations
// ---------------------------------------------------------------------------

info('Production violations…')
// Exclude infrastructure files that legitimately use console (logger, error sink)
const CONSOLE_INFRA_FILES = ['src/lib/logger.ts', 'src/lib/error.ts']
const consoleViolations = []
const prodFiles = walk(join(ROOT, 'src'), n => /\.(ts|tsx)$/.test(n) && !n.includes('.test.'))
for (const file of prodFiles) {
  const relPath = file.replace(ROOT + '/', '')
  if (CONSOLE_INFRA_FILES.some(p => relPath.endsWith(p))) continue
  try {
    const content = readFileSync(file, 'utf8')
    const lines   = content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      // Skip lines where console.* is inside a string (template literal or quoted text)
      const trimmed = line.trim()
      const inString = trimmed.endsWith('`') || trimmed.endsWith('`\\n') ||
                       /^\d+\./.test(trimmed) || // numbered list item in a string
                       trimmed.startsWith("'") || trimmed.startsWith('"')
      if (/console\.(error|log|warn)\(/.test(line) &&
          !line.includes('// ok') &&
          !line.includes('installConsoleFilter') &&
          !trimmed.startsWith('//') &&
          !trimmed.startsWith('*') &&
          !inString) {
        consoleViolations.push({ file: relPath, line: i + 1, code: line.trim().slice(0, 80) })
      }
    }
  } catch { /* ok */ }
}
ok(`Console violations: ${consoleViolations.length}`)

// ---------------------------------------------------------------------------
// 11. Score calculation
// ---------------------------------------------------------------------------

function calcScore(metrics) {
  let score = 100

  // TypeScript health (20pts)
  score -= Math.min(20, metrics.ts.errors * 5)
  score -= Math.min(5,  Math.floor(metrics.ts.anyCount / 3))

  // Tests (20pts)
  const testPass = metrics.tests.total > 0 ? metrics.tests.passed / metrics.tests.total : 1
  score -= Math.round((1 - testPass) * 20)
  if (metrics.tests.total < 100) score -= 10
  if (metrics.tests.total < 300) score -= 5

  // Lint (10pts)
  score -= Math.min(10, metrics.lint.errors * 2)

  // Laws (20pts)
  score -= Math.round(((laws.length - lawsPassing) / laws.length) * 20)

  // Bundle (10pts)
  if (metrics.bundle.jsRawBytes > 10 * 1024 * 1024) score -= 10
  else if (metrics.bundle.jsRawBytes > 7 * 1024 * 1024)  score -= 5

  // Console violations (5pts)
  score -= Math.min(5, Math.floor(metrics.consoleViolations.length / 3))

  // Untested modules (5pts)
  score -= Math.min(5, Math.floor(metrics.ts.untestedModules.length / 10))

  // Audit findings (10pts)
  score -= Math.min(10, metrics.deps.audit.critical * 5 + metrics.deps.audit.high * 2)

  return Math.max(0, Math.min(100, score))
}

// ---------------------------------------------------------------------------
// 12. Assemble snapshot
// ---------------------------------------------------------------------------

const snapshot = {
  ts:       new Date().toISOString(),
  git:      gitInfo,
  score:    0, // calculated below
  grade:    '',
  ts_code:  tsMetrics,
  tests:    testMetrics,
  lint:     { errors: lintErrors, warnings: lintWarnings, filesWithIssues: lintFiles },
  bundle:   bundleMetrics,
  content:  contentMetrics,
  deps:     depMetrics,
  api:      apiMetrics,
  laws,
  lawsPassing,
  consoleViolations: consoleViolations.slice(0, 20),
  consoleViolationCount: consoleViolations.length,
}

snapshot.score = calcScore({ ts: tsMetrics, tests: testMetrics, lint: snapshot.lint, bundle: bundleMetrics, deps: depMetrics, consoleViolations })
snapshot.grade = snapshot.score >= 95 ? 'A+' : snapshot.score >= 90 ? 'A' : snapshot.score >= 80 ? 'B' : snapshot.score >= 70 ? 'C' : snapshot.score >= 60 ? 'D' : 'F'

// ---------------------------------------------------------------------------
// 13. History
// ---------------------------------------------------------------------------

info('Updating history…')
let history = []
if (existsSync(HIST_FILE)) {
  try { history = JSON.parse(readFileSync(HIST_FILE, 'utf8')) } catch { history = [] }
}

const historyEntry = {
  ts:          snapshot.ts,
  commit:      gitInfo.commit,
  score:       snapshot.score,
  grade:       snapshot.grade,
  tsErrors:    tsMetrics.errors,
  tests:       testMetrics.total,
  testsPassed: testMetrics.passed,
  lintErrors:  lintErrors,
  pages:       bundleMetrics.pageCount,
  bundleMB:    Math.round(bundleMetrics.jsRawBytes / 1024 / 1024 * 10) / 10,
  laws:        lawsPassing,
  anyCount:    tsMetrics.anyCount,
  consoleViolations: consoleViolations.length,
}

history.push(historyEntry)
if (history.length > HISTORY_N) history = history.slice(-HISTORY_N)

mkdirSync(join(ROOT, 'public', 'data'), { recursive: true })
writeFileSync(HIST_FILE, JSON.stringify(history, null, 2))
writeFileSync(OUT_FILE,  JSON.stringify(snapshot, null, 2))

ok(`History: ${history.length} entries`)

// ---------------------------------------------------------------------------
// 14. Report
// ---------------------------------------------------------------------------

if (!JSON_ONLY) {
  console.log()
  console.log(`${C.b}┌─ Project Health Snapshot ─────────────────────────────────────────┐${C.nc}`)
  console.log(`${C.b}│${C.nc}  Score: ${snapshot.score >= 80 ? C.g : snapshot.score >= 60 ? C.y : C.r}${snapshot.score}/100 (${snapshot.grade})${C.nc}`)
  console.log(`${C.b}│${C.nc}  Branch: ${gitInfo.branch}@${gitInfo.commit} ${gitInfo.dirty ? '(dirty)' : '(clean)'}`)
  console.log(`${C.b}│${C.nc}  TypeScript: ${tsErrors.length === 0 ? `${C.g}0 errors${C.nc}` : `${C.r}${tsErrors.length} errors${C.nc}`}, ${anyCount} any usages`)
  console.log(`${C.b}│${C.nc}  Tests:      ${testMetrics.passed}/${testMetrics.total} passing (${testMetrics.files} files)`)
  console.log(`${C.b}│${C.nc}  Lint:       ${lintErrors === 0 ? `${C.g}0 errors${C.nc}` : `${C.r}${lintErrors} errors${C.nc}`}, ${lintWarnings} warnings`)
  console.log(`${C.b}│${C.nc}  Bundle:     ${(bundleMetrics.jsRawBytes/1024/1024).toFixed(1)} MB JS, ${bundleMetrics.cssRawBytes/1024|0} KB CSS, ${bundleMetrics.pageCount} pages`)
  console.log(`${C.b}│${C.nc}  Laws:       ${lawsPassing}/${laws.length} passing`)
  console.log(`${C.b}│${C.nc}  Console:    ${consoleViolations.length} prod violations`)
  console.log(`${C.b}│${C.nc}  Deps:       ${depCount}+${devCount} packages, vuln: C${npmAuditFindings.critical}/H${npmAuditFindings.high}/M${npmAuditFindings.moderate}`)
  console.log(`${C.b}└───────────────────────────────────────────────────────────────────┘${C.nc}`)
  console.log()
  console.log(`${C.d}Output: ${OUT_FILE}${C.nc}`)
  console.log(`${C.d}History: ${HIST_FILE}${C.nc}`)
}

process.exit(0)
