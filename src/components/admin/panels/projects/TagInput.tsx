'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface Props {
  tags:        string[]
  onChange:    (tags: string[]) => void
  placeholder?: string
}

export function TagInput({ tags, onChange, placeholder = 'Add tag…' }: Props) {
  const [input, setInput] = useState('')

  function add() {
    const t = input.trim().toLowerCase().replace(/\s+/g, '-')
    if (!t || tags.includes(t)) { setInput(''); return }
    onChange([...tags, t])
    setInput('')
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mt-1">
        {tags.map((tag) => (
          <button key={tag} onClick={() => onChange(tags.filter((t) => t !== tag))} className="rounded-md border border-violet-400/20 bg-violet-400/5 px-2 py-0.5 font-mono text-[9px] text-violet-400/70 hover:border-red-400/30 hover:text-red-400/70 transition-colors cursor-pointer">
            {tag} <X size={8} className="inline ml-0.5" />
          </button>
        ))}
      </div>
      <div className="flex gap-1 mt-1.5">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder={placeholder}
          className="flex-1 rounded-md border border-white/8 bg-black/20 px-2 py-0.5 font-mono text-[9px] text-white/55 placeholder-white/20 outline-none focus:border-violet-400/25 transition-colors"
        />
        <button onClick={add} className="rounded-md border border-white/10 px-2 py-0.5 font-mono text-[9px] text-white/35 hover:border-violet-400/25 hover:text-violet-400 transition-colors">+ Add</button>
      </div>
    </div>
  )
}
