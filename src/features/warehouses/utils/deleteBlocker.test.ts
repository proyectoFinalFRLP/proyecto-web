import { describe, expect, it } from 'vitest'

import { deleteBlockerFrom } from './deleteBlocker'

// Los tres textos que hoy responde `WarehousesController#blocking_reason`.
describe('deleteBlockerFrom', () => {
  it('recognizes a warehouse with stock rows', () => {
    expect(deleteBlockerFrom('Cannot delete warehouse with existing stock')).toBe('stock')
  })

  it('recognizes a warehouse that order lines came from', () => {
    expect(deleteBlockerFrom('Cannot delete warehouse with order lines taken from it')).toBe(
      'orders',
    )
  })

  // «stock transfers» también contiene «stock»: el orden de los fragmentos es
  // lo que evita leerlo como el caso de stock.
  it('recognizes a warehouse with transfers before mistaking it for stock', () => {
    expect(deleteBlockerFrom('Cannot delete warehouse with stock transfers from or to it')).toBe(
      'transfers',
    )
  })

  it('falls back to a generic reason for a text it does not know', () => {
    expect(deleteBlockerFrom('Something else')).toBe('unknown')
    expect(deleteBlockerFrom(undefined)).toBe('unknown')
  })
})
