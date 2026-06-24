'use client'

import { useAdmin } from '@/lib/admin/store'
import { cn } from '@/lib/utils'
import {
  PlusCircle, FileText, Image, Rocket, BookOpen, Link2, HardDrive, Rss,
  Navigation2, GitBranch, LayoutList, TrendingUp, FlaskConical, Cpu,
  Library, ChevronRight, CheckCircle2, Clock, Circle,
} from 'lucide-react'

// ── Sparkline bar (7-slot mini chart) ─────────────────────────────────────────

function MiniBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-1 w-full rounded-full bg-white/6 overflow-hidden mt-1.5">
      <div className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(100, pct)}%`, background: color, opacity: 0.7 }} />
    </div>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label:   string
  value:   number
  total:   number
  sub:     string
  icon:    React.ComponentType<{ className?: string }>
  accent:  string
  badge?:  { text: string; ok: boolean }
  onClick: () => void
}

function StatCard({ label, value, total, sub, icon: Icon, accent, badge, onClick }: StatCardProps) {
  const pct = total > 0 ? Math.round(value / total * 100) : (value > 0 ? 100 : 0)
  return (
    <button onClick={onClick}
      className="relative flex flex-col gap-2 p-3 rounded-xl bg-white/[0.025] border border-white/8 hover:bg-white/[0.04] hover:border-white/14 transition-all text-left overflow-hidden group">
      {/* Glow */}
      <div className="pointer-events-none absolute -right-3 -top-3 h-12 w-12 rounded-full blur-xl opacity-15"
        style={{ background: accent }} />
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg shrink-0"
          style={{ background: `${accent}18`, color: accent }}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        {badge && (
          <span className={cn('font-mono text-[7px] rounded px-1 py-0.5 border shrink-0',
            badge.ok
              ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/8'
              : 'text-white/25 border-white/10 bg-white/4')}>
            {badge.text}
          </span>
        )}
      </div>
      {/* Value */}
      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-[22px] font-bold tabular-nums leading-none" style={{ color: accent }}>{value}</span>
          {total > 0 && total !== value && (
            <span className="font-mono text-[9px] text-white/25">/ {total}</span>
          )}
        </div>
        <div className="font-mono text-[9px] text-white/50 mt-0.5">{label}</div>
        <div className="font-mono text-[7.5px] text-white/22 mt-0.5">{sub}</div>
      </div>
      {/* Progress bar */}
      {total > 0 && <MiniBar pct={pct} color={accent} />}
      {/* Right arrow on hover */}
      <ChevronRight className="absolute right-2 bottom-2 h-2.5 w-2.5 text-white/0 group-hover:text-white/20 transition-colors" />
    </button>
  )
}

// ── Status dot helper ──────────────────────────────────────────────────────────

function StatusDot({ ok, pulse = false }: { ok: boolean; pulse?: boolean }) {
  return (
    <span className={cn('h-1.5 w-1.5 rounded-full shrink-0',
      ok ? 'bg-emerald-400' : 'bg-amber-400',
      (pulse && !ok) && 'animate-pulse')} />
  )
}

// ── Section header ─────────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, label, action, onAction }: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  action?: string
  onAction?: () => void
}) {
  return (
    <div className="flex items-center gap-2 mb-2.5">
      <Icon className="h-3 w-3 text-white/30" />
      <span className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.18em] text-white/40">{label}</span>
      {action && (
        <button onClick={onAction}
          className="ml-auto font-mono text-[9px] text-white/25 hover:text-white/55 transition-colors">
          {action} →
        </button>
      )}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

interface PagesDashboardProps {
  onNavigate: (tab: string) => void
}

export default function PagesDashboard({ onNavigate }: PagesDashboardProps) {
  const { state } = useAdmin()

  // ── Counts ──────────────────────────────────────────────────────────────────
  const pubProjects   = state.projectsRegistry.filter(p => p.published).length
  const liveProjects  = state.projectsRegistry.filter(p => p.status === 'live').length
  const totalProjects = state.projectsRegistry.length

  const pubArticles   = state.researchRegistry.filter(r => r.published).length
  const featArticles  = state.researchRegistry.filter(r => r.featured).length
  const totalArticles = state.researchRegistry.length

  const visLabs   = state.labsRegistry.filter(l => l.visible && (l.status === 'live' || l.status === 'beta')).length
  const totalLabs = state.labsRegistry.length

  const visSystems   = state.systemsRegistry.filter(s => s.visible).length
  const totalSystems = state.systemsRegistry.length

  const toolCount  = state.toolRegistry?.length ?? 0
  const agentCount = state.agentRegistry?.length ?? 0
  const mcpCount   = state.mcpRegistry?.length ?? 0
  const totalRes   = toolCount + agentCount + mcpCount

  const pubLinks    = state.curatedLinks.filter(l => l.published).length
  const totalLinks  = state.curatedLinks.length
  const navVisible  = state.navigation.filter(n => n.visible).length
  const totalNav    = state.navigation.length
  const githubRepos = state.githubConfig.displayRepos.length
  const homeBlocks  = state.pageBlocksMap?.['home'] ?? state.blocks
  const enabledBlks = homeBlocks.filter(b => b.enabled).length

  // ── Editorial pipeline ───────────────────────────────────────────────────────
  const draftProjects  = state.projectsRegistry.filter(p => !p.published).length
  const draftArticles  = state.researchRegistry.filter(r => !r.published).length
  const featuredPrj    = state.projectsRegistry.filter(p => p.featured).length

  // ── Recent items ────────────────────────────────────────────────────────────
  const recentProjects = [...state.projectsRegistry]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5)

  const recentArticles = [...state.researchRegistry]
    .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
    .slice(0, 5)

  return (
    <div className="flex flex-col gap-5 p-4">

      {/* ── Quick actions ──────────────────────────────────────────────────── */}
      <div>
        <SectionHeader icon={TrendingUp} label="Quick Actions" />
        <div className="flex flex-wrap gap-1.5">
          {([
            { label: 'Nueva entrada',  icon: PlusCircle,  accent: '#f472b6', tab: 'intake'     },
            { label: 'Artículos',      icon: FileText,    accent: '#34d399', tab: 'research'   },
            { label: 'Media',          icon: Image,       accent: '#60a5fa', tab: 'media'      },
            { label: 'Navegación',     icon: Navigation2, accent: '#38bdf8', tab: 'navigation' },
            { label: 'Labs',           icon: FlaskConical,accent: '#a78bfa', tab: 'labs'       },
            { label: 'Systems',        icon: Cpu,         accent: '#38bdf8', tab: 'systems'    },
            { label: 'Recursos',       icon: Library,     accent: '#fbbf24', tab: 'resources'  },
          ]).map(a => {
            const Icon = a.icon
            return (
              <button key={a.tab} onClick={() => onNavigate(a.tab)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/8 bg-white/[0.03] text-[10px] text-white/50 hover:text-white/80 hover:bg-white/[0.06] hover:border-white/15 transition-all">
                <Icon className="h-3 w-3 shrink-0" style={{ color: a.accent }} />
                <span>{a.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Content overview grid ───────────────────────────────────────────── */}
      <div>
        <SectionHeader icon={LayoutList} label="Content Overview" action="Ver todo" onAction={() => onNavigate('content')} />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatCard label="Proyectos"   value={pubProjects}  total={totalProjects} sub={`${liveProjects} live · ${draftProjects} draft`}      icon={Rocket}      accent="#a78bfa" badge={{ text: `${featuredPrj} feat`, ok: featuredPrj > 0 }} onClick={() => onNavigate('projects')} />
          <StatCard label="Artículos"   value={pubArticles}  total={totalArticles} sub={`${featArticles} featured · ${draftArticles} draft`}   icon={BookOpen}    accent="#34d399" onClick={() => onNavigate('research')} />
          <StatCard label="Labs"        value={visLabs}      total={totalLabs}     sub={`${totalLabs - visLabs} ocultos`}                       icon={FlaskConical}accent="#f59e0b" onClick={() => onNavigate('labs')} />
          <StatCard label="Systems"     value={visSystems}   total={totalSystems}  sub={`${totalSystems - visSystems} ocultos`}                 icon={Cpu}         accent="#38bdf8" onClick={() => onNavigate('systems')} />
          <StatCard label="Links"       value={pubLinks}     total={totalLinks}    sub={`${totalLinks} curados`}                                icon={Link2}       accent="#60a5fa" onClick={() => onNavigate('research')} />
          <StatCard label="Drive Files" value={state.driveResources.length} total={0} sub="recursos"                                           icon={HardDrive}   accent="#fb923c" onClick={() => onNavigate('research')} />
          <StatCard label="Recursos"    value={totalRes}     total={0}            sub={`${toolCount}t ${agentCount}ag ${mcpCount}mcp`}          icon={Library}     accent="#fbbf24" onClick={() => onNavigate('resources')} />
          <StatCard label="Feeds"       value={state.trackedSources.filter(s => s.active).length} total={state.trackedSources.length} sub="fuentes activas" icon={Rss} accent="#f472b6" onClick={() => onNavigate('research')} />
        </div>
      </div>

      {/* ── Site structure strip ────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Nav links',    value: navVisible,  total: totalNav,        color: '#38bdf8', icon: Navigation2 },
          { label: 'GitHub repos', value: githubRepos, total: githubRepos,     color: '#e2e8f0', icon: GitBranch   },
          { label: 'Bloques ON',   value: enabledBlks, total: homeBlocks.length, color: '#818cf8', icon: LayoutList },
        ].map(m => {
          const Icon = m.icon
          const pct = m.total > 0 ? Math.round(m.value / m.total * 100) : 100
          return (
            <div key={m.label} className="flex items-center gap-2.5 rounded-lg border border-white/7 bg-white/[0.02] px-3 py-2">
              <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: m.color }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1">
                  <span className="text-[15px] font-bold tabular-nums leading-none" style={{ color: m.color }}>{m.value}</span>
                  {m.total !== m.value && <span className="font-mono text-[8px] text-white/22">/{m.total}</span>}
                </div>
                <div className="font-mono text-[7.5px] text-white/30 mt-0.5">{m.label}</div>
                <MiniBar pct={pct} color={m.color} />
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Editorial pipeline ──────────────────────────────────────────────── */}
      <div>
        <SectionHeader icon={Clock} label="Editorial Pipeline" />
        <div className="grid grid-cols-3 gap-px bg-white/6 rounded-xl overflow-hidden border border-white/8">
          {[
            { stage: 'Borradores',  count: draftProjects + draftArticles, color: '#ffffff30', icon: Circle },
            { stage: 'Publicados',  count: pubProjects + pubArticles,      color: '#34d399',   icon: CheckCircle2 },
            { stage: 'Destacados',  count: featuredPrj + featArticles,     color: '#f59e0b',   icon: TrendingUp },
          ].map(s => {
            const Icon = s.icon
            return (
              <div key={s.stage} className="flex flex-col items-center gap-1 bg-black/30 py-3">
                <Icon className="h-3.5 w-3.5 mb-0.5" style={{ color: s.color }} />
                <span className="text-[18px] font-bold tabular-nums" style={{ color: s.color }}>{s.count}</span>
                <span className="font-mono text-[7.5px] uppercase tracking-widest text-white/25">{s.stage}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Recent projects ──────────────────────────────────────────────────── */}
      {recentProjects.length > 0 && (
        <div>
          <SectionHeader icon={Rocket} label="Proyectos Recientes" action="Ver todos" onAction={() => onNavigate('projects')} />
          <div className="flex flex-col gap-1">
            {recentProjects.map(p => (
              <div key={p.id}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-colors cursor-pointer group">
                <StatusDot ok={p.published} pulse />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className="text-[11px] text-white/80 font-medium truncate group-hover:text-white/95 transition-colors">{p.title}</span>
                    <span className="font-mono text-[8px] text-white/25 shrink-0">{p.category}</span>
                  </div>
                  {p.tags && p.tags.length > 0 && (
                    <div className="flex gap-1 mt-0.5 flex-wrap">
                      {p.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="font-mono text-[6.5px] rounded px-1 py-px border border-white/8 text-white/22">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={cn('font-mono text-[7.5px] rounded px-1.5 py-0.5',
                    p.status === 'live'     ? 'bg-emerald-400/12 text-emerald-400' :
                    p.status === 'beta'     ? 'bg-sky-400/12 text-sky-400' :
                    p.status === 'wip'      ? 'bg-amber-400/12 text-amber-400' :
                    p.status === 'archived' ? 'bg-white/8 text-white/20' :
                                             'bg-white/8 text-white/25')}>
                    {p.status}
                  </span>
                  {p.published && <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400/60" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Recent articles ───────────────────────────────────────────────────── */}
      {recentArticles.length > 0 && (
        <div>
          <SectionHeader icon={BookOpen} label="Artículos Recientes" action="Ver todos" onAction={() => onNavigate('research')} />
          <div className="flex flex-col gap-1">
            {recentArticles.map(r => (
              <div key={r.slug}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-colors cursor-pointer group">
                <StatusDot ok={r.published} pulse />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className="text-[11px] text-white/80 font-medium truncate group-hover:text-white/95 transition-colors">{r.title}</span>
                    <span className="font-mono text-[8px] text-white/25 shrink-0">{r.category}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {r.tags?.slice(0, 2).map(tag => (
                      <span key={tag} className="font-mono text-[6.5px] rounded px-1 py-px border border-white/8 text-white/22">{tag}</span>
                    ))}
                    {r.readTime && (
                      <span className="font-mono text-[7px] text-white/18">{r.readTime} min</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={cn('font-mono text-[7.5px] rounded px-1.5 py-0.5',
                    r.published ? 'bg-emerald-400/12 text-emerald-400' : 'bg-white/8 text-white/25')}>
                    {r.published ? 'live' : 'draft'}
                  </span>
                  {r.featured && <TrendingUp className="h-2.5 w-2.5 text-amber-400/60" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
