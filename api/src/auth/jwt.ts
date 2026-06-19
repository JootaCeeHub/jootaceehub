import { SignJWT, jwtVerify } from 'jose'
import type { JWTPayload } from '../types.js'

/**
 * Encodes the raw JWT_SECRET string as a Uint8Array for jose.
 */
function encodeSecret(secret: string): Uint8Array {
  return new TextEncoder().encode(secret)
}

/**
 * Signs a new JWT with HS256.
 *
 * @param payload  - Claims to embed (sub is required).
 * @param secret   - Raw HMAC secret string (min 64 chars recommended).
 * @param expiresIn - Expiry duration string, e.g. "8h", "1d".
 * @returns Signed JWT string.
 */
export async function signJWT(
  payload: Pick<JWTPayload, 'sub'>,
  secret: string,
  expiresIn: string,
): Promise<string> {
  const key = encodeSecret(secret)
  return new SignJWT({ sub: payload.sub })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(key)
}

/**
 * Verifies a JWT and returns the decoded payload, or null on failure.
 *
 * Never throws — returns null for expired, malformed, or invalid tokens.
 */
export async function verifyJWT(
  token: string,
  secret: string,
): Promise<JWTPayload | null> {
  try {
    const key = encodeSecret(secret)
    const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] })

    if (
      typeof payload.sub !== 'string' ||
      typeof payload.iat !== 'number' ||
      typeof payload.exp !== 'number'
    ) {
      return null
    }

    return { sub: payload.sub, iat: payload.iat, exp: payload.exp }
  } catch {
    return null
  }
}
