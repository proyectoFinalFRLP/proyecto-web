import type { AxiosResponse } from 'axios'
import { client } from 'shared/api/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchRecentShipments, fetchWarehouseLoads, RECENT_SHIPMENTS } from './api'

function respond(data: unknown): AxiosResponse {
  return { data, headers: {} } as AxiosResponse
}

/** Los query params con los que se llamó al endpoint. */
function capture(body: unknown) {
  const sent: Record<string, unknown>[] = []
  vi.spyOn(client, 'get').mockImplementation((_url: string, config?: unknown) => {
    sent.push((config as { params?: Record<string, unknown> })?.params ?? {})

    return Promise.resolve(respond(body))
  })

  return sent
}

const SHIPMENT = {
  id: 31,
  order_id: 8829,
  status: 'in_transit',
  tracking_number: 'AND-9920-X8829-Z',
  courier: { id: 4, service_id: 7, name: 'Andreani' },
  created_at: '2026-08-24T12:14:00Z',
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('fetchRecentShipments', () => {
  it('asks for one page of the size the panel shows', async () => {
    const sent = capture({ data: [] })
    await fetchRecentShipments()

    expect(sent[0]).toMatchObject({ page: 1, per_page: RECENT_SHIPMENTS })
  })

  it('translates the shipment to the domain', async () => {
    capture({ data: [SHIPMENT] })

    expect(await fetchRecentShipments()).toEqual([
      {
        id: 31,
        orderId: 8829,
        status: 'in_transit',
        trackingNumber: 'AND-9920-X8829-Z',
        courier: 'Andreani',
        createdAt: '2026-08-24T12:14:00Z',
      },
    ])
  })

  // El operador se asigna al confirmar el despacho (TESIS-47): hasta entonces
  // la fila tiene que tolerar que no haya ninguno.
  it('leaves the courier null for a shipment that has none', async () => {
    capture({ data: [{ ...SHIPMENT, courier: null, tracking_number: null }] })
    const [shipment] = await fetchRecentShipments()

    expect(shipment).toMatchObject({ courier: null, trackingNumber: null })
  })
})

describe('fetchWarehouseLoads', () => {
  it('translates each warehouse to the domain', async () => {
    capture({ data: [{ id: 1, name: 'CD Norte', stored_units: 200, capacity: 1000 }] })

    expect(await fetchWarehouseLoads()).toEqual([
      { id: 1, name: 'CD Norte', storedUnits: 200, capacity: 1000 },
    ])
  })

  // Si el front se despliega antes que el backend que agrega el campo,
  // `undefined` pasa el `!== null` de `shareOf` y la barra sale en «NaN %».
  it('reads a missing capacity as one that was never declared', async () => {
    capture({ data: [{ id: 1, name: 'CD Norte', stored_units: 200 }] })
    const [warehouse] = await fetchWarehouseLoads()

    expect(warehouse.capacity).toBeNull()
  })

  it('reads missing stored units as zero instead of NaN', async () => {
    capture({ data: [{ id: 1, name: 'CD Norte', capacity: 1000 }] })
    const [warehouse] = await fetchWarehouseLoads()

    expect(warehouse.storedUnits).toBe(0)
  })
})
