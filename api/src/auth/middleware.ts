import type { MiddlewareHandler } from 'hono'
import { verifyJWT } from './jwt.js'
import { env } from '../env.js'
import type { HonoEnv } from '../types.js'

/**
 * Hono middleware that validates a Bearer JWT from the Authorization header.
 *
 * On success, sets `c.var.actor` to the token subject (always "admin").
 * On failure, returns a 401 JSON response and stops the chain.
 */
export const authMiddleware: MiddlewareHandler<HonoEnv> = async (c, next) => {
  const header = c.req.header('Authorization')

  if (!header || !header.startsWith('Bearer ')) {
    return c.json(
      { success: false, error: 'Missing or malformed Authorization header' },
      401,
    )
  }

  const token = header.slice(7) // strip "Bearer "
  const payload = await verifyJWT(token, env.JWT_SECRET)

  if (!payload) {
    return c.json(
      { success: false, error: 'Invalid or expired token' },
      401,
    )
  }

  c.set('actor', payload.sub)
  await next()
}
