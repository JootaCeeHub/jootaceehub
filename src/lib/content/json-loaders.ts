/**
 * Canonical JSON content loaders.
 * Git is the source of truth — these files live in src/content/ and are committed.
 * Public pages and admin panels import from here; no localStorage needed at build time.
 */

import systemsRaw from '@/content/systems/index.json'
import systemsMetaRaw from '@/content/systems/meta.json'
import labsRaw from '@/content/labs/index.json'
import projectsRaw from '@/content/projects/index.json'
import researchRaw from '@/content/research/index.json'
import resourceCategoriesRaw from '@/content/resources/categories.json'
import toolsRaw from '@/content/resources/tools.json'
import reposRaw from '@/content/resources/repos.json'
import workflowsRaw from '@/content/resources/workflows.json'
import promptsRaw from '@/content/resources/prompts.json'
import mcpRaw from '@/content/resources/mcp.json'
import agentsRaw from '@/content/resources/agents.json'
import skillsRaw from '@/content/resources/skills.json'

// ── Systems ───────────────────────────────────────────────────────────────────

export interface SystemJsonEntry {
  key: string
  badge: string
  title: string
  subtitle: string
  description: string
  status: string
  href: string
  version: string
  uptime: string
  tools: number
  visible: boolean
}

export interface SystemMeta {
  architectureNotes: string[]
  stats: { value: string; label: string }[]
}

export const SYSTEMS_JSON: SystemJsonEntry[] = systemsRaw as SystemJsonEntry[]
export const SYSTEMS_META: SystemMeta = systemsMetaRaw as SystemMeta

// ── Labs ──────────────────────────────────────────────────────────────────────

export interface LabJsonMetric { label: string; value: string; unit: string }

export interface LabJsonStackItem {
  name: string
  category: 'runtime' | 'ml' | 'data' | 'infra' | 'protocol'
}

export interface LabJsonEntry {
  key: string
  id: string
  slug: string
  name: string
  tagline: string
  status: string
  description: string
  version: string
  uptime: string
  region: string
  stack: LabJsonStackItem[]
  metrics: LabJsonMetric[]
  accent: string
  visible: boolean
}

export const LABS_JSON: LabJsonEntry[] = labsRaw as LabJsonEntry[]

// ── Projects ──────────────────────────────────────────────────────────────────

export interface ProjectJsonEntry {
  id: string
  slug: string
  title: string
  tagline: string
  type: string
  category: string
  status: string
  featured: boolean
  published: boolean
  description: string
  techStack: string[]
  tags: string[]
  repoUrl: string
  liveUrl: string
  accent: string
  publishedAt: string
  updatedAt: string
  locale: string
}

export const PROJECTS_JSON: ProjectJsonEntry[] = projectsRaw as ProjectJsonEntry[]

// ── Research ──────────────────────────────────────────────────────────────────

export interface ResearchJsonEntry {
  slug: string
  title: string
  type: string
  category: string
  excerpt: string
  tags: string[]
  readTime: number
  published: boolean
  featured: boolean
  status: string
  locale: string
  publishedAt: string
  updatedAt: string
}

export const RESEARCH_JSON: ResearchJsonEntry[] = researchRaw as ResearchJsonEntry[]

// ── Resource categories ───────────────────────────────────────────────────────

export interface ResourceCategoryJson {
  key: string
  label: string
  description: string
  count: string
  accent: string
  path: string
  subCategories: string[]
}

export const RESOURCE_CATEGORIES_JSON: ResourceCategoryJson[] = resourceCategoriesRaw as ResourceCategoryJson[]

// ── Resource items ────────────────────────────────────────────────────────────

export const TOOLS_JSON = toolsRaw
export const REPOS_JSON = reposRaw
export const WORKFLOWS_JSON = workflowsRaw
export const PROMPTS_JSON = promptsRaw
export const MCP_SERVERS_JSON = mcpRaw
export const AGENTS_JSON = agentsRaw
export const SKILLS_JSON = skillsRaw
