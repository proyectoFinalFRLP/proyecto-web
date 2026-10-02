import { describe, expect, it } from 'vitest'

import { shouldRetryProduct } from './useInventory'

const failure = (status?: number) => Object.assign(new Error('x'), { status })

describe('shouldRetryProduct', () => {
  // El producto no existe (o es de otra empresa): reintentar no cambia nada.
  it('never retries a 404', () => {
    expect(shouldRetryProduct(0, failure(404))).toBe(false)
  })

  it('retries any other failure once', () => {
    expect(shouldRetryProduct(0, failure(500))).toBe(true)
    expect(shouldRetryProduct(1, failure(500))).toBe(false)
  })
})
