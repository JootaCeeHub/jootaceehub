export interface InfraMetric {
  key: string
  label: string
  value: string
  unit?: string
  status: 'operational' | 'stable' | 'warning' | 'critical'
}

export interface InfraContainer {
  name: string
  image: string
  status: 'running' | 'restarting' | 'stopped'
  cpu: string
  memory: string
  uptime: string
}

export interface MCPNode {
  id: string
  role: string
  state: 'online' | 'degraded' | 'offline'
  latencyMs: number
  loadPct: number
}

export interface InfraDeployment {
  service: string
  environment: string
  version: string
  status: 'success' | 'pending' | 'failed'
  timestamp: string
}

export interface InfraLogLine {
  ts: string
  level: 'info' | 'warn' | 'error'
  service: string
  message: string
}

export interface InfrastructureOverview {
  revision: string
  generatedAt: string
  source: 'live' | 'mock'
  uptimePct: number
  runtime: {
    region: string
    orchestrator: string
    runtime: string
  }
  metrics: InfraMetric[]
  containers: InfraContainer[]
  mcpNodes: MCPNode[]
  deployments: InfraDeployment[]
  logs: InfraLogLine[]
}
