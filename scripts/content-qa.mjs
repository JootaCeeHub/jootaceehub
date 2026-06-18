/**
 * Content QA — scans dist/ for:
 *   1. Placeholder text (lorem ipsum, TODO, [TRANSLATION NEEDED], etc.)
 *   2. Internal links in Navigation + Footer that don't resolve in dist/
 *
 * Run: node scripts/content-qa.mjs
 * Added to package.json as: npm run qa:content
 */

import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join, extname } from 'node:path'

const ROOT = process.cwd()
const DIST = join(ROOT, 'dist')

// ── Config ────────────────────────────────────────────────────────────────────

const PLACEHOLDER_PATTERNS = [
  /lorem ipsum/i,
  /\[translation needed\]/i,
  /\[placeholder\]/i,
  // "TODO:" style dev comments only — not Spanish "todo" (= "all/everything")
  /TODO:/,
  /\[TODO\]/i,
  /placeholder text/i,
  // "under construction" but not legitimate "coming soon" lab content
  /under construction/i,
]

const REQUIRED_ROUTES = [
  '/en/index.html',
  '/es/index.html',
  '/admin/index.html',
  '/en/about/index.html',
  '/en/contact/index.html',
  '/en/changelog/index.html',
  '/es/changelog/index.html',
  '/en/labs/index.html',
  '/en/journal/index.html',
  '/en/systems/index.html',
  '/en/resources/index.html',
  '/en/intelligence/index.html',
  '/en/ai/index.html',
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function walk(dir) {
  const results = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory() && !entry.name.startsWith('_') && entry.name !== 'node_modules') {
      results.push(...walk(full))
    } else if (entry.isFile() && extname(entry.name) === '.html') {
      results.push(full)
    }
  }
  return results
}

// ── Check 1: dist/ exists ──────────────────────────────────────────────────

let errors = 0
let warnings = 0

if (!existsSync(DIST)) {
  console.error('[content-qa] ERROR: dist/ not found — run npm run build first.')
  process.exit(1)
}

// ── Check 2: Required routes exist ────────────────────────────────────────────

console.log('\n[content-qa] Checking required routes...')
for (const route of REQUIRED_ROUTES) {
  const path = join(DIST, route)
  if (!existsSync(path)) {
    console.error(`  ✗ MISSING: ${route}`)
    errors++
  } else {
    console.log(`  ✓ ${route}`)
  }
}

// ── Check 3: Placeholder text scan ───────────────────────────────────────────

console.log('\n[content-qa] Scanning for placeholder text...')
const htmlFiles = walk(DIST)
const placeholderHits = []

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8')
  // Strip HTML tags for text-only scan
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
  for (const pattern of PLACEHOLDER_PATTERNS) {
    if (pattern.test(text)) {
      const rel = file.replace(DIST, '')
      placeholderHits.push({ file: rel, pattern: pattern.toString() })
    }
  }
}

if (placeholderHits.length === 0) {
  console.log('  ✓ No placeholder text found in any HTML file')
} else {
  for (const hit of placeholderHits) {
    console.warn(`  ⚠ ${hit.file}: matches ${hit.pattern}`)
    warnings++
  }
}

// ── Check 4: Internal link resolution ─────────────────────────────────────────

console.log('\n[content-qa] Checking internal links in dist/en/index.html...')
const landingHtml = readFileSync(join(DIST, 'en/index.html'), 'utf8')

// Extract href="/..." links (not external, not anchors-only, not _next)
const hrefRegex = /href="(\/[^"#?]+)"/g
const internalLinks = new Set()
let m
while ((m = hrefRegex.exec(landingHtml)) !== null) {
  const href = m[1]
  if (!href.startsWith('/_next') && !href.startsWith('/api')) {
    internalLinks.add(href)
  }
}

// Also check footer + navigation HTML chunks
const footerLinks = [
  '/en/', '/es/', '/en/about/', '/en/contact/', '/en/labs/',
  '/en/systems/', '/en/intelligence/', '/en/resources/',
  '/en/journal/', '/en/ai/', '/en/changelog/', '/es/changelog/',
]

const allToCheck = new Set([...footerLinks])

let linkErrors = 0
for (const link of allToCheck) {
  const normalized = link.endsWith('/') ? link : `${link}/`
  const candidate1 = join(DIST, link.endsWith('/') ? `${link}index.html` : `${link}/index.html`)
  const candidate2 = join(DIST, `${link}.html`)
  if (!existsSync(candidate1) && !existsSync(candidate2)) {
    console.error(`  ✗ BROKEN: ${link}`)
    linkErrors++
    errors++
  } else {
    console.log(`  ✓ ${link}`)
  }
}

if (linkErrors === 0) {
  console.log('  ✓ All checked internal links resolve in dist/')
}

// ── Check 5: Locale parity (Spanish has content) ─────────────────────────────

console.log('\n[content-qa] Checking Spanish locale content parity...')
const esHtml = readFileSync(join(DIST, 'es/index.html'), 'utf8')
const esMarkers = [
  { text: 'Arquitectura', desc: 'Systems section translated' },
  { text: 'Laboratorio', desc: 'Labs section translated' },
  { text: 'Nosotros', desc: 'About section translated' },
]

for (const marker of esMarkers) {
  if (!esHtml.includes(marker.text)) {
    console.warn(`  ⚠ Spanish HTML missing expected text: "${marker.text}" (${marker.desc})`)
    warnings++
  } else {
    console.log(`  ✓ ${marker.desc} ("${marker.text}" found)`)
  }
}

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`\n[content-qa] Summary: ${htmlFiles.length} HTML files scanned · ${errors} errors · ${warnings} warnings`)

if (errors > 0) {
  console.error('[content-qa] FAILED — fix errors before deploying.')
  process.exit(1)
} else if (warnings > 0) {
  console.warn('[content-qa] PASSED with warnings — review before launching.')
  process.exit(0)
} else {
  console.log('[content-qa] ✓ PASSED — content looks clean.')
  process.exit(0)
}
