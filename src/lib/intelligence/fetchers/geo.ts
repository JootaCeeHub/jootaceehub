import type { IntelligenceFeed } from '@/lib/admin/types'
import type { FetchResult } from '../types'
import { item, result } from './helpers'

export async function fetchNASA(feed: IntelligenceFeed, limit: number): Promise<FetchResult> {
  const key = feed.apiKey || 'DEMO_KEY'
  const res = await fetch(
    `https://api.nasa.gov/planetary/apod?api_key=${key}&count=${Math.min(limit, 10)}`
  )
  const raw = await res.json() as Record<string, unknown> | Record<string, unknown>[]
  const arr = Array.isArray(raw) ? raw : [raw]
  const items = arr.map((a) => item(feed, {
    id: String(a['date'] ?? a['title']),
    title: String(a['title'] ?? ''),
    url: String(a['url'] ?? ''),
    excerpt: a['explanation'] ? String(a['explanation']).slice(0, 200) : undefined,
    publishedAt: a['date'] ? `${String(a['date'])}T00:00:00.000Z` : new Date().toISOString(),
    tags: ['nasa', 'astronomy', String(a['media_type'] ?? '')].filter(Boolean),
  }))
  return result(feed.id, items)
}

export async function fetchUSGSQuakes(feed: IntelligenceFeed, limit: number): Promise<FetchResult> {
  const res = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson')
  const data = await res.json() as { features?: Record<string, unknown>[] }
  const items = (data.features ?? []).slice(0, limit).map((f) => {
    const props = f['properties'] as Record<string, unknown>
    const geo = f['geometry'] as { coordinates?: number[] }
    const mag = Number(props['mag'] ?? 0)
    const place = String(props['place'] ?? 'Unknown location')
    const coords = geo?.coordinates ?? [0, 0, 0]
    return item(feed, {
      id: String(f['id']),
      title: `M${mag.toFixed(1)} — ${place}`,
      url: String(props['url'] ?? ''),
      excerpt: `Depth: ${Number(coords[2] ?? 0).toFixed(1)}km  ·  Felt: ${props['felt'] ?? 0}  ·  Alert: ${String(props['alert'] ?? 'none')}`,
      publishedAt: new Date(Number(props['time'] ?? 0)).toISOString(),
      score: Math.round(mag * 10),
      tags: ['earthquake', 'seismic', String(props['type'] ?? 'earthquake')],
    })
  })
  return result(feed.id, items)
}

export async function fetchNASAEONET(feed: IntelligenceFeed, limit: number): Promise<FetchResult> {
  const res = await fetch(`https://eonet.gsfc.nasa.gov/api/v3/events?status=open&days=30&limit=${Math.min(limit, 50)}`)
  const data = await res.json() as { events?: Record<string, unknown>[] }
  const items = (data.events ?? []).map((e) => {
    const categories = e['categories'] as { title: string }[] | undefined
    const sources = e['sources'] as { url: string }[] | undefined
    const geometry = e['geometry'] as { date: string; coordinates?: number[] }[] | undefined
    const cat = categories?.[0]?.title ?? 'Event'
    return item(feed, {
      id: String(e['id']),
      title: `${cat}: ${String(e['title'] ?? '')}`,
      url: sources?.[0]?.url ?? `https://eonet.gsfc.nasa.gov/events/${String(e['id'])}`,
      publishedAt: geometry?.[0]?.date ?? new Date().toISOString(),
      tags: [cat.toLowerCase(), 'nasa', 'disaster'],
    })
  })
  return result(feed.id, items)
}

export async function fetchNASAFIRMS(feed: IntelligenceFeed, limit: number): Promise<FetchResult> {
  if (!feed.apiKey) throw new Error('Free MAP_KEY required — register at firms.modaps.eosdis.nasa.gov')
  const res = await fetch(
    `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${feed.apiKey}/VIIRS_SNPP_NRT/world/1`
  )
  const text = await res.text()
  const lines = text.trim().split('\n').filter(Boolean)
  const headers = lines[0]?.split(',') ?? []
  const latIdx = headers.indexOf('latitude')
  const lonIdx = headers.indexOf('longitude')
  const brightIdx = headers.indexOf('bright_ti4')
  const acrIdx = headers.indexOf('acq_date')
  const confIdx = headers.indexOf('confidence')
  const countryIdx = headers.indexOf('country_id')

  const items = lines.slice(1, Math.min(limit + 1, 51)).map((line, i) => {
    const cols = line.split(',')
    const lat = cols[latIdx] ?? '?'
    const lon = cols[lonIdx] ?? '?'
    const bright = cols[brightIdx] ?? '?'
    const date = cols[acrIdx] ?? new Date().toISOString().split('T')[0]
    const conf = cols[confIdx] ?? '?'
    const country = cols[countryIdx] ?? '?'
    return item(feed, {
      id: `firms-${i}-${date}-${lat}-${lon}`,
      title: `🔥 Active Fire  ·  ${country}  ·  ${lat}°, ${lon}°  ·  ${date}`,
      url: 'https://firms.modaps.eosdis.nasa.gov/usfs/',
      excerpt: `Brightness: ${bright}K  ·  Confidence: ${conf}%  ·  VIIRS SNPP satellite`,
      publishedAt: `${date}T00:00:00.000Z`,
      score: Number(bright) || 0,
      tags: ['fire', 'wildfire', country.toLowerCase(), 'nasa'],
    })
  })
  return result(feed.id, items)
}

