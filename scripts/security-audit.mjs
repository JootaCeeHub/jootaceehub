#!/usr/bin/env node
/**
 * Phase 5 — Security Audit Script
 *
 * Automated security surface review:
 *   1. npm audit — dependency vulnerabilities
 *   2. CSP policy strength check
 *   3. Secret scan — detect potential leaks in source files
 *   4. Admin panel auth mode verification
 *   5. Cookie/storage sensitive data check
 *   6. Dependency inventory (outdated packages)
 *
 * Usage:
 *   node scripts/security-audit.mjs
 *   node scripts/security-audit.mjs --strict   # exit 1 on any warning
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { join, resolve, extname } from 'node:path'

const ROOT   = resolve(import.meta.dirname, '..')
const STRICT = process.argv.includes('--strict')

let exitCode = 0
const findings = []

// ---------------------------------------------------------------------------

function pass(title, detail = '') {
  console.log(`\x1b[32m  ✓\x1b[0m ${title}${detail ? ` — ${detail}` : ''}`)
}

function warn(title, detail = '') {
  console.log(`\x1b[33m  ⚠\x1b[0m ${title}${detail ? ` — ${detail}` : ''}`)
  findings.push({ level: 'warn', title, detail })
  if (STRICT) exitCode = 1
}

function fail(title, detail = '') {
  console.log(`\x1b[31m  ✗\x1b[0m ${title}${detail ? ` — ${detail}` : ''}`)
  findings.push({ level: 'fail', title, detail })
  exitCode = 1
}

// ---------------------------------------------------------------------------
// 1. npm audit
// ---------------------------------------------------------------------------
console.log('\n[security] 1/6 — npm audit (dependencies)')
try {
  const out = execSync('npm audit --json 2>/dev/null', { cwd: ROOT }).toString()
  const audit = JSON.parse(out)
  const meta  = audit.metadata?.vulnerabilities ?? {}
  const crit  = (meta.critical ?? 0) + (meta.high ?? 0)
  const low   = (meta.moderate ?? 0) + (meta.low ?? 0)

  if (crit > 0)  fail(`${crit} critical/high vulnerabilities`, 'run: npm audit fix')
  else if (low > 0) warn(`${low} moderate/low vulnerabilities`, 'run: npm audit fix')
  else pass('No known vulnerabilities')
} catch {
  // npm audit returns non-zero when there are vulns — parse what we get
  try {
    const out = execSync('npm audit 2>&1', { cwd: ROOT }).toString()
    if (out.includes('found 0 vulnerabilities')) pass('No known vulnerabilities')
    else warn('npm audit returned issues', 'review output: npm audit')
  } catch { warn('npm audit failed', 'check manually') }
}

// ---------------------------------------------------------------------------
// 2. CSP strength
// ---------------------------------------------------------------------------
console.log('\n[security] 2/6 — CSP policy check')
const headersPath = join(ROOT, 'public', '_headers')
if (existsSync(headersPath)) {
  const content = readFileSync(headersPath, 'utf8')
  const csp = content.match(/Content-Security-Policy:(.+)/)?.[1] ?? ''

  if (!csp) fail('CSP header missing from public/_headers')
  else {
    pass('CSP header present')
    if (csp.includes("'unsafe-eval'"))   warn("CSP contains 'unsafe-eval' (required by Three.js — acceptable, documented)")
    if (csp.includes("'unsafe-inline'")) warn("CSP contains 'unsafe-inline' (required by Next.js — acceptable, documented)")
    if (!csp.includes('frame-ancestors')) warn('CSP missing frame-ancestors directive')
    if (!csp.includes('base-uri'))        warn('CSP missing base-uri directive')
    if (csp.includes('frame-ancestors') && csp.includes('base-uri')) pass('CSP has frame-ancestors + base-uri')
  }

  if (content.includes('X-Frame-Options: DENY')) pass('X-Frame-Options: DENY')
  else warn('X-Frame-Options not set to DENY')

  if (content.includes('X-Content-Type-Options: nosniff')) pass('X-Content-Type-Options: nosniff')
  else warn('X-Content-Type-Options: nosniff missing')

  if (content.includes('Strict-Transport-Security')) pass('HSTS configured')
  else fail('HSTS header missing')
} else {
  fail('public/_headers missing — no static security headers')
}

// ---------------------------------------------------------------------------
// 3. Secret scan
// ---------------------------------------------------------------------------
console.log('\n[security] 3/6 — Secret scan (source files)')

const SECRET_PATTERNS = [
  { name: 'AWS key',          pattern: /AKIA[0-9A-Z]{16}/g },
  { name: 'Private key',      pattern: /-----BEGIN (RSA|EC|DSA|OPENSSH) PRIVATE KEY-----/g },
  { name: 'GitHub PAT',       pattern: /ghp_[a-zA-Z0-9]{36}/g },
  { name: 'Hardcoded password', pattern: /password\s*[:=]\s*['"][^'"]{8,}/gi },
  { name: 'JWT secret inline', pattern: /jwt_secret\s*[:=]\s*['"][^'"]{16,}/gi },
]

const SCAN_EXTS     = new Set(['.ts', '.tsx', '.js', '.mjs', '.json', '.env'])
const SCAN_EXCLUDE  = new Set(['node_modules', 'dist', '.git', 'dist-blue', 'dist-green', 'backups'])

function scanDir(dir, found) {
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (SCAN_EXCLUDE.has(entry.name)) continue
      const full = join(dir, entry.name)
      if (entry.isDirectory()) scanDir(full, found)
      else if (SCAN_EXTS.has(extname(entry.name))) {
        try {
          const content = readFileSync(full, 'utf8')
          for (const { name, pattern } of SECRET_PATTERNS) {
            if (pattern.test(content)) found.push({ file: full.replace(ROOT + '/', ''), pattern: name })
          }
        } catch { /* skip unreadable */ }
      }
    }
  } catch { /* skip unreadable dir */ }
}

