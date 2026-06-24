'use client'

import { useState, useRef, useCallback, useMemo } from 'react'
import {
  Eye, EyeOff, RefreshCw, ExternalLink, Maximize2, Pencil,
  ChevronUp, ChevronDown, Sparkles, LayoutGrid, List, Monitor, Tablet, Smartphone,
  Layers, Cpu, FlaskConical, Server, BookOpen, MessageSquare,
  User, GitBranch, FolderKanban, Microscope, Library, Gamepad2, Globe,
  AlertTriangle, CheckCircle2, Circle,
  ToggleLeft, ToggleRight, Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdmin } from '@/lib/admin/store'
import type { AdminPanel, AdminState } from '@/lib/admin/types'

// Sub-file imports
import { Slider } from './content/primitives'
import {
  HeroEditor, SystemsEditor, LabsEditor, InfraEditor, JournalSummary, CollabEditor,
} from './content/HomeSectionsEditors'
import {
  ProjectsEditor, ResearchEditor, JournalPageEditor,
} from './content/RegistryEditors'
import { ResourcesEditor } from './content/ResourcesHubEditor'
import { AboutEditor, ContactEditor } from './content/ProfileEditors'
import { GitHubEditor, PlaygroundEditor, IntelligenceEditor } from './content/DomainEditors'

// ─── Live content data model ────────────────────────────────────────────────────

interface Chip { label: string; value: string | number; color: string }

interface SectionLiveData {
  status: 'ok' | 'warn' | 'empty'
  score: number       // 0-100 completeness
  label: string       // short label e.g. "5 publicados"
  count: number       // primary metric
  issues: string[]    // actionable problems
  chips: Chip[]       // breakdown rows
  blockId?: string    // corresponding block for enable/disable
  isEnabled?: boolean // current state from blocks
}

interface LiveData {
  sections: Record<string, SectionLiveData>
  score: number       // 0-100 global health
  issues: { id: string; label: string; message: string; severity: 'warn' | 'empty' }[]
  metrics: { label: string; value: number; accent: string; sub?: string }[]
  lastSaved: string | null
}

