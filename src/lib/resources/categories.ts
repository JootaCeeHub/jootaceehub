/**
 * Resource categories bridge — data from src/content/resources/categories.json (Git canonical).
 * LucideIcon refs must stay in TypeScript; they're merged here at build time.
 */
import { Wrench, GitFork, Workflow, Sparkles, Server, Bot, Cpu, type LucideIcon } from 'lucide-react'
import categoriesRaw from '@/content/resources/categories.json'

export interface ResourceCategory {
  key: string
  icon: LucideIcon
  title: string
  description: string
  count: string
}

const ICON_MAP: Record<string, LucideIcon> = {
  tools:     Wrench,
  repos:     GitFork,
  workflows: Workflow,
  prompts:   Sparkles,
  mcp:       Server,
  agents:    Bot,
  skills:    Cpu,
}

export const RESOURCE_CATEGORIES: ResourceCategory[] = (categoriesRaw as Array<{
  key: string; label: string; description: string; count: string
}>).map((cat) => ({
  key:         cat.key,
  icon:        ICON_MAP[cat.key] ?? Wrench,
  title:       cat.label,
  description: cat.description,
  count:       cat.count,
}))
