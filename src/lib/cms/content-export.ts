/**
 * Content-specific export/import utilities.
 * Exports only the content registries + taxonomy from AdminState — excludes
 * design, site config, and integrations (especially deployHookUrl).
 */
import { z } from 'zod'
import { TagSchema, CategorySchema, MediaItemSchema, ContentRevisionSchema } from '@/lib/admin/schema'
import { ProjectEntrySchema, ResearchEntrySchema, LabEntrySchema, SystemEntrySchema } from '@/lib/admin/schema'
import type { AdminState } from '@/lib/admin/types'

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
  revisionLog:      z.array(ContentRevisionSchema).optional(),
})

export type ContentBundle = z.infer<typeof ContentBundleSchema>

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
    revisionLog:      state.revisionLog,
  }
}

export function downloadContentBundle(state: AdminState): void {
  const bundle = exportContentBundle(state)
  const json   = JSON.stringify(bundle, null, 2)
  const blob   = new Blob([json], { type: 'application/json' })
  const url    = URL.createObjectURL(blob)
  const a      = document.createElement('a')
  a.href       = url
  a.download   = `jootacee-content-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Import ───────────────────────────────────────────────────────────────────

export interface ImportResult {
  ok:     boolean
  bundle: ContentBundle | null
  error:  string | null
}

export function parseContentBundle(raw: unknown): ImportResult {
  const result = ContentBundleSchema.safeParse(raw)
  if (!result.success) {
    return { ok: false, bundle: null, error: result.error.issues.map(i => i.message).join('; ') }
  }
  return { ok: true, bundle: result.data, error: null }
}
