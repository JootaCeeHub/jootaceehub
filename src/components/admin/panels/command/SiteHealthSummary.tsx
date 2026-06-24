'use client'

import { useAdmin } from '@/lib/admin/store'
import { CheckCircle2, AlertTriangle, Circle, TrendingUp, TrendingDown } from 'lucide-react'

// ── Score ring ─────────────────────────────────────────────────────────────────

function ScoreRing({ score, size = 44, stroke = 4, color }: { score: number; size?: number; stroke?: number; color: string }) {
  const r    = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const dash = circ * (score / 100)
  return (
    <svg width={size} height={size} className="-rotate-90" style={{ minWidth: size }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.8s ease' }} />
    </svg>
  )
}

// ── Domain score card ──────────────────────────────────────────────────────────

function DomainCard({ label, score, detail, color, accent }: {
  label: string; score: number; detail: string; color: string; accent: string
}) {
  const status = score >= 75 ? 'ok' : score >= 40 ? 'warn' : 'empty'
  const Icon   = status === 'ok' ? CheckCircle2 : status === 'warn' ? AlertTriangle : Circle
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-white/8 bg-white/[0.02] p-3">
      <div className="flex items-center gap-2">
        <div className="relative shrink-0">
          <ScoreRing score={score} size={36} stroke={3} color={color} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-[9px] font-bold" style={{ color }}>{score}</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-medium text-white/70">{label}</div>
          <div className="font-mono text-[8px] text-white/30 truncate mt-0.5">{detail}</div>
        </div>
        <Icon className="h-3 w-3 shrink-0" style={{ color: accent }} />
      </div>
      <div className="h-px w-full rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color, opacity: 0.5, transition: 'width 0.8s ease' }} />
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────

export function SiteHealthSummary() {
  const { state, dispatch } = useAdmin()

  // Content domain
  const pubProjects  = state.projectsRegistry.filter(p => p.published).length
  const totalPrj     = state.projectsRegistry.length
  const pubArticles  = state.researchRegistry.filter(r => r.published).length
  const totalArt     = state.researchRegistry.length
  const visLabs      = state.labsRegistry.filter(l => l.visible).length
  const totalLabs    = state.labsRegistry.length
  const visSys       = state.systemsRegistry.filter(s => s.visible).length
  const totalSys     = state.systemsRegistry.length

  const contentScore = Math.round((
    (totalPrj  > 0 ? pubProjects  / totalPrj  : 0) * 25 +
    (totalArt  > 0 ? pubArticles  / totalArt  : 0) * 25 +
    (totalLabs > 0 ? visLabs      / totalLabs : 0) * 25 +
    (totalSys  > 0 ? visSys       / totalSys  : 0) * 25
  ) * 100) / 100

  // Infrastructure domain
  const runningNodes  = state.infraConfig.nodes.filter(n => n.status === 'running').length
  const totalNodes    = state.infraConfig.nodes.length
  const onlineSystems = state.systemsRegistry.filter(s => s.status === 'operational').length
  const infraScore    = totalNodes > 0
    ? Math.round((runningNodes / totalNodes * 60 + (onlineSystems / Math.max(1, totalSys)) * 40) * 100) / 100
    : 50

  // Design domain
  const hero = state.content?.hero
  const heroChecks = [
    (hero?.title?.length ?? 0) > 5,
    (hero?.subtitle?.length ?? 0) > 10,
    (hero?.primaryBtnText?.length ?? 0) > 0,
  ]
  const about = state.aboutConfig
  const aboutChecks = [
    (about?.headline?.length ?? 0) > 3,
    (about?.bio?.length ?? 0) > 20,
    (about?.skills?.length ?? 0) > 0,
  ]
  const identityScore = Math.round(
    ([...heroChecks, ...aboutChecks].filter(Boolean).length / (heroChecks.length + aboutChecks.length)) * 100
  )

  // Integrations domain
  const ghUser = state.githubConfig?.username ?? ''
  const feeds  = state.intelligence?.feeds?.filter((f: { connected?: boolean }) => f.connected).length ?? 0
  const integrationScore = Math.round(
    ((ghUser ? 1 : 0) * 50 + Math.min(feeds / 3, 1) * 50)
  )

  // Global
  const globalScore = Math.round((contentScore + infraScore + identityScore + integrationScore) / 4)
  const globalColor = globalScore >= 75 ? '#34d399' : globalScore >= 50 ? '#fbbf24' : '#f87171'

  const enabledBlocks = state.blocks.filter(b => b.enabled).length
  const totalBlocks   = state.blocks.length

  return (
    <div className="overflow-hidden rounded-xl border border-violet-400/12 bg-violet-400/[0.015]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-violet-400/8 px-4 py-2.5">
        <TrendingUp className="h-3 w-3 text-violet-400/60 shrink-0" />
        <span className="flex-1 font-mono text-[9.5px] uppercase tracking-[0.18em] text-violet-400/60">
          Site Health Summary
        </span>
        <button
          onClick={() => dispatch({ type: 'SET_PANEL', payload: 'analytics' })}
          className="font-mono text-[8.5px] text-white/25 hover:text-white/55 transition-colors">
          Analytics →
        </button>
      </div>

      <div className="p-3 space-y-3">
        {/* Global score row */}
        <div className="flex items-center gap-4 rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
          {/* Big ring */}
          <div className="relative shrink-0">
            <ScoreRing score={globalScore} size={52} stroke={4} color={globalColor} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-mono text-[13px] font-bold" style={{ color: globalColor }}>{globalScore}</span>
            </div>
          </div>
          {/* Status text */}
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              {globalScore >= 75
                ? <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                : globalScore >= 50
                ? <AlertTriangle className="h-3 w-3 text-amber-400" />
                : <Circle className="h-3 w-3 text-red-400/60" />}
              <span className="text-[12px] font-medium text-white/75">
                {globalScore >= 75 ? 'Sitio en buen estado' : globalScore >= 50 ? 'Requiere atención' : 'Configuración incompleta'}
              </span>
            </div>
            <div className="flex flex-wrap gap-3 mt-1.5">
              <span className="font-mono text-[8px] text-white/30">{enabledBlocks}/{totalBlocks} bloques ON</span>
              <span className="font-mono text-[8px] text-white/30">{pubProjects}/{totalPrj} proyectos</span>
              <span className="font-mono text-[8px] text-white/30">{pubArticles}/{totalArt} artículos</span>
            </div>
          </div>
          {/* Trend micro */}
          <div className="flex flex-col items-center gap-0.5 shrink-0">
            {globalScore >= 60
              ? <TrendingUp className="h-3 w-3 text-emerald-400/60" />
              : <TrendingDown className="h-3 w-3 text-red-400/60" />}
            <span className="font-mono text-[7px] text-white/20">score</span>
          </div>
        </div>

        {/* Domain scores */}
        <div className="grid grid-cols-2 gap-2">
          <DomainCard
            label="Contenido"
            score={Math.round(contentScore)}
            detail={`${pubProjects}prj · ${pubArticles}art · ${visLabs}labs`}
            color="#a78bfa"
            accent={contentScore >= 75 ? '#34d399' : '#fbbf24'}
          />
          <DomainCard
            label="Infraestructura"
            score={Math.round(infraScore)}
            detail={`${runningNodes}/${totalNodes} nodos · ${onlineSystems} online`}
            color="#38bdf8"
            accent={infraScore >= 75 ? '#34d399' : '#fbbf24'}
          />
          <DomainCard
            label="Identidad"
            score={identityScore}
            detail={`Hero ${heroChecks.filter(Boolean).length}/${heroChecks.length} · About ${aboutChecks.filter(Boolean).length}/${aboutChecks.length}`}
            color="#f472b6"
            accent={identityScore >= 75 ? '#34d399' : '#fbbf24'}
          />
          <DomainCard
            label="Integraciones"
            score={integrationScore}
            detail={`${ghUser ? `@${ghUser}` : 'No GitHub'} · ${feeds} feeds`}
            color="#fb923c"
            accent={integrationScore >= 75 ? '#34d399' : '#fbbf24'}
          />
        </div>
      </div>
    </div>
  )
}
