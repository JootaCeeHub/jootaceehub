'use client'

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef, useMemo } from 'react'
import type { AdminState, AdminAction } from './types'
import { createInitialState, defaultStudioConfig } from './state'
import { AdminStateSchema } from './schema'
import { reportError } from '@/lib/error'
import { saveToIDB, loadFromIDB } from './idb'
import { uiHandler } from './slices/ui'
import { siteHandler } from './slices/site'
import { registriesHandler } from './slices/registries'
import { infrastructureHandler } from './slices/infrastructure'
import { contentHandler } from './slices/content'
import { designHandler } from './slices/design'
import { integrationsHandler } from './slices/integrations'
import { aiHandler } from './slices/ai'
import { capabilitiesHandler } from './slices/capabilities'
import { studioHandler } from './slices/studio'
import { cmsHandler } from './slices/cms'

const SLICE_HANDLERS = [
  uiHandler,
  siteHandler,
  registriesHandler,
  infrastructureHandler,
  contentHandler,
  designHandler,
  integrationsHandler,
  aiHandler,
  capabilitiesHandler,
  studioHandler,
  cmsHandler,
] as const

const STORAGE_KEY = 'jootacee-command-v2'

function loadState(): AdminState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const validated = AdminStateSchema.partial().safeParse(parsed)
    if (!validated.success) {
      reportError(new Error('Command center state validation failed'), {
        context: 'admin/loadState',
        issues: validated.error.issues,
      })
      return null
    }
    const initial = createInitialState()
    return {
      ...initial,
      ...validated.data,
      integrations: {
        ...initial.integrations,
        ...(validated.data.integrations ?? {}),
        github: {
          ...initial.integrations.github,
          ...(validated.data.integrations?.github ?? {}),
        },
        dataSources: validated.data.integrations?.dataSources ?? [],
        // Merge stored social platforms over defaults (preserving any new default platforms)
        socialPlatforms: initial.integrations.socialPlatforms.map((def) => {
          const stored = validated.data.integrations?.socialPlatforms?.find((p) => p.id === def.id)
          return stored ? { ...def, ...stored } : def
        }),
      },
      // Backward-compat: if stored blocks lack `type`, infer from `id`
      blocks: (validated.data.blocks ?? initial.blocks).map((b) => ({ ...b, type: b.type ?? b.id })),
      pageBlocksMap: validated.data.pageBlocksMap
        ? { ...initial.pageBlocksMap, ...validated.data.pageBlocksMap }
        : initial.pageBlocksMap,
      content: validated.data.content ? {
        ...initial.content,
        ...validated.data.content,
        hero: { ...initial.content.hero, ...(validated.data.content.hero ?? {}) },
        blog: { ...initial.content.blog, ...(validated.data.content.blog ?? {}) },
        cta: { ...initial.content.cta, ...(validated.data.content.cta ?? {}) },
        contact: { ...initial.content.contact, ...(validated.data.content.contact ?? {}) },
        map: { ...initial.content.map, ...(validated.data.content.map ?? {}) },
        newsletter: { ...initial.content.newsletter, ...(validated.data.content.newsletter ?? {}) },
      } : initial.content,
      githubConfig: {
        ...initial.githubConfig,
        ...(validated.data.githubConfig ?? {}),
        repoMeta: { ...initial.githubConfig.repoMeta, ...(validated.data.githubConfig?.repoMeta ?? {}) },
      },
      projectsRegistry: validated.data.projectsRegistry ?? initial.projectsRegistry,
      curatedLinks: validated.data.curatedLinks ?? [],
      driveResources: validated.data.driveResources ?? [],
      trackedSources: validated.data.trackedSources ?? [],
      aboutConfig: validated.data.aboutConfig
        ? { ...initial.aboutConfig, ...validated.data.aboutConfig }
        : initial.aboutConfig,
      navbarSettings: validated.data.navbarSettings ? { ...initial.navbarSettings, ...validated.data.navbarSettings } : initial.navbarSettings,
      footerSettings: validated.data.footerSettings ? { ...initial.footerSettings, ...validated.data.footerSettings } : initial.footerSettings,
      aiConfig: { ...initial.aiConfig, ...(validated.data.aiConfig ?? {}) },
      capabilities: {
        ...initial.capabilities,
        ...(validated.data.capabilities ?? {}),
        mcpServers: validated.data.capabilities?.mcpServers ?? initial.capabilities.mcpServers,
        skills: validated.data.capabilities?.skills ?? initial.capabilities.skills,
        hermes: { ...initial.capabilities.hermes, ...(validated.data.capabilities?.hermes ?? {}) },
        platforms: validated.data.capabilities?.platforms ?? initial.capabilities.platforms,
      },
      visualEffects: validated.data.visualEffects
        ? { ...initial.visualEffects, ...validated.data.visualEffects }
        : initial.visualEffects,
      intelligence: (() => {
        const stored = validated.data.intelligence
        const storedFeeds = stored?.feeds ?? []
        // Merge: keep stored feeds (user API keys + enabled states), append new defaults not yet in storage
        const storedIds = new Set(storedFeeds.map((f: { id: string }) => f.id))
        const newDefaultFeeds = initial.intelligence.feeds.filter((f) => !storedIds.has(f.id))
        return {
          ...initial.intelligence,
          ...(stored ?? {}),
          feeds: [...storedFeeds, ...newDefaultFeeds],
        }
      })(),
      unsaved: false,
    } as unknown as AdminState
  } catch (err) {
    reportError(err, { context: 'admin/loadState' })
    return null
  }
}

