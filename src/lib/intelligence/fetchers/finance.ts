import type { IntelligenceFeed } from '@/lib/admin/types'
import type { FetchResult } from '../types'
import { item, result } from './helpers'

export async function fetchCoinGecko(feed: IntelligenceFeed, limit: number): Promise<FetchResult> {
  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${Math.min(limit, 25)}&sparkline=false`
  )
  const data = await res.json() as Record<string, unknown>[]
  const items = data.map((c) => item(feed, {
    id: String(c['id']),
    title: `${String(c['name'])} (${String(c['symbol']).toUpperCase()})  ·  $${Number(c['current_price']).toLocaleString()}`,
    url: `https://www.coingecko.com/en/coins/${String(c['id'])}`,
    excerpt: `Mkt cap: $${(Number(c['market_cap']) / 1e9).toFixed(2)}B  ·  24h: ${Number(c['price_change_percentage_24h'] ?? 0).toFixed(2)}%`,
    publishedAt: String(c['last_updated'] ?? new Date().toISOString()),
    score: c['market_cap_rank'] ? Number(c['market_cap_rank']) : undefined,
    tags: ['crypto', 'finance'],
  }))
  return result(feed.id, items)
}

export async function fetchAlphaVantage(feed: IntelligenceFeed, limit: number): Promise<FetchResult> {
  if (!feed.apiKey) throw new Error('Free API key required — get one at alphavantage.co')
  const res = await fetch(
    `https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${feed.apiKey}`
  )
  const data = await res.json() as { top_gainers?: Record<string, string>[] }
  const items = (data.top_gainers ?? []).slice(0, limit).map((s) => item(feed, {
    id: s['ticker'],
    title: `${s['ticker']}  ·  +${s['change_percentage']}  ·  $${s['price']}`,
    url: `https://finance.yahoo.com/quote/${s['ticker']}`,
    excerpt: `Volume: ${parseInt(s['volume'] ?? '0').toLocaleString()}  ·  Change: ${s['change_amount']}`,
    publishedAt: new Date().toISOString(),
    tags: ['stocks', 'finance', 'gainers'],
  }))
  return result(feed.id, items)
}

const WEATHER_CITIES = ['Madrid', 'New York', 'London', 'Tokyo', 'Berlin', 'Sydney', 'Buenos Aires']

export async function fetchOpenWeather(feed: IntelligenceFeed, limit: number): Promise<FetchResult> {
  if (!feed.apiKey) throw new Error('Free API key required — get one at openweathermap.org')
  const cities = WEATHER_CITIES.slice(0, Math.min(limit, WEATHER_CITIES.length))
  const results = await Promise.allSettled(
    cities.map(async (city) => {
      const r = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${feed.apiKey}&units=metric`
      )
      return { city, data: await r.json() as Record<string, unknown> }
    })
  )
  const items = results
    .filter((r): r is PromiseFulfilledResult<{ city: string; data: Record<string, unknown> }> => r.status === 'fulfilled')
    .map(({ value: { city, data: d } }) => {
      const main = d['main'] as Record<string, unknown> | undefined
      const weather = (d['weather'] as Record<string, unknown>[] | undefined)?.[0]
      const wind = d['wind'] as Record<string, unknown> | undefined
      return item(feed, {
        id: `weather-${city}`,
        title: `${city}  ·  ${String(weather?.['description'] ?? '')}  ·  ${Number(main?.['temp'] ?? 0).toFixed(1)}°C`,
        url: `https://openweathermap.org/city/${String(d['id'] ?? '')}`,
        excerpt: `Humidity: ${String(main?.['humidity'] ?? '?')}%  ·  Wind: ${Number(wind?.['speed'] ?? 0).toFixed(1)} m/s`,
        publishedAt: new Date().toISOString(),
        tags: ['weather', city.toLowerCase()],
      })
    })
  return result(feed.id, items)
}

