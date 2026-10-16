import { describe, expect, it } from 'vitest'

import { formatOrderId } from './orderId'

describe('formatOrderId', () => {
  it('prefers the external id, which is how the channel names the sale', () => {
    expect(formatOrderId('ML-1001', 42)).toBe('#ML-1001')
  })

  // TESIS-180: el número que muestra la tienda gana sobre el id de la API.
  it('prefers the number the store shows, without doubling its #', () => {
    expect(formatOrderId('18948032757993', 42, '#1001')).toBe('#1001')
    expect(formatOrderId('18948032757993', 42, 'NORTE-1001')).toBe('#NORTE-1001')
  })

  it('falls back to the channel id when the store number is blank', () => {
    expect(formatOrderId('18948032757993', 42, '')).toBe('#18948032757993')
  })

  // Una venta cargada a mano no viene de ningún canal y no tiene id externo.
  it('falls back to the internal id when there is no external one', () => {
    expect(formatOrderId(null, 42)).toBe('#42')
  })
})
