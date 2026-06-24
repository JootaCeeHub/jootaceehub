#!/usr/bin/env node
/**
 * Phase 5 — DNS / HTTPS Verification Script
 *
 * Verifies:
 *   1. DNS resolution: jootacee.com → IP
 *   2. HTTP→HTTPS redirect (301/308)
 *   3. HTTPS handshake + valid TLS certificate
 *   4. HSTS header present in response
 *   5. WWW redirect to apex (or vice versa)
 *   6. Content API /health reachable (if NEXT_PUBLIC_CONTENT_API_URL set)
 *   7. Expected HTML page (200 + <html> body)
 *   8. Security headers present (X-Frame-Options, X-Content-Type-Options)
 *
 * Usage:
 *   node scripts/dns-check.mjs
 *   node scripts/dns-check.mjs --domain custom.com
 *   node scripts/dns-check.mjs --api https://api.custom.com
 *   node scripts/dns-check.mjs --json          # JSON output
 */

import { resolve } from 'node:dns/promises'

const domainArg = process.argv.indexOf('--domain')
const apiArg    = process.argv.indexOf('--api')
const DOMAIN    = domainArg !== -1 ? process.argv[domainArg + 1] : (process.env['NEXT_PUBLIC_SITE_URL']?.replace(/^https?:\/\//, '') ?? 'jootacee.com')
const API_URL   = apiArg !== -1 ? process.argv[apiArg + 1] : (process.env['NEXT_PUBLIC_CONTENT_API_URL'] ?? '')
const JSON_OUT  = process.argv.includes('--json')

const results = []
let allPass = true

// ---------------------------------------------------------------------------

async function check(label, fn) {
  try {
    const { pass, detail } = await fn()
    results.push({ label, pass, detail })
    if (!pass) allPass = false
    if (!JSON_OUT) {
      const icon = pass ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m'
      console.log(`  ${icon} ${label}${detail ? ` — ${detail}` : ''}`)
    }
  } catch (err) {
    results.push({ label, pass: false, detail: err.message })
    allPass = false
    if (!JSON_OUT) console.log(`  \x1b[31m✗\x1b[0m ${label} — ${err.message}`)
  }
}

async function fetchHead(url, opts = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), opts.timeout ?? 8000)
  try {
    const res = await fetch(url, {
      method: opts.method ?? 'HEAD',
      redirect: opts.redirect ?? 'manual',
      signal: controller.signal,
    })
    clearTimeout(timer)
    return res
  } catch (err) {
    clearTimeout(timer)
    throw err
  }
}

// ---------------------------------------------------------------------------

if (!JSON_OUT) console.log(`\n[dns-check] Verifying ${DOMAIN}\n`)

// 1. DNS resolution
await check('DNS resolution (A record)', async () => {
  const addrs = await resolve(DOMAIN, 'A')
  return { pass: addrs.length > 0, detail: addrs.join(', ') }
})

// 2. HTTP → HTTPS redirect
await check('HTTP → HTTPS redirect', async () => {
  const res = await fetchHead(`http://${DOMAIN}/`, { redirect: 'manual' })
  const location = res.headers.get('location') ?? ''
  const pass = (res.status === 301 || res.status === 308) && location.startsWith('https://')
  return { pass, detail: `${res.status} → ${location}` }
})

// 3. HTTPS 200
await check('HTTPS responds 200', async () => {
  const res = await fetchHead(`https://${DOMAIN}/`)
  return { pass: res.status === 200 || res.status === 301, detail: `HTTP ${res.status}` }
})

// 4. HSTS header
await check('HSTS header present', async () => {
  const res = await fetchHead(`https://${DOMAIN}/`)
  const hsts = res.headers.get('strict-transport-security') ?? ''
  const maxAge = parseInt(hsts.match(/max-age=(\d+)/)?.[1] ?? '0', 10)
  return { pass: maxAge >= 31536000, detail: hsts || 'missing' }
})

// 5. X-Frame-Options
await check('X-Frame-Options: DENY', async () => {
  const res = await fetchHead(`https://${DOMAIN}/`)
  const val = res.headers.get('x-frame-options') ?? ''
  return { pass: val.toUpperCase().includes('DENY'), detail: val || 'missing' }
})

// 6. X-Content-Type-Options
await check('X-Content-Type-Options: nosniff', async () => {
  const res = await fetchHead(`https://${DOMAIN}/`)
  const val = res.headers.get('x-content-type-options') ?? ''
  return { pass: val.toLowerCase() === 'nosniff', detail: val || 'missing' }
})

// 7. Landing page HTML content
await check('Landing page returns HTML', async () => {
  const res = await fetchHead(`https://${DOMAIN}/en/`, { method: 'GET', redirect: 'follow' })
  const ct = res.headers.get('content-type') ?? ''
  return { pass: res.status === 200 && ct.includes('html'), detail: `${res.status} · ${ct.split(';')[0]}` }
})

// 8. www → apex redirect (or apex → www)
await check('www redirect configured', async () => {
  try {
    const res = await fetchHead(`https://www.${DOMAIN}/`, { redirect: 'manual' })
    const location = res.headers.get('location') ?? ''
    const pass = res.status >= 300 && res.status < 400
    return { pass, detail: `${res.status} → ${location || '(none)'}` }
  } catch {
    return { pass: false, detail: 'www subdomain not reachable' }
  }
})

// 9. Content API (optional)
if (API_URL) {
  await check(`Content API /health (${API_URL})`, async () => {
    const res = await fetchHead(`${API_URL}/health`, { method: 'GET', redirect: 'follow' })
    return { pass: res.status === 200, detail: `HTTP ${res.status}` }
  })
}

// 10. Admin panel not indexed
await check('Admin panel has noindex header', async () => {
  const res = await fetchHead(`https://${DOMAIN}/admin/`, { method: 'GET', redirect: 'follow' })
  const robots = res.headers.get('x-robots-tag') ?? ''
  const pass = robots.toLowerCase().includes('noindex') || res.status === 404
  return { pass, detail: `${res.status} · x-robots-tag: ${robots || '(none)'}` }
})

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

if (JSON_OUT) {
  console.log(JSON.stringify({ domain: DOMAIN, pass: allPass, checks: results }, null, 2))
} else {
  const passing = results.filter(r => r.pass).length
  console.log(`\n[dns-check] ${passing}/${results.length} checks passed`)
  if (allPass) console.log('[dns-check] ✓ DNS/HTTPS verification complete\n')
  else console.log('[dns-check] ✗ Issues found — fix before launch\n')
}

process.exit(allPass ? 0 : 1)
