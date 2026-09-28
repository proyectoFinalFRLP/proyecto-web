import type { OrderDraftItem } from 'shared/store'
import { describe, expect, it } from 'vitest'

import type { ProductStockByWarehouse, ShippingQuote } from '../types'

import {
  toCreateOrderPayload,
  toDispatchPayload,
  toDraftQuotePayload,
  totalWithShipping,
  warehouseCoverage,
} from './shipping'

function item(overrides: Partial<OrderDraftItem> = {}): OrderDraftItem {
  return {
    productId: 12,
    sku: 'PX-9021-LRG',
    name: 'Router industrial de alta densidad',
    category: 'Electronics',
    weight: 1.2,
    unitPrice: 120000,
    quantity: 4,
    ...overrides,
  }
}

const ROUTER = item()
const SENSOR = item({ productId: 13, sku: 'PX-1185-MED', quantity: 10 })

// Depósito 1: cubre los dos. Depósito 2: sólo el router. Depósito 3: ninguno.
const STOCKS: ProductStockByWarehouse[] = [
  { productId: 12, quantities: { 1: 40, 2: 4, 3: 1 } },
  { productId: 13, quantities: { 1: 10, 2: 9 } },
]

describe('warehouseCoverage', () => {
  it('is full when the warehouse has every line in the quantity ordered', () => {
    expect(warehouseCoverage(1, [ROUTER, SENSOR], STOCKS)).toEqual({
      level: 'full',
      missing: [],
      total: 2,
    })
  })

  // El borde: exactamente las unidades pedidas alcanzan.
  it('counts an exact match as covered', () => {
    expect(warehouseCoverage(2, [ROUTER], STOCKS).level).toBe('full')
  })

  it('is partial and names the SKU that falls short', () => {
    expect(warehouseCoverage(2, [ROUTER, SENSOR], STOCKS)).toMatchObject({
      level: 'partial',
      missing: ['PX-1185-MED'],
    })
  })

  // El sensor no tiene fila de stock en el depósito 3: cuenta como cero, igual
  // que en el backend.
  it('is none when no line is covered, counting a missing stock row as zero', () => {
    expect(warehouseCoverage(3, [ROUTER, SENSOR], STOCKS)).toMatchObject({
      level: 'none',
      missing: ['PX-9021-LRG', 'PX-1185-MED'],
    })
  })

  it('treats a product whose stock has not loaded as not covered', () => {
    expect(warehouseCoverage(1, [ROUTER, item({ productId: 99, sku: 'X' })], STOCKS)).toMatchObject(
      {
        level: 'partial',
        missing: ['X'],
      },
    )
  })
})

describe('toCreateOrderPayload', () => {
  const customer = { firstName: ' Marina ', lastName: 'Rodríguez ', document: ' 20-31298744-9' }
  const origin = { warehouseId: 3, name: 'CD Ezeiza' }
  const destination = {
    address: ' Av. Corrientes 3247, piso 5 ',
    city: ' CABA',
    province: 'Ciudad Autónoma de Buenos Aires',
    zipCode: '1193 ',
  }

  it('sends the origin warehouse on every line', () => {
    const payload = toCreateOrderPayload(customer, [ROUTER, SENSOR], origin, destination)

    expect(payload.order.items.map((line) => line.warehouse_id)).toEqual([3, 3])
  })

  it('carries the lines with the fields the API requires', () => {
    const payload = toCreateOrderPayload(customer, [ROUTER], origin, destination)

    expect(payload.order.items).toEqual([
      { product_id: 12, warehouse_id: 3, quantity: 4, unit_price: 120000 },
    ])
  })

  it('joins the name and trims what the operator typed', () => {
    const payload = toCreateOrderPayload(customer, [ROUTER], origin, destination)

    expect(payload.order).toMatchObject({
      customer_name: 'Marina Rodríguez',
      customer_document: '20-31298744-9',
      customer_address: 'Av. Corrientes 3247, piso 5',
      customer_city: 'CABA',
      customer_province: 'Ciudad Autónoma de Buenos Aires',
      customer_zip_code: '1193',
    })
  })
})

describe('toDraftQuotePayload', () => {
  const origin = { warehouseId: 3, name: 'CD Ezeiza' }
  const destination = {
    address: ' Av. Corrientes 3247, piso 5 ',
    city: 'CABA',
    province: 'Ciudad Autónoma de Buenos Aires',
    zipCode: '1193 ',
  }

  it('tells the quote where the parcel leaves from and where it goes', () => {
    expect(toDraftQuotePayload([ROUTER], origin, destination).quote).toMatchObject({
      origin_warehouse_id: 3,
      destination_zip_code: '1193',
      destination_address: 'Av. Corrientes 3247, piso 5',
    })
  })

  // El peso no viaja: lo calcula el backend con el de cada producto.
  it('says what the parcel carries, not how much it weighs', () => {
    expect(toDraftQuotePayload([ROUTER, SENSOR], origin, destination).quote.items).toEqual([
      { product_id: 12, quantity: 4 },
      { product_id: 13, quantity: 10 },
    ])
  })
})

describe('toDispatchPayload', () => {
  const quote: ShippingQuote = {
    quoteIntegrationId: 7,
    dispatchIntegrationId: 4,
    providerName: 'Andreani',
    shippingCost: 58300,
    estimatedDays: 2,
  }

  // La cotización la contesta una plantilla y la etiqueta la emite otra: el
  // despacho rechaza la integración de la cotización.
  it('dispatches with the integration that dispatches, not with the one that quoted', () => {
    expect(
      toDispatchPayload(quote, { warehouseId: 3, name: 'CD Ezeiza' }).dispatch
        .company_integration_id,
    ).toBe(4)
  })

  it('carries the origin and the cost that was confirmed', () => {
    expect(toDispatchPayload(quote, { warehouseId: 3, name: 'CD Ezeiza' }).dispatch).toMatchObject({
      origin_warehouse_id: 3,
      shipping_cost: 58300,
    })
  })
})

describe('totalWithShipping', () => {
  it('adds the chosen shipping to the products', () => {
    expect(totalWithShipping(1420000, 58300)).toBe(1478300)
  })

  it('adds cents without floating point leftovers', () => {
    expect(totalWithShipping(0.1, 0.2)).toBe(0.3)
  })

  // Sin opción elegida el envío no cuesta 0: el total es lo que se sabe.
  it('is the products alone while no shipping was chosen', () => {
    expect(totalWithShipping(1420000, null)).toBe(1420000)
  })
})
