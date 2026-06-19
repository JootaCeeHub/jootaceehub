// Lightweight registry for admin panel — source of truth for category metadata
// and compact item summaries. Full item data (descriptions, code, learn notes)
// lives in the individual page files at src/app/[locale]/resources/*/page.tsx
//
// Canonical data source: src/content/resources/*.json (committed to Git, ADR-008)

import {
  RESOURCE_CATEGORIES_JSON,
  TOOLS_JSON,
  REPOS_JSON,
  WORKFLOWS_JSON,
  PROMPTS_JSON,
  MCP_SERVERS_JSON,
  AGENTS_JSON,
  SKILLS_JSON,
} from '@/lib/content/json-loaders'

export type RCatKey = 'tools' | 'repos' | 'workflows' | 'prompts' | 'mcp' | 'agents' | 'skills'

export interface RCategory {
  key: RCatKey
  label: string
  description: string
  count: string
  accent: string
  path: string
  subCategories: string[]
}

export const RESOURCE_CATEGORIES: RCategory[] = RESOURCE_CATEGORIES_JSON as RCategory[]

// ─── Compact item lists (admin display only) ──────────────────────────────────

export interface ToolItem   { id?: string; name: string; subCat: string; url: string; pricing: string }
export interface RepoItem   { id?: string; org: string; name: string; lang: string; stars: string; url: string; cat: string }
export interface WorkItem   { id?: string; title: string; type: 'cicd' | 'n8n' | 'ai'; complexity: string }
export interface PromptItem { id?: string; title: string; cat: string; models: string[] }
export interface McpItem    { id?: string; name: string; cat: string; install: string; toolCount: number }
export interface AgentItem  { id?: string; title: string; stack: string[] }
export interface SkillItem  { id?: string; command: string; title: string; builtin: boolean }

export const toolItems: ToolItem[]     = TOOLS_JSON      as ToolItem[]
export const repoItems: RepoItem[]     = REPOS_JSON       as RepoItem[]
export const workflowItems: WorkItem[] = WORKFLOWS_JSON   as WorkItem[]
export const promptItems: PromptItem[] = PROMPTS_JSON     as PromptItem[]
export const mcpItems: McpItem[]       = MCP_SERVERS_JSON as McpItem[]
export const agentItems: AgentItem[]   = AGENTS_JSON      as AgentItem[]
export const skillItems: SkillItem[]   = SKILLS_JSON      as SkillItem[]
