import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn()', () => {
  it('merges simple class strings', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles falsy values (undefined, false, null)', () => {
    expect(cn('foo', undefined, false, null, 'bar')).toBe('foo bar')
  })

  it('resolves Tailwind conflicts — last wins', () => {
    const result = cn('px-4', 'px-8')
    expect(result).toBe('px-8')
  })

  it('resolves conflicting text colors', () => {
    const result = cn('text-red-500', 'text-blue-500')
    expect(result).toBe('text-blue-500')
  })

  it('handles conditional classes', () => {
    const active = true
    const result = cn('base', active && 'active', !active && 'inactive')
    expect(result).toBe('base active')
  })

  it('handles object syntax from clsx', () => {
    const result = cn({ 'font-bold': true, 'italic': false })
    expect(result).toBe('font-bold')
  })

  it('handles array syntax', () => {
    const result = cn(['flex', 'items-center'], 'gap-2')
    expect(result).toBe('flex items-center gap-2')
  })

  it('returns empty string for no arguments', () => {
    expect(cn()).toBe('')
  })

  it('deduplicates identical classes via tailwind-merge', () => {
    const result = cn('p-4 p-4')
    expect(result).toBe('p-4')
  })
})
