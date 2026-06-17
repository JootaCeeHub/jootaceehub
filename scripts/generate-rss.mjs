#!/usr/bin/env node
/**
 * generate-rss.mjs
 * Fetches published posts from Supabase and writes public/rss.xml
 *
 * Run: node scripts/generate-rss.mjs
 * Requires: NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
 *           (or environment)
 *
 * Falls back to a placeholder feed if Supabase is not configured.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

// ── Load .env.local if present ─────────────────────────────────────────────
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
    const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = value
  }
}

loadEnv()

// ── Config ─────────────────────────────────────────────────────────────────
const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://jootacee.com'
const SITE_NAME = 'JootaCee'
const SITE_DESC = 'AI Systems Architect — insights on autonomous infrastructure, AI agents, and modern engineering'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// ── Fetch posts from Supabase ──────────────────────────────────────────────
async function fetchPosts() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn('[rss] Supabase not configured — generating placeholder RSS feed')
    return []
  }

  const url = `${SUPABASE_URL}/rest/v1/journal_posts?select=*&status=eq.published&order=published_at.desc&limit=50`
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    console.error(`[rss] Supabase fetch failed: ${res.status} ${res.statusText}`)
    return []
  }

  return res.json()
}

// ── XML helpers ────────────────────────────────────────────────────────────
function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function buildItem(post) {
  const link = `${SITE_URL}/en/journal/${post.slug}`
  const pubDate = post.published_at
    ? new Date(post.published_at).toUTCString()
    : new Date(post.created_at).toUTCString()
  const cats = (post.tags ?? []).map((t) => `    <category>${esc(t)}</category>`).join('\n')

  return `  <item>
    <title>${esc(post.title)}</title>
    <link>${esc(link)}</link>
    <guid isPermaLink="true">${esc(link)}</guid>
    <pubDate>${pubDate}</pubDate>
    <description>${esc(post.excerpt ?? '')}</description>
    <category>${esc(post.category)}</category>
${cats}
    ${post.cover_image_url ? `<enclosure url="${esc(post.cover_image_url)}" type="image/jpeg" />` : ''}
  </item>`
}

// ── Build RSS XML ──────────────────────────────────────────────────────────
function buildFeed(posts) {
  const items = posts.map(buildItem).join('\n')
  const buildDate = new Date().toUTCString()

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${esc(SITE_NAME)}</title>
    <link>${esc(SITE_URL)}</link>
    <description>${esc(SITE_DESC)}</description>
    <language>en-us</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${esc(SITE_URL)}/rss.xml" rel="self" type="application/rss+xml" />
    <managingEditor>contact@jootacee.com (JootaCee)</managingEditor>
    <webMaster>contact@jootacee.com (JootaCee)</webMaster>
    <ttl>60</ttl>
    <image>
      <url>${esc(SITE_URL)}/icon-192x192.png</url>
      <title>${esc(SITE_NAME)}</title>
      <link>${esc(SITE_URL)}</link>
    </image>
${items}
  </channel>
</rss>`
}

// ── Write output ───────────────────────────────────────────────────────────
async function main() {
  console.log('[rss] Fetching published posts…')
  const posts = await fetchPosts()
  console.log(`[rss] Got ${posts.length} posts`)

  const xml = buildFeed(posts)
  const outPath = join(root, 'public', 'rss.xml')
  writeFileSync(outPath, xml, 'utf-8')
  console.log(`[rss] Written → ${outPath}`)
}

main().catch((e) => {
  console.error('[rss] Error:', e)
  process.exit(1)
})
