import type { AxiosResponse } from 'axios'
import { client } from 'shared/api/client'
import { describe, expect, it, vi } from 'vitest'

import {
  CATALOG_MATCHES,
  fetchCatalogProducts,
  fetchOrder,
  fetchOrderShipment,
  fetchProductStocks,
  fetchProvinces,
  fetchWarehouses,
  updateOrder,
} from './api'

// Sólo el `data` importa: la frontera no lee headers ni status de estas respuestas.
function respond(data: unknown, headers: Record<string, string> = {}): AxiosResponse {
  return { data, headers } as AxiosResponse
}

function shipmentList(ids: number[], total = ids.length): AxiosResponse {
  return respond({ data: ids.map((id) => ({ id })), meta: { page: 1, per_page: 2, total } })
}

const SHIPMENT = {
  id: 31,
  order_id: 8829,
  status: 'in_transit',
  tracking_number: 'AND-9920-X8829-Z',
  shipping_cost: 58300,
  courier: { id: 4, service_id: 7, name: 'Andreani' },
  events: [
    {
      id: 1,
      internal_status: 'pending',
      external_status: 'Pedido recibido',
      description: null,
      occurred_at: '2026-08-12T12:42:00Z',
    },
  ],
}

describe('fetchOrderShipment', () => {
  it('asks the list for two rows, so a second shipment cannot hide past the page', async () => {
    const get = vi.spyOn(client, 'get').mockResolvedValueOnce(shipmentList([]))

    await fetchOrderShipment(8829)

    expect(get).toHaveBeenCalledWith('/shipments', {
      params: { order_id: 8829, page: 1, per_page: 2 },
    })
  })

  it('resolves to none when the order has no shipment, without asking for a detail', async () => {
    const get = vi.spyOn(client, 'get').mockResolvedValueOnce(shipmentList([]))

    await expect(fetchOrderShipment(8829)).resolves.toEqual({ kind: 'none' })
    expect(get).toHaveBeenCalledTimes(1)
  })

  it('reports a duplicated shipment instead of picking one', async () => {
    const get = vi.spyOn(client, 'get').mockResolvedValueOnce(shipmentList([31, 32], 3))

    await expect(fetchOrderShipment(8829)).resolves.toEqual({ kind: 'duplicated', count: 3 })
    expect(get).toHaveBeenCalledTimes(1)
  })

  it('loads the detail of the only shipment and translates it to the domain', async () => {
    const get = vi
      .spyOn(client, 'get')
      .mockResolvedValueOnce(shipmentList([31]))
      .mockResolvedValueOnce(respond(SHIPMENT))

    const result = await fetchOrderShipment(8829)

    expect(get).toHaveBeenLastCalledWith('/shipments/31')
    expect(result).toEqual({
      kind: 'single',
      shipment: {
        id: 31,
        orderId: 8829,
        status: 'in_transit',
        trackingNumber: 'AND-9920-X8829-Z',
        shippingCost: 58300,
        courier: { id: 4, serviceId: 7, name: 'Andreani' },
        events: [
          {
            id: 1,
            internalStatus: 'pending',
            externalStatus: 'Pedido recibido',
            description: null,
            occurredAt: '2026-08-12T12:42:00Z',
          },
        ],
      },
    })
  })
})

const ORDER = {
  id: 8829,
  external_order_id: null,
  customer_name: 'Global Tech Solutions S.A.',
  customer_document: '30-71234567-8',
  customer_address: 'Av. Corrientes 3247',
  customer_zip_code: 'C1193',
  customer_city: null,
  customer_province: null,
  status: 'paid',
  total_amount: 960000,
  created_at: '2026-08-12T12:42:00Z',
}

describe('fetchOrder', () => {
  it('takes the sku and name of each line from its product', async () => {
    vi.spyOn(client, 'get').mockResolvedValueOnce(
      respond({
        id: 8829,
        external_order_id: null,
        customer_name: 'Global Tech Solutions S.A.',
        customer_document: '30-71234567-8',
        customer_address: 'Av. Corrientes 3247',
        customer_zip_code: 'C1193',
        status: 'paid',
        total_amount: 960000,
        created_at: '2026-08-12T12:42:00Z',
        order_items: [
          {
            id: 5,
            product_id: 12,
            quantity: 8,
            unit_price: 120000,
            warehouse_id: 3,
            product: { id: 12, sku: 'PRO-8812-A', name: 'Nodo sensor industrial v3' },
          },
        ],
      }),
    )

    const order = await fetchOrder(8829)

    expect(order.lines).toEqual([
      {
        id: 5,
        productId: 12,
        sku: 'PRO-8812-A',
        productName: 'Nodo sensor industrial v3',
        quantity: 8,
        unitPrice: 120000,
        warehouseId: 3,
      },
    ])
  })

  it('keeps the version from the ETag as it came', async () => {
    vi.spyOn(client, 'get').mockResolvedValueOnce(
      respond({ ...ORDER, order_items: [] }, { etag: 'W/"abc123"' }),
    )

    expect((await fetchOrder(8829)).version).toBe('W/"abc123"')
  })

  it('has no version when the ETag did not arrive', async () => {
    vi.spyOn(client, 'get').mockResolvedValueOnce(respond({ ...ORDER, order_items: [] }))

    expect((await fetchOrder(8829)).version).toBeNull()
  })
})

