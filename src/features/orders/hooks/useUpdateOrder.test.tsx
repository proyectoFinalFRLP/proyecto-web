import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as api from '../api'
import type { UpdateOrderPayload } from '../types'

import { useUpdateOrder } from './useUpdateOrder'

const PAYLOAD = { order: { status: 'paid' } } as unknown as UpdateOrderPayload
const STOCK_KEY = ['inventory', 'products', 'stocks', [12]] as const

function seededClient() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  queryClient.setQueryData(STOCK_KEY, [])
  return queryClient
}

async function saveFailing(status: number) {
  vi.spyOn(api, 'updateOrder').mockRejectedValue(
    Object.assign(new Error('Insufficient stock'), { status }),
  )
  const queryClient = seededClient()
  const { result } = renderHook(() => useUpdateOrder(8829, '"v1"'), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
  await act(async () => {
    await result.current.mutateAsync(PAYLOAD).catch(() => undefined)
  })
  return queryClient
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('useUpdateOrder', () => {
  // Hallazgo de auditoría (TESIS-89): con la caché vieja, la edición no avisaba
  // ningún faltante y guardar volvía a fallar.
  it('refreshes the stock per warehouse after a 422 for lack of stock', async () => {
    const queryClient = await saveFailing(422)

    expect(queryClient.getQueryState(STOCK_KEY)?.isInvalidated).toBe(true)
  })

  it('leaves the stock alone after a version conflict', async () => {
    const queryClient = await saveFailing(412)

    expect(queryClient.getQueryState(STOCK_KEY)?.isInvalidated).toBe(false)
  })
})
