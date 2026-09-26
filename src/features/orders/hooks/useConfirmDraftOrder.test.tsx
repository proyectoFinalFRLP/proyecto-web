import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as api from '../api'
import { orderKeys, quoteKeys } from '../queryKeys'
import type { OrderDetail, Shipment } from '../types'

import { useConfirmDraftOrder } from './useConfirmDraftOrder'
import type { ConfirmDraftOrderInput } from './useConfirmDraftOrder'

const INPUT: ConfirmDraftOrderInput = {
  order: {
    order: {
      customer_name: 'Marina Rodríguez',
      customer_document: '20-31298744-9',
      customer_address: 'Av. Corrientes 3247',
      customer_city: 'CABA',
      customer_province: 'Ciudad Autónoma de Buenos Aires',
      customer_zip_code: '1193',
      items: [{ product_id: 12, warehouse_id: 3, quantity: 4, unit_price: 120000 }],
    },
  },
  dispatch: {
    dispatch: { company_integration_id: 4, origin_warehouse_id: 3, shipping_cost: 58300 },
  },
}

const ORDER = { id: 8829 } as OrderDetail
const SHIPMENT = { id: 31 } as Shipment

function newClient() {
  return new QueryClient({ defaultOptions: { mutations: { retry: false } } })
}

function wrapperFor(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

function wrapper({ children }: { children: ReactNode }) {
  return wrapperFor(newClient())({ children })
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('useConfirmDraftOrder', () => {
  it('creates the order, opens its shipment and dispatches it, in that order', async () => {
    const calls: string[] = []
    vi.spyOn(api, 'createOrder').mockImplementation(() => {
      calls.push('order')
      return Promise.resolve(ORDER)
    })
    vi.spyOn(api, 'createOrderShipment').mockImplementation((orderId) => {
      calls.push(`shipment of ${orderId}`)
      return Promise.resolve(SHIPMENT)
    })
    vi.spyOn(api, 'dispatchShipment').mockImplementation((shipmentId) => {
      calls.push(`dispatch of ${shipmentId}`)
      return Promise.resolve(SHIPMENT)
    })
    const { result } = renderHook(() => useConfirmDraftOrder(), { wrapper })

    await act(() => result.current.mutateAsync(INPUT))

    expect(calls).toEqual(['order', 'shipment of 8829', 'dispatch of 31'])
  })

  // El punto del hook: si el despacho falla, la orden ya existe y ya descontó
  // el stock. Reintentar no puede crear otra.
  it('retries from where it failed, without creating the order again', async () => {
    const createOrder = vi.spyOn(api, 'createOrder').mockResolvedValue(ORDER)
    const createShipment = vi.spyOn(api, 'createOrderShipment').mockResolvedValue(SHIPMENT)
    vi.spyOn(api, 'dispatchShipment')
      .mockRejectedValueOnce(new Error('El courier no contestó'))
      .mockResolvedValueOnce(SHIPMENT)
    const { result } = renderHook(() => useConfirmDraftOrder(), { wrapper })

    await act(() => result.current.mutateAsync(INPUT).catch(() => undefined))
    await act(() => result.current.mutateAsync(INPUT))

    expect(createOrder).toHaveBeenCalledTimes(1)
    expect(createShipment).toHaveBeenCalledTimes(1)
  })

  it('tells the page the order exists as soon as it does', async () => {
    const onOrderCreated = vi.fn()
    vi.spyOn(api, 'createOrder').mockResolvedValue(ORDER)
    vi.spyOn(api, 'createOrderShipment').mockRejectedValue(new Error('boom'))
    const { result } = renderHook(() => useConfirmDraftOrder({ onOrderCreated }), { wrapper })

    await act(() => result.current.mutateAsync(INPUT).catch(() => undefined))

    expect(onOrderCreated).toHaveBeenCalledWith(8829)
    await waitFor(() => expect(result.current.createdOrderId).toBe(8829))
  })

  it('leaves no created order behind when the order itself is rejected', async () => {
    vi.spyOn(api, 'createOrder').mockRejectedValue(new Error('Stock insuficiente'))
    const createShipment = vi.spyOn(api, 'createOrderShipment')
    const { result } = renderHook(() => useConfirmDraftOrder(), { wrapper })

    await act(() => result.current.mutateAsync(INPUT).catch(() => undefined))

    expect(result.current.createdOrderId).toBeNull()
    expect(createShipment).not.toHaveBeenCalled()
  })

  // Crear la orden refresca el listado, pero no puede volver a cotizar: sería
  // una llamada de más a cada courier y, si el despacho falló, cambiarle las
  // opciones al operador mientras decide si reintentar.
  it('refreshes the orders without asking the carriers for a new quote', async () => {
    vi.spyOn(api, 'createOrder').mockResolvedValue(ORDER)
    vi.spyOn(api, 'createOrderShipment').mockResolvedValue(SHIPMENT)
    vi.spyOn(api, 'dispatchShipment').mockResolvedValue(SHIPMENT)
    const queryClient = newClient()
    const quote = quoteKeys.draft({
      quote: {
        origin_warehouse_id: 3,
        destination_zip_code: '1193',
        destination_address: '',
        items: [],
      },
    })
    queryClient.setQueryData(quote, [])
    queryClient.setQueryData(orderKeys.lists(), [])
    const { result } = renderHook(() => useConfirmDraftOrder(), {
      wrapper: wrapperFor(queryClient),
    })

    await act(() => result.current.mutateAsync(INPUT))

    expect(queryClient.getQueryState(orderKeys.lists())?.isInvalidated).toBe(true)
    expect(queryClient.getQueryState(quote)?.isInvalidated).toBe(false)
  })
})
