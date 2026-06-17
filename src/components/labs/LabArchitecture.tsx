'use client'

import type { ArchNode, ArchEdge } from '@/lib/labs/registry'

interface Props {
  nodes: ArchNode[]
  edges: ArchEdge[]
  accent: string
}

const NODE_W = 100
const NODE_H = 36
const HALF_W = NODE_W / 2
const HALF_H = NODE_H / 2

const NODE_TYPE_STYLE: Record<string, { stroke: string; fill: string }> = {
  source: { stroke: 'rgba(255,255,255,0.18)', fill: 'rgba(255,255,255,0.04)' },
  process: { stroke: 'rgba(255,255,255,0.12)', fill: 'rgba(255,255,255,0.03)' },
  model: { stroke: 'rgba(168,139,250,0.35)', fill: 'rgba(168,139,250,0.06)' },
  output: { stroke: 'rgba(255,255,255,0.18)', fill: 'rgba(255,255,255,0.04)' },
  store: { stroke: 'rgba(255,255,255,0.10)', fill: 'rgba(0,0,0,0.25)' },
}

export function LabArchitecture({ nodes, edges, accent }: Props) {
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]))

  return (
    <div className="overflow-hidden rounded-xl border border-white/6 bg-[#060610]">
      <svg
        viewBox="0 0 600 210"
        className="w-full"
        aria-label="System architecture diagram"
      >
        <defs>
          <pattern id="arch-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
          </pattern>
          <filter id="node-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="rgba(255,255,255,0.25)" />
          </marker>
          <marker id="arrowhead-accent" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill={accent} opacity="0.5" />
          </marker>
        </defs>

        {/* Background */}
        <rect width="600" height="210" fill="url(#arch-grid)" />

        {/* Accent glow at center */}
        <ellipse cx="300" cy="105" rx="180" ry="60" fill={accent} opacity="0.03" />

        {/* Edges */}
        {edges.map((edge, i) => {
          const from = nodeMap[edge.from]
          const to = nodeMap[edge.to]
          if (!from || !to) return null

          const fx = from.x
          const fy = from.y
          const tx = to.x
          const ty = to.y

          const dx = tx - fx
          const dy = ty - fy
          const len = Math.sqrt(dx * dx + dy * dy)
          const ux = dx / len
          const uy = dy / len

          const startX = fx + ux * HALF_W
          const startY = fy + uy * HALF_H
          const endX = tx - ux * HALF_W
          const endY = ty - uy * HALF_H

          const isAccent = from.type === 'model' || to.type === 'model'

          return (
            <g key={i}>
              <line
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke={isAccent ? accent : 'rgba(255,255,255,0.12)'}
                strokeWidth="1"
                strokeDasharray="4 3"
                opacity="0.7"
                markerEnd={edge.bidirectional ? undefined : (isAccent ? 'url(#arrowhead-accent)' : 'url(#arrowhead)')}
              />
              {edge.bidirectional && (
                <>
                  <line
                    x1={startX + 3}
                    y1={startY}
                    x2={endX + 3}
                    y2={endY}
                    stroke={accent}
                    strokeWidth="1"
                    strokeDasharray="4 3"
                    opacity="0.4"
                    markerEnd="url(#arrowhead-accent)"
                  />
                  <line
                    x1={endX - 3}
                    y1={endY}
                    x2={startX - 3}
                    y2={startY}
                    stroke={accent}
                    strokeWidth="1"
                    strokeDasharray="4 3"
                    opacity="0.4"
                    markerEnd="url(#arrowhead-accent)"
                  />
                </>
              )}
            </g>
          )
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const style = NODE_TYPE_STYLE[node.type] ?? NODE_TYPE_STYLE.process
          const isAccent = node.type === 'model'

          return (
            <g key={node.id}>
              {isAccent && (
                <rect
                  x={node.x - HALF_W - 1}
                  y={node.y - HALF_H - 1}
                  width={NODE_W + 2}
                  height={NODE_H + 2}
                  rx="5"
                  fill={accent}
                  opacity="0.08"
                />
              )}
              <rect
                x={node.x - HALF_W}
                y={node.y - HALF_H}
                width={NODE_W}
                height={NODE_H}
                rx="4"
                fill={style.fill}
                stroke={isAccent ? accent : style.stroke}
                strokeWidth={isAccent ? '1' : '0.75'}
                opacity={isAccent ? '1' : '0.9'}
              />
              <text
                x={node.x}
                y={node.y - 3}
                textAnchor="middle"
                fontSize="9"
                fontFamily="ui-monospace, monospace"
                fill="rgba(255,255,255,0.75)"
                fontWeight="500"
              >
                {node.label}
              </text>
              {node.sub && (
                <text
                  x={node.x}
                  y={node.y + 10}
                  textAnchor="middle"
                  fontSize="7.5"
                  fontFamily="ui-monospace, monospace"
                  fill="rgba(255,255,255,0.3)"
                >
                  {node.sub}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
