'use client'

import type { StudioConfig, StudioScrollbarStyle } from '@/lib/admin/types'
import type { AdminPanel } from '@/lib/admin/types'
import { SLabel, Row, Toggle, Sel, ALL_PANELS } from './primitives'

interface Props {
  cfg: StudioConfig
  set: (partial: Partial<StudioConfig>) => void
}

export function LayoutSection({ cfg, set }: Props) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-white/8 bg-white/[0.025] p-4">
        <SLabel>Layout preview</SLabel>
        <div className="flex h-20 gap-1 overflow-hidden rounded-lg border border-white/8" style={{ background: '#06060f' }}>
          <div className="shrink-0 border-r border-white/8 flex flex-col py-1.5 px-1.5"
            style={{ width: cfg.sidebarWidth === 'compact' ? '14%' : cfg.sidebarWidth === 'wide' ? '28%' : '21%' }}>
            <div className="h-1 w-4/5 rounded-full bg-cyan-400/50 mb-1.5" />
            {[0.4, 0.3, 0.25, 0.2, 0.15].map((o, i) => (
              <div key={i} className="h-0.5 w-3/4 rounded-full bg-white mb-1" style={{ opacity: o }} />
            ))}
          </div>
          <div className="flex flex-1 flex-col"
            style={{ padding: cfg.panelPadding === 'tight' ? '3px' : cfg.panelPadding === 'loose' ? '10px' : '6px' }}>
            <div className="flex shrink-0 items-center border-b border-white/8 mb-1"
              style={{ height: cfg.headerHeight === 'sm' ? '11px' : cfg.headerHeight === 'lg' ? '17px' : '13px' }}>
              {cfg.compactHeader
                ? <div className="h-0.5 w-5 rounded-full bg-cyan-400/50" />
                : <div className="flex items-center gap-1"><div className="h-0.5 w-6 rounded-full bg-white/15" /><div className="h-0.5 w-1 rounded-full bg-white/8" /><div className="h-0.5 w-4 rounded-full bg-cyan-400/40" /></div>
              }
            </div>
            <div className="flex-1 space-y-1 pt-1">
              <div className="h-0.5 w-full rounded-full bg-white/15" />
              <div className="h-0.5 w-3/4 rounded-full bg-white/10" />
              <div className="h-0.5 w-1/2 rounded-full bg-white/7" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-1 divide-y divide-white/5">
        <Row label="Sidebar width" hint="Controls how wide the left navigation panel is">
          <Sel value={cfg.sidebarWidth} onChange={v => set({ sidebarWidth: v })} options={[
            { value: 'compact', label: 'Compact (3.5rem)' },
            { value: 'normal',  label: 'Normal (13.5rem)' },
            { value: 'wide',    label: 'Wide (16rem)'     },
          ]} />
        </Row>
        <Row label="Header height" hint="Height of the top header bar">
          <Sel value={cfg.headerHeight} onChange={v => set({ headerHeight: v })} options={[
            { value: 'sm', label: 'Compact (2.5rem)' },
            { value: 'md', label: 'Normal (3rem)'    },
            { value: 'lg', label: 'Tall (3.5rem)'    },
          ]} />
        </Row>
        <Row label="Compact header" hint="Hide 'JOOTACEE OS /' prefix — show only the active panel name">
          <Toggle value={cfg.compactHeader} onChange={v => set({ compactHeader: v })} />
        </Row>
        <Row label="Content max width" hint="Maximum width of the panel content area">
          <Sel value={cfg.contentMaxWidth} onChange={v => set({ contentMaxWidth: v })} options={[
            { value: 'lg',   label: 'Large (56rem)'   },
            { value: 'xl',   label: 'XL (72rem)'      },
            { value: '2xl',  label: '2XL (96rem)'     },
            { value: 'full', label: 'Full width'      },
          ]} />
        </Row>
        <Row label="Panel padding" hint="Spacing around the main content area">
          <Sel value={cfg.panelPadding} onChange={v => set({ panelPadding: v })} options={[
            { value: 'tight',  label: 'Tight (0.75rem)'  },
            { value: 'normal', label: 'Normal (1.25rem)' },
            { value: 'loose',  label: 'Loose (1.75rem)'  },
          ]} />
        </Row>
        <Row label="Content density" hint="Spacing between elements throughout the interface">
          <Sel value={cfg.density} onChange={v => set({ density: v })} options={[
            { value: 'compact',     label: 'Compact'     },
            { value: 'normal',      label: 'Normal'      },
            { value: 'comfortable', label: 'Comfortable' },
          ]} />
        </Row>
        <Row label="Default panel" hint="Panel that opens when Command Center loads">
          <Sel value={cfg.defaultPanel as string} onChange={v => set({ defaultPanel: v as AdminPanel })}
            options={ALL_PANELS.map(p => ({ value: p.id, label: p.label }))} />
        </Row>
        <Row label="Scrollbar style" hint="Controls the main content area scrollbar appearance">
          <Sel value={cfg.scrollbarStyle} onChange={v => set({ scrollbarStyle: v as StudioScrollbarStyle })} options={[
            { value: 'normal', label: 'Normal'  },
            { value: 'thin',   label: 'Thin'    },
            { value: 'hidden', label: 'Hidden'  },
          ]} />
        </Row>
      </div>
    </div>
  )
}
