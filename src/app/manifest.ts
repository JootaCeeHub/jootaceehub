import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'JootaCee | AI Systems Architect',
    short_name: 'JootaCee',
    description: 'Operational laboratory for AI systems, automation infrastructures, and modular digital ecosystems.',
    start_url: '/en/',
    scope: '/',
    display: 'standalone',
    background_color: '#05060a',
    theme_color: '#05060a',
    orientation: 'portrait-primary',
    categories: ['technology', 'business', 'productivity'],
    icons: [
      { src: '/icon-192x192.webp', sizes: '192x192', type: 'image/webp', purpose: 'any' },
      { src: '/icon-192x192.png',  sizes: '192x192', type: 'image/png',  purpose: 'any' },
      { src: '/icon-512x512.webp', sizes: '512x512', type: 'image/webp', purpose: 'any' },
      { src: '/icon-512x512.png',  sizes: '512x512', type: 'image/png',  purpose: 'any' },
      { src: '/maskable-icon.webp', sizes: '192x192', type: 'image/webp', purpose: 'maskable' },
      { src: '/maskable-icon.png',  sizes: '192x192', type: 'image/png',  purpose: 'maskable' },
    ],
    shortcuts: [
      {
        name: 'Systems',
        short_name: 'Systems',
        description: 'View systems architecture',
        url: '/en/#systems',
        icons: [{ src: '/icon-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Labs',
        short_name: 'Labs',
        description: 'Explore interactive labs',
        url: '/en/#labs',
        icons: [{ src: '/icon-192x192.png', sizes: '192x192' }],
      },
    ],
  }
}