export async function fetchOpenSky(feed: IntelligenceFeed, limit: number): Promise<FetchResult> {
  const res = await fetch(
    'https://opensky-network.org/api/states/all?lamin=29&lomin=25&lamax=42&lomax=60',
    { headers: { 'User-Agent': 'JootaCee-Intelligence/1.0' } }
  )
  const data = await res.json() as { states?: unknown[][] | null }
  const states = (data.states ?? []).slice(0, Math.min(limit, 30))
  const items = states.map((s) => {
    const callsign = String(s[1] ?? '').trim() || String(s[0] ?? 'Unknown')
    const country = String(s[2] ?? 'Unknown')
    const lon = Number(s[5] ?? 0)
    const lat = Number(s[6] ?? 0)
    const alt = Number(s[7] ?? 0)
    const speed = Number(s[9] ?? 0)
    const squawk = String(s[14] ?? '')
    const onGround = Boolean(s[8])
    const squawkAlert = squawk === '7500' ? '⚠️ HIJACK' : squawk === '7600' ? '📻 RADIO FAIL' : squawk === '7700' ? '🆘 EMERGENCY' : ''
    return item(feed, {
      id: String(s[0]),
      title: `${squawkAlert ? squawkAlert + ' ' : ''}${callsign}  ·  ${country}  ·  ${onGround ? 'Ground' : `${Math.round(alt)}m`}`,
      url: `https://opensky-network.org/aircraft-profile?icao24=${String(s[0])}`,
      excerpt: `Speed: ${Math.round(speed * 3.6)} km/h  ·  Pos: ${lat.toFixed(2)}°N ${lon.toFixed(2)}°E  ·  Squawk: ${squawk || '?'}`,
      publishedAt: new Date().toISOString(),
      tags: ['aviation', 'adsb', country.toLowerCase(), ...(squawkAlert ? ['emergency'] : [])],
    })
  })
  return result(feed.id, items)
}

const CLIMATE_ZONES = [
  { name: 'Kyiv',      lat: 50.45, lon:  30.52 },
  { name: 'Baghdad',   lat: 33.34, lon:  44.40 },
  { name: 'Tehran',    lat: 35.69, lon:  51.39 },
  { name: 'Gaza',      lat: 31.35, lon:  34.31 },
  { name: 'Damascus',  lat: 33.51, lon:  36.29 },
  { name: 'Kabul',     lat: 34.52, lon:  69.18 },
  { name: 'Khartoum',  lat: 15.55, lon:  32.53 },
  { name: 'Mogadishu', lat:  2.04, lon:  45.34 },
  { name: 'Caracas',   lat: 10.48, lon: -66.88 },
  { name: 'Yangon',    lat: 16.87, lon:  96.19 },
]

export async function fetchOpenMeteo(feed: IntelligenceFeed, limit: number): Promise<FetchResult> {
  const zones = CLIMATE_ZONES.slice(0, Math.min(limit, CLIMATE_ZONES.length))
  const settled = await Promise.allSettled(
    zones.map(async (z) => {
      const r = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${z.lat}&longitude=${z.lon}&current=temperature_2m,precipitation,wind_speed_10m,weather_code&timezone=auto`
      )
      return { zone: z, data: await r.json() as Record<string, unknown> }
    })
  )
  const items = settled
    .filter((r): r is PromiseFulfilledResult<{ zone: typeof CLIMATE_ZONES[0]; data: Record<string, unknown> }> => r.status === 'fulfilled')
    .map(({ value: { zone, data } }) => {
      const current = data['current'] as Record<string, unknown> | undefined
      const temp = Number(current?.['temperature_2m'] ?? 0)
      const precip = Number(current?.['precipitation'] ?? 0)
      const wind = Number(current?.['wind_speed_10m'] ?? 0)
      return item(feed, {
        id: `meteo-${zone.name}`,
        title: `${zone.name}  ·  ${temp.toFixed(1)}°C  ·  ${precip > 0 ? `Precip ${precip}mm` : 'Dry'}`,
        url: `https://open-meteo.com/en/docs#latitude=${zone.lat}&longitude=${zone.lon}`,
        excerpt: `Wind: ${wind.toFixed(1)} km/h  ·  Coords: ${zone.lat}°N ${zone.lon > 0 ? zone.lon + '°E' : Math.abs(zone.lon) + '°W'}`,
        publishedAt: new Date().toISOString(),
        tags: ['climate', zone.name.toLowerCase(), precip > 10 ? 'heavy-rain' : temp > 40 ? 'extreme-heat' : 'normal'],
      })
    })
  return result(feed.id, items)
}
