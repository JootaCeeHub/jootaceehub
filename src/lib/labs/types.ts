export interface LabModule {
  id: 'trading-ai' | 'stl-ai' | 'erp' | 'crm'
  name: string
  status: 'live' | 'r-and-d' | 'production'
  stack: string[]
  summary: string
}

export interface LabsOverview {
  revision: string
  generatedAt: string
  modules: LabModule[]
}