export async function fetchECBRates(feed: IntelligenceFeed, _limit: number): Promise<FetchResult> {
  const currencies = ['USD', 'GBP', 'JPY', 'CNY', 'CHF', 'AUD', 'CAD', 'RUB']
  const keys = currencies.map((c) => `D.${c}.EUR.SP00.A`).join('+')
  const res = await fetch(
    `https://data-api.ecb.europa.eu/service/data/EXR/${keys}?format=jsondata&lastNObservations=1`
  )
  const data = await res.json() as Record<string, unknown>
  const structure = data['structure'] as Record<string, unknown> | undefined
  const dataSets = data['dataSets'] as { series?: Record<string, { observations?: Record<string, number[]> }> }[] | undefined
  const series = dataSets?.[0]?.series ?? {}
  const dimensions = (structure?.['dimensions'] as { series?: { values?: { id: string; name: string }[] }[] })?.series ?? []
  const currencyDim = dimensions[1]?.values ?? []

  const items = Object.entries(series).map(([key, s]) => {
    const idx = Number(key.split(':')[1] ?? 0)
    const currency = currencyDim[idx]
    const obs = s.observations ?? {}
    const latestVal = Object.values(obs)[0]?.[0]
    const rate = latestVal ? (1 / latestVal).toFixed(4) : '?'
    const code = currency?.id ?? currencies[idx] ?? '?'
    return item(feed, {
      id: `ecb-${code}`,
      title: `${code}/EUR  ·  ${rate}  ·  (1 EUR = ${latestVal?.toFixed(4) ?? '?'} ${code})`,
      url: 'https://data.ecb.europa.eu/data/datasets/EXR',
      excerpt: 'Source: ECB daily FX reference rates',
      publishedAt: new Date().toISOString(),
      tags: ['forex', code.toLowerCase(), 'ecb', 'finance'],
    })
  })
  return result(feed.id, items)
}

export async function fetchGIEGasStorage(feed: IntelligenceFeed, limit: number): Promise<FetchResult> {
  const res = await fetch(
    `https://agsi.gie.eu/api?country=eu&type=agsi&from=${new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]}&to=${new Date().toISOString().split('T')[0]}&size=${Math.min(limit, 30)}`
  )
  const data = await res.json() as { data?: Record<string, unknown>[] }
  const items = (data.data ?? []).map((d) => {
    const full = Number(d['full'] ?? 0)
    const injection = Number(d['injection'] ?? 0)
    const withdrawal = Number(d['withdrawal'] ?? 0)
    return item(feed, {
      id: `gie-${String(d['gasDayStart'])}`,
      title: `EU Gas Storage  ·  ${(full * 100).toFixed(1)}% full  ·  ${String(d['gasDayStart'] ?? '')}`,
      url: 'https://agsi.gie.eu',
      excerpt: `Injection: ${injection.toFixed(0)} TWh  ·  Withdrawal: ${withdrawal.toFixed(0)} TWh  ·  Working gas: ${Number(d['workingGasVolume'] ?? 0).toFixed(0)} TWh`,
      publishedAt: `${String(d['gasDayStart'] ?? new Date().toISOString().split('T')[0])}T00:00:00.000Z`,
      tags: ['energy', 'gas', 'europe', 'storage'],
    })
  })
  return result(feed.id, items)
}

export async function fetchEIA(feed: IntelligenceFeed, limit: number): Promise<FetchResult> {
  if (!feed.apiKey) throw new Error('Free API key required — register at eia.gov/opendata')
  const res = await fetch(
    `https://api.eia.gov/v2/petroleum/pri/spt/data/?api_key=${feed.apiKey}&frequency=weekly&data[0]=value&facets[series][]=RWTC&sort[0][column]=period&sort[0][direction]=desc&length=${Math.min(limit, 20)}`
  )
  const data = await res.json() as { response?: { data?: Record<string, unknown>[] } }
  const items = (data.response?.data ?? []).map((d) => item(feed, {
    id: `eia-${String(d['period'])}`,
    title: `WTI Crude  ·  $${Number(d['value'] ?? 0).toFixed(2)}/bbl  ·  ${String(d['period'] ?? '')}`,
    url: 'https://www.eia.gov/dnav/pet/pet_pri_spt_s1_w.htm',
    excerpt: `Series: ${String(d['series-description'] ?? 'WTI Spot Price')}  ·  Units: ${String(d['units'] ?? '$/bbl')}`,
    publishedAt: `${String(d['period'] ?? new Date().toISOString().split('T')[0])}T00:00:00.000Z`,
    tags: ['oil', 'wti', 'energy', 'commodities'],
  }))
  return result(feed.id, items)
}