function saveState(state: AdminState) {
  if (typeof window === 'undefined') return
  const { unsaved: _u, ...persistable } = state
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable))
    window.dispatchEvent(new CustomEvent('admin-state-saved'))
  } catch { /* quota exceeded */ }
  void saveToIDB(persistable)  // parallel durable write
}

export function adminReducer(state: AdminState, action: AdminAction): AdminState {
  // Meta actions: handled inline because they touch persistence directly
  if (action.type === 'MARK_SAVED') {
    return { ...state, unsaved: false, lastSaved: new Date().toISOString() }
  }
  if (action.type === 'IMPORT_STATE') {
    const next = { ...action.payload, unsaved: false, lastSaved: new Date().toISOString() }
    saveState(next)
    return next
  }
  if (action.type === 'RESET_STATE') {
    const next = createInitialState()
    saveState(next)
    return next
  }

  // Auto-revision: snapshot the item before content mutations are applied
  const preRevisionState = autoSnapshotBeforeMutation(state, action)
  const baseState = preRevisionState ?? state

  // Delegate to domain slice handlers — first match wins
  for (const handler of SLICE_HANDLERS) {
    const result = handler(baseState, action)
    if (result !== null) return result
  }

  return baseState
}

/** Returns a new state with a revision appended before a destructive content mutation, or null if not applicable. */
function autoSnapshotBeforeMutation(state: AdminState, action: AdminAction): AdminState | null {
  const MAX_REVISIONS = 50
  let revision: import('./types').ContentRevision | null = null
  const ts = new Date().toISOString()

  if (action.type === 'UPDATE_PROJECT') {
    const item = state.projectsRegistry.find(p => p.id === action.payload.id)
    if (item) revision = { id: `${ts}-${item.id}`, contentId: item.id, contentType: 'project', savedAt: ts, snapshot: item as unknown as Record<string, unknown> }
  } else if (action.type === 'UPDATE_RESEARCH_ENTRY') {
    const item = state.researchRegistry.find(r => r.slug === action.payload.slug)
    if (item) revision = { id: `${ts}-${item.slug}`, contentId: item.slug, contentType: 'research', savedAt: ts, snapshot: item as unknown as Record<string, unknown> }
  } else if (action.type === 'UPDATE_LAB') {
    const item = state.labsRegistry.find(l => l.key === action.payload.key)
    if (item) revision = { id: `${ts}-${item.key}`, contentId: item.key, contentType: 'lab', savedAt: ts, snapshot: item as unknown as Record<string, unknown> }
  } else if (action.type === 'UPDATE_SYSTEM') {
    const item = state.systemsRegistry.find(s => s.key === action.payload.key)
    if (item) revision = { id: `${ts}-${item.key}`, contentId: item.key, contentType: 'system', savedAt: ts, snapshot: item as unknown as Record<string, unknown> }
  }

  if (!revision) return null
  return { ...state, revisionLog: [...state.revisionLog, revision].slice(-MAX_REVISIONS) }
}

