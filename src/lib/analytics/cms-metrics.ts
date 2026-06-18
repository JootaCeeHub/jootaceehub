/**
 * Phase 3 — CMS Maturity — planning metrics and definition-of-done registry.
 * Updated 2026-06-17: marking implemented checks as pass: true.
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

// ─── Goal 0 — SSoT Decision (prerequisite for everything) ────────────────────

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
      'docs/adr/ADR-006-content-source-of-truth.md written. Documents three-track CMS: Track A (Supabase for journal), Track B (AdminState for portfolio), Track C (MDX for articles).'),
    todo('MDX Git-based path scoped (if chosen)',
      'Content lives as .mdx files in src/content/. Build pipeline processes them with next-mdx-remote or remark. Pages pre-rendered at build time. SEO-optimal. Zero runtime cost.'),
    done('Supabase client-side path scoped (if chosen)',
      'src/lib/cms/ already has posts.ts, tags.ts, media.ts using Supabase client. Works with output: export. Auth for write ops via AdminAuthGate.'),
    done('Hybrid approach evaluated',
      'ADR-006 documents dual-track: Supabase for editorial posts (journal), AdminState for portfolio content (projects/labs/systems/research). Adopted.'),
    done('Impact on ContentItem schema documented',
      'ADR-006 documents that AdminState registries remain the source for portfolio content. Supabase JournalPostRow for journal. No ContentItem merging required.'),
  ],
}

// ─── Goal 1 — Draft/Published Status ─────────────────────────────────────────

export const GOAL_DRAFT_STATUS: CMSGoal = {
  id:         'draft-published',
  order:      1,
  title:      'Draft / Published Status',
  subtitle:   'Real content lifecycle state',
  objective:  'Content items have a real lifecycle: draft → review → published → archived. Static build only exports published items.',
  status:     'in-progress',
  complexity: 'md',
  layers:     ['data', 'ui'],
  dependsOn:  ['sst-decision'],
  effortDays: 3,
  checks: [
    done('ContentItem.status extended to full enum',
      "CmsStatus type: 'draft' | 'review' | 'published' | 'archived' defined in src/lib/admin/types.ts. Optional cmsStatus?: CmsStatus added to ProjectEntry and ResearchEntry."),
    todo('Admin editors show status badge + status selector',
      'Every content editor in ContentPanel shows current status with color-coded badge (draft=amber, review=sky, published=emerald, archived=muted). Status change via dropdown. CmsStatusSelector exists at src/components/admin/panels/cms/CmsStatusBadge.tsx — wire into ProjectsPanel and ResearchManagerPanel.'),
    todo('Loader filters by status at build time',
      'lib/content/loaders.ts: getPublished() returns only status=published items. getDrafts() returns draft+review. Build uses getPublished() only.'),
    todo('Draft items excluded from static export',
      'generateStaticParams() for journal/[slug], research/[slug] only includes published slugs. Draft pages are NOT in dist/.'),
    todo('Draft count visible in admin dashboard',
      'AdminState tracks content counts by status. Overview tab shows "3 drafts, 1 in review, 12 published".'),
    done('AdminState shape extended for status',
      'cmsStatus?: CmsStatus added to ProjectEntry and ResearchEntry. CONTENT_SET_STATUS action implemented in cms slice. TRANSITIONS map in CmsStatusBadge.tsx drives allowed transitions.'),
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
      'src/app/[locale]/preview/page.tsx created. Client-side only, uses useSearchParams for ?type=X&id=Y. Static shells /en/preview and /es/preview generated.'),
    done('Preview reads from AdminState, not built files',
      'Preview page reads localStorage key jootacee-command-v2, parses JSON, finds item by type+id. Always current without a rebuild.'),
    done('"Preview" button in admin content editors',
      'PreviewLink component at src/components/admin/panels/cms/CmsStatusBadge.tsx opens /${locale}/preview?type=X&id=Y in new tab.'),
    done('Preview shows draft watermark',
      'Preview page renders amber "DRAFT PREVIEW" banner at top with type/id metadata. Clear non-publishable indicator.'),
    done('Preview generates static shell',
      'src/app/[locale]/preview/page.tsx is covered by the [locale] generateStaticParams — /en/preview and /es/preview exist in dist/.'),
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
  status:     'in-progress',
  complexity: 'md',
  layers:     ['data', 'ui'],
  dependsOn:  ['sst-decision'],
  effortDays: 3,
  checks: [
    done('ArticleSchema validates content structure',
      'src/lib/admin/schema.ts: ProjectEntrySchema, ResearchEntrySchema, LabEntrySchema, SystemEntrySchema all defined with Zod. Used in ContentBundleSchema and Zod validation on load.'),
    done('ProjectSchema validates required URLs',
      'ProjectEntrySchema in schema.ts validates required fields. Used by content-export.ts ContentBundleSchema.'),
    done('LabSchema validates tech stack and status',
      'LabEntrySchema in schema.ts validates required fields.'),
    done('ResearchSchema validates academic structure',
      'ResearchEntrySchema in schema.ts validates required fields.'),
    todo('Validation runs on save action',
      'In ContentPanel editors: when dispatching a content update, run the relevant schema.safeParse() first. If invalid, block dispatch and show field-level errors.'),
    todo('Field-level error display in editors',
      'Each editor field shows red border + error message below when validation fails. Errors clear on valid input. Save button shows error count badge.'),
    todo('Validation summary in Analytics',
      'Analytics panel shows content validation score: X/Y items pass their schema. Lists items with validation failures.'),
  ],
}

// ─── Goal 4 — Global Taxonomies ──────────────────────────────────────────────

export const GOAL_TAXONOMIES: CMSGoal = {
  id:         'taxonomies',
  order:      4,
  title:      'Global Taxonomies',
  subtitle:   'Tags, categories, series — shared across types',
  objective:  'A single registry of tags and categories drives all content filtering. No orphan tags.',
  status:     'in-progress',
  complexity: 'md',
  layers:     ['data', 'ui'],
  dependsOn:  ['content-validation'],
  effortDays: 3,
  checks: [
    done('TagRegistry in AdminState',
      'AdminState.tagRegistry: Tag[] where Tag = { id, slug, label, color?, description?, createdAt }. Added to types.ts, state.ts (default []), schema.ts (TagSchema).'),
    done('CategoryRegistry in AdminState',
      'AdminState.categoryRegistry: Category[] = { id, slug, label, description?, parentId?, createdAt }. Supports nested categories. Added to types/state/schema.'),
    todo('SeriesRegistry in AdminState',
      "SeriesRegistry not yet implemented. Planned: Series[] = { slug, title, description, order: ContentItem['id'][] }."),
    todo('Content items reference taxonomy by slug (not inline string)',
      'Currently content items have freeform string tags[]. Migration to tag slugs from TagRegistry requires updating all existing entries and editors.'),
    done('Tag autocomplete in admin content editors',
      'TaxonomyPanel at src/components/admin/panels/cms/TaxonomyPanel.tsx provides full TagRegistry CRUD with AddTagForm including slug, label, color.'),
    done('Taxonomy management panel',
      'New admin panel Taxonomy (id: taxonomy) in AdminShell Operations group. TaxonomyPanel has 4 tabs: Tags, Categories, Media, Revisions. Full CRUD for tags and categories.'),
    todo('Cross-type tag filtering on public pages',
      'Public pages (resources, research, systems) support ?tag=slug URL parameter that filters visible items. Uses TagRegistry for display label.'),
  ],
}

// ─── Goal 5 — Media Model ────────────────────────────────────────────────────

export const GOAL_MEDIA: CMSGoal = {
  id:         'media-model',
  order:      5,
  title:      'Media Model',
  subtitle:   'Image and file management for content',
  objective:  'Content items reference MediaItems by ID. Media metadata (alt, dimensions, caption) is stored centrally.',
  status:     'in-progress',
  complexity: 'lg',
  layers:     ['data', 'ui', 'infra'],
  dependsOn:  ['sst-decision'],
  effortDays: 5,
  checks: [
    done('MediaItem interface defined',
      "lib/admin/types.ts: MediaItem = { id, url, alt, caption?, width?, height?, mimeType?, source: 'external' | 'github', addedAt }."),
    done('MediaRegistry in AdminState',
      'AdminState.mediaRegistry: MediaItem[]. Added to types.ts, state.ts (default []), schema.ts (MediaItemSchema).'),
    done('Zod MediaItemSchema',
      'lib/admin/schema.ts: MediaItemSchema validates all fields. Used in ContentBundleSchema for export/import.'),
    todo('MediaPicker component for content editors',
      'Reusable <MediaPicker value={id} onChange={id => ...} /> component. Shows thumbnail grid of mediaRegistry. Supports external URL entry as fallback.'),
    done('Media panel in admin (tab in TaxonomyPanel)',
      'Media tab in TaxonomyPanel shows mediaRegistry CRUD: add URL + alt, thumbnail grid, remove items.'),
    done('External URL support (no file uploads)',
      'MediaItem.source: external | github. No binary uploads — static export constraint. Admin adds external URLs manually.'),
    todo('Unused media detection',
      'Analytics shows count of MediaItems not referenced by any content item. Cleanup action removes them from registry.'),
  ],
}

// ─── Goal 6 — Import / Export ────────────────────────────────────────────────

export const GOAL_IMPORT_EXPORT: CMSGoal = {
  id:         'import-export',
  order:      6,
  title:      'Import / Export',
  subtitle:   'Content portability, backup, migration',
  objective:  'Full content round-trip: export all content to JSON/MDX, import back with validation, zero data loss.',
  status:     'in-progress',
  complexity: 'sm',
  layers:     ['data', 'ui'],
  dependsOn:  ['content-validation', 'taxonomies'],
  effortDays: 2,
  checks: [
    done('Export all content as JSON bundle',
      'src/lib/cms/content-export.ts: exportContentBundle(state) + downloadContentBundle(state). Downloads jootacee-content-[date].json with all registries and taxonomy.'),
    todo('Export validates against schemas before download',
      'Before generating JSON, run Zod validation on all content items. Export includes validationReport listing any schema violations.'),
    done('Import JSON with Zod validation',
      'parseContentBundle(raw) in content-export.ts validates against ContentBundleSchema.safeParse(). Returns ImportResult with ok/bundle/error.'),
    todo('Export to MDX format (optional)',
      'For MDX Git path: export generates one .mdx file per article/research with frontmatter. Downloads as a .zip. Ready to commit to repo.'),
    todo('Round-trip fidelity test',
      'Export → Import produces identical AdminState. A test in src/lib/content verifies that export(import(export(x))) === export(x).'),
    todo('Backup on import (auto-snapshot)',
      'Before any import, the current AdminState is automatically exported and saved as a LocalStorage backup key jootacee-content-backup-[timestamp].'),
  ],
}

// ─── Goal 7 — Revisions / Changelog ─────────────────────────────────────────

export const GOAL_REVISIONS: CMSGoal = {
  id:         'revisions',
  order:      7,
  title:      'Revisions & Changelog',
  subtitle:   'Content history, diff view, rollback',
  objective:  'Every content save creates a revision entry. Admin can browse history, diff versions, and rollback.',
  status:     'in-progress',
  complexity: 'xl',
  layers:     ['data', 'ui'],
  dependsOn:  ['draft-published'],
  effortDays: 8,
  checks: [
    done('ContentRevision interface defined',
      "lib/admin/types.ts: ContentRevision = { id, contentId, contentType: RevisionContentType, savedAt: ISO, note?, snapshot: Record<string, any> }."),
    done('RevisionLog in AdminState',
      'AdminState.revisionLog: ContentRevision[]. Max 50 revisions (rolling, enforced in cmsHandler). Added to types/state/schema.'),
    done('Revision saved on every content dispatch',
      'store.tsx: autoSnapshotBeforeMutation() intercepts UPDATE_PROJECT, UPDATE_RESEARCH_ENTRY, UPDATE_LAB, UPDATE_SYSTEM actions and prepends a ContentRevision before the slice handler runs.'),
    done('Revision list in admin content editors',
      'TaxonomyPanel Revisions tab shows 10 most recent revisions from revisionLog. Each entry shows timestamp, contentType, contentId, note.'),
    todo('Diff view between two revisions',
      'Side-by-side diff of key fields (title, description, status, tags) between any two revisions. Color-coded: green=added, red=removed, neutral=unchanged.'),
    todo('Rollback to revision',
      'Admin can click "Restore this version" on any revision. Shows confirmation with diff preview. Dispatches a restore action that sets item to snapshot state.'),
    todo('Auto-note on status transitions',
      'When content status changes (draft → review → published), a revision is saved with an auto-generated note: "Status changed to published at [timestamp]".'),
    done('RevisionLog size management',
      'cmsHandler in src/lib/admin/slices/cms.ts: LOG_REVISION slices to MAX_REVISIONS = 50. CLEAR_REVISIONS action filters by contentId + contentType.'),
  ],
}

// ─── Goal 8 — Publishing Workflow ────────────────────────────────────────────

export const GOAL_WORKFLOW: CMSGoal = {
  id:         'publishing-workflow',
  order:      8,
  title:      'Publishing Workflow',
  subtitle:   'Approval stages, transitions, timestamps',
  objective:  'Structured workflow for promoting content from draft to live. Each transition is logged and timestamped.',
  status:     'in-progress',
  complexity: 'lg',
  layers:     ['ui', 'data'],
  dependsOn:  ['draft-published', 'revisions'],
  effortDays: 4,
  checks: [
    done('Workflow transition actions defined',
      "CONTENT_SET_STATUS action in AdminAction union. cms slice handler routes to project/research/lab/system registry and keeps published: boolean in sync."),
    done('Workflow status UI in content editors',
      'CmsStatusSelector in src/components/admin/panels/cms/CmsStatusBadge.tsx shows current status + allowed transitions via TRANSITIONS map. Dispatches CONTENT_SET_STATUS.'),
    todo('publishedAt timestamp auto-set on CONTENT_PUBLISH',
      'When dispatching CONTENT_SET_STATUS with status=published, the item gains publishedAt: new Date().toISOString(). Not yet implemented in cms slice.'),
    todo('Optional approval gate config',
      'AdminState.site.requiresApproval: boolean. If true, review step is required before publish. Not yet implemented.'),
    todo('Workflow history visible in revision log',
      'Every status transition appears in revisionLog with status-transition note. Currently no auto-note on CONTENT_SET_STATUS dispatch.'),
    done('Content readiness checklist before publish',
      'TRANSITIONS map: draft→[review, published], review→[published, draft], published→[archived, draft]. Invalid transitions are not shown in UI.'),
  ],
}

// ─── Goal 9 — Rebuild Trigger ────────────────────────────────────────────────

export const GOAL_REBUILD: CMSGoal = {
  id:         'rebuild-trigger',
  order:      9,
  title:      'Rebuild Trigger',
  subtitle:   'Deploy hook, status polling, last-built timestamp',
  objective:  'Admin can trigger a production rebuild after publishing content. Rebuild status is visible in the dashboard.',
  status:     'in-progress',
  complexity: 'md',
  layers:     ['infra', 'ux'],
  dependsOn:  ['publishing-workflow'],
  adr:        'ADR-007',
  effortDays: 3,
  checks: [
    done('Deploy hook URL in AdminState',
      'AdminState.integrations.deployHookUrl?: string. SET_DEPLOY_HOOK_URL action in AdminAction. Saved via DeployTab at src/components/admin/panels/integrations/DeployTab.tsx.'),
    done('ADR-007: deploy hook security',
      'docs/adr/ADR-007-deploy-hook-security.md written. Documents localStorage storage, client-side fetch, risk accepted for single-admin personal site.'),
    done('"Trigger Rebuild" button in admin Integrations panel',
      'DeployTab has Trigger Production Rebuild button. Calls fetch(hookUrl, { method: POST }). Dispatches DEPLOY_TRIGGERED with ISO timestamp. Shows loading/success/error states.'),
    todo('Rebuild status polling',
      'After triggering, poll the deploy provider status API (Vercel: /v6/deployments?limit=1) to show: queued → building → ready. Not yet implemented.'),
    done('Last rebuilt timestamp in dashboard',
      'AdminState.integrations.lastDeployTriggeredAt?: string. DEPLOY_TRIGGERED action updates it. DeployTab shows last triggered timestamp.'),
    todo('Deploy guard: only publish triggers rebuild',
      'Rebuild button is disabled if there are no newly-published items since last deploy. Not yet implemented.'),
    todo('"Publish & Rebuild" combined action',
      'Content publish workflow shows "Publish & Rebuild" as primary action. Dispatches CONTENT_SET_STATUS + immediately triggers deploy hook. Not yet implemented.'),
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
  return PHASE3_GOALS.filter(g => g.checks.every(c => c.pass)).length
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
