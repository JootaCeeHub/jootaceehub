#!/usr/bin/env node
/**
 * generate-sitemap.mjs
 * Generates public/sitemap.xml from static routes + MDX article slugs.
 *
 * ADR-008: Supabase is frozen. Journal content is read from
 * src/content/articles/ (MDX files) — no network call required.
 *
 * Run: node scripts/generate-sitemap.mjs
 * Output: public/sitemap.xml (also copied to dist/ by postbuild)
 */

import { readdirSync, writeFileSync } from 'fs'
import { join, dirname, extname, basename } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://jootacee.com'
const LOCALES  = ['en', 'es']

// ── Static routes (same for all locales) ─────────────────────────────────────
const STATIC_ROUTES = [
  { path: '/',               changefreq: 'weekly',  priority: '1.0' },
  { path: '/systems',        changefreq: 'monthly', priority: '0.8' },
  { path: '/labs',           changefreq: 'monthly', priority: '0.8' },
  { path: '/infrastructure', changefreq: 'weekly',  priority: '0.7' },
  { path: '/journal',        changefreq: 'daily',   priority: '0.9' },
  { path: '/github',         changefreq: 'weekly',  priority: '0.6' },
  { path: '/about',          changefreq: 'monthly', priority: '0.7' },
  { path: '/contact',        changefreq: 'monthly', priority: '0.6' },
  { path: '/changelog',      changefreq: 'monthly', priority: '0.5' },
  { path: '/ai',             changefreq: 'monthly', priority: '0.7' },
  { path: '/resources',      changefreq: 'weekly',  priority: '0.7' },
  { path: '/intelligence',   changefreq: 'daily',   priority: '0.7' },
]

// ── Read article slugs from src/content/articles/ MDX files ─────────────────
// ADR-008 + Phase 2 migration: canonical content lives in src/content/articles/
function readArticleSlugs() {
  const articlesDir = join(root, 'src', 'content', 'articles')
  try {
    return readdirSync(articlesDir)
      .filter(f => extname(f) === '.mdx')
      .map(f => basename(f, '.mdx'))
  } catch {
    console.warn('[sitemap] src/content/articles/ not found — skipping journal routes')
    return []
  }
}

// ── XML helpers ───────────────────────────────────────────────────────────────
function esc(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function urlEntry({ loc, lastmod, changefreq, priority, alternates = [] }) {
  const alts = alternates
    .map(alt => `    <xhtml:link rel="alternate" hreflang="${alt.lang}" href="${esc(alt.href)}"/>`)
    .join('\n')

  return `  <url>
    <loc>${esc(loc)}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${alts ? alts + '\n' : ''}  </url>`
}

// ── Build sitemap ─────────────────────────────────────────────────────────────
function main() {
  console.log('[sitemap] Building sitemap…')
  const slugs = readArticleSlugs()
  console.log(`[sitemap] Found ${slugs.length} article slugs`)

  const today = new Date().toISOString().split('T')[0]
  const entries = []

  // Static routes — one entry per locale with hreflang alternates
  for (const route of STATIC_ROUTES) {
    for (const locale of LOCALES) {
      const loc = `${SITE_URL}/${locale}${route.path}`
      const alternates = LOCALES.map(l => ({ lang: l, href: `${SITE_URL}/${l}${route.path}` }))
      alternates.push({ lang: 'x-default', href: `${SITE_URL}/en${route.path}` })
      entries.push(urlEntry({ loc, lastmod: today, changefreq: route.changefreq, priority: route.priority, alternates }))
    }
  }

  // Journal/article routes — one entry per slug × locale
  for (const slug of slugs) {
    for (const locale of LOCALES) {
      const loc = `${SITE_URL}/${locale}/journal/${slug}`
      const alternates = LOCALES.map(l => ({ lang: l, href: `${SITE_URL}/${l}/journal/${slug}` }))
      alternates.push({ lang: 'x-default', href: `${SITE_URL}/en/journal/${slug}` })
      entries.push(urlEntry({ loc, lastmod: today, changefreq: 'weekly', priority: '0.8', alternates }))
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>`

  const outPath = join(root, 'public', 'sitemap.xml')
  writeFileSync(outPath, xml, 'utf-8')
  console.log(`[sitemap] Written → ${outPath} (${entries.length} entries)`)
}

main()
