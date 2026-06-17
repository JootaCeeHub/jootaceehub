import type { IntelligenceFeed } from '@/lib/admin/types'
import type { FetchResult } from './types'
import { getCached, setCache } from './fetchers/cache'
import { fetchRSS, STATIC_RSS_URLS } from './fetchers/rss'
import {
  fetchHackerNews, fetchDevTo, fetchPapersWithCode, fetchReddit,
  fetchArXiv, fetchSemanticScholar, fetchWorldBank, fetchHuggingFace,
  fetchGitHubTrending,
} from './fetchers/tech'
import {
  fetchGuardian, fetchNYTimes, fetchNewsAPI, fetchGNews, fetchMediastack,
} from './fetchers/news'
import {
  fetchCoinGecko, fetchAlphaVantage, fetchOpenWeather,
  fetchECBRates, fetchGIEGasStorage, fetchEIA, fetchFRED, fetchBLS,
  fetchBIS, fetchIMFData, fetchPolymarket, fetchUSASpending, fetchFTS,
} from './fetchers/finance'
import {
  fetchFeodoTracker, fetchURLhaus, fetchRansomwareLive,
  fetchAbuseIPDB, fetchAlienVaultOTX, fetchCloudflareRadar,
} from './fetchers/security'
import {
  fetchNASA, fetchUSGSQuakes, fetchNASAEONET, fetchNASAFIRMS,
  fetchOpenSky, fetchOpenMeteo,
} from './fetchers/geo'
import {
  fetchGDELT, fetchReliefWeb, fetchUCDP, fetchACLED,
  fetchOCHAHAPI, fetchUNHCR,
} from './fetchers/osint'

export { clearCache } from './fetchers/cache'

// ─── Main dispatcher ──────────────────────────────────────────────────────────

