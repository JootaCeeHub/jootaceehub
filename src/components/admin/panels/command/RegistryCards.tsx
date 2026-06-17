'use client'

import { useAdmin } from '@/lib/admin/store'

// ─── Inline styles ────────────────────────────────────────────────────────────

const card       = 'overflow-hidden rounded-xl border border-white/8 bg-white/[0.02]'
const cardHeader = 'flex items-center justify-between border-b border-white/8 px-4 py-2.5'
const cardTitle  = 'font-mono text-[10px] uppercase tracking-[0.2em] text-white/35'
const cardBadge  = 'font-mono text-[9px] text-white/20'
const editLink   = 'font-mono text-[8.5px] text-white/25 hover:text-white/55 transition-colors'

// Projects
const projGrid    = 'grid grid-cols-2 divide-x divide-y divide-white/5 lg:grid-cols-3'
const projItem    = 'flex items-center gap-3 px-4 py-2.5'
const projName    = 'font-mono text-[10.5px] text-white/65'
const projTagline = 'font-mono text-[8.5px] text-white/25'
const projHidden  = 'font-mono text-[8px] text-white/20'
const projBadge   = (status: string) => {
  const map: Record<string, string> = {
    live:     'border-emerald-400/25 text-emerald-400',
    beta:     'border-sky-400/25 text-sky-400',
    wip:      'border-amber-400/25 text-amber-400',
    archived: 'border-white/15 text-white/25',
  }
  return `rounded-full border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider ${map[status] ?? map.archived}`
}

// Systems table
const sysTable  = 'w-full'
const sysHead   = 'border-b border-white/8 text-left'
const sysTh     = 'px-4 py-2 font-mono text-[8.5px] uppercase tracking-wider text-white/20'
const sysRow    = 'border-b border-white/5 last:border-0 hover:bg-white/[0.015] transition-colors'
const sysTd     = 'px-4 py-2.5'
const sysName   = 'font-mono text-[10.5px] text-white/65'
const sysBadge  = 'font-mono text-[8px] text-white/30'
const sysTools  = 'font-mono text-[10px] font-semibold text-white/55 tabular-nums'
const sysUptime = 'font-mono text-[9px] text-white/30'
const sysStatus = (status: string) => {
  const map: Record<string, string> = {
    operational:  'border-emerald-400/20 bg-emerald-400/8 text-emerald-400',
    degraded:     'border-amber-400/20 bg-amber-400/8 text-amber-400',
    maintenance:  'border-sky-400/20 bg-sky-400/8 text-sky-400',
    offline:      'border-red-400/20 bg-red-400/8 text-red-400',
  }
  return `inline-flex items-center rounded-full border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider ${map[status] ?? 'border-white/10 text-white/25'}`
}

// ─── Projects Registry card ───────────────────────────────────────────────────

function ProjectsRegistryCard() {
  const { state, dispatch } = useAdmin()
  const useProjects     = (state.projectsRegistry?.length ?? 0) > 0
  const publishedCount  = state.projectsRegistry?.filter(p => p.published).length ?? state.labsRegistry.filter(l => l.visible).length
  const liveCount       = state.projectsRegistry?.filter(p => p.status === 'live').length ?? state.labsRegistry.filter(l => l.status === 'live').length
  const featuredCount   = state.projectsRegistry?.filter(p => p.featured).length ?? 0

  return (
    <div className={card}>
      <div className={cardHeader}>
        <span className={cardTitle}>Projects Registry</span>
        <div className="flex items-center gap-3">
          <span className={cardBadge}>{publishedCount} published · {liveCount} live · {featuredCount} featured</span>
          <button
            onClick={() => dispatch({ type: 'SET_PANEL', payload: useProjects ? 'projects' : 'labs' })}
            className={editLink}
          >
            Manage →
          </button>
        </div>
      </div>

      {useProjects ? (
        <div className={projGrid}>
          {state.projectsRegistry!.map(project => (
            <div key={project.id} className={projItem}>
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: project.accent, boxShadow: `0 0 6px ${project.accent}50` }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className={projName}>{project.title}</div>
                <div className={projTagline}>{project.tagline}</div>
              </div>
              {!project.published && <span className={projHidden}>draft</span>}
              <span className={projBadge(project.status)}>{project.status}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className={projGrid}>
          {state.labsRegistry.map(project => (
            <div key={project.key} className={projItem}>
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: project.accent, boxShadow: `0 0 6px ${project.accent}50` }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className={projName}>{project.name}</div>
                <div className={projTagline}>{project.tagline}</div>
              </div>
              {!project.visible && <span className={projHidden}>hidden</span>}
              <span className={projBadge(project.status)}>{project.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Systems Registry card ────────────────────────────────────────────────────

function SystemsRegistryCard() {
  const { state, dispatch } = useAdmin()
  const onlineSystems = state.systemsRegistry.filter(s => s.status === 'operational').length

  return (
    <div className={card}>
      <div className={cardHeader}>
        <span className={cardTitle}>Systems Registry</span>
        <div className="flex items-center gap-3">
          <span className={cardBadge}>{onlineSystems}/{state.systemsRegistry.length} operational</span>
          <button onClick={() => dispatch({ type: 'SET_PANEL', payload: 'systems' })} className={editLink}>
            Manage →
          </button>
        </div>
      </div>
      <table className={sysTable}>
        <thead className={sysHead}>
          <tr>
            {['System', 'Status', 'Tools', 'Version', 'Uptime'].map(h => (
              <th key={h} className={sysTh}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {state.systemsRegistry.map(sys => (
            <tr key={sys.key} className={sysRow}>
              <td className={sysTd}>
                <div className={sysName}>{sys.name}</div>
                <div className={sysBadge}>{sys.badge}</div>
              </td>
              <td className={sysTd}>
                <span className={sysStatus(sys.status)}>{sys.status}</span>
              </td>
              <td className={sysTd}><span className={sysTools}>{sys.tools}</span></td>
              <td className={sysTd}><span className={sysUptime}>v{sys.version}</span></td>
              <td className={sysTd}><span className={sysUptime}>{sys.uptime}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Combined export ──────────────────────────────────────────────────────────

export function RegistryCards() {
  return (
    <div className="space-y-4">
      <ProjectsRegistryCard />
      <SystemsRegistryCard />
    </div>
  )
}
