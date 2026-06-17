'use client'

import { useEffect, useRef } from 'react'
import { useVisualConfig } from '@/hooks/useVisualConfig'

interface BorderBeamProps {
  colorFrom?: string
  colorTo?: string
  duration?: number
  delay?: number
  size?: number
}

export function BorderBeam({
  colorFrom = 'rgba(73,183,255,0.9)',
  colorTo   = 'transparent',
  duration  = 5,
  delay     = 0,
  size      = 90,
}: BorderBeamProps) {
  const { visualEffects } = useVisualConfig()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef<number>(0)
  const enabled = visualEffects.borderBeam.enabled

  useEffect(() => {
    if (!enabled) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let start: number | null = null
    const totalDelay = delay * 1000

    const draw = (ts: number) => {
      if (!start) start = ts
      const elapsed = ts - start - totalDelay
      if (elapsed < 0) { rafRef.current = requestAnimationFrame(draw); return }

      const W = canvas.offsetWidth
      const H = canvas.offsetHeight
      if (canvas.width !== W || canvas.height !== H) {
        canvas.width  = W
        canvas.height = H
      }

      ctx.clearRect(0, 0, W, H)

      const perimeter = 2 * (W + H)
      const beamLen   = (size / 100) * perimeter
      const pos       = ((elapsed / (duration * 1000)) % 1) * perimeter

      const gradient = ctx.createLinearGradient(0, 0, size, 0)
      gradient.addColorStop(0, colorTo)
      gradient.addColorStop(0.5, colorFrom)
      gradient.addColorStop(1, colorTo)

      ctx.save()
      ctx.strokeStyle = colorFrom
      ctx.lineWidth = 1.5
      ctx.lineCap = 'round'
      ctx.shadowBlur = 8
      ctx.shadowColor = colorFrom

      const startPos = pos % perimeter
      const endPos   = (pos + beamLen) % perimeter

      ctx.beginPath()
      drawArc(ctx, W, H, startPos, endPos, perimeter)
      ctx.stroke()
      ctx.restore()

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [colorFrom, colorTo, duration, delay, size, enabled])

  if (!enabled) return null

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden z-0"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1, borderRadius: 'inherit' }}
      aria-hidden="true"
    />
  )
}

function drawArc(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  start: number,
  end: number,
  perimeter: number
) {
  const points = getPerimeterPoints(W, H, perimeter, start, end)
  if (points.length < 2) return
  ctx.moveTo(points[0].x, points[0].y)
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y)
  }
}

function getPerimeterPoints(
  W: number, H: number, perimeter: number,
  start: number, end: number
): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = []
  const step = perimeter / 120
  let d = start
  let iterations = 0
  const maxIter = 130

  while (iterations++ < maxIter) {
    pts.push(perimeterAt(W, H, d % perimeter))
    d += step
    if (start < end) { if (d >= end) break }
    else { if (d >= perimeter + end) break }
  }
  return pts
}

function perimeterAt(W: number, H: number, d: number): { x: number; y: number } {
  if (d < W)          return { x: d, y: 0 }
  if (d < W + H)      return { x: W, y: d - W }
  if (d < 2 * W + H)  return { x: W - (d - W - H), y: H }
  return { x: 0, y: H - (d - 2 * W - H) }
}
