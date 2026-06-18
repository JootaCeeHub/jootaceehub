import type { AdminState, AdminAction, CmsStatus, RevisionContentType, ContentRevision } from '../types'

const MAX_REVISIONS = 50

// ─── Auto-note helpers ────────────────────────────────────────────────────────

function statusNote(from: CmsStatus | undefined, to: CmsStatus): string {
  const prev = from ?? 'draft'
  return `Status: ${prev} → ${to} at ${new Date().toISOString()}`
}

function nanoid(): string {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6)
}

function addAutoRevision(
  state: AdminState,
  contentType: RevisionContentType,
  contentId: string,
  // reason: snapshots from typed registry entries — cast at call sites
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  snapshot: any,
  note: string,
): ContentRevision[] {
  const rev: ContentRevision = { id: nanoid(), contentId, contentType, savedAt: new Date().toISOString(), note, snapshot }
  return [...state.revisionLog, rev].slice(-MAX_REVISIONS)
}

// ─── Restore helpers ──────────────────────────────────────────────────────────

function restoreProject(state: AdminState, rev: ContentRevision): AdminState {
  // reason: snapshot is Record<string, any> by design — caller controls shape
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const snap = rev.snapshot as any
  return {
    ...state,
    projectsRegistry: state.projectsRegistry.map(p =>
      p.id === rev.contentId ? { ...p, ...snap } : p
    ),
    revisionLog: addAutoRevision(state, 'project', rev.contentId, snap, `Rolled back to ${rev.savedAt}`),
    unsaved: true,
  }
}

function restoreResearch(state: AdminState, rev: ContentRevision): AdminState {
  // reason: snapshot is Record<string, any> by design
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const snap = rev.snapshot as any
  return {
    ...state,
    researchRegistry: state.researchRegistry.map(r =>
      r.slug === rev.contentId ? { ...r, ...snap } : r
    ),
    revisionLog: addAutoRevision(state, 'research', rev.contentId, snap, `Rolled back to ${rev.savedAt}`),
    unsaved: true,
  }
}

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

    // ── Series Registry ────────────────────────────────────────────────────────
    case 'SET_SERIES_REGISTRY':
      return { ...state, seriesRegistry: action.payload, unsaved: true }
    case 'ADD_SERIES':
      return { ...state, seriesRegistry: [...state.seriesRegistry, action.payload], unsaved: true }
    case 'UPDATE_SERIES':
      return {
        ...state,
        seriesRegistry: state.seriesRegistry.map(s =>
          s.id === action.payload.id ? { ...s, ...action.payload.data } : s
        ),
        unsaved: true,
      }
    case 'REMOVE_SERIES':
      return { ...state, seriesRegistry: state.seriesRegistry.filter(s => s.id !== action.payload), unsaved: true }

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
    case 'RESTORE_REVISION': {
      const rev = action.payload
      if (rev.contentType === 'project') return restoreProject(state, rev)
      if (rev.contentType === 'research') return restoreResearch(state, rev)
      return null
    }

    // ── Publishing Workflow ────────────────────────────────────────────────────
    case 'CONTENT_SET_STATUS': {
      const { contentType, contentId, status } = action.payload
      const isPublished = status === 'published'
      const publishedAt = isPublished ? new Date().toISOString() : undefined

      if (contentType === 'project') {
        const item = state.projectsRegistry.find(p => p.id === contentId)
        const note = statusNote(item?.cmsStatus, status)
        return {
          ...state,
          projectsRegistry: state.projectsRegistry.map(p =>
            p.id === contentId
              ? { ...p, published: isPublished, cmsStatus: status, ...(publishedAt ? { publishedAt } : {}) }
              : p
          ),
          revisionLog: addAutoRevision(state, 'project', contentId, item ?? {}, note),
          unsaved: true,
        }
      }
      if (contentType === 'research') {
        const item = state.researchRegistry.find(r => r.slug === contentId)
        const note = statusNote(item?.cmsStatus, status)
        return {
          ...state,
          researchRegistry: state.researchRegistry.map(r =>
            r.slug === contentId
              ? { ...r, published: isPublished, cmsStatus: status, ...(publishedAt ? { publishedAt } : {}) }
              : r
          ),
          revisionLog: addAutoRevision(state, 'research', contentId, item ?? {}, note),
          unsaved: true,
        }
      }
      if (contentType === 'lab') {
        return {
          ...state,
          labsRegistry: state.labsRegistry.map(l =>
            l.key === contentId ? { ...l, visible: isPublished } : l
          ),
          unsaved: true,
        }
      }
      if (contentType === 'system') {
        return {
          ...state,
          systemsRegistry: state.systemsRegistry.map(s =>
            s.key === contentId ? { ...s, visible: isPublished } : s
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