export async function fetchFRED(feed: IntelligenceFeed, limit: number): Promise<FetchResult> {
  if (!feed.apiKey) throw new Error('Free API key required — register at fred.stlouisfed.org')
  const series = ['FEDFUNDS', 'GS10', 'CPIAUCSL']
  const settled = await Promise.allSettled(
    series.map(async (s) => {
      const r = await fetch(
        `https://api.stlouisfed.org/fred/series/observations?series_id=${s}&api_key=${feed.apiKey}&file_type=json&sort_order=desc&limit=1`
      )
      return { series: s, data: await r.json() as { observations?: { date: string; value: string }[] } }
    })
  )
  const labels: Record<string, string> = { FEDFUNDS: 'Fed Funds Rate', GS10: '10-Year Treasury', CPIAUCSL: 'US CPI' }
  const items = settled
    .filter((r): r is PromiseFulfilledResult<{ series: string; data: { observations?: { date: string; value: string }[] } }> => r.status === 'fulfilled')
    .slice(0, limit)
    .map(({ value: { series: s, data } }) => {
      const obs = data.observations?.[0]
      return item(feed, {
        id: `fred-${s}`,
        title: `${labels[s] ?? s}  ·  ${obs?.value ?? '?'}${s === 'CPIAUCSL' ? '' : '%'}  ·  ${obs?.date ?? ''}`,
        url: `https://fred.stlouisfed.org/series/${s}`,
        excerpt: `St. Louis Fed economic indicator  ·  Series: ${s}`,
        publishedAt: obs?.date ? `${obs.date}T00:00:00.000Z` : new Date().toISOString(),
        tags: ['economics', 'us', 'fred', s.toLowerCase()],
      })
    })
  return result(feed.id, items)
}

export async function fetchBLS(feed: IntelligenceFeed, limit: number): Promise<FetchResult> {
  const res = await fetch('https://api.bls.gov/publicAPI/v1/timeseries/data/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      seriesid: ['LNS14000000', 'CES0000000001', 'CUUR0000SA0'],
      startyear: String(new Date().getFullYear() - 1),
      endyear: String(new Date().getFullYear()),
    }),
  })
  const data = await res.json() as { Results?: { series?: { seriesID: string; data: { year: string; period: string; value: string }[] }[] } }
  const labels: Record<string, string> = {
    LNS14000000: 'US Unemployment Rate',
    CES0000000001: 'Nonfarm Payrolls (000s)',
    CUUR0000SA0: 'US CPI All Items',
  }
  const items = (data.Results?.series ?? []).flatMap((s) =>
    (s.data ?? []).slice(0, Math.ceil(limit / 3)).map((d) => item(feed, {
      id: `bls-${s.seriesID}-${d.year}-${d.period}`,
      title: `${labels[s.seriesID] ?? s.seriesID}  ·  ${d.value}  ·  ${d.year} ${d.period}`,
      url: `https://data.bls.gov/timeseries/${s.seriesID}`,
      excerpt: `Bureau of Labor Statistics  ·  Series: ${s.seriesID}`,
      publishedAt: `${d.year}-01-01T00:00:00.000Z`,
      tags: ['bls', 'labor', 'usa', s.seriesID.slice(0, 3).toLowerCase()],
    }))
  )
  return result(feed.id, items)
}

