import { brand } from '@/lib/config/brand'

export function BrandMark() {
  return (
    <div className="inline-flex items-center gap-3">
      <span className="relative inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg border border-primary/40 bg-primary/12">
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(147,220,255,0.7),transparent_60%)]" />
        <span className="relative text-xs font-semibold text-primary">JC</span>
      </span>
      <span className="text-sm font-semibold tracking-[0.18em] text-primary/95">{brand.signature}</span>
    </div>
  )
}
