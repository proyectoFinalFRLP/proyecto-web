import { describe, expect, it } from 'vitest'

import { formatOrderId, formatShortDate, formatTime } from './recentOrders'

// `toContain` y no `toBe`: entre el símbolo y el número, `Intl` mete un espacio
// duro (U+00A0) que en la comparación no se distingue de uno común y deja un
// diff ilegible — «expected '$ 0,00' to be '$ 0,00'».
describe('formatOrderId', () => {
  it('prefers the id of the external channel, which is how the operator knows it', () => {
    expect(formatOrderId('ORD-8829-X', 412)).toBe('#ORD-8829-X')
  })

  // Las ventas cargadas a mano no vienen de ningún canal: la columna es la que
  // abre el detalle y no puede quedar vacía.
  it('falls back to the internal id when there is no external one', () => {
    expect(formatOrderId(null, 412)).toBe('#412')
  })
})

describe('the date column', () => {
  it('shows the day without the year, as the design does', () => {
    expect(formatShortDate('2026-08-24T09:14:00-03:00')).toMatch(/^24.*ago/)
  })

  it('leaves the year out of it', () => {
    expect(formatShortDate('2026-08-24T09:14:00-03:00')).not.toContain('2026')
  })

  // `hourCycle: 'h23'`: con `hour12: false` la medianoche sale «24:14».
  it('writes midnight as 00 and not as 24', () => {
    expect(formatTime('2026-08-24T00:14:00-03:00')).toBe('00:14')
  })

  it('writes the afternoon in 24 hours', () => {
    expect(formatTime('2026-08-24T14:20:00-03:00')).toBe('14:20')
  })
})
