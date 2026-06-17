export type LabStatus = 'live' | 'beta' | 'development'

export interface ArchNode {
  id: string
  label: string
  sub?: string
  x: number
  y: number
  type: 'source' | 'process' | 'model' | 'output' | 'store'
}

export interface ArchEdge {
  from: string
  to: string
  bidirectional?: boolean
}

export interface StackItem {
  name: string
  category: 'runtime' | 'ml' | 'data' | 'infra' | 'protocol'
}

export interface RoadmapPhase {
  phase: string
  label: string
  items: string[]
  status: 'complete' | 'active' | 'planned'
}

export interface LabMetric {
  label: string
  value: string
  unit?: string
}

export interface LabRegistryEntry {
  id: string
  slug: string
  name: string
  tagline: string
  description: string
  status: LabStatus
  version: string
  uptime: string
  region: string
  accent: string
  metrics: LabMetric[]
  stack: StackItem[]
  architecture: {
    nodes: ArchNode[]
    edges: ArchEdge[]
  }
  roadmap: RoadmapPhase[]
}

export const LAB_REGISTRY: Record<string, LabRegistryEntry> = {
  'trading-ai': {
    id: 'trading-ai',
    slug: 'trading-ai',
    name: 'Trading Intelligence Platform',
    tagline: 'Multi-signal AI execution engine for systematic markets.',
    description:
      'Combines LSTM-based price prediction, momentum signal analysis, and risk-adjusted position sizing into a unified execution pipeline. Built for systematic, data-driven trading at scale.',
    status: 'beta',
    version: '0.4.1',
    uptime: '99.2%',
    region: 'EU-WEST-1',
    accent: '#49b7ff',
    metrics: [
      { label: 'Signals / day', value: '847' },
      { label: 'Signal accuracy', value: '73.4', unit: '%' },
      { label: 'Execution latency', value: '12', unit: 'ms' },
      { label: 'Open positions', value: '38' },
    ],
    stack: [
      { name: 'Python 3.12', category: 'runtime' },
      { name: 'FastAPI', category: 'runtime' },
      { name: 'TensorFlow', category: 'ml' },
      { name: 'Pandas', category: 'ml' },
      { name: 'PostgreSQL', category: 'data' },
      { name: 'Redis', category: 'data' },
      { name: 'Docker', category: 'infra' },
      { name: 'WebSocket', category: 'protocol' },
    ],
    architecture: {
      nodes: [
        { id: 'market', label: 'Market Data', sub: 'Feed', x: 70, y: 80, type: 'source' },
        { id: 'signal', label: 'Signal Engine', sub: 'Core', x: 220, y: 80, type: 'process' },
        { id: 'lstm', label: 'LSTM Model', sub: 'Prediction', x: 220, y: 155, type: 'model' },
        { id: 'risk', label: 'Risk Analyzer', sub: 'Filter', x: 380, y: 80, type: 'process' },
        { id: 'exec', label: 'Execution', sub: 'Layer', x: 525, y: 80, type: 'output' },
      ],
      edges: [
        { from: 'market', to: 'signal' },
        { from: 'lstm', to: 'signal', bidirectional: true },
        { from: 'signal', to: 'risk' },
        { from: 'risk', to: 'exec' },
      ],
    },
    roadmap: [
      {
        phase: 'Phase 1',
        label: 'Signal Core',
        status: 'complete',
        items: ['LSTM price prediction', 'Momentum indicators', 'Risk engine v1'],
      },
      {
        phase: 'Phase 2',
        label: 'Live Execution',
        status: 'active',
        items: ['Broker API integration', 'Real-time WebSocket feed', 'Portfolio state management'],
      },
      {
        phase: 'Phase 3',
        label: 'Multi-Asset',
        status: 'planned',
        items: ['Crypto pairs', 'Cross-asset correlation', 'Dynamic rebalancing'],
      },
      {
        phase: 'Phase 4',
        label: 'RL Agent',
        status: 'planned',
        items: ['Reinforcement learning loop', 'Self-tuning thresholds', 'Adversarial backtesting'],
      },
    ],
  },

  'stl-generator': {
    id: 'stl-generator',
    slug: 'stl-generator',
    name: 'STL Generator',
    tagline: 'Natural language to production-ready 3D geometry.',
    description:
      'Translates structured natural language prompts into parametric 3D meshes via an LLM parsing layer, geometry synthesis engine, and mesh optimization pipeline. Outputs STL-compatible geometry for direct manufacturing use.',
    status: 'beta',
    version: '0.2.3',
    uptime: '97.8%',
    region: 'EU-WEST-1',
    accent: '#a78bfa',
    metrics: [
      { label: 'Models generated', value: '234' },
      { label: 'Avg generation time', value: '8.2', unit: 's' },
      { label: 'Mesh accuracy', value: '91', unit: '%' },
      { label: 'Export formats', value: '4' },
    ],
    stack: [
      { name: 'Python 3.12', category: 'runtime' },
      { name: 'FastAPI', category: 'runtime' },
      { name: 'Three.js', category: 'runtime' },
      { name: 'OpenAI API', category: 'ml' },
      { name: 'Blender Python', category: 'ml' },
      { name: 'CUDA 12', category: 'infra' },
      { name: 'Docker', category: 'infra' },
      { name: 'REST/JSON', category: 'protocol' },
    ],
    architecture: {
      nodes: [
        { id: 'prompt', label: 'Text Prompt', sub: 'Input', x: 55, y: 85, type: 'source' },
        { id: 'parser', label: 'LLM Parser', sub: 'Intent', x: 175, y: 85, type: 'process' },
        { id: 'params', label: 'Param Store', sub: 'Config', x: 175, y: 158, type: 'store' },
        { id: 'geo', label: 'Geometry Engine', sub: 'Synthesis', x: 320, y: 85, type: 'process' },
        { id: 'opt', label: 'Mesh Optimizer', sub: 'Post', x: 455, y: 85, type: 'process' },
        { id: 'export', label: 'STL Export', sub: 'Output', x: 555, y: 85, type: 'output' },
      ],
      edges: [
        { from: 'prompt', to: 'parser' },
        { from: 'parser', to: 'params', bidirectional: true },
        { from: 'parser', to: 'geo' },
        { from: 'params', to: 'geo' },
        { from: 'geo', to: 'opt' },
        { from: 'opt', to: 'export' },
      ],
    },
    roadmap: [
      {
        phase: 'Phase 1',
        label: 'Geometry Core',
        status: 'complete',
        items: ['Parametric mesh synthesis', 'Prompt-to-geometry pipeline', 'Three.js preview'],
      },
      {
        phase: 'Phase 2',
        label: 'Optimization',
        status: 'active',
        items: ['Mesh decimation', 'Topology repair', 'STL/OBJ/STEP export'],
      },
      {
        phase: 'Phase 3',
        label: 'Multi-modal Input',
        status: 'planned',
        items: ['Image reference input', 'Sketch-to-mesh', 'Reference point clouds'],
      },
      {
        phase: 'Phase 4',
        label: 'Manufacturing',
        status: 'planned',
        items: ['Slicer integration', 'Material constraints', 'DFM validation'],
      },
    ],
  },

  crm: {
    id: 'crm',
    slug: 'crm',
    name: 'CRM Intelligence Platform',
    tagline: 'AI-first pipeline intelligence with autonomous qualification.',
    description:
      'Brings machine intelligence into every stage of the sales pipeline — from lead scoring and automated qualification to deal-risk analysis and revenue forecasting. Designed for teams that run on data.',
    status: 'beta',
    version: '0.3.0',
    uptime: '99.5%',
    region: 'EU-WEST-1',
    accent: '#34d399',
    metrics: [
      { label: 'Active contacts', value: '1,284' },
      { label: 'Pipeline value', value: '$2.4M' },
      { label: 'Automation rate', value: '68', unit: '%' },
      { label: 'Conversion rate', value: '24', unit: '%' },
    ],
    stack: [
      { name: 'Next.js 16', category: 'runtime' },
      { name: 'Python 3.12', category: 'runtime' },
      { name: 'LangChain', category: 'ml' },
      { name: 'PostgreSQL', category: 'data' },
      { name: 'Redis', category: 'data' },
      { name: 'Stripe', category: 'protocol' },
      { name: 'Docker', category: 'infra' },
      { name: 'REST/GraphQL', category: 'protocol' },
    ],
    architecture: {
      nodes: [
        { id: 'capture', label: 'Lead Capture', sub: 'Ingestion', x: 70, y: 80, type: 'source' },
        { id: 'qualify', label: 'AI Qualifier', sub: 'Scoring', x: 220, y: 80, type: 'model' },
        { id: 'api', label: 'CRM API Layer', sub: 'Gateway', x: 220, y: 158, type: 'store' },
        { id: 'pipeline', label: 'Pipeline Manager', sub: 'State', x: 380, y: 80, type: 'process' },
        { id: 'analytics', label: 'Analytics', sub: 'Reports', x: 525, y: 80, type: 'output' },
      ],
      edges: [
        { from: 'capture', to: 'qualify' },
        { from: 'qualify', to: 'api', bidirectional: true },
        { from: 'qualify', to: 'pipeline' },
        { from: 'pipeline', to: 'analytics' },
      ],
    },
    roadmap: [
      {
        phase: 'Phase 1',
        label: 'Pipeline Core',
        status: 'complete',
        items: ['Lead ingestion', 'Stage management', 'Basic contact model'],
      },
      {
        phase: 'Phase 2',
        label: 'AI Qualification',
        status: 'active',
        items: ['LLM-based lead scoring', 'Deal-risk signals', 'Automated follow-up'],
      },
      {
        phase: 'Phase 3',
        label: 'Revenue Intelligence',
        status: 'planned',
        items: ['Forecast modeling', 'Churn prediction', 'Segment intelligence'],
      },
      {
        phase: 'Phase 4',
        label: 'Autonomous Sales',
        status: 'planned',
        items: ['Auto-outreach agent', 'Meeting scheduling AI', 'Deal closure assistant'],
      },
    ],
  },

  erp: {
    id: 'erp',
    slug: 'erp',
    name: 'ERP Operations Runtime',
    tagline: 'Integrated business intelligence infrastructure.',
    description:
      'A modular enterprise resource platform unifying inventory, finance, HR, and supply chain operations through a shared integration bus and real-time analytics engine. Designed for operational visibility at scale.',
    status: 'development',
    version: '0.1.4',
    uptime: '96.1%',
    region: 'EU-WEST-1',
    accent: '#fb923c',
    metrics: [
      { label: 'Active modules', value: '4' },
      { label: 'Automations running', value: '12' },
      { label: 'Throughput / hr', value: '148' },
      { label: 'System health', value: '96', unit: '%' },
    ],
    stack: [
      { name: 'Python 3.12', category: 'runtime' },
      { name: 'FastAPI', category: 'runtime' },
      { name: 'Kafka', category: 'data' },
      { name: 'PostgreSQL', category: 'data' },
      { name: 'Redis', category: 'data' },
      { name: 'Docker', category: 'infra' },
      { name: 'Kubernetes', category: 'infra' },
      { name: 'gRPC', category: 'protocol' },
    ],
    architecture: {
      nodes: [
        { id: 'inventory', label: 'Inventory', sub: 'Module', x: 80, y: 45, type: 'source' },
        { id: 'finance', label: 'Finance', sub: 'Module', x: 210, y: 45, type: 'source' },
        { id: 'hr', label: 'HR', sub: 'Module', x: 340, y: 45, type: 'source' },
        { id: 'supply', label: 'Supply Chain', sub: 'Module', x: 470, y: 45, type: 'source' },
        { id: 'bus', label: 'Integration Bus', sub: 'Kafka', x: 275, y: 115, type: 'process' },
        { id: 'analytics', label: 'Analytics Engine', sub: 'Runtime', x: 275, y: 175, type: 'output' },
      ],
      edges: [
        { from: 'inventory', to: 'bus' },
        { from: 'finance', to: 'bus' },
        { from: 'hr', to: 'bus' },
        { from: 'supply', to: 'bus' },
        { from: 'bus', to: 'analytics' },
      ],
    },
    roadmap: [
      {
        phase: 'Phase 1',
        label: 'Module Layer',
        status: 'complete',
        items: ['Inventory module', 'Finance module', 'Basic HR records'],
      },
      {
        phase: 'Phase 2',
        label: 'Integration Bus',
        status: 'active',
        items: ['Kafka event bus', 'Cross-module sync', 'Real-time analytics'],
      },
      {
        phase: 'Phase 3',
        label: 'AI Operations',
        status: 'planned',
        items: ['Demand forecasting', 'Anomaly detection', 'Auto-reorder triggers'],
      },
      {
        phase: 'Phase 4',
        label: 'Platform',
        status: 'planned',
        items: ['Multi-tenant architecture', 'Partner API', 'Marketplace modules'],
      },
    ],
  },

  aura: {
    id: 'aura',
    slug: 'aura',
    name: 'AURA Core',
    tagline: 'Multi-model AI orchestration runtime with persistent memory.',
    description:
      'Routes, coordinates, and arbitrates across multiple AI models (Claude, GPT-4, Gemini) through a unified MCP-compliant tool layer. Maintains persistent graph memory across sessions for coherent multi-step agent execution.',
    status: 'live',
    version: '2.1.0',
    uptime: '99.9%',
    region: 'EU-WEST-1',
    accent: '#22d3ee',
    metrics: [
      { label: 'Models connected', value: '6' },
      { label: 'MCP tools available', value: '47' },
      { label: 'Avg latency', value: '140', unit: 'ms' },
      { label: 'Requests today', value: '2,847' },
    ],
    stack: [
      { name: 'TypeScript', category: 'runtime' },
      { name: 'Python 3.12', category: 'runtime' },
      { name: 'MCP Protocol', category: 'protocol' },
      { name: 'LangGraph', category: 'ml' },
      { name: 'Neo4j', category: 'data' },
      { name: 'Redis', category: 'data' },
      { name: 'Docker', category: 'infra' },
      { name: 'Kubernetes', category: 'infra' },
    ],
    architecture: {
      nodes: [
        { id: 'claude', label: 'Claude', sub: 'Anthropic', x: 65, y: 50, type: 'source' },
        { id: 'gpt4', label: 'GPT-4', sub: 'OpenAI', x: 65, y: 110, type: 'source' },
        { id: 'gemini', label: 'Gemini', sub: 'Google', x: 65, y: 170, type: 'source' },
        { id: 'router', label: 'AURA Router', sub: 'Arbitration', x: 230, y: 110, type: 'process' },
        { id: 'memory', label: 'Memory Graph', sub: 'Neo4j', x: 230, y: 175, type: 'store' },
        { id: 'mcp', label: 'MCP Tools', sub: '47 tools', x: 385, y: 110, type: 'process' },
        { id: 'actions', label: 'Action Layer', sub: 'Execution', x: 530, y: 110, type: 'output' },
      ],
      edges: [
        { from: 'claude', to: 'router' },
        { from: 'gpt4', to: 'router' },
        { from: 'gemini', to: 'router' },
        { from: 'router', to: 'memory', bidirectional: true },
        { from: 'router', to: 'mcp' },
        { from: 'mcp', to: 'actions' },
      ],
    },
    roadmap: [
      {
        phase: 'Phase 1',
        label: 'Router Core',
        status: 'complete',
        items: ['Multi-model routing', 'MCP tool integration', 'Basic memory layer'],
      },
      {
        phase: 'Phase 2',
        label: 'Graph Memory',
        status: 'complete',
        items: ['Neo4j persistent memory', 'Cross-session continuity', 'Entity resolution'],
      },
      {
        phase: 'Phase 3',
        label: 'Agent Mesh',
        status: 'active',
        items: ['A2A protocol support', 'Sub-agent spawning', 'Capability discovery'],
      },
      {
        phase: 'Phase 4',
        label: 'Autonomy Layer',
        status: 'planned',
        items: ['Goal-directed execution', 'Self-healing agents', 'Continuous learning loop'],
      },
    ],
  },
}

