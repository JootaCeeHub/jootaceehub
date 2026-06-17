'use client'

import { useAdmin } from '@/lib/admin/store'
import { cn } from '@/lib/utils'
import {
  PlusCircle,
  FileText,
  Image,
  Rocket,
  BookOpen,
  Link2,
  HardDrive,
  Rss,
  Navigation2,
  GitBranch,
  LayoutList,
  TrendingUp,
} from 'lucide-react'

interface StatCardProps {
  label: string
  value: number
  sub: string
  icon: React.ComponentType<{ className?: string }>
  accent: string
  onClick: () => void
}

function StatCard({ label, value, sub, icon: Icon, accent, onClick }: StatCardProps) {
  return (
    <button onClick={onClick} className="relative flex items-center gap-3 p-3 rounded-lg bg-white/3 border border-white/6 hover:bg-white/6 hover:border-white/10 transition-all cursor-pointer overflow-hidden text-left">
      <div className="flex items-center justify-center h-8 w-8 rounded-md shrink-0" style={{ background: `${accent}18`, color: accent }}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-lg font-bold text-white leading-none">{value}</div>
        <div className="text-[10px] font-medium text-white/60 mt-0.5">{label}</div>
        <div className="text-[9px] text-white/30 mt-0.5">{sub}</div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: accent }} />
    </button>
  )
}

interface PagesDashboardProps {
  onNavigate: (tab: string) => void
}

export default function PagesDashboard({ onNavigate }: PagesDashboardProps) {
  const { state } = useAdmin()

  const publishedProjects  = state.projectsRegistry.filter((p) => p.published).length
  const publishedResearch  = state.researchRegistry.filter((r) => r.published).length
  const publishedLinks     = state.curatedLinks.filter((l) => l.published).length
  const driveCount         = state.driveResources.length
  const sourcesActive      = state.trackedSources.filter((s) => s.active).length
  const navVisible         = state.navigation.filter((n) => n.visible).length
  const githubRepos        = state.githubConfig.displayRepos.length
  const homeBlocks         = state.pageBlocksMap?.['home'] ?? state.blocks
  const blocksVisible      = homeBlocks.filter((b) => b.enabled).length

  const recentProjects = [...state.projectsRegistry]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 4)

  const recentResearch = [...state.researchRegistry]
    .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
    .slice(0, 4)

  const stats = [
    { label: 'Projects',    value: publishedProjects,  sub: `${state.projectsRegistry.length} total`,  icon: Rocket,      accent: '#a78bfa', tab: 'projects'  },
    { label: 'Articles',    value: publishedResearch,  sub: `${state.researchRegistry.length} total`,  icon: BookOpen,    accent: '#34d399', tab: 'research'  },
    { label: 'Links',       value: publishedLinks,     sub: `${state.curatedLinks.length} total`,      icon: Link2,       accent: '#60a5fa', tab: 'research'  },
    { label: 'Drive Files', value: driveCount,         sub: 'resources',                               icon: HardDrive,   accent: '#fb923c', tab: 'research'  },
    { label: 'Sources',     value: sourcesActive,      sub: 'active feeds',                            icon: Rss,         accent: '#f472b6', tab: 'research'  },
    { label: 'Nav Links',   value: navVisible,         sub: `${state.navigation.length} total`,        icon: Navigation2, accent: '#38bdf8', tab: 'navigation'},
    { label: 'GitHub Repos',value: githubRepos,        sub: 'displayed',                               icon: GitBranch,   accent: '#e2e8f0', tab: 'github'    },
    { label: 'Sections',    value: blocksVisible,      sub: `${homeBlocks.length} en home`,            icon: LayoutList,  accent: '#818cf8', tab: 'blocks'    },
  ]

  return (
    <div className="flex flex-col gap-6 p-5 overflow-y-auto">
      {/* Quick actions */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-3.5 w-3.5 text-white/40" />
          <span className="text-[11px] font-semibold text-white/50 uppercase tracking-widest">Quick Actions</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'New Entry',  icon: PlusCircle, accent: '#f472b6', tab: 'intake'  },
            { label: 'Posts',      icon: FileText,   accent: '#34d399', tab: 'posts'   },
            { label: 'Media',      icon: Image,      accent: '#60a5fa', tab: 'media'   },
            { label: 'Navigation', icon: Navigation2,accent: '#38bdf8', tab: 'navigation'},
          ].map((a) => {
            const Icon = a.icon
            return (
              <button key={a.tab} onClick={() => onNavigate(a.tab)} className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/4 border border-white/8 text-[11px] text-white/60 hover:text-white hover:bg-white/8 transition-all cursor-pointer">
                <Icon className="h-3 w-3 shrink-0" style={{ color: a.accent }} />
                <span>{a.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Stats grid */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <LayoutList className="h-3.5 w-3.5 text-white/40" />
          <span className="text-[11px] font-semibold text-white/50 uppercase tracking-widest">Content Overview</span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {stats.map((st) => (
            <StatCard
              key={st.label}
              label={st.label}
              value={st.value}
              sub={st.sub}
              icon={st.icon}
              accent={st.accent}
              onClick={() => onNavigate(st.tab)}
            />
          ))}
        </div>
      </div>

      {/* Recent projects */}
      {recentProjects.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Rocket className="h-3.5 w-3.5 text-white/40" />
            <span className="text-[11px] font-semibold text-white/50 uppercase tracking-widest">Recent Projects</span>
            <button onClick={() => onNavigate('projects')} className="ml-auto text-[10px] text-white/30 hover:text-white/60 transition-colors cursor-pointer">View all →</button>
          </div>
          <div className="flex flex-col gap-1">
            {recentProjects.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-3 py-2 rounded-md bg-white/2 border border-white/4 hover:bg-white/5 transition-colors">
                <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: p.accent ?? '#a78bfa' }} />
                <div className="flex-1 min-w-0 flex items-baseline gap-2">
                  <span className="text-[11px] text-white/80 font-medium truncate">{p.title}</span>
                  <span className="text-[9px] text-white/30 shrink-0">{p.category} · {p.status}</span>
                </div>
                <span className={cn(
                  'shrink-0 text-[9px] px-1.5 py-0.5 rounded font-medium',
                  p.published ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/8 text-white/30'
                )}>
                  {p.published ? 'live' : 'draft'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent research */}
      {recentResearch.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5 text-white/40" />
            <span className="text-[11px] font-semibold text-white/50 uppercase tracking-widest">Recent Articles</span>
            <button onClick={() => onNavigate('research')} className="ml-auto text-[10px] text-white/30 hover:text-white/60 transition-colors cursor-pointer">View all →</button>
          </div>
          <div className="flex flex-col gap-1">
            {recentResearch.map((r) => (
              <div key={r.slug} className="flex items-center gap-3 px-3 py-2 rounded-md bg-white/2 border border-white/4 hover:bg-white/5 transition-colors">
                <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: '#34d399' }} />
                <div className="flex-1 min-w-0 flex items-baseline gap-2">
                  <span className="text-[11px] text-white/80 font-medium truncate">{r.title}</span>
                  <span className="text-[9px] text-white/30 shrink-0">{r.category} · {r.readTime} min</span>
                </div>
                <span className={cn(
                  'shrink-0 text-[9px] px-1.5 py-0.5 rounded font-medium',
                  r.published ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/8 text-white/30'
                )}>
                  {r.published ? 'live' : 'draft'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
