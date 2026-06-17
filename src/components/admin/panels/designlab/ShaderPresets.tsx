'use client'

import { cn } from '@/lib/utils'
import { useAdmin } from '@/lib/admin/store'

export function ShaderPresets() {
  const { state, dispatch } = useAdmin()
  const ve = state.visualEffects
  const activeId = ve.activeShaderPreset

  function applyPreset(id: string) {
    dispatch({ type: 'SET_SHADER_PRESET', payload: id })
  }

  return (
    <div>
      <p className="mb-4 text-xs text-muted-foreground leading-relaxed">
        Select a gradient shader preset for the ambient site background. The active preset drives the color palette of orbs, hero gradients, and aurora effects.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ve.shaderPresets.map((preset) => {
          const isActive = preset.id === activeId
          const gradientStyle = {
            background: `linear-gradient(${preset.angle}deg, ${preset.colors.join(', ')})`,
          }
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.id)}
              className={cn(
                'group relative flex flex-col gap-2 rounded-xl border p-3 transition-all duration-200 cursor-pointer overflow-hidden',
                isActive
                  ? 'border-primary/60 bg-primary/10 ring-1 ring-primary/30'
                  : 'border-border/40 bg-card/20 hover:border-primary/30 hover:bg-card/30'
              )}
            >
              {isActive && <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary animate-beacon" />}
              <div className="h-16 w-full rounded-lg" style={gradientStyle} />
              <div className="text-xs font-medium text-foreground">{preset.name}</div>
              <div className="font-mono text-[9px] text-muted-foreground">{preset.speed}s · {preset.angle}°</div>
            </button>
          )
        })}
      </div>

      {/* Active preset customizer */}
      {(() => {
        const active = ve.shaderPresets.find((p) => p.id === activeId)
        if (!active) return null
        return (
          <div className="mt-4 rounded-xl border border-border/40 bg-card/20 p-4 space-y-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/70 mb-3">Customizing: {active.name}</div>
            <div className="flex items-center gap-3">
              <span className="w-24 text-xs text-muted-foreground">Colors</span>
              <div className="flex gap-2">
                {active.colors.map((color, i) => (
                  <div
                    key={i}
                    className="h-7 w-7 rounded-md cursor-pointer border border-border/40 overflow-hidden"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-24 text-xs text-muted-foreground">Speed</span>
              <input
                type="range"
                min={6}
                max={30}
                step={1}
                value={active.speed}
                readOnly
                className="flex-1 h-1.5 accent-primary cursor-pointer"
              />
              <span className="w-8 text-right font-mono text-[10px] text-muted-foreground">{active.speed}s</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-24 text-xs text-muted-foreground">Angle</span>
              <input
                type="range"
                min={-180}
                max={180}
                step={5}
                value={active.angle}
                readOnly
                className="flex-1 h-1.5 accent-primary cursor-pointer"
              />
              <span className="w-8 text-right font-mono text-[10px] text-muted-foreground">{active.angle}°</span>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
