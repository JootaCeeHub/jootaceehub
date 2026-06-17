#!/usr/bin/env node
/**
 * generate-og.mjs
 * Generates OG images (1200×630 PNG) using Satori + @resvg/resvg-js.
 *
 * Sources (merged, slug-deduplicated):
 *   1. Static MDX articles in src/content/journal/  (always available, build-time)
 *   2. Supabase published posts                      (when env vars are present)
 *
 * Output:
 *   public/og/[slug].png     — per-article OG image
 *   public/og/default.png    — site-level fallback
 *   public/og-image.png      — root fallback (overwritten with default.png render)
 *
 * Font strategy (TTF only — opentype.js does not support WOFF2):
 *   1. Check public/fonts/Inter-{Regular,Bold}.ttf  (local cache)
 *   2. Fetch TTF from Bunny Fonts CDN (privacy-friendly, no CORS)
 *   3. Fetch TTF from Google Fonts (old-UA trick returns TTF)
 *   4. Fall back to system DejaVu / Helvetica / Arial
 */

import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const matter = require('gray-matter')

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

// ── .env.local ─────────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = join(root, '.env.local')
  if (!existsSync(envPath)) return
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = val
  }
}
loadEnv()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://jootacee.com'

// ── Font loading (TTF only — opentype.js does not support WOFF2) ──────────
async function loadFont(weight) {
  const name = weight === 700 ? 'Inter-Bold' : 'Inter-Regular'
  const cachePath = join(root, 'public', 'fonts', `${name}.ttf`)

  // 1. Local cache (committed or previously downloaded)
  if (existsSync(cachePath)) {
    return readFileSync(cachePath)
  }

  mkdirSync(join(root, 'public', 'fonts'), { recursive: true })

  // 2. Google Fonts API with curl UA → returns TTF CSS → extract TTF URL
  //    curl UA is the most reliable way to get format('truetype') from GF
  const gfUrl = `https://fonts.googleapis.com/css?family=Inter:${weight}`
  try {
    const cssRes = await fetch(gfUrl, {
      headers: { 'User-Agent': 'curl/7.0' },
      signal: AbortSignal.timeout(12000),
    })
    if (cssRes.ok) {
      const css = await cssRes.text()
      // CSS contains: src: url(https://...ttf) format('truetype')
      const match = css.match(/url\((https?:\/\/[^)]+\.ttf)\)/)
      if (match?.[1]) {
        const ttfRes = await fetch(match[1], { signal: AbortSignal.timeout(12000) })
        if (ttfRes.ok) {
          const buf = Buffer.from(await ttfRes.arrayBuffer())
          writeFileSync(cachePath, buf)
          console.log(`[og] Cached → public/fonts/${name}.ttf (Google Fonts TTF)`)
          return buf
        }
      }
    }
  } catch { /* fall through to system fonts */ }

  // 3. System fonts — extended list covering Linux, macOS, Windows
  const systemFonts = {
    400: [
      '/usr/share/fonts/TTF/OpenSans-Regular.ttf',
      '/usr/share/fonts/noto/NotoSans-Regular.ttf',
      '/usr/share/fonts/liberation/LiberationSans-Regular.ttf',
      '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
      '/usr/share/fonts/Adwaita/AdwaitaSans-Regular.ttf',
      '/System/Library/Fonts/Helvetica.ttc',
      'C:\\Windows\\Fonts\\arial.ttf',
    ],
    700: [
      '/usr/share/fonts/TTF/OpenSans-Bold.ttf',
      '/usr/share/fonts/noto/NotoSans-Bold.ttf',
      '/usr/share/fonts/liberation/LiberationSans-Bold.ttf',
      '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
      '/usr/share/fonts/Adwaita/AdwaitaMono-Bold.ttf',
      '/System/Library/Fonts/Helvetica.ttc',
      'C:\\Windows\\Fonts\\arialbd.ttf',
    ],
  }
  for (const p of systemFonts[weight] ?? []) {
    if (existsSync(p)) {
      console.log(`[og] Using system font (${weight}): ${p}`)
      return readFileSync(p)
    }
  }

  console.warn(`[og] Could not load font weight-${weight} from any source`)
  return null
}

