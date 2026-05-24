import type { InfrastructureOverview } from '@/lib/infrastructure/types'

export const mockInfrastructureOverview: InfrastructureOverview = {
  revision: 'phase-6-infrastructure-layer',
  generatedAt: '2026-05-18T00:00:00.000Z',
  source: 'mock',
  uptimePct: 99.94,
  runtime: {
    region: 'us-east-1',
    orchestrator: 'kubernetes',
    runtime: 'containerd',
  },
  metrics: [
    { key: 'deployments', label: 'Deployments', value: '31', unit: 'active', status: 'operational' },
    { key: 'containers', label: 'Containers', value: '148', unit: 'running', status: 'operational' },
    { key: 'mcp_nodes', label: 'MCP Nodes', value: '12', unit: 'online', status: 'stable' },
    { key: 'orchestrations', label: 'Orchestrations', value: '917', unit: 'tasks/hr', status: 'operational' },
    { key: 'logs_ingested', label: 'Logs Ingested', value: '84K', unit: '/h', status: 'stable' },
    { key: 'runtime_alerts', label: 'Runtime Alerts', value: '2', unit: 'active', status: 'warning' },
  ],
  containers: [
    { name: 'trading-ai-engine-1', image: 'ghcr.io/jootacee/trading-ai:2.4.1', status: 'running', cpu: '34%', memory: '1.2Gi', uptime: '3d 11h' },
    { name: 'mcp-gateway-2', image: 'ghcr.io/jootacee/mcp-gateway:1.9.0', status: 'running', cpu: '21%', memory: '740Mi', uptime: '5d 2h' },
    { name: 'graph-memory-sync', image: 'ghcr.io/jootacee/graph-sync:0.8.2', status: 'restarting', cpu: '49%', memory: '1.9Gi', uptime: '41m' },
    { name: 'crm-pipeline-worker', image: 'ghcr.io/jootacee/crm-worker:1.3.4', status: 'running', cpu: '17%', memory: '512Mi', uptime: '8d 6h' },
  ],
  mcpNodes: [
    { id: 'mcp-core-01', role: 'router', state: 'online', latencyMs: 28, loadPct: 54 },
    { id: 'mcp-memory-02', role: 'memory-bridge', state: 'online', latencyMs: 34, loadPct: 67 },
    { id: 'mcp-tools-03', role: 'tool-executor', state: 'degraded', latencyMs: 71, loadPct: 82 },
    { id: 'mcp-observability-04', role: 'telemetry', state: 'online', latencyMs: 26, loadPct: 48 },
  ],
  deployments: [
    { service: 'trading-ai-engine', environment: 'production', version: 'v2.4.1', status: 'success', timestamp: '2026-05-18T11:25:00Z' },
    { service: 'mcp-gateway', environment: 'staging', version: 'v1.9.0', status: 'success', timestamp: '2026-05-18T10:12:00Z' },
    { service: 'graph-sync', environment: 'production', version: 'v0.8.2', status: 'pending', timestamp: '2026-05-18T09:48:00Z' },
  ],
  logs: [
    { ts: '2026-05-18T11:34:21Z', level: 'info', service: 'mcp-gateway', message: 'Route table refreshed with 24 tool endpoints.' },
    { ts: '2026-05-18T11:33:12Z', level: 'warn', service: 'graph-sync', message: 'Memory compaction delay detected (32s).' },
    { ts: '2026-05-18T11:31:57Z', level: 'info', service: 'trading-ai-engine', message: 'Signal pipeline processed 128 events in current cycle.' },
    { ts: '2026-05-18T11:30:03Z', level: 'error', service: 'crm-worker', message: 'Retry triggered for webhook batch #8841.' },
  ],
}
