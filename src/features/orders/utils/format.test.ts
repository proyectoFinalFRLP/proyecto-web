import { describe, expect, it } from 'vitest'

import { formatMoney, formatOrderDate, formatOrderId, formatOrderTime } from './format'

describe('formatMoney', () => {
  it('groups thousands with a dot', () => {
    expect(formatMoney(1478300)).toContain('1.478.300')
  })

  /**
   * El diseño muestra los importes sin decimales, pero esta columna es plata
   * facturada: redondear en pantalla muestra un número que no es el de la
   * orden. Este ejemplo fija la decisión de apartarse del mock.
   */
  it('keeps the cents instead of rounding them away', () => {
    expect(formatMoney(1478300.49)).toContain('1.478.300,49')
  })

  it('always shows two decimals, even on a round amount', () => {
    expect(formatMoney(1000)).toContain('1.000,00')
  })

  it('formats zero without falling back to an empty cell', () => {
    expect(formatMoney(0)).toContain('0,00')
  })
})

describe('formatOrderDate', () => {
  it('renders day, short month and year', () => {
    // Mediodía UTC para que el día no se corra por el huso horario.
    expect(formatOrderDate('2026-08-24T12:00:00Z')).toMatch(/24.*ago.*2026/)
  })
})

describe('formatOrderTime', () => {
  it('renders hours and minutes in 24-hour format', () => {
    const time = formatOrderTime('2026-08-24T21:14:00-03:00')

    expect(time).toBe('21:14')
  })

  it('pads the hour to two digits', () => {
    expect(formatOrderTime('2026-08-24T09:05:00-03:00')).toBe('09:05')
  })
})

describe('formatOrderId', () => {
  it('prefers the external id, which is how the channel names the sale', () => {
    expect(formatOrderId('ML-1001', 42)).toBe('#ML-1001')
  })

  // Una venta cargada a mano no viene de ningún canal y no tiene id externo.
  // La columna no puede quedar vacía: es la que abre el detalle.
  it('falls back to the internal id when there is no external one', () => {
    expect(formatOrderId(null, 42)).toBe('#42')
  })
})