// ── Static MDX articles ────────────────────────────────────────────────────
function loadStaticArticles() {
  const contentDir = join(root, 'src', 'content', 'journal')
  if (!existsSync(contentDir)) return []

  const files = readdirSync(contentDir).filter((f) => f.endsWith('.mdx'))
  const articles = []

  for (const filename of files) {
    try {
      const raw = readFileSync(join(contentDir, filename), 'utf-8')
      const { data } = matter(raw)
      articles.push({
        slug: String(data.slug ?? filename.replace('.mdx', '')),
        title: String(data.title ?? 'Untitled'),
        category: String(data.category ?? 'research'),
        read_time: Number(data.readTime ?? 5),
        published_at: String(data.date ?? new Date().toISOString()),
        source: 'mdx',
      })
    } catch (e) {
      console.warn(`[og] Could not parse ${filename}: ${e.message}`)
    }
  }

  return articles
}

// ── Supabase posts ─────────────────────────────────────────────────────────
async function fetchSupabasePosts() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return []

  const url = `${SUPABASE_URL}/rest/v1/journal_posts?select=slug,title,category,published_at,read_time&status=eq.published&order=published_at.desc`
  try {
    const res = await fetch(url, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) { console.warn(`[og] Supabase fetch failed: ${res.status}`); return [] }
    const posts = await res.json()
    console.log(`[og] Loaded ${posts.length} posts from Supabase`)
    return posts.map((p) => ({ ...p, source: 'supabase' }))
  } catch (e) {
    console.warn(`[og] Supabase unavailable: ${e.message}`)
    return []
  }
}

// ── OG template ───────────────────────────────────────────────────────────
const CATEGORY_STYLES = {
  research: { bg: 'rgba(99,102,241,0.08)',  border: 'rgba(99,102,241,0.25)',  text: 'rgba(165,180,252,0.9)', label: 'RESEARCH' },
  opinion:  { bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.25)',  text: 'rgba(110,231,183,0.9)', label: 'ANALYSIS' },
  essays:   { bg: 'rgba(139,92,246,0.08)',  border: 'rgba(139,92,246,0.25)',  text: 'rgba(196,181,253,0.9)', label: 'ESSAY' },
  news:     { bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.25)',  text: 'rgba(252,211,77,0.9)',  label: 'INTELLIGENCE' },
  default:  { bg: 'rgba(244,63,94,0.08)',   border: 'rgba(244,63,94,0.25)',   text: 'rgba(251,113,133,0.9)', label: 'JOURNAL' },
}

function buildTemplate({ title, category, readTime, date, siteUrl }) {
  const displayTitle = title.length > 80 ? title.slice(0, 77) + '…' : title
  const cat = CATEGORY_STYLES[category] ?? CATEGORY_STYLES.default
  const formattedDate = date
    ? (() => { try { return new Date(date).toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' }) } catch { return null } })()
    : null

  return {
    type: 'div',
    props: {
      style: {
        width: '1200px', height: '630px',
        display: 'flex',
        background: 'linear-gradient(135deg, #060d18 0%, #0a1628 50%, #0d1f3c 100%)',
        fontFamily: '"Inter", sans-serif',
        position: 'relative',
        overflow: 'hidden',
      },
      children: [
        // Subtle grid lines
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute', inset: 0,
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),' +
                'linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            },
          },
        },
        // Left gradient bar
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px',
              background: 'linear-gradient(180deg, rgba(244,63,94,0.9) 0%, rgba(99,102,241,0.7) 100%)',
            },
          },
        },
        // Main content
        {
          type: 'div',
          props: {
            style: {
              display: 'flex', flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
              padding: '56px 80px 56px 96px',
              position: 'relative',
            },
            children: [
              // Top: site name + category badge
              {
                type: 'div',
                props: {
                  style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', alignItems: 'center', gap: '10px' },
                        children: [
                          { type: 'div', props: { style: { width: '8px', height: '8px', borderRadius: '50%', background: '#f43f5e' } } },
                          { type: 'span', props: { style: { fontSize: '18px', fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '-0.5px' }, children: siteUrl.replace('https://', '') } },
                        ],
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          padding: '6px 18px', borderRadius: '99px',
                          border: `1px solid ${cat.border}`,
                          background: cat.bg,
                          fontSize: '12px', fontWeight: 700,
                          color: cat.text,
                          letterSpacing: '1px',
                        },
                        children: cat.label,
                      },
                    },
                  ],
                },
              },
              // Center: title
              {
                type: 'div',
                props: {
                  style: { flex: 1, display: 'flex', alignItems: 'center' },
                  children: [
                    {
                      type: 'h1',
                      props: {
                        style: {
                          fontSize: displayTitle.length > 55 ? '44px' : '56px',
                          fontWeight: 700,
                          color: '#ffffff',
                          lineHeight: 1.18,
                          letterSpacing: '-1.5px',
                          margin: 0,
                          maxWidth: '960px',
                        },
                        children: displayTitle,
                      },
                    },
                  ],
                },
              },
              // Bottom: read time + date
              {
                type: 'div',
                props: {
                  style: { display: 'flex', alignItems: 'center', gap: '28px' },
                  children: [
                    readTime
                      ? { type: 'span', props: { style: { fontSize: '14px', color: 'rgba(255,255,255,0.3)', letterSpacing: '-0.2px' }, children: `${readTime} min read` } }
                      : null,
                    formattedDate
                      ? { type: 'span', props: { style: { fontSize: '14px', color: 'rgba(255,255,255,0.2)', letterSpacing: '-0.2px' }, children: formattedDate } }
                      : null,
                  ].filter(Boolean),
                },
              },
            ],
          },
        },
      ],
    },
  }
}

