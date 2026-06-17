'use client'

import { useState, useEffect, useRef } from 'react'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
// ─── Types ─────────────────────────────────────────────────────────────────────

type LogLevel = 'INFO' | 'WARN' | 'ERROR'
type DeployStatus = 'success' | 'pending' | 'failed'
type NodeState = 'online' | 'degraded' | 'offline'

interface LogEntry {
  id: number
  ts: string
  level: LogLevel
  service: string
  msg: string
}

interface MCPNode {
  id: string
  role: string
  state: NodeState
  latency: number
  load: number
}

// ─── Static data ───────────────────────────────────────────────────────────────

const SERVICES = [
  { name: 'aura-core',    role: 'Orchestrator',  cpu: 34, mem: 62, uptime: '14d 6h' },
  { name: 'mcp-gateway',  role: 'Protocol',      cpu: 21, mem: 38, uptime: '14d 6h' },
  { name: 'graphrag-svc', role: 'Memory Graph',  cpu: 22, mem: 55, uptime: '9d 2h'  },
  { name: 'trading-ai',   role: 'Signal Agent',  cpu: 34, mem: 44, uptime: '3d 11h' },
  { name: 'api-gateway',  role: 'Edge Router',   cpu: 12, mem: 28, uptime: '14d 6h' },
  { name: 'redis-cache',  role: 'Cache Store',   cpu:  4, mem: 18, uptime: '30d'    },
  { name: 'postgres-db',  role: 'Data Layer',    cpu:  6, mem: 32, uptime: '30d'    },
]

const MCP_BASE: MCPNode[] = [
  { id: 'mcp-core-01',    role: 'Router',        state: 'online',   latency: 28, load: 54 },
  { id: 'mcp-memory-02',  role: 'Memory Bridge', state: 'online',   latency: 34, load: 67 },
  { id: 'mcp-tools-03',   role: 'Tool Executor', state: 'degraded', latency: 71, load: 82 },
  { id: 'mcp-obs-04',     role: 'Telemetry',     state: 'online',   latency: 26, load: 48 },
]

const DEPLOYMENTS: {
  service: string
  version: string
  env: string
  status: DeployStatus
  ago: string
}[] = [
  { service: 'aura-core',    version: 'v2.1.0', env: 'production', status: 'success', ago: '6h ago'  },
  { service: 'mcp-gateway',  version: 'v1.9.0', env: 'production', status: 'success', ago: '18h ago' },
  { service: 'graphrag-svc', version: 'v3.0.1', env: 'staging',    status: 'success', ago: '1d ago'  },
  { service: 'trading-ai',   version: 'v0.4.1', env: 'staging',    status: 'pending', ago: '4h ago'  },
  { service: 'api-gateway',  version: 'v1.2.0', env: 'staging',    status: 'failed',  ago: '2h ago'  },
]

const LOG_POOL: Omit<LogEntry, 'id' | 'ts'>[] = [
  { level: 'INFO',  service: 'aura-core',    msg: 'Orchestration cycle complete — 3 agents, 12 tool calls, 1.4s total' },
  { level: 'INFO',  service: 'mcp-gateway',  msg: 'Route table refreshed with 24 tool endpoints' },
  { level: 'WARN',  service: 'graphrag-svc', msg: 'Memory compaction delay detected (32s)' },
  { level: 'INFO',  service: 'trading-ai',   msg: 'Signal pipeline processed 128 events in current cycle' },
  { level: 'INFO',  service: 'aura-core',    msg: 'Context window pruning — 4.2k tokens recovered' },
  { level: 'INFO',  service: 'mcp-gateway',  msg: 'Tool dispatch → filesystem.read completed in 34ms' },
  { level: 'ERROR', service: 'api-gateway',  msg: 'Retry triggered for webhook batch #8841' },
  { level: 'INFO',  service: 'redis-cache',  msg: 'Cache hit ratio: 94.3% — TTL refresh batch queued' },
  { level: 'WARN',  service: 'aura-core',    msg: 'Model latency spike detected — switching to haiku fallback' },
  { level: 'INFO',  service: 'mcp-gateway',  msg: 'Registry heartbeat — 18 tools healthy, 0 degraded' },
  { level: 'INFO',  service: 'trading-ai',   msg: 'Order book analysis: PASS — 0.08ms execution' },
  { level: 'INFO',  service: 'aura-core',    msg: 'Agent [analyst-02] task complete, checkpointing state' },
  { level: 'WARN',  service: 'mcp-tools-03', msg: 'Tool executor load at 82% — request queue building' },
  { level: 'INFO',  service: 'aura-core',    msg: 'Agent [summarizer-01] spawned — 8k token budget allocated' },
  { level: 'INFO',  service: 'postgres-db',  msg: 'Autovacuum complete on sessions table (2.3s)' },
  { level: 'INFO',  service: 'graphrag-svc', msg: 'Graph traversal — 847 nodes resolved in 112ms' },
]

