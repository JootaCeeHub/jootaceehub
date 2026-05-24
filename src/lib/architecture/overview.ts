import type { ArchitectureOverview } from '@/lib/architecture/types'

export function buildArchitectureOverview(): ArchitectureOverview {
  return {
    version: 'phase-3-systems-showcase',
    generatedAt: new Date().toISOString(),
    systems: [
      {
        id: 'aura',
        name: 'AURA',
        status: 'active',
        focus: 'Reasoning kernel',
        description: 'Decision-focused intelligence core for adaptive strategy execution.',
      },
      {
        id: 'mcp',
        name: 'MCP Ecosystem',
        status: 'active',
        focus: 'Protocol fabric',
        description: 'Tool context routing, dynamic connectors and resilient agent interfaces.',
      },
      {
        id: 'agents',
        name: 'AI Agents',
        status: 'active',
        focus: 'Agent mesh',
        description: 'Autonomous workers coordinated through orchestration contracts and shared memory.',
      },
      {
        id: 'memory',
        name: 'Graph Memory',
        status: 'stable',
        focus: 'Context layer',
        description: 'Persistent graph structures for traceability, retrieval and cognition loops.',
      },
      {
        id: 'automation',
        name: 'Automation Systems',
        status: 'active',
        focus: 'Workflow engine',
        description: 'Operational pipelines that reduce manual load and enforce deterministic execution.',
      },
      {
        id: 'docker',
        name: 'Docker Infrastructure',
        status: 'active',
        focus: 'Container matrix',
        description: 'Modular containers for predictable deployments and isolated runtime units.',
      },
      {
        id: 'ops',
        name: 'AI Operations',
        status: 'running',
        focus: 'Ops intelligence',
        description: 'Continuous monitoring, auto-remediation and deployment decision support.',
      },
      {
        id: 'industrial',
        name: 'Industrial Intelligence',
        status: 'running',
        focus: 'Applied systems',
        description: 'AI architecture patterns adapted for enterprise and industrial environments.',
      },
    ],
    mcpMap: {
      nodes: [
        { id: 'gateway', label: 'MCP Gateway', kind: 'protocol', x: 50, y: 14 },
        { id: 'aura-core', label: 'AURA Core', kind: 'core', x: 50, y: 34 },
        { id: 'agent-ops', label: 'Ops Agent', kind: 'agent', x: 24, y: 56 },
        { id: 'agent-dev', label: 'Dev Agent', kind: 'agent', x: 50, y: 61 },
        { id: 'agent-data', label: 'Data Agent', kind: 'agent', x: 76, y: 56 },
        { id: 'graph', label: 'Graph Memory', kind: 'memory', x: 27, y: 82 },
        { id: 'tools', label: 'Tool Runtime', kind: 'runtime', x: 73, y: 82 },
        { id: 'ops', label: 'Ops Fabric', kind: 'ops', x: 50, y: 92 },
      ],
      edges: [
        { from: 'gateway', to: 'aura-core', bandwidth: 'high' },
        { from: 'aura-core', to: 'agent-ops', bandwidth: 'medium' },
        { from: 'aura-core', to: 'agent-dev', bandwidth: 'high' },
        { from: 'aura-core', to: 'agent-data', bandwidth: 'medium' },
        { from: 'agent-ops', to: 'graph', bandwidth: 'medium' },
        { from: 'agent-dev', to: 'tools', bandwidth: 'high' },
        { from: 'agent-data', to: 'graph', bandwidth: 'high' },
        { from: 'graph', to: 'ops', bandwidth: 'medium' },
        { from: 'tools', to: 'ops', bandwidth: 'medium' },
      ],
    },
    auraSignals: [
      { label: 'Reasoning Coherence', value: 94 },
      { label: 'Context Retention', value: 89 },
      { label: 'Task Arbitration', value: 91 },
      { label: 'Runtime Stability', value: 97 },
    ],
    graphMetrics: [
      { label: 'Entities', value: '2.4M' },
      { label: 'Relations', value: '8.7M' },
      { label: 'Traversal Latency', value: '42ms' },
      { label: 'Sync Interval', value: '15s' },
    ],
    aiFlow: [
      { id: 'ingest', title: 'Context Ingest', summary: 'MCP connectors stream contextual artifacts into AURA.', latency: '35ms' },
      { id: 'reason', title: 'Reasoning Loop', summary: 'AURA composes plans, constraints and dynamic tool strategy.', latency: '74ms' },
      { id: 'dispatch', title: 'Agent Dispatch', summary: 'Task graph is partitioned across specialist agents.', latency: '48ms' },
      { id: 'memory-write', title: 'Graph Commit', summary: 'Outcomes and links are persisted in graph memory.', latency: '29ms' },
      { id: 'ops-feedback', title: 'Ops Feedback', summary: 'Runtime metrics feed back into orchestration policy.', latency: '51ms' },
    ],
  }
}

