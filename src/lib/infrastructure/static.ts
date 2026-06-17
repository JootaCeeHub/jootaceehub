import type { InfrastructureOverview } from '@/lib/infrastructure/types'

// Static timestamps — must NOT use new Date() to avoid SSR/client hydration mismatch.
// All timestamps anchored to 2026-05-28 operational baseline.
// Update manually on each deploy refresh cycle.

export const staticInfrastructureOverview: InfrastructureOverview = {
  revision: 'phase-6-infrastructure-layer',
  generatedAt: '2026-05-28T00:00:00.000Z',
  source: 'mock',
  uptimePct: 99.91,
  runtime: {
    region: 'EU-WEST-1',
    orchestrator: 'kubernetes',
    runtime: 'containerd',
  },
  metrics: [
    { key: 'deployments',     label: 'Deployments',      value: '34',   unit: 'active',    status: 'operational' },
    { key: 'containers',      label: 'Containers',        value: '162',  unit: 'running',   status: 'operational' },
    { key: 'mcp_nodes',       label: 'MCP Nodes',         value: '14',   unit: 'online',    status: 'stable'      },
    { key: 'orchestrations',  label: 'Orchestrations',    value: '1.2K', unit: 'tasks/hr',  status: 'operational' },
    { key: 'memory_requests', label: 'Memory Requests',   value: '384',  unit: '/min',      status: 'stable'      },
    { key: 'runtime_alerts',  label: 'Runtime Alerts',    value: '1',    unit: 'active',    status: 'warning'     },
  ],
  containers: [
    {
      name: 'aura-core-01',
      image: 'ghcr.io/jootacee/aura-core:2.1.0',
      status: 'running',
      cpu: '28%',
      memory: '1.4Gi',
      uptime: '6d 4h',
    },
    {
      name: 'mcp-gateway-01',
      image: 'ghcr.io/jootacee/mcp-gateway:1.9.0',
      status: 'running',
      cpu: '19%',
      memory: '680Mi',
      uptime: '6d 4h',
    },
    {
      name: 'trading-engine-01',
      image: 'ghcr.io/jootacee/trading-intelligence:0.4.1',
      status: 'running',
      cpu: '37%',
      memory: '1.1Gi',
      uptime: '4d 17h',
    },
    {
      name: 'stl-generator-01',
      image: 'ghcr.io/jootacee/stl-generator:0.2.3',
      status: 'running',
      cpu: '12%',
      memory: '890Mi',
      uptime: '2d 8h',
    },
    {
      name: 'neo4j-memory-01',
      image: 'neo4j:5.18-community',
      status: 'running',
      cpu: '22%',
      memory: '2.1Gi',
      uptime: '9d 11h',
    },
    {
      name: 'crm-worker-01',
      image: 'ghcr.io/jootacee/crm-intelligence:0.3.0',
      status: 'restarting',
      cpu: '44%',
      memory: '520Mi',
      uptime: '14m',
    },
  ],
  mcpNodes: [
    { id: 'mcp-router-01',        role: 'router',           state: 'online',   latencyMs: 22, loadPct: 51 },
    { id: 'mcp-memory-02',        role: 'memory-bridge',    state: 'online',   latencyMs: 31, loadPct: 63 },
    { id: 'mcp-tools-03',         role: 'tool-executor',    state: 'online',   latencyMs: 38, loadPct: 74 },
    { id: 'mcp-observability-04', role: 'telemetry',        state: 'online',   latencyMs: 24, loadPct: 42 },
    { id: 'mcp-aura-05',          role: 'model-arbitration',state: 'online',   latencyMs: 18, loadPct: 67 },
    { id: 'mcp-graph-06',         role: 'graph-interface',  state: 'degraded', latencyMs: 68, loadPct: 88 },
  ],
  deployments: [
    { service: 'aura-core',             environment: 'production', version: 'v2.1.0', status: 'success', timestamp: '2026-05-28T08:14:00Z' },
    { service: 'mcp-gateway',           environment: 'production', version: 'v1.9.0', status: 'success', timestamp: '2026-05-27T22:45:00Z' },
    { service: 'trading-intelligence',  environment: 'staging',    version: 'v0.4.1', status: 'success', timestamp: '2026-05-27T18:30:00Z' },
    { service: 'stl-generator',         environment: 'production', version: 'v0.2.3', status: 'success', timestamp: '2026-05-26T14:12:00Z' },
    { service: 'crm-intelligence',      environment: 'staging',    version: 'v0.3.0', status: 'pending', timestamp: '2026-05-28T09:02:00Z' },
  ],
  logs: [
    { ts: '2026-05-28T09:31:14Z', level: 'info',  service: 'aura-core',            message: 'Agent mesh cycle completed. 47 tools resolved, 2 sub-agents spawned.' },
    { ts: '2026-05-28T09:28:47Z', level: 'warn',  service: 'mcp-graph-06',         message: 'Graph memory compaction latency elevated (68ms avg, threshold 50ms).' },
    { ts: '2026-05-28T09:25:03Z', level: 'info',  service: 'trading-engine-01',    message: 'Signal pipeline processed 214 events. 3 positions opened, 1 closed.' },
    { ts: '2026-05-28T09:22:59Z', level: 'error', service: 'crm-worker-01',        message: 'Container OOM restart triggered. Memory limit 512Mi exceeded by 8Mi.' },
    { ts: '2026-05-28T09:19:37Z', level: 'info',  service: 'mcp-gateway',          message: 'Route table refreshed. 47 tool endpoints registered across 6 MCP nodes.' },
    { ts: '2026-05-28T09:15:22Z', level: 'info',  service: 'neo4j-memory-01',      message: 'Graph write batch committed. 1,248 entities, 3,891 relationships updated.' },
  ],
}