// Sparklines: 20 values (0-100 scale)
const SPARK_THROUGHPUT = [45, 52, 48, 61, 55, 58, 72, 68, 65, 78, 74, 71, 82, 79, 76, 85, 81, 88, 84, 92]
const SPARK_ERRORS    = [ 2,  1,  3,  1,  2,  0,  1,  2,  1,  0,  1,  2,  0,  1,  1,  0,  2,  1,  0,  1]
const SPARK_LATENCY   = [65, 56, 70, 60, 84, 76, 68, 58, 62, 72, 80, 68, 56, 64, 76, 70, 58, 66, 60, 56]

function nowTs() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

function makeInitialLogs(): LogEntry[] {
  return LOG_POOL.slice(0, 10).map((l, i) => ({
    ...l,
    id: i,
    ts: `10:4${Math.floor(i / 2)}:${String((i * 7) % 60).padStart(2, '0')}`,
  }))
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function LogLevelTag({ level }: { level: LogLevel }) {
  if (level === 'WARN')  return <span className="w-[34px] flex-shrink-0 text-amber-400/80">WARN</span>
  if (level === 'ERROR') return <span className="w-[34px] flex-shrink-0 text-red-400/80">ERR </span>
  return <span className="w-[34px] flex-shrink-0 text-sky-400/65">INFO</span>
}

function DeployIndicator({ status }: { status: DeployStatus }) {
  const bg =
    status === 'success' ? 'rgba(52,211,153,1)' :
    status === 'pending' ? 'rgba(245,158,11,1)'  :
    'rgba(248,113,113,1)'
  return <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: bg }} />
}

