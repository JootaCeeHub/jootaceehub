'use client'

import { useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

function ProceduralMesh({ complexity }: { complexity: number }) {
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(1, complexity), [complexity])
  return (
    <mesh geometry={geometry} rotation={[0.6, 0.5, 0]}>
      <meshStandardMaterial color="#a78bfa" wireframe metalness={0.15} roughness={0.2} />
    </mesh>
  )
}

const COMPLEXITY_LABELS = ['Low', 'Medium', 'High', 'Ultra']
const VERTEX_COUNTS = [12, 42, 162, 642]

export function STLLab() {
  const [prompt, setPrompt] = useState('Parametric drone hull with airflow channels')
  const [complexity, setComplexity] = useState(1)

  const handleExport = () => {
    const payload = { type: 'stl-export-simulated', prompt, complexity, generatedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'stl-simulation-export.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/30">
          GEOMETRY ENGINE / SIMULATION
        </span>
        <span className="font-mono text-[10px] text-violet-400/70">
          {VERTEX_COUNTS[complexity]} verts
        </span>
      </div>

      {/* Prompt */}
      <div className="space-y-1.5">
        <label htmlFor="stl-prompt" className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/25">
          Natural Language Prompt
        </label>
        <textarea
          id="stl-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={2}
          className="w-full resize-none rounded-lg border border-white/8 bg-white/3 px-3 py-2 font-mono text-[12px] text-white/65 outline-none transition-colors focus:border-violet-400/25 focus:bg-white/4"
        />
      </div>

      {/* Complexity control */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/25 w-20 shrink-0">
          Complexity
        </span>
        <input
          type="range"
          min={0}
          max={3}
          step={1}
          value={complexity}
          onChange={(e) => setComplexity(Number(e.target.value))}
          className="flex-1 accent-violet-400"
        />
        <span className="font-mono text-[10px] text-violet-400 w-14 text-right">
          {COMPLEXITY_LABELS[complexity]}
        </span>
      </div>

      {/* 3D Viewport */}
      <div className="overflow-hidden rounded-lg border border-white/6 bg-black/40" style={{ height: '200px' }}>
        <Canvas camera={{ position: [0, 0, 3.3], fov: 55 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[2, 2, 1]} intensity={0.8} />
          <ProceduralMesh complexity={complexity} />
          <OrbitControls enablePan={false} minDistance={2.2} maxDistance={4.2} autoRotate autoRotateSpeed={0.8} />
        </Canvas>
      </div>

      {/* Export */}
      <button
        type="button"
        onClick={handleExport}
        className="w-full rounded-lg border border-violet-400/20 bg-violet-400/6 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-violet-400 transition-colors hover:bg-violet-400/12"
      >
        Export STL Simulation
      </button>

      <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/15">
        LLM prompt parsing · procedural mesh synthesis · simulation mode
      </div>
    </div>
  )
}
