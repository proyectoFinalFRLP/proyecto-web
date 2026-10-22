import type { AxiosResponse } from 'axios'
import { client } from 'shared/api/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchShipmentCounts, fetchShipmentPage } from './api'

// Sólo el `data` importa: la frontera no lee headers ni status de estas respuestas.
function respond(data: unknown): AxiosResponse {
  return { data, headers: {} } as AxiosResponse
}

/** Los query params con los que se llamó al endpoint. */
function capture() {
  const sent: Record<string, unknown>[] = []
  vi.spyOn(client, 'get').mockImplementation((_url: string, config?: unknown) => {
    sent.push((config as { params: Record<string, unknown> }).params)

    return Promise.resolve(respond({ data: [], meta: { page: 1, per_page: 20, total: 0 } }))
  })

  return sent
}

beforeEach(() => {
  vi.restoreAllMocks()
})

// El filtro lo hace el backend (TESIS-164): lo que esta capa tiene que
// garantizar es que el término llegue, y que el vacío no.
describe('fetchShipmentPage', () => {
  it('sends the term as the search parameter', async () => {
    const sent = capture()
    await fetchShipmentPage({ page: 1, perPage: 20, search: 'AND-9920' })

    expect(sent[0].search).toBe('AND-9920')
  })

  // Un `search=` en blanco ensucia la URL y la clave de caché sin cambiar la
  // respuesta: el backend corta antes de armar la condición.
  it('omits search when there is no term', async () => {
    const sent = capture()
    await fetchShipmentPage({ page: 1, perPage: 20, search: '' })

    expect(sent[0]).not.toHaveProperty('search')
  })

  it('keeps the status filter alongside the term', async () => {
    const sent = capture()
    await fetchShipmentPage({ page: 1, perPage: 20, status: 'pending', search: 'AND' })

    expect(sent[0]).toMatchObject({ status: 'pending', search: 'AND' })
  })

  it('asks for the delayed shipments only when the filter is on', async () => {
    const sent = capture()
    await fetchShipmentPage({ page: 1, perPage: 20, delayed: true })
    await fetchShipmentPage({ page: 1, perPage: 20, delayed: false })

    expect(sent[0]).toMatchObject({ delayed: true })
    // No hay «sólo los que no se demoraron»: mandarlo sería afirmarlo.
    expect(sent[1]).not.toHaveProperty('delayed')
  })

  it('reads the origin, the promised date and the delay of each shipment', async () => {
    vi.spyOn(client, 'get').mockResolvedValue(
      respond({
        data: [
          {
            id: 31,
            order_id: 8829,
            status: 'in_transit',
            tracking_number: 'AND-1',
            shipping_cost: 4500,
            courier: null,
            origin_warehouse: { id: 1, name: 'Depósito Central' },
            promised_delivery_on: '2026-10-15',
            delayed: true,
            created_at: '2026-10-12T12:00:00Z',
          },
        ],
        meta: { page: 1, per_page: 20, total: 1 },
      }),
    )

    const { shipments } = await fetchShipmentPage({ page: 1, perPage: 20 })

    expect(shipments[0]).toMatchObject({
      originWarehouse: { id: 1, name: 'Depósito Central' },
      promisedDeliveryOn: '2026-10-15',
      delayed: true,
    })
  })

  // Una API anterior no manda los campos: sin ellos no se afirma una demora.
  it('reads missing fields as no origin, no promise and not delayed', async () => {
    vi.spyOn(client, 'get').mockResolvedValue(
      respond({
        data: [
          {
            id: 31,
            order_id: 8829,
            status: 'pending',
            tracking_number: null,
            shipping_cost: null,
            courier: null,
            created_at: '2026-10-12T12:00:00Z',
          },
        ],
        meta: { page: 1, per_page: 20, total: 1 },
      }),
    )

    const { shipments } = await fetchShipmentPage({ page: 1, perPage: 20 })

    expect(shipments[0]).toMatchObject({
      originWarehouse: null,
      promisedDeliveryOn: null,
      delayed: false,
    })
  })
})

// TESIS-165: eran cinco requests, uno por pestaña, cada uno pidiendo una fila
// sólo para leer su `meta.total`.
describe('fetchShipmentCounts', () => {
  const COUNTS = { all: 20, pending: 2, ready_to_ship: 1, in_transit: 6, delivered: 11 }

  function respondCounts() {
    const sent: (Record<string, unknown> | undefined)[] = []
    vi.spyOn(client, 'get').mockImplementation((_url: string, config?: unknown) => {
      sent.push((config as { params?: Record<string, unknown> }).params)

      return Promise.resolve(respond({ data: COUNTS }))
    })

    return sent
  }

  it('asks the counts endpoint once and unwraps its data', async () => {
    respondCounts()

    await expect(fetchShipmentCounts()).resolves.toEqual(COUNTS)
    expect(client.get).toHaveBeenCalledTimes(1)
  })

  it('hits the counts route and not a page of the listing', async () => {
    respondCounts()
    await fetchShipmentCounts()

    expect(client.get).toHaveBeenCalledWith('/shipments/counts', expect.anything())
  })

  // Si el contador ignorara el término, la pestaña seguiría contando la empresa
  // entera mientras la tabla muestra lo buscado.
  it('passes the term along', async () => {
    const sent = respondCounts()
    await fetchShipmentCounts('AND-99')

    expect(sent[0]).toEqual({ search: 'AND-99' })
  })

  // Con el filtro puesto, cada pestaña cuenta sus demorados.
  it('passes the delayed filter along, with or without a term', async () => {
    const sent = respondCounts()
    await fetchShipmentCounts('', true)
    await fetchShipmentCounts('AND', true)

    expect(sent[0]).toEqual({ delayed: true })
    expect(sent[1]).toEqual({ search: 'AND', delayed: true })
  })

  // No pagina: mandarle una página sería decirle que cuente una porción.
  it('sends no pagination at all when there is no term', async () => {
    const sent = respondCounts()
    await fetchShipmentCounts()

    expect(sent[0]).toEqual({})
  })
})
