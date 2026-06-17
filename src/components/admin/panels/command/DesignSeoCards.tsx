'use client'

import { Wand2 } from 'lucide-react'
import { useAdmin } from '@/lib/admin/store'

// ─── Inline styles ────────────────────────────────────────────────────────────

const card       = 'overflow-hidden rounded-xl border border-white/8 bg-white/[0.02]'
const cardHeader = 'flex items-center justify-between border-b border-white/8 px-4 py-2.5'
const cardTitle  = 'font-mono text-[10px] uppercase tracking-[0.2em] text-white/35'
const editLink   = 'font-mono text-[8.5px] text-white/25 hover:text-white/55 transition-colors'

// Design & Brand
const brandSection = 'space-y-1.5'
const brandSecLbl  = 'font-mono text-[8.5px] uppercase tracking-[0.18em] text-white/22'
const brandPersona = 'inline-flex items-center rounded-full border border-fuchsia-400/20 bg-fuchsia-400/8 px-2.5 py-0.5 font-mono text-[9px] text-fuchsia-400'
const brandSwatch  = 'h-4 w-4 rounded-sm border border-white/8'
const brandTokRow  = 'flex flex-wrap gap-1'
const brandTokBdg  = 'rounded-md border border-white/8 bg-white/4 px-2 py-0.5 font-mono text-[8.5px] text-white/40'

const featureRow = 'flex items-center justify-between border-b border-white/5 last:border-0 px-4 py-2'
const featureLbl = 'font-mono text-[10px] text-white/50'
const featureOn  = 'font-mono text-[8px] uppercase tracking-wider text-emerald-400'
const featureOff = 'font-mono text-[8px] uppercase tracking-wider text-white/20'

// SEO Health
const seoGrid      = 'grid grid-cols-2 gap-x-3 gap-y-1 p-4'
const seoCheckItem = 'flex items-center gap-2'
const seoCheckLbl  = 'font-mono text-[9px] text-white/40 truncate'
const seoScoreBar  = 'flex items-center gap-2 border-t border-white/6 px-4 py-2.5 mt-1'
const seoCheckDot  = (ok: boolean) => `h-1.5 w-1.5 shrink-0 rounded-full ${ok ? 'bg-emerald-400' : 'bg-red-400/70'}`
const seoScoreTxt  = (pct: number) =>
  `font-mono text-[11px] font-semibold tabular-nums ${pct >= 85 ? 'text-emerald-400' : pct >= 60 ? 'text-amber-400' : 'text-red-400'}`

// Palette presets — mirrors ThemeApplicator
const PALETTE_COLORS: Record<string, string[]> = {
  ocean:   ['#0ea5e9', '#7dd3fc', '#38bdf8'],
  emerald: ['#059669', '#6ee7b7', '#10b981'],
  amber:   ['#d97706', '#fcd34d', '#f59e0b'],
  rose:    ['#e11d48', '#fb7185', '#f43f5e'],
  violet:  ['#7c3aed', '#a78bfa', '#8b5cf6'],
  slate:   ['#475569', '#94a3b8', '#64748b'],
}

// ─── Design & Brand card ──────────────────────────────────────────────────────

