import { z } from 'zod'

export const ContentTypeSchema = z.enum([
  'article',
  'project',
  'research',
  'lab',
  'system',
  'resource',
])

export const ContentStatusSchema = z.enum(['draft', 'published', 'archived'])

export const ContentLocaleSchema = z.enum(['en', 'es'])

export const ContentItemSchema = z.object({
  id:          z.string().min(1),
  type:        ContentTypeSchema,
  title:       z.string().min(1),
  slug:        z.string().min(1).regex(/^[a-z0-9-]+$/, 'slug must be lowercase kebab-case'),
  description: z.string(),
  status:      ContentStatusSchema,
  locale:      ContentLocaleSchema,
  tags:        z.array(z.string()),
  publishedAt: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  updatedAt:   z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  featured:    z.boolean(),
})

export type ContentItemInput = z.input<typeof ContentItemSchema>
export type ContentItemOutput = z.output<typeof ContentItemSchema>

export const ArticleMetaSchema = z.object({
  slug:     z.string().min(1),
  title:    z.string().min(1),
  excerpt:  z.string(),
  abstract: z.string().optional(),
  date:     z.string().regex(/^\d{4}-\d{2}-\d{2}/),
  category: z.enum(['opinion', 'research', 'essays', 'news']),
  depth:    z.enum(['deep-read', 'brief', 'signal']).optional(),
  series:   z.string().optional(),
  tags:     z.array(z.string()),
  readTime: z.number().int().positive(),
  featured: z.boolean().optional(),
})

export type ArticleMetaInput = z.input<typeof ArticleMetaSchema>
