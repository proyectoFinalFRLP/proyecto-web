import { describe, expect, it } from 'vitest'

import type { Product, ProductStock } from '../types'

import { distributionPositions, sortByQuantityDesc } from './stock'

function stock(overrides: Partial<ProductStock> = {}): ProductStock {
  return {
    warehouseId: 1,
    quantity: 10,
    committed: 0,
    warehouse: { id: 1, name: 'CD Ezeiza', address: 'Autopista Riccheri km 33', capacity: null },
    stockStatus: 'low',
    ...overrides,
  }
}

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: 5,
    sku: 'CAB-6-305',
    name: 'Cable UTP Cat6',
    description: null,
    category: null,
    packaging: null,
    technicalStandard: null,
    weight: 12.4,
    committed: 0,
    onHand: 0,
    availableToPromise: 0,
    inTransit: 0,
    dimensions: null,
    stocks: [],
    totalStock: 0,
    stockStatus: 'out_of_stock',
    inTransitQuantity: 0,
    inTransitByWarehouse: [],
    committedByWarehouse: [],
    updatedAt: '2026-08-30T12:00:00.000Z',
    version: null,
    ...overrides,
  }
}

const central = stock({
  warehouseId: 1,
  quantity: 100,
  warehouse: { id: 1, name: 'Central', address: 'Av. 7', capacity: null },
})
const satelite = stock({
  warehouseId: 2,
  quantity: 30,
  warehouse: { id: 2, name: 'Satélite', address: 'Calle 25', capacity: null },
})

describe('sortByQuantityDesc', () => {
  it('orders the positions from the largest to the smallest quantity', () => {
    const stocks = [stock({ quantity: 10 }), stock({ quantity: 40 }), stock({ quantity: 25 })]

    expect(sortByQuantityDesc(stocks).map((position) => position.quantity)).toEqual([40, 25, 10])
  })

  // El array llega desde la caché de React Query: ordenarlo en el lugar
  // reordenaría los datos de cualquier otro consumidor.
  it('does not mutate the array it receives', () => {
    const stocks = [stock({ quantity: 10 }), stock({ quantity: 40 })]

    sortByQuantityDesc(stocks)

    expect(stocks.map((position) => position.quantity)).toEqual([10, 40])
  })
})

describe('distributionPositions', () => {
  it('keeps the status the backend sent for each warehouse', () => {
    const positions = distributionPositions(
      product({ stocks: [stock({ quantity: 500, stockStatus: 'available' })] }),
    )

    expect(positions[0]?.stockStatus).toBe('available')
  })

  it('adds the incoming units to the warehouse they travel to', () => {
    const positions = distributionPositions(
      product({
        stocks: [satelite, central],
        inTransitByWarehouse: [{ warehouseId: 2, name: 'Satélite', quantity: 7 }],
      }),
    )

    expect(positions.map((position) => [position.name, position.incoming])).toEqual([
      ['Central', 0],
      ['Satélite', 7],
    ])
  })

  // La fila de stock del destino nace recién cuando se recibe la transferencia.
  it('lists a warehouse that only receives units, after the stocked ones', () => {
    const positions = distributionPositions(
      product({
        stocks: [central],
        inTransitByWarehouse: [{ warehouseId: 9, name: 'Depósito Sur', quantity: 4 }],
      }),
    )

    expect(positions[1]).toEqual({
      warehouseId: 9,
      name: 'Depósito Sur',
      location: null,
      quantity: 0,
      incoming: 4,
      committed: 0,
      onHand: 0,
      stockStatus: 'out_of_stock',
    })
  })

  // Si la venta se llevó la última unidad, el depósito se queda sin fila de
  // stock y lo comprometido sigue en su estante. Esconderlo haría desaparecer
  // de la tabla unidades que están ahí.
  it('lists a warehouse that only has units sold and not yet dispatched', () => {
    const positions = distributionPositions(
      product({
        stocks: [central],
        committedByWarehouse: [{ warehouseId: 9, name: 'Depósito Sur', quantity: 6 }],
      }),
    )

    expect(positions[1]).toEqual({
      warehouseId: 9,
      name: 'Depósito Sur',
      location: null,
      quantity: 0,
      incoming: 0,
      committed: 6,
      // Sin fila de stock no quedan libres, pero las seis vendidas están en su
      // estante: ése es todo su físico.
      onHand: 6,
      stockStatus: 'out_of_stock',
    })
  })

  // El mismo depósito puede estar recibiendo unidades y tener otras vendidas:
  // es una fila, no dos.
  it('keeps a warehouse with both incoming and committed units in a single row', () => {
    const positions = distributionPositions(
      product({
        stocks: [central],
        inTransitByWarehouse: [{ warehouseId: 9, name: 'Depósito Sur', quantity: 4 }],
        committedByWarehouse: [{ warehouseId: 9, name: 'Depósito Sur', quantity: 6 }],
      }),
    )

    expect(positions).toHaveLength(2)
    expect(positions[1]).toMatchObject({ warehouseId: 9, incoming: 4, committed: 6 })
  })

  // Lo comprometido de un depósito que sí tiene fila sale de esa fila, no de
  // una segunda entrada.
  it('reads the committed units of a stocked warehouse from its own row', () => {
    const positions = distributionPositions(
      product({
        stocks: [{ ...central, committed: 3 }],
        committedByWarehouse: [{ warehouseId: 1, name: 'Central', quantity: 3 }],
      }),
    )

    expect(positions).toHaveLength(1)
    expect(positions[0]).toMatchObject({ warehouseId: 1, committed: 3 })
  })

  // El encabezado de la pantalla dice «En depósito (físico)» y lo define como
  // libre + comprometido. La columna de la tabla lleva el mismo rótulo, así que
  // tiene que contar lo mismo: con 15 libres y 4 vendidas sin despachar, en el
  // estante hay 19, no 15.
  it('counts the physical units of a warehouse, not just the free ones', () => {
    const positions = distributionPositions(
      product({ stocks: [{ ...central, quantity: 15, committed: 4 }] }),
    )

    expect(positions[0]).toMatchObject({ quantity: 15, committed: 4, onHand: 19 })
  })

  // El titular de la tarjeta es on hand y las filas tienen que sumarlo: antes
  // daban 40 contra un encabezado de 44.
  it('adds its rows up to the on-hand figure of the product', () => {
    const positions = distributionPositions(
      product({
        stocks: [
          { ...central, quantity: 15, committed: 4 },
          { ...central, warehouseId: 2, quantity: 25, committed: 0 },
        ],
      }),
    )

    expect(positions.reduce((total, position) => total + position.onHand, 0)).toBe(44)
  })

  it('answers no rows for a product with no stock and nothing in flight', () => {
    expect(distributionPositions(product())).toEqual([])
  })
})
