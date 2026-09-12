import { formatDate } from 'shared/utils'
import { describe, expect, it } from 'vitest'

import { formatSpecTimestamp, formatUnits, formatWeight } from './format'

describe('formatUnits', () => {
  it('uses a thousands separator, as the design writes it', () => {
    expect(formatUnits(4280)).toBe('4.280')
  })

  it('has no separator below one thousand', () => {
    expect(formatUnits(280)).toBe('280')
  })
})

describe('formatWeight', () => {
  it('formats with a comma decimal separator', () => {
    expect(formatWeight(1.45)).toBe('1,45')
  })

  it('pads to two decimals', () => {
    expect(formatWeight(2)).toBe('2,00')
  })
})

describe('formatSpecTimestamp', () => {
  it('returns null for an invalid date', () => {
    expect(formatSpecTimestamp('not-a-date')).toBeNull()
  })

  // El valor exacto de hora depende del huso horario de quien corre el test;
  // lo que hay que fijar es la regla propia de esta función — unir fecha y
  // hora con un punto medio — y no lo que ya prueba `formatDate`.
  it('joins the date and the time with a mid dot', () => {
    const isoDate = '2026-08-24T09:14:00.000Z'

    const expectedDate = formatDate(isoDate, { day: 'numeric', month: 'short', year: 'numeric' })
    const expectedTime = formatDate(isoDate, { hour: '2-digit', minute: '2-digit' })

    expect(formatSpecTimestamp(isoDate)).toBe(`${expectedDate} · ${expectedTime}`)
  })
})
