import { getFeaturedArticle, getAllMeta } from '@/lib/content/loaders'
import { HomeWrapper } from './HomeWrapper'

// Server Component: reads article data from the filesystem (node:fs safe).
// Passes serializable props to HomeWrapper → HomeClient (both client-only,
// ssr: false — avoids Framer Motion opacity:0 SSR flash and hydration issues).
export default function Home() {
  const featured = getFeaturedArticle()
  const recent = getAllMeta()
    .filter((a) => !a.featured)
    .slice(0, 3)

  return <HomeWrapper featured={featured} recent={recent} />
}