export async function fetchBIS(feed: IntelligenceFeed, limit: number): Promise<FetchResult> {
  const res = await fetch(
    `https://stats.bis.org/api/v1/data/WS_CBPOL_D/D.+.+.+.A?startPeriod=${new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]}&lastNObservations=1&format=jsondata`
  )
  const data = await res.json() as Record<string, unknown>
  const dataSets = data['dataSets'] as { series?: Record<string, { observations?: Record<string, number[]> }> }[] | undefined
  const structure = data['structure'] as Record<string, unknown> | undefined
  const dimensions = (structure?.['dimensions'] as { series?: { values?: { id: string; name: string }[] }[] } | undefined)?.series ?? []
  const countryDim = dimensions[1]?.values ?? []
  const series = dataSets?.[0]?.series ?? {}

  const items = Object.entries(series)
    .slice(0, Math.min(limit, 40))
    .map(([key, s]) => {
      const idx = Number(key.split(':')[1] ?? 0)
      const country = countryDim[idx]
      const obs = s.observations ?? {}
      const [period, vals] = Object.entries(obs)[0] ?? ['?', [null]]
      const rate = vals?.[0] != null ? `${Number(vals[0]).toFixed(2)}%` : 'n/a'
      return item(feed, {
        id: `bis-${country?.id ?? idx}-${period}`,
        title: `${country?.name ?? 'Unknown'}  ·  Policy Rate ${rate}  ·  ${period}`,
        url: 'https://stats.bis.org/statx/toc/CBPOL.html',
        excerpt: `Source: BIS central bank policy rates dataset  ·  Country code: ${country?.id ?? '?'}`,
        publishedAt: `${period}T00:00:00.000Z`,
        tags: ['central-bank', 'interest-rate', String(country?.id ?? '').toLowerCase(), 'bis'],
      })
    })
  return result(feed.id, items)
}

export async function fetchIMFData(feed: IntelligenceFeed, limit: number): Promise<FetchResult> {
  const res = await fetch(
    'https://www.imf.org/external/datamapper/api/v1/NGDP_RPCH?periods=2024,2025'
  )
  const data = await res.json() as { values?: { NGDP_RPCH?: Record<string, Record<string, number | null>> } }
  const countryValues = data.values?.NGDP_RPCH ?? {}
  const items = Object.entries(countryValues)
    .slice(0, Math.min(limit, 30))
    .map(([countryCode, periods]) => {
      const val2024 = periods['2024']
      const val2025 = periods['2025']
      return item(feed, {
        id: `imf-gdp-${countryCode}`,
        title: `${countryCode}  ·  GDP Growth: ${val2024 != null ? val2024.toFixed(1) + '%' : 'n/a'} (2024)  ·  ${val2025 != null ? val2025.toFixed(1) + '%' : 'n/a'} (2025)`,
        url: 'https://www.imf.org/en/Publications/WEO',
        excerpt: 'IMF WEO real GDP growth rate projections',
        publishedAt: new Date().toISOString(),
        tags: ['imf', 'gdp', 'economics', countryCode.toLowerCase()],
      })
    })
  return result(feed.id, items)
}

export async function fetchPolymarket(feed: IntelligenceFeed, limit: number): Promise<FetchResult> {
  const res = await fetch(
    `https://gamma-api.polymarket.com/markets?order=volume24hr&ascending=false&active=true&limit=${Math.min(limit, 30)}&tag_slug=geopolitics`,
    { headers: { 'User-Agent': 'Mozilla/5.0 JootaCee-Intelligence/1.0' } }
  )
  const data = await res.json() as Record<string, unknown>[]
  const arr = Array.isArray(data) ? data : []
  const items = arr
    .filter((m) => {
      const vol = Number(m['volume24hr'] ?? 0)
      const prob = Number(m['outcomePrices'] ? JSON.parse(String(m['outcomePrices']))[0] : 0.5)
      return vol > 1000 && (prob < 0.1 || prob > 0.9 || vol > 50000)
    })
    .map((m) => {
      const prob = (() => {
        try { return JSON.parse(String(m['outcomePrices']))[0] as number } catch { return 0.5 }
      })()
      const vol24h = Number(m['volume24hr'] ?? 0)
      return item(feed, {
        id: String(m['id']),
        title: String(m['question'] ?? ''),
        url: `https://polymarket.com/event/${String(m['slug'] ?? m['id'])}`,
        excerpt: `Probability: ${(prob * 100).toFixed(1)}%  ·  24h Volume: $${Math.round(vol24h).toLocaleString()}  ·  Liquidity: $${Math.round(Number(m['liquidity'] ?? 0)).toLocaleString()}`,
        publishedAt: String(m['startDate'] ?? new Date().toISOString()),
        score: Math.round(vol24h),
        tags: ['prediction', 'market', ...(Array.isArray(m['tags']) ? (m['tags'] as { slug: string }[]).map((t) => t.slug) : [])],
      })
    })
  return result(feed.id, items)
}

