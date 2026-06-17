/**
 * Build-time Lighthouse runner — serves dist/ locally, audits with real Lighthouse.
 * No PSI API, no rate limits, no external dependencies.
 * Always audits the REAL built output, not a deployed (possibly different) site.
 *
 * Env vars (optional):
 *   CANONICAL_URL   — Override the URL path to audit (default: /en/)
 *   LH_PORT         — Port to serve dist/ on (default: 4099)
 *   CHROME_PATH     — Override Chrome/Chromium binary path
 *
 * Output: public/data/lighthouse.json
 */

import fs            from 'fs'
import http          from 'http'
import path          from 'path'
import zlib          from 'zlib'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT      = path.join(__dirname, '..')
const DIST_DIR  = path.join(ROOT, 'dist')
const OUT_FILE  = path.join(ROOT, 'public', 'data', 'lighthouse.json')

const PORT      = parseInt(process.env.LH_PORT ?? '4099', 10)
const URL_PATH  = process.env.CANONICAL_URL_PATH ?? '/en/'
const TIMEOUT   = 120_000

// MIME types for static file server
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.webp': 'image/webp',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff2':'font/woff2',
  '.woff': 'font/woff',
  '.txt':  'text/plain',
  '.xml':  'text/xml',
  '.webmanifest': 'application/manifest+json',
}

function getMime(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  return MIME[ext] ?? 'application/octet-stream'
}

// Compressible MIME types — gzip makes a huge difference for JS/CSS/HTML
const COMPRESSIBLE = new Set([
  'text/html; charset=utf-8', 'text/css', 'application/javascript',
  'application/json', 'text/plain', 'text/xml', 'image/svg+xml',
  'application/manifest+json',
])

// Static file server for dist/ with gzip compression to match CDN production behavior.
// Without compression, Lighthouse mobile (1.6 Mbps throttling) spends 6+ s downloading
// uncompressed JS chunks (1.2 MB three-vendor = 6 s at 1.6 Mbps). With gzip these
// shrink ~75 %, matching Cloudflare / Netlify production delivery and giving realistic
// mobile FCP/LCP measurements.
function createServer() {
  return http.createServer((req, res) => {
    let urlPath = req.url.split('?')[0]
    let filePath = path.join(DIST_DIR, urlPath)

    const candidates = [
      filePath,
      filePath.replace(/\/$/, '') + '.html',
      path.join(filePath, 'index.html'),
    ]

    let found = null
    for (const c of candidates) {
      if (fs.existsSync(c) && fs.statSync(c).isFile()) { found = c; break }
    }

    if (!found) {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('Not found')
      return
    }

    const mime      = getMime(found)
    const canGzip   = COMPRESSIBLE.has(mime)
    const acceptsGz = (req.headers['accept-encoding'] ?? '').includes('gzip')

    // Long-lived cache for hashed assets (_next/static/) — mirrors CDN behavior
    const isHashedAsset = urlPath.includes('/_next/static/')
    const cacheControl  = isHashedAsset ? 'public, max-age=31536000, immutable' : 'no-store'

    if (canGzip && acceptsGz) {
      res.writeHead(200, {
        'Content-Type':     mime,
        'Content-Encoding': 'gzip',
        'Cache-Control':    cacheControl,
        'Vary':             'Accept-Encoding',
      })
      fs.createReadStream(found).pipe(zlib.createGzip()).pipe(res)
    } else {
      res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': cacheControl })
      fs.createReadStream(found).pipe(res)
    }
  })
}

// Detect Chrome/Chromium binary
const CHROME_PATH = process.env.CHROME_PATH
  ?? ['/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable']
    .find(p => fs.existsSync(p))
  ?? 'chromium'

