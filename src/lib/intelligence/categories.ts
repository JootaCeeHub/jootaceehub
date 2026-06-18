import type { FeedCategory } from '@/lib/admin/types'

export interface CategoryMeta {
  label: string
  icon: string
  color: string
}

export const CATEGORY_META: Record<string, CategoryMeta> = {
  tech:         { label: 'Tech',         icon: '⚡', color: '#38bdf8' },
  news:         { label: 'News',         icon: '📰', color: '#60a5fa' },
  ai:           { label: 'AI',           icon: '🤖', color: '#a78bfa' },
  research:     { label: 'Research',     icon: '🔬', color: '#34d399' },
  security:     { label: 'Security',     icon: '🔐', color: '#f87171' },
  cyber:        { label: 'Cyber',        icon: '💀', color: '#fb923c' },
  osint:        { label: 'OSINT',        icon: '👁', color: '#facc15' },
  conflict:     { label: 'Conflict',     icon: '⚔️', color: '#ef4444' },
  finance:      { label: 'Finance',      icon: '💰', color: '#fbbf24' },
  markets:      { label: 'Markets',      icon: '📈', color: '#4ade80' },
  energy:       { label: 'Energy',       icon: '⚡', color: '#f59e0b' },
  climate:      { label: 'Climate',      icon: '🌍', color: '#22c55e' },
  aviation:     { label: 'Aviation',     icon: '✈️', color: '#38bdf8' },
  disaster:     { label: 'Disaster',     icon: '🚨', color: '#f43f5e' },
  humanitarian: { label: 'Humanitarian', icon: '🤝', color: '#fb923c' },
  social:       { label: 'Social',       icon: '💬', color: '#e879f9' },
  opendata:     { label: 'Open Data',    icon: '🌐', color: '#2dd4bf' },
  tool:         { label: 'Tool',         icon: '🔧', color: '#94a3b8' },
  resource:     { label: 'Resource',     icon: '📚', color: '#93c5fd' },
  reference:    { label: 'Reference',    icon: '📖', color: '#c4b5fd' },
  community:    { label: 'Community',    icon: '👥', color: '#86efac' },
  newsletter:   { label: 'Newsletter',   icon: '📨', color: '#fda4af' },
  video:        { label: 'Video',        icon: '🎬', color: '#fb7185' },
  podcast:      { label: 'Podcast',      icon: '🎙️', color: '#c084fc' },
  database:     { label: 'Database',     icon: '🗃️', color: '#67e8f9' },
}

export interface EonetCategoryContext {
  emoji: string
  desc: string
  cat: FeedCategory
}

export const EONET_CATEGORY_CONTEXT: Record<string, EonetCategoryContext> = {
  drought:      { emoji: '☀️', desc: 'Drought condition area monitored by NASA satellite observation.', cat: 'climate' },
  dustHaze:     { emoji: '💨', desc: 'Dust storm or atmospheric haze event tracked by NASA Earth Observatory.', cat: 'climate' },
  earthquakes:  { emoji: '⚠️', desc: 'Seismic activity recorded and tracked by NASA EONET systems.', cat: 'disaster' },
  floods:       { emoji: '🌊', desc: 'Flooding event being monitored by NASA satellite imagery.', cat: 'disaster' },
  landslides:   { emoji: '⛰️', desc: 'Landslide or mass movement event tracked by NASA EONET.', cat: 'disaster' },
  manmade:      { emoji: '🏭', desc: 'Human-caused environmental event recorded by NASA Earth Observatory.', cat: 'disaster' },
  seaLakeIce:   { emoji: '🧊', desc: 'Active iceberg or sea/lake ice feature tracked by NASA satellite monitoring in polar and sub-polar waters.', cat: 'climate' },
  severeStorms: { emoji: '🌀', desc: 'Active severe storm system — typhoon, hurricane, or tropical storm — monitored by NASA EONET satellite tracking.', cat: 'disaster' },
  snow:         { emoji: '❄️', desc: 'Major snowstorm or snowfall event tracked by NASA Earth Observatory.', cat: 'climate' },
  tempExtremes: { emoji: '🌡️', desc: 'Extreme temperature event (heat wave or cold snap) monitored by NASA EONET.', cat: 'climate' },
  volcanoes:    { emoji: '🌋', desc: 'Active volcanic eruption or elevated volcanic activity tracked by NASA satellite systems.', cat: 'disaster' },
  waterColor:   { emoji: '🔵', desc: 'Unusual ocean water color anomaly (algal bloom, sediment plume) observed by NASA satellites.', cat: 'climate' },
  wildfires:    { emoji: '🔥', desc: 'Active wildfire being tracked in near-real-time by NASA EONET satellite fire detection.', cat: 'disaster' },
}
