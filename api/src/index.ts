import { serve } from '@hono/node-server'
import app from './app.js'
import { env } from './env.js'

const port = env.PORT

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`[content-api] Listening on http://localhost:${info.port}`)
  console.log(`[content-api] CORS origin: ${env.CORS_ORIGIN}`)
  console.log(`[content-api] Repo root: ${env.REPO_ROOT}`)
  console.log(`[content-api] Content root: ${env.CONTENT_ROOT}`)
  console.log(`[content-api] Media root: ${env.MEDIA_ROOT}`)
})

export default app
