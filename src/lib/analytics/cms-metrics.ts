/**
 * Phase 3 — CMS Maturity — planning metrics and definition-of-done registry.
 * ALL checks start as pass: false (not yet implemented).
 * This module is the source of truth for what must be built and how to measure it.
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

// ─── Helper ───────────────────────────────────────────────────────────────────

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
  status:     'planned',
  complexity: 'sm',
  layers:     ['infra', 'data'],
  dependsOn:  [],
  adr:        'ADR-006',
  effortDays: 1,
  checks: [
    todo('ADR-006 written and merged',
      'Document the choice between MDX Git-based (static, build-time) and Supabase (client-side, dynamic). Consider: SEO requirements, auth constraints, static export compatibility, multi-user needs.'),
    todo('MDX Git-based path scoped (if chosen)',
      'Content lives as .mdx files in src/content/. Build pipeline processes them with next-mdx-remote or remark. Pages pre-rendered at build time. SEO-optimal. Zero runtime cost.'),
    todo('Supabase client-side path scoped (if chosen)',
      'Supabase JS client fetches content after hydration. Content not pre-rendered (no SSG). Works with output: export. Needs auth for write ops. Better for collaborative/multi-user workflows.'),
    todo('Hybrid approach evaluated',
      'MDX Git for public content (blog, projects) + Supabase for CMS operations (drafts, media metadata, revision log). Recommended given static export constraint + SEO requirements.'),
    todo('Impact on ContentItem schema documented',
      'Decision determines whether ContentItem.body is a string (from MDX) or a Supabase row. Update lib/content/types.ts after ADR is signed.'),
  ],
}

// ─── Goal 1 — Draft/Published Status ─────────────────────────────────────────

export const GOAL_DRAFT_STATUS: CMSGoal = {
  id:         'draft-published',
  order:      1,
  title:      'Draft / Published Status',
  subtitle:   'Real content lifecycle state',
  objective:  'Content items have a real lifecycle: draft → review → published → archived. Static build only exports published items.',
  status:     'planned',
  complexity: 'md',
  layers:     ['data', 'ui'],
  dependsOn:  ['sst-decision'],
  effortDays: 3,
  checks: [
    todo('ContentItem.status extended to full enum',
      "lib/content/types.ts: status: 'draft' | 'review' | 'published' | 'archived'. Update Zod schema in lib/content/schema.ts."),
    todo('Admin editors show status badge + status selector',
      'Every content editor in ContentPanel shows current status with color-coded badge (draft=amber, review=sky, published=emerald, archived=muted). Status change via dropdown.'),
    todo('Loader filters by status at build time',
      'lib/content/loaders.ts: getPublished() returns only status=published items. getDrafts() returns draft+review. Build uses getPublished() only.'),
    todo('Draft items excluded from static export',
      'generateStaticParams() for journal/[slug], research/[slug] only includes published slugs. Draft pages are NOT in dist/.'),
    todo('Draft count visible in admin dashboard',
      'AdminState tracks content counts by status. Overview tab shows "3 drafts, 1 in review, 12 published".'),
    todo('AdminState shape extended for status',
      'Each registry item (projectsRegistry, researchRegistry, labsRegistry) already has a status-like field. Standardize to ContentItem.status across all types.'),
  ],
}

// ─── Goal 2 — Preview ────────────────────────────────────────────────────────

export const GOAL_PREVIEW: CMSGoal = {
  id:         'preview',
  order:      2,
  title:      'Content Preview',
  subtitle:   'Live preview before publishing',
  objective:  'Editor can preview any draft exactly as it will appear on the live site, without triggering a rebuild.',
  status:     'planned',
  complexity: 'lg',
  layers:     ['ux', 'ui'],
  dependsOn:  ['draft-published'],
  effortDays: 5,
  checks: [
    todo('Preview route exists (/preview/[type]/[slug])',
      'src/app/[locale]/preview/[type]/[slug]/page.tsx — client-side only route (generateStaticParams returns []). Reads draft content from AdminState (localStorage) and renders it in the public page layout.'),
    todo('Preview reads from AdminState, not built files',
      'Preview page hydrates from localStorage key jootacee-command-v2 and finds the draft content by slug. This means preview is always current without a rebuild.'),
    todo('"Preview" button in admin content editors',
      'Each content editor in ContentPanel shows a "Preview ↗" button that opens /[locale]/preview/[type]/[slug] in a new tab.'),
    todo('Preview shows draft watermark',
      'Preview page renders a non-intrusive "DRAFT — not published" banner at the top so the URL can be shared without confusion.'),
    todo('Preview generates static shell',
      'The preview route must exist in generateStaticParams even if empty, so the static export includes the shell HTML. Client-side hydration fills content.'),
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
  status:     'planned',
  complexity: 'md',
  layers:     ['data', 'ui'],
  dependsOn:  ['sst-decision'],
  effortDays: 3,
  checks: [
    todo('ArticleSchema extends ContentItemSchema with required fields',
      'lib/content/schema.ts: ArticleSchema adds body (min 100 chars), readingTime (number), publishedAt (ISO date). All required for publishing.'),
    todo('ProjectSchema validates required URLs',
      'ProjectSchema: demoUrl or repoUrl must be present (at least one). techStack min 1 item. description min 50 chars.'),
    todo('LabSchema validates tech stack and status',
      'LabSchema: techStack required, status must be live|beta|development. version follows semver pattern.'),
    todo('ResearchSchema validates academic structure',
      'ResearchSchema: abstract required (min 80 chars). at least one tag. publishedAt required if status=published.'),
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
  status:     'planned',
  complexity: 'md',
  layers:     ['data', 'ui'],
  dependsOn:  ['content-validation'],
  effortDays: 3,
  checks: [
    todo('TagRegistry in AdminState',
      'AdminState gains tagRegistry: Tag[] where Tag = { slug, label, color?, description? }. Tags are defined once and referenced by slug across all content types.'),
    todo('CategoryRegistry in AdminState',
      'CategoryRegistry: Category[] = { slug, label, description, parentSlug? }. Supports nested categories (e.g. ai > agents > memory).'),
    todo('SeriesRegistry in AdminState',
      "SeriesRegistry: Series[] = { slug, title, description, order: ContentItem['id'][] }. Groups articles/research into reading sequences."),
    todo('Content items reference taxonomy by slug (not inline string)',
      'ContentItem.tags becomes slug[] pointing to TagRegistry. ContentItem.category becomes slug pointing to CategoryRegistry. Validates against registry at save time.'),
    todo('Tag autocomplete in admin content editors',
      'Tag input field shows autocomplete from TagRegistry. Typing "ai" surfaces "ai", "ai-agents", "ai-tools". Unknown tags prompt to create in registry first.'),
    todo('Taxonomy management panel',
      'New admin panel (or section in ContentPanel) for managing TagRegistry, CategoryRegistry, SeriesRegistry CRUD operations.'),
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
  status:     'planned',
  complexity: 'lg',
  layers:     ['data', 'ui', 'infra'],
  dependsOn:  ['sst-decision'],
  effortDays: 5,
  checks: [
    todo('MediaItem interface defined',
      "lib/content/types.ts: MediaItem = { id, url, alt, width?, height?, caption?, mimeType, sizeBytes?, source: 'upload' | 'external' | 'github' }."),
    todo('MediaRegistry in AdminState',
      'AdminState gains mediaRegistry: MediaItem[]. All content types reference media by ID rather than inline URL strings.'),
    todo('Zod MediaItemSchema',
      'lib/content/schema.ts: MediaItemSchema validates url (valid URL pattern), alt (required, min 3 chars), optional numeric dimensions.'),
    todo('MediaPicker component for content editors',
      'Reusable <MediaPicker value={id} onChange={id => ...} /> component. Shows thumbnail grid of mediaRegistry. Supports external URL entry as fallback.'),
    todo('Media panel in admin (or tab in ContentPanel)',
      'Dedicated media management UI: upload from URL, edit alt/caption, remove unused items. Shows which content items reference each media.'),
    todo('External URL support (no file uploads)',
      'In static export context, file uploads go to external services (Cloudinary, GitHub releases, etc). MediaItem.url is always a full external URL. No local binary storage.'),
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
  status:     'planned',
  complexity: 'sm',
  layers:     ['data', 'ui'],
  dependsOn:  ['content-validation', 'taxonomies'],
  effortDays: 2,
  checks: [
    todo('Export all content as JSON bundle',
      'Admin action: "Export Content" downloads a single jootacee-content-export-[date].json containing all registries, taxonomies, media metadata, and content items.'),
    todo('Export validates against schemas before download',
      'Before generating the JSON, run Zod validation on all content items. Export includes a validationReport section listing any schema violations.'),
    todo('Import JSON with Zod validation',
      'Admin action: "Import Content" accepts the same JSON format. Runs full Zod validation on import. Merges or replaces registries with user confirmation.'),
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
  status:     'planned',
  complexity: 'xl',
  layers:     ['data', 'ui'],
  dependsOn:  ['draft-published'],
  effortDays: 8,
  checks: [
    todo('ContentRevision interface defined',
      "lib/content/types.ts: ContentRevision = { id, contentId, contentType, snapshot: ContentItem, savedAt: ISO, note?: string, status: CMSGoalStatus }. Snapshot is the full item at save time."),
    todo('RevisionLog in AdminState',
      'AdminState gains revisionLog: ContentRevision[]. Max 50 revisions per content item (rolling window). Stored in localStorage alongside main state.'),
    todo('Revision saved on every content dispatch',
      'In store.tsx: content-mutating actions (UPDATE_PROJECT, UPDATE_RESEARCH, etc.) append a ContentRevision to revisionLog before applying the update.'),
    todo('Revision list in admin content editors',
      'ContentPanel editors show a "History" sidebar tab listing revisions for the current item. Each entry shows timestamp, status change, and optional note.'),
    todo('Diff view between two revisions',
      'Side-by-side diff of key fields (title, description, status, tags) between any two revisions. Color-coded: green=added, red=removed, neutral=unchanged.'),
    todo('Rollback to revision',
      'Admin can click "Restore this version" on any revision. Shows confirmation with diff preview. Dispatches a restore action that sets item to snapshot state.'),
    todo('Auto-note on status transitions',
      'When content status changes (draft → review → published), a revision is saved with an auto-generated note: "Status changed to published at [timestamp]".'),
    todo('RevisionLog size management',
      'When revisionLog for an item exceeds 50 entries, oldest revisions are pruned. Admin can manually archive/clear revision history per item.'),
  ],
}

// ─── Goal 8 — Publishing Workflow ────────────────────────────────────────────

export const GOAL_WORKFLOW: CMSGoal = {
  id:         'publishing-workflow',
  order:      8,
  title:      'Publishing Workflow',
  subtitle:   'Approval stages, transitions, timestamps',
  objective:  'Structured workflow for promoting content from draft to live. Each transition is logged and timestamped.',
  status:     'planned',
  complexity: 'lg',
  layers:     ['ui', 'data'],
  dependsOn:  ['draft-published', 'revisions'],
  effortDays: 4,
  checks: [
    todo('WorkflowTransition actions defined',
      "AdminAction gains: CONTENT_SUBMIT_REVIEW, CONTENT_APPROVE, CONTENT_PUBLISH, CONTENT_UNPUBLISH, CONTENT_ARCHIVE. Each sets status + publishedAt/archivedAt timestamps."),
    todo('Workflow status UI in content editors',
      'ContentPanel shows a visual workflow pipeline: [draft] → [review] → [published] → [archived]. Active step highlighted. Transition buttons shown contextually.'),
    todo('publishedAt timestamp auto-set on CONTENT_PUBLISH',
      'When dispatching CONTENT_PUBLISH, the item gains publishedAt: new Date().toISOString(). Immutable once set (archiving/unpublishing does not clear it).'),
    todo('Optional approval gate config',
      'AdminState.site.requiresApproval: boolean. If true, CONTENT_SUBMIT_REVIEW is required before CONTENT_PUBLISH. If false, draft can go directly to published.'),
    todo('Workflow history visible in revision log',
      'Every status transition appears in the revision log with status-transition type entry. Searchable by "Status changed to X" in the history view.'),
    todo('Content readiness checklist before publish',
      'When attempting to publish, run content validation (Goal 3). Show checklist: ✓ title set, ✓ description ≥50 chars, ✓ at least one tag, ✓ schema valid. Block publish if any fail.'),
  ],
}

// ─── Goal 9 — Rebuild Trigger ────────────────────────────────────────────────

export const GOAL_REBUILD: CMSGoal = {
  id:         'rebuild-trigger',
  order:      9,
  title:      'Rebuild Trigger',
  subtitle:   'Deploy hook, status polling, last-built timestamp',
  objective:  'Admin can trigger a production rebuild after publishing content. Rebuild status is visible in the dashboard.',
  status:     'planned',
  complexity: 'md',
  layers:     ['infra', 'ux'],
  dependsOn:  ['publishing-workflow'],
  adr:        'ADR-007',
  effortDays: 3,
  checks: [
    todo('Deploy hook URL in AdminState',
      'AdminState.integrations.deployHookUrl: string. Set via Config panel. Supports Vercel, Netlify, Cloudflare Pages deploy hook URLs. Validated as HTTPS URL.'),
    todo('ADR-007: deploy hook security',
      'Deploy hooks are secret URLs. ADR-007 documents that they are stored in AdminState (localStorage) — acceptable risk for single-admin personal site. Production: use env var instead.'),
    todo('"Trigger Rebuild" button in admin header or Config panel',
      'Button calls deployHookUrl via fetch() POST. Disabled if deployHookUrl not configured. Shows loading state during POST. Requires publish permission check.'),
    todo('Rebuild status polling',
      'After triggering, poll the deploy provider status API (Vercel: /v6/deployments?limit=1) to show: queued → building → ready. Status shown in admin dashboard widget.'),
    todo('Last rebuilt timestamp in dashboard',
      'DashboardPanel shows "Last deployed: X minutes ago" + deployment URL once rebuild completes. Persisted in AdminState.analytics.lastDeployedAt.'),
    todo('Deploy guard: only publish triggers rebuild',
      'Rebuild button is disabled if there are no newly-published items since last deploy. Prevents unnecessary rebuilds from draft-only edits.'),
    todo('"Publish & Rebuild" combined action',
      'Content publish workflow shows "Publish & Rebuild" as primary action. Dispatches CONTENT_PUBLISH + immediately triggers deploy hook in sequence.'),
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