describe('updateOrder', () => {
  const payload = {
    order: {
      customer_name: 'Global Tech',
      customer_document: '30-71234567-8',
      customer_address: 'Av. Corrientes 3247',
      customer_city: 'CABA',
      customer_province: 'Ciudad Autónoma de Buenos Aires',
      customer_zip_code: '1193',
      status: 'paid' as const,
    },
  }

  it('sends the version it read as If-Match', async () => {
    const put = vi
      .spyOn(client, 'put')
      .mockResolvedValueOnce(respond({ ...ORDER, order_items: [] }, { etag: '"v2"' }))

    const order = await updateOrder(8829, payload, '"v1"')

    expect(put).toHaveBeenCalledWith('/orders/8829', payload, { headers: { 'If-Match': '"v1"' } })
    expect(order.version).toBe('"v2"')
  })

  it('sends no If-Match at all when there is no version', async () => {
    const put = vi
      .spyOn(client, 'put')
      .mockResolvedValueOnce(respond({ ...ORDER, order_items: [] }))

    await updateOrder(8829, payload, null)

    expect(put).toHaveBeenCalledWith('/orders/8829', payload, { headers: undefined })
  })
})

describe('fetchProductStocks', () => {
  it('indexes the units of each warehouse by its id', async () => {
    vi.spyOn(client, 'get').mockResolvedValueOnce(
      respond({
        id: 12,
        sku: 'PX-9021-LRG',
        stocks: [
          { id: 1, warehouse_id: 3, quantity: 40, warehouse: { id: 3 } },
          { id: 2, warehouse_id: 5, quantity: 0, warehouse: { id: 5 } },
        ],
      }),
    )

    expect(await fetchProductStocks(12)).toEqual({ productId: 12, quantities: { 3: 40, 5: 0 } })
  })
})

describe('fetchWarehouses', () => {
  it('unwraps the list and translates the zip code', async () => {
    vi.spyOn(client, 'get').mockResolvedValueOnce(
      respond({
        data: [{ id: 3, name: 'CD Ezeiza', address: 'Ruta 205 km 45', zip_code: '1804' }],
      }),
    )

    expect(await fetchWarehouses()).toEqual([
      { id: 3, name: 'CD Ezeiza', address: 'Ruta 205 km 45', zipCode: '1804' },
    ])
  })
})

describe('fetchProvinces', () => {
  it('reads the vocabulary from the backend as it comes', async () => {
    const get = vi
      .spyOn(client, 'get')
      .mockResolvedValueOnce(respond({ data: ['Buenos Aires', 'Córdoba'] }))

    expect(await fetchProvinces()).toEqual(['Buenos Aires', 'Córdoba'])
    expect(get).toHaveBeenCalledWith('/orders/provinces')
  })
})

describe('fetchCatalogProducts', () => {
  function capture() {
    const sent: { params?: Record<string, unknown> }[] = []
    vi.spyOn(client, 'get').mockImplementation((_url: string, config?: unknown) => {
      sent.push(config as { params?: Record<string, unknown> })
      return Promise.resolve(respond({ data: [], meta: { page: 1, per_page: 20, total: 0 } }))
    })

    return sent
  }

  // El filtro lo hace el backend desde TESIS-125: lo que esta capa tiene que
  // garantizar es que el término llegue.
  it('sends the term as the search parameter', async () => {
    const sent = capture()

    await fetchCatalogProducts('cable')

    expect(sent[0].params).toEqual({ page: 1, per_page: CATALOG_MATCHES, search: 'cable' })
  })

  it('trims the term before sending it', async () => {
    const sent = capture()

    await fetchCatalogProducts('  cable  ')

    expect(sent[0].params).toMatchObject({ search: 'cable' })
  })

  // Un `search` vacío haría que el backend filtre por cadena vacía: no viaja.
  it('omits the parameter when nothing was typed', async () => {
    const sent = capture()

    await fetchCatalogProducts('   ')

    expect(sent[0].params).toEqual({ page: 1, per_page: CATALOG_MATCHES })
  })
})
