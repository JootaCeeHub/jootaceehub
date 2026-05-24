import type { DeviceTier } from '@/lib/visuals/types'

export function inferDeviceTierFromUserAgent(userAgent: string): DeviceTier {
  const ua = userAgent.toLowerCase()

  const isMobile = /android|iphone|ipad|ipod|mobile/.test(ua)
  const isOldBrowser = /safari\/13|chrome\/8\d|firefox\/7\d/.test(ua)

  if (isMobile || isOldBrowser) return 'low'
  if (/macintosh|windows nt 1\d|linux x86_64/.test(ua)) return 'high'
  return 'balanced'
}
