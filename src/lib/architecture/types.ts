export interface ArchitectureSystemCard {
  id: string
  name: string
  status: 'active' | 'stable' | 'running'
  focus: string
  description: string
}

export interface ArchitectureNode {
  id: string
  label: string
  kind: 'core' | 'agent' | 'protocol' | 'memory' | 'ops' | 'runtime'
  x: number
  y: number
}

export interface ArchitectureEdge {
  from: string
  to: string
  bandwidth: 'low' | 'medium' | 'high'
}

export interface ArchitectureFlowStep {
  id: string
  title: string
  summary: string
  latency: string
}

export interface ArchitectureOverview {
  version: string
  generatedAt: string
  systems: ArchitectureSystemCard[]
  mcpMap: {
    nodes: ArchitectureNode[]
    edges: ArchitectureEdge[]
  }
  auraSignals: Array<{ label: string; value: number }>
  graphMetrics: Array<{ label: string; value: string }>
  aiFlow: ArchitectureFlowStep[]
}