export async function fetchUSASpending(feed: IntelligenceFeed, limit: number): Promise<FetchResult> {
  const res = await fetch('https://api.usaspending.gov/api/v2/search/spending_by_award/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filters: {
        award_type_codes: ['A', 'B', 'C', 'D'],
        agencies: [{ type: 'awarding', tier: 'toptier', name: 'Department of Defense' }],
      },
      fields: ['Award ID', 'Recipient Name', 'Award Amount', 'Award Type', 'Period of Performance Current End Date', 'Awarding Agency', 'Description'],
      sort: 'Award Amount',
      order: 'desc',
      limit: Math.min(limit, 20),
      page: 1,
    }),
  })
  const data = await res.json() as { results?: Record<string, unknown>[] }
  const items = (data.results ?? []).map((a) => {
    const amount = Number(a['Award Amount'] ?? 0)
    return item(feed, {
      id: String(a['Award ID'] ?? crypto.randomUUID()),
      title: `$${(amount / 1e6).toFixed(1)}M  ·  ${String(a['Recipient Name'] ?? 'Unknown')}  ·  DoD`,
      url: `https://www.usaspending.gov/award/${String(a['Award ID'] ?? '')}`,
      excerpt: `Type: ${String(a['Award Type'] ?? '?')}  ·  ${String(a['Description'] ?? '').slice(0, 100)}`,
      publishedAt: new Date().toISOString(),
      score: Math.round(amount / 1e6),
      tags: ['defense', 'spending', 'contract', 'usa'],
    })
  })
  return result(feed.id, items)
}

export async function fetchFTS(feed: IntelligenceFeed, limit: number): Promise<FetchResult> {
  const year = new Date().getFullYear()
  const res = await fetch(
    `https://api.hpc.tools/v2/public/fts/flow?groupby=sourceObjects&year=${year}&limit=${Math.min(limit, 20)}`
  )
  const data = await res.json() as { data?: { flows?: Record<string, unknown>[] } }
  const flows = data.data?.flows ?? []
  const items = flows.map((f, i) => {
    const src = (f['sourceObjects'] as Record<string, unknown>[] | undefined)?.[0]
    const dst = (f['destinationObjects'] as Record<string, unknown>[] | undefined)?.[0]
    const amount = Number(f['amountUSD'] ?? 0)
    return item(feed, {
      id: `fts-${String(f['id'] ?? i)}`,
      title: `$${(amount / 1e6).toFixed(1)}M  ·  ${String(src?.['name'] ?? 'Donor')}  →  ${String(dst?.['name'] ?? 'Crisis')}`,
      url: 'https://fts.unocha.org',
      excerpt: `Date: ${String(f['date'] ?? '?')}  ·  Type: ${String(f['flowType'] ?? '?')}  ·  Status: ${String(f['status'] ?? '?')}`,
      publishedAt: String(f['date'] ?? new Date().toISOString()),
      score: Math.round(amount / 1e6),
      tags: ['humanitarian', 'funding', 'ocha', String(dst?.['objectType'] ?? '').toLowerCase()].filter(Boolean),
    })
  })
  return result(feed.id, items)
}
