/**
 * validate-content.mjs
 *
 * Validates every MDX file under src/content/journal/ against a strict Zod
 * schema that matches the expected frontmatter contract.
 *
 * Exit 0  — all files pass
 * Exit 1  — one or more validation errors (CI-blocking)
 *
 * Usage:
 *   node scripts/validate-content.mjs
 *   node scripts/validate-content.mjs --dir src/content/journal
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, extname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

// Resolve zod from project deps (avoids version mismatch in monorepos)
const require = createRequire(import.meta.url)
const { z } = require('zod')

// gray-matter parses MDX/Markdown frontmatter
const matter = require('gray-matter')

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const ROOT = join(__dirname, '..')

// ── Schema ─────────────────────────────────────────────────────────────────

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/

const FrontmatterSchema = z.object({
  slug: z
    .string({ required_error: 'slug is required' })
    .min(1, 'slug must not be empty')
    .regex(/^[a-z0-9-]+$/, 'slug must be lowercase kebab-case (a-z, 0-9, hyphens only)'),

  title: z
    .string({ required_error: 'title is required' })
    .min(3, 'title must be at least 3 characters'),

  excerpt: z
    .string({ required_error: 'excerpt is required' })
    .min(20, 'excerpt must be at least 20 characters'),

  abstract: z.string().optional(),

  date: z
    .string({ required_error: 'date is required' })
    .regex(ISO_DATE_RE, 'date must be ISO 8601 format: YYYY-MM-DDTHH:mm:ss.sssZ'),

  category: z.enum(['opinion', 'research', 'essays', 'news'], {
    required_error: 'category is required',
    message: 'category must be one of: opinion | research | essays | news',
  }),

  depth: z.enum(['deep-read', 'brief', 'signal'], {
    required_error: 'depth is required',
    message: 'depth must be one of: deep-read | brief | signal',
  }),

  series: z.string().optional(),

  tags: z
    .array(z.string().min(1, 'tags must not contain empty strings'), {
      required_error: 'tags is required',
    })
    .min(1, 'tags must contain at least one entry'),

  readTime: z
    .number({ required_error: 'readTime is required' })
    .int('readTime must be a whole number')
    .positive('readTime must be positive (minutes)'),

  featured: z.boolean().optional(),
})

// ── File discovery ─────────────────────────────────────────────────────────

function collectMdx(dir) {
  const files = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      files.push(...collectMdx(full))
    } else if (extname(entry) === '.mdx') {
      files.push(full)
    }
  }
  return files
}

// ── CLI args ───────────────────────────────────────────────────────────────

const dirArgIdx = process.argv.indexOf('--dir')
const contentDir = dirArgIdx !== -1 && process.argv[dirArgIdx + 1]
  ? join(ROOT, process.argv[dirArgIdx + 1])
  : join(ROOT, 'src', 'content', 'articles')

// ── Main ───────────────────────────────────────────────────────────────────

function main() {
  let files
  try {
    files = collectMdx(contentDir)
  } catch {
    console.error(`\n❌  Content directory not found: ${contentDir}\n`)
    process.exit(1)
  }

  if (files.length === 0) {
    console.log(`\n⚠️   No .mdx files found in ${contentDir}`)
    console.log('    Nothing to validate.\n')
    process.exit(0)
  }

  console.log(`\n📋  Validating ${files.length} MDX file${files.length > 1 ? 's' : ''}...\n`)

  const errors = []

  for (const file of files) {
    const rel = relative(ROOT, file)
    let raw
    try {
      raw = readFileSync(file, 'utf8')
    } catch (e) {
      errors.push({ file: rel, issues: [`Could not read file: ${e.message}`] })
      continue
    }

    let frontmatter
    try {
      const parsed = matter(raw)
      frontmatter = parsed.data
    } catch (e) {
      errors.push({ file: rel, issues: [`Failed to parse frontmatter: ${e.message}`] })
      continue
    }

    // Cross-field rule: slug in frontmatter must match filename (without .mdx)
    const expectedSlug = file.replace(/\.mdx$/, '').split('/').pop()
    if (frontmatter.slug && frontmatter.slug !== expectedSlug) {
      errors.push({
        file: rel,
        issues: [
          `slug mismatch: frontmatter slug is "${frontmatter.slug}" but filename implies "${expectedSlug}"`,
        ],
      })
    }

    const result = FrontmatterSchema.safeParse(frontmatter)
    if (!result.success) {
      const issues = result.error.issues.map((issue) => {
        const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : ''
        return `${path}${issue.message}`
      })
      errors.push({ file: rel, issues })
      continue
    }

    console.log(`  ✅  ${rel}`)
  }

  if (errors.length > 0) {
    console.log(`\n❌  ${errors.length} file${errors.length > 1 ? 's' : ''} failed validation:\n`)
    for (const { file, issues } of errors) {
      console.log(`  📄  ${file}`)
      for (const issue of issues) {
        console.log(`       • ${issue}`)
      }
      console.log()
    }
    process.exit(1)
  }

  console.log(`\n✅  All ${files.length} file${files.length > 1 ? 's' : ''} passed frontmatter validation.\n`)
  process.exit(0)
}

main()
