'use client'

import { useEffect, useMemo, useState } from 'react'

function generateInitialSeries(size: number) {
  const points: number[] = []
  let value = 102
  for (let i = 0; i < size; i++) {
    value += (Math.sin(i / 4) + Math.cos(i / 9)) * 0.22
    points.push(Number(value.toFixed(2)))
  }
  return points
}

type Signal = 'BUY' | 'SELL' | 'HOLD'

const SIGNAL_STYLES: Record<Signal, string> = {
  BUY: 'text-emerald-300 border-emerald-400/30 bg-emerald-500/10',
  SELL: 'text-rose-300 border-rose-400/30 bg-rose-500/10',
  HOLD: 'text-sky-300 border-sky-300/30 bg-sky-500/10',
}

export function TradingLab() {
  const [series, setSeries] = useState<number[]>(() => generateInitialSeries(40))
  const [signal, setSignal] = useState<Signal>('HOLD')
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setSeries((prev) => {
        const last = prev[prev.length - 1] ?? 100
        const drift = (Math.random() - 0.45) * 0.9
        const next = Number((last + drift).toFixed(2))
        if (drift > 0.22) setSignal('BUY')
        else if (drift < -0.22) setSignal('SELL')
        else setSignal('HOLD')
        setTick((t) => t + 1)
        return [...prev.slice(-39), next]
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

  const fillPath = chartPath + ` L 100 100 L 0 100 Z`

  const confidence = useMemo(() => {
    const recent = series.slice(-5)
    const slope = recent[recent.length - 1]! - recent[0]!
    return Math.min(98, Math.max(52, Math.round(70 + slope * 8)))
  }, [series])

  const last = series[series.length - 1]?.toFixed(2)
  const prev = series[series.length - 2]?.toFixed(2)
  const priceUp = last !== undefined && prev !== undefined && parseFloat(last) >= parseFloat(prev)

  return (
    <div className="space-y-4">
      {/* Chart header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/30">
            SYNTHETIC FEED · TICK {tick}
          </span>
        </div>
        <span className={`rounded-full border px-3 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] ${SIGNAL_STYLES[signal]}`}>
          {signal}
        </span>
      </div>

      {/* Chart */}
      <div className="rounded-lg border border-white/6 bg-black/40 p-3">
        <svg viewBox="0 0 100 40" className="h-36 w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#49b7ff" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#49b7ff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={fillPath} fill="url(#chart-fill)" />
          <path d={chartPath} fill="none" stroke="#49b7ff" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Last Price', value: last ?? '—', accent: priceUp ? 'text-emerald-400' : 'text-rose-400' },
          { label: 'Confidence', value: `${confidence}%`, accent: 'text-sky-400' },
          { label: 'Cycle', value: '1.4s', accent: 'text-white/60' },
        ].map((m) => (
          <div key={m.label} className="rounded-lg border border-white/6 bg-white/2 p-3">
            <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/25">{m.label}</div>
            <div className={`font-mono text-sm font-semibold ${m.accent}`}>{m.value}</div>
          </div>
        ))}
      </div>

      <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/15">
        Synthetic execution feed · signal engine running in simulation mode
      </div>
    </div>
  )
}
