import path from 'node:path'
import type { NextConfig } from 'next'
import createBundleAnalyzer from '@next/bundle-analyzer'

const withAnalyzer = createBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })

const nextConfig: NextConfig = {
  output: 'export',
  // distDir is shared between dev and build. In dev mode Turbopack writes
  // its persistent cache here (dist/dev/cache/turbopack). If you see
  // "TurbopackInternalError" or SST corruption, run `npm run clean` and
  // restart `npm run dev`.
  distDir: 'dist',
  trailingSlash: true,
  poweredByHeader: false,
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: path.join(__dirname),
  },
  typescript: {
    ignoreBuildErrors: false,
  },
}

export default withAnalyzer(nextConfig)
