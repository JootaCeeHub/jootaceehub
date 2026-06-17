'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, Timer, Cpu, Zap, Network } from 'lucide-react'
import { useLiveStats } from '@/hooks/useLiveStats'
import { useTranslations } from '@/lib/i18n/context'

function getStatColor(value: number, thresholds: [number, number]): string {
  if (value > thresholds[0]) return 'text-emerald-400'
  if (value > thresholds[1]) return 'text-amber-400'
  return 'text-red-400'
}

function formatSession(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const sec = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export function StatusBar() {
  const t = useTranslations('statusBar')
  const [sessionSeconds, setSessionSeconds] = useState(0)
  const [visible, setVisible] = useState(false)
  const stats = useLiveStats(2500)

  useEffect(() => {
    const sessionInterval = setInterval(() => {
      setSessionSeconds((v) => v + 1)
    }, 1000)

    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.5)
    }
    window.addEventListener('scroll', onScroll)

    return () => {
      clearInterval(sessionInterval)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  const fpsColor = getStatColor(stats.fps, [55, 30])
  const cpuColor = getStatColor(100 - stats.cpu, [50, 20])
  const latencyColor = getStatColor(200 - stats.latency, [150, 0])

  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: visible ? 0 : 60, opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-1 rounded-full border border-border/80 bg-background/80 px-4 py-2 backdrop-blur-xl">
        <div className="flex items-center gap-1.5 border-r border-border/60 pr-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-emerald-400">{t('online')}</span>
        </div>

        <div className="flex items-center gap-1.5 border-r border-border/60 px-3">
          <Activity className="h-3 w-3 text-primary" aria-hidden="true" />
          <motion.span
            key={stats.fps}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`font-mono text-[10px] text-muted-foreground stat-value ${fpsColor}`}
          >
            {stats.fps} {t('fps')}
          </motion.span>
        </div>

        <div className="flex items-center gap-1.5 border-r border-border/60 px-3">
          <Cpu className="h-3 w-3 text-primary" aria-hidden="true" />
          <motion.span
            key={stats.cpu}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`font-mono text-[10px] text-muted-foreground stat-value ${cpuColor}`}
          >
            {stats.cpu}% {t('cpu')}
          </motion.span>
        </div>

        <div className="flex items-center gap-1.5 border-r border-border/60 px-3">
          <Zap className="h-3 w-3 text-primary" aria-hidden="true" />
          <motion.span
            key={stats.latency}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`font-mono text-[10px] text-muted-foreground stat-value ${latencyColor}`}
          >
            {stats.latency}ms
          </motion.span>
        </div>

        <div className="flex items-center gap-1.5 border-r border-border/60 px-3">
          <Network className="h-3 w-3 text-primary" aria-hidden="true" />
          <motion.span
            key={stats.activeConnections}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="font-mono text-[10px] text-muted-foreground stat-value"
          >
            {stats.activeConnections} {t('connections')}
          </motion.span>
        </div>

        <div className="flex items-center gap-1.5 pl-3">
          <Timer className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
          <span className="font-mono text-[10px] text-muted-foreground stat-value">{formatSession(sessionSeconds)} session</span>
        </div>
      </div>
    </motion.div>
  )
}
