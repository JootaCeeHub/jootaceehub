import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'
import { getAllSlugs } from '@/lib/journal/articles'
import { ALL_LABS } from '@/lib/labs/registry'

const BASE = 'https://jootacee.com'
const LOCALES = ['en', 'es'] as const
const BUILD_DATE = new Date('2026-05-28T00:00:00.000Z')

type Frequency = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'

function urls(
  paths: string[],
  opts: { changeFrequency: Frequency; priority: number; lastModified?: Date },
): MetadataRoute.Sitemap {
  return LOCALES.flatMap((locale) =>
    paths.map((path) => ({
      url: `${BASE}/${locale}${path}`,
      lastModified: opts.lastModified ?? BUILD_DATE,
      changeFrequency: opts.changeFrequency,
      priority: opts.priority,
    })),
  )
}

export default function sitemap(): MetadataRoute.Sitemap {
  const journalSlugs = getAllSlugs()
  const labSlugs = ALL_LABS.map((lab) => lab.id)

  return [
    // ── Landing ───────────────────────────────────────────────────────────────
    ...urls(['/'], { changeFrequency: 'weekly', priority: 1.0 }),

    // ── Systems domain ────────────────────────────────────────────────────────
    ...urls(['/systems/'], { changeFrequency: 'weekly', priority: 0.9 }),
    ...urls(
      ['/systems/mcp/', '/systems/graphrag/', '/systems/agents/', '/systems/automation/'],
      { changeFrequency: 'monthly', priority: 0.8 },
    ),

    // ── Labs domain ───────────────────────────────────────────────────────────
    ...urls(['/labs/'], { changeFrequency: 'weekly', priority: 0.9 }),
    ...urls(
      labSlugs.map((slug) => `/labs/${slug}/`),
      { changeFrequency: 'monthly', priority: 0.8 },
    ),

    // ── Journal domain ────────────────────────────────────────────────────────
    ...urls(['/journal/'], { changeFrequency: 'daily', priority: 0.85 }),
    ...urls(
      journalSlugs.map((slug) => `/journal/${slug}/`),
      { changeFrequency: 'monthly', priority: 0.75 },
    ),

    // ── Infrastructure ────────────────────────────────────────────────────────
    ...urls(['/infrastructure/'], { changeFrequency: 'weekly', priority: 0.8 }),

    // ── GitHub intelligence ───────────────────────────────────────────────────
    ...urls(['/github/'], { changeFrequency: 'daily', priority: 0.75 }),

    // ── Resources ─────────────────────────────────────────────────────────────
    ...urls(['/resources/'], { changeFrequency: 'weekly', priority: 0.8 }),
    ...urls(
      [
        '/resources/agents/',
        '/resources/mcp/',
        '/resources/prompts/',
        '/resources/repos/',
        '/resources/skills/',
        '/resources/tools/',
        '/resources/workflows/',
      ],
      { changeFrequency: 'monthly', priority: 0.65 },
    ),

    // ── About / Contact / Playground / Projects / Research ───────────────────
    ...urls(['/about/'], { changeFrequency: 'monthly', priority: 0.7 }),
    ...urls(['/contact/'], { changeFrequency: 'monthly', priority: 0.7 }),
    ...urls(['/projects/'], { changeFrequency: 'weekly', priority: 0.75 }),
    ...urls(['/research/'], { changeFrequency: 'weekly', priority: 0.75 }),
    ...urls(['/playground/'], { changeFrequency: 'monthly', priority: 0.6 }),
  ]
}