function computeLiveData(state: AdminState): LiveData {
  const blocks = state.blocks ?? []
  const blockEnabled = (id: string) => blocks.find(b => b.id === id)?.enabled ?? true

  // ── Registry counts ──
  const pubProjects   = state.projectsRegistry.filter(p => p.published || p.cmsStatus === 'published').length
  const liveProjects  = state.projectsRegistry.filter(p => p.status === 'live').length
  const betaProjects  = state.projectsRegistry.filter(p => p.status === 'beta').length
  const wipProjects   = state.projectsRegistry.filter(p => p.status === 'wip').length
  const archProjects  = state.projectsRegistry.filter(p => p.status === 'archived').length
  const totalProjects = state.projectsRegistry.length

  const pubResearch   = state.researchRegistry.filter(r => r.published || r.cmsStatus === 'published').length
  const draftResearch = state.researchRegistry.filter(r => !r.published && r.cmsStatus !== 'published').length
  const featResearch  = state.researchRegistry.filter(r => r.featured).length
  const totalResearch = state.researchRegistry.length

  const labLive = state.labsRegistry.filter(l => l.status === 'live' && l.visible).length
  const labBeta = state.labsRegistry.filter(l => l.status === 'beta' && l.visible).length
  const labRd   = state.labsRegistry.filter(l => l.status === 'rd').length
  const labSoon = state.labsRegistry.filter(l => l.status === 'roadmap').length
  const visLabs = labLive + labBeta
  const totalLabs = state.labsRegistry.length

  const visSystems   = state.systemsRegistry.filter(s => s.visible).length
  const hidSystems   = state.systemsRegistry.filter(s => !s.visible).length
  const totalSystems = state.systemsRegistry.length

  const tools    = state.toolRegistry?.length ?? 0
  const repos    = state.repoRegistry?.length ?? 0
  const workflows = state.workflowRegistry?.length ?? 0
  const prompts  = state.promptRegistry?.length ?? 0
  const mcps     = state.mcpRegistry?.length ?? 0
  const agents   = state.agentRegistry?.length ?? 0
  const totalResources = tools + repos + workflows + prompts + mcps + agents

  const curatedLinks   = state.curatedLinks?.length ?? 0
  const trackedSources = state.trackedSources?.length ?? 0

  // ── Hero ──
  const hero = state.content?.hero
  const heroChecks = [
    (hero?.title?.length ?? 0) > 5,
    (hero?.subtitle?.length ?? 0) > 10,
    (hero?.primaryBtnText?.length ?? 0) > 0,
    (hero?.secondaryBtnText?.length ?? 0) > 0,
    (hero?.eyebrow?.length ?? 0) > 0,
  ]
  const heroScore = Math.round(heroChecks.filter(Boolean).length / heroChecks.length * 100)
  const heroIssues: string[] = []
  if (!(hero?.title?.length ?? 0))    heroIssues.push('Título principal vacío')
  if (!(hero?.subtitle?.length ?? 0)) heroIssues.push('Subtítulo no configurado')
  if (!(hero?.primaryBtnText?.length ?? 0)) heroIssues.push('CTA primario sin texto')

  // ── About ──
  const about = state.aboutConfig
  const aboutChecks = [
    (about?.headline?.length ?? 0) > 3,
    (about?.bio?.length ?? 0) > 20,
    (about?.skills?.length ?? 0) > 0,
    (about?.timeline?.length ?? 0) > 0,
    (about?.location?.length ?? 0) > 0,
  ]
  const aboutScore = Math.round(aboutChecks.filter(Boolean).length / aboutChecks.length * 100)
  const aboutIssues: string[] = []
  if (!(about?.headline?.length ?? 0)) aboutIssues.push('Headline no configurado')
  if (!(about?.bio?.length ?? 0))      aboutIssues.push('Biografía vacía')
  if (!(about?.skills?.length ?? 0))   aboutIssues.push('Sin skills añadidos')

  // ── GitHub ──
  const ghUser = state.githubConfig?.username ?? ''
  const ghIssues: string[] = []
  if (!ghUser) ghIssues.push('Usuario de GitHub no configurado')

  // ── Build sections map ──
  const sections: Record<string, SectionLiveData> = {
    hero: {
      status:    heroScore === 100 ? 'ok' : heroScore > 40 ? 'warn' : 'empty',
      score:     heroScore,
      count:     heroScore,
      label:     heroScore === 100 ? 'Completo' : `${heroScore}% configurado`,
      issues:    heroIssues,
      chips:     [
        { label: 'título',    value: (hero?.title?.length ?? 0) > 0 ? '✓' : '✗', color: (hero?.title?.length ?? 0) > 0 ? '#34d399' : '#f87171' },
        { label: 'subtítulo', value: (hero?.subtitle?.length ?? 0) > 0 ? '✓' : '✗', color: (hero?.subtitle?.length ?? 0) > 0 ? '#34d399' : '#f87171' },
        { label: 'CTA',       value: (hero?.primaryBtnText?.length ?? 0) > 0 ? '✓' : '✗', color: (hero?.primaryBtnText?.length ?? 0) > 0 ? '#34d399' : '#f87171' },
      ],
      blockId:   'hero',
      isEnabled: blockEnabled('hero'),
    },
    systems: {
      status:  visSystems > 0 ? 'ok' : 'empty',
      score:   totalSystems === 0 ? 0 : Math.min(100, Math.round(visSystems / totalSystems * 100)),
      count:   visSystems,
      label:   `${visSystems} visibles de ${totalSystems}`,
      issues:  visSystems === 0 ? ['Sin sistemas visibles en portada'] : [],
      chips:   [
        { label: 'visibles', value: visSystems,  color: '#a78bfa' },
        { label: 'ocultos',  value: hidSystems,  color: '#ffffff30' },
        { label: 'total',    value: totalSystems, color: '#ffffff50' },
      ],
    },
    labs: {
      status:  visLabs > 0 ? 'ok' : 'empty',
      score:   totalLabs === 0 ? 0 : Math.min(100, Math.round(visLabs / totalLabs * 100)),
      count:   visLabs,
      label:   `${visLabs} activos de ${totalLabs}`,
      issues:  visLabs === 0 ? ['Sin labs activos en portada'] : [],
      chips:   [
        { label: 'live',     value: labLive, color: '#34d399' },
        { label: 'beta',     value: labBeta, color: '#60a5fa' },
        { label: 'R&D',      value: labRd,   color: '#fbbf24' },
        { label: 'roadmap',  value: labSoon, color: '#ffffff30' },
      ],
    },
    infrastructure: {
      status:  'ok',
      score:   100,
      count:   1,
      label:   'Siempre activa',
      issues:  [],
      chips:   [
        { label: 'región',       value: state.infraConfig?.region ?? '—',       color: '#38bdf8' },
        { label: 'orchestrator', value: state.infraConfig?.orchestrator ?? '—', color: '#38bdf8' },
      ],
    },
    journal: {
      status:  pubResearch > 0 ? 'ok' : 'empty',
      score:   pubResearch > 0 ? Math.min(100, pubResearch * 20) : 0,
      count:   pubResearch,
      label:   `${pubResearch} publicados`,
      issues:  pubResearch === 0 ? ['Sin artículos publicados para el preview'] : [],
      chips:   [
        { label: 'pub',      value: pubResearch,  color: '#fbbf24' },
        { label: 'featured', value: featResearch, color: '#fb923c' },
        { label: 'total',    value: totalResearch, color: '#ffffff50' },
      ],
      blockId:   'blog',
      isEnabled: blockEnabled('blog'),
    },
    collab: {
      status:  blockEnabled('cta') ? 'ok' : 'warn',
      score:   blockEnabled('cta') ? 100 : 50,
      count:   1,
      label:   blockEnabled('cta') ? 'CTA activo' : 'CTA desactivado',
      issues:  blockEnabled('cta') ? [] : ['El bloque CTA está desactivado'],
      chips:   [{ label: 'bloque', value: blockEnabled('cta') ? 'ON' : 'OFF', color: blockEnabled('cta') ? '#34d399' : '#f87171' }],
      blockId:   'cta',
      isEnabled: blockEnabled('cta'),
    },
    projects: {
      status:  pubProjects > 0 ? 'ok' : 'empty',
      score:   totalProjects === 0 ? 0 : Math.round(pubProjects / totalProjects * 100),
      count:   pubProjects,
      label:   `${pubProjects} publicados de ${totalProjects}`,
      issues:  pubProjects === 0 ? ['Sin proyectos publicados'] : [],
      chips:   [
        { label: 'live',     value: liveProjects, color: '#34d399' },
        { label: 'beta',     value: betaProjects, color: '#60a5fa' },
        { label: 'wip',      value: wipProjects,  color: '#fbbf24' },
        { label: 'archived', value: archProjects, color: '#ffffff30' },
      ],
    },
    research: {
      status:  pubResearch > 0 ? 'ok' : 'empty',
      score:   totalResearch === 0 ? 0 : Math.round(pubResearch / totalResearch * 100),
      count:   pubResearch,
      label:   `${pubResearch} publicados`,
      issues:  pubResearch === 0 ? ['Sin investigaciones publicadas'] : [],
      chips:   [
        { label: 'pub',     value: pubResearch,   color: '#a78bfa' },
        { label: 'draft',   value: draftResearch, color: '#ffffff30' },
        { label: 'featured',value: featResearch,  color: '#fb923c' },
      ],
    },
    'journal-page': {
      status:  pubResearch > 0 ? 'ok' : 'empty',
      score:   totalResearch === 0 ? 0 : Math.round(pubResearch / totalResearch * 100),
      count:   pubResearch,
      label:   `${pubResearch} artículos`,
      issues:  pubResearch === 0 ? ['Sin artículos en el journal'] : [],
      chips:   [
        { label: 'pub',   value: pubResearch,   color: '#fbbf24' },
        { label: 'draft', value: draftResearch, color: '#ffffff30' },
      ],
    },
    resources: {
      status:  totalResources > 0 ? 'ok' : 'empty',
      score:   Math.min(100, totalResources * 2),
      count:   totalResources,
      label:   `${totalResources} recursos totales`,
      issues:  totalResources === 0 ? ['Sin recursos registrados'] : [],
      chips:   [
        { label: 'tools',   value: tools,    color: '#34d399' },
        { label: 'repos',   value: repos,    color: '#60a5fa' },
        { label: 'MCP',     value: mcps,     color: '#a78bfa' },
        { label: 'agents',  value: agents,   color: '#fb923c' },
        { label: 'prompts', value: prompts,  color: '#fbbf24' },
      ],
    },
    about: {
      status:  aboutScore > 60 ? 'ok' : aboutScore > 20 ? 'warn' : 'empty',
      score:   aboutScore,
      count:   aboutScore,
      label:   `${aboutScore}% del perfil`,
      issues:  aboutIssues,
      chips:   [
        { label: 'headline', value: (about?.headline?.length ?? 0) > 0 ? '✓' : '✗', color: (about?.headline?.length ?? 0) > 0 ? '#34d399' : '#f87171' },
        { label: 'bio',      value: (about?.bio?.length ?? 0) > 0 ? '✓' : '✗',      color: (about?.bio?.length ?? 0) > 0 ? '#34d399' : '#f87171' },
        { label: 'skills',   value: about?.skills?.length ?? 0,                       color: '#94a3b8' },
        { label: 'timeline', value: about?.timeline?.length ?? 0,                     color: '#94a3b8' },
      ],
    },
    contact: {
      status:  'ok',
      score:   100,
      count:   1,
      label:   'Siempre activa',
      issues:  [],
      chips:   [{ label: 'disponibilidad', value: about?.availability ?? 'available', color: '#fb923c' }],
    },
    github: {
      status:  ghUser.length > 0 ? 'ok' : 'warn',
      score:   ghUser.length > 0 ? 100 : 0,
      count:   ghUser.length > 0 ? 1 : 0,
      label:   ghUser.length > 0 ? `@${ghUser}` : 'Sin usuario',
      issues:  ghIssues,
      chips:   [
        { label: 'usuario', value: ghUser || 'no configurado', color: ghUser ? '#f472b6' : '#f87171' },
      ],
    },
    playground: {
      status:  'warn',
      score:   0,
      count:   0,
      label:   'Coming soon',
      issues:  ['Sección en construcción'],
      chips:   [{ label: 'estado', value: 'SOON', color: '#fbbf24' }],
    },
    intelligence: {
      status:  curatedLinks > 0 ? 'ok' : 'empty',
      score:   Math.min(100, curatedLinks * 5),
      count:   curatedLinks,
      label:   `${curatedLinks} fuentes`,
      issues:  curatedLinks === 0 ? ['Sin fuentes de inteligencia configuradas'] : [],
      chips:   [
        { label: 'curadas',   value: curatedLinks,   color: '#facc15' },
        { label: 'rastreadas',value: trackedSources, color: '#ffffff50' },
      ],
    },
  }

  // ── Global score (average of all section scores) ──
  const scores = Object.values(sections).map(s => s.score)
  const score  = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)

  // ── Global issues list (all non-ok sections, sorted by severity) ──
  const issues = Object.entries(sections)
    .filter(([, s]) => s.issues.length > 0)
    .flatMap(([id, s]) => {
      const secDef = [...([] as { id: string; label: string }[])].concat(
        HOME_LABELS.find(x => x.id === id) ? [HOME_LABELS.find(x => x.id === id)!] : [],
        DOMAIN_LABELS.find(x => x.id === id) ? [DOMAIN_LABELS.find(x => x.id === id)!] : [],
      )
      const label = secDef[0]?.label ?? id
      return s.issues.map(msg => ({ id, label, message: msg, severity: s.status as 'warn' | 'empty' }))
    })
    .sort((a, b) => (a.severity === 'warn' ? -1 : 1) - (b.severity === 'warn' ? -1 : 1))

  return {
    sections,
    score,
    issues,
    metrics: [
      { label: 'Proyectos', value: pubProjects,    accent: '#60a5fa', sub: `de ${totalProjects}` },
      { label: 'Research',  value: pubResearch,    accent: '#a78bfa', sub: `de ${totalResearch}` },
      { label: 'Labs',      value: visLabs,        accent: '#34d399', sub: `de ${totalLabs}` },
      { label: 'Systems',   value: visSystems,     accent: '#38bdf8', sub: `de ${totalSystems}` },
      { label: 'Recursos',  value: totalResources, accent: '#fbbf24', sub: `${tools}t ${repos}r ${mcps}m` },
    ],
    lastSaved: state.lastSaved ?? null,
  }
}

