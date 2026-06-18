import { Wrench, GitFork, Workflow, Sparkles, Server, Bot, Cpu, type LucideIcon } from 'lucide-react'

export interface ResourceCategory {
  key: string
  icon: LucideIcon
  title: string
  description: string
  count: string
}

export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  {
    key: 'tools',
    icon: Wrench,
    title: 'Developer Tools',
    description: 'AI APIs, CLI utilities, cloud services, and monitoring platforms that accelerate modern development.',
    count: '18 tools',
  },
  {
    key: 'repos',
    icon: GitFork,
    title: 'Open Source Repos',
    description: 'Essential GitHub repositories every TypeScript and full-stack developer should know and bookmark.',
    count: '13 repos',
  },
  {
    key: 'workflows',
    icon: Workflow,
    title: 'Automation Workflows',
    description: 'CI/CD pipelines, n8n templates, and AI automation patterns ready to adapt for your projects.',
    count: '10 workflows',
  },
  {
    key: 'prompts',
    icon: Sparkles,
    title: 'AI Prompts',
    description: 'System prompts, task prompts, and meta-prompts for code review, architecture, and documentation.',
    count: '10 prompts',
  },
  {
    key: 'mcp',
    icon: Server,
    title: 'MCP Servers',
    description: 'Model Context Protocol servers for Claude — filesystem, GitHub, databases, browser automation, and custom integrations.',
    count: '30+ servers',
  },
  {
    key: 'agents',
    icon: Bot,
    title: 'AI Agent Templates',
    description: 'Production-ready agent architectures: ReAct, multi-agent orchestration, RAG, memory, and critic-loop patterns.',
    count: '15 templates',
  },
  {
    key: 'skills',
    icon: Cpu,
    title: 'Skills & Capabilities',
    description: 'Claude Code skills (slash commands), Hermes agent capabilities, and AI tool-use patterns you can deploy today.',
    count: '20+ skills',
  },
]
