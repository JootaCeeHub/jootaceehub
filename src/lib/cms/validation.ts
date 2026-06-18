/**
 * Per-type content validation for CMS Phase 3.
 * Uses Zod schemas from lib/admin/schema.ts for structural validation,
 * plus semantic rules (e.g. description length, required URLs).
 */
import { ProjectEntrySchema, ResearchEntrySchema, LabEntrySchema, SystemEntrySchema } from '@/lib/admin/schema'
import type { ProjectEntry, ResearchEntry } from '@/lib/admin/types'

export interface FieldError {
  field: string
  message: string
}

export interface ValidationResult {
  valid: boolean
  errors: FieldError[]
}

// ─── Project validation ───────────────────────────────────────────────────────

export function validateProject(p: ProjectEntry): ValidationResult {
  const errors: FieldError[] = []

  const schema = ProjectEntrySchema.safeParse(p)
  if (!schema.success) {
    schema.error.issues.forEach(issue => {
      errors.push({ field: issue.path.join('.') || 'root', message: issue.message })
    })
  }

  if (!p.title || p.title.trim().length < 2) errors.push({ field: 'title', message: 'Title must be at least 2 characters' })
  if (!p.description || p.description.trim().length < 20) errors.push({ field: 'description', message: 'Description must be at least 20 characters' })
  if (!p.repoUrl && !p.liveUrl) errors.push({ field: 'repoUrl', message: 'At least one of repoUrl or liveUrl is required' })
  if (!p.techStack || p.techStack.length === 0) errors.push({ field: 'techStack', message: 'At least one tech stack item is required' })
  if (!p.slug || !/^[a-z0-9-]+$/.test(p.slug)) errors.push({ field: 'slug', message: 'Slug must be lowercase letters, numbers, and hyphens only' })

  const unique = dedupeErrors(errors)
  return { valid: unique.length === 0, errors: unique }
}

// ─── Research validation ──────────────────────────────────────────────────────

export function validateResearch(r: ResearchEntry): ValidationResult {
  const errors: FieldError[] = []

  const schema = ResearchEntrySchema.safeParse(r)
  if (!schema.success) {
    schema.error.issues.forEach(issue => {
      errors.push({ field: issue.path.join('.') || 'root', message: issue.message })
    })
  }

  if (!r.title || r.title.trim().length < 2) errors.push({ field: 'title', message: 'Title must be at least 2 characters' })
  if (!r.excerpt || r.excerpt.trim().length < 20) errors.push({ field: 'excerpt', message: 'Excerpt must be at least 20 characters' })
  if (!r.tags || r.tags.length === 0) errors.push({ field: 'tags', message: 'At least one tag is required' })
  if (r.published && (!r.body || r.body.trim().length < 50)) {
    errors.push({ field: 'body', message: 'Body must be at least 50 characters when published' })
  }

  const unique = dedupeErrors(errors)
  return { valid: unique.length === 0, errors: unique }
}

// ─── Lab validation ───────────────────────────────────────────────────────────

export function validateLab(l: unknown): ValidationResult {
  const result = LabEntrySchema.safeParse(l)
  if (!result.success) {
    return {
      valid: false,
      errors: result.error.issues.map(i => ({ field: i.path.join('.') || 'root', message: i.message })),
    }
  }
  return { valid: true, errors: [] }
}

// ─── System validation ────────────────────────────────────────────────────────

export function validateSystem(s: unknown): ValidationResult {
  const result = SystemEntrySchema.safeParse(s)
  if (!result.success) {
    return {
      valid: false,
      errors: result.error.issues.map(i => ({ field: i.path.join('.') || 'root', message: i.message })),
    }
  }
  return { valid: true, errors: [] }
}

// ─── Utils ────────────────────────────────────────────────────────────────────

function dedupeErrors(errors: FieldError[]): FieldError[] {
  const seen = new Set<string>()
  return errors.filter(e => {
    const key = `${e.field}:${e.message}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/** Returns the first error for a given field, or undefined. */
export function fieldError(result: ValidationResult, field: string): string | undefined {
  return result.errors.find(e => e.field === field)?.message
}
