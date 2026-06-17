'use client'

import React from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface Props {
  id: string
  title: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}

export function HermesSection({ title, isOpen, onToggle, children }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/8 bg-white/[0.02]">
      <div
        className="flex cursor-pointer items-center justify-between px-4 py-2.5 transition-colors hover:bg-white/[0.02]"
        onClick={onToggle}
        role="button"
        aria-expanded={isOpen}
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">{title}</span>
        {isOpen
          ? <ChevronUp className="h-3.5 w-3.5 text-white/25 transition-transform" />
          : <ChevronDown className="h-3.5 w-3.5 text-white/25 transition-transform" />
        }
      </div>
      {isOpen && (
        <div className="p-4 space-y-3">
          {children}
        </div>
      )}
    </div>
  )
}
