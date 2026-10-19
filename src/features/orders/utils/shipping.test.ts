import type { OrderDraftItem } from 'shared/store'
import { describe, expect, it } from 'vitest'

import type { ProductStockByWarehouse, ShippingQuote } from '../types'

import {
  onlyCoveringWarehouse,
  toCreateOrderPayload,
  toDispatchPayload,
  toDraftQuotePayload,
  totalWithShipping,
  warehouseCoverage,
} from './shipping'
import type { CoverageLevel, WarehouseCoverage } from './shipping'

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

  // TESIS-179: el contacto del paso 1 viaja con la orden; en blanco, `null`.
  it('sends the contact of the customer, a blank one as null', () => {
    const contact = { ...customer, email: ' marina@empresa.com ', phone: '' }
    const payload = toCreateOrderPayload(contact, [ROUTER], origin, destination)

    expect(payload.order).toMatchObject({
      customer_email: 'marina@empresa.com',
      customer_phone: null,
    })
  })

  it('sends no contact for a draft saved before it existed', () => {
    const payload = toCreateOrderPayload(customer, [ROUTER], origin, destination)

    expect(payload.order).toMatchObject({ customer_email: null, customer_phone: null })
  })

  // TESIS-178: con retiro el domicilio es opcional, y la API rechazaba la
  // provincia vacía.
  it('sends a blank destination as null, not as empty text', () => {
    const blank = { address: ' ', city: '', province: '', zipCode: '' }
    const payload = toCreateOrderPayload(customer, [ROUTER], origin, blank, false)

    expect(payload.order).toMatchObject({
      customer_address: null,
      customer_city: null,
      customer_province: null,
      customer_zip_code: null,
      requires_shipping: false,
    })
  })

  it('keeps the part of the destination the operator did fill', () => {
    const partial = { address: 'Calle 7 1234', city: '', province: '', zipCode: '' }
    const payload = toCreateOrderPayload(customer, [ROUTER], origin, partial, false)

    expect(payload.order.customer_address).toBe('Calle 7 1234')
    expect(payload.order.customer_province).toBeNull()
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

  it('sends the city and the province the operator entered, trimmed', () => {
    expect(
      toDraftQuotePayload([ROUTER], origin, { ...destination, city: ' CABA ' }).quote,
    ).toMatchObject({
      destination_city: 'CABA',
      destination_province: 'Ciudad Autónoma de Buenos Aires',
    })
  })

  // Un campo en blanco no es una localidad: no viaja, en vez de viajar vacío.
  it('leaves out the city and the province while they are blank', () => {
    const { quote } = toDraftQuotePayload([ROUTER], origin, {
      ...destination,
      city: '  ',
      province: '',
    })

    expect(quote).not.toHaveProperty('destination_city')
    expect(quote).not.toHaveProperty('destination_province')
  })

  // La orden todavía no existe: el valor declarado es lo que suman los
  // productos del borrador, el mismo subtotal que muestra el resumen.
  it('declares what the products of the draft add up to', () => {
    expect(toDraftQuotePayload([ROUTER, SENSOR], origin, destination).quote.declared_value).toBe(
      1680000,
    )
  })

  // En pesos, como lo lee la API: la suma se hace en centavos para que 0,1 + 0,2
  // no dé 0,30000000000000004, pero lo que viaja no se multiplica por 100.
  it('declares pesos without float noise', () => {
    const cheap = [
      item({ unitPrice: 0.1, quantity: 1 }),
      item({ productId: 13, unitPrice: 0.2, quantity: 1 }),
    ]

    expect(toDraftQuotePayload(cheap, origin, destination).quote.declared_value).toBe(0.3)
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
    expect(toDispatchPayload(quote, 3).dispatch.company_integration_id).toBe(4)
  })

  it('carries the origin and the cost that was confirmed', () => {
    expect(toDispatchPayload(quote, 3).dispatch).toMatchObject({
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

// TESIS-173: con un único depósito posible, el paso 2 lo trae elegido.
describe('onlyCoveringWarehouse', () => {
  const coverage = (levels: Record<number, CoverageLevel>) =>
    new Map(
      Object.entries(levels).map(([id, level]) => [
        Number(id),
        { level, missing: [], total: 1 } satisfies WarehouseCoverage,
      ]),
    )

  it('names the only warehouse that covers the whole draft', () => {
    expect(onlyCoveringWarehouse(coverage({ 1: 'partial', 2: 'full', 3: 'none' }))).toBe(2)
  })

  // Con dos posibles, de cuál sale la mercadería lo decide el operador.
  it('does not pick between two that cover it', () => {
    expect(onlyCoveringWarehouse(coverage({ 1: 'full', 2: 'full' }))).toBeNull()
  })

  it('has nothing to pick when none covers it', () => {
    expect(onlyCoveringWarehouse(coverage({ 1: 'partial', 2: 'none' }))).toBeNull()
  })

  it('waits while the coverage is unknown', () => {
    expect(onlyCoveringWarehouse(null)).toBeNull()
  })
})
