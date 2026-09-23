import type { OrderDraftItem } from 'shared/store'
import { describe, expect, it } from 'vitest'

import { canProceed, draftSubtotal, draftWeight, isDraftItemValid } from './draft'

function item(overrides: Partial<OrderDraftItem> = {}): OrderDraftItem {
  return {
    productId: 1,
    sku: 'PX-9021-LRG',
    name: 'Router industrial',
    category: 'Electronics',
    weight: 1.2,
    unitPrice: 120000,
    quantity: 12,
    ...overrides,
  }
}

describe('isDraftItemValid', () => {
  it('accepts a whole quantity with a positive price', () => {
    expect(isDraftItemValid({ quantity: 1, unitPrice: 0.01 })).toBe(true)
  })

  it.each([
    ['zero units', { quantity: 0, unitPrice: 10 }],
    ['a fraction of a unit', { quantity: 1.5, unitPrice: 10 }],
    ['a blank quantity', { quantity: Number.NaN, unitPrice: 10 }],
    ['a free line', { quantity: 1, unitPrice: 0 }],
  ])('rejects %s', (_label, candidate) => {
    expect(isDraftItemValid(candidate)).toBe(false)
  })
})

describe('draftSubtotal', () => {
  it('adds up price by quantity of every line', () => {
    expect(
      draftSubtotal([item({ unitPrice: 100, quantity: 2 }), item({ unitPrice: 0.5, quantity: 3 })]),
    ).toBe(201.5)
  })

  // Un campo de cantidad vacío no puede volver NaN el total de la pantalla.
  it('skips a line whose quantity is still blank', () => {
    expect(
      draftSubtotal([item({ unitPrice: 100, quantity: 2 }), item({ quantity: Number.NaN })]),
    ).toBe(200)
  })

  // Sumar en punto flotante deja restos que una comparación no perdona.
  it('does not accumulate floating point noise', () => {
    expect(
      draftSubtotal([item({ unitPrice: 0.1, quantity: 1 }), item({ unitPrice: 0.2, quantity: 1 })]),
    ).toBe(0.3)
  })
})

describe('draftWeight', () => {
  it('multiplies the unit weight by the quantity of every line', () => {
    expect(
      draftWeight([item({ weight: 1.2, quantity: 12 }), item({ weight: 0.4, quantity: 50 })]),
    ).toBe(34.4)
  })

  it('is exact to the gram', () => {
    expect(draftWeight([item({ weight: 0.1, quantity: 3 })])).toBe(0.3)
  })
})

describe('canProceed', () => {
  it('needs the customer and at least one line', () => {
    expect(canProceed(true, [])).toBe(false)
    expect(canProceed(false, [item()])).toBe(false)
    expect(canProceed(true, [item()])).toBe(true)
  })

  // Una fila a medias bloquea el paso entero: el envío la rechazaría.
  it('is blocked by a single invalid line', () => {
    expect(canProceed(true, [item(), item({ productId: 2, quantity: 0 })])).toBe(false)
  })
})
