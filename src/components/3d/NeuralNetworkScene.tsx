'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber'
import { Line, Points, shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useSceneConfig } from '@/hooks/useSceneConfig'
import type { DeviceTier } from '@/lib/visuals/types'
import type { VisualTelemetryAggregate } from '@/lib/visuals/telemetry/types'
import { addTelemetryEvent, getTelemetryAggregate } from '@/lib/visuals/telemetry/store-client'

const HoloMaterial = shaderMaterial(
  { uTime: 0, uOpacity: 0.2, uColorA: new THREE.Color('#49b7ff'), uColorB: new THREE.Color('#6ef7ff') },
  `
    varying vec2 vUv;
    varying vec3 vNormal;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  `
    uniform float uTime;
    uniform float uOpacity;
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    varying vec2 vUv;
    varying vec3 vNormal;

    void main() {
      float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 1.8);
      float wave = sin(vUv.y * 18.0 + uTime * 0.6) * 0.5 + 0.5;
      vec3 color = mix(uColorA, uColorB, wave);
      float alpha = (0.2 + fresnel * 0.8) * uOpacity;
      gl_FragColor = vec4(color, alpha);
    }
  `
)

extend({ HoloMaterial })

type HoloMaterialInstance = THREE.ShaderMaterial & {
  uTime: number
  uOpacity: number
}

function seededRandom(seed: number) {
  const value = Math.sin(seed * 10291.31) * 10000
  return value - Math.floor(value)
}

function AmbientParticles({ count, animated }: { count: number; animated: boolean }) {
  const pointsRef = useRef<THREE.Points>(null)

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      positions[i3] = (seededRandom(i + 3) - 0.5) * 12
      positions[i3 + 1] = (seededRandom(i + 31) - 0.5) * 8
      positions[i3 + 2] = (seededRandom(i + 73) - 0.5) * 12

      colors[i3] = 0.25 + seededRandom(i + 111) * 0.2
      colors[i3 + 1] = 0.56 + seededRandom(i + 171) * 0.18
      colors[i3 + 2] = 0.82 + seededRandom(i + 281) * 0.12
    }

    return { positions, colors }
  }, [count])

  useFrame(({ clock }) => {
    if (!animated) return
    if (!pointsRef.current) return
    const t = clock.elapsedTime
    pointsRef.current.rotation.y = t * 0.04
    pointsRef.current.rotation.x = Math.sin(t * 0.15) * 0.04
  })

  return (
    <Points ref={pointsRef} positions={particles.positions} colors={particles.colors}>
      <pointsMaterial
        transparent
        vertexColors
        size={0.028}
        sizeAttenuation
        depthWrite={false}
        opacity={0.85}
      />
    </Points>
  )
}

function NeuralLines({ count, animated }: { count: number; animated: boolean }) {
  const groupRef = useRef<THREE.Group>(null)

  const lines = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      start: [
        (seededRandom(i + 11) - 0.5) * 8.4,
        (seededRandom(i + 121) - 0.5) * 6,
        (seededRandom(i + 211) - 0.5) * 8.4,
      ] as [number, number, number],
      end: [
        (seededRandom(i + 311) - 0.5) * 8.4,
        (seededRandom(i + 411) - 0.5) * 6,
        (seededRandom(i + 511) - 0.5) * 8.4,
      ] as [number, number, number],
    }))
  }, [count])

  useFrame(({ clock }) => {
    if (!animated) return
    if (!groupRef.current) return
    const t = clock.elapsedTime
    groupRef.current.rotation.y = t * 0.025
    groupRef.current.rotation.x = Math.sin(t * 0.2) * 0.03
  })

  return (
    <group ref={groupRef}>
      {lines.map((line, index) => (
        <Line key={`${line.start[0]}-${line.end[0]}-${index}`} points={[line.start, line.end]} color="#5ebdff" opacity={0.2} lineWidth={1} />
      ))}
    </group>
  )
}

function HolographicCore({ radius, opacity, animated }: { radius: number; opacity: number; animated: boolean }) {
  const coreRef = useRef<THREE.Mesh>(null)
  const shellRef = useRef<THREE.Mesh>(null)
  const shellMaterial = useMemo(() => new HoloMaterial(), [])

  useFrame(({ clock }) => {
    if (!animated) return
    const t = clock.elapsedTime
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.2
      const pulse = 1 + Math.sin(t * 1.5) * 0.04
      coreRef.current.scale.set(pulse, pulse, pulse)
    }

    if (shellRef.current) {
      shellRef.current.rotation.y = -t * 0.15
      shellRef.current.rotation.z = t * 0.08
      const mat = shellRef.current.material as unknown as HoloMaterialInstance
      mat.uTime = t
      mat.uOpacity = opacity
    }
  })

  return (
    <group>
      <mesh ref={coreRef}>
        <sphereGeometry args={[radius, 42, 42]} />
        <meshBasicMaterial color="#3ea6eb" transparent opacity={0.08} wireframe />
      </mesh>

      <mesh ref={shellRef}>
        <torusKnotGeometry args={[radius * 0.72, radius * 0.09, 160, 22]} />
        <primitive object={shellMaterial} attach="material" transparent depthWrite={false} />
      </mesh>
    </group>
  )
}

function ParallaxGroup({
  parallaxStrength,
  animated,
  children,
}: {
  parallaxStrength: number
  animated: boolean
  children: React.ReactNode
}) {
  const groupRef = useRef<THREE.Group>(null)
  const { pointer } = useThree()

  useFrame(() => {
    if (!animated) return
    if (!groupRef.current) return
    const targetX = pointer.x * parallaxStrength
    const targetY = pointer.y * (parallaxStrength * 0.6)
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.03)
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.03)
  })

  return <group ref={groupRef}>{children}</group>
}

function AdaptiveBudget({
  onQualityChange,
}: {
  onQualityChange: (quality: number) => void
}) {
  const sampleRef = useRef<{ time: number; frames: number; quality: number }>({
    time: 0,
    frames: 0,
    quality: 1,
  })

  useFrame((state, delta) => {
    const sample = sampleRef.current
    sample.time += delta
    sample.frames += 1

    if (sample.time < 1.5) return

    const fps = sample.frames / sample.time
    let next = sample.quality

    if (fps < 38 && sample.quality > 0.65) {
      next = sample.quality - 0.1
    } else if (fps > 54 && sample.quality < 1) {
      next = sample.quality + 0.06
    }

    next = Math.max(0.6, Math.min(1, next))

    if (Math.abs(next - sample.quality) > 0.025) {
      sample.quality = next
      onQualityChange(next)
    }

    sample.frames = 0
    sample.time = 0
    state.performance.regress()
  })

  return null
}

function ControlPanel({
  enabled,
  open,
  onToggle,
  onQualityReset,
  aggregate,
}: {
  enabled: boolean
  open: boolean
  onToggle: () => void
  onQualityReset: () => void
  aggregate: VisualTelemetryAggregate | null
}) {
  if (!enabled) return null

  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        className="absolute left-5 top-5 z-20 rounded-md border border-border bg-background/70 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
      >
        3D Panel
      </button>
      {open ? (
        <div className="absolute left-5 top-14 z-20 w-[280px] rounded-lg border border-border bg-background/85 p-3 font-mono text-[11px] text-muted-foreground backdrop-blur-md">
          <p className="mb-2 text-foreground">Runtime Controls</p>
          <button
            type="button"
            onClick={onQualityReset}
            className="mb-3 rounded-md border border-border px-2 py-1 text-[10px] uppercase tracking-[0.18em] hover:border-primary/40"
          >
            Reset Adaptive Quality
          </button>
          <div className="space-y-1">
            <p>Samples: {aggregate?.sampleCount ?? 0}</p>
            <p>Avg FPS: {aggregate?.averageFps ?? 0}</p>
            <p>Avg Quality: {aggregate?.averageQuality ?? 0}</p>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default function NeuralNetworkScene({ initialTier }: { initialTier?: DeviceTier }) {
  const { config, source } = useSceneConfig(initialTier)
  const reducedMotion = usePrefersReducedMotion()
  const [adaptiveQuality, setAdaptiveQuality] = useState(1)
  const [panelOpen, setPanelOpen] = useState(false)
  const [aggregate, setAggregate] = useState<VisualTelemetryAggregate | null>(null)
  const panelEnabled = process.env.NEXT_PUBLIC_ENABLE_3D_CONTROL_PANEL === 'true'
  const sessionId = useId()
  const quality = reducedMotion ? Math.min(adaptiveQuality, 0.62) : adaptiveQuality

  const counts = useMemo(() => {
    const scaledParticles = Math.max(520, Math.floor(config.particleCount * quality))
    const scaledLines = Math.max(16, Math.floor(config.lineCount * quality))
    return { particles: scaledParticles, lines: scaledLines }
  }, [config.lineCount, config.particleCount, quality])

  useEffect(() => {
    if (!panelEnabled) return
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'o') {
        setPanelOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [panelEnabled])

  useEffect(() => {
    let active = true
    const post = () => {
      addTelemetryEvent({
        timestamp: Date.now(),
        sessionId,
        tier: config.tier,
        fps: Math.round(60 * quality),
        quality: Number(quality.toFixed(3)),
        reducedMotion,
        source,
        particles: counts.particles,
        lines: counts.lines,
      })
      if (!active) return
      if (panelEnabled && panelOpen) {
        const payload = getTelemetryAggregate()
        if (active) setAggregate(payload)
      }
    }
    post()

    return () => {
      active = false
    }
  }, [config.tier, counts.lines, counts.particles, panelEnabled, panelOpen, quality, reducedMotion, sessionId, source])

  return (
    <div className="absolute inset-0 -z-10">
      <ControlPanel
        enabled={panelEnabled}
        open={panelOpen}
        onToggle={() => setPanelOpen((prev) => !prev)}
        onQualityReset={() => setAdaptiveQuality(1)}
        aggregate={aggregate}
      />
      <Canvas
        camera={{ position: [0, 0, 6], fov: 58 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
      >
        <fog attach="fog" args={['#04060b', 6, 22]} />

        <ambientLight intensity={0.35} />
        <directionalLight position={[2, 4, 2]} intensity={0.55} color="#7ed8ff" />
        <pointLight position={[-2, -1, 2]} intensity={0.45} color="#4ba8ff" />

        <AdaptiveBudget onQualityChange={setAdaptiveQuality} />

        <ParallaxGroup parallaxStrength={config.parallaxStrength * quality} animated={!reducedMotion}>
          <AmbientParticles count={counts.particles} animated={!reducedMotion} />
          <NeuralLines count={counts.lines} animated={!reducedMotion} />
          <HolographicCore radius={config.sphereRadius} opacity={config.backgroundOpacity} animated={!reducedMotion} />
        </ParallaxGroup>
      </Canvas>

      <div className="pointer-events-none absolute bottom-5 right-5 rounded-md border border-border bg-background/45 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        3D {config.tier} / {source} / q{quality.toFixed(2)}
      </div>
    </div>
  )
}
