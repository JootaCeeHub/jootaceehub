export interface SystemPageEntry {
  key: string
  badge: string
  title: string
  subtitle: string
  description: string
  status: string
  href: string
}

export const SYSTEMS_DATA: SystemPageEntry[] = [
  {
    key: 'mcp',
    badge: 'Protocol Layer',
    title: 'MCP Ecosystem',
    subtitle: 'Protocol-first orchestration layer',
    description:
      'The Model Context Protocol gateway that connects AI models, tools, and operational data streams into a unified orchestration fabric.',
    status: 'Operational',
    href: '/systems/mcp',
  },
  {
    key: 'graphrag',
    badge: 'Memory System',
    title: 'GraphRAG',
    subtitle: 'Graph memory & retrieval system',
    description:
      'A graph-native retrieval-augmented generation system that stores and queries knowledge as interconnected entities rather than flat vectors.',
    status: 'Operational',
    href: '/systems/graphrag',
  },
  {
    key: 'agents',
    badge: 'Agent Network',
    title: 'AI Agents',
    subtitle: 'Multi-agent orchestration fabric',
    description:
      'Coordinated autonomous agents with defined roles, tool access, and inter-agent communication protocols for complex task execution.',
    status: 'Active',
    href: '/systems/agents',
  },
  {
    key: 'automation',
    badge: 'Automation Layer',
    title: 'Automation',
    subtitle: 'Intelligent workflow infrastructure',
    description:
      'Event-driven automation pipelines that reduce operational friction and increase throughput across the entire system surface.',
    status: 'Operational',
    href: '/systems/automation',
  },
]

export const ARCHITECTURE_NOTES: string[] = [
  'Protocol-first orchestration through MCP gateway and AURA arbitration.',
  'Graph memory as persistent operational context for multi-agent continuity.',
  'Runtime feedback loops feeding orchestration and reliability policies.',
  'Infrastructure modeled as composable intelligence modules, not isolated apps.',
]

export const SYSTEM_STATS: { value: string; label: string }[] = [
  { value: '18', label: 'MCP Tools' },
  { value: '4', label: 'AI Models' },
  { value: '240ms', label: 'Avg Latency' },
  { value: '99.9%', label: 'Uptime' },
]