// Label lookups used by issues list
const HOME_LABELS  = [
  { id: 'hero', label: 'Hero' }, { id: 'systems', label: 'Systems' }, { id: 'labs', label: 'Labs' },
  { id: 'infrastructure', label: 'Infrastructure' }, { id: 'journal', label: 'Journal' }, { id: 'collab', label: 'Collab CTA' },
]
const DOMAIN_LABELS = [
  { id: 'projects', label: 'Projects' }, { id: 'research', label: 'Research' }, { id: 'journal-page', label: 'Journal' },
  { id: 'resources', label: 'Resources' }, { id: 'about', label: 'About' }, { id: 'contact', label: 'Contact' },
  { id: 'github', label: 'GitHub' }, { id: 'playground', label: 'Playground' }, { id: 'intelligence', label: 'Intelligence' },
]

// ─── Visual effects ────────────────────────────────────────────────────────────

type FxKey = 'aurora' | 'meteors' | 'smoothScroll' | 'customCursor' | 'borderBeam' | 'spotlight' | 'noiseOverlay' | 'scanlines' | 'parallax' | 'glitchText'
type FxObj = { enabled: boolean; intensity?: number; count?: number; duration?: number; speed?: number; radius?: number }

const EFFECTS: { key: FxKey; label: string; desc: string; accent: string }[] = [
  { key: 'aurora',       label: 'Aurora',       desc: 'Gradiente ambiental animado en el fondo',  accent: '#a78bfa' },
  { key: 'meteors',      label: 'Meteoros',      desc: 'Lluvia de partículas estilo meteoros',     accent: '#fb923c' },
  { key: 'smoothScroll', label: 'Smooth Scroll', desc: 'Lenis — scroll suave con inercia',         accent: '#49b7ff' },
  { key: 'customCursor', label: 'Custom Cursor', desc: 'Cursor personalizado con halo',            accent: '#f472b6' },
  { key: 'borderBeam',   label: 'Border Beam',   desc: 'Haz animado en bordes de tarjetas',        accent: '#34d399' },
  { key: 'spotlight',    label: 'Spotlight',     desc: 'Luz ambiental siguiendo el cursor',        accent: '#fbbf24' },
  { key: 'noiseOverlay', label: 'Noise Overlay', desc: 'Textura de ruido sobre el fondo',          accent: '#94a3b8' },
  { key: 'scanlines',    label: 'Scanlines',     desc: 'Líneas de escaneo estilo CRT',             accent: '#38bdf8' },
  { key: 'parallax',     label: 'Parallax',      desc: 'Efecto parallax en scroll',                accent: '#60a5fa' },
  { key: 'glitchText',   label: 'Glitch Text',   desc: 'Efecto glitch en títulos',                 accent: '#f87171' },
]

// ─── Live preview ──────────────────────────────────────────────────────────────

type DeviceSize = 'desktop' | 'tablet' | 'mobile'
const DEVICE_W: Record<DeviceSize, string> = { desktop: '100%', tablet: '768px', mobile: '390px' }

function LivePreview({ path }: { path: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [loaded, setLoaded]  = useState(false)
  const [device, setDevice]  = useState<DeviceSize>('desktop')
  const [fullscreen, setFs]  = useState(false)

  const reload = useCallback(() => {
    if (!iframeRef.current) return
    setLoaded(false)
    iframeRef.current.src = path
  }, [path])

  return (
    <div className={cn('flex flex-col rounded-xl border border-white/10 overflow-hidden mt-4',
      fullscreen && 'fixed inset-3 z-[300] border-cyan-400/20 bg-[#05060a]')}>
      <div className="flex items-center gap-2 border-b border-white/8 bg-white/3 px-3 py-1.5 shrink-0">
        <div className="flex items-center gap-0.5 rounded-lg border border-white/10 bg-black/20 p-0.5">
          {(['desktop', 'tablet', 'mobile'] as DeviceSize[]).map(d => (
            <button key={d} onClick={() => setDevice(d)}
              className={cn('flex items-center px-1.5 py-0.5 rounded-md transition-all text-[9px]',
                device === d ? 'bg-white/10 text-white/80' : 'text-white/30 hover:text-white/60')}>
              {d === 'desktop' ? <Monitor size={11} /> : d === 'tablet' ? <Tablet size={11} /> : <Smartphone size={11} />}
            </button>
          ))}
        </div>
        <span className="flex-1 font-mono text-[9px] text-white/25 truncate">{path}</span>
        <button onClick={reload} className="rounded p-1 text-white/30 hover:text-white/70 transition-colors"><RefreshCw size={10} /></button>
        <button onClick={() => window.open(path, '_blank', 'noopener')} className="rounded p-1 text-white/30 hover:text-white/70 transition-colors"><ExternalLink size={10} /></button>
        <button onClick={() => setFs(v => !v)} className="rounded p-1 text-white/30 hover:text-white/70 transition-colors"><Maximize2 size={10} /></button>
        {fullscreen && <button onClick={() => setFs(false)} className="rounded border border-white/15 px-1.5 py-0.5 text-[9px] text-white/40 hover:text-white/70">✕</button>}
      </div>
      <div className={cn('relative flex items-center justify-center bg-black/60', fullscreen ? 'flex-1' : 'h-[480px]')}>
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 z-10">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-400/20 border-t-cyan-400" />
            <span className="text-[10px] text-white/30">Cargando…</span>
          </div>
        )}
        <div className={cn('h-full overflow-hidden transition-all', device !== 'desktop' && 'rounded-xl border border-white/10 shadow-2xl')}
          style={{ width: DEVICE_W[device] }}>
          <iframe ref={iframeRef} src={path} title={`Preview ${path}`}
            className={cn('h-full w-full border-0 transition-opacity duration-300', loaded ? 'opacity-100' : 'opacity-0')}
            style={{ colorScheme: 'dark' }} onLoad={() => setLoaded(true)} sandbox="allow-scripts allow-same-origin" />
        </div>
      </div>
    </div>
  )
}

// ─── Section / domain page map ────────────────────────────────────────────────

interface SectionDef {
  id: string; anchor: string; label: string; desc: string
  icon: React.ReactNode; accent: string; path: string
  editor: React.ComponentType
  relatedPanel?: AdminPanel; relatedLabel?: string
  badge?: string
}

