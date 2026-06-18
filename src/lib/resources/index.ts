/**
 * Public API for the resources domain.
 * Import from here rather than from data.ts or registry.ts directly.
 *
 * Phase 2: data.ts is a single large file with all resource data.
 * Phase 3 target: split data.ts into tools.ts, repos.ts, workflows.ts,
 * prompts.ts, mcp-servers.ts, agents.ts, skills.ts — this index file
 * will re-export them all so consumers need no changes.
 */

// Category registry (used by admin panels)
export type { RCatKey, RCategory } from './registry'
export { RESOURCE_CATEGORIES } from './registry'

// Full resource data (used by public resource pages)
export type {
  Tool, ToolCategory, Pricing,
  Repo, RepoCategory,
  Workflow, Complexity,
  Prompt, PromptFilterKey,
  McpServer, McpCategory,
  AgentPattern,
  SkillItem,
} from './data'

// Page category metadata (used by /resources/page.tsx hub)
export type { ResourceCategory } from './categories'
export { RESOURCE_CATEGORIES as RESOURCE_PAGE_CATEGORIES } from './categories'
