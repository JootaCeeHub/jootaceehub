'use client'

import { useState, useRef, useCallback } from 'react'
import {
  Eye, EyeOff, RefreshCw, ExternalLink, Maximize2, Pencil,
  ChevronRight, ChevronDown, Sparkles, LayoutGrid, Monitor, Tablet, Smartphone,
  Layers, Cpu, FlaskConical, Server, BookOpen, MessageSquare,
  User, GitBranch, FolderKanban, Microscope, Library, Gamepad2, Globe,
  Plus, Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdmin } from '@/lib/admin/store'
import type { StatItem, ServiceItem, LogoItem, AdminPanel, BlockSection } from '@/lib/admin/types'

// Sub-file imports
import { Slider } from './content/primitives'
import { inp, area, F } from './content/primitives'
import {
  HeroEditor, SystemsEditor, LabsEditor, InfraEditor, JournalSummary, CollabEditor,
} from './content/HomeSectionsEditors'
import {
  ProjectsEditor, ResearchEditor, JournalPageEditor,
} from './content/RegistryEditors'
import { ResourcesEditor } from './content/ResourcesHubEditor'
import { AboutEditor, ContactEditor } from './content/ProfileEditors'
import { GitHubEditor, PlaygroundEditor, IntelligenceEditor } from './content/DomainEditors'

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

function SectionCard({ sec, active, onClick }: { sec: SectionDef; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={cn('flex flex-col gap-1.5 rounded-xl border p-3 text-left transition-all',
        active ? 'border-white/25 shadow-sm' : 'border-white/8 hover:border-white/15')}
      style={active ? { borderColor: `${sec.accent}40`, background: `${sec.accent}08` } : {}}>
      <div className="flex items-start justify-between">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg"
          style={{ background: `${sec.accent}18`, color: sec.accent }}>{sec.icon}</div>
        {sec.badge && (
          <span className="font-mono text-[7px] rounded px-1.5 py-0.5 border"
            style={sec.badge === 'LIVE'
              ? { color: '#34d399', borderColor: '#34d39930', background: '#34d39910' }
              : { color: '#fbbf24', borderColor: '#fbbf2430', background: '#fbbf2410' }}>
            {sec.badge}
          </span>
        )}
      </div>
      <div>
        <div className="text-[11px] font-medium text-white/80">{sec.label}</div>
        <div className="text-[9px] leading-relaxed text-white/30 line-clamp-2">{sec.desc}</div>
      </div>
    </button>
  )
}

// ─── CMS block editors (legacy — used by BlockRow) ────────────────────────────

function LogosEditor() {
  const { state, dispatch } = useAdmin()
  const logos = state.content.logos ?? []
  const set = (p: LogoItem[]) => dispatch({ type: 'SET_LOGOS', payload: p })
  return (
    <div className="space-y-2">
      {logos.map((l, i) => (
        <div key={l.id} className="rounded-lg border border-white/8 bg-white/2 p-2.5 space-y-1.5">
          <div className="flex justify-between">
            <span className="font-mono text-[9px] text-white/25">#{i + 1}</span>
            <button className="text-[9px] text-red-400/40 hover:text-red-400" onClick={() => set(logos.filter(x => x.id !== l.id))}>✕</button>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <F l="Nombre"><input className={inp} value={l.name} onChange={e => set(logos.map(x => x.id === l.id ? { ...x, name: e.target.value } : x))} /></F>
            <F l="URL"><input className={inp} value={l.url} onChange={e => set(logos.map(x => x.id === l.id ? { ...x, url: e.target.value } : x))} /></F>
          </div>
        </div>
      ))}
      <button className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-cyan-400/15 py-1.5 text-[9px] text-cyan-400/40 hover:text-cyan-400/70 hover:border-cyan-400/30 transition-all"
        onClick={() => set([...logos, { id: crypto.randomUUID(), name: 'Empresa', imageUrl: '', url: 'https://' }])}>
        + Añadir logo
      </button>
    </div>
  )
}