// ── Render single post → PNG Buffer ───────────────────────────────────────
async function renderOg(post, fonts) {
  const svg = await satori(
    buildTemplate({
      title: post.title ?? 'Untitled',
      category: post.category,
      readTime: post.read_time,
      date: post.published_at,
      siteUrl: SITE_URL,
    }),
    { width: 1200, height: 630, fonts }
  )
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } })
  return resvg.render().asPng()
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  console.log('[og] Loading fonts…')
  const [regular, bold] = await Promise.all([loadFont(400), loadFont(700)])

  if (!regular || !bold) {
    console.error('[og] No fonts available — skipping OG generation')
    process.exit(0)
  }

  const fonts = [
    { name: 'Inter', data: regular, weight: 400, style: 'normal' },
    { name: 'Inter', data: bold,    weight: 700, style: 'normal' },
  ]
  console.log('[og] Fonts ready')

  const outDir = join(root, 'public', 'og')
  mkdirSync(outDir, { recursive: true })

  // Default site OG
  try {
    const defaultPng = await renderOg({
      title: 'Architecting Autonomous Systems',
      category: 'research',
      read_time: null,
      published_at: null,
    }, fonts)
    writeFileSync(join(outDir, 'default.png'), defaultPng)
    writeFileSync(join(root, 'public', 'og-image.png'), defaultPng)
    console.log('[og] Written → public/og/default.png  public/og-image.png')
  } catch (e) {
    console.error(`[og] Default image failed: ${e.message}`)
  }

  // Merge sources — Supabase takes priority over MDX for same slug
  const supabasePosts = await fetchSupabasePosts()
  const staticPosts   = loadStaticArticles()
  console.log(`[og] Sources: ${supabasePosts.length} Supabase, ${staticPosts.length} MDX static`)

  const seen = new Set()
  const posts = []
  for (const p of [...supabasePosts, ...staticPosts]) {
    if (p.slug && !seen.has(p.slug)) { seen.add(p.slug); posts.push(p) }
  }

  console.log(`[og] Generating ${posts.length} article images…`)
  let ok = 0
  let fail = 0

  for (const post of posts) {
    try {
      const png = await renderOg(post, fonts)
      writeFileSync(join(outDir, `${post.slug}.png`), png)
      ok++
      if (ok % 5 === 0 || ok === posts.length) console.log(`[og] ${ok}/${posts.length}`)
    } catch (e) {
      fail++
      console.error(`[og] Failed "${post.slug}": ${e.message}`)
    }
  }

  console.log(`[og] Done — ${ok + 1} images total, ${fail} errors → public/og/`)
}

main().catch((e) => {
  console.error('[og] Fatal:', e)
  process.exit(1)
})
