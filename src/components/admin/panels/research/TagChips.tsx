'use client'

interface Props { tags: string[]; onRemove?: (t: string) => void }

export function TagChips({ tags, onRemove }: Props) {
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((t) => (
        <span key={t} className="cursor-pointer rounded-md border border-white/10 px-2 py-0.5 font-mono text-[8.5px] text-white/35 hover:border-red-400/20 hover:text-red-400/60 transition-colors" onClick={() => onRemove?.(t)}>
          #{t}{onRemove ? ' ×' : ''}
        </span>
      ))}
    </div>
  )
}
