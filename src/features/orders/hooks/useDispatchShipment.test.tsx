import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as api from '../api'
import { orderKeys, quoteKeys } from '../queryKeys'
import type { Shipment } from '../types'

import { useDispatchShipment } from './useDispatchShipment'
import type { DispatchShipmentInput } from './useDispatchShipment'

const INPUT: DispatchShipmentInput = {
  shipmentId: 31,
  payload: {
    dispatch: { company_integration_id: 4, origin_warehouse_id: 1, shipping_cost: 58300 },
  },
}

const SHIPMENT = { id: 31 } as Shipment

// El detalle, su envío y la cotización de la orden, ya en caché.
function seededClient() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  queryClient.setQueryData(orderKeys.detail(8829), {})
  queryClient.setQueryData(orderKeys.shipment(8829), { kind: 'none' })
  queryClient.setQueryData(quoteKeys.order(8829, 1), [])
  // El listado de envíos, el contador de una pestaña y la campanita: tres
  // consumidores de fuera de esta feature que el despacho deja viejos.
  queryClient.setQueryData(['shipments', 'list', {}], [])
  queryClient.setQueryData(['shipments', 'count', 'in_transit', ''], 0)
  queryClient.setQueryData(['activity', 'list'], [])
  return queryClient
}

function renderFor(queryClient: QueryClient) {
  return renderHook(() => useDispatchShipment(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('useDispatchShipment', () => {
  it('dispatches the shipment with what the operator chose', async () => {
    const dispatch = vi.spyOn(api, 'dispatchShipment').mockResolvedValue(SHIPMENT)
    const { result } = renderFor(seededClient())

    await act(() => result.current.mutateAsync(INPUT))

    expect(dispatch).toHaveBeenCalledWith(31, INPUT.payload)
  })

  // Criterio de la card: al terminar, el detalle muestra el envío despachado.
  it('refreshes the order and its shipment, without asking the carriers for a new quote', async () => {
    vi.spyOn(api, 'dispatchShipment').mockResolvedValue(SHIPMENT)
    const queryClient = seededClient()
    const { result } = renderFor(queryClient)

    await act(() => result.current.mutateAsync(INPUT))

    expect(queryClient.getQueryState(orderKeys.detail(8829))?.isInvalidated).toBe(true)
    expect(queryClient.getQueryState(orderKeys.shipment(8829))?.isInvalidated).toBe(true)
    expect(queryClient.getQueryState(quoteKeys.order(8829, 1))?.isInvalidated).toBe(false)
  })

  // El envío que se acaba de despachar cambia de estado y de courier. Quien lo
  // muestra no es sólo el detalle de la orden: están el listado de /shipments,
  // los contadores de sus pestañas y el historial de la campanita, y ninguno se
  // entera por el dominio de órdenes.
  it('refreshes the shipments listing and the activity feed', async () => {
    vi.spyOn(api, 'dispatchShipment').mockResolvedValue(SHIPMENT)
    const queryClient = seededClient()
    const { result } = renderFor(queryClient)

    await act(() => result.current.mutateAsync(INPUT))

    expect(queryClient.getQueryState(['shipments', 'list', {}])?.isInvalidated).toBe(true)
    expect(queryClient.getQueryState(['shipments', 'count', 'in_transit', ''])?.isInvalidated).toBe(
      true,
    )
    expect(queryClient.getQueryState(['activity', 'list'])?.isInvalidated).toBe(true)
  })

  // Un 409 es que otro lo despachó mientras tanto: el detalle tiene que dejar de
  // ofrecerlo.
  it('refreshes the shipment also when the dispatch fails', async () => {
    vi.spyOn(api, 'dispatchShipment').mockRejectedValue(
      Object.assign(new Error('Shipment already dispatched'), { status: 409 }),
    )
    const queryClient = seededClient()
    const { result } = renderFor(queryClient)

    await act(async () => {
      await result.current.mutateAsync(INPUT).catch(() => undefined)
    })

    expect(queryClient.getQueryState(orderKeys.shipment(8829))?.isInvalidated).toBe(true)
  })
})
