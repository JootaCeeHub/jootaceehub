'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'

function generateInitialSeries(size: number) {
  const points: number[] = []
  let value = 102
  for (let i = 0; i < size; i++) {
    value += (Math.sin(i / 4) + Math.cos(i / 9)) * 0.22
    points.push(Number(value.toFixed(2)))
  }
  return points
}

export function TradingLab() {
  const [series, setSeries] = useState<number[]>(() => generateInitialSeries(40))
  const [signal, setSignal] = useState<'BUY' | 'SELL' | 'HOLD'>('HOLD')

  useEffect(() => {
    const id = setInterval(() => {
      setSeries((prev) => {
        const last = prev[prev.length - 1] ?? 100
        const drift = (Math.random() - 0.45) * 0.9
        const next = Number((last + drift).toFixed(2))
        const nextSeries = [...prev.slice(-39), next]

        if (drift > 0.22) setSignal('BUY')
        else if (drift < -0.22) setSignal('SELL')
        else setSignal('HOLD')

        return nextSeries
      })
    }, 1400)

    return () => clearInterval(id)
  }, [])

  const chartPath = useMemo(() => {
    const min = Math.min(...series)
    const max = Math.max(...series)
    const range = max - min || 1

    return series
      .map((point, i) => {
        const x = (i / (series.length - 1)) * 100
        const y = 100 - ((point - min) / range) * 100
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
      })
      .join(' ')
  }, [series])

  const confidence = useMemo(() => {
    const recent = series.slice(-5)
    const slope = recent[recent.length - 1] - recent[0]
    return Math.min(98, Math.max(52, Math.round(70 + slope * 8)))
  }, [series])

  const signalClass =
    signal === 'BUY'
      ? 'text-emerald-200 border-emerald-400/40 bg-emerald-500/15'
      : signal === 'SELL'
        ? 'text-rose-200 border-rose-400/40 bg-rose-500/15'
        : 'text-sky-200 border-sky-300/40 bg-sky-500/15'

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Trading AI / Live Simulation</p>
        <span className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.15em] ${signalClass}`}>{signal}</span>
      </div>

      <svg viewBox="0 0 100 40" className="h-40 w-full rounded-lg border border-border bg-card/65 p-2">
        <path d={chartPath} fill="none" stroke="rgba(110,247,255,0.9)" strokeWidth="1.25" />
      </svg>

      <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
        <div className="rounded-lg border border-border bg-card/55 p-2">
          <p className="text-muted-foreground">Last Price</p>
          <p className="text-sm font-semibold text-foreground">{series[series.length - 1]?.toFixed(2)}</p>
        </div>
        <div className="rounded-lg border border-border bg-card/55 p-2">
          <p className="text-muted-foreground">Signal Confidence</p>
          <p className="text-sm font-semibold text-foreground">{confidence}%</p>
        </div>
        <div className="rounded-lg border border-border bg-card/55 p-2">
          <p className="text-muted-foreground">Cycle</p>
          <p className="text-sm font-semibold text-foreground">1.4s</p>
        </div>
      </div>

      <motion.p initial={{ opacity: 0.6 }} animate={{ opacity: 1 }} className="mt-4 text-xs text-muted-foreground">
        Synthetic execution feed · signal engine running in simulation mode.
      </motion.p>
    </div>
  )
}
