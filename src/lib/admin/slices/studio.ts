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
