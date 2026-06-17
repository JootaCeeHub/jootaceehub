import { describe, it, expect } from 'vitest'
import { render, renderHook, screen } from '@testing-library/react'
import React from 'react'
import { I18nProvider, useTranslations, useLocale } from './context'

const messages = {
  hero: {
    headline: 'Test Headline',
    subheadline: 'Test Subheadline',
    ctaPrimary: 'Get Started',
    tags: ['tag1', 'tag2'],
    nested: { deep: { value: 'deep value' } },
  },
  simple: 'top-level string',
}

function wrapper({ children }: { children: React.ReactNode }) {
  return <I18nProvider locale="en" messages={messages}>{children}</I18nProvider>
}

describe('useTranslations', () => {
  it('resolves a namespaced string key', () => {
    const { result } = renderHook(() => useTranslations('hero'), { wrapper })
    expect(result.current('headline')).toBe('Test Headline')
  })

  it('resolves a deeply nested key', () => {
    const { result } = renderHook(() => useTranslations('hero'), { wrapper })
    expect(result.current('nested.deep.value')).toBe('deep value')
  })

  it('returns the key when path is missing', () => {
    const { result } = renderHook(() => useTranslations('hero'), { wrapper })
    expect(result.current('nonexistent')).toBe('nonexistent')
  })

  it('resolves an array value', () => {
    const { result } = renderHook(() => useTranslations('hero'), { wrapper })
    const tags = result.current('tags') as string[]
    expect(Array.isArray(tags)).toBe(true)
    expect(tags).toEqual(['tag1', 'tag2'])
  })

  it('resolves without a namespace', () => {
    const { result } = renderHook(() => useTranslations(), { wrapper })
    expect(result.current('simple')).toBe('top-level string')
  })

  it('throws when used outside I18nProvider', () => {
    expect(() =>
      renderHook(() => useTranslations('hero'))
    ).toThrow('useTranslations must be used within I18nProvider')
  })
})

describe('useLocale', () => {
  it('returns the current locale', () => {
    const { result } = renderHook(() => useLocale(), { wrapper })
    expect(result.current).toBe('en')
  })

  it('throws when used outside I18nProvider', () => {
    expect(() => renderHook(() => useLocale())).toThrow()
  })
})

describe('I18nProvider', () => {
  it('renders children', () => {
    render(
      <I18nProvider locale="es" messages={messages}>
        <span data-testid="child">hola</span>
      </I18nProvider>
    )
    expect(screen.getByTestId('child').textContent).toBe('hola')
  })
})

// ─── Edge cases ───────────────────────────────────────────────────────────────

describe('useTranslations edge cases', () => {
  const extMessages = {
    a: {
      b: {
        c: 'deep',
        num: 42,
        bool: false,
        obj: { x: 1 },
        arr: [1, 2, 3],
      },
    },
    top: 'top-level',
    zero: 0,
    empty: '',
    falsy: false,
  }

  function ext({ children }: { children: React.ReactNode }) {
    return <I18nProvider locale="en" messages={extMessages}>{children}</I18nProvider>
  }

  it('returns key when namespace exists but leaf key is missing', () => {
    const { result } = renderHook(() => useTranslations('a'), { wrapper: ext })
    expect(result.current('b.missing')).toBe('b.missing')
  })

  it('returns the namespace key itself when the namespace does not exist', () => {
    const { result } = renderHook(() => useTranslations('nonexistent'), { wrapper: ext })
    expect(result.current('anything')).toBe('anything')
  })

  it('resolves a number value (returns the number, not the key)', () => {
    const { result } = renderHook(() => useTranslations('a'), { wrapper: ext })
    expect(result.current('b.num')).toBe(42)
  })

  it('resolves boolean false (returns false, not the key string)', () => {
    const { result } = renderHook(() => useTranslations('a'), { wrapper: ext })
    expect(result.current('b.bool')).toBe(false)
  })

  it('resolves a nested object value (returns the object)', () => {
    const { result } = renderHook(() => useTranslations('a'), { wrapper: ext })
    const obj = result.current('b.obj') as { x: number }
    expect(obj).toEqual({ x: 1 })
  })

  it('resolves a top-level key without a namespace', () => {
    const { result } = renderHook(() => useTranslations(), { wrapper: ext })
    expect(result.current('top')).toBe('top-level')
  })

  it('returns key when path traverses into a non-object (string) node', () => {
    const { result } = renderHook(() => useTranslations('a'), { wrapper: ext })
    // 'b.c' is 'deep' (string), so 'b.c.deeper' should fail gracefully
    expect(result.current('b.c.deeper')).toBe('b.c.deeper')
  })

  it('resolves zero (falsy number) correctly — not treated as missing', () => {
    const { result } = renderHook(() => useTranslations(), { wrapper: ext })
    expect(result.current('zero')).toBe(0)
  })

  it('resolves empty string — not treated as missing', () => {
    const { result } = renderHook(() => useTranslations(), { wrapper: ext })
    expect(result.current('empty')).toBe('')
  })

  it('resolves boolean false at root level', () => {
    const { result } = renderHook(() => useTranslations(), { wrapper: ext })
    expect(result.current('falsy')).toBe(false)
  })

  it('works correctly after locale change (key prop remount)', () => {
    const esMessages = { greeting: 'hola' }
    const enMessages = { greeting: 'hello' }

    function LocaleSwitcher({ locale }: { locale: string }) {
      const msgs = locale === 'es' ? esMessages : enMessages
      return (
        <I18nProvider key={locale} locale={locale} messages={msgs}>
          <LocaleChild />
        </I18nProvider>
      )
    }
    function LocaleChild() {
      const t = useTranslations()
      return <span data-testid="greeting">{t('greeting') as string}</span>
    }

    const { rerender } = render(<LocaleSwitcher locale="en" />)
    expect(screen.getByTestId('greeting').textContent).toBe('hello')

    rerender(<LocaleSwitcher locale="es" />)
    expect(screen.getByTestId('greeting').textContent).toBe('hola')
  })
})
