'use client'

import React, { useState } from 'react'
import { CheckCircle2, Circle, ChevronDown, ChevronRight, Server, Lock, FileJson, GitCommit, Image, Layers, Zap, RotateCcw, ScrollText, Shield } from 'lucide-react'

interface VPSGoal {
  id: string
  title: string
  description: string
  status: 'done' | 'pending'
  icon: React.ComponentType<{ className?: string }>
  files: string[]
  endpoints?: string[]
}

const VPS_GOALS: VPSGoal[] = [
  {
    id: 'content-api',
    title: 'Content API — Hono Server',
    description: 'Hono 4 HTTP server on Node.js with CORS, request logger, global error handler, and health check endpoint. Serves as the single entry point for all content mutations from the admin panel.',
    status: 'done',
    icon: Server,
    files: ['api/src/index.ts', 'api/src/types.ts', 'api/src/env.ts', 'api/package.json', 'api/tsconfig.json'],
    endpoints: ['GET /health'],
  },
  {
    id: 'auth',
    title: 'JWT Auth + Rate Limiting',
    description: 'Stateless JWT authentication (HS256 via jose). Password verified with Node.js scrypt (timingSafeEqual — no bcrypt dependency). In-memory rate limiter: max 5 failed attempts per IP per 15 minutes. Auth middleware injects actor into Hono context.',
    status: 'done',
    icon: Lock,
    files: ['api/src/auth/jwt.ts', 'api/src/auth/middleware.ts', 'api/src/routes/auth.ts'],
    endpoints: ['POST /auth/login', 'GET /auth/me'],
  },
  {
    id: 'read-write',
    title: 'Content Read/Write',
    description: 'CRUD operations for all content types (systems, labs, projects, research, resources, articles, collections, taxonomies). Path-traversal protection via resolve() prefix assertion. JSON types validated with Zod; MDX types accepted as raw text/plain.',
    status: 'done',
    icon: FileJson,
    files: ['api/src/routes/content.ts', 'api/src/lib/content-store.ts'],
    endpoints: ['GET /content', 'GET /content/:type/:slug', 'PUT /content/:type/:slug', 'DELETE /content/:type/:slug'],
  },
  {
    id: 'zod-validation',
    title: 'Zod Validation — All Content Types',
    description: 'Schema validation for all 8 content types. SystemSchema, LabSchema, ProjectSchema, ResearchSchema, ResourceCategorySchema, ArticleFrontmatterSchema, and more. CONTENT_SCHEMAS map dispatches validation by content type string.',
    status: 'done',
    icon: Shield,
    files: ['api/src/validation/schemas.ts'],
  },
  {
    id: 'git-commit',
    title: 'Git Commit + Push',
    description: 'simple-git wrapper for staging, committing, and pushing content changes. Supports committing specific files or all src/content/ changes. Log endpoint filters to content-only commits. Git user set from env before every operation.',
    status: 'done',
    icon: GitCommit,
    files: ['api/src/lib/git-ops.ts', 'api/src/routes/git.ts'],
    endpoints: ['GET /git/status', 'GET /git/log', 'POST /git/commit', 'POST /git/rollback'],
  },
  {
    id: 'media-upload',
    title: 'Media Upload — WebP Conversion',
    description: 'Multipart file upload with sharp image processing. Converts any image to WebP, resizes if wider than 2400px, writes to MEDIA_ROOT. Path-traversal protection on delete. Returns URL, dimensions, and file size.',
    status: 'done',
    icon: Image,
    files: ['api/src/lib/media-ops.ts', 'api/src/routes/media.ts'],
    endpoints: ['POST /media', 'GET /media', 'DELETE /media/*'],
  },
  {
    id: 'build-queue',
    title: 'Build Queue',
    description: 'In-memory build job queue. Only one build can run at a time (409 if already building). Spawns npm run build in REPO_ROOT, streams output to job log array. Calls atomic deploy on success. Full job history retained in memory.',
    status: 'done',
    icon: Layers,
    files: ['api/src/lib/build-queue.ts', 'api/src/routes/build.ts'],
    endpoints: ['POST /build/trigger', 'GET /build/status/:id', 'GET /build/history'],
  },
  {
    id: 'atomic-deploy',
    title: 'Atomic Deploy — Blue/Green',
    description: 'Blue-green deployment via Nginx symlink swap. Copies dist/ into the inactive slot, then atomically updates the NGINX_ROOT symlink. Nginx never serves a partial build. Slot detection reads the current symlink target.',
    status: 'done',
    icon: Zap,
    files: ['api/src/lib/atomic-deploy.ts'],
  },
  {
    id: 'rollback',
    title: 'Git Rollback',
    description: 'git revert --no-edit <hash> + push. Returns the new revert commit hash and original. Also exposes rollbackDeploy() in atomic-deploy.ts to swap the Nginx symlink back to the previous slot without a full rebuild.',
    status: 'done',
    icon: RotateCcw,
    files: ['api/src/lib/atomic-deploy.ts', 'api/src/routes/git.ts'],
    endpoints: ['POST /git/rollback'],
  },
  {
    id: 'audit-log',
    title: 'Audit Log — Append-Only NDJSON',
    description: 'Every protected mutation appends an AuditEntry to an NDJSON file. Write queue (promise chain) prevents line interleaving under concurrent requests. Filterable by actor, action type, and date range. Directory + file created on first write.',
    status: 'done',
    icon: ScrollText,
    files: ['api/src/lib/audit-log.ts', 'api/src/routes/audit.ts'],
    endpoints: ['GET /audit'],
  },
]