async function runLighthouse(url, strategy) {
  let chromeLauncher, lighthouse

  try {
    const clMod = await import('chrome-launcher')
    chromeLauncher = clMod.default ?? clMod
    const lhMod = await import('lighthouse')
    lighthouse = lhMod.default ?? lhMod
  } catch (err) {
    return { error: `import failed: ${err.message}`, strategy, url }
  }

  const isDesktop = strategy === 'desktop'
  const chromeFlags = [
    '--headless=new', '--no-sandbox', '--disable-gpu',
    '--disable-dev-shm-usage', '--disable-setuid-sandbox', '--no-zygote',
  ]

  let chrome
  try {
    chrome = await chromeLauncher.launch({ chromePath: CHROME_PATH, chromeFlags })

    const config = isDesktop ? {
      extends: 'lighthouse:default',
      settings: {
        formFactor: 'desktop',
        throttlingMethod: 'simulate',
        throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1, requestLatencyMs: 0, downloadThroughputKbps: 0, uploadThroughputKbps: 0 },
        screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false },
        emulatedUserAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      },
    } : undefined

    const result = await Promise.race([
      lighthouse(url, { port: chrome.port, output: 'json', logLevel: 'error' }, config),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), TIMEOUT)),
    ])

    if (!result?.lhr) return { error: 'no lhr in result', strategy, url }

    const lhr    = result.lhr
    const cats   = lhr.categories ?? {}
    const audits = lhr.audits ?? {}

    // Lighthouse 13+ removed the 'pwa' category — only include categories that exist
    const SCORE_CATEGORIES = [
      { key: 'performance',    label: 'Performance'    },
      { key: 'accessibility',  label: 'Accessibility'  },
      { key: 'best-practices', label: 'Best Practices' },
      { key: 'seo',            label: 'SEO'            },
    ]

    const scores = SCORE_CATEGORIES
      .filter(c => cats[c.key] != null)
      .map(c => ({ label: c.label, score: Math.round((cats[c.key].score ?? 0) * 100) }))

    const KEY_AUDITS = [
      'first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time',
      'cumulative-layout-shift', 'speed-index', 'interactive', 'server-response-time',
    ]
    const keyAudits = {}
    for (const id of KEY_AUDITS) {
      const a = audits[id]
      if (a) keyAudits[id] = {
        title:        a.title ?? id,
        score:        a.score != null ? Math.round(a.score * 100) : null,
        displayValue: a.displayValue ?? null,
      }
    }

    // LCP element — tells us WHAT is the LCP candidate (LH 13 structure)
    // lhr.audits['largest-contentful-paint-element'].details.items[0].items[0].node.snippet
    const lcpAudit = audits['largest-contentful-paint-element']
    const lcpItem0 = lcpAudit?.details?.items?.[0]
    const lcpElement =
      lcpItem0?.items?.[0]?.node?.snippet       // LH 13 list→table→node
      ?? lcpItem0?.items?.[0]?.value?.snippet   // alternate path
      ?? lcpItem0?.node?.snippet                // flat node
      ?? lcpItem0?.value?.snippet               // flat value
      ?? lcpItem0?.snippet                      // direct snippet
      ?? null

    // Render-blocking resources
    const renderBlockAudit = audits['render-blocking-resources']
    const renderBlockMs = renderBlockAudit?.numericValue ? Math.round(renderBlockAudit.numericValue) : null

    // Unused JavaScript
    const unusedJsAudit = audits['unused-javascript']
    const unusedJsKb = unusedJsAudit?.details?.items?.reduce((s, i) => s + (i.wastedBytes ?? 0), 0)
    const unusedJsKbRounded = unusedJsKb ? Math.round(unusedJsKb / 1024) : null

    // Main thread work breakdown
    const threadAudit = audits['mainthread-work-breakdown']
    const threadItems = threadAudit?.details?.items?.slice(0, 5).map(i => ({
      group: i.groupLabel, duration: Math.round(i.duration ?? 0)
    })) ?? []

    // SEO failures — detailed breakdown
    const seoFails = []
    for (const ref of (cats.seo?.auditRefs ?? [])) {
      const a = audits[ref.id]
      if (a && a.score != null && a.score < 1) {
        seoFails.push({ id: ref.id, title: a.title, score: Math.round(a.score * 100) })
      }
    }

    return {
      url, strategy,
      fetchedAt: new Date().toISOString(),
      scores, audits: keyAudits,
      lcpElement,
      renderBlockMs,
      unusedJsKb: unusedJsKbRounded,
      mainThreadWork: threadItems.length ? threadItems : undefined,
      seoFails: seoFails.length ? seoFails : undefined,
      lighthouseVersion: lhr.lighthouseVersion,
    }
  } catch (err) {
    return { error: String(err), strategy, url }
  } finally {
    try { if (chrome) await chrome.kill() } catch {}
  }
}

