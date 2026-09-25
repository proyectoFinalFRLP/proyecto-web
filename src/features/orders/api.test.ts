import type { AxiosResponse } from 'axios'
import { client } from 'shared/api/client'
import { describe, expect, it, vi } from 'vitest'

import {
  createOrder,
  createOrderShipment,
  dispatchShipment,
  fetchOrder,
  fetchOrderShipment,
  fetchProductStocks,
  fetchProvinces,
  fetchWarehouses,
  quoteDraft,
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

describe('quoteDraft', () => {
  const payload = {
    quote: {
      origin_warehouse_id: 3,
      destination_zip_code: '1193',
      destination_address: 'Av. Corrientes 3247',
      items: [{ product_id: 12, quantity: 4 }],
    },
  }

  it('quotes the draft against the endpoint that needs no order', async () => {
    const post = vi.spyOn(client, 'post').mockResolvedValueOnce(respond({ data: [] }))

    await quoteDraft(payload)

    expect(post).toHaveBeenCalledWith('/quotes', payload)
  })

  // `shipping_cost` es un BigDecimal de Rails y el JSON lo manda como string.
  it('turns each option into the domain, with the cost as a number', async () => {
    vi.spyOn(client, 'post').mockResolvedValueOnce(
      respond({
        data: [
          {
            company_integration_id: 7,
            dispatch_integration_id: 4,
            provider_name: 'Andreani',
            shipping_cost: '58300.0',
            estimated_days: null,
          },
        ],
      }),
    )

    expect(await quoteDraft(payload)).toEqual([
      {
        quoteIntegrationId: 7,
        dispatchIntegrationId: 4,
        providerName: 'Andreani',
        shippingCost: 58300,
        estimatedDays: null,
      },
    ])
  })
})

// Lo que elige el operador viaja al despacho y queda en `decimal(10,2)`: la
// pantalla tiene que mostrar lo mismo que después guarda el envío.
describe('the cost of a quote with more than two decimals', () => {
  async function quotedCost(cost: string | number) {
    vi.spyOn(client, 'post').mockResolvedValueOnce(
      respond({
        data: [
          {
            company_integration_id: 7,
            dispatch_integration_id: 4,
            provider_name: 'Andreani',
            shipping_cost: cost,
            estimated_days: null,
          },
        ],
      }),
    )
    const [quote] = await quoteDraft({
      quote: {
        origin_warehouse_id: 3,
        destination_zip_code: '1193',
        destination_address: 'Av. Corrientes 3247',
        items: [{ product_id: 12, quantity: 1 }],
      },
    })
    return quote?.shippingCost
  }

  it.each([
    ['1.005', 1.01],
    ['41200.555', 41200.56],
    ['41200.5', 41200.5],
    ['99.994', 99.99],
    [2500.125, 2500.13],
  ])('rounds %s to the cents the shipment keeps', async (cost, expected) => {
    expect(await quotedCost(cost)).toBe(expected)
  })
})

describe('the confirmation of a manual order', () => {
  it('creates the order with the payload of the wizard', async () => {
    const post = vi
      .spyOn(client, 'post')
      .mockResolvedValueOnce(respond({ ...ORDER, order_items: [] }))
    const payload = {
      order: {
        customer_name: 'Global Tech',
        customer_document: '30-71234567-8',
        customer_address: 'Av. Corrientes 3247',
        customer_city: 'CABA',
        customer_province: 'Ciudad Autónoma de Buenos Aires',
        customer_zip_code: '1193',
        items: [{ product_id: 12, warehouse_id: 3, quantity: 4, unit_price: 120000 }],
      },
    }

    const order = await createOrder(payload)

    expect(post).toHaveBeenCalledWith('/orders', payload)
    expect(order.id).toBe(ORDER.id)
  })

  it('opens the shipment of the order', async () => {
    const post = vi.spyOn(client, 'post').mockResolvedValueOnce(respond(SHIPMENT))

    const shipment = await createOrderShipment(8829)

    expect(post).toHaveBeenCalledWith('/orders/8829/shipment')
    expect(shipment.id).toBe(31)
  })

  it('dispatches the shipment with the chosen option', async () => {
    const post = vi.spyOn(client, 'post').mockResolvedValueOnce(respond(SHIPMENT))
    const payload = {
      dispatch: { company_integration_id: 4, origin_warehouse_id: 3, shipping_cost: 58300 },
    }

    const shipment = await dispatchShipment(31, payload)

    expect(post).toHaveBeenCalledWith('/shipments/31/dispatch', payload)
    expect(shipment.trackingNumber).toBe('AND-9920-X8829-Z')
  })
})
