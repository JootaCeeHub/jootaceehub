import { describe, it, expect } from 'vitest'
import { signJWT, verifyJWT } from './jwt.js'

const SECRET = 'x'.repeat(64)

describe('signJWT', () => {
  it('returns a non-empty JWT string', async () => {
    const token = await signJWT({ sub: 'admin' }, SECRET, '1h')
    expect(typeof token).toBe('string')
    expect(token.split('.').length).toBe(3) // header.payload.signature
  })
})

describe('verifyJWT', () => {
  it('verifies a freshly signed token and returns correct payload', async () => {
    const token = await signJWT({ sub: 'admin' }, SECRET, '1h')
    const payload = await verifyJWT(token, SECRET)
    expect(payload).not.toBeNull()
    expect(payload?.sub).toBe('admin')
    expect(typeof payload?.iat).toBe('number')
    expect(typeof payload?.exp).toBe('number')
  })

  it('returns null for a token signed with a different secret', async () => {
    const token = await signJWT({ sub: 'admin' }, SECRET, '1h')
    const payload = await verifyJWT(token, 'y'.repeat(64))
    expect(payload).toBeNull()
  })

  it('returns null for a malformed token string', async () => {
    const payload = await verifyJWT('not.a.jwt', SECRET)
    expect(payload).toBeNull()
  })

  it('returns null for an empty string', async () => {
    const payload = await verifyJWT('', SECRET)
    expect(payload).toBeNull()
  })
})
