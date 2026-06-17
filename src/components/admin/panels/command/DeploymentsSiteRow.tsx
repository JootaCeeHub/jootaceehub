'use client'

import { useAdmin } from '@/lib/admin/store'

// ─── Inline styles ────────────────────────────────────────────────────────────

const card       = 'overflow-hidden rounded-xl border border-white/8 bg-white/[0.02]'
const cardHeader = 'flex items-center justify-between border-b border-white/8 px-4 py-2.5'
const cardTitle  = 'font-mono text-[10px] uppercase tracking-[0.2em] text-white/35'
const cardBadge  = 'font-mono text-[9px] text-white/20'
const editLink   = 'font-mono text-[8.5px] text-white/25 hover:text-white/55 transition-colors'

const deployItem    = 'flex items-center gap-3 px-4 py-2.5 border-b border-white/5 last:border-0'
const deployService = 'flex-1 font-mono text-[10.5px] text-white/60'
const deployVersion = 'font-mono text-[9px] text-white/30'
const deployDot  = (status: string) => {
  const map: Record<string, string> = { success: 'bg-emerald-400', pending: 'bg-amber-400 animate-pulse', failed: 'bg-red-400' }
  return `h-1.5 w-1.5 shrink-0 rounded-full ${map[status] ?? 'bg-white/20'}`
}
const deployStatus = (status: string) => {
  const map: Record<string, string> = { success: 'text-emerald-400', pending: 'text-amber-400', failed: 'text-red-400' }
  return `font-mono text-[9px] uppercase tracking-wider ${map[status] ?? 'text-white/25'}`
}

const configGrid  = 'grid grid-cols-2 divide-x divide-y divide-white/5'
const configItem  = 'px-3 py-2'
const configLabel = 'font-mono text-[8.5px] uppercase tracking-[0.14em] text-white/22'
const configValue = 'mt-0.5 truncate font-mono text-[9.5px] text-white/55'

const intRow   = 'flex items-center gap-3 px-4 py-2.5 border-b border-white/5 last:border-0'
const intLabel = 'flex-1 font-mono text-[10px] text-white/50'
const intValue = 'font-mono text-[9.5px] text-white/35'
const intAction= 'ml-2 font-mono text-[8.5px] text-cyan-400/70 hover:text-cyan-400 transition-colors'
const intDot   = (ok: boolean) => `h-1.5 w-1.5 shrink-0 rounded-full ${ok ? 'bg-emerald-400' : 'bg-white/15'}`

const socialWrap = 'flex flex-wrap gap-1.5 px-4 pb-3'
const socialChip = (connected: boolean) =>
  `inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[8.5px] transition-colors ${connected ? 'border-emerald-400/20 bg-emerald-400/6 text-emerald-400' : 'border-white/8 bg-white/2 text-white/22'}`
const socialDot  = (connected: boolean) => `h-1 w-1 rounded-full ${connected ? 'bg-emerald-400' : 'bg-white/20'}`

const ghStatsRow  = 'flex items-center gap-1 border-t border-white/6 px-4 py-2'
const ghStatItem  = 'flex flex-1 flex-col items-center'
const ghStatVal   = 'font-mono text-[12px] font-bold text-white/65 tabular-nums'
const ghStatLabel = 'font-mono text-[7.5px] uppercase tracking-wider text-white/22'

const navPillWrap = 'flex flex-wrap gap-1.5 px-4 py-3'
const navPill     = (visible: boolean) =>
  `rounded-md border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider transition-opacity ${visible ? 'border-indigo-400/20 bg-indigo-400/6 text-indigo-400' : 'border-white/8 bg-white/2 text-white/20 opacity-40'}`

// ─── Deployments card ─────────────────────────────────────────────────────────