export async function fetchFeed(feed: IntelligenceFeed, limit = 20): Promise<FetchResult> {
  const cached = getCached(feed.id)
  if (cached) return cached

  let result: FetchResult

  switch (feed.id) {
    // Tech / Community
    case 'hackernews':       result = await fetchHackerNews(feed, limit);      break
    case 'devto':            result = await fetchDevTo(feed, limit);           break
    case 'paperswithcode':   result = await fetchPapersWithCode(feed, limit);  break
    case 'reddit_rss':       result = await fetchReddit(feed, limit);          break
    case 'arxiv':            result = await fetchArXiv(feed, limit);           break
    case 'semantic_scholar': result = await fetchSemanticScholar(feed, limit); break
    case 'worldbank':        result = await fetchWorldBank(feed, limit);       break
    case 'huggingface':      result = await fetchHuggingFace(feed, limit);     break
    case 'github_trending':  result = await fetchGitHubTrending(feed, limit);  break
    // News
    case 'theGuardian':      result = await fetchGuardian(feed, limit);        break
    case 'nytimes':          result = await fetchNYTimes(feed, limit);         break
    case 'newsapi':          result = await fetchNewsAPI(feed, limit);         break
    case 'gnews':            result = await fetchGNews(feed, limit);           break
    case 'mediastack':       result = await fetchMediastack(feed, limit);      break
    // Finance / Markets
    case 'coingecko':        result = await fetchCoinGecko(feed, limit);       break
    case 'alpha_vantage':    result = await fetchAlphaVantage(feed, limit);    break
    case 'openweather':      result = await fetchOpenWeather(feed, limit);     break
    case 'ecb_rates':        result = await fetchECBRates(feed, limit);        break
    case 'gie_agsi':         result = await fetchGIEGasStorage(feed, limit);   break
    case 'eia_crude':        result = await fetchEIA(feed, limit);             break
    case 'fred_us':          result = await fetchFRED(feed, limit);            break
    case 'bls_jobs':         result = await fetchBLS(feed, limit);             break
    case 'bis_rates':        result = await fetchBIS(feed, limit);             break
    case 'imf_data':         result = await fetchIMFData(feed, limit);         break
    case 'polymarket':       result = await fetchPolymarket(feed, limit);      break
    case 'usa_spending':     result = await fetchUSASpending(feed, limit);     break
    case 'fts_funding':      result = await fetchFTS(feed, limit);             break
    // Security / Cyber
    case 'feodo_tracker':    result = await fetchFeodoTracker(feed, limit);    break
    case 'urlhaus':          result = await fetchURLhaus(feed, limit);         break
    case 'ransomware_live':  result = await fetchRansomwareLive(feed, limit);  break
    case 'abuseipdb':        result = await fetchAbuseIPDB(feed, limit);       break
    case 'alienvault_otx':   result = await fetchAlienVaultOTX(feed, limit);   break
    case 'cloudflare_radar': result = await fetchCloudflareRadar(feed, limit); break
    // Geo / Disaster / Climate
    case 'nasa':             result = await fetchNASA(feed, limit);            break
    case 'usgs_quakes':      result = await fetchUSGSQuakes(feed, limit);      break
    case 'nasa_eonet':       result = await fetchNASAEONET(feed, limit);       break
    case 'nasa_firms':       result = await fetchNASAFIRMS(feed, limit);       break
    case 'opensky':          result = await fetchOpenSky(feed, limit);         break
    case 'open_meteo':       result = await fetchOpenMeteo(feed, limit);       break
    // OSINT / Conflict / Humanitarian
    case 'gdelt':            result = await fetchGDELT(feed, limit);           break
    case 'reliefweb_crisis':
    case 'reliefweb_disasters': result = await fetchReliefWeb(feed, limit);   break
    case 'ucdp':             result = await fetchUCDP(feed, limit);            break
    case 'acled':            result = await fetchACLED(feed, limit);           break
    case 'ocha_hapi':        result = await fetchOCHAHAPI(feed, limit);        break
    case 'unhcr_data':       result = await fetchUNHCR(feed, limit);           break
    // Relay-only feeds (require server-side proxy, cannot run in browser)
    case 'tg_vahidonline':
    case 'tg_auroraintel':
    case 'tg_bnonews':
    case 'tg_osintdefender':
    case 'tg_deepstate':
    case 'tg_bellingcat':
    case 'tg_nexta':
    case 'tg_warmonitor':
    case 'tg_clashreport':
    case 'tg_osint_live':
    case 'tg_abu_ali':
    case 'tg_liveuamap':
    case 'tg_iran_international':
    case 'tg_ua_airforce':
    case 'tg_povitriani':
    case 'tg_defender_dome':
    case 'tg_osint_updates':
    case 'tg_cyberdetective':
    case 'tg_geopolitical_center':
    case 'tg_me_spectator':
    case 'tg_me_now':
    case 'tg_osint_industries':
    case 'tg_osintops':
    case 'tg_osinttv':
    case 'tg_spectator_index':
    case 'tg_wfwitness':
      throw new Error('Telegram channels require GramJS MTProto relay on Railway — configure relay endpoint in Infrastructure settings')
    case 'oref_alerts':
      throw new Error('OREF alerts require Railway relay + Israeli residential proxy (Akamai WAF blocks browser/Node.js fetch)')
    case 'gps_jamming':
      throw new Error('GPS jamming data requires server relay (gpsjam.org blocks CORS)')
    case 'c2intel':
      throw new Error('C2IntelFeeds CSV requires server-side parsing — configure relay or ingest manually')
    default: {
      const rssUrl = STATIC_RSS_URLS[feed.id]
      if (rssUrl) {
        result = await fetchRSS(feed, rssUrl, limit)
      } else {
        throw new Error(`No fetcher registered for feed: ${feed.id}`)
      }
    }
  }

  setCache(feed.id, result)
  return result
}

// ─── Batch fetch all enabled feeds ───────────────────────────────────────────

export async function fetchAllEnabled(
  feeds: IntelligenceFeed[],
  limit = 20,
  onProgress?: (feedId: string, result: FetchResult | Error) => void
): Promise<Map<string, FetchResult>> {
  const enabled = feeds.filter((f) => f.enabled)
  const results = new Map<string, FetchResult>()

  await Promise.allSettled(
    enabled.map(async (feed) => {
      try {
        const r = await fetchFeed(feed, limit)
        results.set(feed.id, r)
        onProgress?.(feed.id, r)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        onProgress?.(feed.id, error)
      }
    })
  )

  return results
}
