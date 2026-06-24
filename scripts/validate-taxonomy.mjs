/**
 * validate-taxonomy.mjs
 *
 * Build-time validation of content relations and taxonomy integrity:
 *   1. Every MDX tag slug must exist in taxonomies/tags.json
 *   2. Every MDX series reference must exist in taxonomies/series.json
 *   3. No duplicate slugs across articles in src/content/articles/
 *   4. Series item lists reference only known article slugs
 *
 * Exit 0 — all checks pass
 * Exit 1 — one or more violations (CI-blocking)
 *
 * Usage:
 *   node scripts/validate-taxonomy.mjs
 */

import { readFileSync, readdirSync } from 'node:fs'
import { join, extname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require   = createRequire(import.meta.url)
const matter    = require('gray-matter')

const ROOT         = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const ARTICLES_DIR = join(ROOT, 'src', 'content', 'articles')
const TAGS_FILE    = join(ROOT, 'src', 'content', 'taxonomies', 'tags.json')
const SERIES_FILE  = join(ROOT, 'src', 'content', 'taxonomies', 'series.json')

// ── Load canonical taxonomy ───────────────────────────────────────────────────

const { tags }   = JSON.parse(readFileSync(TAGS_FILE, 'utf8'))
const { series } = JSON.parse(readFileSync(SERIES_FILE, 'utf8'))

const KNOWN_TAGS   = new Set(tags.map(t => t.slug))
const KNOWN_SERIES = new Set(series.map(s => s.slug))

// ── Load all MDX frontmatter ──────────────────────────────────────────────────

const files = readdirSync(ARTICLES_DIR).filter(f => extname(f) === '.mdx')
const articles = files.map(file => {
  const raw  = readFileSync(join(ARTICLES_DIR, file), 'utf8')
  const { data } = matter(raw)
  return { file, slug: data.slug ?? basename(file, '.mdx'), tags: data.tags ?? [], series: data.series }
})

// ── Checks ────────────────────────────────────────────────────────────────────

let errors = 0
const fail = (msg) => { console.error(`  ✗ ${msg}`); errors++ }
const ok   = (msg) => console.log(`  ✓ ${msg}`)

console.log('\n🔍  Validating taxonomy relations...\n')

// 1. No duplicate slugs
const slugsSeen = new Map()
for (const { slug, file } of articles) {
  if (slugsSeen.has(slug)) {
    fail(`Duplicate slug "${slug}" in ${file} (already in ${slugsSeen.get(slug)})`)
  } else {
    slugsSeen.set(slug, file)
  }
}
if (errors === 0) ok(`No duplicate slugs across ${articles.length} articles`)

// 2. All article tags exist in tags.json
const unknownTags = new Set()
for (const { file, tags: articleTags } of articles) {
  for (const tag of articleTags) {
    const slug = tag.toLowerCase().replace(/\s+/g, '-')
    if (!KNOWN_TAGS.has(tag) && !KNOWN_TAGS.has(slug)) {
      fail(`Unknown tag "${tag}" in ${file} — not in taxonomies/tags.json`)
      unknownTags.add(tag)
    }
  }
}
if (unknownTags.size === 0) ok(`All article tags resolve to known taxonomy slugs`)

// 3. All series references exist in series.json
const unknownSeries = new Set()
for (const { file, series: articleSeries } of articles) {
  if (articleSeries && !KNOWN_SERIES.has(articleSeries)) {
    fail(`Unknown series "${articleSeries}" in ${file} — not in taxonomies/series.json`)
    unknownSeries.add(articleSeries)
  }
}
if (unknownSeries.size === 0) ok(`All series references resolve (or no series assigned)`)

// 4. Series item lists reference only known slugs
const KNOWN_SLUGS = new Set(articles.map(a => a.slug))
for (const s of series) {
  if (!s.items?.length) continue
  for (const slug of s.items) {
    if (!KNOWN_SLUGS.has(slug)) {
      fail(`Series "${s.slug}" references unknown article slug "${slug}"`)
    }
  }
}
if (errors === 0) ok(`All series item lists reference existing article slugs`)

// ── Summary ───────────────────────────────────────────────────────────────────

console.log()
if (errors > 0) {
  console.error(`❌  Taxonomy validation failed — ${errors} error${errors > 1 ? 's' : ''}\n`)
  process.exit(1)
} else {
  console.log(`✅  Taxonomy valid — ${articles.length} articles, ${tags.length} tags, ${series.length} series\n`)
  process.exit(0)
}
