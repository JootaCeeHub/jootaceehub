import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AppError, isAppError, reportError } from './error'

describe('AppError', () => {
  it('is an instance of Error', () => {
    const err = new AppError('oops', { code: 'UNKNOWN' })
    expect(err).toBeInstanceOf(Error)
  })

  it('sets name to AppError', () => {
    const err = new AppError('oops', { code: 'UNKNOWN' })
    expect(err.name).toBe('AppError')
  })

  it('stores the code and defaults severity to "error"', () => {
    const err = new AppError('msg', { code: 'RENDER_BOUNDARY' })
    expect(err.code).toBe('RENDER_BOUNDARY')
    expect(err.severity).toBe('error')
  })

  it('respects a custom severity', () => {
    const err = new AppError('msg', { code: 'UNKNOWN', severity: 'warning' })
    expect(err.severity).toBe('warning')
  })

  it('stores optional context', () => {
    const ctx = { section: 'hero', attempt: 2 }
    const err = new AppError('msg', { code: 'UNKNOWN', context: ctx })
    expect(err.context).toEqual(ctx)
  })

  it('sets a valid ISO timestamp', () => {
    const err = new AppError('msg', { code: 'UNKNOWN' })
    expect(() => new Date(err.timestamp)).not.toThrow()
    expect(new Date(err.timestamp).getFullYear()).toBeGreaterThan(2020)
  })

  it('serialises to JSON with expected keys', () => {
    const err = new AppError('bad thing', { code: 'ASSET_LOAD_FAIL', severity: 'fatal' })
    const json = err.toJSON()
    expect(json.name).toBe('AppError')
    expect(json.message).toBe('bad thing')
    expect(json.code).toBe('ASSET_LOAD_FAIL')
    expect(json.severity).toBe('fatal')
    expect(json.timestamp).toBe(err.timestamp)
  })
})

describe('isAppError', () => {
  it('returns true for an AppError instance', () => {
    expect(isAppError(new AppError('x', { code: 'UNKNOWN' }))).toBe(true)
  })

  it('returns false for a plain Error', () => {
    expect(isAppError(new Error('plain'))).toBe(false)
  })

  it('returns false for non-error values', () => {
    expect(isAppError(null)).toBe(false)
    expect(isAppError('string')).toBe(false)
    expect(isAppError(42)).toBe(false)
    expect(isAppError(undefined)).toBe(false)
  })
})

describe('reportError', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('never throws, even when called with garbage', () => {
    expect(() => reportError(null)).not.toThrow()
    expect(() => reportError(undefined)).not.toThrow()
    expect(() => reportError('string error')).not.toThrow()
    expect(() => reportError({ not: 'an error' })).not.toThrow()
  })

  it('never throws when called with a valid AppError', () => {
    const err = new AppError('something failed', { code: 'RENDER_BOUNDARY' })
    expect(() => reportError(err)).not.toThrow()
  })

  it('never throws when called with a plain Error', () => {
    expect(() => reportError(new Error('boom'))).not.toThrow()
  })

  it('accepts an optional context object without throwing', () => {
    expect(() =>
      reportError(new Error('ctx test'), { section: 'labs', userId: 'abc' })
    ).not.toThrow()
  })
})
