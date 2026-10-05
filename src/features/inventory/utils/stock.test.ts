import { describe, expect, it } from 'vitest'

import type { Product, ProductStock } from '../types'

import { distributionPositions, sortByQuantityDesc } from './stock'

function stock(overrides: Partial<ProductStock> = {}): ProductStock {
  return {
    warehouseId: 1,
    quantity: 10,
    warehouse: { id: 1, name: 'CD Ezeiza', address: 'Autopista Riccheri km 33' },
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
    weight: 12.4,
    dimensions: null,
    stocks: [],
    totalStock: 0,
    stockStatus: 'out_of_stock',
    inTransitQuantity: 0,
    inTransitByWarehouse: [],
    updatedAt: '2026-08-30T12:00:00.000Z',
    version: null,
    ...overrides,
  }
}

const central = stock({
  warehouseId: 1,
  quantity: 100,
  warehouse: { id: 1, name: 'Central', address: 'Av. 7' },
})
const satelite = stock({
  warehouseId: 2,
  quantity: 30,
  warehouse: { id: 2, name: 'Satélite', address: 'Calle 25' },
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
      stockStatus: 'out_of_stock',
    })
  })

  it('answers no rows for a product with no stock and nothing in flight', () => {
    expect(distributionPositions(product())).toEqual([])
  })
})
