'use client'

import { useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

function ProceduralMesh({ complexity }: { complexity: number }) {
  const geometry = useMemo(() => {
    return new THREE.IcosahedronGeometry(1, complexity)
  }, [complexity])

  return (
    <mesh geometry={geometry} rotation={[0.6, 0.5, 0]}>
      <meshStandardMaterial color="#6ec5ff" wireframe metalness={0.12} roughness={0.25} />
    </mesh>
  )
}

export function STLLab() {
  const [prompt, setPrompt] = useState('Parametric drone hull with airflow channels')
  const [complexity, setComplexity] = useState(1)

  const handleExport = () => {
    const payload = {
      type: 'stl-export-simulated',
      prompt,
      complexity,
      generatedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'stl-simulation-export.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="glass rounded-2xl p-5">
      <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-primary">STL AI / Prompt + 3D + Export</p>

      <div className="mb-3 space-y-2">
        <label htmlFor="stl-prompt" className="text-xs text-muted-foreground">Prompt</label>
        <textarea
          id="stl-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="h-20 w-full rounded-lg border border-border bg-card/60 px-3 py-2 text-sm outline-none ring-primary focus:ring-2"
        />
      </div>

      <div className="mb-4 grid grid-cols-[1fr_auto] items-center gap-3">
        <input
          type="range"
          min={0}
          max={3}
          step={1}
          value={complexity}
          onChange={(e) => setComplexity(Number(e.target.value))}
        />
        <span className="rounded-full border border-border px-2 py-1 text-[11px] text-muted-foreground">detail {complexity}</span>
      </div>

      <div className="h-52 overflow-hidden rounded-lg border border-border bg-card/50">
        <Canvas camera={{ position: [0, 0, 3.3], fov: 55 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[2, 2, 1]} intensity={0.75} />
          <ProceduralMesh complexity={complexity} />
          <OrbitControls enablePan={false} minDistance={2.2} maxDistance={4.2} autoRotate autoRotateSpeed={0.7} />
        </Canvas>
      </div>

      <button
        type="button"
        onClick={handleExport}
        className="mt-4 w-full rounded-lg border border-primary/45 bg-primary/15 px-3 py-2 text-xs uppercase tracking-[0.16em] text-primary transition hover:bg-primary/25"
      >
        Export STL Simulation
      </button>
    </div>
  )
}