export const ALL_LABS = Object.values(LAB_REGISTRY)

export function getLabBySlug(slug: string): LabRegistryEntry | undefined {
  return LAB_REGISTRY[slug]
}

export const STATUS_COLORS: Record<LabStatus, { dot: string; text: string; border: string; bg: string }> = {
  live: {
    dot: 'bg-emerald-400',
    text: 'text-emerald-400',
    border: 'border-emerald-400/25',
    bg: 'bg-emerald-400/8',
  },
  beta: {
    dot: 'bg-sky-400',
    text: 'text-sky-400',
    border: 'border-sky-400/25',
    bg: 'bg-sky-400/8',
  },
  development: {
    dot: 'bg-amber-400',
    text: 'text-amber-400',
    border: 'border-amber-400/25',
    bg: 'bg-amber-400/8',
  },
}

export const STACK_CATEGORY_COLORS: Record<string, string> = {
  runtime: 'text-sky-400/70 border-sky-400/15 bg-sky-400/5',
  ml: 'text-violet-400/70 border-violet-400/15 bg-violet-400/5',
  data: 'text-emerald-400/70 border-emerald-400/15 bg-emerald-400/5',
  infra: 'text-amber-400/70 border-amber-400/15 bg-amber-400/5',
  protocol: 'text-rose-400/70 border-rose-400/15 bg-rose-400/5',
}
