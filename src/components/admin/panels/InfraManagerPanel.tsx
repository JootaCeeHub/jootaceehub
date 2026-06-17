'use client'

import { useState, useMemo } from 'react'
import { useAdmin } from '@/lib/admin/store'
import type { InfraNode, DeployEntry, NodeStatus, DeployStatus } from '@/lib/admin/types'
import {
  cn, panel, stat, field, btn, section, grid, addForm, empty, statusSelectCva, visibilityBtn, deployDot,
  type StatusSelectProps,
} from '@/styles/ui'

const NODE_STATUSES: NodeStatus[] = ['running', 'degraded', 'stopped']
const DEPLOY_STATUSES: DeployStatus[] = ['success', 'pending', 'failed']
const DEPLOY_ENVS = ['production', 'staging', 'development', 'preview']

const BLANK_NODE: InfraNode = {
  name: '', role: '', image: '', status: 'running', cpu: '0%', mem: '0 MiB', uptime: '—', visible: true,
}
const BLANK_DEPLOY: DeployEntry = { service: '', version: '', env: 'production', status: 'success', timestamp: '' }

export default function InfraManagerPanel() {
  const { state, dispatch } = useAdmin()
  const { infraConfig } = state

  const [showAddNode, setShowAddNode] = useState(false)
  const [nodeForm, setNodeForm] = useState<InfraNode>({ ...BLANK_NODE })
  const [showAddDeploy, setShowAddDeploy] = useState(false)
  const [deployForm, setDeployForm] = useState<DeployEntry>({ ...BLANK_DEPLOY })

  const stats = useMemo(() => ({
    total: infraConfig.nodes.length,
    running: infraConfig.nodes.filter((n) => n.status === 'running').length,
    degraded: infraConfig.nodes.filter((n) => n.status === 'degraded').length,
    stopped: infraConfig.nodes.filter((n) => n.status === 'stopped').length,
  }), [infraConfig.nodes])

  function updateNode(name: string, data: Partial<InfraNode>) {
    dispatch({ type: 'UPDATE_INFRA_NODE', payload: { name, data } })
  }
  function removeNode(name: string) { dispatch({ type: 'REMOVE_INFRA_NODE', payload: name }) }

  function handleAddNode() {
    if (!nodeForm.name.trim()) return
    dispatch({ type: 'ADD_INFRA_NODE', payload: { ...nodeForm, name: nodeForm.name.trim() } })
    setNodeForm({ ...BLANK_NODE })
    setShowAddNode(false)
  }

  function handleAddDeploy() {
    if (!deployForm.service.trim()) return
    dispatch({ type: 'ADD_INFRA_DEPLOYMENT', payload: {
      ...deployForm,
      service: deployForm.service.trim(),
      timestamp: deployForm.timestamp.trim() || new Date().toISOString().slice(0, 16).replace('T', ' '),
    }})
    setDeployForm({ ...BLANK_DEPLOY })
    setShowAddDeploy(false)
  }

  function removeDeployment(index: number) {
    dispatch({ type: 'REMOVE_INFRA_DEPLOYMENT', payload: index })
  }

  const nodeCol = 'grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto_auto_auto] gap-2'
  const colCell = 'font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground/30'

  return (
    <div className={panel.root}>
      {/* Header */}
      <div>
        <div className={cn(panel.label, 'text-amber-400/70')}>Infrastructure Manager</div>
        <h1 className={panel.title}>Ops Center</h1>
        <p className={panel.subtitle}>
          {stats.running}/{stats.total} nodes running · {infraConfig.region} · {infraConfig.orchestrator}
        </p>
      </div>

      {/* Stats */}
      <div className={stat.grid}>
        {[
          { label: 'Total Nodes', value: stats.total, color: '' },
          { label: 'Running', value: stats.running, color: 'text-emerald-400' },
          { label: 'Degraded', value: stats.degraded, color: stats.degraded > 0 ? 'text-amber-400' : '' },
          { label: 'Stopped', value: stats.stopped, color: stats.stopped > 0 ? 'text-red-400' : '' },
        ].map((s) => (
          <div key={s.label} className={stat.card}>
            <div className={cn(stat.value, s.color)}>{s.value}</div>
            <div className={stat.label}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Config strip */}
      <div className="rounded-2xl border border-border/40 bg-card/30 p-4">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/50 mb-3">
          Cluster Configuration
        </div>
        <div className={grid.three}>
          {[
            { label: 'Region', key: 'region' as const },
            { label: 'Orchestrator', key: 'orchestrator' as const },
            { label: 'Version', key: 'version' as const },
          ].map((f) => (
            <div key={f.label} className={field.wrap}>
              <div className={field.label}>{f.label}</div>
              <input value={infraConfig[f.key] as string}
                onChange={(e) => dispatch({ type: 'UPDATE_INFRA_CONFIG', payload: { [f.key]: e.target.value } })}
                className="w-full rounded-xl border border-border/30 bg-background/60 px-3 py-2 font-mono text-xs text-amber-400/80 focus:border-amber-400/30 focus:outline-none transition-colors" />
            </div>
          ))}
        </div>
      </div>

      {/* Nodes section */}
      <div className={section.header}>
        <span className={section.title}>Container Nodes ({stats.total})</span>
        <button onClick={() => setShowAddNode((v) => !v)} className={btn.add}>
          {showAddNode ? '✕ Cancel' : '+ Add Node'}
        </button>
      </div>

      {/* Add node form */}
      {showAddNode && (
        <div className={addForm.wrap}>
          <div className={addForm.title}>New Node</div>
          <div className={grid.two}>
            <div className={field.wrap}>
              <div className={field.label}>Name *</div>
              <input placeholder="e.g. mcp-node-01" value={nodeForm.name}
                onChange={(e) => setNodeForm((p) => ({ ...p, name: e.target.value }))}
                className={field.input} />
            </div>
            <div className={field.wrap}>
              <div className={field.label}>Role</div>
              <input placeholder="worker / control-plane" value={nodeForm.role}
                onChange={(e) => setNodeForm((p) => ({ ...p, role: e.target.value }))}
                className={field.input} />
            </div>
          </div>
          <div className={grid.two}>
            <div className={field.wrap}>
              <div className={field.label}>Image</div>
              <input placeholder="nginx:alpine" value={nodeForm.image}
                onChange={(e) => setNodeForm((p) => ({ ...p, image: e.target.value }))}
                className={field.input} />
            </div>
            <div className={field.wrap}>
              <div className={field.label}>Status</div>
              <select value={nodeForm.status}
                onChange={(e) => setNodeForm((p) => ({ ...p, status: e.target.value as NodeStatus }))}
                className={field.select}>
                {NODE_STATUSES.map((st) => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>
          </div>
          <div className={grid.three}>
            {[
              { label: 'CPU Usage', key: 'cpu' as const, placeholder: '12%' },
              { label: 'Memory', key: 'mem' as const, placeholder: '512 MiB' },
              { label: 'Uptime', key: 'uptime' as const, placeholder: '14d 3h' },
            ].map((f) => (
              <div key={f.label} className={field.wrap}>
                <div className={field.label}>{f.label}</div>
                <input placeholder={f.placeholder} value={nodeForm[f.key]}
                  onChange={(e) => setNodeForm((p) => ({ ...p, [f.key]: e.target.value }))}
                  className={field.input} />
              </div>
            ))}
          </div>
          <div className={addForm.btns}>
            <button onClick={handleAddNode} disabled={!nodeForm.name.trim()} className={btn.primary}>
              Add Node
            </button>
            <button onClick={() => { setShowAddNode(false); setNodeForm({ ...BLANK_NODE }) }}
              className={btn.ghost}>Cancel</button>
          </div>
        </div>
      )}

      {/* Node table */}
      <div className="rounded-2xl border border-border/40 bg-card/20 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/20 px-4 py-2.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">Nodes</span>
          <span className="font-mono text-[9px] uppercase tracking-widest text-emerald-400">{stats.running} running</span>
        </div>
        <div className={cn(nodeCol, 'border-b border-border/10 px-4 py-2')}>
          {['Name / Image', 'Role', 'CPU', 'Memory', 'Uptime', 'Status', 'Show', ''].map((h) => (
            <span key={h} className={colCell}>{h}</span>
          ))}
        </div>

        {infraConfig.nodes.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className={empty.text}>No nodes registered yet.</p>
          </div>
        ) : (
          infraConfig.nodes.map((node) => (
            <div key={node.name}
              className={cn(nodeCol, 'items-center border-b border-border/10 px-4 py-2 transition-opacity', !node.visible && 'opacity-40')}>
              <div className="space-y-1 min-w-0">
                <input value={node.name}
                  onChange={(e) => updateNode(node.name, { name: e.target.value })}
                  className="w-full rounded-lg border border-border/20 bg-background/40 px-2 py-1 font-mono text-xs font-medium text-foreground focus:border-primary/30 focus:outline-none transition-colors" />
                <input value={node.image}
                  onChange={(e) => updateNode(node.name, { image: e.target.value })}
                  className="w-full rounded-lg border border-border/20 bg-background/40 px-2 py-1 font-mono text-[10px] text-muted-foreground/60 focus:border-primary/30 focus:outline-none transition-colors" />
              </div>
              {(['role', 'cpu', 'mem', 'uptime'] as const).map((k) => (
                <input key={k} value={node[k]}
                  onChange={(e) => updateNode(node.name, { [k]: e.target.value })}
                  className="w-full rounded-lg border border-border/20 bg-background/40 px-2 py-1 font-mono text-xs text-foreground focus:border-primary/30 focus:outline-none transition-colors" />
              ))}
              <select value={node.status}
                onChange={(e) => updateNode(node.name, { status: e.target.value as NodeStatus })}
                className={statusSelectCva({ status: node.status as StatusSelectProps['status'] })}>
                {NODE_STATUSES.map((st) => (
                  <option key={st} value={st} className="bg-background text-foreground normal-case">{st}</option>
                ))}
              </select>
              <button onClick={() => updateNode(node.name, { visible: !node.visible })}
                className={visibilityBtn({ visible: node.visible })}>
                {node.visible ? 'on' : 'off'}
              </button>
              <button onClick={() => removeNode(node.name)} className={btn.remove}>✕</button>
            </div>
          ))
        )}
      </div>

      {/* Deployments section */}
      <div className={section.header}>
        <span className={section.title}>Deployment Log ({infraConfig.deployments.length})</span>
        <button onClick={() => setShowAddDeploy((v) => !v)}
          className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-amber-400 hover:bg-amber-400/15 transition-colors cursor-pointer">
          {showAddDeploy ? '✕ Cancel' : '+ Log Deploy'}
        </button>
      </div>

      {/* Add deployment form */}
      {showAddDeploy && (
        <div className="rounded-2xl border border-amber-400/20 bg-card/40 p-4 space-y-3">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-amber-400/70 mb-2">New Deployment</div>
          <div className={grid.two}>
            <div className={field.wrap}>
              <div className={field.label}>Service *</div>
              <input placeholder="mcp-gateway" value={deployForm.service}
                onChange={(e) => setDeployForm((p) => ({ ...p, service: e.target.value }))}
                className="w-full rounded-xl border border-border/30 bg-background/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-amber-400/40 transition-colors" />
            </div>
            <div className={field.wrap}>
              <div className={field.label}>Version</div>
              <input placeholder="v2.1.0" value={deployForm.version}
                onChange={(e) => setDeployForm((p) => ({ ...p, version: e.target.value }))}
                className="w-full rounded-xl border border-border/30 bg-background/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-amber-400/40 transition-colors" />
            </div>
          </div>
          <div className={grid.three}>
            <div className={field.wrap}>
              <div className={field.label}>Environment</div>
              <select value={deployForm.env}
                onChange={(e) => setDeployForm((p) => ({ ...p, env: e.target.value }))}
                className="w-full rounded-xl border border-border/30 bg-background/60 px-3 py-2 text-sm text-foreground outline-none focus:border-amber-400/40 transition-colors cursor-pointer">
                {DEPLOY_ENVS.map((env) => <option key={env} value={env}>{env}</option>)}
              </select>
            </div>
            <div className={field.wrap}>
              <div className={field.label}>Status</div>
              <select value={deployForm.status}
                onChange={(e) => setDeployForm((p) => ({ ...p, status: e.target.value as DeployStatus }))}
                className="w-full rounded-xl border border-border/30 bg-background/60 px-3 py-2 text-sm text-foreground outline-none focus:border-amber-400/40 transition-colors cursor-pointer">
                {DEPLOY_STATUSES.map((st) => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>
            <div className={field.wrap}>
              <div className={field.label}>Timestamp</div>
              <input placeholder="2026-06-01 14:30" value={deployForm.timestamp}
                onChange={(e) => setDeployForm((p) => ({ ...p, timestamp: e.target.value }))}
                className="w-full rounded-xl border border-border/30 bg-background/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-amber-400/40 transition-colors" />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={handleAddDeploy} disabled={!deployForm.service.trim()}
              className="rounded-xl bg-amber-400/20 border border-amber-400/30 px-5 py-2 font-mono text-[10px] uppercase tracking-wider text-amber-400 hover:bg-amber-400/30 transition-colors cursor-pointer">
              Log Deployment
            </button>
            <button onClick={() => { setShowAddDeploy(false); setDeployForm({ ...BLANK_DEPLOY }) }}
              className={btn.ghost}>Cancel</button>
          </div>
        </div>
      )}

      {/* Deploy log */}
      <div className="rounded-2xl border border-border/40 bg-card/20 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/20 px-4 py-2.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">Entries</span>
          <span className="font-mono text-[9px] text-muted-foreground/40">{infraConfig.deployments.length} total</span>
        </div>
        {infraConfig.deployments.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className={empty.text}>No deployments logged yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/10">
            {[...infraConfig.deployments].reverse().map((d, ri) => {
              const i = infraConfig.deployments.length - 1 - ri
              return (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                  <span className={deployDot({ status: d.status })} />
                  <span className="flex-1 font-mono text-xs text-foreground/70">{d.service}</span>
                  <span className="font-mono text-[10px] text-muted-foreground/40">{d.version}</span>
                  <span className="rounded border border-border/20 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground/40">{d.env}</span>
                  <span className={cn(
                    'font-mono text-[10px] uppercase tracking-wider',
                    d.status === 'success' && 'text-emerald-400',
                    d.status === 'pending' && 'text-amber-400',
                    d.status === 'failed' && 'text-red-400',
                  )}>{d.status}</span>
                  <span className="font-mono text-[9px] text-muted-foreground/30">{d.timestamp}</span>
                  <button onClick={() => removeDeployment(i)}
                    className="rounded border border-destructive/15 px-1.5 py-0.5 font-mono text-[9px] text-destructive hover:bg-destructive/10 transition-colors cursor-pointer">
                    ✕
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
