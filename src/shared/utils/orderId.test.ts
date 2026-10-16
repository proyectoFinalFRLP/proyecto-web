import { describe, expect, it } from 'vitest'

import { formatOrderId } from './orderId'

describe('formatOrderId', () => {
  it('prefers the external id, which is how the channel names the sale', () => {
    expect(formatOrderId('ML-1001', 42)).toBe('#ML-1001')
  })

  // Una venta cargada a mano no viene de ningún canal y no tiene id externo.
  it('falls back to the internal id when there is no external one', () => {
    expect(formatOrderId(null, 42)).toBe('#42')
  })
})
