import { formatDate } from 'shared/utils'
import { describe, expect, it } from 'vitest'

import { formatSpecTimestamp } from './format'

// Los ejemplos de `formatUnits` y `formatWeight` viven en
// `shared/utils/number.test.ts` desde TESIS-166: eran el formateador
// compartido, no una regla de esta feature.

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
