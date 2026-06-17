'use client'

import { REFERENCES } from './constants'

export function DesignReferences() {
  return (
    <div>
      <p className="mb-4 text-xs text-muted-foreground leading-relaxed">
        Curated design references — sites, tools, and studios that define the visual direction of this project.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {REFERENCES.map((ref) => (
          <a
            key={ref.title}
            href={ref.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col gap-2 rounded-xl border border-border/40 bg-card/20 p-4 transition-all duration-200 hover:border-primary/20 hover:bg-card/30 cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center text-sm bg-card/60 border border-border/30 shrink-0">{ref.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">{ref.title}</div>
                <div className="text-[10px] font-mono text-muted-foreground/60 truncate">{ref.url.replace('https://', '')}</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{ref.desc}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {ref.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-border/30 px-2 py-0.5 font-mono text-[9px] text-muted-foreground/70">{tag}</span>
              ))}
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
