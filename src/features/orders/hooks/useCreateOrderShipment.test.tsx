import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as api from '../api'
import { orderKeys } from '../queryKeys'
import type { Shipment } from '../types'

import { useCreateOrderShipment } from './useCreateOrderShipment'

const SHIPMENT = { id: 31, status: 'pending' } as Shipment

// El detalle de la orden y su envío, ya en caché. El envío resuelto en «no
// hay», que es el estado desde el que se ofrece abrirlo.
function seededClient() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  queryClient.setQueryData(orderKeys.detail(8829), {})
  queryClient.setQueryData(orderKeys.shipment(8829), { kind: 'none' })
  return queryClient
}

function renderFor(queryClient: QueryClient) {
  return renderHook(() => useCreateOrderShipment(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('useCreateOrderShipment', () => {
  it('opens the shipment of the order', async () => {
    const create = vi.spyOn(api, 'createOrderShipment').mockResolvedValue(SHIPMENT)
    const { result } = renderFor(seededClient())

    await act(() => result.current.mutateAsync(8829))

    expect(create).toHaveBeenCalledWith(8829)
  })

  // Criterio de la card: al terminar, la tarjeta muestra el envío `pending` y
  // con él aparece «Despachar».
  it('refreshes the order and its shipment', async () => {
    vi.spyOn(api, 'createOrderShipment').mockResolvedValue(SHIPMENT)
    const queryClient = seededClient()
    const { result } = renderFor(queryClient)

    await act(() => result.current.mutateAsync(8829))

    expect(queryClient.getQueryState(orderKeys.detail(8829))?.isInvalidated).toBe(true)
    expect(queryClient.getQueryState(orderKeys.shipment(8829))?.isInvalidated).toBe(true)
  })

  // Un 409 es que el envío ya existe —lo abrió el asistente del alta, u otra
  // pestaña—: lo que corresponde es traer el que está, no insistir.
  it('refreshes the shipment also when the order already had one', async () => {
    vi.spyOn(api, 'createOrderShipment').mockRejectedValue(
      Object.assign(new Error('Order already has a shipment'), { status: 409 }),
    )
    const queryClient = seededClient()
    const { result } = renderFor(queryClient)

    await act(async () => {
      await result.current.mutateAsync(8829).catch(() => undefined)
    })

    expect(queryClient.getQueryState(orderKeys.shipment(8829))?.isInvalidated).toBe(true)
  })
})