async function run() {
  const start = Date.now()

  if (!fs.existsSync(DIST_DIR)) {
    console.warn('[lighthouse] ⚠  dist/ not found — run `npm run build` first')
    fs.writeFileSync(OUT_FILE, JSON.stringify({
      generatedAt: new Date().toISOString(), url: 'localhost', error: 'dist/ not found — run npm run build first',
    }, null, 2))
    return
  }

  const dataDir = path.join(ROOT, 'public', 'data')
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })

  // Start local server
  const server = createServer()
  await new Promise((resolve, reject) => {
    server.listen(PORT, '127.0.0.1', () => resolve(undefined))
    server.on('error', reject)
  })

  const auditUrl = `http://127.0.0.1:${PORT}${URL_PATH}`
  console.log(`[lighthouse] 🚀 Serving dist/ on port ${PORT}`)
  console.log(`[lighthouse]    Auditing ${auditUrl}`)
  console.log(`[lighthouse]    Chrome: ${CHROME_PATH}`)

  try {
    console.log(`[lighthouse]    Running mobile…`)
    const mobileResult = await runLighthouse(auditUrl, 'mobile')
    if (mobileResult.error) console.warn(`[lighthouse] ⚠  Mobile: ${mobileResult.error}`)
    else {
      const p = mobileResult.scores?.find(s => s.label === 'Performance')?.score
      const s = mobileResult.scores?.find(s => s.label === 'SEO')?.score
      console.log(`[lighthouse] ✅ Mobile — Perf ${p}, SEO ${s}`)
      if (mobileResult.lcpElement)  console.log(`[lighthouse]    LCP element: ${mobileResult.lcpElement}`)
      if (mobileResult.renderBlockMs) console.log(`[lighthouse]    Render-blocking: ${mobileResult.renderBlockMs}ms`)
      if (mobileResult.unusedJsKb)  console.log(`[lighthouse]    Unused JS: ${mobileResult.unusedJsKb}KB`)
      if (mobileResult.mainThreadWork?.length) {
        console.log(`[lighthouse]    Main-thread work (top 5):`)
        mobileResult.mainThreadWork.forEach(t => console.log(`[lighthouse]      ${t.group}: ${t.duration}ms`))
      }
      if (mobileResult.seoFails?.length) {
        console.log(`[lighthouse]    SEO failures:`, mobileResult.seoFails.map(f => f.id).join(', '))
      }
    }

    console.log(`[lighthouse]    Running desktop…`)
    const desktopResult = await runLighthouse(auditUrl, 'desktop')
    if (desktopResult.error) console.warn(`[lighthouse] ⚠  Desktop: ${desktopResult.error}`)
    else {
      const p = desktopResult.scores?.find(s => s.label === 'Performance')?.score
      console.log(`[lighthouse] ✅ Desktop — Perf ${p}`)
    }

    const output = {
      generatedAt: new Date().toISOString(),
      url:         auditUrl,
      mobile:      mobileResult,
      desktop:     desktopResult,
    }

    fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2))

    const elapsed = ((Date.now() - start) / 1000).toFixed(1)
    console.log(`[lighthouse] ✅ Written to public/data/lighthouse.json (${elapsed}s total)`)
  } finally {
    server.close()
  }
}

run().catch((err) => {
  console.error('[lighthouse] Fatal error:', err)
})
