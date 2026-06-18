/**
 * Content-specific export/import utilities.
 * Exports only the content registries + taxonomy from AdminState — excludes
 * design, site config, and integrations (especially deployHookUrl).
 */
import { z } from 'zod'
import { TagSchema, CategorySchema, MediaItemSchema, ContentRevisionSchema, SeriesSchema } from '@/lib/admin/schema'
import { ProjectEntrySchema, ResearchEntrySchema, LabEntrySchema, SystemEntrySchema } from '@/lib/admin/schema'
import type { AdminState } from '@/lib/admin/types'
import { validateProject, validateResearch } from './validation'

// ─── Bundle schema ────────────────────────────────────────────────────────────

export const ContentBundleSchema = z.object({
  exportedAt:       z.string(),
  version:          z.literal('1.0'),
  projectsRegistry: z.array(ProjectEntrySchema).optional(),
  researchRegistry: z.array(ResearchEntrySchema).optional(),
  labsRegistry:     z.array(LabEntrySchema).optional(),
  systemsRegistry:  z.array(SystemEntrySchema).optional(),
  tagRegistry:      z.array(TagSchema).optional(),
  categoryRegistry: z.array(CategorySchema).optional(),
  mediaRegistry:    z.array(MediaItemSchema).optional(),
  seriesRegistry:   z.array(SeriesSchema).optional(),
  revisionLog:      z.array(ContentRevisionSchema).optional(),
})

export type ContentBundle = z.infer<typeof ContentBundleSchema>

// ─── Validation report ────────────────────────────────────────────────────────

export interface ValidationReport {
  projects: { id: string; title: string; errors: string[] }[]
  research: { slug: string; title: string; errors: string[] }[]
  totalIssues: number
}

export function buildValidationReport(state: AdminState): ValidationReport {
  const projects = state.projectsRegistry
    .map(p => ({ id: p.id, title: p.title, errors: validateProject(p).errors.map(e => `${e.field}: ${e.message}`) }))
    .filter(p => p.errors.length > 0)

  const research = state.researchRegistry
    .map(r => ({ slug: r.slug, title: r.title, errors: validateResearch(r).errors.map(e => `${e.field}: ${e.message}`) }))
    .filter(r => r.errors.length > 0)

  return { projects, research, totalIssues: projects.length + research.length }
}

// ─── Export ───────────────────────────────────────────────────────────────────

export function exportContentBundle(state: AdminState): ContentBundle {
  return {
    exportedAt:       new Date().toISOString(),
    version:          '1.0',
    projectsRegistry: state.projectsRegistry,
    researchRegistry: state.researchRegistry,
    labsRegistry:     state.labsRegistry,
    systemsRegistry:  state.systemsRegistry,
    tagRegistry:      state.tagRegistry,
    categoryRegistry: state.categoryRegistry,
    mediaRegistry:    state.mediaRegistry,
    seriesRegistry:   state.seriesRegistry,
    revisionLog:      state.revisionLog,
  }
}

export function downloadContentBundle(state: AdminState): { ok: boolean; validationWarnings: number } {
  const report = buildValidationReport(state)
  const bundle = exportContentBundle(state)
  const json   = JSON.stringify(bundle, null, 2)
  const blob   = new Blob([json], { type: 'application/json' })
  const url    = URL.createObjectURL(blob)
  const a      = document.createElement('a')
  a.href       = url
  a.download   = `jootacee-content-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
  return { ok: true, validationWarnings: report.totalIssues }
}

// ─── Backup ───────────────────────────────────────────────────────────────────

const BACKUP_KEY_PREFIX = 'jootacee-content-backup-'

export function backupCurrentState(state: AdminState): string {
  const ts = new Date().toISOString()
  const key = `${BACKUP_KEY_PREFIX}${ts}`
  try {
    const bundle = exportContentBundle(state)
    localStorage.setItem(key, JSON.stringify(bundle))
  } catch {
    // Storage quota exceeded — skip silently
  }
  return key
}

export function listBackups(): string[] {
  const keys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k?.startsWith(BACKUP_KEY_PREFIX)) keys.push(k)
  }
  return keys.sort().reverse()
}

// ─── Import ───────────────────────────────────────────────────────────────────

export interface ImportResult {
  ok:                  boolean
  bundle:              ContentBundle | null
  error:               string | null
  backupKey:           string | null
  validationWarnings:  number
}

export function parseAndImportBundle(raw: unknown, currentState: AdminState): ImportResult {
  const result = ContentBundleSchema.safeParse(raw)
  if (!result.success) {
    return { ok: false, bundle: null, error: result.error.issues.map(i => i.message).join('; '), backupKey: null, validationWarnings: 0 }
  }

  // Backup before import so nothing is lost
  const backupKey = backupCurrentState(currentState)

  // Count validation issues in the incoming bundle
  const incoming = result.data
  let warnings = 0
  incoming.projectsRegistry?.forEach(p => { if (!validateProject(p).valid) warnings++ })
  incoming.researchRegistry?.forEach(r => { if (!validateResearch(r).valid) warnings++ })

  return { ok: true, bundle: result.data, error: null, backupKey, validationWarnings: warnings }
}

// ─── Legacy alias kept for backward compat ────────────────────────────────────

export function parseContentBundle(raw: unknown): { ok: boolean; bundle: ContentBundle | null; error: string | null } {
  const result = ContentBundleSchema.safeParse(raw)
  if (!result.success) {
    return { ok: false, bundle: null, error: result.error.issues.map(i => i.message).join('; ') }
  }
  return { ok: true, bundle: result.data, error: null }
}
