import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as api from '../api'
import { orderKeys } from '../queryKeys'
import type { OrderDetail } from '../types'

import { useCancelOrder } from './useCancelOrder'

const INVENTORY_KEY = ['inventory', 'products'] as const

// El detalle de la orden y el catálogo, ya en caché.
function seededClient() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  queryClient.setQueryData(orderKeys.detail(8829), {})
  queryClient.setQueryData(INVENTORY_KEY, [])
  return queryClient
}

function renderFor(queryClient: QueryClient) {
  return renderHook(() => useCancelOrder(8829, '"v1"'), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('useCancelOrder', () => {
  it('cancels the order with the version the detail read', async () => {
    const cancel = vi.spyOn(api, 'cancelOrder').mockResolvedValue({} as OrderDetail)
    const { result } = renderFor(seededClient())

    await act(() => result.current.mutateAsync())

    expect(cancel).toHaveBeenCalledWith(8829, '"v1"')
  })

  // El stock vuelve a los depósitos: el catálogo también quedó viejo.
  it('refreshes the order and the inventory', async () => {
    vi.spyOn(api, 'cancelOrder').mockResolvedValue({} as OrderDetail)
    const queryClient = seededClient()
    const { result } = renderFor(queryClient)

    await act(() => result.current.mutateAsync())

    expect(queryClient.getQueryState(orderKeys.detail(8829))?.isInvalidated).toBe(true)
    expect(queryClient.getQueryState(INVENTORY_KEY)?.isInvalidated).toBe(true)
  })

  // Un 409 es que otro la canceló o despachó: el detalle tiene que mostrarlo.
  it('refreshes the order also when the cancellation fails', async () => {
    vi.spyOn(api, 'cancelOrder').mockRejectedValue(
      Object.assign(new Error('a cancelled order cannot be modified'), { status: 409 }),
    )
    const queryClient = seededClient()
    const { result } = renderFor(queryClient)

    await act(async () => {
      await result.current.mutateAsync().catch(() => undefined)
    })

    expect(queryClient.getQueryState(orderKeys.detail(8829))?.isInvalidated).toBe(true)
  })
})
