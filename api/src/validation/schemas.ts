import { z } from 'zod'
import type { ContentType } from '../types.js'

// ---------------------------------------------------------------------------
// Re-usable primitives
// ---------------------------------------------------------------------------

const ISODate = z.string().datetime({ message: 'Must be an ISO-8601 datetime string' })
const SlugField = z.string().regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/, 'Invalid slug')
const LocaleField = z.enum(['en', 'es'])
const StatusField = z.enum(['draft', 'published', 'archived', 'deprecated'])

// ---------------------------------------------------------------------------
// Systems — src/content/systems/index.json array items
// ---------------------------------------------------------------------------

export const SystemSchema = z.object({
  key: SlugField,
  badge: z.string().min(1).max(60),
  title: z.string().min(1).max(120),
  subtitle: z.string().min(1).max(200),
  description: z.string().min(10).max(400),
  status: z.string().min(1),
  href: z.string().min(1),
  version: z.string().min(1),
  uptime: z.string().min(1),
  tools: z.number().int().nonnegative(),
  visible: z.boolean(),
})

export type SystemItem = z.infer<typeof SystemSchema>

// ---------------------------------------------------------------------------
// Labs — src/content/labs/index.json array items
// ---------------------------------------------------------------------------

const LabMetricSchema = z.object({
  label: z.string().min(1),
  value: z.string(),
  unit: z.string(),
})

const LabStackItemSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
})

export const LabSchema = z.object({
  key: SlugField,
  id: SlugField,
  slug: SlugField,
  name: z.string().min(1).max(120),
  tagline: z.string().min(1).max(200),
  status: z.string().min(1),
  description: z.string().min(10).max(500),
  version: z.string().min(1),
  uptime: z.string().min(1),
  region: z.string().min(1),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'accent must be a hex color'),
  visible: z.boolean(),
  metrics: z.array(LabMetricSchema).default([]),
  stack: z.array(LabStackItemSchema).default([]),
})

export type LabItem = z.infer<typeof LabSchema>

// ---------------------------------------------------------------------------
// Projects — src/content/projects/index.json array items
// ---------------------------------------------------------------------------

export const ProjectSchema = z.object({
  id: z.string().min(1),
  slug: SlugField,
  title: z.string().min(1).max(120),
  tagline: z.string().min(1).max(200),
  type: z.string().min(1),
  category: z.string().min(1),
  status: z.string().min(1),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  description: z.string().min(10).max(500),
  techStack: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  repoUrl: z.string().url().optional().or(z.literal('')),
  liveUrl: z.string().url().optional().or(z.literal('')),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  publishedAt: ISODate,
  updatedAt: ISODate.optional(),
  locale: LocaleField.optional(),
})

export type ProjectItem = z.infer<typeof ProjectSchema>

// ---------------------------------------------------------------------------
// Research — frontmatter for src/content/research/*.mdx
// Also used for articles via ArticleFrontmatterSchema
// ---------------------------------------------------------------------------

export const ResearchSchema = z.object({
  id: SlugField,
  slug: SlugField,
  title: z.string().min(1).max(120),
  type: z.string().min(1),
  category: z.string().min(1),
  description: z.string().min(60).max(160),
  tags: z.array(z.string()).default([]),
  readTime: z.number().int().positive().optional(),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  status: StatusField,
  locale: LocaleField,
  publishedAt: ISODate,
  updatedAt: ISODate,
})

export type ResearchItem = z.infer<typeof ResearchSchema>

// ---------------------------------------------------------------------------
// Resources — src/content/resources/*.json
// The resources directory contains named JSON files (e.g. tools.json, mcp.json).
// Each file is an array of resource entries.
// ---------------------------------------------------------------------------

const ResourceEntrySchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  url: z.string().url().optional().or(z.literal('')),
  tags: z.array(z.string()).default([]),
  category: z.string().optional(),
  featured: z.boolean().optional(),
}).passthrough() // resource entries vary by file; allow extra fields

export const ResourceCategorySchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  description: z.string().optional(),
  count: z.number().int().nonnegative().optional(),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  path: z.string().optional(),
  subCategories: z.array(z.string()).default([]),
  items: z.array(ResourceEntrySchema).optional(),
})

// Top-level: accept either an array or a single object
export const ResourcesFileSchema = z.union([
  z.array(ResourceEntrySchema),
  ResourceCategorySchema,
  z.record(z.unknown()),   // fallback for arbitrary resource JSON shapes
])

export type ResourcesFile = z.infer<typeof ResourcesFileSchema>

// ---------------------------------------------------------------------------
// Taxonomies — src/content/taxonomies/tags.json (or other taxonomy files)
// ---------------------------------------------------------------------------

const TagSchema = z.object({
  slug: SlugField,
  label: z.string().min(1),
  description: z.string().optional(),
  count: z.number().int().nonnegative().optional(),
})

export const TaxonomyFileSchema = z.union([
  z.array(TagSchema),
  z.record(z.array(TagSchema)),
  z.record(z.unknown()),
])

// ---------------------------------------------------------------------------
// Articles — frontmatter for src/content/articles/*.mdx
// ---------------------------------------------------------------------------

export const ArticleFrontmatterSchema = z.object({
  id: SlugField,
  title: z.string().min(1).max(120),
  slug: SlugField,
  description: z.string().min(60).max(160),
  status: z.enum(['draft', 'published', 'archived']),
  locale: LocaleField,
  tags: z.array(z.string()).default([]),
  publishedAt: ISODate,
  updatedAt: ISODate,
  featured: z.boolean().default(false),
  readingTimeMinutes: z.number().int().positive().optional(),
  coverImage: z.string().nullable().optional(),
})

export type ArticleFrontmatter = z.infer<typeof ArticleFrontmatterSchema>

// ---------------------------------------------------------------------------
// Collections — src/content/collections/ (array of collection items)
// ---------------------------------------------------------------------------

const CollectionItemSchema = z.object({
  id: z.string().min(1),
  slug: SlugField.optional(),
  title: z.string().min(1).max(120),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().optional(),
  publishedAt: ISODate.optional(),
  updatedAt: ISODate.optional(),
}).passthrough()

export const CollectionFileSchema = z.union([
  z.array(CollectionItemSchema),
  CollectionItemSchema,
  z.record(z.unknown()),
])

// ---------------------------------------------------------------------------
// Master map: ContentType → Zod schema
// ---------------------------------------------------------------------------

export const CONTENT_SCHEMAS: Record<ContentType, z.ZodTypeAny> = {
  systems: z.union([z.array(SystemSchema), SystemSchema]),
  labs: z.union([z.array(LabSchema), LabSchema]),
  projects: z.union([z.array(ProjectSchema), ProjectSchema]),
  research: ResearchSchema,     // MDX frontmatter object
  resources: ResourcesFileSchema,
  taxonomies: TaxonomyFileSchema,
  articles: ArticleFrontmatterSchema,  // MDX frontmatter object
  collections: CollectionFileSchema,
}

/**
 * Validates `data` against the schema for `type`.
 * Returns `{ ok: true, data }` on success or `{ ok: false, errors }` on failure.
 */
export function validateContent(
  type: ContentType,
  data: unknown,
): { ok: true; data: unknown } | { ok: false; errors: string[] } {
  const schema = CONTENT_SCHEMAS[type]
  const result = schema.safeParse(data)

  if (result.success) {
    return { ok: true, data: result.data }
  }

  const errors = result.error.issues.map(
    (i) => `${i.path.join('.') || '(root)'}: ${i.message}`,
  )
  return { ok: false, errors }
}
