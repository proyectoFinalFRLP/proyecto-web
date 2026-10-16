import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { useSortParam } from './useSortParam'

const SORTABLE = ['total', 'created_at']

function renderAt(url: string) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[url]}>{children}</MemoryRouter>
  )

  return renderHook(
    () => {
      const [sort, setSort] = useSortParam(SORTABLE)
      return { sort, setSort, search: useLocation().search }
    },
    { wrapper },
  )
}

describe('useSortParam', () => {
  it('reads the sort of the URL', () => {
    const { result } = renderAt('/orders?sort=total&direction=desc')

    expect(result.current.sort).toEqual({ key: 'total', direction: 'desc' })
  })

  it('reads no sort when the URL has none', () => {
    expect(renderAt('/orders').result.current.sort).toBeNull()
  })

  // Una URL editada a mano no puede pedirle a la API una columna que el
  // listado no ordena.
  it('ignores a key the listing does not sort by', () => {
    expect(renderAt('/orders?sort=password&direction=asc').result.current.sort).toBeNull()
  })

  it('ignores a direction that is not asc or desc', () => {
    expect(renderAt('/orders?sort=total&direction=up').result.current.sort).toBeNull()
  })

  it('writes the sort to the URL and keeps the other params', () => {
    const { result } = renderAt('/orders?tab=paid')

    act(() => result.current.setSort({ key: 'created_at', direction: 'asc' }))

    expect(result.current.sort).toEqual({ key: 'created_at', direction: 'asc' })
    expect(new URLSearchParams(result.current.search).get('tab')).toBe('paid')
  })
})