function DeploymentsCard() {
  const { state } = useAdmin()
  return (
    <div className={card}>
      <div className={cardHeader}>
        <span className={cardTitle}>Recent Deployments</span>
        <span className={cardBadge}>{state.infraConfig.orchestrator}</span>
      </div>
      <div>
        {state.infraConfig.deployments.slice(0, 6).map((d, i) => (
          <div key={i} className={deployItem}>
            <span className={deployDot(d.status)} />
            <span className={deployService}>{d.service}</span>
            <span className={deployVersion}>{d.version}</span>
            <span className="font-mono text-[8.5px] text-white/20 shrink-0">{d.env}</span>
            <span className={deployStatus(d.status)}>{d.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Site config card ─────────────────────────────────────────────────────────

function SiteConfigCard() {
  const { state, dispatch } = useAdmin()
  return (
    <div className={card}>
      <div className={cardHeader}>
        <span className={cardTitle}>Site Config</span>
        <button onClick={() => dispatch({ type: 'SET_PANEL', payload: 'site-core' })} className={editLink}>
          Edit →
        </button>
      </div>
      <div className={configGrid}>
        {[
          { label: 'Name',        value: state.site.name            },
          { label: 'Environment', value: state.runtime.environment  },
          { label: 'URL',         value: state.site.url             },
          { label: 'Version',     value: state.runtime.version      },
        ].map(item => (
          <div key={item.label} className={configItem}>
            <div className={configLabel}>{item.label}</div>
            <div className={configValue}>{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Integrations card ────────────────────────────────────────────────────────

function IntegrationsCard() {
  const { state, dispatch } = useAdmin()
  const githubConn      = state.integrations?.github?.connected ?? false
  const socialPlatforms = state.integrations?.socialPlatforms ?? []
  const connSocial      = socialPlatforms.filter(p => p.connected).length
  const visibleSocial   = socialPlatforms.filter(p => p.visible).length
  const dataSources     = state.integrations?.dataSources?.length ?? 0
  const indexedSources  = state.integrations?.dataSources?.filter(s => s.status === 'ready').length ?? 0
  const hermes          = state.capabilities?.hermes

  return (
    <div className={card}>
      <div className={cardHeader}>
        <span className={cardTitle}>Integrations</span>
        <button onClick={() => dispatch({ type: 'SET_PANEL', payload: 'integrations' })} className={editLink}>
          Manage →
        </button>
      </div>
      <div>
        <div className={intRow}>
          <span className={intDot(githubConn)} />
          <span className={intLabel}>GitHub</span>
          <span className={intValue}>
            {githubConn
              ? `${state.integrations?.github?.username} · ${state.integrations?.github?.repos?.length} repos`
              : 'Not connected'}
          </span>
          {githubConn && (
            <button onClick={() => dispatch({ type: 'SET_PANEL', payload: 'github' })} className={intAction}>→</button>
          )}
        </div>
        <div className={intRow}>
          <span className={intDot(connSocial > 0)} />
          <span className={intLabel}>Social Platforms</span>
          <span className={intValue}>{connSocial} connected · {visibleSocial} visible</span>
          <button onClick={() => dispatch({ type: 'SET_PANEL', payload: 'integrations' })} className={intAction}>→</button>
        </div>
        <div className={intRow}>
          <span className={intDot(dataSources > 0)} />
          <span className={intLabel}>Data Sources</span>
          <span className={intValue}>{dataSources} sources · {indexedSources} indexed</span>
        </div>
        <div className={intRow}>
          <span className={intDot(hermes?.status === 'connected')} />
          <span className={intLabel}>Hermes Agent</span>
          <span className={intValue}>{hermes?.status ?? 'disconnected'}</span>
        </div>
        <div className={intRow}>
          <span className={intDot(state.site.enableAnalytics)} />
          <span className={intLabel}>Analytics</span>
          <span className={intValue}>{state.site.enableAnalytics ? state.site.trackingId || 'enabled' : 'disabled'}</span>
        </div>
        {connSocial > 0 && (
          <div className={socialWrap}>
            {socialPlatforms.filter(p => p.connected).map(p => (
              <span key={p.id} className={socialChip(p.connected)}>
                <span className={socialDot(p.connected)} />
                {p.id}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── GitHub stats card ────────────────────────────────────────────────────────

function GitHubStatsCard() {
  const { state, dispatch } = useAdmin()
  const githubConn = state.integrations?.github?.connected ?? false
  const ghRepos    = state.integrations?.github?.repos ?? []
  if (!githubConn || ghRepos.length === 0) return null

  const totalStars = ghRepos.reduce((a, r) => a + (r.stars ?? 0), 0)
  const totalForks = ghRepos.reduce((a, r) => a + (r.forks ?? 0), 0)

  return (
    <div className={card}>
      <div className={cardHeader}>
        <span className={cardTitle}>GitHub · {state.integrations?.github?.username}</span>
        <button onClick={() => dispatch({ type: 'SET_PANEL', payload: 'github' })} className={editLink}>View →</button>
      </div>
      <div className={ghStatsRow}>
        {[
          { label: 'Repos', value: ghRepos.length },
          { label: 'Stars', value: totalStars      },
          { label: 'Forks', value: totalForks      },
        ].map(({ label, value }) => (
          <div key={label} className={ghStatItem}>
            <div className={ghStatVal}>{value}</div>
            <div className={ghStatLabel}>{label}</div>
          </div>
        ))}
      </div>
      <div className={navPillWrap}>
        {ghRepos.slice(0, 6).map(repo => (
          <span key={repo.name} className={navPill(true)}>{repo.name}</span>
        ))}
      </div>
    </div>
  )
}

// ─── Navigation pills card ────────────────────────────────────────────────────

function NavigationCard() {
  const { state } = useAdmin()
  return (
    <div className={card}>
      <div className={cardHeader}>
        <span className={cardTitle}>Navigation</span>
        <span className={cardBadge}>
          {state.navigation.filter(n => n.visible).length}/{state.navigation.length} visible
        </span>
      </div>
      <div className={navPillWrap}>
        {[...state.navigation]
          .sort((a, b) => a.order - b.order)
          .map(item => (
            <span key={item.key} className={navPill(item.visible)}>{item.label}</span>
          ))}
      </div>
    </div>
  )
}

// ─── About / Profile card ─────────────────────────────────────────────────────

const availBadge = (a: string) => {
  const m: Record<string, string> = {
    available:   'border-emerald-400/25 bg-emerald-400/8 text-emerald-400',
    limited:     'border-amber-400/25 bg-amber-400/8 text-amber-400',
    unavailable: 'border-red-400/25 bg-red-400/8 text-red-400',
  }
  return `inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[8.5px] uppercase tracking-wider ${m[a] ?? m.unavailable}`
}

function AboutProfileCard() {
  const { state, dispatch } = useAdmin()
  const about = state.aboutConfig
  if (!about) return null

  const skillsPreview  = about.skills.slice(0, 5)
  const toolsPreview   = about.tools.slice(0, 4)
  const collabTypes    = about.collaborationTypes.slice(0, 3)
  const timelineCount  = about.timeline.length

  return (
    <div className={card}>
      <div className={cardHeader}>
        <span className={cardTitle}>Profile · About</span>
        <button onClick={() => dispatch({ type: 'SET_PANEL', payload: 'about' })} className={editLink}>
          Edit →
        </button>
      </div>

      <div className="px-4 pt-3 pb-2 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-mono text-[11px] font-semibold text-white/75 leading-snug">
              {about.headline || 'No headline set'}
            </div>
            <div className="mt-0.5 font-mono text-[9px] text-white/28">{about.location}</div>
          </div>
          <span className={availBadge(about.availability)}>{about.availability}</span>
        </div>

        {about.bio && (
          <p className="font-mono text-[9px] text-white/38 leading-relaxed line-clamp-2">{about.bio}</p>
        )}
      </div>

      {skillsPreview.length > 0 && (
        <div className="border-t border-white/6 px-4 py-2">
          <div className="font-mono text-[8px] uppercase tracking-[0.16em] text-white/22 mb-1">Skills</div>
          <div className="flex flex-wrap gap-1">
            {skillsPreview.map(s => (
              <span key={s} className="rounded-md border border-sky-400/15 bg-sky-400/5 px-1.5 py-0.5 font-mono text-[8px] text-sky-400/70">{s}</span>
            ))}
            {about.skills.length > 5 && (
              <span className="rounded-md border border-white/8 px-1.5 py-0.5 font-mono text-[8px] text-white/22">+{about.skills.length - 5}</span>
            )}
          </div>
        </div>
      )}

      {toolsPreview.length > 0 && (
        <div className="border-t border-white/6 px-4 py-2">
          <div className="font-mono text-[8px] uppercase tracking-[0.16em] text-white/22 mb-1">Tools</div>
          <div className="flex flex-wrap gap-1">
            {toolsPreview.map(t => (
              <span key={t} className="rounded-md border border-violet-400/15 bg-violet-400/5 px-1.5 py-0.5 font-mono text-[8px] text-violet-400/70">{t}</span>
            ))}
            {about.tools.length > 4 && (
              <span className="rounded-md border border-white/8 px-1.5 py-0.5 font-mono text-[8px] text-white/22">+{about.tools.length - 4}</span>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 border-t border-white/6 px-4 py-1.5">
        <div className="flex gap-2">
          {collabTypes.map(c => (
            <span key={c} className="font-mono text-[8px] text-white/28">{c}</span>
          ))}
        </div>
        {timelineCount > 0 && (
          <span className="ml-auto font-mono text-[8px] text-white/22">{timelineCount} timeline entries</span>
        )}
      </div>
    </div>
  )
}

// ─── Combined 2-column export ─────────────────────────────────────────────────

export function DeploymentsSiteRow() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      <DeploymentsCard />
      <div className="space-y-3">
        <SiteConfigCard />
        <IntegrationsCard />
        <AboutProfileCard />
        <GitHubStatsCard />
        <NavigationCard />
      </div>
    </div>
  )
}