const HOME_SECTIONS: SectionDef[] = [
  { id: 'hero',           anchor: 'hero',           label: 'Hero',              desc: 'Portada — titular, subtítulo, CTAs y badge',              path: '/en/',                icon: <Layers size={12} />,        accent: '#49b7ff', editor: HeroEditor,     badge: 'LIVE' },
  { id: 'systems',        anchor: 'systems',        label: 'Systems',           desc: 'Preview de arquitecturas AI activas',                      path: '/en/#systems',        icon: <Cpu size={12} />,           accent: '#a78bfa', editor: SystemsEditor,  badge: 'LIVE', relatedPanel: 'systems',        relatedLabel: 'Systems Manager' },
  { id: 'labs',           anchor: 'labs',           label: 'Labs',              desc: 'Preview de productos de laboratorio',                      path: '/en/#labs',           icon: <FlaskConical size={12} />,  accent: '#34d399', editor: LabsEditor,     badge: 'LIVE', relatedPanel: 'labs',           relatedLabel: 'Labs Manager' },
  { id: 'infrastructure', anchor: 'infrastructure', label: 'Infrastructure',    desc: 'Preview del centro de operaciones',                        path: '/en/#infrastructure', icon: <Server size={12} />,        accent: '#38bdf8', editor: InfraEditor,    badge: 'LIVE', relatedPanel: 'infrastructure', relatedLabel: 'Infrastructure' },
  { id: 'journal',        anchor: 'journal',        label: 'Journal Preview',   desc: 'Preview del diario técnico — artículo destacado',          path: '/en/#journal',        icon: <BookOpen size={12} />,      accent: '#fbbf24', editor: JournalSummary, badge: 'LIVE', relatedPanel: 'research',       relatedLabel: 'Research Manager' },
  { id: 'collab',         anchor: 'collaborate',    label: 'Collaboration CTA', desc: 'Sección de llamada a colaborar',                           path: '/en/#collaborate',    icon: <MessageSquare size={12} />, accent: '#fb923c', editor: CollabEditor,   badge: 'LIVE' },
]

const DOMAIN_PAGES: SectionDef[] = [
  { id: 'projects',    anchor: 'projects',   label: 'Projects',   desc: 'Portfolio y casos de estudio — todos los proyectos',         path: '/en/projects/',   icon: <FolderKanban size={12} />, accent: '#60a5fa', editor: ProjectsEditor,  relatedPanel: 'projects',    relatedLabel: 'Projects Manager' },
  { id: 'research',    anchor: 'research',   label: 'Research',   desc: 'Artículos, ensayos y noticias técnicas',                     path: '/en/research/',   icon: <Microscope size={12} />,   accent: '#a78bfa', editor: ResearchEditor,  relatedPanel: 'research',    relatedLabel: 'Research Manager' },
  { id: 'journal-page',anchor: 'journal-p', label: 'Journal',    desc: 'Publicación técnica — todos los artículos',                  path: '/en/journal/',    icon: <BookOpen size={12} />,     accent: '#fbbf24', editor: JournalPageEditor, relatedPanel: 'research',    relatedLabel: 'Research Manager' },
  { id: 'resources',   anchor: 'resources',  label: 'Resources',  desc: 'Herramientas, agentes, automatizaciones, prompts',           path: '/en/resources/',  icon: <Library size={12} />,      accent: '#34d399', editor: ResourcesEditor },
  { id: 'about',       anchor: 'about',      label: 'About',      desc: 'Perfil, skills, timeline y filosofía',                       path: '/en/about/',      icon: <User size={12} />,         accent: '#94a3b8', editor: AboutEditor,     relatedPanel: 'about',       relatedLabel: 'About Panel' },
  { id: 'contact',     anchor: 'contact',    label: 'Contact',    desc: 'Formulario de contacto y datos de colaboración',             path: '/en/contact/',    icon: <MessageSquare size={12} />,accent: '#fb923c', editor: ContactEditor },
  { id: 'github',      anchor: 'github',     label: 'GitHub',     desc: 'Repositorios, contribuciones y actividad',                   path: '/en/github/',     icon: <GitBranch size={12} />,    accent: '#f472b6', editor: GitHubEditor,    relatedPanel: 'github',      relatedLabel: 'GitHub Panel' },
  { id: 'playground',    anchor: 'playground',  label: 'Playground',       desc: 'Sandbox interactivo — coming soon',                          path: '/en/playground/',    icon: <Gamepad2 size={12} />,    accent: '#94a3b8', editor: PlaygroundEditor,    badge: 'SOON' },
  { id: 'intelligence',  anchor: 'intelligence', label: 'Intelligence Feed', desc: 'Fuentes de inteligencia y feeds en vivo',                     path: '/en/intelligence/',  icon: <Globe size={12} />,       accent: '#facc15', editor: IntelligenceEditor,  relatedPanel: 'intelligence', relatedLabel: 'Intelligence Feeds' },
]

// ─── Quick nav ─────────────────────────────────────────────────────────────────

const QUICK_NAV: { panel: AdminPanel; label: string }[] = [
  { panel: 'design-studio', label: 'Design Studio' },
  { panel: 'blocks',        label: 'Bloques'        },
  { panel: 'personality',   label: 'Efectos web'    },
  { panel: 'navbar-config', label: 'Navbar'         },
  { panel: 'seo',           label: 'SEO & Meta'     },
  { panel: 'footer-config', label: 'Footer'         },
]

// ─── Section card ──────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<'ok' | 'warn' | 'empty', string> = {
  ok:    '#34d399',
  warn:  '#fbbf24',
  empty: '#ffffff20',
}

