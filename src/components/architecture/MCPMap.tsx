'use client'

import { motion } from 'framer-motion'
import type { ArchitectureEdge, ArchitectureNode } from '@/lib/architecture/types'

function nodeColor(kind: ArchitectureNode['kind']) {
  if (kind === 'core') return 'rgba(110,247,255,0.95)'
  if (kind === 'agent') return 'rgba(73,183,255,0.95)'
  if (kind === 'protocol') return 'rgba(140,219,255,0.95)'
  if (kind === 'memory') return 'rgba(158,198,255,0.95)'
  if (kind === 'ops') return 'rgba(97,172,255,0.95)'
  return 'rgba(137,240,255,0.95)'
}

function edgeOpacity(bandwidth: ArchitectureEdge['bandwidth']) {
  if (bandwidth === 'high') return 0.65
  if (bandwidth === 'medium') return 0.42
  return 0.24
}

export function MCPMap({ nodes, edges }: { nodes: ArchitectureNode[]; edges: ArchitectureEdge[] }) {
  const nodeById = new Map(nodes.map((node) => [node.id, node]))

  return (
    <div className="glass rounded-2xl p-5">
      <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-primary">MCP Map</p>
      <svg viewBox="0 0 100 100" className="h-[360px] w-full">
        <defs>
          <linearGradient id="edgeGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(110,247,255,0.9)" />
            <stop offset="100%" stopColor="rgba(73,183,255,0.5)" />
          </linearGradient>
        </defs>

        {edges.map((edge) => {
          const from = nodeById.get(edge.from)
          const to = nodeById.get(edge.to)
          if (!from || !to) return null

          return (
            <motion.line
              key={`${edge.from}-${edge.to}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="url(#edgeGradient)"
              strokeWidth={0.8}
              strokeOpacity={edgeOpacity(edge.bandwidth)}
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
            />
          )
        })}

        {nodes.map((node) => (
          <g key={node.id}>
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={2.2}
              fill={nodeColor(node.kind)}
              initial={{ scale: 0.7, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
            />
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={3.4}
              fill="none"
              stroke={nodeColor(node.kind)}
              strokeOpacity={0.38}
              strokeWidth={0.45}
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1.15, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            />
            <text
              x={node.x}
              y={node.y + 5.4}
              textAnchor="middle"
              fontSize="2.35"
              fill="rgba(210,231,255,0.9)"
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
