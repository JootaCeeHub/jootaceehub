'use client'

import React from 'react'
import {
  CheckCircle2, CircleDashed, Clock, Server, Shield, GitBranch,
  Globe, Link2, Calendar, RotateCcw, Radio, HardDrive, FileEdit,
  Eye, Archive, Layers,
} from 'lucide-react'
import { useAdmin } from '@/lib/admin/store'

// ─── Types ────────────────────────────────────────────────────────────────────

type LucideIcon = React.FC<React.SVGProps<SVGSVGElement> & { className?: string }>

interface MaturityItem {
  label: string
  icon: LucideIcon
  layer: 'client' | 'vps' | 'both'
  done: boolean
  where: string
  detail: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Phase3CmsTab() {
  const { state } = useAdmin()

  const auditCount    = state.auditLog?.length ?? 0
  const localeCount   = state.localeRelations?.length ?? 0
  const relCount      = state.contentRelations?.length ?? 0
  const schedules     = state.publishSchedules ?? []
  const pendingCount  = schedules.filter((s) => s.status === 'pending').length
  const revisionCount = state.revisionLog?.length ?? 0

  const items: MaturityItem[] = [
    {
      label: 'Publish endpoint seguro',
      icon: Shield,
      layer: 'vps',
      done: false,
      where: 'Hostinger VPS — Hono API (Phase 3 VPS)',
      detail: 'PUT /content/:type/:id con JWT auth, rate-limit, CORS origin allow-list y Zod body validation. Static export no admite API routes — requiere VPS backend.',
    },
    {
      label: 'Persistir portfolio content remotamente',
      icon: Server,
      layer: 'vps',
      done: false,
      where: 'VPS file system + Git push webhook',
      detail: 'Admin escribe → VPS escribe JSON en src/content/ → git commit + push → Cloudflare Pages trigger build. AdminState es la interfaz de edición; Git es la fuente canónica.',
    },
    {
      label: 'Preview real desde canonical source',
      icon: Eye,
      layer: 'client',
      done: true,
      where: 'src/content/*.json + AdminState + ContentRepository adapter',
      detail: 'Admin panel muestra el estado vivo de AdminState como preview. Build-time: HTML generado desde src/content/ via static export. createMdxContentAdapter() y createRegistryAdapter() listos.',
    },
    {
      label: 'Revisions durables',
      icon: GitBranch,
      layer: 'both',
      done: true,
      where: 'lib/admin/slices/cms.ts — revisionLog (max 50)',
      detail: `${revisionCount}/50 revisiones en localStorage. LOG_REVISION · CLEAR_REVISIONS · RESTORE_REVISION implementados. Git history en VPS proveerá durabilidad ilimitada en Phase 3 VPS.`,
    },
    {
      label: 'Audit log',
      icon: Archive,
      layer: 'client',
      done: true,
      where: 'AdminState.auditLog — LOG_AUDIT action (max 200)',
      detail: `${auditCount} entradas en audit log. Campos: action · contentType · contentId · contentSlug · previousStatus → newStatus · metadata. Append-only, FIFO prune a 200.`,
    },
    {
      label: 'Slug uniqueness',
      icon: FileEdit,
      layer: 'client',
      done: true,
      where: 'lib/content/canonical-id.ts — checkSlugUniqueness()',
      detail: 'checkSlugUniqueness(slug, type, existingIds, excludeId?) → { unique, collisions[] }. Usa canonical IDs type:slug para detección de colisiones cross-type. Expuesto via loaders.ts.',
    },
    {
      label: 'Locale relations',
      icon: Globe,
      layer: 'client',
      done: true,
      where: 'AdminState.localeRelations — SET_LOCALE_RELATION · REMOVE_LOCALE_RELATION',
      detail: `${localeCount} relaciones activas. Vincula enId ↔ esId del mismo contenido por contentType. SET_LOCALE_RELATION de-duplica automáticamente por (contentType, enId|esId).`,
    },
    {
      label: 'Content relations',
      icon: Link2,
      layer: 'client',
      done: true,
      where: 'AdminState.contentRelations — ADD_CONTENT_RELATION · REMOVE_CONTENT_RELATION',
      detail: `${relCount} relaciones activas. Tipos: related · references · part-of · supersedes. Cross-type (project→research, lab→project, etc.). Validados por Zod ContentRelationSchema.`,
    },
    {
      label: 'Scheduler',
      icon: Calendar,
      layer: 'client',
      done: true,
      where: 'AdminState.publishSchedules — SCHEDULE_PUBLISH · CANCEL_SCHEDULE · APPLY_SCHEDULED_PUBLISHES',
      detail: `${pendingCount} schedules pendientes. APPLY_SCHEDULED_PUBLISHES se ejecuta on mount — auto-publica items cuyo scheduledAt ≤ now. Status: pending → applied | cancelled.`,
    },
    {
      label: 'Rollback',
      icon: RotateCcw,
      layer: 'client',
      done: true,
      where: 'lib/admin/slices/cms.ts — RESTORE_REVISION',
      detail: 'RESTORE_REVISION dispersa el snapshot de ContentRevision de vuelta al registry correspondiente y auto-registra la acción como nueva revisión con nota "Rolled back to: …".',
    },
    {
      label: 'Multi-device sync',
      icon: Radio,
      layer: 'client',
      done: true,
      where: 'lib/admin/store.tsx — BroadcastChannel("jootacee-admin-sync")',
      detail: 'BroadcastChannel sincroniza AdminState entre tabs del mismo origen. On save (debounce 800ms): emite STATE_SYNC. On receive: valida con AdminStateSchema antes de dispatch IMPORT_STATE.',
    },
    {
      label: 'Backup remoto',
      icon: HardDrive,
      layer: 'vps',
      done: false,
      where: 'VPS cron + Git bundle → Cloudflare R2',
      detail: 'Git bundle nightly vía cron en VPS → upload a Cloudflare R2. Admin puede disparar manual via deploy webhook. Static export no puede escribir archivos — requiere VPS.',
    },
  ]

  const done   = items.filter((i) => i.done).length
  const client = items.filter((i) => i.layer === 'client' && i.done).length
  const vps    = items.filter((i) => i.layer === 'vps' && !i.done).length

  const layerBadge = (layer: MaturityItem['layer']) => {
    if (layer === 'client') return 'bg-emerald-400/10 text-emerald-400/80 border-emerald-400/20'
    if (layer === 'vps')    return 'bg-amber-400/10 text-amber-400/80 border-amber-400/20'
    return 'bg-sky-400/10 text-sky-400/80 border-sky-400/20'
  }
  const layerLabel = (layer: MaturityItem['layer']) => {
    if (layer === 'client') return 'client'
    if (layer === 'vps')    return 'vps req.'
    return 'both'
  }

  return (
    <div className="space-y-4 py-2">

      {/* Header metrics */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {[
          { label: 'Total items',      value: items.length,         accent: 'text-white/70'       },
          { label: 'Complete',         value: `${done}/${items.length}`, accent: 'text-emerald-400' },
          { label: 'Client-side done', value: client,               accent: 'text-sky-400'        },
          { label: 'VPS pending',      value: vps,                  accent: 'text-amber-400'      },
        ].map(({ label, value, accent }) => (
          <div key={label} className="rounded-xl border border-white/6 bg-white/[0.025] px-3 py-2.5 text-center">
            <p className={`font-mono text-xl font-bold ${accent}`}>{value}</p>
            <p className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.15em] text-white/30">{label}</p>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 px-1">
        {([
          { layer: 'client', label: 'Client-side (implementado)' },
          { layer: 'both',   label: 'Client + VPS' },
          { layer: 'vps',    label: 'Requiere VPS backend' },
        ] as const).map(({ layer, label }) => (
          <span key={layer} className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-[8px] ${layerBadge(layer)}`}>
            {layerLabel(layer)} — {label}
          </span>
        ))}
      </div>

      {/* Item grid */}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {items.map(({ label, icon: Icon, layer, done: isDone, where, detail }) => (
          <div
            key={label}
            className={`rounded-xl border px-3 py-2.5 ${isDone
              ? 'border-emerald-500/15 bg-emerald-500/[0.04]'
              : 'border-amber-500/15 bg-amber-500/[0.025]'
            }`}
          >
            <div className="flex items-start gap-2">
              {isDone
                ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400/80" />
                : <CircleDashed  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400/50" />
              }
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Icon className="h-3 w-3 text-white/30 shrink-0" />
                  <span className="font-mono text-[9px] font-medium text-white/75">{label}</span>
                  <span className={`inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-wide ${layerBadge(layer)}`}>
                    {layerLabel(layer)}
                  </span>
                </div>
                <p className="mt-1 font-mono text-[8px] text-sky-400/60 truncate">{where}</p>
                <p className="mt-0.5 font-mono text-[8px] text-white/30 leading-relaxed">{detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Live CMS counters */}
      <div className="rounded-xl border border-violet-500/15 bg-violet-500/[0.025] px-4 py-3 space-y-2">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-violet-400/70">
          Live CMS State — AdminState counters
        </p>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {[
            { label: 'Audit entries',      value: auditCount,       max: 200,  Icon: Archive  },
            { label: 'Revisions',          value: revisionCount,    max: 50,   Icon: GitBranch },
            { label: 'Locale relations',   value: localeCount,      max: null, Icon: Globe    },
            { label: 'Content relations',  value: relCount,         max: null, Icon: Link2    },
            { label: 'Pending schedules',  value: pendingCount,     max: null, Icon: Clock    },
            { label: 'Total schedules',    value: schedules.length, max: null, Icon: Calendar },
          ].map(({ label, value, max, Icon: Ic }) => (
            <div key={label} className="flex items-center gap-2 rounded-lg bg-white/[0.025] px-2.5 py-2">
              <Ic className="h-3 w-3 shrink-0 text-white/25" />
              <div className="min-w-0">
                <p className="font-mono text-sm font-bold text-white/80">{value}{max ? `/${max}` : ''}</p>
                <p className="font-mono text-[8px] text-white/35 truncate">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scheduler live view */}
      {schedules.length > 0 && (
        <div className="rounded-xl border border-sky-500/15 bg-sky-500/[0.025] px-4 py-3 space-y-2">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-sky-400/70">
            Publish Schedules
          </p>
          <div className="space-y-1">
            {schedules.slice(0, 8).map((s) => (
              <div key={s.id} className="flex items-center gap-2 rounded-lg bg-white/[0.02] px-2.5 py-1.5">
                {s.status === 'applied'   && <CheckCircle2 className="h-3 w-3 text-emerald-400/70 shrink-0" />}
                {s.status === 'pending'   && <Clock        className="h-3 w-3 text-amber-400/70 shrink-0" />}
                {s.status === 'cancelled' && <CircleDashed  className="h-3 w-3 text-white/20 shrink-0" />}
                <span className="font-mono text-[8px] text-white/60 truncate">{s.contentType}/{s.contentSlug}</span>
                <span className="font-mono text-[8px] text-white/30 ml-auto shrink-0">{s.scheduledAt.slice(0, 16).replace('T', ' ')}</span>
                <span className={`font-mono text-[7px] rounded px-1 py-0.5 ${s.status === 'applied' ? 'bg-emerald-400/10 text-emerald-400/70' : s.status === 'pending' ? 'bg-amber-400/10 text-amber-400/70' : 'bg-white/5 text-white/20'}`}>
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent audit log */}
      {auditCount > 0 && (
        <div className="rounded-xl border border-white/6 bg-white/[0.01] px-4 py-3 space-y-2">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">
            Audit Log — {auditCount} entries (recent 6)
          </p>
          <div className="space-y-1">
            {(state.auditLog ?? []).slice(0, 6).map((e) => (
              <div key={e.id} className="flex items-center gap-2 rounded-lg bg-white/[0.02] px-2.5 py-1.5">
                <span className="font-mono text-[7px] uppercase rounded px-1.5 py-0.5 bg-violet-400/10 text-violet-400/70 shrink-0">{e.action}</span>
                <span className="font-mono text-[8px] text-white/50 truncate">{e.contentType}/{e.contentSlug}</span>
                {e.previousStatus && e.newStatus && (
                  <span className="font-mono text-[8px] text-white/30 shrink-0">{e.previousStatus} → {e.newStatus}</span>
                )}
                <span className="font-mono text-[8px] text-white/20 ml-auto shrink-0">{e.timestamp.slice(11, 16)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Phase 3 VPS roadmap */}
      <div className="rounded-xl border border-white/6 bg-white/[0.01] px-4 py-3">
        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/30 mb-2">
          VPS Backend — Items pendientes (requieren Hostinger VPS + Hono API)
        </p>
        <ul className="space-y-1.5">
          {[
            { Icon: Shield,    text: 'Publish endpoint: PUT /content/:type/:id — JWT auth + Zod validation + rate-limit' },
            { Icon: Server,    text: 'Remote write: VPS file write → git add + commit + push → Cloudflare Pages webhook' },
            { Icon: HardDrive, text: 'Remote backup: nightly git bundle → Cloudflare R2 upload via cron job' },
            { Icon: Layers,    text: 'Admin auth migration: Supabase/Google → VPS JWT (ADR-008 Phase 3)' },
          ].map(({ Icon: Ic, text }) => (
            <li key={text} className="flex items-start gap-2">
              <Ic className="mt-0.5 h-3 w-3 shrink-0 text-amber-400/40" />
              <span className="font-mono text-[9px] text-white/40">{text}</span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  )
}
