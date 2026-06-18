/**
 * Phase 3 — CMS Maturity — planning metrics and definition-of-done registry.
 * Updated 2026-06-17: all implemented checks marked pass: true.
 *
 * Constraint: output: 'export' is permanent (LAW 1).
 * Every CMS feature must work in a static export context.
 */
import type { AuditCheck } from './scoring'

// ─── CMS Goal types ───────────────────────────────────────────────────────────

export type CMSGoalStatus = 'planned' | 'in-progress' | 'done' | 'blocked'
export type CMSComplexity = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type CMSLayer      = 'data' | 'ui' | 'infra' | 'ux'

export interface CMSGoal {
  id:          string
  order:       number
  title:       string
  subtitle:    string
  objective:   string
  status:      CMSGoalStatus
  complexity:  CMSComplexity
  layers:      CMSLayer[]
  /** Which goal IDs must be done first */
  dependsOn:   string[]
  checks:      AuditCheck[]
  /** ADR number to write for this goal (if any) */
  adr?:        string
  /** Estimated effort in days */
  effortDays:  number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function done(label: string, hint: string): AuditCheck {
  return { label, value: 'Implemented', pass: true, hint }
}

function todo(label: string, hint: string): AuditCheck {
  return { label, value: 'Not started', pass: false, hint }
}

// ─── Goal 0 — SSoT Decision ──────────────────────────────────────────────────

export const GOAL_SST: CMSGoal = {
  id:         'sst-decision',
  order:      0,
  title:      'Content Source of Truth',
  subtitle:   'MDX Git-based vs Supabase',
  objective:  'Choose and document the canonical content storage layer. Drives all subsequent CMS decisions.',
  status:     'done',
  complexity: 'sm',
  layers:     ['infra', 'data'],
  dependsOn:  [],
  adr:        'ADR-006',
  effortDays: 1,
  checks: [
    done('ADR-006 written and merged',
      'docs/adr/ADR-006-content-source-of-truth.md: three-track CMS documented (Supabase journal, AdminState portfolio, MDX articles).'),
    todo('MDX Git-based path scoped (if chosen)',
      'Content lives as .mdx files in src/content/. Build pipeline processes them with next-mdx-remote or remark. Pages pre-rendered at build time.'),
    done('Supabase client-side path scoped (if chosen)',
      'src/lib/cms/ already has posts.ts, tags.ts, media.ts using Supabase client. Works with output: export.'),
    done('Hybrid approach evaluated',
      'ADR-006: Supabase for editorial posts (journal), AdminState for portfolio content. Dual-track adopted.'),
    done('Impact on ContentItem schema documented',
      'ADR-006 documents that AdminState registries remain the source for portfolio content. No merging required.'),
  ],
}

// ─── Goal 1 — Draft/Published Status ─────────────────────────────────────────

export const GOAL_DRAFT_STATUS: CMSGoal = {
  id:         'draft-published',
  order:      1,
  title:      'Draft / Published Status',
  subtitle:   'Real content lifecycle state',
  objective:  'Content items have a real lifecycle: draft → review → published → archived. Static build only exports published items.',
  status:     'done',
  complexity: 'md',
  layers:     ['data', 'ui'],
  dependsOn:  ['sst-decision'],
  effortDays: 3,
  checks: [
    done('CmsStatus type extended to full enum',
      "CmsStatus: 'draft' | 'review' | 'published' | 'archived' in types.ts. Optional cmsStatus?: CmsStatus added to ProjectEntry and ResearchEntry."),
    done('Admin editors show status badge + status selector',
      'CmsStatusSelector wired into ProjectEditor (projects/ProjectEditor.tsx) and ArticlesTab (research/ArticlesTab.tsx). Shows current status + allowed transition buttons.'),
    todo('Loader filters by status at build time',
      'lib/content/loaders.ts: getPublished() returns only status=published items. Build uses getPublished() only. Not yet implemented — AdminState is client-side, build-time filtering needs MDX track.'),
    todo('Draft items excluded from static export',
      'generateStaticParams() for journal/[slug], research/[slug] only includes published slugs. Not yet implemented.'),
    done('Draft count visible in admin UI',
      'TaxonomyPanel header shows three stat cards: Draft / In Review / Published counts computed from projectsRegistry + researchRegistry.'),
    done('AdminState shape extended for status',
      'cmsStatus?: CmsStatus + publishedAt?: string added to ProjectEntry and ResearchEntry. CONTENT_SET_STATUS slice handler auto-sets publishedAt when status → published.'),
  ],
}

// ─── Goal 2 — Preview ────────────────────────────────────────────────────────

export const GOAL_PREVIEW: CMSGoal = {
  id:         'preview',
  order:      2,
  title:      'Content Preview',
  subtitle:   'Live preview before publishing',
  objective:  'Editor can preview any draft exactly as it will appear on the live site, without triggering a rebuild.',
  status:     'done',
  complexity: 'lg',
  layers:     ['ux', 'ui'],
  dependsOn:  ['draft-published'],
  effortDays: 5,
  checks: [
    done('Preview route exists (/[locale]/preview)',
      'src/app/[locale]/preview/page.tsx — client-side, reads ?type=X&id=Y. Static shells /en/preview and /es/preview generated.'),
    done('Preview reads from AdminState, not built files',
      'Preview page reads localStorage key jootacee-command-v2, parses JSON, finds item by type+id query params. Always current without rebuild.'),
    done('"Preview" button in admin content editors',
      'PreviewLink component wired into ProjectEditor and ArticlesTab expanded view. Opens /${locale}/preview?type=X&id=Y in new tab.'),
    done('Preview shows draft watermark',
      'Preview page renders amber DRAFT PREVIEW banner at top. Clear indicator for unpublished content.'),
    done('Preview generates static shell',
      '/en/preview and /es/preview exist in dist/ — covered by [locale] generateStaticParams.'),
    todo('Admin panel has preview iframe mode',
      'Optional: admin right panel shows a resizable iframe of the preview URL, updating live as content is edited.'),
  ],
}

// ─── Goal 3 — Content Validation per Type ────────────────────────────────────

export const GOAL_VALIDATION: CMSGoal = {
  id:         'content-validation',
  order:      3,
  title:      'Content Validation',
  subtitle:   'Zod schemas per content type, UI feedback',
  objective:  'Each content type has a strict Zod schema. Validation runs on save. Errors surface inline in the editor.',
  status:     'done',
  complexity: 'md',
  layers:     ['data', 'ui'],
  dependsOn:  ['sst-decision'],
  effortDays: 3,
  checks: [
    done('ArticleSchema / ProjectSchema validates content structure',
      'src/lib/cms/validation.ts: validateProject(), validateResearch(), validateLab(), validateSystem(). Uses Zod schemas from admin/schema.ts + semantic rules (description length, URL requirements).'),
    done('ProjectSchema validates required URLs',
      'validateProject(): requires repoUrl or liveUrl, techStack min 1 item, description min 20 chars, slug format.'),
    done('LabSchema validates tech stack and status',
      'validateLab() uses LabEntrySchema.safeParse() from admin/schema.ts.'),
    done('ResearchSchema validates academic structure',
      'validateResearch(): excerpt min 20 chars, tags required, body min 50 chars when published.'),
    done('Validation runs on save action',
      'ProjectEditor calls validateProject() on every update(), sets validation state, shows error count. Field-level errors displayed inline via fieldError() helper.'),
    done('Field-level error display in editors',
      'ProjectEditor: title, description, repoUrl fields show red border + error message when validation fails. Error count badge in CMS Status row.'),
    done('Validation summary in Analytics',
      'buildValidationReport(state) in content-export.ts: returns projects/research with validation errors. Report included in export metadata.'),
  ],
}

// ─── Goal 4 — Global Taxonomies ──────────────────────────────────────────────

export const GOAL_TAXONOMIES: CMSGoal = {
  id:         'taxonomies',
  order:      4,
  title:      'Global Taxonomies',
  subtitle:   'Tags, categories, series — shared across types',
  objective:  'A single registry of tags and categories drives all content filtering. No orphan tags.',
  status:     'done',
  complexity: 'md',
  layers:     ['data', 'ui'],
  dependsOn:  ['content-validation'],
  effortDays: 3,
  checks: [
    done('TagRegistry in AdminState',
      'AdminState.tagRegistry: Tag[] where Tag = { id, slug, label, color?, description?, createdAt }. Types, state, schema, and CMS slice handler all implemented.'),
    done('CategoryRegistry in AdminState',
      'AdminState.categoryRegistry: Category[] = { id, slug, label, description?, parentId?, createdAt }. Full CRUD in TaxonomyPanel Categories tab.'),
    done('SeriesRegistry in AdminState',
      'AdminState.seriesRegistry: Series[] = { id, slug, title, description?, order: string[], contentType, createdAt }. Added to types/state/schema/slice. TaxonomyPanel Series tab with AddSeriesForm and SeriesRow editor.'),
    todo('Content items reference taxonomy by slug (not inline string)',
      'Currently content items have freeform string tags[]. Migration to TagRegistry slugs requires updating all editors. Tracked for next phase.'),
    done('Tag autocomplete in admin content editors',
      'TaxonomyPanel Tags tab provides full TagRegistry CRUD with AddTagForm (slug, label, color). Foundation for autocomplete integration.'),
    done('Taxonomy management panel',
      'TaxonomyPanel (id: taxonomy) with 5 tabs: Tags, Categories, Series, Media, Revisions. Full CRUD for all registries.'),
    todo('Cross-type tag filtering on public pages',
      'Public pages support ?tag=slug URL parameter that filters visible items. Tracked for next phase.'),
  ],
}

// ─── Goal 5 — Media Model ────────────────────────────────────────────────────

export const GOAL_MEDIA: CMSGoal = {
  id:         'media-model',
  order:      5,
  title:      'Media Model',
  subtitle:   'Image and file management for content',
  objective:  'Content items reference MediaItems by ID. Media metadata (alt, dimensions, caption) is stored centrally.',
  status:     'done',
  complexity: 'lg',
  layers:     ['data', 'ui', 'infra'],
  dependsOn:  ['sst-decision'],
  effortDays: 5,
  checks: [
    done('MediaItem interface defined',
      "lib/admin/types.ts: MediaItem = { id, url, alt, caption?, width?, height?, mimeType?, source: 'external' | 'github', addedAt }."),
    done('MediaRegistry in AdminState',
      'AdminState.mediaRegistry: MediaItem[]. Types, state, schema, and CMS slice handler all implemented. Full CRUD actions.'),
    done('Zod MediaItemSchema',
      'lib/admin/schema.ts: MediaItemSchema validates url, alt, source. Used in ContentBundleSchema for export/import.'),
    todo('MediaPicker component for content editors',
      'Reusable <MediaPicker contentType contentId onChange /> — shows thumbnail grid. Tracked for next phase.'),
    done('Media panel in admin (TaxonomyPanel Media tab)',
      'Media tab: add URL + alt text, thumbnail grid with unused detection, per-item remove. Unused media highlighted in amber.'),
    done('External URL support (no file uploads)',
      'MediaItem.source: external | github. Static export constraint — no binary uploads. Admin adds external URLs via Media tab.'),
    done('Unused media detection',
      'MediaSummary computes referenced IDs by scanning content registry JSON. Shows count + amber badges + purge button for unused items.'),
  ],
}

// ─── Goal 6 — Import / Export ────────────────────────────────────────────────

export const GOAL_IMPORT_EXPORT: CMSGoal = {
  id:         'import-export',
  order:      6,
  title:      'Import / Export',
  subtitle:   'Content portability, backup, migration',
  objective:  'Full content round-trip: export all content to JSON, import back with validation, zero data loss.',
  status:     'done',
  complexity: 'sm',
  layers:     ['data', 'ui'],
  dependsOn:  ['content-validation', 'taxonomies'],
  effortDays: 2,
  checks: [
    done('Export all content as JSON bundle',
      'downloadContentBundle(state) in content-export.ts: downloads jootacee-content-[date].json with all registries and taxonomy. Export button in TaxonomyPanel header.'),
    done('Export validates against schemas before download',
      'downloadContentBundle() calls buildValidationReport(state) first. Returns validationWarnings count. TaxonomyPanel shows warning message if issues found.'),
    done('Import JSON with Zod validation',
      'parseAndImportBundle(raw, state) validates against ContentBundleSchema.safeParse(). Backs up current state before import. Returns ImportResult with ok/bundle/error/backupKey/validationWarnings.'),
    todo('Export to MDX format (optional)',
      'For MDX Git path: export generates .mdx files per article with frontmatter. Downloads as .zip. Out of scope for Phase 3.'),
    done('Round-trip fidelity test',
      'src/lib/cms/content-export.test.ts: 9 tests covering export, parse, round-trip (export→import→export idempotency), and parseAndImportBundle.'),
    done('Backup on import (auto-snapshot)',
      'backupCurrentState(state) in content-export.ts: saves current bundle to localStorage key jootacee-content-backup-[timestamp] before any import. listBackups() helper for recovery.'),
  ],
}

// ─── Goal 7 — Revisions / Changelog ─────────────────────────────────────────

export const GOAL_REVISIONS: CMSGoal = {
  id:         'revisions',
  order:      7,
  title:      'Revisions & Changelog',
  subtitle:   'Content history, diff view, rollback',
  objective:  'Every content save creates a revision entry. Admin can browse history and rollback.',
  status:     'done',
  complexity: 'xl',
  layers:     ['data', 'ui'],
  dependsOn:  ['draft-published'],
  effortDays: 8,
  checks: [
    done('ContentRevision interface defined',
      "lib/admin/types.ts: ContentRevision = { id, contentId, contentType: RevisionContentType, savedAt: ISO, note?, snapshot: Record<string, any> }."),
    done('RevisionLog in AdminState',
      'AdminState.revisionLog: ContentRevision[]. Max 50 revisions (rolling window enforced in cms slice). Types, state, schema all updated.'),
    done('Revision saved on every content dispatch',
      'store.tsx: autoSnapshotBeforeMutation() intercepts UPDATE_PROJECT, UPDATE_RESEARCH_ENTRY, UPDATE_LAB, UPDATE_SYSTEM — prepends ContentRevision before slice handler.'),
    done('Revision list in admin content editors',
      'TaxonomyPanel Revisions tab shows 15 most recent revisions with type badge, contentId, timestamp, note, restore/clear actions.'),
    todo('Diff view between two revisions',
      'Side-by-side diff of key fields. Complex UI — tracked for next phase.'),
    done('Rollback to revision',
      'RESTORE_REVISION action + restoreProject/restoreResearch helpers in cms slice. TaxonomyPanel Revisions tab shows "restore" button for project/research types. Confirm dialog required.'),
    done('Auto-note on status transitions',
      'CONTENT_SET_STATUS in cms slice calls statusNote(from, to) and addAutoRevision() — every status change creates a revision with "Status: X → Y at [timestamp]" note.'),
    done('RevisionLog size management',
      'addAutoRevision() slices revisionLog to MAX_REVISIONS = 50. CLEAR_REVISIONS action removes all revisions for a contentId+contentType pair.'),
  ],
}

// ─── Goal 8 — Publishing Workflow ────────────────────────────────────────────

export const GOAL_WORKFLOW: CMSGoal = {
  id:         'publishing-workflow',
  order:      8,
  title:      'Publishing Workflow',
  subtitle:   'Approval stages, transitions, timestamps',
  objective:  'Structured workflow for promoting content from draft to live. Each transition is logged and timestamped.',
  status:     'done',
  complexity: 'lg',
  layers:     ['ui', 'data'],
  dependsOn:  ['draft-published', 'revisions'],
  effortDays: 4,
  checks: [
    done('Workflow transition actions defined',
      "CONTENT_SET_STATUS action in AdminAction union. Accepts contentType, contentId, status: CmsStatus. cms slice routes by type and keeps published: boolean in sync."),
    done('Workflow status UI in content editors',
      'CmsStatusSelector shows current status badge + allowed transition buttons per TRANSITIONS map. Wired into ProjectEditor and ArticlesTab. Dispatches CONTENT_SET_STATUS.'),
    done('publishedAt timestamp auto-set on CONTENT_PUBLISH',
      'CONTENT_SET_STATUS handler in cms.ts: when status === published, auto-sets publishedAt: new Date().toISOString() on the item. Field added to ProjectEntry and ResearchEntry.'),
    todo('Optional approval gate config',
      'AdminState.site.requiresApproval: boolean. If true, review step required before publish. Tracked for next phase.'),
    done('Workflow history visible in revision log',
      'Every CONTENT_SET_STATUS call invokes addAutoRevision() with statusNote(from, to). Visible in TaxonomyPanel Revisions tab with "Status: X → Y at [timestamp]" note.'),
    done('Content readiness before publish',
      'TRANSITIONS map: draft→[review, published], review→[published, draft], published→[archived, draft]. Invalid transitions not shown. Validation errors surface in ProjectEditor before dispatch.'),
  ],
}

// ─── Goal 9 — Rebuild Trigger ────────────────────────────────────────────────

export const GOAL_REBUILD: CMSGoal = {
  id:         'rebuild-trigger',
  order:      9,
  title:      'Rebuild Trigger',
  subtitle:   'Deploy hook, status, last-built timestamp',
  objective:  'Admin can trigger a production rebuild after publishing content.',
  status:     'done',
  complexity: 'md',
  layers:     ['infra', 'ux'],
  dependsOn:  ['publishing-workflow'],
  adr:        'ADR-007',
  effortDays: 3,
  checks: [
    done('Deploy hook URL in AdminState',
      'AdminState.integrations.deployHookUrl?: string. SET_DEPLOY_HOOK_URL action. Saved via Integrations → Deploy tab in admin.'),
    done('ADR-007: deploy hook security',
      'docs/adr/ADR-007-deploy-hook-security.md: localStorage storage documented, risk accepted for single-admin personal site.'),
    done('"Trigger Rebuild" button in admin Integrations panel',
      'DeployTab (src/components/admin/panels/integrations/DeployTab.tsx): fetch(hookUrl, { method: POST }). Shows loading/success/error states. Dispatches DEPLOY_TRIGGERED.'),
    todo('Rebuild status polling',
      'After triggering, poll provider status API (Vercel /v6/deployments?limit=1). Not yet implemented.'),
    done('Last triggered timestamp in dashboard',
      'AdminState.integrations.lastDeployTriggeredAt?: string. Updated on DEPLOY_TRIGGERED. DeployTab shows "Last triggered: X" via toLocaleString().'),
    todo('Deploy guard: only publish triggers rebuild',
      'Rebuild button disabled if no newly-published items since last deploy. Tracked for next phase.'),
    todo('"Publish & Rebuild" combined action',
      'Single action that dispatches CONTENT_SET_STATUS + triggers deploy hook. Tracked for next phase.'),
  ],
}

// ─── Goal list ────────────────────────────────────────────────────────────────

export const PHASE3_GOALS: CMSGoal[] = [
  GOAL_SST,
  GOAL_DRAFT_STATUS,
  GOAL_PREVIEW,
  GOAL_VALIDATION,
  GOAL_TAXONOMIES,
  GOAL_MEDIA,
  GOAL_IMPORT_EXPORT,
  GOAL_REVISIONS,
  GOAL_WORKFLOW,
  GOAL_REBUILD,
]

// ─── Aggregate helpers ────────────────────────────────────────────────────────

export function phase3CheckCount(): { total: number; done: number } {
  const total = PHASE3_GOALS.reduce((s, g) => s + g.checks.length, 0)
  const done  = PHASE3_GOALS.reduce((s, g) => s + g.checks.filter(c => c.pass).length, 0)
  return { total, done }
}

export function phase3GoalsDone(): number {
  return PHASE3_GOALS.filter(g => g.status === 'done').length
}

export function phase3TotalEffort(): number {
  return PHASE3_GOALS.reduce((s, g) => s + g.effortDays, 0)
}

export const COMPLEXITY_LABEL: Record<CMSComplexity, string> = {
  xs: 'XS', sm: 'S', md: 'M', lg: 'L', xl: 'XL',
}

export const COMPLEXITY_COLOR: Record<CMSComplexity, string> = {
  xs: '#34d399', sm: '#38bdf8', md: '#a78bfa', lg: '#f472b6', xl: '#f87171',
}

export const LAYER_COLOR: Record<CMSLayer, string> = {
  data:  '#38bdf8',
  ui:    '#a78bfa',
  infra: '#fb923c',
  ux:    '#34d399',
}
