import type { AdminState, AdminAction } from '../types'

export function uiHandler(state: AdminState, action: AdminAction): AdminState | null {
  switch (action.type) {
    case 'SET_PANEL':
      return { ...state, panel: action.payload }
    case 'SET_EDITING_POST_ID':
      return { ...state, editingPostId: action.payload }
    case 'SET_INTAKE_TYPE':
      return { ...state, intakeType: action.payload }
    case 'SET_PAGES_TAB':
      return { ...state, pagesActiveTab: action.payload }
    case 'MARK_SAVED':
      return { ...state, unsaved: false, lastSaved: new Date().toISOString() }
    default:
      return null
  }
}