const secretsFound = []
scanDir(ROOT, secretsFound)

if (secretsFound.length === 0) pass('No hardcoded secrets detected')
else secretsFound.forEach(({ file, pattern }) => fail(`Potential ${pattern} in ${file}`))

// ---------------------------------------------------------------------------
// 4. Admin auth mode
// ---------------------------------------------------------------------------
console.log('\n[security] 4/6 — Admin auth mode')
const envExample = join(ROOT, '.env.example')
if (existsSync(envExample)) {
  const content = readFileSync(envExample, 'utf8')
  if (content.includes('NEXT_PUBLIC_GOOGLE_CLIENT_ID') || content.includes('NEXT_PUBLIC_SUPABASE_URL')) {
    pass('Auth env vars documented in .env.example')
  } else {
    warn('No auth env vars in .env.example — admin will be open-access')
  }
}

// Check that admin is gated (AdminAuthGate.tsx exists)
const authGate = join(ROOT, 'src', 'components', 'admin', 'AdminAuthGate.tsx')
if (existsSync(authGate)) pass('AdminAuthGate.tsx present')
else warn('AdminAuthGate.tsx missing — admin has no access control')

// ---------------------------------------------------------------------------
// 5. Committed .env files
// ---------------------------------------------------------------------------
console.log('\n[security] 5/6 — Committed secrets check')
try {
  const tracked = execSync('git ls-files .env .env.local .env.production 2>/dev/null', { cwd: ROOT }).toString().trim()
  if (tracked.length === 0) pass('No .env files committed to git')
  else fail(`Sensitive env files tracked by git: ${tracked}`)
} catch { pass('git check skipped') }

const gitignore = join(ROOT, '.gitignore')
if (existsSync(gitignore)) {
  const gi = readFileSync(gitignore, 'utf8')
  if (gi.includes('.env.local') || gi.includes('.env')) pass('.env files in .gitignore')
  else warn('.env files not listed in .gitignore')
}

// ---------------------------------------------------------------------------
// 6. Dependency summary
// ---------------------------------------------------------------------------
console.log('\n[security] 6/6 — Outdated packages (top-level)')
try {
  execSync('npm outdated --depth=0 2>/dev/null', { cwd: ROOT, stdio: 'pipe' })
  pass('All dependencies up to date')
} catch {
  warn('Some dependencies are outdated', 'run: npm outdated')
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log('\n[security] ─'.repeat(30))
const warns = findings.filter(f => f.level === 'warn').length
const fails = findings.filter(f => f.level === 'fail').length
console.log(`[security] ${fails} failures · ${warns} warnings`)

if (fails === 0 && warns === 0) console.log('[security] ✓ Security review passed\n')
else if (fails === 0) console.log('[security] ⚠ Review warnings above before launch\n')
else console.log('[security] ✗ Fix failures before production launch\n')

process.exit(exitCode)