function StatsEditor() {
  const { state, dispatch } = useAdmin()
  const stats = state.content.stats
  const set = (p: StatItem[]) => dispatch({ type: 'SET_STATS', payload: p })
  return (
    <div className="space-y-2">
      {stats.map((s, i) => (
        <div key={i} className="rounded-lg border border-white/8 bg-white/2 p-2.5 space-y-1.5">
          <div className="flex justify-between">
            <span className="font-mono text-[9px] text-white/25">#{i + 1}</span>
            <button className="text-[9px] text-red-400/40 hover:text-red-400" onClick={() => set(stats.filter((_, j) => j !== i))}>✕</button>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <F l="Valor"><input className={inp} value={s.value} onChange={e => set(stats.map((x, j) => j === i ? { ...x, value: e.target.value } : x))} /></F>
            <F l="Icono"><input className={inp} value={s.icon} onChange={e => set(stats.map((x, j) => j === i ? { ...x, icon: e.target.value } : x))} /></F>
            <F l="Etiqueta"><input className={inp} value={s.label} onChange={e => set(stats.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} /></F>
          </div>
        </div>
      ))}
      <button className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-cyan-400/15 py-1.5 text-[9px] text-cyan-400/40 hover:text-cyan-400/70 hover:border-cyan-400/30 transition-all"
        onClick={() => set([...stats, { value: '0', label: 'Métrica', icon: '📌' }])}>
        + Añadir estadística
      </button>
    </div>
  )
}

function ServicesEditor() {
  const { state, dispatch } = useAdmin()
  const sv = state.content.services
  const set = (p: ServiceItem[]) => dispatch({ type: 'SET_SERVICES', payload: p })
  return (
    <div className="space-y-2">
      {sv.map((s, i) => (
        <div key={i} className="rounded-lg border border-white/8 bg-white/2 p-2.5 space-y-1.5">
          <div className="flex justify-between">
            <span className="font-mono text-[9px] text-white/25">#{i + 1}</span>
            <button className="text-[9px] text-red-400/40 hover:text-red-400" onClick={() => set(sv.filter((_, j) => j !== i))}>✕</button>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <F l="Icono"><input className={inp} value={s.icon} onChange={e => set(sv.map((x, j) => j === i ? { ...x, icon: e.target.value } : x))} /></F>
            <F l="Título"><input className={inp} value={s.title} onChange={e => set(sv.map((x, j) => j === i ? { ...x, title: e.target.value } : x))} /></F>
          </div>
          <F l="Descripción"><textarea rows={2} className={area} value={s.description} onChange={e => set(sv.map((x, j) => j === i ? { ...x, description: e.target.value } : x))} /></F>
        </div>
      ))}
      <button className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-cyan-400/15 py-1.5 text-[9px] text-cyan-400/40 hover:text-cyan-400/70 hover:border-cyan-400/30 transition-all"
        onClick={() => set([...sv, { icon: '🔧', title: 'Servicio', description: '' }])}>
        + Añadir servicio
      </button>
    </div>
  )
}

const CMS_EDITORS: Record<string, React.ComponentType> = {
  logos: LogosEditor, stats: StatsEditor, services: ServicesEditor,
}

// ─── Block row ─────────────────────────────────────────────────────────────────

function BlockRow({ block, expanded, onToggle, onToggleEnabled }: {
  block: BlockSection; expanded: boolean; onToggle: () => void; onToggleEnabled: () => void
}) {
  const Editor = CMS_EDITORS[block.type ?? block.id]
  return (
    <div className={cn('rounded-xl border overflow-hidden transition-all',
      expanded ? 'border-white/15 bg-white/[0.03]' : 'border-white/8 bg-white/[0.015]')}>
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <span className="text-base shrink-0">{block.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-white/75">{block.label}</span>
            {!block.enabled && <span className="font-mono text-[7px] text-white/20 border border-white/8 rounded px-1">off</span>}
            {block.effects3D && <span className="font-mono text-[7px] text-violet-400/50 border border-violet-400/10 rounded px-1">3D</span>}
          </div>
          <div className="text-[9px] text-white/30 truncate">{block.description}</div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={onToggleEnabled}
            className={cn('rounded-lg border px-1.5 py-0.5 font-mono text-[8px] transition-all',
              block.enabled
                ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-400/70 hover:border-emerald-400/40'
                : 'border-white/10 bg-white/4 text-white/30 hover:border-white/20')}>
            {block.enabled ? 'ON' : 'OFF'}
          </button>
          {Editor && (
            <button onClick={onToggle}
              className={cn('rounded p-1 transition-colors', expanded ? 'text-cyan-400/70' : 'text-white/30 hover:text-white/60')}>
              <ChevronDown size={11} className={cn('transition-transform', expanded && 'rotate-180')} />
            </button>
          )}
        </div>
      </div>
      {expanded && Editor && <div className="border-t border-white/6 px-3 py-3"><Editor /></div>}
    </div>
  )
}

// ─── Main panel ────────────────────────────────────────────────────────────────

type TabId = 'sections' | 'effects' | 'preview'

export default function ContentPanel() {
  const { state, dispatch } = useAdmin()
  const [tab, setTab]             = useState<TabId>('sections')
  const [activeId, setActiveId]   = useState('hero')
  const [showPreview, setPreview] = useState(false)
  const [expandedBlock, setBlock] = useState<string | null>(null)
  const [homeCollapsed,  setHomeCollapsed]   = useState(false)
  const [domainCollapsed, setDomainCollapsed] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)

  const go = (panel: AdminPanel) => dispatch({ type: 'SET_PANEL', payload: panel })

  const allSections = [...HOME_SECTIONS, ...DOMAIN_PAGES]
  const current     = allSections.find(s => s.id === activeId) ?? HOME_SECTIONS[0]
  const Editor      = current.editor

  const selectSection = (id: string) => {
    setActiveId(id)
    // Scroll editor into view after React re-render
    setTimeout(() => {
      editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  const sortedBlocks = [...state.blocks].sort((a, b) => a.order - b.order)
  const toggleBlock  = (id: string) =>
    dispatch({ type: 'UPDATE_BLOCK', payload: { id, data: { enabled: !state.blocks.find(b => b.id === id)?.enabled } } })

  const patchFx = (key: FxKey, data: Partial<FxObj>) => {
    const cur = state.visualEffects[key] as FxObj
    dispatch({ type: 'UPDATE_VISUAL_EFFECTS', payload: { [key]: { ...cur, ...data } } })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-400/70">Site Builder</p>
          <h2 className="text-xl font-semibold text-white">Site Content</h2>
          <p className="text-[12px] text-white/40">
            Todo el contenido de tu web — {HOME_SECTIONS.length} secciones en portada · {DOMAIN_PAGES.length} páginas de dominio.
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
          {/* Homepage — collapsible */}
          <div className="rounded-xl border border-white/8 overflow-hidden">
            <button
              onClick={() => setHomeCollapsed(v => !v)}
              className="flex w-full items-center gap-2 px-3 py-2 hover:bg-white/[0.02] transition-colors"
            >
              <ChevronDown size={11} className={cn('text-white/30 transition-transform shrink-0', homeCollapsed && '-rotate-90')} />
              <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40 flex-1 text-left">
                Página principal&nbsp;&nbsp;/en/
              </span>
              <span className="font-mono text-[8px] text-white/20">{HOME_SECTIONS.length} secciones</span>
              <a href="/en" target="_blank" rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="flex items-center gap-1 text-[9px] text-white/25 hover:text-white/60 transition-colors ml-1">
                <ExternalLink size={9} />
              </a>
            </button>
            {!homeCollapsed && (
              <div className="border-t border-white/6 p-2.5">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {HOME_SECTIONS.map(s => (
                    <SectionCard key={s.id} sec={s} active={activeId === s.id} onClick={() => selectSection(s.id)} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Domain pages — collapsible */}
          <div className="rounded-xl border border-white/8 overflow-hidden">
            <button
              onClick={() => setDomainCollapsed(v => !v)}
              className="flex w-full items-center gap-2 px-3 py-2 hover:bg-white/[0.02] transition-colors"
            >
              <ChevronDown size={11} className={cn('text-white/30 transition-transform shrink-0', domainCollapsed && '-rotate-90')} />
              <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40 flex-1 text-left">
                Páginas de dominio
              </span>
              <span className="font-mono text-[8px] text-white/20">{DOMAIN_PAGES.length} páginas</span>
            </button>
            {!domainCollapsed && (
              <div className="border-t border-white/6 p-2.5">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                  {DOMAIN_PAGES.map(s => (
                    <SectionCard key={s.id} sec={s} active={activeId === s.id} onClick={() => selectSection(s.id)} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Active editor */}
          <div ref={editorRef} className="rounded-xl border p-4 space-y-4"
            style={{ borderColor: `${current.accent}25`, background: `${current.accent}04` }}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg"
                  style={{ background: `${current.accent}20`, color: current.accent }}>{current.icon}</div>
                <div>
                  <div className="text-[13px] font-semibold text-white/90">{current.label}</div>
                  <div className="text-[10px] text-white/35">{current.desc}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {current.path && (
                  <a href={current.path} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/4 px-2.5 py-1.5 text-[10px] text-white/50 hover:border-white/20 hover:text-white/80 transition-all">
                    <ExternalLink size={10} /> Ver página
                  </a>
                )}
                {current.relatedPanel && (
                  <button onClick={() => go(current.relatedPanel!)}
                    className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/4 px-2.5 py-1.5 text-[10px] text-white/50 hover:border-white/20 hover:text-white/80 transition-all">
                    <Pencil size={10} />{current.relatedLabel}
                  </button>
                )}
                <button onClick={() => setPreview(v => !v)}
                  className={cn('flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[10px] transition-all',
                    showPreview
                      ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-400'
                      : 'border-white/10 bg-white/4 text-white/50 hover:border-white/20 hover:text-white/80')}>
                  {showPreview ? <EyeOff size={10} /> : <Eye size={10} />}
                  {showPreview ? 'Ocultar' : 'Preview'}
                </button>
              </div>
            </div>
            <Editor />
            {showPreview && <LivePreview path={current.path} />}
          </div>

          {/* CMS blocks */}
          <div className="rounded-xl border border-white/8 overflow-hidden">
            <button
              onClick={() => setBlock(expandedBlock ? null : 'open')}
              className="flex w-full items-center gap-2 px-3 py-2 hover:bg-white/[0.02] transition-colors"
            >
              <ChevronDown size={11} className={cn('text-white/30 transition-transform shrink-0', !expandedBlock && '-rotate-90')} />
              <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/30 flex-1 text-left">
                Bloques CMS heredados
              </span>
              <button onClick={(e) => { e.stopPropagation(); go('blocks') }}
                className="flex items-center gap-1 text-[9px] text-white/25 hover:text-white/60 transition-colors">
                Gestor <ChevronRight size={10} />
              </button>
            </button>
            <div className="border-t border-white/6 divide-y divide-white/5">
              {sortedBlocks.map(block => (
                <BlockRow key={block.id} block={block} expanded={expandedBlock === block.id}
                  onToggle={() => setBlock(expandedBlock === block.id ? null : block.id)}
                  onToggleEnabled={() => toggleBlock(block.id)} />
              ))}
            </div>
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
              <button key={s.id} onClick={() => setActiveId(s.id)}
                className={cn('flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] transition-all',
                  activeId === s.id ? 'border-white/20 bg-white/8' : 'border-white/8 text-white/40 hover:border-white/15 hover:text-white/70')}
                style={activeId === s.id ? { borderColor: `${s.accent}35`, color: s.accent, background: `${s.accent}10` } : {}}>
                <span style={{ color: s.accent }}>{s.icon}</span>{s.label}
              </button>
            ))}
            <p className="w-full font-mono text-[9px] uppercase tracking-[0.1em] text-white/30 mt-2 mb-1">Páginas</p>
            {DOMAIN_PAGES.map(s => (
              <button key={s.id} onClick={() => setActiveId(s.id)}
                className={cn('flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] transition-all',
                  activeId === s.id ? 'border-white/20 bg-white/8' : 'border-white/8 text-white/40 hover:border-white/15 hover:text-white/70')}
                style={activeId === s.id ? { borderColor: `${s.accent}35`, color: s.accent, background: `${s.accent}10` } : {}}>
                <span style={{ color: s.accent }}>{s.icon}</span>{s.label}
              </button>
            ))}
          </div>
          <LivePreview path={allSections.find(s => s.id === activeId)?.path ?? '/en/'} />
        </div>
      )}
    </div>
  )
}