function _unused_adminReducer_legacy(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    case 'SET_PANEL':
      return { ...state, panel: action.payload }
    case 'SET_EDITING_POST_ID':
      return { ...state, editingPostId: action.payload }
    case 'SET_INTAKE_TYPE':
      return { ...state, intakeType: action.payload }
    case 'SET_PAGES_TAB':
      return { ...state, pagesActiveTab: action.payload }

    // Site Core
    case 'UPDATE_SITE':
      return { ...state, site: { ...state.site, ...action.payload }, unsaved: true }
    case 'UPDATE_SEO':
      return { ...state, seo: { ...state.seo, ...action.payload }, unsaved: true }
    case 'UPDATE_RUNTIME':
      return { ...state, runtime: { ...state.runtime, ...action.payload }, unsaved: true }

    // Projects Manager
    case 'SET_PROJECTS_REGISTRY':
      return { ...state, projectsRegistry: action.payload, unsaved: true }
    case 'ADD_PROJECT':
      return { ...state, projectsRegistry: [...state.projectsRegistry, action.payload], unsaved: true }
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projectsRegistry: state.projectsRegistry.map((p) =>
          p.id === action.payload.id ? { ...p, ...action.payload.data } : p
        ),
        unsaved: true,
      }
    case 'REMOVE_PROJECT':
      return { ...state, projectsRegistry: state.projectsRegistry.filter((p) => p.id !== action.payload), unsaved: true }

    // Systems Manager
    case 'SET_SYSTEMS_REGISTRY':
      return { ...state, systemsRegistry: action.payload, unsaved: true }
    case 'ADD_SYSTEM':
      return { ...state, systemsRegistry: [...state.systemsRegistry, action.payload], unsaved: true }
    case 'UPDATE_SYSTEM':
      return {
        ...state,
        systemsRegistry: state.systemsRegistry.map((s) =>
          s.key === action.payload.key ? { ...s, ...action.payload.data } : s
        ),
        unsaved: true,
      }
    case 'REMOVE_SYSTEM':
      return { ...state, systemsRegistry: state.systemsRegistry.filter((s) => s.key !== action.payload), unsaved: true }

    // Labs Manager
    case 'SET_LABS_REGISTRY':
      return { ...state, labsRegistry: action.payload, unsaved: true }
    case 'ADD_LAB_ENTRY':
      return { ...state, labsRegistry: [...state.labsRegistry, action.payload], unsaved: true }
    case 'UPDATE_LAB':
      return {
        ...state,
        labsRegistry: state.labsRegistry.map((l) =>
          l.key === action.payload.key ? { ...l, ...action.payload.data } : l
        ),
        unsaved: true,
      }

    // Research Manager
    case 'SET_RESEARCH_REGISTRY':
      return { ...state, researchRegistry: action.payload, unsaved: true }
    case 'ADD_RESEARCH_ENTRY':
      return { ...state, researchRegistry: [...state.researchRegistry, action.payload], unsaved: true }
    case 'UPDATE_RESEARCH_ENTRY':
      return {
        ...state,
        researchRegistry: state.researchRegistry.map((r) =>
          r.slug === action.payload.slug ? { ...r, ...action.payload.data } : r
        ),
        unsaved: true,
      }

    // Resource Registries
    case 'SET_TOOL_REGISTRY':     return { ...state, toolRegistry:     action.payload, unsaved: true }
    case 'SET_REPO_REGISTRY':     return { ...state, repoRegistry:     action.payload, unsaved: true }
    case 'SET_WORKFLOW_REGISTRY': return { ...state, workflowRegistry: action.payload, unsaved: true }
    case 'SET_PROMPT_REGISTRY':   return { ...state, promptRegistry:   action.payload, unsaved: true }
    case 'SET_MCP_REGISTRY':      return { ...state, mcpRegistry:      action.payload, unsaved: true }
    case 'SET_AGENT_REGISTRY':    return { ...state, agentRegistry:    action.payload, unsaved: true }
    case 'SET_SKILL_REGISTRY':    return { ...state, skillRegistry:    action.payload, unsaved: true }

    // Infrastructure Manager
    case 'UPDATE_INFRA_CONFIG':
      return {
        ...state,
        infraConfig: { ...state.infraConfig, ...action.payload },
        unsaved: true,
      }
    case 'SET_INFRA_NODES':
      return {
        ...state,
        infraConfig: { ...state.infraConfig, nodes: action.payload },
        unsaved: true,
      }
    case 'UPDATE_INFRA_NODE':
      return {
        ...state,
        infraConfig: {
          ...state.infraConfig,
          nodes: state.infraConfig.nodes.map((n) =>
            n.name === action.payload.name ? { ...n, ...action.payload.data } : n
          ),
        },
        unsaved: true,
      }
    case 'ADD_INFRA_NODE':
      return { ...state, infraConfig: { ...state.infraConfig, nodes: [...state.infraConfig.nodes, action.payload] }, unsaved: true }
    case 'REMOVE_INFRA_NODE':
      return { ...state, infraConfig: { ...state.infraConfig, nodes: state.infraConfig.nodes.filter((n) => n.name !== action.payload) }, unsaved: true }
    case 'SET_INFRA_DEPLOYMENTS':
      return { ...state, infraConfig: { ...state.infraConfig, deployments: action.payload }, unsaved: true }
    case 'ADD_INFRA_DEPLOYMENT':
      return { ...state, infraConfig: { ...state.infraConfig, deployments: [action.payload, ...state.infraConfig.deployments] }, unsaved: true }
    case 'REMOVE_INFRA_DEPLOYMENT':
      return { ...state, infraConfig: { ...state.infraConfig, deployments: state.infraConfig.deployments.filter((_, i) => i !== action.payload) }, unsaved: true }

    // GitHub Layer
    case 'UPDATE_GITHUB_CONFIG':
      return {
        ...state,
        githubConfig: { ...state.githubConfig, ...action.payload },
        unsaved: true,
      }
    case 'SET_REPO_META':
      return {
        ...state,
        githubConfig: {
          ...state.githubConfig,
          repoMeta: {
            ...state.githubConfig.repoMeta,
            [action.payload.repo]: {
              ...(state.githubConfig.repoMeta[action.payload.repo] ?? { description: '', language: '', stars: 0, forks: 0, topics: [], pinned: false }),
              ...action.payload.meta,
            },
          },
        },
        unsaved: true,
      }

    // Curated Links
    case 'SET_CURATED_LINKS':
      return { ...state, curatedLinks: action.payload, unsaved: true }
    case 'ADD_CURATED_LINK':
      return { ...state, curatedLinks: [...state.curatedLinks, action.payload], unsaved: true }
    case 'UPDATE_CURATED_LINK':
      return {
        ...state,
        curatedLinks: state.curatedLinks.map((l) => l.id === action.payload.id ? { ...l, ...action.payload.data } : l),
        unsaved: true,
      }
    case 'REMOVE_CURATED_LINK':
      return { ...state, curatedLinks: state.curatedLinks.filter((l) => l.id !== action.payload), unsaved: true }

    // Drive Resources
    case 'SET_DRIVE_RESOURCES':
      return { ...state, driveResources: action.payload, unsaved: true }
    case 'ADD_DRIVE_RESOURCE':
      return { ...state, driveResources: [...state.driveResources, action.payload], unsaved: true }
    case 'UPDATE_DRIVE_RESOURCE':
      return {
        ...state,
        driveResources: state.driveResources.map((r) => r.id === action.payload.id ? { ...r, ...action.payload.data } : r),
        unsaved: true,
      }
    case 'REMOVE_DRIVE_RESOURCE':
      return { ...state, driveResources: state.driveResources.filter((r) => r.id !== action.payload), unsaved: true }

    // About Config
    case 'UPDATE_ABOUT':
      return { ...state, aboutConfig: { ...state.aboutConfig, ...action.payload }, unsaved: true }
    case 'ABOUT_ADD_TIMELINE':
      return { ...state, aboutConfig: { ...state.aboutConfig, timeline: [...state.aboutConfig.timeline, action.payload] }, unsaved: true }
    case 'ABOUT_UPDATE_TIMELINE':
      return {
        ...state,
        aboutConfig: {
          ...state.aboutConfig,
          timeline: state.aboutConfig.timeline.map((t) =>
            t.id === action.payload.id ? { ...t, ...action.payload.data } : t
          ),
        },
        unsaved: true,
      }
    case 'ABOUT_REMOVE_TIMELINE':
      return { ...state, aboutConfig: { ...state.aboutConfig, timeline: state.aboutConfig.timeline.filter((t) => t.id !== action.payload) }, unsaved: true }

    // Tracked Sources
    case 'SET_TRACKED_SOURCES':
      return { ...state, trackedSources: action.payload, unsaved: true }
    case 'ADD_TRACKED_SOURCE':
      return { ...state, trackedSources: [...state.trackedSources, action.payload], unsaved: true }
    case 'UPDATE_TRACKED_SOURCE':
      return {
        ...state,
        trackedSources: state.trackedSources.map((s) => s.id === action.payload.id ? { ...s, ...action.payload.data } : s),
        unsaved: true,
      }
    case 'REMOVE_TRACKED_SOURCE':
      return { ...state, trackedSources: state.trackedSources.filter((s) => s.id !== action.payload), unsaved: true }

    // Blocks
    case 'SET_BLOCKS':
      return { ...state, blocks: action.payload, unsaved: true }
    case 'UPDATE_BLOCK':
      return {
        ...state,
        blocks: state.blocks.map((b) =>
          b.id === action.payload.id ? { ...b, ...action.payload.data } : b
        ),
        unsaved: true,
      }

    // Page Blocks Map
    case 'SET_PAGE_BLOCKS':
      return { ...state, pageBlocksMap: { ...state.pageBlocksMap, [action.payload.page]: action.payload.blocks }, unsaved: true }
    case 'UPDATE_PAGE_BLOCK':
      return {
        ...state,
        pageBlocksMap: {
          ...state.pageBlocksMap,
          [action.payload.page]: (state.pageBlocksMap[action.payload.page] ?? []).map((b) =>
            b.id === action.payload.id ? { ...b, ...action.payload.data } : b
          ),
        },
        unsaved: true,
      }

    // Content
    case 'UPDATE_CONTENT':
      return { ...state, content: { ...state.content, ...action.payload }, unsaved: true }
    case 'UPDATE_HERO_CONTENT':
      return { ...state, content: { ...state.content, hero: { ...state.content.hero, ...action.payload } }, unsaved: true }
    case 'SET_LOGOS':
      return { ...state, content: { ...state.content, logos: action.payload }, unsaved: true }
    case 'SET_STATS':
      return { ...state, content: { ...state.content, stats: action.payload }, unsaved: true }
    case 'SET_SERVICES':
      return { ...state, content: { ...state.content, services: action.payload }, unsaved: true }
    case 'SET_GALLERY':
      return { ...state, content: { ...state.content, gallery: action.payload }, unsaved: true }
    case 'SET_TEAM':
      return { ...state, content: { ...state.content, team: action.payload }, unsaved: true }
    case 'SET_PRICING':
      return { ...state, content: { ...state.content, pricing: action.payload }, unsaved: true }
    case 'SET_TESTIMONIALS':
      return { ...state, content: { ...state.content, testimonials: action.payload }, unsaved: true }
    case 'SET_FAQ':
      return { ...state, content: { ...state.content, faq: action.payload }, unsaved: true }
    case 'UPDATE_BLOG_CONTENT':
      return { ...state, content: { ...state.content, blog: { ...state.content.blog, ...action.payload } }, unsaved: true }
    case 'SET_PORTFOLIO':
      return { ...state, content: { ...state.content, portfolio: action.payload }, unsaved: true }
    case 'UPDATE_CTA_CONTENT':
      return { ...state, content: { ...state.content, cta: { ...state.content.cta, ...action.payload } }, unsaved: true }
    case 'UPDATE_CONTACT_CONTENT':
      return { ...state, content: { ...state.content, contact: { ...state.content.contact, ...action.payload } }, unsaved: true }
    case 'UPDATE_MAP_CONTENT':
      return { ...state, content: { ...state.content, map: { ...state.content.map, ...action.payload } }, unsaved: true }
    case 'UPDATE_NEWSLETTER_CONTENT':
      return { ...state, content: { ...state.content, newsletter: { ...state.content.newsletter, ...action.payload } }, unsaved: true }
    case 'SET_SOCIAL_PROOF':
      return { ...state, content: { ...state.content, socialProof: action.payload }, unsaved: true }

    // Navbar Config
    case 'UPDATE_NAVBAR_SETTINGS':
      return { ...state, navbarSettings: { ...state.navbarSettings, ...action.payload }, unsaved: true }

    // Footer Config
    case 'UPDATE_FOOTER_SETTINGS':
      return { ...state, footerSettings: { ...state.footerSettings, ...action.payload }, unsaved: true }
    case 'SET_FOOTER_COLUMNS':
      return { ...state, footerSettings: { ...state.footerSettings, columns: action.payload }, unsaved: true }

    // Navigation links
    case 'SET_NAVIGATION':
      return { ...state, navigation: action.payload, unsaved: true }
    case 'UPDATE_DESIGN':
      return { ...state, design: { ...state.design, ...action.payload }, unsaved: true }
    case 'UPDATE_TOKENS':
      return {
        ...state,
        design: { ...state.design, tokens: { ...state.design.tokens, ...action.payload } },
        unsaved: true,
      }
    case 'UPDATE_PERSONALITY':
      return {
        ...state,
        personality: { ...state.personality, ...action.payload },
        unsaved: true,
      }
    case 'SET_EFFECTS':
      return {
        ...state,
        personality: { ...state.personality, effects: action.payload },
        unsaved: true,
      }

    // AI Assistant
    case 'AI_NEW_CONVERSATION':
      return {
        ...state,
        aiConfig: {
          ...state.aiConfig,
          conversations: [action.payload, ...state.aiConfig.conversations],
          activeConversationId: action.payload.id,
        },
        unsaved: true,
      }
    case 'AI_SET_ACTIVE':
      return { ...state, aiConfig: { ...state.aiConfig, activeConversationId: action.payload } }
    case 'AI_ADD_MESSAGE': {
      const now = new Date().toISOString()
      return {
        ...state,
        aiConfig: {
          ...state.aiConfig,
          conversations: state.aiConfig.conversations.map((c) =>
            c.id === action.payload.conversationId
              ? { ...c, messages: [...c.messages, action.payload.message], updatedAt: now }
              : c
          ),
        },
        unsaved: true,
      }
    }
    case 'AI_UPDATE_TITLE':
      return {
        ...state,
        aiConfig: {
          ...state.aiConfig,
          conversations: state.aiConfig.conversations.map((c) =>
            c.id === action.payload.conversationId ? { ...c, title: action.payload.title } : c
          ),
        },
        unsaved: true,
      }
    case 'AI_DELETE_CONVERSATION': {
      const filtered = state.aiConfig.conversations.filter((c) => c.id !== action.payload)
      return {
        ...state,
        aiConfig: {
          ...state.aiConfig,
          conversations: filtered,
          activeConversationId:
            state.aiConfig.activeConversationId === action.payload
              ? (filtered[0]?.id ?? null)
              : state.aiConfig.activeConversationId,
        },
        unsaved: true,
      }
    }
    case 'AI_SET_PROFILE': {
      const exists = state.aiConfig.profiles.some((p) => p.id === action.payload.id)
      return {
        ...state,
        aiConfig: {
          ...state.aiConfig,
          profiles: exists
            ? state.aiConfig.profiles.map((p) => (p.id === action.payload.id ? action.payload : p))
            : [...state.aiConfig.profiles, action.payload],
        },
        unsaved: true,
      }
    }
    case 'AI_SET_ACTIVE_PROFILE':
      return { ...state, aiConfig: { ...state.aiConfig, activeProfileId: action.payload }, unsaved: true }
    case 'AI_REMOVE_PROFILE':
      return {
        ...state,
        aiConfig: {
          ...state.aiConfig,
          profiles: state.aiConfig.profiles.filter((p) => p.id !== action.payload),
          activeProfileId:
            state.aiConfig.activeProfileId === action.payload
              ? (state.aiConfig.profiles[0]?.id ?? null)
              : state.aiConfig.activeProfileId,
        },
        unsaved: true,
      }
    case 'AI_TOGGLE_CONTEXT':
      return { ...state, aiConfig: { ...state.aiConfig, siteContextEnabled: action.payload }, unsaved: true }

    // Integrations
    case 'INTEGRATIONS_SET_GITHUB':
      return {
        ...state,
        integrations: {
          ...state.integrations,
          github: { ...state.integrations.github, ...action.payload },
        },
        unsaved: true,
      }
    case 'INTEGRATIONS_DISCONNECT_GITHUB':
      return {
        ...state,
        integrations: {
          ...state.integrations,
          github: {
            connected: false,
            accessToken: '',
            username: '',
            avatarUrl: '',
            repos: [],
            selectedRepos: [],
            lastSync: null,
          },
        },
        unsaved: true,
      }

    // Sync GitHub repos → githubConfig showcase registry
    case 'SYNC_GITHUB_FROM_INTEGRATIONS': {
      const gh = state.integrations.github
      if (!gh.connected || !gh.repos.length) return state
      const sorted = [...gh.repos].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      const topRepos = sorted.slice(0, 20)
      const newDisplayRepos = topRepos.map((r) => r.name)
      const newRepoMeta = topRepos.reduce<Record<string, import('./types').GithubRepoMeta>>((acc, r) => {
        const existing = state.githubConfig.repoMeta[r.name]
        acc[r.name] = {
          description: r.description || existing?.description || '',
          language: r.language || existing?.language || 'TypeScript',
          stars: r.stars ?? existing?.stars ?? 0,
          forks: (r.forks ?? existing?.forks) ?? 0,
          topics: r.topics ?? existing?.topics ?? [],
          pinned: existing?.pinned ?? false,
        }
        return acc
      }, {})
      return {
        ...state,
        githubConfig: {
          ...state.githubConfig,
          username: gh.username || state.githubConfig.username,
          displayRepos: newDisplayRepos,
          repoMeta: newRepoMeta,
        },
        unsaved: true,
      }
    }

    // Social Platforms
    case 'UPDATE_SOCIAL_PLATFORM':
      return {
        ...state,
        integrations: {
          ...state.integrations,
          socialPlatforms: state.integrations.socialPlatforms.map((p) =>
            p.id === action.payload.id ? { ...p, ...action.payload.data } : p
          ),
        },
        unsaved: true,
      }
    case 'TOGGLE_SOCIAL_PLATFORM':
      return {
        ...state,
        integrations: {
          ...state.integrations,
          socialPlatforms: state.integrations.socialPlatforms.map((p) =>
            p.id === action.payload ? { ...p, connected: !p.connected } : p
          ),
        },
        unsaved: true,
      }

    // Data Sources
    case 'SOURCES_ADD':
      return {
        ...state,
        integrations: {
          ...state.integrations,
          dataSources: [action.payload, ...state.integrations.dataSources],
        },
        unsaved: true,
      }
    case 'SOURCES_UPDATE':
      return {
        ...state,
        integrations: {
          ...state.integrations,
          dataSources: state.integrations.dataSources.map((s) =>
            s.id === action.payload.id ? { ...s, ...action.payload.data } : s
          ),
        },
        unsaved: true,
      }
    case 'SOURCES_REMOVE':
      return {
        ...state,
        integrations: {
          ...state.integrations,
          dataSources: state.integrations.dataSources.filter((s) => s.id !== action.payload),
        },
        unsaved: true,
      }
    case 'SOURCES_CLEAR_ALL':
      return {
        ...state,
        integrations: { ...state.integrations, dataSources: [] },
        unsaved: true,
      }
    case 'SOURCES_SET_SHOWCASE':
      return {
        ...state,
        integrations: {
          ...state.integrations,
          dataSources: state.integrations.dataSources.map((s) =>
            s.id === action.payload.id ? { ...s, showcaseOutput: action.payload.output } : s
          ),
        },
        unsaved: true,
      }

    // Capabilities
    case 'CAPABILITIES_ADD_MCP':
      return {
        ...state,
        capabilities: {
          ...state.capabilities,
          mcpServers: [...state.capabilities.mcpServers, action.payload],
        },
        unsaved: true,
      }
    case 'CAPABILITIES_TOGGLE_MCP':
      return {
        ...state,
        capabilities: {
          ...state.capabilities,
          mcpServers: state.capabilities.mcpServers.map((s) =>
            s.id === action.payload ? { ...s, enabled: !s.enabled } : s
          ),
        },
        unsaved: true,
      }
    case 'CAPABILITIES_REMOVE_MCP':
      return {
        ...state,
        capabilities: {
          ...state.capabilities,
          mcpServers: state.capabilities.mcpServers.filter((s) => s.id !== action.payload),
        },
        unsaved: true,
      }
    case 'CAPABILITIES_ADD_SKILL':
      return {
        ...state,
        capabilities: {
          ...state.capabilities,
          skills: [...state.capabilities.skills, action.payload],
        },
        unsaved: true,
      }
    case 'CAPABILITIES_TOGGLE_SKILL':
      return {
        ...state,
        capabilities: {
          ...state.capabilities,
          skills: state.capabilities.skills.map((s) =>
            s.id === action.payload ? { ...s, enabled: !s.enabled } : s
          ),
        },
        unsaved: true,
      }
    case 'CAPABILITIES_REMOVE_SKILL':
      return {
        ...state,
        capabilities: {
          ...state.capabilities,
          skills: state.capabilities.skills.filter((s) => s.id !== action.payload),
        },
        unsaved: true,
      }
    case 'CAPABILITIES_UPDATE_SKILL':
      return {
        ...state,
        capabilities: {
          ...state.capabilities,
          skills: state.capabilities.skills.map((s) =>
            s.id === action.payload.id ? { ...s, ...action.payload.data } : s
          ),
        },
        unsaved: true,
      }
    case 'CAPABILITIES_UPDATE_HERMES':
      return {
        ...state,
        capabilities: {
          ...state.capabilities,
          hermes: { ...state.capabilities.hermes, ...action.payload },
        },
        unsaved: true,
      }
    case 'HERMES_ADD_CRON_TASK':
      return {
        ...state,
        capabilities: {
          ...state.capabilities,
          hermes: {
            ...state.capabilities.hermes,
            scheduledTasks: [...(state.capabilities.hermes.scheduledTasks ?? []), action.payload],
          },
        },
        unsaved: true,
      }
    case 'HERMES_UPDATE_CRON_TASK':
      return {
        ...state,
        capabilities: {
          ...state.capabilities,
          hermes: {
            ...state.capabilities.hermes,
            scheduledTasks: (state.capabilities.hermes.scheduledTasks ?? []).map((t) =>
              t.id === action.payload.id ? { ...t, ...action.payload.data } : t
            ),
          },
        },
        unsaved: true,
      }
    case 'HERMES_REMOVE_CRON_TASK':
      return {
        ...state,
        capabilities: {
          ...state.capabilities,
          hermes: {
            ...state.capabilities.hermes,
            scheduledTasks: (state.capabilities.hermes.scheduledTasks ?? []).filter((t) => t.id !== action.payload),
          },
        },
        unsaved: true,
      }
    case 'CAPABILITIES_UPDATE_PLATFORM':
      return {
        ...state,
        capabilities: {
          ...state.capabilities,
          platforms: state.capabilities.platforms.map((p) =>
            p.id === action.payload.id ? { ...p, ...action.payload } : p
          ),
        },
        unsaved: true,
      }

    // Visual Effects
    case 'UPDATE_VISUAL_EFFECTS':
      return {
        ...state,
        visualEffects: { ...state.visualEffects, ...action.payload },
        unsaved: true,
      }
    case 'SET_SHADER_PRESET':
      return {
        ...state,
        visualEffects: { ...state.visualEffects, activeShaderPreset: action.payload },
        unsaved: true,
      }
    case 'SET_HERO_SCENE_CONFIG':
      return {
        ...state,
        heroSceneConfig: { ...state.heroSceneConfig, ...action.payload },
        unsaved: true,
      }
    case 'SET_PAGE_EFFECT': {
      const existing = state.pageEffectsMap[action.payload.page] ?? { scene3d: false, particles: false, parallax: false, grain: false }
      return {
        ...state,
        pageEffectsMap: {
          ...state.pageEffectsMap,
          [action.payload.page]: { ...existing, ...action.payload.slot },
        },
        unsaved: true,
      }
    }

    // Intelligence Feeds
    case 'INTELLIGENCE_TOGGLE_FEED':
      return {
        ...state,
        intelligence: {
          ...state.intelligence,
          feeds: state.intelligence.feeds.map((f) =>
            f.id === action.payload ? { ...f, enabled: !f.enabled } : f
          ),
        },
        unsaved: true,
      }
    case 'INTELLIGENCE_SET_KEY':
      return {
        ...state,
        intelligence: {
          ...state.intelligence,
          feeds: state.intelligence.feeds.map((f) =>
            f.id === action.payload.id ? { ...f, apiKey: action.payload.key, connected: action.payload.key.length > 0 } : f
          ),
        },
        unsaved: true,
      }
    case 'INTELLIGENCE_UPDATE_CONFIG':
      return {
        ...state,
        intelligence: { ...state.intelligence, ...action.payload },
        unsaved: true,
      }
    case 'INTELLIGENCE_SET_STATUS':
      return {
        ...state,
        intelligence: {
          ...state.intelligence,
          feeds: state.intelligence.feeds.map((f) =>
            f.id === action.payload.id
              ? { ...f, connected: action.payload.connected, lastSync: action.payload.lastSync, itemCount: action.payload.itemCount }
              : f
          ),
        },
        unsaved: true,
      }
    case 'INTELLIGENCE_ADD_FEED':
      if (state.intelligence.feeds.some((f) => f.id === action.payload.id)) return state
      return {
        ...state,
        intelligence: { ...state.intelligence, feeds: [...state.intelligence.feeds, action.payload] },
        unsaved: true,
      }
    case 'INTELLIGENCE_REMOVE_FEED':
      return {
        ...state,
        intelligence: {
          ...state.intelligence,
          feeds: state.intelligence.feeds.filter((f) => f.id !== action.payload),
        },
        unsaved: true,
      }
    case 'INTELLIGENCE_UPDATE_FEED':
      return {
        ...state,
        intelligence: {
          ...state.intelligence,
          feeds: state.intelligence.feeds.map((f) =>
            f.id === action.payload.id ? { ...f, ...action.payload.data } : f
          ),
        },
        unsaved: true,
      }

    // Studio (Command Center config)
    case 'UPDATE_STUDIO':
      return { ...state, studioConfig: { ...state.studioConfig, ...action.payload }, unsaved: true }
    case 'STUDIO_SET_NAV_GROUP':
      return {
        ...state,
        studioConfig: {
          ...state.studioConfig,
          navGroups: state.studioConfig.navGroups.map(g =>
            g.key === action.payload.key ? { ...g, ...action.payload.data } : g
          ),
        },
        unsaved: true,
      }
    case 'STUDIO_SET_PANEL_OVERRIDE': {
      const exists = state.studioConfig.panelOverrides.some(p => p.id === action.payload.id)
      return {
        ...state,
        studioConfig: {
          ...state.studioConfig,
          panelOverrides: exists
            ? state.studioConfig.panelOverrides.map(p => p.id === action.payload.id ? { ...p, ...action.payload.data } : p)
            : [...state.studioConfig.panelOverrides, { id: action.payload.id, visible: true, order: 99, ...action.payload.data }],
        },
        unsaved: true,
      }
    }
    case 'STUDIO_REORDER_GROUP': {
      const sorted = [...state.studioConfig.navGroups].sort((a, b) => a.order - b.order)
      const idx  = sorted.findIndex(g => g.key === action.payload.key)
      const swap = action.payload.direction === 'up' ? idx - 1 : idx + 1
      if (swap < 0 || swap >= sorted.length) return state
      const newGroups = sorted.map((g, i) => {
        if (i === idx)  return { ...g, order: sorted[swap].order }
        if (i === swap) return { ...g, order: sorted[idx].order }
        return g
      })
      return { ...state, studioConfig: { ...state.studioConfig, navGroups: newGroups }, unsaved: true }
    }
    case 'STUDIO_TOGGLE_PIN': {
      const pinned   = state.studioConfig.pinnedPanels
      const isPinned = pinned.includes(action.payload)
      return {
        ...state,
        studioConfig: {
          ...state.studioConfig,
          pinnedPanels: isPinned ? pinned.filter(p => p !== action.payload) : [...pinned, action.payload],
        },
        unsaved: true,
      }
    }
    case 'STUDIO_SAVE_PRESET':
      return {
        ...state,
        studioConfig: { ...state.studioConfig, customPresets: [...state.studioConfig.customPresets, action.payload] },
        unsaved: true,
      }
    case 'STUDIO_DELETE_PRESET':
      return {
        ...state,
        studioConfig: { ...state.studioConfig, customPresets: state.studioConfig.customPresets.filter(p => p.id !== action.payload) },
        unsaved: true,
      }
    case 'STUDIO_SAVE_WORKSPACE_PROFILE':
      return {
        ...state,
        studioConfig: { ...state.studioConfig, workspaceProfiles: [...state.studioConfig.workspaceProfiles, action.payload] },
        unsaved: true,
      }
    case 'STUDIO_DELETE_WORKSPACE_PROFILE':
      return {
        ...state,
        studioConfig: { ...state.studioConfig, workspaceProfiles: state.studioConfig.workspaceProfiles.filter(p => p.id !== action.payload) },
        unsaved: true,
      }
    case 'STUDIO_RESET':
      return { ...state, studioConfig: defaultStudioConfig, unsaved: true }

    default:
      return state
  }
}

