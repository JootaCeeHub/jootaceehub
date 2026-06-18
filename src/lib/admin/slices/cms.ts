import type { AdminState, AdminAction } from '../types'

const MAX_REVISIONS = 50

export function cmsHandler(state: AdminState, action: AdminAction): AdminState | null {
  switch (action.type) {
    // ── Tag Registry ───────────────────────────────────────────────────────────
    case 'SET_TAG_REGISTRY':
      return { ...state, tagRegistry: action.payload, unsaved: true }
    case 'ADD_TAG':
      return { ...state, tagRegistry: [...state.tagRegistry, action.payload], unsaved: true }
    case 'UPDATE_TAG':
      return {
        ...state,
        tagRegistry: state.tagRegistry.map(t =>
          t.id === action.payload.id ? { ...t, ...action.payload.data } : t
        ),
        unsaved: true,
      }
    case 'REMOVE_TAG':
      return { ...state, tagRegistry: state.tagRegistry.filter(t => t.id !== action.payload), unsaved: true }

    // ── Category Registry ──────────────────────────────────────────────────────
    case 'SET_CATEGORY_REGISTRY':
      return { ...state, categoryRegistry: action.payload, unsaved: true }
    case 'ADD_CATEGORY':
      return { ...state, categoryRegistry: [...state.categoryRegistry, action.payload], unsaved: true }
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categoryRegistry: state.categoryRegistry.map(c =>
          c.id === action.payload.id ? { ...c, ...action.payload.data } : c
        ),
        unsaved: true,
      }
    case 'REMOVE_CATEGORY':
      return { ...state, categoryRegistry: state.categoryRegistry.filter(c => c.id !== action.payload), unsaved: true }

    // ── Media Registry ─────────────────────────────────────────────────────────
    case 'SET_MEDIA_REGISTRY':
      return { ...state, mediaRegistry: action.payload, unsaved: true }
    case 'ADD_MEDIA_ITEM':
      return { ...state, mediaRegistry: [...state.mediaRegistry, action.payload], unsaved: true }
    case 'UPDATE_MEDIA_ITEM':
      return {
        ...state,
        mediaRegistry: state.mediaRegistry.map(m =>
          m.id === action.payload.id ? { ...m, ...action.payload.data } : m
        ),
        unsaved: true,
      }
    case 'REMOVE_MEDIA_ITEM':
      return { ...state, mediaRegistry: state.mediaRegistry.filter(m => m.id !== action.payload), unsaved: true }

    // ── Revision Log ───────────────────────────────────────────────────────────
    case 'LOG_REVISION': {
      const log = [...state.revisionLog, action.payload].slice(-MAX_REVISIONS)
      return { ...state, revisionLog: log, unsaved: true }
    }
    case 'CLEAR_REVISIONS':
      return {
        ...state,
        revisionLog: state.revisionLog.filter(
          r => !(r.contentId === action.payload.contentId && r.contentType === action.payload.contentType)
        ),
        unsaved: true,
      }

    // ── Publishing Workflow ────────────────────────────────────────────────────
    case 'CONTENT_SET_STATUS': {
      const { contentType, contentId, status } = action.payload
      const published = status === 'published'

      if (contentType === 'project') {
        return {
          ...state,
          projectsRegistry: state.projectsRegistry.map(p =>
            p.id === contentId ? { ...p, published, cmsStatus: status } : p
          ),
          unsaved: true,
        }
      }
      if (contentType === 'research') {
        return {
          ...state,
          researchRegistry: state.researchRegistry.map(r =>
            r.slug === contentId ? { ...r, published, cmsStatus: status } : r
          ),
          unsaved: true,
        }
      }
      if (contentType === 'lab') {
        return {
          ...state,
          labsRegistry: state.labsRegistry.map(l =>
            l.key === contentId ? { ...l, visible: published } : l
          ),
          unsaved: true,
        }
      }
      if (contentType === 'system') {
        return {
          ...state,
          systemsRegistry: state.systemsRegistry.map(s =>
            s.key === contentId ? { ...s, visible: published } : s
          ),
          unsaved: true,
        }
      }
      return null
    }

    // ── Deploy Hook ────────────────────────────────────────────────────────────
    case 'SET_DEPLOY_HOOK_URL':
      return {
        ...state,
        integrations: { ...state.integrations, deployHookUrl: action.payload },
        unsaved: true,
      }
    case 'DEPLOY_TRIGGERED':
      return {
        ...state,
        integrations: { ...state.integrations, lastDeployTriggeredAt: action.payload },
      }

    default:
      return null
  }
}
