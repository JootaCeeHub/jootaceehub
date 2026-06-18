'use client'

import { cn } from '@/lib/utils'
import { useAdmin } from '@/lib/admin/store'
import type { GithubConfig } from '@/lib/admin/types'
import { LANGUAGE_COLORS, Toggle } from './primitives'

export function PageBuilderTab() {
  const { state, dispatch } = useAdmin()
  const { githubConfig: gc } = state

  function update(data: Partial<GithubConfig>) {
    dispatch({ type: 'UPDATE_GITHUB_CONFIG', payload: data })
  }

  const langStats = gc.displayRepos.reduce<Record<string, number>>((acc, r) => {
    const lang = gc.repoMeta[r]?.language ?? 'Other'
    acc[lang] = (acc[lang] ?? 0) + 1
    return acc
  }, {})
  const maxLangCount = Math.max(...Object.values(langStats), 1)

  return (
    <div className="space-y-4">

      {/* ── Page Hero ───────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-violet-400/15 bg-white/[0.02] overflow-hidden">
        <div className="flex items-center gap-2 border-b border-white/8 px-4 py-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shrink-0" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 flex-1">Hero de la Página</span>
          <span className="font-mono text-[8px] text-white/20">/en/github/ → H1</span>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Badge / Etiqueta</div>
              <input
                value={gc.pageBadge}
                onChange={(e) => update({ pageBadge: e.target.value })}
                placeholder="Open Source"
                className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 text-[11px] text-white/65 placeholder-white/20 outline-none focus:border-violet-400/25 transition-colors"
              />
            </div>
            <div className="space-y-1">
              <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Headline</div>
              <input
                value={gc.pageHeadline}
                onChange={(e) => update({ pageHeadline: e.target.value })}
                placeholder="GitHub"
                className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 text-[11px] text-white/65 placeholder-white/20 outline-none focus:border-violet-400/25 transition-colors"
              />
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Subheadline / Descripción</div>
            <input
              value={gc.pageSubheadline}
              onChange={(e) => update({ pageSubheadline: e.target.value })}
              placeholder="Open source projects, activity..."
              className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 text-[11px] text-white/65 placeholder-white/20 outline-none focus:border-violet-400/25 transition-colors"
            />
          </div>
          {/* Live preview chip */}
          <div className="rounded-lg border border-white/5 bg-black/15 px-3 py-2.5">
            <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/20 mb-2">Preview</div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/20 bg-violet-400/8 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-violet-400/70">
              <span className="h-1 w-1 rounded-full bg-violet-400/60" />
              {gc.pageBadge || 'Open Source'}
            </span>
            <div className="mt-1.5 text-lg font-semibold text-white/60">{gc.pageHeadline || 'GitHub'}.</div>
            <div className="mt-0.5 text-[10px] text-white/30 leading-relaxed">{gc.pageSubheadline || 'Descripción de la página'}</div>
          </div>
        </div>
      </div>

      {/* ── Section Visibility Matrix ────────────────────────────────────────── */}
      <div className="rounded-xl border border-violet-400/15 bg-white/[0.02] overflow-hidden">
        <div className="flex items-center gap-2 border-b border-white/8 px-4 py-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shrink-0" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 flex-1">Secciones Visibles</span>
          <span className="font-mono text-[8px] text-white/20">Qué muestra /en/github/</span>
        </div>
        <div className="divide-y divide-white/5 px-4">
          <Toggle label="Card de perfil"           desc="Avatar, bio, followers — cabecera de la página"    value={gc.showProfileCard}       onChange={(v) => update({ showProfileCard: v })} />
          <Toggle label="Mis Repositorios"         desc="Cuadrícula de repos del showcase"                  value={gc.showOwnRepos ?? true}  onChange={(v) => update({ showOwnRepos: v })} />
          <Toggle label="Heatmap de contribuciones" desc="Gráfico de calor — año completo desde GitHub API" value={gc.showContributions}     onChange={(v) => update({ showContributions: v })} />
          <Toggle label="Starred / Recomendados"   desc="⭐ Repos con estrella — hasta 300 paginados"       value={gc.showStarred}           onChange={(v) => update({ showStarred: v })} />
          <Toggle label="Stats en el perfil card"  desc="4 indicadores: Repos · Contributions · Stars · Slot 4" value={gc.showStats}       onChange={(v) => update({ showStats: v })} />
          <Toggle label="Lenguajes en perfil card" desc="Barras de distribución de lenguajes"               value={gc.showLanguages}         onChange={(v) => update({ showLanguages: v })} />
          <Toggle label="Topics en repo cards"     desc="Tags de topics en cada tarjeta"                    value={gc.showTopics}            onChange={(v) => update({ showTopics: v })} />
          <Toggle label="Forks en repo cards"      desc="Contador de forks en cada tarjeta"                 value={gc.showForks}             onChange={(v) => update({ showForks: v })} />
        </div>
      </div>

      {/* ── Own Repos Section Config ─────────────────────────────────────────── */}
      {(gc.showOwnRepos ?? true) && (
        <div className="rounded-xl border border-violet-400/15 bg-white/[0.02] overflow-hidden">
          <div className="flex items-center gap-2 border-b border-white/8 px-4 py-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shrink-0" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 flex-1">Sección: Mis Repositorios</span>
          </div>
          <div className="p-4 space-y-3">
            <div className="space-y-1">
              <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Título</div>
              <input
                value={gc.ownReposTitle}
                onChange={(e) => update({ ownReposTitle: e.target.value })}
                placeholder="My Repositories"
                className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 text-[11px] text-white/65 placeholder-white/20 outline-none focus:border-violet-400/25 transition-colors"
              />
            </div>
            <div className="space-y-1">
              <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Subtítulo</div>
              <input
                value={gc.ownReposSubtitle}
                onChange={(e) => update({ ownReposSubtitle: e.target.value })}
                placeholder="Open source projects I maintain..."
                className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 text-[11px] text-white/65 placeholder-white/20 outline-none focus:border-violet-400/25 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Límite de repos</div>
                <span className="font-mono text-[11px] text-violet-400">{gc.ownReposLimit > 0 ? gc.ownReposLimit : 'Todos'}</span>
              </div>
              <input
                type="range" min={0} max={12} step={1} value={gc.ownReposLimit}
                onChange={(e) => update({ ownReposLimit: Number(e.target.value) })}
                className="w-full h-1 accent-violet-400 cursor-pointer"
              />
              <div className="font-mono text-[8px] text-white/20">0 = mostrar todos los repos configurados</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Starred Section Config ───────────────────────────────────────────── */}
      {gc.showStarred && (
        <div className="rounded-xl border border-violet-400/15 bg-white/[0.02] overflow-hidden">
          <div className="flex items-center gap-2 border-b border-white/8 px-4 py-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shrink-0" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 flex-1">Sección: Starred / Recomendados</span>
          </div>
          <div className="p-4 space-y-3">
            <div className="space-y-1">
              <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Título</div>
              <input
                value={gc.starredTitle}
                onChange={(e) => update({ starredTitle: e.target.value })}
                placeholder="Repos Recomendados"
                className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 text-[11px] text-white/65 placeholder-white/20 outline-none focus:border-violet-400/25 transition-colors"
              />
            </div>
            <div className="space-y-1">
              <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Subtítulo</div>
              <input
                value={gc.starredSubtitle}
                onChange={(e) => update({ starredSubtitle: e.target.value })}
                placeholder="Proyectos y herramientas que recomiendo..."
                className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 text-[11px] text-white/65 placeholder-white/20 outline-none focus:border-violet-400/25 transition-colors"
              />
            </div>
            <Toggle
              label="Categorías / filtros"
              desc="Tabs: AI/ML, Web/UI, Tools, Infra, Python, Rust, Data, Security"
              value={gc.showStarredCategories}
              onChange={(v) => update({ showStarredCategories: v })}
            />
          </div>
        </div>
      )}

      {/* ── Stats + Language preview ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Stat Slot 4 */}
        <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
          <div className="border-b border-white/8 px-3 py-2">
            <span className="text-[9px] uppercase tracking-[0.18em] text-white/40">Stat Slot 4</span>
          </div>
          <div className="p-2 space-y-1.5">
            {([
              { value: 'starred' as const, label: '⭐ Repos Starred' },
              { value: 'forks'   as const, label: '⑂ Total Forks'   },
            ]).map(opt => (
              <button key={opt.value} onClick={() => update({ statSlot4: opt.value })}
                className={cn(
                  'w-full rounded-lg border px-2.5 py-1.5 text-left font-mono text-[10px] transition-all',
                  (gc.statSlot4 === opt.value || (!gc.statSlot4 && opt.value === 'starred'))
                    ? 'border-violet-400/30 bg-violet-400/8 text-violet-300'
                    : 'border-white/8 text-white/35 hover:border-white/15'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Language distribution */}
        <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
          <div className="border-b border-white/8 px-3 py-2">
            <span className="text-[9px] uppercase tracking-[0.18em] text-white/40">Lenguajes</span>
          </div>
          <div className="p-2.5 space-y-1.5">
            {Object.keys(langStats).length === 0 ? (
              <div className="py-3 text-center font-mono text-[9px] text-white/20">Sin repos</div>
            ) : (
              Object.entries(langStats)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([lang, count]) => (
                  <div key={lang} className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: LANGUAGE_COLORS[lang] ?? '#9e9e9e' }} />
                    <span className="w-16 text-[9px] text-white/50 shrink-0 truncate">{lang}</span>
                    <div className="flex-1 h-1 rounded-full bg-white/8 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(count / maxLangCount) * 100}%`, background: LANGUAGE_COLORS[lang] ?? '#9e9e9e' }} />
                    </div>
                    <span className="font-mono text-[8px] text-white/25 w-3 text-right">{count}</span>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
