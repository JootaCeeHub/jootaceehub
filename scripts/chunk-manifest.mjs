/**
 * Postbuild: generate dist/chunk-manifest.json
 *
 * App Router + Turbopack does not ship a per-route chunk table in build-manifest.json
 * (that file only covers Pages Router). Instead, this script:
 *   1. Walks dist/_next/static/chunks/ for raw byte sizes
 *   2. Reads app-path-routes-manifest.json for the list of App Router routes
 *   3. Reads prerender-manifest.json for SSG route data
 *   4. Writes a compact summary to dist/chunk-manifest.json
 *
 * Output shape:
 * {
 *   generatedAt:   string,
 *   chunkCount:    number,
 *   totalRawBytes: number,
 *   largestChunks: Array<{ name, rawBytes, rawKB }>,
 *   routes:        string[],
 *   routeCount:    number,
 * }
 */

import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs'
import { join } from 'node:path'

const ROOT      = process.cwd()
const DIST      = join(ROOT, 'dist')
const NEXT_DIR  = join(ROOT, '.next')
const CHUNKS    = join(DIST, '_next', 'static', 'chunks')
const OUT_FILE  = join(DIST, 'chunk-manifest.json')

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

// ── 2. App Router routes from .next ──────────────────────────────────────────
let routes = []
const appRoutesManifest = join(NEXT_DIR, 'app-path-routes-manifest.json')
if (existsSync(appRoutesManifest)) {
  try {
    const m = JSON.parse(readFileSync(appRoutesManifest, 'utf8'))
    routes = Object.keys(m).sort()
  } catch { /**/ }
}

// ── 3. Write output ───────────────────────────────────────────────────────────
const output = {
  generatedAt:   new Date().toISOString(),
  chunkCount:    chunks.length,
  totalRawBytes,
  totalRawKB:    Math.round(totalRawBytes / 1024),
  largestChunks: chunks.slice(0, 15).map(c => ({
    name:     c.name,
    rawBytes: c.rawBytes,
    rawKB:    Math.round(c.rawBytes / 1024),
  })),
  routes,
  routeCount: routes.length,
}

writeFileSync(OUT_FILE, JSON.stringify(output, null, 2))
console.log(
  `[chunk-manifest] wrote dist/chunk-manifest.json — ${chunks.length} chunks · ${Math.round(totalRawBytes / 1024)} KB total · ${routes.length} routes`
)