interface AdminContextValue {
  state: AdminState
  dispatch: React.Dispatch<AdminAction>
  exportJSON: () => string
  importJSON: (json: string) => boolean
  forceSave: () => void
}

const AdminContext = createContext<AdminContextValue | null>(null)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(
    adminReducer,
    null,
    () => loadState() ?? createInitialState()
  )

  const stateRef = useRef(state)
  useEffect(() => { stateRef.current = state }, [state])

  // Async fallback hydration: if localStorage was empty on startup, try IDB → /admin-defaults.json
  useEffect(() => {
    if (typeof window === 'undefined') return
    const hasLocal = !!localStorage.getItem(STORAGE_KEY)
    if (hasLocal) {
      // Backfill IDB from localStorage so it stays current across upgrades
      const persisted = stateRef.current
      void saveToIDB(persisted)
      return
    }
    ;(async () => {
      let raw: unknown = await loadFromIDB()
      if (!raw) {
        try {
          const res = await fetch('/admin-defaults.json')
          if (res.ok) raw = await res.json()
        } catch { /* no fallback file — skip */ }
      }
      if (!raw) return
      // Stash in localStorage so loadState() merge logic applies
      localStorage.setItem(STORAGE_KEY, JSON.stringify(raw))
      const merged = loadState()
      if (!merged) return
      dispatch({ type: 'IMPORT_STATE', payload: merged })
    })().catch(() => {})
  }, [])

  useEffect(() => {
    if (state.unsaved) {
      const t = setTimeout(() => {
        dispatch({ type: 'MARK_SAVED' })
        saveState(stateRef.current)
      }, 800)
      return () => clearTimeout(t)
    }
  }, [state.unsaved, state])

  const exportJSON = useCallback(() => {
    const { unsaved: _unsaved, ...rest } = stateRef.current
    return JSON.stringify(rest, null, 2)
  }, [])

  const importJSON = useCallback((json: string) => {
    try {
      const parsed = JSON.parse(json)
      const validated = AdminStateSchema.safeParse(parsed)
      if (!validated.success) {
        reportError(new Error('Command center import validation failed'), {
          context: 'admin/importJSON',
          issues: validated.error.issues,
        })
        return false
      }
      dispatch({ type: 'IMPORT_STATE', payload: validated.data as unknown as AdminState })
      return true
    } catch (err) {
      reportError(err, { context: 'admin/importJSON' })
      return false
    }
  }, [])

  const forceSave = useCallback(() => {
    dispatch({ type: 'MARK_SAVED' })
    saveState(stateRef.current)
  }, [])

  const contextValue = useMemo(
    () => ({ state, dispatch, exportJSON, importJSON, forceSave }),
    [state, dispatch, exportJSON, importJSON, forceSave]
  )

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider')
  return ctx
}
