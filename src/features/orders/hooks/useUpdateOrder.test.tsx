import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as api from '../api'
import { orderKeys, quoteKeys } from '../queryKeys'
import type { OrderDetail, UpdateOrderPayload } from '../types'

import { useUpdateOrder } from './useUpdateOrder'

const PAYLOAD = { order: { status: 'paid' } } as unknown as UpdateOrderPayload

// El detalle, la cotización de esta orden y la de otra, ya en caché.
function seededClient() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  queryClient.setQueryData(orderKeys.detail(8829), {})
  queryClient.setQueryData(quoteKeys.order(8829, 1), [{ shippingCost: 2500 }])
  queryClient.setQueryData(quoteKeys.order(7000, 1), [{ shippingCost: 900 }])
  return queryClient
}

function renderFor(queryClient: QueryClient) {
  return renderHook(() => useUpdateOrder(8829, '"v1"'), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('useUpdateOrder', () => {
  // Hallazgo de auditoría (TESIS-89): la cotización se calculó con las líneas y
  // el destino de antes, y despachar dentro del minuto de caché mandaba el
  // costo viejo.
  it('drops the shipping quote of the order it saved', async () => {
    vi.spyOn(api, 'updateOrder').mockResolvedValue({} as OrderDetail)
    const queryClient = seededClient()
    const { result } = renderFor(queryClient)

    await act(() => result.current.mutateAsync(PAYLOAD))

    expect(queryClient.getQueryData(quoteKeys.order(8829, 1))).toBeUndefined()
  })

  it('keeps the quotes of other orders', async () => {
    vi.spyOn(api, 'updateOrder').mockResolvedValue({} as OrderDetail)
    const queryClient = seededClient()
    const { result } = renderFor(queryClient)

    await act(() => result.current.mutateAsync(PAYLOAD))

    expect(queryClient.getQueryData(quoteKeys.order(7000, 1))).toEqual([{ shippingCost: 900 }])
  })

  it('still refreshes the order', async () => {
    vi.spyOn(api, 'updateOrder').mockResolvedValue({} as OrderDetail)
    const queryClient = seededClient()
    const { result } = renderFor(queryClient)

    await act(() => result.current.mutateAsync(PAYLOAD))

    expect(queryClient.getQueryState(orderKeys.detail(8829))?.isInvalidated).toBe(true)
  })
})
