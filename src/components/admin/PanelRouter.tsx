'use client'

import { lazy, Suspense, useState, useEffect } from 'react'
import { useAdmin } from '@/lib/admin/store'

// ─── Lazy-loaded panels ───────────────────────────────────────────────────────
// Each panel is only fetched when first activated — keeps initial admin bundle small.

const CommandPanel        = lazy(() => import('./panels/CommandPanel'))
const ProjectsPanel       = lazy(() => import('./panels/ProjectsPanel'))
const SiteCorePanel       = lazy(() => import('./panels/SiteCorePanel'))
const SystemsManagerPanel = lazy(() => import('./panels/SystemsManagerPanel'))
const LabsManagerPanel    = lazy(() => import('./panels/LabsManagerPanel'))
const ResearchManagerPanel= lazy(() => import('./panels/ResearchManagerPanel'))
const InfraManagerPanel   = lazy(() => import('./panels/InfraManagerPanel'))
const GitHubLayerPanel    = lazy(() => import('./panels/GitHubLayerPanel'))
const AIAssistantPanel    = lazy(() => import('./panels/AIAssistantPanel'))
const IntegrationsPanel   = lazy(() => import('./panels/IntegrationsPanel'))
const ShowcasePanel       = lazy(() => import('./panels/ShowcasePanel'))
const SEOPanel            = lazy(() => import('./panels/SEOPanel'))
const DesignPanel         = lazy(() => import('./panels/DesignPanel'))
const PersonalityPanel    = lazy(() => import('./panels/PersonalityPanel'))
const AnalyticsPanel      = lazy(() => import('./panels/AnalyticsPanel'))
const BlocksPanel         = lazy(() => import('./panels/BlocksPanel'))
const ContentPanel        = lazy(() => import('./panels/ContentPanel'))
const NavbarConfigPanel   = lazy(() => import('./panels/NavbarConfigPanel'))
const FooterConfigPanel   = lazy(() => import('./panels/FooterConfigPanel'))
const DesignLabPanel      = lazy(() => import('./panels/DesignLabPanel'))
const IntelligenceFeedsPanel = lazy(() => import('./panels/IntelligenceFeedsPanel'))
const IntakePanel         = lazy(() => import('./panels/IntakePanel'))
const AboutPanel          = lazy(() => import('./panels/AboutPanel'))
const PostsManagerPanel   = lazy(() => import('./panels/PostsManagerPanel'))
const ContentEditorPanel  = lazy(() => import('./panels/ContentEditorPanel'))
const MediaLibraryPanel   = lazy(() => import('./panels/MediaLibraryPanel'))
const PagesPanel          = lazy(() => import('./panels/PagesPanel'))
const DesignStudioPanel   = lazy(() => import('./panels/DesignStudioPanel'))
const SearchPanel         = lazy(() => import('./panels/SearchPanel'))
const StudioPanel         = lazy(() => import('./panels/StudioPanel'))
const TaxonomyPanel       = lazy(() => import('./panels/cms/TaxonomyPanel').then(m => ({ default: m.TaxonomyPanel })))
const CmsRelationsPanel   = lazy(() => import('./panels/CmsRelationsPanel').then(m => ({ default: m.CmsRelationsPanel })))
const VPSPanel            = lazy(() => import('./panels/VPSPanel'))
const CmsWorkflowPanel    = lazy(() => import('./panels/CmsWorkflowPanel'))

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function PanelSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-1">
      <div className="h-7 w-52 rounded-lg bg-white/[0.04]" />
      <div className="h-px bg-white/5" />
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-white/[0.025]" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-white/[0.025]" />
        ))}
      </div>
    </div>
  )
}

// ─── Router ───────────────────────────────────────────────────────────────────

export default function PanelRouter() {
  const { state } = useAdmin()
  // Defer rendering until after client hydration.
  // Server renders createInitialState() → panel='command'.
  // Client may load a different panel from localStorage.
  // Rendering a skeleton on first pass avoids the tree mismatch.
  const [mounted, setMounted] = useState(false)
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return <PanelSkeleton />

  const panel = (() => {
    switch (state.panel) {
      case 'command':        return <CommandPanel />
      case 'projects':       return <ProjectsPanel />
      case 'site-core':      return <SiteCorePanel />
      case 'systems':        return <SystemsManagerPanel />
      case 'labs':           return <LabsManagerPanel />
      case 'research':       return <ResearchManagerPanel />
      case 'infrastructure': return <InfraManagerPanel />
      case 'github':         return <GitHubLayerPanel />
      case 'ai':             return <AIAssistantPanel />
      case 'integrations':   return <IntegrationsPanel />
      case 'showcase':       return <ShowcasePanel />
      case 'seo':            return <SEOPanel />
      case 'design':         return <DesignPanel />
      case 'personality':    return <PersonalityPanel />
      case 'analytics':      return <AnalyticsPanel />
      case 'blocks':         return <BlocksPanel />
      case 'content':        return <ContentPanel />
      case 'navbar-config':  return <NavbarConfigPanel />
      case 'footer-config':  return <FooterConfigPanel />
      case 'design-lab':     return <DesignLabPanel />
      case 'intelligence':   return <IntelligenceFeedsPanel />
      case 'intake':         return <IntakePanel />
      case 'about':          return <AboutPanel />
      case 'posts':          return <PostsManagerPanel />
      case 'content-editor': return <ContentEditorPanel />
      case 'media':          return <MediaLibraryPanel />
      case 'pages':          return <PagesPanel />
      case 'design-studio':  return <DesignStudioPanel />
      case 'capabilities':   return <IntegrationsPanel initialTab="agentes" />
      case 'search':         return <SearchPanel />
      case 'studio':         return <StudioPanel />
      case 'taxonomy':       return <TaxonomyPanel />
      case 'cms-relations':  return <CmsRelationsPanel />
      case 'vps':            return <VPSPanel />
      case 'cms-workflow':   return <CmsWorkflowPanel />
      default:               return <CommandPanel />
    }
  })()

  return (
    <Suspense fallback={<PanelSkeleton />}>
      {panel}
    </Suspense>
  )
}
