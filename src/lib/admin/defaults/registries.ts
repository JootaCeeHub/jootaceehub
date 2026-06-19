/**
 * Admin registry defaults — all sourced from src/content/ JSON files (Git canonical).
 * AdminState initializes from these; subsequent edits are persisted to localStorage.
 * This file is a bridge: JSON is the single source of truth.
 */
import type {
  SystemEntry, LabEntry, ProjectEntry, ResearchEntry,
  ResourceToolItem, ResourceRepoItem, ResourceWorkItem,
  ResourcePromptItem, ResourceMcpItem, ResourceAgentItem, ResourceSkillItem,
} from '../types'

import systemsRaw  from '@/content/systems/index.json'
import labsRaw     from '@/content/labs/index.json'
import projectsRaw from '@/content/projects/index.json'
import researchRaw from '@/content/research/index.json'
import toolsRaw    from '@/content/resources/tools.json'
import reposRaw    from '@/content/resources/repos.json'
import workflowsRaw from '@/content/resources/workflows.json'
import promptsRaw  from '@/content/resources/prompts.json'
import mcpRaw      from '@/content/resources/mcp.json'
import agentsRaw   from '@/content/resources/agents.json'
import skillsRaw   from '@/content/resources/skills.json'

// ─── Systems Registry ─────────────────────────────────────────────────────────

export const defaultSystemsRegistry: SystemEntry[] = (systemsRaw as Array<{
  key: string; badge: string; title: string; description: string; status: string
  version: string; uptime: string; tools: number; visible: boolean
}>).map((s) => ({
  key:         s.key,
  name:        s.title,
  badge:       s.badge,
  description: s.description,
  status:      s.status as SystemEntry['status'],
  version:     s.version,
  uptime:      s.uptime,
  tools:       s.tools,
  visible:     s.visible,
}))

// ─── Labs Registry ────────────────────────────────────────────────────────────

export const defaultLabsRegistry: LabEntry[] = (labsRaw as Array<{
  key: string; name: string; tagline: string; status: string; description: string
  stack: { name: string; category: string }[]; metrics: { label: string; value: string; unit: string }[]
  accent: string; visible: boolean
}>).map((l) => ({
  key:         l.key,
  name:        l.name,
  tagline:     l.tagline,
  status:      l.status as LabEntry['status'],
  description: l.description,
  stack:       l.stack.map((s) => s.name),
  metrics:     l.metrics.map((m) => ({ label: m.label, value: m.value + (m.unit ?? '') })),
  accent:      l.accent,
  visible:     l.visible,
}))

// ─── Projects Registry ────────────────────────────────────────────────────────

export const defaultProjectsRegistry: ProjectEntry[] = (projectsRaw as Array<{
  id: string; slug: string; title: string; tagline: string; category: string; status: string
  featured: boolean; published: boolean; description: string; techStack: string[]
  tags: string[]; repoUrl: string; liveUrl: string; accent: string
  publishedAt: string; updatedAt: string
}>).map((p) => ({
  id:          p.id,
  slug:        p.slug,
  title:       p.title,
  tagline:     p.tagline,
  category:    p.category as ProjectEntry['category'],
  status:      p.status as ProjectEntry['status'],
  featured:    p.featured,
  published:   p.published,
  description: p.description,
  techStack:   p.techStack,
  tags:        p.tags,
  repoUrl:     p.repoUrl,
  liveUrl:     p.liveUrl,
  screenshots: [],
  createdAt:   p.publishedAt,
  updatedAt:   p.updatedAt,
  publishedAt: p.publishedAt,
  relatedResearch:   [],
  relatedResources:  [],
  accent:      p.accent,
}))

// ─── Research Registry ────────────────────────────────────────────────────────

export const defaultResearchRegistry: ResearchEntry[] = (researchRaw as Array<{
  slug: string; title: string; category: string; excerpt: string
  tags: string[]; readTime: number; published: boolean; featured: boolean
  publishedAt: string
}>).map((r) => ({
  slug:        r.slug,
  title:       r.title,
  category:    r.category as ResearchEntry['category'],
  excerpt:     r.excerpt,
  tags:        r.tags,
  readTime:    r.readTime,
  published:   r.published,
  featured:    r.featured,
  createdAt:   r.publishedAt,
  publishedAt: r.publishedAt,
}))

// ─── Resource Registries ──────────────────────────────────────────────────────

export const defaultToolRegistry: ResourceToolItem[] = toolsRaw as ResourceToolItem[]

export const defaultRepoRegistry: ResourceRepoItem[] = reposRaw as ResourceRepoItem[]

export const defaultWorkflowRegistry: ResourceWorkItem[] = (workflowsRaw as Array<{
  id: string; title: string; type: string; complexity: string
}>).map((w) => ({
  id:         w.id,
  title:      w.title,
  type:       w.type as ResourceWorkItem['type'],
  complexity: w.complexity as ResourceWorkItem['complexity'],
}))

export const defaultPromptRegistry: ResourcePromptItem[] = (promptsRaw as Array<{
  id: string; title: string; cat: string; models: string[]
}>).map((p) => ({ id: p.id, title: p.title, cat: p.cat, models: p.models }))

export const defaultMcpRegistry: ResourceMcpItem[] = (mcpRaw as Array<{
  id: string; name: string; cat: string; install: string; toolCount: number
}>).map((m) => ({ id: m.id, name: m.name, cat: m.cat, install: m.install, toolCount: m.toolCount }))

export const defaultAgentRegistry: ResourceAgentItem[] = (agentsRaw as Array<{
  id: string; title: string; stack: string[]
}>).map((a) => ({ id: a.id, title: a.title, stack: a.stack }))

export const defaultSkillRegistry: ResourceSkillItem[] = (skillsRaw as Array<{
  id: string; command: string; title: string; builtin: boolean
}>).map((s) => ({ id: s.id, command: s.command, title: s.title, builtin: s.builtin }))