function DeployStatusLabel({ status }: { status: DeployStatus }) {
  const color =
    status === 'success' ? 'text-emerald-400' :
    status === 'pending' ? 'text-amber-400'   :
    'text-red-400'
  const text =
    status === 'success' ? 'deployed'  :
    status === 'pending' ? 'deploying' :
    'failed'
  return <span className={`font-mono text-[9px] ${color}`}>{text}</span>
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function InfrastructurePage() {
  const [logs, setLogs]       = useState<LogEntry[]>(() => makeInitialLogs())
  const [nodes, setNodes]     = useState<MCPNode[]>(MCP_BASE)
  const [orchCount, setOrchCount] = useState(917)
  const logIdRef   = useRef(100)
  const logPoolRef = useRef(0)

  useEffect(() => {
    // Live log feed — new line every 2.4s
    const logTimer = setInterval(() => {
      const entry = LOG_POOL[logPoolRef.current % LOG_POOL.length]
      logPoolRef.current++
      setLogs((prev) => [
        { ...entry, id: ++logIdRef.current, ts: nowTs() },
        ...prev.slice(0, 10),
      ])
    }, 2400)

    // MCP node drift — latency + load fluctuate every 3s
    const nodeTimer = setInterval(() => {
      setNodes((prev) =>
        prev.map((n) => ({
          ...n,
          latency: Math.max(8, n.latency + Math.floor((Math.random() - 0.5) * 12)),
          load:    Math.max(10, Math.min(95, n.load + Math.floor((Math.random() - 0.5) * 8))),
        }))
      )
    }, 3000)

    // Orchestration counter — ticks every 1.1s
    const orchTimer = setInterval(() => {
      setOrchCount((c) => c + Math.floor(Math.random() * 3) + 1)
    }, 1100)

    return () => {
      clearInterval(logTimer)
      clearInterval(nodeTimer)
      clearInterval(orchTimer)
    }
  }, [])

  const METRICS = [
    { label: 'Uptime',        value: '99.94', unit: '%',  delta: '+0.01% (30d)',    accent: '#34d399' },
    { label: 'Requests / min', value: '1,284', unit: '',  delta: '+8.3% vs baseline', accent: '#f59e0b' },
    { label: 'Memory Used',   value: '62',    unit: '%',  delta: 'nominal',          accent: '#f59e0b' },
    { label: 'Tasks / hr',    value: orchCount.toLocaleString(), unit: '', delta: '● live', accent: '#22d3ee' },
  ]

  return (
    <div className="relative min-h-screen bg-[#060610]">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="absolute -top-60 left-1/3 h-[700px] w-[700px] rounded-full bg-amber-500/5 blur-[160px]" />
        <div className="absolute right-0 bottom-1/4 h-[500px] w-[500px] rounded-full bg-orange-500/4 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-amber-400/3 blur-[140px]" />
        <div className="[
    'absolute inset-0 opacity-[0.025]',
    '[background-image:linear-gradient(rgba(251,191,36,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(251,191,36,0.35)_1px,transparent_1px)]',
    '[background-size:60px_60px]',
  ].join(' ')" />
      </div>

      <Navigation />

      {/* Status strip */}
      <div className="border-b border-amber-500/15 bg-amber-500/[0.03]">
        <div className="[
    'mx-auto flex max-w-[1400px] items-center gap-5 overflow-x-auto px-4 py-2 lg:px-6',
    '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
  ].join(' ')">
          <div className="flex flex-shrink-0 items-center gap-2">
            <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-emerald-400" >All Systems Operational</span>
          </div>
          <span className="h-3 w-px flex-shrink-0 bg-white/10" />
          <span className="flex-shrink-0 font-mono text-[9px] uppercase tracking-[0.16em] text-white/30" >99.94% Uptime</span>
          <span className="h-3 w-px flex-shrink-0 bg-white/10" />
          <span className="flex-shrink-0 font-mono text-[9px] uppercase tracking-[0.16em] text-white/30" >US-EAST-1</span>
          <span className="h-3 w-px flex-shrink-0 bg-white/10" />
          <span className="flex-shrink-0 font-mono text-[9px] uppercase tracking-[0.16em] text-white/30" >Kubernetes</span>
          <span className="h-3 w-px flex-shrink-0 bg-white/10" />
          <span className="flex-shrink-0 font-mono text-[9px] uppercase tracking-[0.16em] text-white/30" >7 Services Active</span>
          <span className="h-3 w-px flex-shrink-0 bg-white/10" />
          <span className="flex-shrink-0 font-mono text-[9px] uppercase tracking-[0.16em] text-white/30" >4 MCP Nodes</span>
          <span className="h-3 w-px flex-shrink-0 bg-white/10" />
          <span className="flex-shrink-0 font-mono text-[9px] uppercase tracking-[0.16em] text-white/30" style={{ color: 'rgba(251,191,36,0.75)' }}>
            {orchCount.toLocaleString()} tasks/hr
          </span>
          <span className="h-3 w-px flex-shrink-0 bg-white/10" />
          <span className="flex-shrink-0 font-mono text-[9px] uppercase tracking-[0.16em] text-white/30" >148 Containers</span>
          <span className="h-3 w-px flex-shrink-0 bg-white/10" />
          <span className="flex-shrink-0 font-mono text-[9px] uppercase tracking-[0.16em] text-white/30" >2 Alerts</span>
        </div>
      </div>

      <main className="mx-auto max-w-[1400px] px-4 pb-24 pt-6 lg:px-6">
        {/* Masthead */}
        <div className="mb-6 flex items-start justify-between border-b border-white/5 pb-6">
          <div className="max-w-xl">
            <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.22em] text-amber-400/50" >
              JOOTACEE
              <span className="mx-1 text-white/15">/</span>
              INFRASTRUCTURE
              <span className="mx-1 text-white/15">/</span>
              OPS CENTER
            </div>
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-white/90 lg:text-4xl" >
              AI Operations <span className="text-amber-400">Center</span>
            </h1>
            <p className="mt-2 text-[13px] font-light leading-relaxed text-white/30" >
              Real-time orchestration visibility across the full service mesh — containerized runtime, MCP protocol layer, and autonomous agent pipeline unified in one operational surface.
            </p>
          </div>

          <div className="hidden text-right lg:block">
            <div className="font-mono text-5xl font-semibold tabular-nums text-emerald-400" >99.94<span style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.3)' }}>%</span></div>
            <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-white/20" >System Uptime</div>
            <div className="mt-3 space-y-1">
              <div className="font-mono text-[10px] text-white/25">Region <span className="text-amber-400/70">us-east-1</span></div>
              <div className="font-mono text-[10px] text-white/25">Orchestrator <span className="text-amber-400/70">kubernetes</span></div>
              <div className="font-mono text-[10px] text-white/25">Runtime <span className="text-amber-400/70">containerd</span></div>
            </div>
          </div>
        </div>

        {/* Metrics rail */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {METRICS.map((m) => (
            <div key={m.label} className="relative overflow-hidden rounded-xl border border-white/6 bg-white/[0.025] px-5 py-4">
              <div className="absolute left-0 top-0 h-full w-[2px]" style={{ background: m.accent }} />
              <div className="font-mono text-[22px] font-semibold tabular-nums leading-none text-white/90" >
                {m.value}
                {m.unit && <span className="ml-1 font-mono text-sm font-normal text-white/30">{m.unit}</span>}
              </div>
              <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.18em] text-white/25" >{m.label}</div>
              <div className="mt-1 font-mono text-[9px] text-emerald-400/80">{m.delta}</div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
          {/* ── Left column ──────────────────────────────────── */}
          <div className="space-y-4">
            {/* Service states */}
            <div className="overflow-hidden rounded-xl border border-white/6 bg-white/[0.02]">
              <div className="flex items-center justify-between border-b border-white/5 px-5 py-3" >
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35" >Service States</span>
                <span className="font-mono text-[9px] text-amber-400/60">
                  <span className="font-mono text-[9px] text-white/18">{SERVICES.length} services · </span>
                  all running
                </span>
              </div>
              <div className="">
                {SERVICES.map((svc) => {
                  const cpuColor =
                    svc.cpu > 70 ? '#f87171' :
                    svc.cpu > 40 ? '#f59e0b' :
                    'rgba(52,211,153,0.7)'
                  const memColor =
                    svc.mem > 70 ? '#f87171' :
                    svc.mem > 50 ? '#f59e0b' :
                    'rgba(34,211,238,0.65)'
                  return (
                    <div key={svc.name} className="[
    'flex items-center gap-4 px-5 py-2.5 border-b border-white/[0.04]',
    'last:border-0 transition-colors hover:bg-white/[0.015]',
  ].join(' ')">
                      <span
                        className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                        style={{ background: '#34d399', boxShadow: '0 0 4px #34d399' }}
                      />
                      <span className="w-[136px] flex-shrink-0 font-mono text-[11px] text-white/65" >{svc.name}</span>
                      <span className="hidden w-[96px] flex-shrink-0 font-mono text-[9px] uppercase tracking-[0.1em] text-white/22 sm:block" >{svc.role}</span>
                      <div className="flex flex-1 flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-7 flex-shrink-0 font-mono text-[8px] uppercase text-white/18 text-right" >cpu</span>
                          <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/6">
                            <div
                              className="h-full rounded-full transition-[width] duration-1000"
                              style={{ width: `${svc.cpu}%`, background: cpuColor }}
                            />
                          </div>
                          <span className="w-7 flex-shrink-0 font-mono text-[9px] tabular-nums text-white/30">{svc.cpu}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-7 flex-shrink-0 font-mono text-[8px] uppercase text-white/18 text-right" >mem</span>
                          <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/6">
                            <div
                              className="h-full rounded-full transition-[width] duration-1000"
                              style={{ width: `${svc.mem}%`, background: memColor }}
                            />
                          </div>
                          <span className="w-7 flex-shrink-0 font-mono text-[9px] tabular-nums text-white/30">{svc.mem}%</span>
                        </div>
                      </div>
                      <span className="hidden w-[56px] flex-shrink-0 font-mono text-[9px] tabular-nums text-white/22 lg:block" >{svc.uptime}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Orchestration feed */}
            <div className="overflow-hidden rounded-xl border border-white/6 bg-[#040410]" >
              <div className="flex items-center gap-2.5 border-b border-white/5 px-4 py-2.5" >
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: 'rgba(248,113,113,0.6)' }} />
                  <span className="h-2 w-2 rounded-full" style={{ background: 'rgba(245,158,11,0.6)' }} />
                  <span className="h-2 w-2 rounded-full" style={{ background: 'rgba(52,211,153,0.6)' }} />
                </div>
                <span className="ml-2 font-mono text-[9px] uppercase tracking-[0.2em] text-white/22" >Orchestration Feed</span>
                <span className="ml-auto font-mono text-[9px] tabular-nums text-amber-400/55">
                  {orchCount.toLocaleString()} tasks dispatched
                </span>
              </div>
              <div className="[
    'max-h-[224px] overflow-hidden p-4 font-mono text-[10px] leading-[1.8]',
    '[&>*:first-child]:opacity-100',
  ].join(' ')">
                {logs.map((line) => (
                  <div key={line.id} className="flex items-start gap-3 py-px">
                    <span className="flex-shrink-0 tabular-nums text-white/18">{line.ts}</span>
                    <LogLevelTag level={line.level} />
                    <span className="flex-shrink-0 text-white/30">{line.service}</span>
                    <span className="text-white/45 break-all">{line.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right column ─────────────────────────────────── */}
          <div className="space-y-4">
            {/* MCP node health */}
            <div className="overflow-hidden rounded-xl border border-white/6 bg-white/[0.02]">
              <div className="flex items-center justify-between border-b border-white/5 px-5 py-3" >
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35" >MCP Node Health</span>
                <span className="font-mono text-[9px] text-white/18">4 nodes · 1 degraded</span>
              </div>
              <div className="grid grid-cols-2 gap-3 p-4">
                {nodes.map((node) => {
                  const isOnline   = node.state === 'online'
                  const isDegraded = node.state === 'degraded'
                  const dotBg =
                    isOnline   ? '#34d399' :
                    isDegraded ? '#f59e0b' :
                    '#f87171'
                  const loadColor =
                    node.load > 75 ? '#f87171' :
                    node.load > 50 ? '#f59e0b' :
                    '#34d399'
                  return (
                    <div key={node.id} className="overflow-hidden rounded-lg border border-white/6 bg-white/[0.015] p-3" >
                      <div className="mb-2.5 flex items-start justify-between">
                        <div>
                          <div className="font-mono text-[10px] font-medium text-white/58">{node.id}</div>
                          <div className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.1em] text-white/22" >{node.role}</div>
                        </div>
                        <span
                          className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                          style={{
                            background: dotBg,
                            boxShadow: isOnline ? `0 0 5px ${dotBg}` : 'none',
                          }}
                        />
                      </div>
                      <div className="mb-2 h-[3px] overflow-hidden rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full transition-[width] duration-1000"
                          style={{ width: `${node.load}%`, background: loadColor }}
                        />
                      </div>
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="font-mono text-[13px] font-semibold tabular-nums text-white/70" >{node.latency}</span>
                          <span className="ml-0.5 font-mono text-[9px] text-white/25">ms</span>
                        </div>
                        <span className="font-mono text-[9px] tabular-nums text-white/30">{node.load}% load</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Deployment pipeline */}
            <div className="overflow-hidden rounded-xl border border-white/6 bg-white/[0.02]">
              <div className="flex items-center justify-between border-b border-white/5 px-5 py-3" >
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35" >Deployment Pipeline</span>
                <span className="font-mono text-[9px] text-white/18">5 recent</span>
              </div>
              <div className="">
                {DEPLOYMENTS.map((d) => (
                  <div key={d.service} className="[
    'flex items-center gap-3 px-4 py-3 border-b border-white/[0.04]',
    'last:border-0',
  ].join(' ')">
                    <DeployIndicator status={d.status} />
                    <span className="flex-1 font-mono text-[11px] text-white/60">{d.service}</span>
                    <span className="font-mono text-[9px] text-white/22">{d.version}</span>
                    <span className="rounded border border-white/8 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.1em] text-white/25" >{d.env}</span>
                    <DeployStatusLabel status={d.status} />
                    <span className="font-mono text-[9px] text-white/18">{d.ago}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Runtime alerts */}
            <div className="overflow-hidden rounded-xl border border-white/6 bg-white/[0.02]">
              <div className="flex items-center justify-between border-b border-white/5 px-5 py-3" >
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35" >Runtime Alerts</span>
                <span style={{ color: 'rgba(248,113,113,0.7)' }} className="font-mono text-[9px] text-white/18">
                  2 active
                </span>
              </div>
              {[
                {
                  svc: 'mcp-tools-03',
                  msg: 'Tool executor load at 82% — latency degraded',
                  sev: 'warn' as const,
                  age: '14m ago',
                },
                {
                  svc: 'graphrag-svc',
                  msg: 'Memory compaction delay — queued 3 retries',
                  sev: 'warn' as const,
                  age: '28m ago',
                },
              ].map((alert) => (
                <div
                  key={alert.svc}
                  className="flex items-start gap-3 border-b border-white/[0.04] px-4 py-3 last:border-0"
                >
                  <span
                    className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                    style={{ background: '#f59e0b', boxShadow: '0 0 4px #f59e0b' }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-[10px] text-amber-400/80">{alert.svc}</div>
                    <div className="font-mono text-[10px] text-white/40 leading-relaxed">{alert.msg}</div>
                  </div>
                  <span className="font-mono text-[9px] text-white/18 flex-shrink-0">{alert.age}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Observability row */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Throughput */}
          <div className="overflow-hidden rounded-xl border border-white/6 bg-white/[0.02] px-5 pb-5 pt-4" >
            <div
              className="mb-3 h-[1px] w-full"
              style={{ background: 'linear-gradient(90deg, rgba(245,158,11,0.6), transparent)' }}
            />
            <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.2em] text-white/28" >Throughput</div>
            <div>
              <span className="font-mono text-[28px] font-semibold tabular-nums leading-none text-white/90" >1,284</span>
              <span className="ml-1 font-mono text-sm font-normal text-white/28">req/min</span>
            </div>
            <div className="mt-1 font-mono text-[9px] text-white/22">+8.3% vs 7-day avg · SLO: &gt;800</div>
            <div className="mt-4 flex items-end gap-[2px] h-10">
              {SPARK_THROUGHPUT.map((h, i) => (
                <div
                  key={i}
                  className="min-w-0 flex-1 rounded-sm"
                  style={{
                    height: `${h}%`,
                    background: `rgba(245,158,11,${0.15 + (h / 100) * 0.6})`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Error rate */}
          <div className="overflow-hidden rounded-xl border border-white/6 bg-white/[0.02] px-5 pb-5 pt-4" >
            <div
              className="mb-3 h-[1px] w-full"
              style={{ background: 'linear-gradient(90deg, rgba(52,211,153,0.6), transparent)' }}
            />
            <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.2em] text-white/28" >Error Rate</div>
            <div>
              <span className="font-mono text-[28px] font-semibold tabular-nums leading-none text-white/90" >0.04</span>
              <span className="ml-1 font-mono text-sm font-normal text-white/28">%</span>
            </div>
            <div className="mt-1 font-mono text-[9px] text-white/22">Well below threshold · SLO: &lt;0.5%</div>
            <div className="mt-4 flex items-end gap-[2px] h-10">
              {SPARK_ERRORS.map((h, i) => (
                <div
                  key={i}
                  className="min-w-0 flex-1 rounded-sm"
                  style={{
                    height: `${Math.max(5, h * 9)}%`,
                    background: h > 1 ? 'rgba(248,113,113,0.55)' : 'rgba(52,211,153,0.35)',
                  }}
                />
              ))}
            </div>
          </div>

          {/* P99 Latency */}
          <div className="overflow-hidden rounded-xl border border-white/6 bg-white/[0.02] px-5 pb-5 pt-4" >
            <div
              className="mb-3 h-[1px] w-full"
              style={{ background: 'linear-gradient(90deg, rgba(34,211,238,0.6), transparent)' }}
            />
            <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.2em] text-white/28" >P99 Latency</div>
            <div>
              <span className="font-mono text-[28px] font-semibold tabular-nums leading-none text-white/90" >42</span>
              <span className="ml-1 font-mono text-sm font-normal text-white/28">ms</span>
            </div>
            <div className="mt-1 font-mono text-[9px] text-white/22">SLO: &lt;100ms · p50: 18ms</div>
            <div className="mt-4 flex items-end gap-[2px] h-10">
              {SPARK_LATENCY.map((h, i) => (
                <div
                  key={i}
                  className="min-w-0 flex-1 rounded-sm"
                  style={{
                    height: `${h}%`,
                    background: `rgba(34,211,238,${0.12 + (h / 100) * 0.5})`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
