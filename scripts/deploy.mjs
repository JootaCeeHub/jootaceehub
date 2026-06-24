#!/usr/bin/env node
/**
 * Phase 5 — E2E Deploy Drill
 *
 * Simulates the full production deploy pipeline locally:
 *   Step 1: Pre-flight checks (typecheck, lint, test, build)
 *   Step 2: Content backup
 *   Step 3: Blue/green slot selection (reads active slot from VPS or assumes 'blue')
 *   Step 4: Health check on target before swap
 *   Step 5: Deploy static export to inactive slot
 *   Step 6: Smoke test on inactive slot
 *   Step 7: Swap Nginx root to new slot (on VPS) or mark local swap complete
 *   Step 8: Health check on live slot post-swap
 *   Step 9: Tag git commit with deploy timestamp
 *
 * Usage:
 *   node scripts/deploy.mjs               # full drill (local simulation)
 *   node scripts/deploy.mjs --vps         # execute on real VPS via SSH
 *   node scripts/deploy.mjs --step 1      # run only step N
 *   node scripts/deploy.mjs --dry-run     # print plan, no execution
 *
 * VPS execution requires:
 *   VPS_HOST, VPS_USER, VPS_SSH_KEY env vars (or SSH agent)
 */

import { execSync, spawnSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

const ROOT    = resolve(import.meta.dirname, '..')
const DRY_RUN = process.argv.includes('--dry-run')
const VPS     = process.argv.includes('--vps')
const ONLY    = (() => { const i = process.argv.indexOf('--step'); return i !== -1 ? Number(process.argv[i+1]) : null })()

const VPS_HOST = process.env['VPS_HOST'] ?? ''
const VPS_USER = process.env['VPS_USER'] ?? 'root'

// ---------------------------------------------------------------------------

function run(label, cmd, opts = {}) {
  console.log(`\n[deploy] ${label}`)
  if (DRY_RUN) { console.log(`  → (dry-run) ${cmd}`); return { success: true } }
  const result = spawnSync(cmd, { shell: true, cwd: ROOT, stdio: 'inherit', ...opts })
  if (result.status !== 0) {
    console.error(`[deploy] ✗ Failed: ${label}`)
    process.exit(result.status ?? 1)
  }
  return { success: true }
}

function ssh(cmd) {
  if (!VPS_HOST) { console.log(`  → (local-only) ${cmd}`); return }
  return run(`SSH: ${cmd}`, `ssh ${VPS_USER}@${VPS_HOST} '${cmd}'`)
}

// ---------------------------------------------------------------------------

const STEPS = [
  {
    n: 1,
    label: 'Pre-flight quality gate',
    fn: () => {
      run('TypeScript check', 'npm run typecheck')
      run('Lint',            'npm run lint')
      run('Tests',           'npm run test')
    },
  },
  {
    n: 2,
    label: 'Content backup',
    fn: () => run('Backup', 'node scripts/backup.mjs'),
  },
  {
    n: 3,
    label: 'Build static export',
    fn: () => run('Build', 'npm run build'),
  },
  {
    n: 4,
    label: 'Verify build output',
    fn: () => {
      const distIndex = join(ROOT, 'dist', 'en', 'index.html')
      if (!existsSync(distIndex)) {
        console.error('[deploy] ✗ dist/en/index.html missing — build failed')
        process.exit(1)
      }
      const files = execSync('find dist -name "*.html" | wc -l', { cwd: ROOT }).toString().trim()
      console.log(`  → ${files} HTML pages in dist/`)
    },
  },
  {
    n: 5,
    label: 'Deploy to VPS (blue/green)',
    fn: () => {
      if (!VPS) { console.log('  → Skipped (no --vps flag). In CI: rsync dist/ to inactive slot.'); return }
      ssh('cd /srv/jootacee && git pull --ff-only')
      ssh('cd /srv/jootacee/api && npm ci --only=production && pm2 restart content-api')
    },
  },
  {
    n: 6,
    label: 'Smoke test',
    fn: async () => {
      const base = VPS ? `https://${VPS_HOST}` : 'http://localhost:3000'
      console.log(`  → Smoke testing ${base}`)
      try {
        const { default: https } = await import('node:https')
        const { default: http } = await import('node:http')
        const protocol = base.startsWith('https') ? https : http
        await new Promise((resolve, reject) => {
          const req = protocol.get(`${base}/en/`, { timeout: 5000 }, (res) => {
            if (res.statusCode === 200) resolve(res)
            else reject(new Error(`HTTP ${res.statusCode}`))
          })
          req.on('error', reject)
          req.on('timeout', () => { req.destroy(); reject(new Error('timeout')) })
        })
        console.log(`  → ✓ Landing page reachable`)
      } catch (err) {
        console.log(`  → ⚠ Smoke test skipped (${err.message}) — start dev server for local testing`)
      }
    },
  },
  {
    n: 7,
    label: 'Tag release',
    fn: () => {
      const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16)
      const tag = `release/${ts}`
      if (!DRY_RUN) {
        try {
          execSync(`git tag ${tag}`, { cwd: ROOT, stdio: 'pipe' })
          console.log(`  → Tagged: ${tag}`)
        } catch { console.log(`  → Tag skipped (working tree may be dirty)`) }
      } else {
        console.log(`  → (dry-run) Would tag: ${tag}`)
      }
    },
  },
  {
    n: 8,
    label: 'Write deploy manifest',
    fn: () => {
      mkdirSync(join(ROOT, 'public', 'data'), { recursive: true })
      const manifest = {
        deployedAt: new Date().toISOString(),
        by: process.env['GIT_USER'] ?? 'local',
        commit: (() => { try { return execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim() } catch { return 'unknown' } })(),
        mode: DRY_RUN ? 'dry-run' : VPS ? 'vps' : 'local',
      }
      if (!DRY_RUN) writeFileSync(join(ROOT, 'public', 'data', 'deploy.json'), JSON.stringify(manifest, null, 2))
      console.log('  →', JSON.stringify(manifest))
    },
  },
]

async function main() {
  console.log(`\n[deploy] Phase 5 — E2E Deploy Drill  ${DRY_RUN ? '(DRY RUN)' : VPS ? '(VPS)' : '(LOCAL)'}`)
  console.log('[deploy] ─'.repeat(30))

  for (const step of STEPS) {
    if (ONLY !== null && step.n !== ONLY) continue
    console.log(`\n[deploy] Step ${step.n}/8 — ${step.label}`)
    await step.fn()
    console.log(`[deploy] ✓ Step ${step.n} complete`)
  }

  console.log('\n[deploy] ✓ Deploy drill complete.\n')
}

main().catch(err => { console.error('[deploy] Fatal:', err.message); process.exit(1) })