function ScoreRing({ score, size = 28, stroke = 3, color }: { score: number; size?: number; stroke?: number; color: string }) {
  const r   = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const dash = circ * (score / 100)
  return (
    <svg width={size} height={size} className="-rotate-90" style={{ minWidth: size }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.6s ease' }} />
    </svg>
  )
}

function SectionCard({ sec, active, onClick, live, onToggleBlock }: {
  sec: SectionDef; active: boolean; onClick: () => void
  live?: SectionLiveData; onToggleBlock?: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const statusColor = live ? STATUS_COLOR[live.status] : '#ffffff20'
  const hasToggle   = live?.blockId !== undefined && onToggleBlock

  return (
    <div className={cn('flex flex-col rounded-xl border transition-all',
      active ? 'border-white/20' : 'border-white/8 hover:border-white/14')}
      style={active ? { borderColor: `${sec.accent}35`, background: `${sec.accent}06` } : {}}>

      {/* Card header — click to select editor */}
      <button onClick={onClick} className="flex flex-col gap-1.5 p-2.5 text-left w-full">
        <div className="flex items-start justify-between gap-1">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg shrink-0"
            style={{ background: `${sec.accent}18`, color: sec.accent }}>{sec.icon}</div>
          <div className="flex items-center gap-1 shrink-0">
            {live && <span className="h-1.5 w-1.5 rounded-full" style={{ background: statusColor }} />}
            {sec.badge && (
              <span className="font-mono text-[7px] rounded px-1 py-0.5 border"
                style={sec.badge === 'LIVE'
                  ? { color: '#34d399', borderColor: '#34d39920', background: '#34d39908' }
                  : { color: '#fbbf24', borderColor: '#fbbf2420', background: '#fbbf2408' }}>
                {sec.badge}
              </span>
            )}
          </div>
        </div>
        <div>
          <div className="text-[11px] font-medium text-white/80 leading-tight">{sec.label}</div>
          {live && (
            <div className="font-mono text-[8px] mt-0.5" style={{ color: statusColor }}>
              {live.label}
            </div>
          )}
        </div>
      </button>

      {/* Score bar */}
      {live && (
        <div className="mx-2.5 mb-1 h-0.5 rounded-full bg-white/5 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${live.score}%`, background: statusColor, opacity: 0.7 }} />
        </div>
      )}

      {/* Actions row */}
      <div className="flex items-center gap-0.5 px-2 pb-2 pt-0.5">
        {hasToggle && (
          <button
            onClick={e => { e.stopPropagation(); onToggleBlock!() }}
            title={live!.isEnabled ? 'Desactivar bloque' : 'Activar bloque'}
            className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[8px] font-mono border transition-all"
            style={live!.isEnabled
              ? { color: '#34d399', borderColor: '#34d39920', background: '#34d39908' }
              : { color: '#ffffff40', borderColor: '#ffffff10', background: 'transparent' }}>
            {live!.isEnabled
              ? <ToggleRight size={10} />
              : <ToggleLeft size={10} />}
            {live!.isEnabled ? 'ON' : 'OFF'}
          </button>
        )}
        <span className="flex-1" />
        {live && live.chips.length > 0 && (
          <button
            onClick={e => { e.stopPropagation(); setExpanded(v => !v) }}
            className="rounded-md p-0.5 text-white/20 hover:text-white/50 transition-colors">
            <ChevronDown size={10} className={cn('transition-transform duration-200', expanded && 'rotate-180')} />
          </button>
        )}
      </div>

      {/* Expanded: chips + issues */}
      {expanded && live && (
        <div className="border-t border-white/6 px-2.5 py-2 space-y-2">
          {live.chips.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {live.chips.map(chip => (
                <span key={chip.label}
                  className="inline-flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 font-mono text-[7px]"
                  style={{ color: chip.color, borderColor: `${chip.color}20`, background: `${chip.color}08` }}>
                  <span className="text-white/30">{chip.label}</span>
                  <span className="font-semibold">{chip.value}</span>
                </span>
              ))}
            </div>
          )}
          {live.issues.length > 0 && (
            <div className="space-y-0.5">
              {live.issues.map((iss, i) => (
                <div key={i} className="flex items-start gap-1 text-[8px] text-yellow-400/60">
                  <AlertTriangle size={8} className="mt-0.5 shrink-0" />
                  <span>{iss}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}


// ─── Section Manager Row (Manage mode) ────────────────────────────────────────

function SectionManagerRow({
  sec, live, isFirst, isLast, expanded, manage,
  onExpand, onReorder, onToggle, onRename, onGoPanel,
}: {
  sec: SectionDef & { customLabel?: string; customDesc?: string; effectiveEnabled: boolean }
  live?: SectionLiveData
  isFirst: boolean; isLast: boolean
  expanded: boolean; manage: boolean
  onExpand: () => void
  onReorder: (dir: 'up' | 'down') => void
  onToggle: () => void
  onRename: (label: string, desc?: string) => void
  onGoPanel?: (panel: AdminPanel) => void
}) {
  const [renaming, setRenaming] = useState(false)
  const [labelVal, setLabelVal] = useState(sec.customLabel || sec.label)
  const [descVal,  setDescVal]  = useState(sec.customDesc  || sec.desc)
  const statusColor = live ? STATUS_COLOR[live.status] : '#ffffff20'
  const enabled = sec.effectiveEnabled
  const label   = sec.customLabel || sec.label
  const desc    = sec.customDesc  || sec.desc
  const hasCustom = !!(sec.customLabel || sec.customDesc)

  const commitRename = () => {
    const l = labelVal.trim()
    const d = descVal.trim()
    if (l) onRename(l, d || undefined)
    setRenaming(false)
  }

  return (
    <div className={cn('group transition-all', !enabled && 'opacity-55')}>
      {/* Main row */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        {/* Reorder arrows — only in manage mode */}
        {manage && (
          <div className="flex flex-col gap-px shrink-0">
            <button disabled={isFirst} onClick={() => onReorder('up')}
              className={cn('rounded px-0.5 py-px transition-colors',
                isFirst ? 'text-white/10 cursor-not-allowed' : 'text-white/30 hover:text-white/70 hover:bg-white/5')}>
              <ChevronUp size={9} />
            </button>
            <button disabled={isLast} onClick={() => onReorder('down')}
              className={cn('rounded px-0.5 py-px transition-colors',
                isLast ? 'text-white/10 cursor-not-allowed' : 'text-white/30 hover:text-white/70 hover:bg-white/5')}>
              <ChevronDown size={9} />
            </button>
          </div>
        )}

        {/* ON/OFF toggle */}
        <button onClick={onToggle}
          className={cn('shrink-0 flex items-center gap-1 rounded-lg border px-1.5 py-0.5 font-mono text-[8px] transition-all',
            enabled
              ? 'border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-400/80 hover:border-emerald-400/35'
              : 'border-white/10 bg-white/3 text-white/30 hover:border-white/20')}
          title={enabled ? 'Desactivar sección' : 'Activar sección'}>
          {enabled ? <ToggleRight size={10} /> : <ToggleLeft size={10} />}
          {enabled ? 'ON' : 'OFF'}
        </button>

        {/* Icon */}
        <div className="flex h-6 w-6 items-center justify-center rounded-lg shrink-0"
          style={{ background: `${sec.accent}15`, color: sec.accent }}>{sec.icon}</div>

        {/* Label / rename */}
        <div className="flex-1 min-w-0">
          {renaming ? (
            <div className="space-y-1" onClick={e => e.stopPropagation()}>
              <input
                value={labelVal} onChange={e => setLabelVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenaming(false) }}
                className="w-full rounded border border-cyan-400/30 bg-cyan-400/5 px-1.5 py-0.5 text-[11px] text-white/85 outline-none focus:border-cyan-400/50"
                placeholder="Nombre de la sección" autoFocus />
              <input
                value={descVal} onChange={e => setDescVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenaming(false) }}
                className="w-full rounded border border-white/10 bg-white/3 px-1.5 py-0.5 text-[9px] text-white/50 outline-none focus:border-white/20"
                placeholder="Descripción" />
              <div className="flex gap-1">
                <button onClick={commitRename}
                  className="rounded border border-cyan-400/30 bg-cyan-400/10 px-1.5 py-0.5 text-[8px] text-cyan-400 hover:bg-cyan-400/15">
                  Guardar
                </button>
                <button onClick={() => setRenaming(false)}
                  className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] text-white/30 hover:text-white/60">
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-medium text-white/80 truncate">{label}</span>
                {hasCustom && <span className="font-mono text-[6px] text-cyan-400/50 border border-cyan-400/20 rounded px-0.5">custom</span>}
                {sec.badge && (
                  <span className="font-mono text-[6px] rounded px-1 py-0.5 border"
                    style={sec.badge === 'LIVE'
                      ? { color: '#34d399', borderColor: '#34d39920', background: '#34d39908' }
                      : { color: '#fbbf24', borderColor: '#fbbf2420', background: '#fbbf2408' }}>
                    {sec.badge}
                  </span>
                )}
              </div>
              <div className="text-[9px] text-white/28 truncate">{desc}</div>
            </div>
          )}
        </div>

        {/* Live status */}
        {live && !renaming && (
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: statusColor }} />
            <span className="font-mono text-[8px]" style={{ color: statusColor }}>{live.label}</span>
          </div>
        )}

        {/* Action buttons */}
        {!renaming && (
          <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            {manage && (
              <button onClick={() => { setLabelVal(sec.customLabel || sec.label); setDescVal(sec.customDesc || sec.desc); setRenaming(true) }}
                title="Renombrar" className="rounded p-1 text-white/25 hover:text-white/60 hover:bg-white/5 transition-all">
                <Pencil size={9} />
              </button>
            )}
            {sec.path && (
              <a href={sec.path} target="_blank" rel="noopener noreferrer"
                title="Ver en web" className="rounded p-1 text-white/25 hover:text-white/60 hover:bg-white/5 transition-all">
                <ExternalLink size={9} />
              </a>
            )}
          </div>
        )}

        {/* Expand editor */}
        {!renaming && (
          <button onClick={onExpand}
            className={cn('shrink-0 rounded-lg border px-2 py-1 text-[9px] transition-all',
              expanded
                ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-400'
                : 'border-white/10 bg-white/3 text-white/35 hover:border-white/20 hover:text-white/70')}>
            {expanded ? 'Cerrar ↑' : 'Editar ↓'}
          </button>
        )}
      </div>

      {/* Score bar */}
      {live && (
        <div className="mx-3 mb-1.5 h-px rounded-full bg-white/5 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${live.score}%`, background: statusColor, opacity: 0.5 }} />
        </div>
      )}

      {/* Inline chips (always visible when manage mode + live data) */}
      {manage && live && live.chips.length > 0 && !renaming && (
        <div className="flex flex-wrap gap-1 px-3 pb-1.5">
          {live.chips.map(chip => (
            <span key={chip.label}
              className="inline-flex items-center gap-0.5 rounded px-1 py-0.5 font-mono text-[6.5px] border"
              style={{ color: chip.color, borderColor: `${chip.color}18`, background: `${chip.color}06` }}>
              <span className="text-white/25">{chip.label}</span>
              <span>{chip.value}</span>
            </span>
          ))}
          {live.issues.map((iss, i) => (
            <span key={i} className="inline-flex items-center gap-0.5 rounded px-1 py-0.5 font-mono text-[6.5px] border border-yellow-400/15 bg-yellow-400/5 text-yellow-400/60">
              <AlertTriangle size={6} />{iss}
            </span>
          ))}
        </div>
      )}

      {/* Inline editor */}
      {expanded && (
        <div className="mx-3 mb-3 rounded-xl border p-3.5 space-y-3"
          style={{ borderColor: `${sec.accent}20`, background: `${sec.accent}04` }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg"
                style={{ background: `${sec.accent}18`, color: sec.accent }}>{sec.icon}</div>
              <span className="text-[12px] font-semibold text-white/85">{label}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {sec.relatedPanel && onGoPanel && (
                <button
                  className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/4 px-2 py-1 text-[9px] text-white/45 hover:border-white/20 hover:text-white/75 transition-all"
                  onClick={() => onGoPanel(sec.relatedPanel!)}>
                  <Pencil size={8} /> {sec.relatedLabel}
                </button>
              )}
            </div>
          </div>
          <sec.editor />
        </div>
      )}
    </div>
  )
}

// ─── Content Health Banner ─────────────────────────────────────────────────────

function fmt(iso: string | null) {
  if (!iso) return null
  try {
    const d = new Date(iso)
    const now = Date.now()
    const diff = now - d.getTime()
    if (diff < 60_000)  return 'hace un momento'
    if (diff < 3600_000) return `hace ${Math.round(diff / 60_000)} min`
    if (diff < 86400_000) return `hace ${Math.round(diff / 3600_000)} h`
    return `hace ${Math.round(diff / 86400_000)} d`
  } catch { return null }
}

function ContentHealthBanner({ data }: { data: LiveData }) {
  const [issuesOpen, setIssuesOpen] = useState(false)

  const scoreColor =
    data.score >= 80 ? '#34d399' :
    data.score >= 50 ? '#fbbf24' : '#f87171'

  const totalSecs = Object.keys(data.sections).length
  const okSecs    = Object.values(data.sections).filter(s => s.status === 'ok').length
  const warnSecs  = Object.values(data.sections).filter(s => s.status === 'warn').length

  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.015] overflow-hidden">
      {/* Top row: score + headline + metrics */}
      <div className="flex items-stretch gap-0 divide-x divide-white/6">
        {/* Score ring */}
        <div className="flex flex-col items-center justify-center gap-1.5 px-4 py-3 shrink-0">
          <div className="relative">
            <ScoreRing score={data.score} size={52} stroke={4} color={scoreColor} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[12px] font-bold tabular-nums" style={{ color: scoreColor }}>
                {data.score}
              </span>
            </div>
          </div>
          <span className="font-mono text-[7px] text-white/30 uppercase tracking-wider">Score</span>
        </div>

        {/* Status summary */}
        <div className="flex flex-col justify-center gap-1 px-3 py-2.5 flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {data.score >= 80
              ? <CheckCircle2 size={11} style={{ color: scoreColor }} />
              : data.score >= 50
              ? <AlertTriangle size={11} style={{ color: scoreColor }} />
              : <Circle size={11} className="text-red-400/60" />}
            <span className="text-[11px] font-medium text-white/70">
              {data.score >= 80 ? 'Contenido en buen estado' :
               data.score >= 50 ? 'Necesita atención' : 'Contenido incompleto'}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[8px] text-emerald-400/70">{okSecs} OK</span>
            {warnSecs > 0 && <span className="font-mono text-[8px] text-yellow-400/70">{warnSecs} warn</span>}
            {data.issues.length > 0 && <span className="font-mono text-[8px] text-white/25">{data.issues.length} issues</span>}
            <span className="font-mono text-[8px] text-white/20">{okSecs}/{totalSecs} secciones</span>
          </div>
          {data.lastSaved && (
            <div className="flex items-center gap-1 mt-0.5">
              <Activity size={8} className="text-white/20" />
              <span className="font-mono text-[7px] text-white/20">Guardado {fmt(data.lastSaved)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-5 divide-x divide-white/6 border-t border-white/6">
        {data.metrics.map(m => (
          <div key={m.label} className="flex flex-col items-center gap-0.5 py-2">
            <span className="text-[15px] font-bold tabular-nums leading-none" style={{ color: m.accent }}>
              {m.value}
            </span>
            <span className="font-mono text-[7px] text-white/35">{m.label}</span>
            {m.sub && <span className="font-mono text-[6px] text-white/18">{m.sub}</span>}
          </div>
        ))}
      </div>

      {/* Issues accordion */}
      {data.issues.length > 0 && (
        <div className="border-t border-white/6">
          <button
            onClick={() => setIssuesOpen(v => !v)}
            className="flex w-full items-center gap-2 px-3 py-2 hover:bg-white/[0.02] transition-colors text-left">
            <AlertTriangle size={9} className="text-yellow-400/60 shrink-0" />
            <span className="flex-1 text-[9px] text-white/40">
              {data.issues.length} problema{data.issues.length > 1 ? 's' : ''} detectado{data.issues.length > 1 ? 's' : ''}
            </span>
            <ChevronDown size={9} className={cn('text-white/20 transition-transform shrink-0', issuesOpen && 'rotate-180')} />
          </button>
          {issuesOpen && (
            <div className="px-3 pb-2.5 space-y-1">
              {data.issues.map((iss, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[8px]">
                  <span className="rounded px-1 py-0.5 font-mono shrink-0 border"
                    style={iss.severity === 'warn'
                      ? { color: '#fbbf24', borderColor: '#fbbf2420', background: '#fbbf2408' }
                      : { color: '#ffffff30', borderColor: '#ffffff10', background: 'transparent' }}>
                    {iss.label}
                  </span>
                  <span className="text-white/45 pt-0.5">{iss.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main panel ────────────────────────────────────────────────────────────────

type TabId = 'sections' | 'effects' | 'preview'

export default function ContentPanel() {
  const { state, dispatch } = useAdmin()
  const [tab,       setTab]       = useState<TabId>('sections')
  const [manage,    setManage]    = useState(false)
  const [expandedId, setExpanded] = useState<string | null>(null)
  const [showPreview, setPreview] = useState(false)
  const [homeCollapsed,   setHomeCollapsed]   = useState(false)
  const [domainCollapsed, setDomainCollapsed] = useState(false)

  const liveData = useMemo(() => computeLiveData(state), [state])

  const go = (panel: AdminPanel) => dispatch({ type: 'SET_PANEL', payload: panel })

  // ── Section override helpers ──────────────────────────────────────────────────
  const overrides = state.studioConfig.contentSectionOverrides ?? []
  const getOv = (id: string) => overrides.find(o => o.id === id)

  const setSection = (id: string, data: Partial<{ enabled: boolean; order: number; customLabel: string; customDesc: string }>) =>
    dispatch({ type: 'SET_CONTENT_SECTION', payload: { id, data } })

  const reorderSection = (sections: SectionDef[], id: string, dir: 'up' | 'down') => {
    const sorted = [...sections]
      .map((s, i) => ({ id: s.id, order: getOv(s.id)?.order ?? i * 10 }))
      .sort((a, b) => a.order - b.order)
    const idx  = sorted.findIndex(s => s.id === id)
    const swap = dir === 'up' ? idx - 1 : idx + 1
    if (swap < 0 || swap >= sorted.length) return
    dispatch({ type: 'SET_CONTENT_SECTION', payload: { id, data: { order: sorted[swap].order } } })
    dispatch({ type: 'SET_CONTENT_SECTION', payload: { id: sorted[swap].id, data: { order: sorted[idx].order } } })
  }

  const sectionEnabled = (id: string, live?: SectionLiveData) => {
    const ov = getOv(id)
    if (ov?.enabled !== undefined) return ov.enabled
    if (live?.blockId !== undefined) return live.isEnabled ?? true
    return true
  }

  const buildSections = (base: SectionDef[]) =>
    [...base]
      .map((s, i) => ({
        ...s,
        customLabel:     getOv(s.id)?.customLabel,
        customDesc:      getOv(s.id)?.customDesc,
        effectiveEnabled: sectionEnabled(s.id, liveData.sections[s.id]),
        _order:          getOv(s.id)?.order ?? i * 10,
      }))
      .sort((a, b) => a._order - b._order)

  // Toggle: if section has a blockId use block dispatch, else use contentSectionOverride
  const toggleSection = (id: string, live?: SectionLiveData) => {
    if (live?.blockId) {
      dispatch({ type: 'UPDATE_BLOCK', payload: { id: live.blockId, data: { enabled: !live.isEnabled } } })
    } else {
      setSection(id, { enabled: !sectionEnabled(id, live) })
    }
  }

  const patchFx = (key: FxKey, data: Partial<FxObj>) => {
    const cur = state.visualEffects[key] as FxObj
    dispatch({ type: 'UPDATE_VISUAL_EFFECTS', payload: { [key]: { ...cur, ...data } } })
  }

  const sortedHome   = buildSections(HOME_SECTIONS)
  const sortedDomain = buildSections(DOMAIN_PAGES)
  const hasCustoms   = overrides.length > 0

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-400/70">Site Builder</p>
            <span className="flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-1.5 py-0.5">
              <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[7px] text-emerald-400/70 uppercase">LIVE</span>
            </span>
          </div>
          <h2 className="text-xl font-semibold text-white">Site Content</h2>
          <p className="text-[11px] text-white/35 mt-0.5">
            {HOME_SECTIONS.length} secciones portada · {DOMAIN_PAGES.length} páginas · score {liveData.score}/100
          </p>
        </div>
        <a href="/en" target="_blank" rel="noopener noreferrer"
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/4 px-3 py-1.5 text-[10px] text-white/50 hover:border-white/20 hover:text-white/80 transition-all">
          <Globe size={10} /> Ver sitio
        </a>
      </div>

      {/* Quick nav */}
      <div className="flex flex-wrap gap-1.5">
        {QUICK_NAV.map(n => (
          <button key={n.panel} onClick={() => go(n.panel)}
            className="rounded-lg border border-white/10 bg-white/3 px-2.5 py-1 text-[10px] text-white/50 hover:border-white/20 hover:bg-white/6 hover:text-white/80 transition-all">
            {n.label}
          </button>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-0.5 rounded-xl border border-white/10 bg-white/3 p-1">
        {([
          { id: 'sections', label: 'Secciones', icon: <LayoutGrid size={12} /> },
          { id: 'effects',  label: 'Efectos',   icon: <Sparkles size={12} />   },
          { id: 'preview',  label: 'Preview',   icon: <Eye size={12} />        },
        ] as { id: TabId; label: string; icon: React.ReactNode }[]).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn('flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-medium transition-all',
              tab === t.id ? 'bg-white/10 text-white/90' : 'text-white/40 hover:text-white/70')}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: SECCIONES ──────────────────────────────────────────────── */}
      {tab === 'sections' && (
        <div className="space-y-4">
          {/* Live Health Banner */}
          <ContentHealthBanner data={liveData} />

          {/* View mode toggle + reset */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 rounded-lg border border-white/10 bg-white/3 p-0.5">
              <button onClick={() => setManage(false)}
                className={cn('flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] transition-all',
                  !manage ? 'bg-white/10 text-white/85' : 'text-white/35 hover:text-white/60')}>
                <LayoutGrid size={11} /> Vista
              </button>
              <button onClick={() => setManage(true)}
                className={cn('flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] transition-all',
                  manage ? 'bg-white/10 text-white/85' : 'text-white/35 hover:text-white/60')}>
                <List size={11} /> Gestionar
              </button>
            </div>
            {hasCustoms && (
              <button onClick={() => dispatch({ type: 'RESET_CONTENT_SECTIONS' })}
                className="text-[9px] text-white/25 hover:text-white/55 transition-colors">
                Restaurar orden y nombres
              </button>
            )}
          </div>

          {/* ── HOMEPAGE SECTIONS ── */}
          <div className="rounded-xl border border-white/8 overflow-hidden">
            <button onClick={() => setHomeCollapsed(v => !v)}
              className="flex w-full items-center gap-2 px-3 py-2 hover:bg-white/[0.02] transition-colors">
              <ChevronDown size={11} className={cn('text-white/30 transition-transform shrink-0', homeCollapsed && '-rotate-90')} />
              <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40 flex-1 text-left">
                Página principal&nbsp;/en/
              </span>
              <span className="font-mono text-[8px] text-white/20">{sortedHome.length} secciones</span>
              <a href="/en" target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                className="flex items-center gap-1 text-[9px] text-white/25 hover:text-white/60 transition-colors ml-1">
                <ExternalLink size={9} />
              </a>
            </button>

            {!homeCollapsed && (manage ? (
              /* Manage list */
              <div className="border-t border-white/6 divide-y divide-white/5">
                {sortedHome.map((s, i) => (
                  <SectionManagerRow key={s.id}
                    sec={s} live={liveData.sections[s.id]}
                    isFirst={i === 0} isLast={i === sortedHome.length - 1}
                    expanded={expandedId === s.id} manage={true}
                    onExpand={() => setExpanded(expandedId === s.id ? null : s.id)}
                    onReorder={dir => reorderSection(HOME_SECTIONS, s.id, dir)}
                    onToggle={() => toggleSection(s.id, liveData.sections[s.id])}
                    onRename={(label, desc) => setSection(s.id, { customLabel: label, customDesc: desc })}
                    onGoPanel={go}
                  />
                ))}
              </div>
            ) : (
              /* Grid view */
              <div className="border-t border-white/6 p-2.5 space-y-2">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {sortedHome.map(s => {
                    const ld = liveData.sections[s.id]
                    return (
                      <SectionCard key={s.id}
                        sec={{ ...s, label: s.customLabel || s.label, desc: s.customDesc || s.desc }}
                        active={expandedId === s.id}
                        onClick={() => setExpanded(expandedId === s.id ? null : s.id)}
                        live={ld}
                        onToggleBlock={() => toggleSection(s.id, ld)} />
                    )
                  })}
                </div>
                {/* Inline editor for selected section */}
                {expandedId && (() => {
                  const sel = sortedHome.find(s => s.id === expandedId)
                  if (!sel) return null
                  const ld = liveData.sections[sel.id]
                  return (
                    <div className="rounded-xl border p-4 space-y-3"
                      style={{ borderColor: `${sel.accent}25`, background: `${sel.accent}04` }}>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg"
                            style={{ background: `${sel.accent}20`, color: sel.accent }}>{sel.icon}</div>
                          <div>
                            <div className="text-[13px] font-semibold text-white/90">{sel.customLabel || sel.label}</div>
                            <div className="text-[10px] text-white/35">{sel.customDesc || sel.desc}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {ld?.blockId && (
                            <button onClick={() => toggleSection(sel.id, ld)}
                              className={cn('flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[10px] transition-all',
                                ld.isEnabled
                                  ? 'border-emerald-400/25 bg-emerald-400/8 text-emerald-400'
                                  : 'border-white/10 bg-white/4 text-white/40')}>
                              {ld.isEnabled ? <ToggleRight size={11} /> : <ToggleLeft size={11} />}
                              {ld.isEnabled ? 'ON' : 'OFF'}
                            </button>
                          )}
                          {sel.path && (
                            <a href={sel.path} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/4 px-2.5 py-1.5 text-[10px] text-white/50 hover:border-white/20 hover:text-white/80 transition-all">
                              <ExternalLink size={10} /> Ver
                            </a>
                          )}
                          {sel.relatedPanel && (
                            <button onClick={() => go(sel.relatedPanel!)}
                              className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/4 px-2.5 py-1.5 text-[10px] text-white/50 hover:border-white/20 hover:text-white/80 transition-all">
                              <Pencil size={10} />{sel.relatedLabel}
                            </button>
                          )}
                          <button onClick={() => setPreview(v => !v)}
                            className={cn('flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[10px] transition-all',
                              showPreview
                                ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-400'
                                : 'border-white/10 bg-white/4 text-white/50 hover:border-white/20 hover:text-white/80')}>
                            {showPreview ? <EyeOff size={10} /> : <Eye size={10} />}
                            {showPreview ? 'Cerrar' : 'Preview'}
                          </button>
                        </div>
                      </div>
                      <sel.editor />
                      {showPreview && <LivePreview path={sel.path} />}
                    </div>
                  )
                })()}
              </div>
            ))}
          </div>

          {/* ── DOMAIN PAGES ── */}
          <div className="rounded-xl border border-white/8 overflow-hidden">
            <button onClick={() => setDomainCollapsed(v => !v)}
              className="flex w-full items-center gap-2 px-3 py-2 hover:bg-white/[0.02] transition-colors">
              <ChevronDown size={11} className={cn('text-white/30 transition-transform shrink-0', domainCollapsed && '-rotate-90')} />
              <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40 flex-1 text-left">
                Páginas de dominio
              </span>
              <span className="font-mono text-[8px] text-white/20">{sortedDomain.length} páginas</span>
            </button>

            {!domainCollapsed && (manage ? (
              <div className="border-t border-white/6 divide-y divide-white/5">
                {sortedDomain.map((s, i) => (
                  <SectionManagerRow key={s.id}
                    sec={s} live={liveData.sections[s.id]}
                    isFirst={i === 0} isLast={i === sortedDomain.length - 1}
                    expanded={expandedId === s.id} manage={true}
                    onExpand={() => setExpanded(expandedId === s.id ? null : s.id)}
                    onReorder={dir => reorderSection(DOMAIN_PAGES, s.id, dir)}
                    onToggle={() => toggleSection(s.id, liveData.sections[s.id])}
                    onRename={(label, desc) => setSection(s.id, { customLabel: label, customDesc: desc })}
                    onGoPanel={go}
                  />
                ))}
              </div>
            ) : (
              <div className="border-t border-white/6 p-2.5 space-y-2">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                  {sortedDomain.map(s => (
                    <SectionCard key={s.id}
                      sec={{ ...s, label: s.customLabel || s.label, desc: s.customDesc || s.desc }}
                      active={expandedId === s.id}
                      onClick={() => setExpanded(expandedId === s.id ? null : s.id)}
                      live={liveData.sections[s.id]} />
                  ))}
                </div>
                {expandedId && (() => {
                  const sel = sortedDomain.find(s => s.id === expandedId)
                  if (!sel) return null
                  return (
                    <div className="rounded-xl border p-4 space-y-3"
                      style={{ borderColor: `${sel.accent}25`, background: `${sel.accent}04` }}>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg"
                            style={{ background: `${sel.accent}20`, color: sel.accent }}>{sel.icon}</div>
                          <div>
                            <div className="text-[13px] font-semibold text-white/90">{sel.customLabel || sel.label}</div>
                            <div className="text-[10px] text-white/35">{sel.customDesc || sel.desc}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {sel.path && (
                            <a href={sel.path} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/4 px-2.5 py-1.5 text-[10px] text-white/50 hover:border-white/20 hover:text-white/80 transition-all">
                              <ExternalLink size={10} /> Ver
                            </a>
                          )}
                          {sel.relatedPanel && (
                            <button onClick={() => go(sel.relatedPanel!)}
                              className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/4 px-2.5 py-1.5 text-[10px] text-white/50 hover:border-white/20 hover:text-white/80 transition-all">
                              <Pencil size={10} />{sel.relatedLabel}
                            </button>
                          )}
                        </div>
                      </div>
                      <sel.editor />
                    </div>
                  )
                })()}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB: EFECTOS ──────────────────────────────────────────────── */}
      {tab === 'effects' && (
        <div className="space-y-3">
          <p className="text-[11px] text-white/35 leading-relaxed">
            Controla los efectos visuales del sitio. Para shaders avanzados usa{' '}
            <button className="text-violet-400 hover:underline" onClick={() => go('design-lab')}>Design Lab</button>.
          </p>
          {EFFECTS.map(fx => {
            const cfg = state.visualEffects[fx.key] as FxObj | undefined
            if (!cfg) return null
            return (
              <div key={fx.key}
                className={cn('rounded-xl border p-3.5 space-y-3 transition-all',
                  cfg.enabled ? 'border-white/12 bg-white/[0.025]' : 'border-white/6 bg-white/[0.01] opacity-70')}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-2 w-2 rounded-full shrink-0"
                      style={{ background: cfg.enabled ? fx.accent : '#ffffff20' }} />
                    <div>
                      <div className="text-[12px] font-medium text-white/80">{fx.label}</div>
                      <div className="text-[10px] text-white/35">{fx.desc}</div>
                    </div>
                  </div>
                  <button onClick={() => patchFx(fx.key, { enabled: !cfg.enabled })}
                    className={cn('relative h-5 w-9 shrink-0 rounded-full border transition-all',
                      cfg.enabled ? 'border-cyan-400/40 bg-cyan-400/20' : 'border-white/15 bg-white/5')}>
                    <span className={cn('absolute top-0.5 h-4 w-4 rounded-full transition-all duration-200',
                      cfg.enabled ? 'left-[18px] bg-cyan-400' : 'left-0.5 bg-white/30')} />
                  </button>
                </div>
                {cfg.enabled && (cfg.intensity !== undefined || cfg.count !== undefined || cfg.duration !== undefined) && (
                  <div className="space-y-2 border-t border-white/6 pt-2">
                    {cfg.intensity !== undefined && <Slider label="Intensidad"    value={cfg.intensity} min={0}   max={1}  onChange={v => patchFx(fx.key, { intensity: v })} />}
                    {cfg.count     !== undefined && <Slider label="Cantidad"      value={cfg.count}     min={1}   max={40} step={1} onChange={v => patchFx(fx.key, { count: Math.round(v) })} />}
                    {cfg.duration  !== undefined && <Slider label="Duración (s)"  value={cfg.duration}  min={0.5} max={3}  step={0.1} onChange={v => patchFx(fx.key, { duration: Math.round(v * 10) / 10 })} />}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── TAB: PREVIEW ──────────────────────────────────────────────── */}
      {tab === 'preview' && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            <p className="w-full font-mono text-[9px] uppercase tracking-[0.1em] text-white/30 mb-1">Portada</p>
            {HOME_SECTIONS.map(s => (
              <button key={s.id} onClick={() => setExpanded(s.id)}
                className={cn('flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] transition-all',
                  expandedId === s.id ? 'border-white/20 bg-white/8' : 'border-white/8 text-white/40 hover:border-white/15 hover:text-white/70')}
                style={expandedId === s.id ? { borderColor: `${s.accent}35`, color: s.accent, background: `${s.accent}10` } : {}}>
                <span style={{ color: s.accent }}>{s.icon}</span>{s.label}
              </button>
            ))}
            <p className="w-full font-mono text-[9px] uppercase tracking-[0.1em] text-white/30 mt-2 mb-1">Páginas</p>
            {DOMAIN_PAGES.map(s => (
              <button key={s.id} onClick={() => setExpanded(s.id)}
                className={cn('flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] transition-all',
                  expandedId === s.id ? 'border-white/20 bg-white/8' : 'border-white/8 text-white/40 hover:border-white/15 hover:text-white/70')}
                style={expandedId === s.id ? { borderColor: `${s.accent}35`, color: s.accent, background: `${s.accent}10` } : {}}>
                <span style={{ color: s.accent }}>{s.icon}</span>{s.label}
              </button>
            ))}
          </div>
          <LivePreview path={[...HOME_SECTIONS, ...DOMAIN_PAGES].find(s => s.id === expandedId)?.path ?? '/en/'} />
        </div>
      )}
    </div>
  )
}
