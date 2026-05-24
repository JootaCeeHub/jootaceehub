'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, Clock, Cpu, Zap, Network } from 'lucide-react'
import { useLiveStats } from '@/hooks/useLiveStats'
import { useTranslations } from '@/lib/i18n/context'

export function StatusBar() {
  const t = useTranslations('statusBar')
  const [time, setTime] = useState('')
  const [visible, setVisible] = useState(false)
  const stats = useLiveStats(2500)

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      )
    }
    updateTime()
    const timeInterval = setInterval(updateTime, 1000)

    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.5)
    }
    window.addEventListener('scroll', onScroll)

    return () => {
      clearInterval(timeInterval)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

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
          <span className="font-mono text-[10px] text-muted-foreground">{stats.fps} {t('fps')}</span>
        </div>

        <div className="flex items-center gap-1.5 border-r border-border/60 px-3">
          <Cpu className="h-3 w-3 text-primary" aria-hidden="true" />
          <span className="font-mono text-[10px] text-muted-foreground">{stats.cpu}% {t('cpu')}</span>
        </div>

        <div className="flex items-center gap-1.5 border-r border-border/60 px-3">
          <Zap className="h-3 w-3 text-primary" aria-hidden="true" />
          <span className="font-mono text-[10px] text-muted-foreground">{stats.latency}ms</span>
        </div>

        <div className="flex items-center gap-1.5 border-r border-border/60 px-3">
          <Network className="h-3 w-3 text-primary" aria-hidden="true" />
          <span className="font-mono text-[10px] text-muted-foreground">{stats.activeConnections} {t('connections')}</span>
        </div>

        <div className="flex items-center gap-1.5 pl-3">
          <Clock className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
          <span className="font-mono text-[10px] text-muted-foreground">{time} {t('utc')}</span>
        </div>
      </div>
    </motion.div>
  )
}