function DesignBrandCard() {
  const { state, dispatch } = useAdmin()

  const paletteSwatches = state.design.palette === 'custom'
    ? [state.design.customPrimary, state.design.customAccent, state.design.customBackground].filter(Boolean)
    : PALETTE_COLORS[state.design.palette] ?? PALETTE_COLORS.ocean

  const domainAccents = state.design.domainAccents ?? {
    projects: '#a78bfa', research: '#34d399', resources: '#38bdf8',
    intelligence: '#facc15', github: '#f472b6', about: '#94a3b8',
  }

  const glowColor = state.design.customGlow || state.design.customPrimary || '#0ea5e9'

  return (
    <div className={card}>
      <div className={cardHeader}>
        <span className={cardTitle}>Design & Brand</span>
        <button onClick={() => dispatch({ type: 'SET_PANEL', payload: 'design' })} className={editLink}>
          Edit →
        </button>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3 p-4">
        {/* Left — Personality + Effects */}
        <div className={brandSection}>
          <div className={brandSecLbl}>Personality</div>
          <span className={brandPersona}>
            <Wand2 className="mr-1 inline-block h-2.5 w-2.5" />
            {state.personality.active}
          </span>
          <div className="mt-1.5">
            <div className={brandSecLbl}>Active effects</div>
            <div className="mt-1 flex flex-wrap gap-1">
              {state.personality.effects.filter(e => e.enabled).map(e => (
                <span key={e.id} className="rounded-full border border-fuchsia-400/15 bg-fuchsia-400/6 px-1.5 py-0.5 font-mono text-[7.5px] text-fuchsia-400/70">
                  {e.name.split(' ')[0]}
                </span>
              ))}
              {state.personality.effects.filter(e => e.enabled).length === 0 && (
                <span className="font-mono text-[8.5px] text-white/20">None active</span>
              )}
            </div>
          </div>
        </div>

        {/* Right — Palette + Tokens */}
        <div className={brandSection}>
          <div className={brandSecLbl}>Palette · {state.design.palette}</div>
          <div className="flex items-center gap-1">
            {paletteSwatches.map((c, i) => (
              <div key={i} className={brandSwatch} style={{ background: c || '#ffffff10' }} />
            ))}
            {/* Glow preview */}
            <div
              className="ml-1 h-4 w-4 rounded-sm border border-white/8"
              style={{ background: glowColor, boxShadow: `0 0 6px ${glowColor}70` }}
              title="Glow color"
            />
          </div>
          <div className="mt-1.5">
            <div className={brandSecLbl}>Design tokens</div>
            <div className={brandTokRow}>
              {[
                state.design.tokens.borderRadius,
                state.design.tokens.buttonStyle,
                state.design.tokens.glowIntensity,
                state.design.tokens.glassBlur,
              ].map((t, i) => (
                <span key={i} className={brandTokBdg}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Domain accent bar */}
      <div className="border-t border-white/6 px-4 py-2.5">
        <div className={brandSecLbl}>Domain accents</div>
        <div className="mt-1.5 flex items-center gap-2">
          {Object.entries(domainAccents).map(([key, color]) => (
            <div key={key} className="flex flex-col items-center gap-0.5">
              <div
                className="h-3.5 w-3.5 rounded-full border border-white/10"
                style={{ background: color, boxShadow: `0 0 5px ${color}60` }}
                title={key}
              />
              <span className="font-mono text-[6.5px] uppercase tracking-wider text-white/25">{key.slice(0, 3)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Button gradient preview */}
      {(state.design.btnGradientFrom || state.design.btnGradientTo) && (
        <div className="border-t border-white/6 px-4 py-2">
          <div className={brandSecLbl}>Button gradient</div>
          <div
            className="mt-1 h-4 w-full rounded-md"
            style={{
              background: `linear-gradient(to right, ${state.design.btnGradientFrom || '#7dd3fc'}, ${state.design.btnGradientTo || '#a5f3fc'})`,
            }}
          />
        </div>
      )}

      <div className="border-t border-white/6 mt-1">
        {[
          { label: 'Analytics',   on: state.site.enableAnalytics  },
          { label: 'Telemetry',   on: state.site.enableTelemetry  },
          { label: 'Maintenance', on: state.site.maintenanceMode  },
        ].map(f => (
          <div key={f.label} className={featureRow}>
            <span className={featureLbl}>{f.label}</span>
            <span className={f.on ? featureOn : featureOff}>{f.on ? 'On' : 'Off'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── SEO Health card ──────────────────────────────────────────────────────────

function SeoHealthCard() {
  const { state, dispatch } = useAdmin()
  const { seo } = state

  const checks = [
    { label: 'Default title',    ok: !!seo.defaultTitle },
    { label: 'Meta description', ok: !!seo.defaultDescription },
    { label: 'Canonical URL',    ok: !!seo.canonicalBase },
    { label: 'OG image',         ok: !!seo.ogImage },
    { label: 'Twitter handle',   ok: !!seo.twitterHandle },
    { label: 'Robots directive', ok: !!seo.robots },
    { label: 'Title < 60 chars', ok: seo.defaultTitle.length > 0 && seo.defaultTitle.length <= 60 },
    { label: 'Desc < 160 chars', ok: seo.defaultDescription.length > 0 && seo.defaultDescription.length <= 160 },
  ] as const

  const passing = checks.filter(c => c.ok).length
  const pct     = Math.round((passing / checks.length) * 100)

  return (
    <div className={card}>
      <div className={cardHeader}>
        <span className={cardTitle}>SEO Health</span>
        <button onClick={() => dispatch({ type: 'SET_PANEL', payload: 'seo' })} className={editLink}>
          Edit →
        </button>
      </div>

      <div className={seoGrid}>
        {checks.map(c => (
          <div key={c.label} className={seoCheckItem}>
            <span className={seoCheckDot(c.ok)} />
            <span className={seoCheckLbl}>{c.label}</span>
          </div>
        ))}
      </div>

      <div className={seoScoreBar}>
        <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-white/6">
          <div
            className={`h-full rounded-full ${pct === 100 ? 'bg-emerald-400' : pct >= 75 ? 'bg-amber-400' : 'bg-red-400'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className={seoScoreTxt(pct)}>{passing}/8</span>
      </div>

      {/* SERP preview */}
      <div className="mx-4 mb-3 rounded-lg border border-white/6 bg-black/20 p-3 space-y-0.5">
        <div className="font-mono text-[8.5px] text-emerald-400/70 truncate">
          {seo.canonicalBase.replace(/\/$/, '') || 'https://your-site.com'}/
        </div>
        <div className="text-[12px] font-medium text-sky-400/80 leading-snug truncate">
          {seo.defaultTitle || 'Page title not set'}
        </div>
        <div className="font-mono text-[9px] text-white/35 leading-relaxed line-clamp-2">
          {seo.defaultDescription || 'Meta description not configured.'}
        </div>
      </div>
    </div>
  )
}

// ─── GitHub Config card ───────────────────────────────────────────────────────

function GitHubConfigCard() {
  const { state, dispatch } = useAdmin()
  const gh = state.githubConfig
  if (!gh) return null

  const totalStars = Object.values(gh.repoMeta ?? {}).reduce((a, r) => a + (r.stars ?? 0), 0)
  const pinnedCount = Object.values(gh.repoMeta ?? {}).filter(r => r.pinned).length
  const displayRepoCount = gh.displayRepos?.length ?? 0

  const visibilityToggles = [
    { label: 'Profile card',    on: gh.showProfileCard     },
    { label: 'Contributions',   on: gh.showContributions   },
    { label: 'Stats',           on: gh.showStats           },
    { label: 'Activity',        on: gh.showActivity        },
    { label: 'Languages',       on: gh.showLanguages       },
    { label: 'Starred',         on: gh.showStarred         },
  ]

  return (
    <div className={card}>
      <div className={cardHeader}>
        <span className={cardTitle}>GitHub Page Config</span>
        <button onClick={() => dispatch({ type: 'SET_PANEL', payload: 'github' })} className={editLink}>
          Edit →
        </button>
      </div>

      <div className="px-4 pt-3 pb-2">
        <div className="font-mono text-[11px] font-semibold text-white/70">
          {gh.pageHeadline || 'GitHub'}
        </div>
        <div className="mt-0.5 flex items-center gap-2">
          <span className="font-mono text-[9px] text-white/30">@{gh.username}</span>
          <span className="h-3 w-px bg-white/10" />
          <span className="font-mono text-[9px] text-white/30">{displayRepoCount} repos displayed</span>
          <span className="h-3 w-px bg-white/10" />
          <span className="font-mono text-[9px] text-amber-400/60">{totalStars} ★</span>
        </div>
        {gh.pageBadge && (
          <span className="mt-1.5 inline-flex items-center rounded-full border border-sky-400/20 bg-sky-400/8 px-2 py-0.5 font-mono text-[8px] text-sky-400">
            {gh.pageBadge}
          </span>
        )}
      </div>

      {/* Repo meta highlights */}
      {pinnedCount > 0 && (
        <div className="border-t border-white/6 px-4 py-2">
          <div className="font-mono text-[8px] uppercase tracking-[0.16em] text-white/22 mb-1.5">Pinned repos</div>
          <div className="space-y-1">
            {Object.entries(gh.repoMeta ?? {})
              .filter(([, m]) => m.pinned)
              .slice(0, 3)
              .map(([name, m]) => (
                <div key={name} className="flex items-center gap-2">
                  <span className="flex-1 font-mono text-[9px] text-white/50 truncate">{name}</span>
                  <span className="shrink-0 rounded border border-white/8 bg-white/4 px-1.5 py-0.5 font-mono text-[7.5px] text-white/25">{m.language}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Section visibility */}
      <div className="border-t border-white/6 px-4 py-2">
        <div className="font-mono text-[8px] uppercase tracking-[0.16em] text-white/22 mb-1.5">Section visibility</div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          {visibilityToggles.map(t => (
            <div key={t.label} className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${t.on ? 'bg-emerald-400' : 'bg-white/15'}`} />
              <span className="font-mono text-[8.5px] text-white/38">{t.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Combined 3-column export ─────────────────────────────────────────────────

export function DesignSeoCards() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <DesignBrandCard />
      <SeoHealthCard />
      <GitHubConfigCard />
    </div>
  )
}
