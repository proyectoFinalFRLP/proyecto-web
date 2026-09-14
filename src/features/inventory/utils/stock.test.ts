import { describe, expect, it } from 'vitest'

import type { ProductStock } from '../types'

import {
  CRITICAL_STOCK_UNITS,
  LOW_STOCK_UNITS,
  sortByQuantityDesc,
  stockLevel,
  totalOnHand,
} from './stock'

function stock(overrides: Partial<ProductStock> = {}): ProductStock {
  return {
    warehouseId: 1,
    quantity: 10,
    warehouse: { id: 1, name: 'CD Ezeiza', address: 'Autopista Riccheri km 33' },
    ...overrides,
  }
}

describe('stockLevel', () => {
  it('is out at zero', () => {
    expect(stockLevel(0)).toBe('out')
  })

  it('is out for a negative quantity', () => {
    expect(stockLevel(-5)).toBe('out')
  })

  it('is critical just above zero', () => {
    expect(stockLevel(1)).toBe('critical')
  })

  // El límite que separa "crítico" de "bajo": la cantidad exacta del umbral
  // todavía cuenta como crítico, no como el nivel siguiente.
  it('is critical at the critical threshold', () => {
    expect(stockLevel(CRITICAL_STOCK_UNITS)).toBe('critical')
  })

  it('is low just above the critical threshold', () => {
    expect(stockLevel(CRITICAL_STOCK_UNITS + 1)).toBe('low')
  })

  it('is low at the low threshold', () => {
    expect(stockLevel(LOW_STOCK_UNITS)).toBe('low')
  })

  it('is available just above the low threshold', () => {
    expect(stockLevel(LOW_STOCK_UNITS + 1)).toBe('available')
  })
})

describe('totalOnHand', () => {
  it('is zero for an empty list', () => {
    expect(totalOnHand([])).toBe(0)
  })

  it('sums the quantity of every position', () => {
    const stocks = [stock({ quantity: 10 }), stock({ warehouseId: 2, quantity: 25 })]

    expect(totalOnHand(stocks)).toBe(35)
  })
})

describe('sortByQuantityDesc', () => {
  it('orders positions from highest to lowest quantity', () => {
    const stocks = [stock({ quantity: 10 }), stock({ quantity: 40 }), stock({ quantity: 25 })]

    expect(sortByQuantityDesc(stocks).map((position) => position.quantity)).toEqual([40, 25, 10])
  })

  // `sort` muta el array que recibe, y este llega desde la caché de React
  // Query: mutarlo ahí rompería a cualquier otro consumidor de esa misma
  // referencia sin que el bug se vea en esta pantalla.
  it('does not mutate the array it receives', () => {
    const stocks = [stock({ quantity: 10 }), stock({ quantity: 40 })]
    const original = [...stocks]

    sortByQuantityDesc(stocks)

    expect(stocks).toEqual(original)
  })
})