const INFRA_FILES = [
  { path: 'api/Dockerfile', desc: 'Two-stage Node 22-alpine build, non-root user, HEALTHCHECK' },
  { path: 'api/.env.example', desc: '16 documented env vars with generation instructions' },
  { path: 'api/nginx.conf', desc: 'HTTPS, /api proxy, blue-green static root, gzip, security headers' },
]

const ALL_ENDPOINTS = VPS_GOALS.flatMap((g) =>
  (g.endpoints ?? []).map((ep) => ({ endpoint: ep, goal: g.title })),
)

export function Phase3VPSTab() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })

  const doneCount = VPS_GOALS.filter((g) => g.status === 'done').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-white/8 bg-white/3 px-5 py-4">
        <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.24em] text-violet-400/60">Phase 3 — Backend VPS</div>
        <h2 className="text-base font-semibold text-white/90">Content API — Hono VPS Server</h2>
        <p className="mt-1 font-mono text-[10px] text-white/35">
          Separate Node.js server deployed on Hostinger VPS. Admin panel calls this API via HTTPS + JWT to write content files, trigger Git commits, and execute atomic deploys.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/8 px-3 py-1 font-mono text-[9px] text-emerald-400">
            {doneCount}/{VPS_GOALS.length} goals done
          </span>
          <span className="rounded-full border border-white/10 bg-white/4 px-3 py-1 font-mono text-[9px] text-white/40">
            {ALL_ENDPOINTS.length} HTTP endpoints
          </span>
          <span className="rounded-full border border-violet-400/20 bg-violet-400/8 px-3 py-1 font-mono text-[9px] text-violet-400">
            Hono 4 · Jose · simple-git · sharp · Zod
          </span>
          <span className="rounded-full border border-sky-400/20 bg-sky-400/8 px-3 py-1 font-mono text-[9px] text-sky-400">
            Blue-green atomic deploy
          </span>
          <span className="rounded-full border border-amber-400/20 bg-amber-400/8 px-3 py-1 font-mono text-[9px] text-amber-400">
            Append-only audit log
          </span>
        </div>
      </div>

      {/* Architecture diagram */}
      <div className="rounded-xl border border-white/8 bg-white/3 px-5 py-4">
        <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">Architecture</div>
        <div className="rounded-lg border border-white/6 bg-black/20 p-4 font-mono text-[10px] text-white/50 leading-relaxed">
          <span className="text-violet-400">Admin Panel</span> (static Next.js){' '}
          <span className="text-white/25">→ HTTPS + JWT →</span>{' '}
          <span className="text-emerald-400">Content API</span> (Hono, api/src/index.ts)<br />
          {'  '}<span className="text-white/25">├──</span> <span className="text-sky-400">Auth</span>
          {'  '}scrypt hash · JWT HS256 · rate limit<br />
          {'  '}<span className="text-white/25">├──</span> <span className="text-sky-400">Content</span>
          {'  '}Zod validation · file I/O · path-traversal guard<br />
          {'  '}<span className="text-white/25">├──</span> <span className="text-sky-400">Git</span>
          {'  '}simple-git · commit · push · revert<br />
          {'  '}<span className="text-white/25">├──</span> <span className="text-sky-400">Media</span>
          {'  '}sharp → WebP · 2400px max · size limit<br />
          {'  '}<span className="text-white/25">├──</span> <span className="text-sky-400">Build</span>
          {'  '}job queue · spawn npm build · atomic deploy<br />
          {'  '}<span className="text-white/25">└──</span> <span className="text-sky-400">Audit</span>
          {'  '}NDJSON · append-only · write-queue serialised<br />
          <br />
          <span className="text-white/25">Nginx</span> symlink: NGINX_ROOT →{' '}
          <span className="text-amber-400">dist-blue</span>{' '}|{' '}
          <span className="text-amber-400">dist-green</span>{' '}
          <span className="text-white/25">(atomic swap, never partial)</span>
        </div>
      </div>

      {/* Goals */}
      <div>
        <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">Implementation Goals</div>
        <div className="space-y-2">
          {VPS_GOALS.map((goal) => {
            const Icon = goal.icon
            const open = expanded.has(goal.id)
            return (
              <div key={goal.id} className="rounded-xl border border-white/8 bg-white/3 overflow-hidden">
                <button
                  onClick={() => toggle(goal.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/3 transition-colors"
                >
                  {goal.status === 'done'
                    ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                    : <Circle className="h-4 w-4 shrink-0 text-white/20" />}
                  <Icon className="h-3.5 w-3.5 shrink-0 text-violet-400/70" />
                  <span className="flex-1 font-mono text-[11px] text-white/75">{goal.title}</span>
                  <span className={`rounded-full px-2 py-0.5 font-mono text-[8px] ${goal.status === 'done' ? 'border border-emerald-400/20 bg-emerald-400/8 text-emerald-400' : 'border border-white/10 bg-white/4 text-white/30'}`}>
                    {goal.status}
                  </span>
                  {open ? <ChevronDown className="h-3 w-3 text-white/30" /> : <ChevronRight className="h-3 w-3 text-white/30" />}
                </button>
                {open && (
                  <div className="border-t border-white/6 px-4 pb-4 pt-3 space-y-3">
                    <p className="font-mono text-[10px] text-white/45 leading-relaxed">{goal.description}</p>
                    <div>
                      <div className="mb-1.5 font-mono text-[8px] uppercase tracking-[0.15em] text-white/25">Files</div>
                      <div className="flex flex-wrap gap-1.5">
                        {goal.files.map((f) => (
                          <span key={f} className="rounded border border-white/8 bg-white/4 px-2 py-0.5 font-mono text-[9px] text-white/45">{f}</span>
                        ))}
                      </div>
                    </div>
                    {goal.endpoints && goal.endpoints.length > 0 && (
                      <div>
                        <div className="mb-1.5 font-mono text-[8px] uppercase tracking-[0.15em] text-white/25">Endpoints</div>
                        <div className="flex flex-wrap gap-1.5">
                          {goal.endpoints.map((ep) => (
                            <span key={ep} className="rounded border border-sky-400/15 bg-sky-400/6 px-2 py-0.5 font-mono text-[9px] text-sky-400/70">{ep}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Endpoint reference */}
      <div className="rounded-xl border border-white/8 bg-white/3 px-5 py-4">
        <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
          All Endpoints ({ALL_ENDPOINTS.length})
        </div>
        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
          {ALL_ENDPOINTS.map(({ endpoint }) => {
            const [method, ...rest] = endpoint.split(' ')
            const path = rest.join(' ')
            const methodColor: Record<string, string> = {
              GET: 'text-emerald-400',
              POST: 'text-sky-400',
              PUT: 'text-amber-400',
              DELETE: 'text-rose-400',
            }
            return (
              <div key={endpoint} className="flex items-center gap-2 rounded-lg border border-white/6 bg-white/2 px-3 py-2">
                <span className={`w-10 shrink-0 font-mono text-[9px] font-bold ${methodColor[method] ?? 'text-white/40'}`}>{method}</span>
                <span className="flex-1 font-mono text-[9px] text-white/55 truncate">{path}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Infrastructure files */}
      <div className="rounded-xl border border-white/8 bg-white/3 px-5 py-4">
        <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">Infrastructure Files</div>
        <div className="space-y-2">
          {INFRA_FILES.map((f) => (
            <div key={f.path} className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
              <div>
                <span className="font-mono text-[10px] text-white/65">{f.path}</span>
                <span className="ml-2 font-mono text-[10px] text-white/30">— {f.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deploy checklist */}
      <div className="rounded-xl border border-amber-400/15 bg-amber-400/4 px-5 py-4">
        <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.2em] text-amber-400/60">VPS Deploy Checklist</div>
        <div className="space-y-1.5 font-mono text-[10px] text-white/50">
          {[
            'Set all env vars from api/.env.example on Hostinger VPS',
            'Run: cd api && npm install && npm run build',
            'Start with: NODE_ENV=production node dist/index.js (or PM2)',
            'Verify: curl https://jootacee.com/api/health',
            'Set NEXT_PUBLIC_CONTENT_API_URL=https://jootacee.com/api in Cloudflare Pages',
            'Wire admin panel → Content API calls via NEXT_PUBLIC_CONTENT_API_URL',
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0 text-amber-400/50">{i + 1}.</span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
