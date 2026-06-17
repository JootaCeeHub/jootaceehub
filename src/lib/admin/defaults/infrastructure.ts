import type { InfraConfig, NavEntry, WebEffect } from '../types'

// ─── Infrastructure Config ────────────────────────────────────────────────────

export const defaultInfraConfig: InfraConfig = {
  region: 'EU-WEST',
  orchestrator: 'Kubernetes',
  version: 'v2.1.0',
  nodes: [
    { name: 'api-gateway',  role: 'Gateway',      image: 'nginx:1.25-alpine',          status: 'running',  cpu: '12%', mem: '256MB', uptime: '14d', visible: true },
    { name: 'aura-core',    role: 'Orchestrator',  image: 'jootacee/aura:2.1.0',        status: 'running',  cpu: '34%', mem: '1.2GB', uptime: '14d', visible: true },
    { name: 'mcp-server',   role: 'MCP Host',      image: 'jootacee/mcp:1.8.3',         status: 'running',  cpu: '8%',  mem: '512MB', uptime: '14d', visible: true },
    { name: 'graphrag-svc', role: 'Memory',        image: 'jootacee/graphrag:3.0.1',    status: 'running',  cpu: '22%', mem: '768MB', uptime: '9d',  visible: true },
    { name: 'agent-runner', role: 'Agent Pool',    image: 'jootacee/agents:1.5.2',      status: 'running',  cpu: '41%', mem: '2.1GB', uptime: '14d', visible: true },
    { name: 'redis-cache',  role: 'Cache',         image: 'redis:7.2-alpine',           status: 'running',  cpu: '4%',  mem: '340MB', uptime: '30d', visible: true },
    { name: 'postgres-db',  role: 'Database',      image: 'postgres:16-alpine',         status: 'running',  cpu: '6%',  mem: '512MB', uptime: '30d', visible: true },
  ],
  deployments: [
    { service: 'aura-core',    version: 'v2.1.0', env: 'production', status: 'success', timestamp: '2026-05-24 09:14' },
    { service: 'mcp-server',   version: 'v1.8.3', env: 'production', status: 'success', timestamp: '2026-05-23 18:42' },
    { service: 'graphrag-svc', version: 'v3.0.1', env: 'production', status: 'success', timestamp: '2026-05-22 14:05' },
    { service: 'agent-runner', version: 'v1.5.2', env: 'production', status: 'success', timestamp: '2026-05-21 11:30' },
    { service: 'api-gateway',  version: 'v1.2.0', env: 'staging',    status: 'pending', timestamp: '2026-05-24 10:00' },
    { service: 'trading-ai',   version: 'v0.9.4', env: 'staging',    status: 'failed',  timestamp: '2026-05-24 07:45' },
  ],
}

// ─── Navigation ───────────────────────────────────────────────────────────────

export const defaultNavigation: NavEntry[] = [
  { key: 'projects',     label: 'Projects', href: '/projects', visible: true,  order: 0 },
  { key: 'research',     label: 'Research', href: '/research', visible: true,  order: 1 },
  { key: 'github',       label: 'GitHub',   href: '/github',   visible: true,  order: 2 },
  { key: 'about',        label: 'About',    href: '/about',    visible: true,  order: 3 },
  { key: 'contact',      label: 'Contact',  href: '/contact',  visible: true,  order: 4 },
]

// ─── Visual Engine Defaults ───────────────────────────────────────────────────

export const defaultEffects: WebEffect[] = [
  { id: 'particles',   name: 'Ambient Particles',  enabled: true,  intensity: 0.7 },
  { id: 'glow',        name: 'Neon Glow',           enabled: true,  intensity: 0.5 },
  { id: 'grain',       name: 'Film Grain',          enabled: false, intensity: 0.3 },
  { id: 'parallax',    name: 'Parallax Depth',      enabled: true,  intensity: 0.6 },
  { id: 'cursor',      name: 'Custom Cursor',       enabled: false, intensity: 0.5 },
  { id: 'noise',       name: 'Background Noise',    enabled: false, intensity: 0.2 },
  { id: 'sections-3d', name: 'Section 3D Effects',  enabled: true,  intensity: 0.7 },
]
