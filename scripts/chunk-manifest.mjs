/**
 * Postbuild: generate dist/chunk-manifest.json
 *
 * App Router + Turbopack does not ship a per-route chunk table in build-manifest.json
 * (that file only covers Pages Router). Instead, this script:
 *   1. Walks dist/_next/static/chunks/ for raw byte sizes
 *   2. Reads app-path-routes-manifest.json for the list of App Router routes
 *   3. Compares against previous manifest for size delta tracking
 *   4. Appends a history entry to public/data/bundle-history.json (last 20 releases)
 *   5. Writes a compact summary to dist/chunk-manifest.json
 *
 * Output shape (dist/chunk-manifest.json):
 * {
 *   generatedAt:   string,
 *   chunkCount:    number,
 *   totalRawBytes: number,
 *   totalRawKB:    number,
 *   deltaKB:       number | null,   // vs. previous build (null = first run)
 *   largestChunks: Array<{ name, rawBytes, rawKB, deltaKB? }>,
 *   routes:        string[],
 *   routeCount:    number,
 *   budgets: {
 *     totalBudgetKB: number,
 *     withinBudget: boolean,
 *     scriptBudgetKB: number,
 *   },
 * }
 */

import { readdirSync, readFileSync, writeFileSync, existsSync, statSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const ROOT            = process.cwd()
const DIST            = join(ROOT, 'dist')
const NEXT_DIR        = join(ROOT, '.next')
const CHUNKS          = join(DIST, '_next', 'static', 'chunks')
const OUT_FILE        = join(DIST, 'chunk-manifest.json')
const PREV_FILE       = join(ROOT, 'public', 'data', 'bundle-history.json')

// ── Budgets ───────────────────────────────────────────────────────────────────
const BUDGET_TOTAL_KB  = 2048   // 2 MB raw (all chunks combined)
const BUDGET_SCRIPT_KB = 900    // 900 KB for main-page JS (hero + framework)

if (!existsSync(DIST)) {
  console.warn('[chunk-manifest] dist/ does not exist — run `npm run build` first.')
  process.exit(0)
}

if (!existsSync(CHUNKS)) {
  console.warn('[chunk-manifest] dist/_next/static/chunks/ not found — skipping.')
  process.exit(0)
}

// ── 1. Walk all JS chunks in dist ────────────────────────────────────────────
/** @type {Array<{ name: string, rawBytes: number }>} */
const chunks = readdirSync(CHUNKS)
  .filter(f => f.endsWith('.js'))
  .map(name => ({
    name,
    rawBytes: statSync(join(CHUNKS, name)).size,
  }))
  .sort((a, b) => b.rawBytes - a.rawBytes)

const totalRawBytes = chunks.reduce((s, c) => s + c.rawBytes, 0)
const totalRawKB    = Math.round(totalRawBytes / 1024)

// ── 2. App Router routes from .next ──────────────────────────────────────────
let routes = []
const appRoutesManifest = join(NEXT_DIR, 'app-path-routes-manifest.json')
if (existsSync(appRoutesManifest)) {
  try {
    const m = JSON.parse(readFileSync(appRoutesManifest, 'utf8'))
    routes = Object.keys(m).sort()
  } catch { /**/ }
}

// ── 3. Delta vs. previous manifest ───────────────────────────────────────────
let deltaKB  = null
let prevKB   = null
let prevChunkMap = {}

if (existsSync(OUT_FILE)) {
  try {
    const prev = JSON.parse(readFileSync(OUT_FILE, 'utf8'))
    prevKB   = prev.totalRawKB ?? null
    deltaKB  = prevKB !== null ? totalRawKB - prevKB : null
    // Build a name→rawKB map for per-chunk deltas
    for (const c of prev.largestChunks ?? []) {
      prevChunkMap[c.name] = c.rawKB
    }
  } catch { /**/ }
}

// ── 4. Budget evaluation ─────────────────────────────────────────────────────
const withinBudget  = totalRawKB <= BUDGET_TOTAL_KB
const scriptTotal   = chunks.filter(c => !c.name.includes('css')).reduce((s, c) => s + c.rawBytes, 0)
const scriptKB      = Math.round(scriptTotal / 1024)

// ── 5. Write dist/chunk-manifest.json ────────────────────────────────────────
const output = {
  generatedAt:   new Date().toISOString(),
  chunkCount:    chunks.length,
  totalRawBytes,
  totalRawKB,
  deltaKB,
  largestChunks: chunks.slice(0, 20).map(c => {
    const rawKB = Math.round(c.rawBytes / 1024)
    const entry = { name: c.name, rawBytes: c.rawBytes, rawKB }
    if (prevChunkMap[c.name] !== undefined) {
      entry.deltaKB = rawKB - prevChunkMap[c.name]
    }
    return entry
  }),
  routes,
  routeCount: routes.length,
  budgets: {
    totalBudgetKB:  BUDGET_TOTAL_KB,
    withinBudget,
    scriptBudgetKB: BUDGET_SCRIPT_KB,
    scriptKB,
    scriptWithinBudget: scriptKB <= BUDGET_SCRIPT_KB,
  },
}

writeFileSync(OUT_FILE, JSON.stringify(output, null, 2))

// ── 6. Append to bundle-history.json (for per-release trend) ─────────────────
const dataDir = join(ROOT, 'public', 'data')
if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true })

let history = []
if (existsSync(PREV_FILE)) {
  try { history = JSON.parse(readFileSync(PREV_FILE, 'utf8')) } catch { /**/ }
}

history.push({
  generatedAt:  output.generatedAt,
  totalRawKB,
  chunkCount:   chunks.length,
  deltaKB,
  scriptKB,
  withinBudget,
  routeCount:   routes.length,
})

// Keep last 20 releases
if (history.length > 20) history = history.slice(-20)

writeFileSync(PREV_FILE, JSON.stringify(history, null, 2))

// ── 7. Console summary ────────────────────────────────────────────────────────
const delta  = deltaKB !== null ? ` (${deltaKB >= 0 ? '+' : ''}${deltaKB} KB vs prev)` : ''
const budget = withinBudget ? '✅' : '❌'
console.log(
  `[chunk-manifest] ${budget} ${chunks.length} chunks · ${totalRawKB} KB total${delta} · ${routes.length} routes`,
)
if (!withinBudget) {
  console.warn(`[chunk-manifest] ❌ Over budget: ${totalRawKB} KB > ${BUDGET_TOTAL_KB} KB limit`)
}
