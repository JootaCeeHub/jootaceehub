import type { AdminState, AdminAction } from '../types'
import { defaultStudioConfig } from '../state'

export function studioHandler(state: AdminState, action: AdminAction): AdminState | null {
  switch (action.type) {
    case 'UPDATE_STUDIO':
      return { ...state, studioConfig: { ...state.studioConfig, ...action.payload }, unsaved: true }

    case 'STUDIO_SET_NAV_GROUP':
      return {
        ...state,
        studioConfig: {
          ...state.studioConfig,
          navGroups: state.studioConfig.navGroups.map((g) =>
            g.key === action.payload.key ? { ...g, ...action.payload.data } : g
          ),
        },
        unsaved: true,
      }

    case 'STUDIO_REORDER_GROUP': {
      const sorted = [...state.studioConfig.navGroups].sort((a, b) => a.order - b.order)
      const idx = sorted.findIndex((g) => g.key === action.payload.key)
      const swap = action.payload.direction === 'up' ? idx - 1 : idx + 1
      if (swap < 0 || swap >= sorted.length) return state
      const newGroups = sorted.map((g, i) => {
        if (i === idx) return { ...g, order: sorted[swap].order }
        if (i === swap) return { ...g, order: sorted[idx].order }
        return g
      })
      return { ...state, studioConfig: { ...state.studioConfig, navGroups: newGroups }, unsaved: true }
    }

    case 'STUDIO_SET_PANEL_OVERRIDE': {
      const exists = state.studioConfig.panelOverrides.some((p) => p.id === action.payload.id)
      return {
        ...state,
        studioConfig: {
          ...state.studioConfig,
          panelOverrides: exists
            ? state.studioConfig.panelOverrides.map((p) =>
                p.id === action.payload.id ? { ...p, ...action.payload.data } : p
              )
            : [...state.studioConfig.panelOverrides, { id: action.payload.id, visible: true, order: 99, ...action.payload.data }],
        },
        unsaved: true,
      }
    }

    case 'STUDIO_REORDER_PANEL': {
      const { id, groupPanels, direction } = action.payload
      const overrides = state.studioConfig.panelOverrides
      const withOrder = groupPanels.map((panelId, idx) => {
        const ov = overrides.find((o) => o.id === panelId)
        return { id: panelId, order: ov?.order ?? idx * 10 }
      }).sort((a, b) => a.order - b.order)
      const idx  = withOrder.findIndex((p) => p.id === id)
      const swap = direction === 'up' ? idx - 1 : idx + 1
      if (swap < 0 || swap >= withOrder.length) return state
      const aId = withOrder[idx].id  as typeof id
      const bId = withOrder[swap].id as typeof id
      const aNewOrder = withOrder[swap].order
      const bNewOrder = withOrder[idx].order
      const newOverrides = [...overrides]
      const upsert = (pid: typeof id, order: number) => {
        const ei = newOverrides.findIndex((o) => o.id === pid)
        if (ei >= 0) { newOverrides[ei] = { ...newOverrides[ei], order } }
        else { newOverrides.push({ id: pid, visible: true, order }) }
      }
      upsert(aId, aNewOrder)
      upsert(bId, bNewOrder)
      return { ...state, studioConfig: { ...state.studioConfig, panelOverrides: newOverrides }, unsaved: true }
    }

    case 'SET_CONTENT_SECTION': {
      const overrides = state.studioConfig.contentSectionOverrides ?? []
      const exists = overrides.some((o) => o.id === action.payload.id)
      return {
        ...state,
        studioConfig: {
          ...state.studioConfig,
          contentSectionOverrides: exists
            ? overrides.map((o) => o.id === action.payload.id ? { ...o, ...action.payload.data } : o)
            : [...overrides, { id: action.payload.id, ...action.payload.data }],
        },
        unsaved: true,
      }
    }

    case 'RESET_CONTENT_SECTIONS':
      return { ...state, studioConfig: { ...state.studioConfig, contentSectionOverrides: [] }, unsaved: true }

    case 'STUDIO_TOGGLE_PIN': {
      const pinned = state.studioConfig.pinnedPanels
      const isPinned = pinned.includes(action.payload)
      return {
        ...state,
        studioConfig: {
          ...state.studioConfig,
          pinnedPanels: isPinned ? pinned.filter((p) => p !== action.payload) : [...pinned, action.payload],
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
        studioConfig: {
          ...state.studioConfig,
          customPresets: state.studioConfig.customPresets.filter((p) => p.id !== action.payload),
        },
        unsaved: true,
      }

    case 'STUDIO_SAVE_WORKSPACE_PROFILE':
      return {
        ...state,
        studioConfig: {
          ...state.studioConfig,
          workspaceProfiles: [...state.studioConfig.workspaceProfiles, action.payload],
        },
        unsaved: true,
      }

    case 'STUDIO_DELETE_WORKSPACE_PROFILE':
      return {
        ...state,
        studioConfig: {
          ...state.studioConfig,
          workspaceProfiles: state.studioConfig.workspaceProfiles.filter((p) => p.id !== action.payload),
        },
        unsaved: true,
      }

    case 'STUDIO_RESET':
      return { ...state, studioConfig: defaultStudioConfig, unsaved: true }

    default:
      return null
  }
}
