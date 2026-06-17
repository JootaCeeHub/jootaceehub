'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { ANIMATIONS } from './constants'

export function AnimationLibrary() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  function copyCode(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 1800)
    }).catch(() => {})
  }

  return (
    <div>
      <p className="mb-4 text-xs text-muted-foreground leading-relaxed">
        Reference snippets for the animation patterns used across this site. Click the copy button to grab the code.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {ANIMATIONS.map((anim) => (
          <div key={anim.name} className="rounded-xl border border-border/40 bg-card/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-beacon" />
              <span className="text-xs font-semibold text-foreground">{anim.name}</span>
              <span className="ml-auto font-mono text-[9px] text-muted-foreground/60">{anim.category}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{anim.desc}</p>
            <div className="relative">
              <pre className="rounded-lg bg-card/80 border border-border/30 px-3 py-2 font-mono text-[10px] text-primary/80 overflow-x-auto">{anim.code}</pre>
              <button
                type="button"
                onClick={() => copyCode(anim.code)}
                className="absolute top-1.5 right-1.5 rounded px-1.5 py-0.5 text-[9px] border border-border/40 text-muted-foreground hover:text-foreground hover:border-border/60 transition-colors duration-150 bg-card/80"
              >
                {copiedCode === anim.code ? <Check className="h-2.5 w-2.5" /> : <Copy className="h-2.5 w-2.5" />}
              </button>
            </div>
            <div className="mt-3 flex items-center justify-center h-12 rounded-lg bg-card/40 border border-border/20">
              <div className={`h-3 w-3 rounded-full bg-primary ${anim.previewClass}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
