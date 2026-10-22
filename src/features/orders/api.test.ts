import type { AxiosResponse } from 'axios'
import { client } from 'shared/api/client'
import { describe, expect, it, vi } from 'vitest'

import {
  CATALOG_MATCHES,
  createOrder,
  createOrderShipment,
  dispatchShipment,
  fetchCatalogProducts,
  fetchOrder,
  fetchOrderPage,
  fetchOrderShipment,
  fetchProductStocks,
  fetchProvinces,
  fetchShipmentLabel,
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
  shipping_label_url: 'https://andreani.test/etiquetas/AND-9920.pdf',
  external_reference: '0012345678',
  label_available: true,
  courier: { id: 4, service_id: 7, name: 'Andreani' },
  origin_warehouse: { id: 1, name: 'Depósito Central' },
  promised_delivery_on: '2026-08-15',
  delayed: true,
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
        labelUrl: 'https://andreani.test/etiquetas/AND-9920.pdf',
        labelAvailable: true,
        externalReference: '0012345678',
        courier: { id: 4, serviceId: 7, name: 'Andreani' },
        originWarehouse: { id: 1, name: 'Depósito Central' },
        promisedDeliveryOn: '2026-08-15',
        delayed: true,
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

  // Un backend anterior a TESIS-186 no los manda: sin el dato no se ofrece
  // imprimir, porque el endpoint de la etiqueta tampoco existe.
  it('offers no label and no pickup order when the api does not send them', async () => {
    const older: Partial<typeof SHIPMENT> = { ...SHIPMENT }
    delete older.external_reference
    delete older.label_available
    vi.spyOn(client, 'get')
      .mockResolvedValueOnce(shipmentList([31]))
      .mockResolvedValueOnce(respond(older))

    const result = await fetchOrderShipment(8829)

    expect(result).toMatchObject({
      shipment: { labelAvailable: false, externalReference: null },
    })
  })

  // Una API anterior no los manda: sin la fecha no se afirma una demora.
  it('reads a shipment without origin or promise as not delayed', async () => {
    const older: Partial<typeof SHIPMENT> = { ...SHIPMENT }
    delete older.origin_warehouse
    delete older.promised_delivery_on
    delete older.delayed
    vi.spyOn(client, 'get')
      .mockResolvedValueOnce(shipmentList([31]))
      .mockResolvedValueOnce(respond(older))

    expect(await fetchOrderShipment(8829)).toMatchObject({
      shipment: { originWarehouse: null, promisedDeliveryOn: null, delayed: false },
    })
  })

  it('treats a blank pickup order as none', async () => {
    vi.spyOn(client, 'get')
      .mockResolvedValueOnce(shipmentList([31]))
      .mockResolvedValueOnce(respond({ ...SHIPMENT, external_reference: '  ' }))

    expect(await fetchOrderShipment(8829)).toMatchObject({
      shipment: { externalReference: null },
    })
  })
})

describe('fetchShipmentLabel', () => {
  const pdf = new Blob(['%PDF-1.4'], { type: 'application/pdf' })

  it('asks for the label as a file, through the authenticated client', async () => {
    const get = vi
      .spyOn(client, 'get')
      .mockResolvedValueOnce(respond(pdf, { 'content-type': 'application/pdf' }))

    await expect(fetchShipmentLabel(31)).resolves.toBe(pdf)
    expect(get).toHaveBeenCalledWith('/shipments/31/label', { responseType: 'blob' })
  })

  it('reads the type of the file when the response has no content type', async () => {
    vi.spyOn(client, 'get').mockResolvedValueOnce(respond(pdf))

    await expect(fetchShipmentLabel(31)).resolves.toBe(pdf)
  })

  // El backend redirige a la URL del courier y el navegador la sigue: lo que
  // vuelve es la página del courier, no el PDF.
  it('returns nothing when the redirect ended in something that is not a pdf', async () => {
    const page = new Blob(['<html></html>'], { type: 'text/html' })
    vi.spyOn(client, 'get').mockResolvedValueOnce(
      respond(page, { 'content-type': 'text/html; charset=utf-8' }),
    )

    await expect(fetchShipmentLabel(31)).resolves.toBeNull()
  })
})

const ORDER = {
  id: 8829,
  external_order_id: null,
  customer_name: 'Global Tech Solutions S.A.',
  customer_document: '30-71234567-8',
  customer_address: 'Av. Corrientes 3247',
  customer_zip_code: 'C1193',
  requires_shipping: true,
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
        requires_shipping: true,
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

  // Si el front se despliega antes que el backend que agrega el campo,
  // `undefined` es falsy y el detalle trataría la orden como retiro en el
  // local: ocultaría el envío y el despacho de una venta que sí los lleva.
  it('treats an order whose API does not send requires_shipping as one that ships', async () => {
    const { requires_shipping: omitido, ...sinElCampo } = ORDER
    expect(omitido).toBe(true)
    vi.spyOn(client, 'get').mockResolvedValueOnce(respond({ ...sinElCampo, order_items: [] }))

    const order = await fetchOrder(8829)

    expect(order.requiresShipping).toBe(true)
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
      requires_shipping: true,
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
      declared_value: 480000,
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
        declared_value: 120000,
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
        requires_shipping: true,
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
      dispatch: {
        company_integration_id: 4,
        origin_warehouse_id: 3,
        shipping_cost: 58300,
        estimated_days: 2,
      },
    }

    const shipment = await dispatchShipment(31, payload)

    expect(post).toHaveBeenCalledWith('/shipments/31/dispatch', payload)
    expect(shipment.trackingNumber).toBe('AND-9920-X8829-Z')
  })
})

// El mismo riesgo que en el detalle, en el otro mapeo: el listado marca con un
// chip las ventas que se retiran en el local, y sin el campo las marcaría
// todas.
describe('fetchOrderPage and a backend that does not send requires_shipping', () => {
  it('treats every order as one that ships', async () => {
    const { requires_shipping: omitido, ...sinElCampo } = ORDER
    expect(omitido).toBe(true)
    vi.spyOn(client, 'get').mockResolvedValueOnce(
      respond({ data: [sinElCampo], meta: { page: 1, per_page: 20, total: 1 } }),
    )

    const page = await fetchOrderPage({ page: 1, perPage: 20, search: '' })

    expect(page.orders[0].requiresShipping).toBe(true)
  })
})
