import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { sortResetKey, usePageNumber } from './usePageNumber'

describe('usePageNumber', () => {
  it('keeps the page while the key stays the same', () => {
    const { result } = renderHook(({ key }) => usePageNumber(key), { initialProps: { key: 'a' } })

    act(() => result.current[1](3))

    expect(result.current[0]).toBe(3)
  })

  it('goes back to the first page when the key changes', () => {
    const { result, rerender } = renderHook(({ key }) => usePageNumber(key), {
      initialProps: { key: 'total:desc' },
    })
    act(() => result.current[1](3))

    rerender({ key: 'total:asc' })

    expect(result.current[0]).toBe(1)
  })

  it('stays on the first page when the key goes back to an earlier one', () => {
    const { result, rerender } = renderHook(({ key }) => usePageNumber(key), {
      initialProps: { key: 'total:asc' },
    })
    act(() => result.current[1](3))

    rerender({ key: 'total:desc' })
    rerender({ key: 'total:asc' })

    expect(result.current[0]).toBe(1)
  })

  it('takes an update from the current page', () => {
    const { result } = renderHook(() => usePageNumber(''))
    act(() => result.current[1](4))

    act(() => result.current[1]((current) => current - 1))

    expect(result.current[0]).toBe(3)
  })
})

describe('sortResetKey', () => {
  it('changes with the column and with the direction', () => {
    expect(sortResetKey({ key: 'total', direction: 'asc' })).not.toBe(
      sortResetKey({ key: 'total', direction: 'desc' }),
    )
    expect(sortResetKey(null)).toBe('')
  })
})
