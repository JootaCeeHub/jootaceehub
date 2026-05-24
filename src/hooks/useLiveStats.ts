'use client'

import { useEffect, useState } from 'react'

interface LiveStats {
  fps: number
  cpu: number
  memory: number
  network: number
  activeConnections: number
  latency: number
}

export function useLiveStats(interval = 2000) {
  const [stats, setStats] = useState<LiveStats>({
    fps: 60,
    cpu: 12,
    memory: 34,
    network: 2.4,
    activeConnections: 1,
    latency: 24,
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setStats((prev) => ({
        fps: Math.max(30, Math.min(144, prev.fps + Math.floor(Math.random() * 7) - 3)),
        cpu: Math.max(2, Math.min(45, prev.cpu + Math.floor(Math.random() * 5) - 2)),
        memory: Math.max(20, Math.min(60, prev.memory + Math.floor(Math.random() * 3) - 1)),
        network: Math.max(0.5, Math.min(12, prev.network + (Math.random() * 1.2 - 0.6))),
        activeConnections: prev.activeConnections + (Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0),
        latency: Math.max(12, Math.min(80, prev.latency + Math.floor(Math.random() * 5) - 2)),
      }))
    }, interval)

    return () => clearInterval(timer)
  }, [interval])

  return stats
}
