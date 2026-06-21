import type { AdminState, AdminAction, CmsJob } from '../types'

const MAX_JOBS = 100

function nanoid(): string {
  return crypto.randomUUID().replace(/-/g, '')
}

export function jobsReducer(state: AdminState, action: AdminAction): AdminState | null {
  switch (action.type) {
    case 'JOB_ADD': {
      const job: CmsJob = {
        ...action.payload,
        id: nanoid(),
        createdAt: new Date().toISOString(),
        attempts: 0,
      }
      return {
        ...state,
        jobQueue: [job, ...(state.jobQueue ?? [])].slice(0, MAX_JOBS),
      }
    }

    case 'JOB_UPDATE': {
      return {
        ...state,
        jobQueue: (state.jobQueue ?? []).map(j =>
          j.id === action.payload.id ? { ...j, ...action.payload.data } : j,
        ),
      }
    }

    case 'JOB_CANCEL': {
      return {
        ...state,
        jobQueue: (state.jobQueue ?? []).map(j =>
          j.id === action.payload && j.status === 'pending'
            ? { ...j, status: 'cancelled' as const, completedAt: new Date().toISOString() }
            : j,
        ),
      }
    }

    case 'JOB_CLEAR_DONE': {
      return {
        ...state,
        jobQueue: (state.jobQueue ?? []).filter(j => j.status === 'pending' || j.status === 'running'),
      }
    }

    default:
      return null
  }
}
