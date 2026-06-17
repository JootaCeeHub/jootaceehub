#!/usr/bin/env node
/**
 * generate-sitemap.mjs
 * Generates public/sitemap.xml by combining static routes with
 * published journal post slugs from Supabase.
 *
 * Run: node scripts/generate-sitemap.mjs
 * Requires: NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
 *
 * Output: public/sitemap.xml (also copied to dist/ by postbuild)
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

// ── Load .env.local ────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = join(root, '.env.local')
  if (!existsSync(envPath)) return
  const lines = readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = val
  }
}
loadEnv()

const SITE_URL     = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://jootacee.com'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const LOCALES      = ['en', 'es']

// ── Static routes (same for all locales) ──────────────────────────────────
const STATIC_ROUTES = [
  { path: '/',              changefreq: 'weekly',  priority: '1.0' },
  { path: '/systems',       changefreq: 'monthly', priority: '0.8' },
  { path: '/labs',          changefreq: 'monthly', priority: '0.8' },
  { path: '/infrastructure',changefreq: 'weekly',  priority: '0.7' },
  { path: '/journal',       changefreq: 'daily',   priority: '0.9' },
  { path: '/github',        changefreq: 'weekly',  priority: '0.6' },
  { path: '/about',         changefreq: 'monthly', priority: '0.7' },
  { path: '/contact',       changefreq: 'monthly', priority: '0.6' },
]

// ── Fetch published post slugs ─────────────────────────────────────────────
async function fetchPostSlugs() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn('[sitemap] Supabase not configured — skipping dynamic journal routes')
    return []
  }
  const url = `${SUPABASE_URL}/rest/v1/journal_posts?select=slug,published_at,updated_at&status=eq.published&order=published_at.desc`
  const res = await fetch(url, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  })
  if (!res.ok) {
    console.error(`[sitemap] Supabase fetch failed: ${res.status}`)
    return []
  }
  return res.json()
}

// ── XML helpers ────────────────────────────────────────────────────────────
function esc(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function urlEntry({ loc, lastmod, changefreq, priority, alternates = [] }) {
  const alts = alternates
    .map((alt) => `    <xhtml:link rel="alternate" hreflang="${alt.lang}" href="${esc(alt.href)}"/>`)
    .join('\n')

  return `  <url>
    <loc>${esc(loc)}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${alts ? alts + '\n' : ''}  </url>`
}

// ── Build sitemap ─────────────────────────────────────────────────────────
async function main() {
  console.log('[sitemap] Building sitemap…')
  const posts = await fetchPostSlugs()
  console.log(`[sitemap] Got ${posts.length} published posts`)

  const today = new Date().toISOString().split('T')[0]
  const entries = []

  // Static routes — one entry per locale with xhtml:link alternates
  for (const route of STATIC_ROUTES) {
    for (const locale of LOCALES) {
      const loc = `${SITE_URL}/${locale}${route.path}`
      const alternates = LOCALES.map((l) => ({
        lang: l,
        href: `${SITE_URL}/${l}${route.path}`,
      }))
      alternates.push({ lang: 'x-default', href: `${SITE_URL}/en${route.path}` })

      entries.push(urlEntry({
        loc,
        lastmod: today,
        changefreq: route.changefreq,
        priority: route.priority,
        alternates,
      }))
    }
  }

  // Journal posts — available in both locales
  for (const post of posts) {
    const lastmod = (post.updated_at ?? post.published_at ?? today).split('T')[0]
    for (const locale of LOCALES) {
      const loc = `${SITE_URL}/${locale}/journal/${post.slug}`
      const alternates = LOCALES.map((l) => ({
        lang: l,
        href: `${SITE_URL}/${l}/journal/${post.slug}`,
      }))
      alternates.push({ lang: 'x-default', href: `${SITE_URL}/en/journal/${post.slug}` })

      entries.push(urlEntry({
        loc,
        lastmod,
        changefreq: 'weekly',
        priority: '0.8',
        alternates,
      }))
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

main().catch((e) => {
  console.error('[sitemap] Fatal error:', e)
  process.exit(1)
})
