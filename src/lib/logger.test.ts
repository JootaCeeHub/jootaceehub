import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { logger, installConsoleFilter } from './logger'

describe('logger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'debug').mockImplementation(() => {})
    vi.spyOn(console, 'info' ).mockImplementation(() => {})
    vi.spyOn(console, 'warn' ).mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('logger.error calls console.error', () => {
    logger.error('something bad')
    expect(console.error).toHaveBeenCalledWith('[error]', 'something bad')
  })

  it('logger.warn calls console.warn with prefix', () => {
    logger.warn('watch out')
    expect(console.warn).toHaveBeenCalledWith('[warn]', 'watch out')
  })

  it('logger.info calls console.info with prefix (test env log level is debug)', () => {
    logger.info('fyi')
    expect(console.info).toHaveBeenCalledWith('[info]', 'fyi')
  })

  it('logger.debug calls console.debug in test env', () => {
    logger.debug('trace data')
    expect(console.debug).toHaveBeenCalledWith('[debug]', 'trace data')
  })

  it('forwards additional arguments', () => {
    logger.error('msg', { key: 'val' }, 42)
    expect(console.error).toHaveBeenCalledWith('[error]', 'msg', { key: 'val' }, 42)
  })

  it('drops silenced THREE.Clock deprecation warning', () => {
    logger.warn('THREE.Clock: This module has been deprecated')
    expect(console.warn).not.toHaveBeenCalled()
  })

  it('drops silenced scroll-behavior warning', () => {
    logger.warn('Detected `scroll-behavior: smooth`')
    expect(console.warn).not.toHaveBeenCalled()
  })

  it('does not silence unrelated warnings', () => {
    logger.warn('Some other warning')
    expect(console.warn).toHaveBeenCalled()
  })
})

describe('installConsoleFilter', () => {
  let originalWarn:  typeof console.warn
  let originalError: typeof console.error

  beforeEach(() => {
    originalWarn  = console.warn
    originalError = console.error
  })

  afterEach(() => {
    console.warn  = originalWarn
    console.error = originalError
  })

  it('patches console.warn to drop silenced patterns', () => {
    const spy = vi.fn()
    console.warn = spy

    // Simulate a browser window context
    Object.defineProperty(global, 'window', { value: global, configurable: true })
    installConsoleFilter()

    console.warn('THREE.Clock: This module has been deprecated')
    expect(spy).not.toHaveBeenCalled()

    console.warn('Legitimate warning about the app')
    expect(spy).toHaveBeenCalledWith('Legitimate warning about the app')
  })

  it('does not throw when called outside a browser context (window undefined)', () => {
    const win = global.window
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).window
    expect(() => installConsoleFilter()).not.toThrow()
    // Restore
    Object.defineProperty(global, 'window', { value: win, configurable: true })
  })
})
