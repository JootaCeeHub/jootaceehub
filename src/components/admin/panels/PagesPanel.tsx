'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from 'react'
import { PlusCircle, PanelBottom, Image, Rocket, BookOpen, GitBranch, FileText, Navigation2, LayoutGrid, FlaskConical } from 'lucide-react'
import { useAdmin } from '@/lib/admin/store'
import { cn } from '@/lib/utils'
import IntakePanel from './IntakePanel'
import PostsManagerPanel from './PostsManagerPanel'
import MediaLibraryPanel from './MediaLibraryPanel'
import ProjectsPanel from './ProjectsPanel'
import ResearchManagerPanel from './ResearchManagerPanel'
import GitHubLayerPanel from './GitHubLayerPanel'
import ContentPanel from './ContentPanel'
import NavbarConfigPanel from './NavbarConfigPanel'
import BlocksPanel from './BlocksPanel'
import LabsManagerPanel from './LabsManagerPanel'

type PagesTab = 'intake' | 'posts' | 'media' | 'projects' | 'research' | 'github' | 'content' | 'navigation' | 'blocks' | 'labs-legacy'

const TABS: { id: PagesTab; label: string; icon: React.ComponentType<{ className?: string }>; accent: string }[] = [
  { id: 'intake',      label: 'New Entry',   icon: PlusCircle,      accent: '#f472b6' },
  { id: 'posts',       label: 'Posts',       icon: PanelBottom,     accent: '#34d399' },
  { id: 'media',       label: 'Media',       icon: Image,           accent: '#60a5fa' },
  { id: 'projects',    label: 'Projects',    icon: Rocket,          accent: '#a78bfa' },
  { id: 'research',    label: 'Research',    icon: BookOpen,        accent: '#34d399' },
  { id: 'github',      label: 'GitHub',      icon: GitBranch,       accent: '#e2e8f0' },
  { id: 'content',     label: 'Content',     icon: FileText,        accent: '#34d399' },
  { id: 'blocks',      label: 'Blocks',      icon: LayoutGrid,      accent: '#a78bfa' },
  { id: 'navigation',  label: 'Navigation',  icon: Navigation2,     accent: '#38bdf8' },
  { id: 'labs-legacy', label: 'Labs Legacy', icon: FlaskConical,    accent: '#fb923c' },
]

export default function PagesPanel() {
  const { state } = useAdmin()
  const [activeTab, setActiveTab] = useState<PagesTab>('projects')

  useEffect(() => {
    if (state.intakeType) setActiveTab('intake')
  }, [state.intakeType])

  useEffect(() => {
    if (state.pagesActiveTab) setActiveTab(state.pagesActiveTab as PagesTab)
  }, [state.pagesActiveTab])

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center gap-1 px-4 pt-4 pb-0 border-b border-white/5 overflow-x-auto shrink-0">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-t text-xs font-medium whitespace-nowrap transition-all duration-150 cursor-pointer border-b-2 -mb-px',
                active
                  ? 'text-white border-current'
                  : 'text-white/35 border-transparent hover:text-white/60 hover:bg-white/4'
              )}
              style={active ? { color: tab.accent, borderColor: tab.accent } : undefined}
            >
              <Icon className="h-3 w-3" />
              <span className="">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Active panel */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'intake'      && <IntakePanel />}
        {activeTab === 'posts'       && <PostsManagerPanel />}
        {activeTab === 'media'       && <MediaLibraryPanel />}
        {activeTab === 'projects'    && <ProjectsPanel />}
        {activeTab === 'research'    && <ResearchManagerPanel />}
        {activeTab === 'github'      && <GitHubLayerPanel />}
        {activeTab === 'content'     && <ContentPanel />}
        {activeTab === 'blocks'      && <BlocksPanel />}
        {activeTab === 'navigation'  && <NavbarConfigPanel />}
        {activeTab === 'labs-legacy' && <LabsManagerPanel />}
      </div>
    </div>
  )
}
