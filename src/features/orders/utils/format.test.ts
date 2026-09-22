import { describe, expect, it } from 'vitest'

import {
  formatEventTimestamp,
  formatMoney,
  formatOrderDate,
  formatOrderId,
  formatOrderTime,
  formatShortDate,
  formatWeight,
} from './format'

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

// Los ejemplos afirman horas locales; la zona la fija `vite.config.ts` para
// que no dependan de la máquina que los corre.
describe('formatOrderTime', () => {
  it('renders hours and minutes in 24-hour format', () => {
    expect(formatOrderTime('2026-08-24T21:14:00-03:00')).toBe('21:14')
  })

  it('pads the hour to two digits', () => {
    expect(formatOrderTime('2026-08-24T09:05:00-03:00')).toBe('09:05')
  })

  // Con `hour12: false` en lugar del ciclo h23, es-AR rotula la medianoche
  // como «24:14»: una hora que no existe, en la columna que el operador usa
  // para ordenar el día.
  it('renders midnight as 00 and not as 24', () => {
    expect(formatOrderTime('2026-08-25T00:14:00-03:00')).toBe('00:14')
  })
})

describe('formatShortDate', () => {
  it('renders day and short month, without the year', () => {
    const formatted = formatShortDate('2026-08-26T12:00:00Z')

    expect(formatted).toMatch(/26.*ago/)
    expect(formatted).not.toContain('2026')
  })

  // La zona es la del operador: un evento de las 23:30 de Buenos Aires es del
  // mismo día aunque en UTC ya sea el siguiente.
  it('uses the local day of the event', () => {
    expect(formatShortDate('2026-08-27T02:30:00Z')).toMatch(/^26/)
  })
})

describe('formatEventTimestamp', () => {
  it('joins the short date and the time with a middle dot', () => {
    expect(formatEventTimestamp('2026-08-12T09:42:00-03:00')).toMatch(/^12 ago\.? · 09:42$/)
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

describe('formatWeight', () => {
  it('shows one decimal with the unit, as in the design', () => {
    expect(formatWeight(46.9)).toBe('46,9 kg')
  })

  it('keeps the decimal on a round weight, so the column lines up', () => {
    expect(formatWeight(12)).toBe('12,0 kg')
  })
})
